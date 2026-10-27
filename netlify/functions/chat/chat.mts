import Anthropic from "@anthropic-ai/sdk";
import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { QUESTIONS_PER_HOUR, type ChatEvent } from "../../../lib/chat/limits";
import { DEADLINE_MS, EFFORT, MAX_OUTPUT_TOKENS, MODEL, SYSTEM_PROMPT, TOOLS, dateLine } from "./policy";
import { MAX_BODY_BYTES, checkRequest } from "./validate";
import { cleanAnswer, cleanSources, linksIn, type Source } from "./sanitize";
import { checkAndRecord, visitorKey } from "./rateLimit";

/**
 * The chat assistant's server side: POST /api/chat with `{ messages }`. Checks the question, counts it against the
 * visitor's hourly limit, asks Claude with web search and web fetch locked to Blackstone's sites and the funds' SEC
 * filings, and streams back newline-delimited JSON events (progress, answer text, the cleaned final answer).
 * The Anthropic key is read here, from the ANTHROPIC_API_KEY environment variable, and never leaves the server.
 */
async function handler(req: Request, context: Context): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Use POST." }, 405, { allow: "POST" });
  if (Netlify.env.get("CHAT_ENABLED") === "false") return json({ error: "The assistant is switched off for now." }, 503);

  const raw = await req.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json({ error: "That request is too large. Start a new chat." }, 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Send your question as JSON." }, 400);
  }
  const checked = checkRequest(body);
  if (!checked.ok) return json({ error: checked.message }, checked.status);

  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    console.error("chat: ANTHROPIC_API_KEY is not set for this site's functions");
    return json({ error: "The assistant isn't set up yet." }, 500);
  }

  // Hourly limit by IP address (hashed). If the store can't be reached, the question is refused, not let through.
  const store = getStore({ name: "chat-rate-limit", consistency: "strong" });
  const visitor = await visitorKey(context.ip || "unknown", Netlify.env.get("CHAT_IP_SALT") || context.site?.id || "pma");
  const limit = Number(Netlify.env.get("CHAT_QUESTIONS_PER_HOUR")) || QUESTIONS_PER_HOUR;
  let verdict;
  try {
    verdict = await checkAndRecord(store, visitor, Date.now(), limit);
  } catch (e) {
    console.error("chat: rate-limit store unavailable", e);
    return json({ error: "The assistant is busy. Try again in a minute." }, 503);
  }
  context.waitUntil(Promise.all(verdict.stale.map((k) => store.delete(k))).catch(() => {}));
  if (!verdict.allowed) {
    const minutes = Math.ceil(verdict.retryAfterSeconds / 60);
    return json(
      { error: `You've asked ${limit} questions in the last hour. You can ask again in about ${minutes} minute${minutes === 1 ? "" : "s"}.` },
      429,
      { "retry-after": String(verdict.retryAfterSeconds) },
    );
  }

  const client = new Anthropic({ apiKey, maxRetries: 1, timeout: DEADLINE_MS });
  const started = Date.now();
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), DEADLINE_MS);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: ChatEvent) => controller.enqueue(new TextEncoder().encode(`${JSON.stringify(e)}\n`));
      try {
        send({ t: "status", text: "Searching Blackstone's sites and the funds' filings…" });
        const result = await answer(client, checked.turns, abort.signal, started, send);
        send({ t: "done", text: result.text, sources: result.sources });
      } catch (e) {
        send({ t: "error", message: friendlyError(e, abort.signal.aborted) });
      } finally {
        clearTimeout(timer);
        controller.close();
      }
    },
    cancel() {
      abort.abort();
    },
  });
  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });
}

export default handler;

