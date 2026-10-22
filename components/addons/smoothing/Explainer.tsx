import { CONTENT } from "@/lib/addons/smoothing/data";

/** The three explainer sections, each paragraph with its source where it states a fact. */
export default function Explainer() {
  return (
    <div className="space-y-10">
      {CONTENT.sections.map((s, i) => (
        <section key={s.id} aria-labelledby={`sm-${s.id}-h`} className="space-y-3">
          <h2 id={`sm-${s.id}-h`} className="font-serif text-[22px] font-medium leading-tight text-ink">
            <span className="tnum mr-2 text-muted">{i + 1}</span>
            {s.title}
          </h2>
          <div className="max-w-3xl space-y-3">
            {s.paragraphs.map((p) => (
              <p key={p.text.slice(0, 40)} className="text-sm leading-relaxed text-muted-strong">
                {p.text}
                {p.source && (
                  <>
                    {" "}
                    <a
                      href={p.source.url}
                      {...(p.source.url.startsWith("http") ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                      className="whitespace-nowrap text-[11px] text-muted underline decoration-line underline-offset-2 hover:text-ink"
                    >
                      Source: {p.source.name.length > 48 ? `${p.source.name.slice(0, 46)}…` : p.source.name}
                    </a>
                  </>
                )}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
