"use client";

import { useId, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { LayerDef, LayerId, Mix, RetirementData } from "@/lib/types";
import { glideSeries, mixForYears } from "@/lib/glide";
import { formatDate } from "@/lib/aggregate";

interface Props {
  data: RetirementData;
  layers: LayerDef[];
  onOpenLayer: (id: LayerId) => void;
}

/** Series order is fixed (bottom to top) so colors never move between renders. */
const SERIES: { key: keyof Mix; label: string }[] = [
  { key: "stocks", label: "Stocks" },
  { key: "bonds", label: "Bonds" },
  { key: "cash", label: "Cash" },
  { key: "private", label: "Private markets sleeve" },
];

function IllustrativeBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-strong">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
      Illustrative
    </span>
  );
}

/** The 401(k) lens: a slider, an example mix, what the sleeve draws from, and the public timeline. */
export default function RetirementView({ data, layers, onOpenLayer }: Props) {
  const [years, setYears] = useState(25);
  const sliderId = useId();
  const mix = useMemo(() => mixForYears(data.glidePath, years), [data.glidePath, years]);
  const series = useMemo(() => glideSeries(data.glidePath), [data.glidePath]);

  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">Retirement lens · 401(k)</p>
          <IllustrativeBadge />
        </div>
        <h2 className="mt-2 font-serif text-[28px] font-medium leading-tight tracking-[-0.01em] sm:text-[32px]">
          A small slice of private markets inside an ordinary 401(k)
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-strong">{data.framing}</p>
      </header>

      {/* Slider + chart */}
      <section aria-labelledby={`${sliderId}-title`} className="rounded-card border border-line bg-bg-raised p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 id={`${sliderId}-title`} className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-strong">
                Example mix by time horizon
              </h3>
              <IllustrativeBadge />
            </div>
            <label htmlFor={sliderId} className="mt-4 block">
              <span className="tnum font-serif text-[44px] font-medium leading-none text-ink">{years}</span>
              <span className="ml-2 text-sm text-muted-strong">{years === 1 ? "year" : "years"} until retirement</span>
            </label>
            <input
              id={sliderId}
              type="range"
              min={0}
              max={data.glidePath.farYears}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              aria-valuetext={`${years} years until retirement`}
              className="glide-slider mt-4 w-full"
              style={{ ["--pct" as string]: `${(years / data.glidePath.farYears) * 100}%` }}
            />
            <div className="tnum mt-1 flex justify-between text-[11px] text-muted">
              <span>Retiring now</span>
              <span>{data.glidePath.farYears} years away</span>
            </div>

            <table className="tnum mt-5 w-full text-sm">
              <caption className="sr-only">Example mix at {years} years until retirement</caption>
              <tbody>
                {[...SERIES].reverse().map((s) => (
                  <tr key={s.key} className="border-t border-line">
                    <th scope="row" className="flex items-center gap-2 py-2 text-left font-normal text-ink">
                      <span aria-hidden className={`swatch swatch-${s.key} inline-block h-2.5 w-2.5 rounded-sm`} />
                      {s.label}
                    </th>
                    <td className="py-2 text-right text-muted-strong">{mix[s.key].toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Sleeve shown between {data.sleeve.minPct}% and {data.sleeve.maxPct}%. {data.sleeve.note}
            </p>
          </div>

          <figure className="min-w-0">
            <div className="h-[280px] w-full" role="img" aria-label={`Stacked area chart of an example mix from ${data.glidePath.farYears} years before retirement to retirement. At ${years} years: stocks ${mix.stocks}%, bonds ${mix.bonds}%, cash ${mix.cash}%, private markets ${mix.private}%.`}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -18 }} stackOffset="none">
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="years"
                    reversed
                    type="number"
                    domain={[data.glidePath.farYears, 0]}
                    ticks={[40, 30, 20, 10, 0]}
                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border)" }}
                    tickFormatter={(v: number) => (v === 0 ? "Retire" : `${v} yrs`)}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--muted)", strokeDasharray: "3 3" }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0].payload as Mix & { years: number };
                      return (
                        <div className="rounded-card border border-line bg-bg-raised px-3 py-2 text-xs shadow-sm">
                          <div className="mb-1 font-medium text-ink">{label === 0 ? "At retirement" : `${label} years out`}</div>
                          {[...SERIES].reverse().map((s) => (
                            <div key={s.key} className="tnum flex items-center justify-between gap-4 text-muted-strong">
                              <span className="flex items-center gap-1.5">
                                <span aria-hidden className={`swatch swatch-${s.key} inline-block h-2 w-2 rounded-sm`} />
                                {s.label}
                              </span>
                              <span>{row[s.key].toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  {SERIES.map((s) => (
                    <Area
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stackId="mix"
                      stroke="var(--bg-raised)"
                      strokeWidth={2}
                      fill={`var(--series-${s.key})`}
                      fillOpacity={1}
                      isAnimationActive={false}
                    />
                  ))}
                  <ReferenceLine x={years} stroke="var(--text)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
              <span className="flex flex-wrap gap-x-4 gap-y-1">
                {[...SERIES].reverse().map((s) => (
                  <span key={s.key} className="flex items-center gap-1.5">
                    <span aria-hidden className={`swatch swatch-${s.key} inline-block h-2 w-2 rounded-sm`} />
                    {s.label}
                  </span>
                ))}
              </span>
              <span>Illustrative, not a real plan allocation.</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Explainers */}
        <section aria-label="How it works, in plain English" className="grid content-start gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {data.explainers.map((e) => (
            <article key={e.title} className="rounded-card border border-line bg-bg-raised p-5">
              <h3 className="font-serif text-lg font-medium leading-snug text-ink">{e.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-strong">{e.body}</p>
            </article>
          ))}
        </section>

        {/* What's in the sleeve */}
        <section aria-label="What's in the sleeve" className="rounded-card border border-line bg-bg-raised p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-strong">What&apos;s in the sleeve</h3>
            <IllustrativeBadge />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            The private markets sleeve could draw from the four fund types mapped on this site. Open any one to see where it invests.
          </p>
          <ul className="mt-3 divide-y divide-line">
            {data.sleeveSources.map((s) => {
              const layer = layers.find((l) => l.id === s.layerId);
              return (
                <li key={s.layerId} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm text-ink">
                      <span
                        aria-hidden
                        className="tab-dot inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ ["--tab-light" as string]: layer?.color, ["--tab-dark" as string]: layer?.colorDark }}
                      />
                      {s.label}
                      <span className="text-[11px] uppercase tracking-[0.08em] text-muted">{s.fund}</span>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-strong">{s.why}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenLayer(s.layerId)}
                    className="shrink-0 rounded-full border border-line bg-bg px-3 py-1 text-xs font-medium text-muted-strong hover:border-muted hover:text-ink"
                  >
                    View on map
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Timeline */}
      <section aria-label="Public milestones" className="rounded-card border border-line bg-bg-raised p-5 sm:p-6">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-strong">Public milestones</h3>
        <ol className="mt-4 space-y-5 border-l border-line pl-5">
          {data.milestones.map((m) => (
            <li key={m.date} className="relative">
              <span aria-hidden className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-accent ring-4 ring-bg-raised" />
              <time dateTime={m.date} className="tnum text-[11px] uppercase tracking-[0.08em] text-muted">
                {formatDate(m.date)}
              </time>
              <h4 className="mt-0.5 text-sm font-medium text-ink">{m.title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-muted-strong">{m.summary}</p>
              <a href={m.source.url} target="_blank" rel="noreferrer noopener" className="mt-1 inline-block text-[11px] text-muted underline decoration-line underline-offset-2 hover:text-ink">
                Source: {m.source.name}
              </a>
            </li>
          ))}
        </ol>
      </section>

      <p className="text-[11px] leading-relaxed text-muted">
        Lens last reviewed {formatDate(data.asOf)}. Nothing on this page describes a real product&apos;s actual allocation.
      </p>
    </div>
  );
}
