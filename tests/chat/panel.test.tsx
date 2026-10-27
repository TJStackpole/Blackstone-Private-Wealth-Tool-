import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import ChatAssistant from "@/components/chat/ChatAssistant";
import InlineChat from "@/components/chat/InlineChat";
import Markdown from "@/components/chat/Markdown";
import { SIMPLER, historyFor, resetChat } from "@/components/chat/useChat";
import { MAX_QUESTION_CHARS } from "@/lib/chat/limits";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
beforeEach(() => {
  sessionStorage.clear();
  resetChat();
});

/** A streamed reply from /api/chat: one JSON event per line. */
function streamed(events: object[]): Response {
  const body = new ReadableStream({
    start(c) {
      for (const e of events) c.enqueue(new TextEncoder().encode(`${JSON.stringify(e)}\n`));
      c.close();
    },
  });
  return new Response(body, { status: 200, headers: { "content-type": "application/x-ndjson" } });
}

describe("answer formatting", () => {
  it("links only approved sites and never renders HTML", () => {
    const { container } = render(
      <Markdown text={"See [BREIT](https://www.breit.com) and [a video](https://youtube.com/x).\n\n- **One** <img src=x onerror=alert(1)>\n- Two"} />,
    );
    const links = [...container.querySelectorAll("a")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["https://www.breit.com"]);
    expect(links[0].getAttribute("rel")).toBe("noopener noreferrer");
    expect(container.textContent).toContain("a video");
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelectorAll("li").length).toBe(2);
    expect(container.querySelector("strong")?.textContent).toBe("One");
  });
});

describe("chat panel", () => {
  it("opens from the button, streams progress, then shows the cleaned answer with its sources", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      streamed([
        { t: "status", text: "Searching: BREIT repurchase plan" },
        { t: "delta", text: "BREIT buys back" },
        { t: "done", text: "BREIT buys back up to 2% of NAV a month ([BREIT 10-Q](https://www.breit.com/x)).\n\n_Educational information only, not investment advice._", sources: [{ url: "https://www.breit.com/x", title: "BREIT 10-Q" }] },
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<ChatAssistant />);
    fireEvent.click(screen.getByRole("button", { name: "Ask AI" }));
    const dialog = screen.getByRole("dialog", { name: "Ask about the funds" });
    fireEvent.change(screen.getByLabelText("Your question"), { target: { value: "How do BREIT buybacks work?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(dialog.querySelector("[data-chat-answer]")).toBeTruthy());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/chat");
    expect(JSON.parse(init.body)).toEqual({ messages: [{ role: "user", content: "How do BREIT buybacks work?" }] });
    const answer = dialog.querySelector("[data-chat-answer]")!;
    expect(answer.textContent).toContain("2% of NAV a month");
    expect(answer.textContent).toContain("not investment advice");
    expect(answer.querySelector('a[href="https://www.breit.com/x"]')).toBeTruthy();
    // The conversation is kept for the tab's session.
    expect(JSON.parse(sessionStorage.getItem("pma-chat-v1")!).length).toBe(2);
  });

  it("sends earlier questions and answers with a follow-up", async () => {
    sessionStorage.setItem("pma-chat-v1", JSON.stringify([{ id: "1", role: "user", content: "What is BCRED?" }, { id: "2", role: "assistant", content: "A BDC." }]));
    const fetchMock = vi.fn().mockResolvedValue(streamed([{ t: "done", text: "Yes.", sources: [] }]));
    vi.stubGlobal("fetch", fetchMock);
    render(<ChatAssistant />);
    fireEvent.click(screen.getByRole("button", { name: "Ask AI" }));
    expect(screen.getByText("What is BCRED?")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Your question"), { target: { value: "Does it pay monthly?" } });
    fireEvent.keyDown(screen.getByLabelText("Your question"), { key: "Enter" });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).messages).toEqual([
      { role: "user", content: "What is BCRED?" },
      { role: "assistant", content: "A BDC." },
      { role: "user", content: "Does it pay monthly?" },
    ]);
  });

  it(`stops a question over ${MAX_QUESTION_CHARS} characters before sending it`, () => {
    vi.stubGlobal("fetch", vi.fn());
    render(<ChatAssistant />);
    fireEvent.click(screen.getByRole("button", { name: "Ask AI" }));
    fireEvent.change(screen.getByLabelText("Your question"), { target: { value: "x".repeat(MAX_QUESTION_CHARS + 1) } });
    expect((screen.getByRole("button", { name: "Send" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(`${(MAX_QUESTION_CHARS + 1).toLocaleString("en-US")}/${MAX_QUESTION_CHARS.toLocaleString("en-US")}`)).toBeTruthy();
  });

  it("shows the server's message when the hourly limit is reached, and offers to try again", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "You've asked 20 questions in the last hour." }), { status: 429 })));
    render(<ChatAssistant />);
    fireEvent.click(screen.getByRole("button", { name: "Ask AI" }));
    fireEvent.click(screen.getByRole("button", { name: "What does BCRED invest in?" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("20 questions in the last hour"));
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
    // A failed question isn't sent back as history.
    expect(historyFor(JSON.parse(sessionStorage.getItem("pma-chat-v1")!))).toEqual([]);
  });

  it("closes with Escape and returns focus to the button", async () => {
    render(<ChatAssistant />);
    fireEvent.click(screen.getByRole("button", { name: "Ask AI" }));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(document.activeElement?.textContent).toContain("Ask AI"));
  });
});