/** Runs the question, continuing a paused search turn while time allows, and returns the cleaned answer. */
async function answer(
  client: Anthropic,
  turns: { role: "user" | "assistant"; content: string }[],
  signal: AbortSignal,
  started: number,
  send: (e: ChatEvent) => void,
): Promise<{ text: string; sources: Source[] }> {
  const messages: Anthropic.Beta.BetaMessageParam[] = turns.map((t) => ({ role: t.role, content: t.content }));
  const sources: Source[] = [];
  let text = "";
  let cut = false;

  for (let round = 0; round < 3; round++) {
    const stream = client.beta.messages.stream(
      {
        model: MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        // A declined answer is retried on another model where the API's fallback covers the category.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: EFFORT },
        system: [
          { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
          { type: "text", text: dateLine() },
        ],
        tools: TOOLS,
        messages,
      },
      { signal },
    );

    const inputs = new Map<number, string>();
    for await (const event of stream) {
      if (event.type === "content_block_start") {
        const b = event.content_block;
        if (b.type === "server_tool_use") inputs.set(event.index, "");
        if (b.type === "server_tool_use" && b.name === "code_execution") send({ t: "status", text: "Sorting through what it found…" });
        // Text before a tool call is a lead-in, not the answer: the answer is the text after the last tool call.
        if ((b.type === "server_tool_use" || b.type.endsWith("_tool_result")) && text) {
          text = "";
          sources.length = 0;
          send({ t: "reset" });
        }
      } else if (event.type === "content_block_delta") {
        if (event.delta.type === "text_delta") {
          text += event.delta.text;
          send({ t: "delta", text: event.delta.text });
        } else if (event.delta.type === "citations_delta") {
          const c = event.delta.citation;
          if (c.type === "web_search_result_location") sources.push({ url: c.url, title: c.title ?? "" });
        } else if (event.delta.type === "input_json_delta" && inputs.has(event.index)) {
          inputs.set(event.index, inputs.get(event.index) + event.delta.partial_json);
        }
      } else if (event.type === "content_block_stop" && inputs.has(event.index)) {
        const status = toolStatus(inputs.get(event.index)!);
        if (status) send({ t: "status", text: status });
        inputs.delete(event.index);
      }
    }
    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      return { text: cleanAnswer("I can't help with that one. I can answer questions about BREIT, BCRED, BXPE and BXINFRA from Blackstone's official sites and the funds' SEC filings."), sources: [] };
    }
    if (message.stop_reason === "max_tokens") cut = true;
    // A long search turn can pause; send it back unchanged to continue, if there's time left.
    if (message.stop_reason === "pause_turn" && Date.now() - started < DEADLINE_MS - 20_000) {
      messages.push({ role: "assistant", content: message.content });
      send({ t: "status", text: "Still looking…" });
      continue;
    }
    if (message.stop_reason === "pause_turn") cut = true;
    break;
  }

  if (!text.trim()) {
    text = "I couldn't find that in Blackstone's official sites or the funds' SEC filings in the time available. Try asking it a narrower way, or see the fund's own site: [BREIT](https://www.breit.com), [BCRED](https://www.bcred.com), [BXPE](https://www.bxpe.com), [BX Infra](https://www.bxinfra.com).";
  } else if (cut) {
    text += "\n\n(This answer was cut short. Ask a narrower question for the rest.)";
  }
  const cleaned = cleanAnswer(text);
  // Search citations first, then the pages the answer links to (searches run inside the model's filtering step often
  // come back without formal citations).
  return { text: cleaned, sources: cleanSources([...sources, ...linksIn(cleaned)]) };
}

/** A progress line for a search or page read, from the tool call's input. */
function toolStatus(input: string): string | null {
  try {
    const v = JSON.parse(input) as { query?: unknown; url?: unknown };
    if (typeof v.query === "string") return `Searching: ${v.query.slice(0, 80)}`;
    if (typeof v.url === "string") return `Reading ${new URL(v.url).hostname.replace(/^www\./, "")}…`;
  } catch {
    // Code for filtering results, or a partial input: no status line.
  }
  return null;
}

/** What the visitor sees when something goes wrong; the details go to the function log. */
function friendlyError(e: unknown, timedOut: boolean): string {
  console.error("chat: request failed", e);
  if (timedOut) return "That took too long to look up. Try a narrower question.";
  if (e instanceof Anthropic.RateLimitError) return "The assistant is busy right now. Try again in a minute.";
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return "The assistant isn't set up correctly. The site owner has been notified in the logs.";
  if (e instanceof Anthropic.BadRequestError) return "The assistant couldn't handle that request. Try rephrasing it.";
  if (e instanceof Anthropic.APIError) return "The assistant had a problem answering. Try again in a moment.";
  return "Something went wrong. Try again in a moment.";
}

function json(data: unknown, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
}

export const config: Config = {
  path: "/api/chat",
  method: ["POST"],
  // A first, edge-level guard against bursts (the hourly limit above is the main one): 6 questions a minute per IP.
  rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 6 },
};
