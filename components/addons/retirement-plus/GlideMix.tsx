"use client";

import { useId, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { LayerId } from "@/lib/types";
import { GLIDE } from "@/lib/addons/retirement-plus/data";
import { mixAt } from "@/lib/addons/retirement-plus/model";
import { IllustrativeBadge } from "@/components/addons/shared/Badges";
import Cite from "./Cite";

const SLEEVES = [
  { key: "privateEquity", label: "Private equity", color: "var(--pe)", plain: "growth", layers: [{ id: "bxpe", fund: "BXPE" }] },
  { key: "privateRealAssets", label: "Real assets", color: "var(--ra)", plain: "property and infrastructure", layers: [{ id: "breit", fund: "BREIT" }, { id: "bxinfra", fund: "BX Infra" }] },
  { key: "privateCredit", label: "Private credit", color: "var(--pc)", plain: "income from loans", layers: [{ id: "bcred", fund: "BCRED" }] },
] as const;

const MIN = GLIDE.rows.reduce((m, r) => Math.min(m, r.age), Infinity);
const MAX = GLIDE.rows.reduce((m, r) => Math.max(m, r.age), -Infinity);

/** Rounds parts to one decimal so they still add up exactly to the whole. */
function roundParts(parts: number[], total: number): number[] {
  const r = parts.map((p) => Math.round(p * 10) / 10);
  const diff = Math.round((total - r.reduce((a, b) => a + b, 0)) * 10) / 10;
  r[r.length - 1] = Math.round((r[r.length - 1] + diff) * 10) / 10;
  return r;
}

/** Age slider: the published mix of the 20% private slice, as a bar, a table and a line across ages, with links to each fund type's map. */
export default function GlideMix({ onOpenLayer }: { onOpenLayer: (id: LayerId) => void }) {
  const [age, setAge] = useState(MIN);
  const id = useId();
  const m = mixAt(age, GLIDE.rows);
  const pub = 100 - m.total;
  const [pe, ra, pc] = roundParts([m.privateEquity, m.privateRealAssets, m.privateCredit], Math.round(m.total * 10) / 10);
  const vals: Record<string, number> = { privateEquity: pe, privateRealAssets: ra, privateCredit: pc };
  const published = GLIDE.rows.find((r) => r.age === age);
  const series = useMemo(() => {
    const out = [];
    for (let a = MIN; a <= MAX; a++) {
      const x = mixAt(a, GLIDE.rows);
      out.push({ age: a, privateEquity: +x.privateEquity.toFixed(2), privateRealAssets: +x.privateRealAssets.toFixed(2), privateCredit: +x.privateCredit.toFixed(2) });
    }
    return out;
  }, []);

  return (
    <section aria-labelledby="rp-mix-h" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="rp-mix-h" className="font-serif text-[24px] font-medium leading-tight text-ink">
            The private slice changes with age
          </h2>
          <p className="mt-1 text-sm text-muted-strong">Young savers lean toward growth; near retirement, toward income and steadiness.</p>
        </div>
      </div>

      <div className="grid gap-6 rounded-card border border-line bg-bg-raised p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
        <div className="space-y-5">
          <label htmlFor={id} className="block">
            <span className="tnum font-serif text-[48px] leading-none text-ink">{age}</span>
            <span className="ml-2 text-sm text-muted-strong">years old</span>
          </label>
          <input
            id={id}
            type="range"
            min={MIN}
            max={MAX}
            step={1}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            aria-valuetext={`Age ${age}`}
            className="glide-slider w-full"
            style={{ ["--pct" as string]: `${((age - MIN) / (MAX - MIN)) * 100}%` }}
          />

          {/* The whole portfolio as one bar: public part, then the three private sleeves. */}
          <div aria-hidden className="flex h-10 w-full overflow-hidden rounded-lg border border-line">
            <div className="flex items-center bg-bg px-3 text-xs text-muted-strong" style={{ width: `${pub}%` }}>
              Public stocks and bonds {pub.toFixed(0)}%
            </div>
            {SLEEVES.map((s) => (
              <div key={s.key} style={{ width: `${vals[s.key]}%`, background: s.color }} />
            ))}
          </div>

          <table className="tnum w-full text-sm">
            <caption className="sr-only">Portfolio mix at age {age}</caption>
            <tbody>
              <tr className="border-t border-line">
                <th scope="row" className="flex items-center gap-2 py-2 text-left font-normal text-ink">
                  <span aria-hidden className="h-2.5 w-2.5 rounded-sm border border-line bg-bg" />
                  Public stocks and bonds
                </th>
                <td className="py-2 text-right text-muted-strong">{pub.toFixed(1)}%</td>
              </tr>
              {SLEEVES.map((s) => (
                <tr key={s.key} className="border-t border-line">
                  <th scope="row" className="flex items-center gap-2 py-2 text-left font-normal text-ink">
                    <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                    {s.label} <span className="text-xs text-muted">({s.plain})</span>
                  </th>
                  <td className="py-2 text-right text-ink">{vals[s.key].toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs leading-relaxed text-muted">
            {published ? (
              <>
                Published mix at age {age}. <Cite source={published.source} />
              </>
            ) : (
              <>Between the published ages ({GLIDE.rows.map((r) => r.age).join(" and ")}), this tool draws a straight line; the paper&apos;s full table may differ.</>
            )}
          </p>
        </div>

        <figure className="min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-strong">Each sleeve, % of the whole portfolio</p>
            <IllustrativeBadge />
          </div>
          <div className="h-56" role="img" aria-label={`Private equity falls from ${GLIDE.rows[0].privateEquity}% to ${GLIDE.rows.at(-1)!.privateEquity}%; real assets and credit rise.`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart accessibilityLayer={false} data={series} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="age" type="number" domain={[MIN, MAX]} ticks={[25, 35, 45, 55, 65].filter((t) => t >= MIN && t <= MAX)} tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
                <YAxis domain={[0, 16]} ticks={[0, 5, 10, 15]} unit="%" tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
                <ReferenceLine x={age} stroke="var(--text)" strokeWidth={1.25} />
                {SLEEVES.map((s) => (
                  <Line
                    key={s.key}
                    dataKey={s.key}
                    stroke={s.color}
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    isAnimationActive={false}
                    dot={(p: { cx?: number; cy?: number; payload?: { age: number } }) =>
                      p.payload && GLIDE.rows.some((r) => r.age === p.payload!.age) ? (
                        <circle key={`${s.key}-${p.payload.age}`} cx={p.cx} cy={p.cy} r={4} fill={s.color} />
                      ) : (
                        <g key={`${s.key}-${p.payload?.age}`} />
                      )
                    }
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <figcaption className="text-xs text-muted">Dots: published ages. Dashes: straight line between them (this tool&apos;s assumption).</figcaption>
        </figure>
      </div>

      <ul className="grid gap-3 sm:grid-cols-3">
        {SLEEVES.map((s) => (
          <li key={s.key} className="flex flex-col gap-2 rounded-card border border-line bg-bg-raised p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-ink">
              <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </p>
            <p className="text-xs text-muted-strong">Similar assets on this site&apos;s map:</p>
            <div className="mt-auto flex flex-wrap gap-2">
              {s.layers.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onOpenLayer(l.id as LayerId)}
                  className="tap inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-bg px-3 text-xs font-medium text-muted-strong hover:border-muted hover:text-ink"
                >
                  View on map <span className="text-muted">· {l.fund}</span>
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">Shows the type of asset, not the actual fund a 401(k) would hold.</p>
    </section>
  );
}