describe("chat on the opening page", () => {
  it("answers a ready-made question in the page, and the corner panel shows the same conversation", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      streamed([{ t: "done", text: "BCRED buys back up to 5% a quarter ([BCRED](https://www.bcred.com/x)).", sources: [{ url: "https://www.bcred.com/x", title: "BCRED terms" }] }]),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(
      <>
        <InlineChat />
        <ChatAssistant />
      </>,
    );
    const inline = container.querySelector("[data-inline-chat]") as HTMLElement;
    fireEvent.click(screen.getByRole("button", { name: "Can my client get money out of BCRED?" }));
    await waitFor(() => expect(inline.querySelector("[data-chat-answer]")?.textContent).toContain("5% a quarter"));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).messages).toEqual([{ role: "user", content: "Can my client get money out of BCRED?" }]);
    fireEvent.click(screen.getByRole("button", { name: "Ask AI" }));
    const dialog = screen.getByRole("dialog", { name: "Ask about the funds" });
    expect(dialog.querySelector("[data-chat-answer]")?.textContent).toContain("5% a quarter");
    // New chat in the panel clears the page's copy too.
    fireEvent.click(within(dialog).getByRole("button", { name: "New chat" }));
    expect(inline.querySelector("[data-chat-answer]")).toBeNull();
  });

  it("moves the corner button aside while the page's chat is on screen", () => {
    let report: ((e: { isIntersecting: boolean }[]) => void) | undefined;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: (e: { isIntersecting: boolean }[]) => void) {
          report = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    render(
      <>
        <InlineChat />
        <ChatAssistant />
      </>,
    );
    expect(screen.getByRole("button", { name: "Ask AI" })).toBeTruthy();
    act(() => report!([{ isIntersecting: true }]));
    expect(screen.queryByRole("button", { name: "Ask AI" })).toBeNull();
    act(() => report!([{ isIntersecting: false }]));
    expect(screen.getByRole("button", { name: "Ask AI" })).toBeTruthy();
  });
});

describe("simpler explanations and saved answers", () => {
  it("offers to explain the newest answer more simply, sending it as a follow-up, and not again under the simpler one", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(streamed([{ t: "done", text: "BCRED's NAV is its value per share ([BCRED](https://www.bcred.com/x)).", sources: [{ url: "https://www.bcred.com/x", title: "BCRED" }] }]))
      .mockResolvedValueOnce(streamed([{ t: "done", text: "It's what one share is worth ([BCRED](https://www.bcred.com/x)).", sources: [{ url: "https://www.bcred.com/x", title: "BCRED" }] }]));
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<InlineChat />);
    fireEvent.click(screen.getByRole("button", { name: "Can my client get money out of BCRED?" }));
    await waitFor(() => expect(container.querySelectorAll("[data-chat-answer]").length).toBe(1));
    fireEvent.click(screen.getByRole("button", { name: "Explain it more simply" }));
    await waitFor(() => expect(container.querySelectorAll("[data-chat-answer]").length).toBe(2));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).messages).toEqual([
      { role: "user", content: "Can my client get money out of BCRED?" },
      { role: "assistant", content: "BCRED's NAV is its value per share ([BCRED](https://www.bcred.com/x))." },
      { role: "user", content: SIMPLER },
    ]);
    expect(screen.queryByRole("button", { name: "Explain it more simply" })).toBeNull();
  });

  it("says when an answer is a saved one", async () => {
    const savedAt = Date.now() - 2 * 3_600_000;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(streamed([{ t: "done", text: "BREIT pays monthly ([BREIT](https://www.breit.com/)).", sources: [{ url: "https://www.breit.com/", title: "BREIT" }], savedAt }])));
    const { container } = render(<InlineChat />);
    fireEvent.click(screen.getByRole("button", { name: "What does BREIT pay?" }));
    await waitFor(() => expect(container.querySelector("[data-chat-answer]")?.textContent).toContain("Saved answer from 2 hours ago"));
  });
});
