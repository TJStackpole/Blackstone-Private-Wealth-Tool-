import { CONTENT } from "@/lib/addons/smoothing/data";

/** "If the client says…": common pushbacks with plain answers. Native details/summary on screen; printed fully open. */
export default function Objections() {
  return (
    <>
      <div className="divide-y divide-line rounded-card border border-line bg-bg-raised print:hidden">
        {CONTENT.objections.map((o) => (
          <details key={o.q} className="group px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
              {o.q}
              <span aria-hidden className="text-muted transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted-strong">{o.a}</p>
          </details>
        ))}
      </div>
      <dl className="hidden space-y-1.5 text-xs print:block">
        {CONTENT.objections.map((o) => (
          <div key={o.q}>
            <dt className="font-medium">{o.q}</dt>
            <dd>{o.a}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
