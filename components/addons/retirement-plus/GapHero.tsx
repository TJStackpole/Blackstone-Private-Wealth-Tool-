import { GAP } from "@/lib/addons/retirement-plus/data";
import Cite from "./Cite";

/** The opening picture: pensions' share in private markets next to 401(k)s' near-zero share. */
export default function GapHero({ lede }: { lede: string }) {
  const { pensions, dc } = GAP.headline;
  const scale = 40; // the bar's full width stands for 40%
  const workers = GAP.facts.find((f) => f.id === "workers")!;
  return (
    <section aria-labelledby="rp-gap-h" className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
      <div className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">401(k) · Private markets</p>
        <h2 id="rp-gap-h" className="font-serif text-[40px] font-medium leading-[1.02] tracking-[-0.02em] text-ink sm:text-[52px]">
          The 0.1% problem
        </h2>
        <p className="max-w-md text-base leading-relaxed text-muted-strong">{lede}</p>
        <div className="border-l-2 border-line pl-3">
          <p className="text-sm text-muted-strong">
            <span className="tnum mr-1.5 font-serif text-2xl text-ink">{workers.value}</span>
            {workers.label}.
          </p>
          <Cite source={workers.source} />
        </div>
      </div>

      <figure className="rounded-card border border-line bg-bg-raised p-5 sm:p-7">
        <figcaption className="sr-only">
          Share of assets in private markets: {pensions.label} {pensions.value}%, {dc.label} {dc.value}%.
        </figcaption>
        {[pensions, dc].map((row, i) => (
          <div key={row.label} className={i === 0 ? "" : "mt-7"}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-ink">{row.label}</span>
              <span className="tnum font-serif text-[44px] leading-none text-ink sm:text-[56px]">{row.value}%</span>
            </div>
            <div className="relative mt-3 h-5 rounded-full bg-line" aria-hidden>
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.max((row.value / scale) * 100, i === 0 ? 0 : 0.6)}%` }}
              />
              {i === 1 && <span className="absolute inset-y-0 left-3 flex items-center whitespace-nowrap text-[11px] text-muted-strong">← barely there</span>}
            </div>
          </div>
        ))}
        <p className="mt-7 border-t border-line pt-4 font-serif text-lg leading-snug text-ink">
          The teacher&apos;s pension owns private markets. The teacher&apos;s own 401(k) almost never does.
        </p>
        <p className="mt-2 text-xs text-muted">
          Share of assets in private markets. <Cite source={pensions.source} />
        </p>
      </figure>
    </section>
  );
}
