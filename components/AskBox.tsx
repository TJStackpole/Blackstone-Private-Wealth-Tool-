"use client";

import { useId, useState } from "react";
import { ask, EXAMPLES, type AskResult } from "@/lib/questions";
import { FUNDS } from "@/lib/addons/shared/funds";
import { formatDate } from "@/lib/dates";
import { SourceLinks } from "./QuarterBox";
import Sources from "./Sources";
import { GlossedLines } from "./Glossed";
import ViewLink from "./ViewLink";

const chip =
  "tap inline-flex min-h-8 items-center rounded-full border border-line bg-bg-raised px-3 py-1 text-left text-xs font-medium text-muted-strong hover:border-muted hover:text-ink";

/**
 * "Ask a question": a typed question answered from the site's own data, by matching words (see lib/questions.ts).
 * Each answer is a figure or sentence the site already shows, dated and sourced, with a link to read more.
 */
export default function AskBox() {
  const id = useId();
  const [q, setQ] = useState("");
  const [result, setResult] = useState<(AskResult & { q: string }) | null>(null);

  function run(text: string) {
    const t = text.trim();
    if (!t) return;
    setQ(t);
    setResult({ ...ask(t), q: t });
  }

  return (
    <section aria-labelledby={`${id}-h`} className="rounded-card border border-line bg-bg-raised p-4 sm:p-6" data-ask>
      <h3 id={`${id}-h`} className="font-serif text-[22px] font-medium leading-tight text-ink">
        Ask a question
      </h3>
      <p className="mt-1 text-sm text-muted-strong">Answers come only from the funds&rsquo; filings already on this site, each with its date and sources.</p>
      <form
        role="search"
        className="mt-3 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          run(q);
        }}
      >
        <label htmlFor={`${id}-q`} className="sr-only">
          Your question
        </label>
        <input
          id={`${id}-q`}
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. Can my client get money out of BCRED?"
          autoComplete="off"
          className="tap h-11 w-full min-w-0 rounded-full sm:flex-1 border border-line bg-bg px-4 text-[15px] text-ink placeholder:text-muted focus-visible:border-accent"
        />
        <button type="submit" className="tap h-11 shrink-0 rounded-full bg-accent px-5 text-sm font-medium text-accent-contrast hover:opacity-90">
          Ask
        </button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Example questions" role="group">
        <span className="text-xs text-muted">Try:</span>
        {EXAMPLES.map((e) => (
          <button key={e} type="button" className={chip} onClick={() => run(e)}>
            {e}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-4 empty:hidden">
        {result && <Answer result={result} />}
      </div>
    </section>
  );
}

function Answer({ result }: { result: AskResult & { q: string } }) {
  if (!result.topic) {
    return (
      <div className="rounded-card border border-dashed border-line p-4" data-ask-result="none">
        <p className="text-sm font-medium text-ink">{result.title}.</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-strong">
          It matches questions about getting money out, payouts, fees, taxes, risk, what changed, value per share, size or the minimum
          investment, and the terms on this site. Name a fund (BREIT, BX Infra, BXPE, BCRED) or leave it out for all four. Try one of the
          examples above.
        </p>
      </div>
    );
  }
  if (result.term) {
    const t = result.term;
    return (
      <article className="rounded-card border border-line p-4" data-ask-result="define">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-strong">{t.term}</h4>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{t.plain}</p>
        <blockquote className="mt-2 border-l-2 border-line pl-3 text-xs leading-relaxed text-muted-strong">&ldquo;{t.quote}&rdquo;</blockquote>
        <p className="tnum mt-2 text-[11px] text-muted">
          {t.fund && `As ${FUNDS[t.fund].label}'s filing puts it · `}
          <a href={t.source.url} target="_blank" rel="noreferrer noopener" title={t.source.page} className="underline decoration-line underline-offset-2 hover:text-ink">
            {t.source.name}
          </a>{" "}
          · as of {formatDate(t.asOf)}
        </p>
      </article>
    );
  }
  return (
    <div data-ask-result={result.topic}>
      <h4 className="text-sm font-medium text-ink">{result.title}</h4>
      <ul className={["mt-2 grid gap-3", result.answers.length > 1 ? "md:grid-cols-2" : ""].join(" ")}>
        {result.answers.map((a, i) => (
          <li key={a.fund ?? i} className="flex flex-col rounded-card border border-line p-4">
            {a.fund && <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-strong">{FUNDS[a.fund].label}</p>}
            <GlossedLines lines={a.lines} fund={a.fund} className="mt-1 space-y-1 text-sm leading-relaxed text-ink" />
            <p className="tnum mt-auto flex flex-wrap items-baseline gap-x-2 pt-3 text-[11px] text-muted">
              {a.asOf && (
                <span>
                  As of {formatDate(a.asOf)}
                  {a.sources.length > 0 && (
                    <>
                      {" · "}
                      <Sources>
                        <SourceLinks sources={a.sources} />
                      </Sources>
                    </>
                  )}
                </span>
              )}
              <ViewLink href={a.href} className="font-medium text-muted-strong underline decoration-line underline-offset-2 hover:text-ink">
                {a.hrefLabel} →
              </ViewLink>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
