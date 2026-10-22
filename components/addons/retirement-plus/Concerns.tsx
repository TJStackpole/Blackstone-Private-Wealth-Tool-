import Link from "next/link";
import { findAddon } from "@/config/addons";
import { ROOM, type AudienceId, type Objection } from "@/lib/addons/retirement-plus/data";
import Sources from "./Sources";

/** Card order per audience; the cards themselves are the same. */
export const CONCERN_ORDER: Record<AudienceId, string[]> = {
  worker: ["fees", "liquidity", "valuation", "complexity", "lawsuits"],
  employer: ["lawsuits", "fees", "liquidity", "valuation", "complexity"],
};

export function orderedConcerns(audience: AudienceId): Objection[] {
  return CONCERN_ORDER[audience].map((id) => ROOM.objections.find((o) => o.id === id)).filter((o): o is Objection => !!o);
}

/** Two-sided objection cards: the concern and the response get the same space, each with its sources. */
export default function Concerns({ audience }: { audience: AudienceId }) {
  const a = ROOM.audiences[audience];
  return (
    <section aria-labelledby="rp-concerns-h" className="space-y-4">
      <div>
        <h2 id="rp-concerns-h" className="font-serif text-[24px] font-medium leading-tight text-ink">
          {a.concernsTitle}
        </h2>
        <p className="mt-1 text-sm text-muted-strong">{a.concernsLede}</p>
      </div>
      <ul className="space-y-3">
        {orderedConcerns(audience).map((o) => {
          const link = o.link && findAddon(o.link.addon) ? o.link : null;
          return (
            <li key={o.id} data-concern={o.id} className="rounded-card border border-line bg-bg-raised">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line px-4 py-3 sm:px-5">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{o.title}</h3>
                <p className="font-serif text-lg leading-snug text-ink">{o.question}</p>
              </div>
              <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                {(
                  [
                    ["The concern", o.concern],
                    ["The response", o.response],
                  ] as const
                ).map(([label, side]) => (
                  <div key={label} className="flex flex-col gap-2 px-4 py-3 sm:px-5 sm:py-4">
                    <p className="text-xs font-medium text-muted-strong">{label}</p>
                    <p className="text-sm leading-relaxed text-ink">{side.text}</p>
                    <Sources sources={side.sources} className="mt-auto" />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5 sm:px-5">
                <p className="text-xs text-muted-strong">
                  <span className="font-medium text-ink">What to watch:</span> {o.watch}
                </p>
                {link && (
                  <Link href={link.href} className="text-xs font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-accent">
                    {link.label} →
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
