import { CONTENT } from "@/lib/addons/smoothing/data";

const ICONS: Record<string, React.ReactNode> = {
  // A house with a price tag: an estimate, not a trade.
  appraised: (
    <>
      <path d="M3 11 12 4l9 7v9H3z" />
      <path d="M9.5 20v-5h5v5" />
    </>
  ),
  // A jagged line beside a smooth one.
  meaning: (
    <>
      <path d="M2 14l3-6 3 9 3-11 3 9 3-5 4 4" strokeOpacity={0.45} />
      <path d="M2 13c4-2.5 7-2.5 10 0s6 2.5 10 0" strokeWidth={2} />
    </>
  ),
  // A balance: both sides.
  honest: <path d="M12 4v16M5 20h14M4 9h16M7 9l-3 6h6zM17 9l-3 6h6z" />,
};

/** The three ideas as picture cards: a one-line summary up front, the sourced detail behind "More". */
export default function Explainer() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {CONTENT.sections.map((s) => (
        <section key={s.id} aria-labelledby={`sm-${s.id}-h`} className="flex flex-col gap-3 rounded-card border border-line bg-bg-raised p-4 sm:p-5">
          <span aria-hidden className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-bg text-accent">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              {ICONS[s.id]}
            </svg>
          </span>
          <h2 id={`sm-${s.id}-h`} className="font-serif text-xl font-medium leading-tight text-ink">
            {s.title}
          </h2>
          <p className="leading-relaxed text-muted-strong">{s.summary}</p>
          <details className="group mt-auto">
            <summary className="tap inline-flex cursor-pointer list-none items-center text-xs font-medium text-muted-strong hover:text-ink [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">More, with sources</span>
              <span className="hidden group-open:inline">Less</span>
            </summary>
            <div className="mt-2 space-y-2">
              {s.paragraphs.map((p) => (
                <p key={p.text.slice(0, 40)} className="text-sm leading-relaxed text-muted-strong">
                  {p.text}
                  {p.source && (
                    <>
                      {" "}
                      <a
                        href={p.source.url}
                        {...(p.source.url.startsWith("http") ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                        className="text-xs text-muted underline decoration-line underline-offset-2 hover:text-ink"
                      >
                        Source: {p.source.name}
                      </a>
                      {p.also && (
                        <>
                          {" · "}
                          <a
                            href={p.also.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-xs text-muted underline decoration-line underline-offset-2 hover:text-ink"
                          >
                            {p.also.name}
                          </a>
                        </>
                      )}
                    </>
                  )}
                </p>
              ))}
            </div>
          </details>
        </section>
      ))}
    </div>
  );
}
