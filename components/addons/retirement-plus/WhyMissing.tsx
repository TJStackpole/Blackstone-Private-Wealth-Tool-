import { GAP } from "@/lib/addons/retirement-plus/data";
import Cite from "./Cite";

const ICONS: Record<string, React.ReactNode> = {
  // Fewer listed companies: a shrinking stack.
  public: <path d="M4 20h16M6 16h12M8 12h8M10 8h4" />,
  // Most big companies are private: a building with a lock.
  private: (
    <>
      <path d="M4 20V7l6-3v16M10 9h6v11M4 20h16" />
      <rect x="15" y="13" width="6" height="5" rx="1" />
      <path d="M16.5 13v-1.5a1.5 1.5 0 0 1 3 0V13" />
    </>
  ),
  // Stocks and bonds moving together: two parallel lines.
  correlation: <path d="M3 17l5-5 4 3 9-8M3 20l5-5 4 3 9-8" />,
};

/** Three reasons private markets are missing from most 401(k)s, as picture cards. */
export default function WhyMissing() {
  const cards = GAP.facts.filter((f) => f.id !== "workers");
  return (
    <section aria-labelledby="rp-why-h" className="space-y-4">
      <h2 id="rp-why-h" className="font-serif text-[24px] font-medium leading-tight text-ink">
        Why it matters
      </h2>
      <ul className="grid gap-3 md:grid-cols-3">
        {cards.map((f) => (
          <li key={f.id} className="flex flex-col gap-3 rounded-card border border-line bg-bg-raised p-4 sm:p-5">
            <span aria-hidden className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-bg text-accent">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                {ICONS[f.id]}
              </svg>
            </span>
            <p className="tnum font-serif text-[34px] leading-none text-ink">{f.value}</p>
            <p className="text-sm leading-relaxed text-muted-strong">{f.label}</p>
            <div className="mt-auto">
              <Cite source={f.source} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
