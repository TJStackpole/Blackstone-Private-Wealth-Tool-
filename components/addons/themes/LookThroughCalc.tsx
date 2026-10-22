"use client";

import { useId, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { FundCode } from "@/config/addons";
import { FUNDS } from "@/lib/addons/shared/funds";
import { THEMES } from "@/lib/addons/themes/tags";
import { UNTAGGED, isConcentrated, lookThrough, type OtherHolding } from "@/lib/addons/themes/lookthrough";
import { IllustrativeBadge } from "@/components/addons/shared/Badges";
import { NumberInput, PercentInput, fieldClass as field } from "@/components/addons/shared/Inputs";

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const ORDER: FundCode[] = ["BREIT", "BXINFRA", "BXPE", "BCRED"];


function OtherRow({ o, onChange, onRemove }: { o: OtherHolding; onChange: (o: OtherHolding) => void; onRemove: () => void }) {
  const id = useId();
  return (
    <li className="grid grid-cols-[1fr_auto] gap-2 rounded-card border border-line p-2 sm:grid-cols-[1.2fr_1fr_1.2fr_auto] sm:items-end sm:border-0 sm:p-0">
      <div className="col-span-2 space-y-1 sm:col-span-1">
        <label htmlFor={`${id}-l`} className="block text-xs font-medium text-muted-strong">
          Holding
        </label>
        <input id={`${id}-l`} className={field} value={o.label} onChange={(e) => onChange({ ...o, label: e.target.value })} />
      </div>
      <div className="col-span-2 sm:col-span-1">
        <NumberInput label="Amount" value={o.amount} onChange={(amount) => onChange({ ...o, amount })} min={0} step={10000} prefix="$" />
      </div>
      <div className="space-y-1">
        <label htmlFor={`${id}-t`} className="block text-xs font-medium text-muted-strong">
          Theme (tagged by you)
        </label>
        <select id={`${id}-t`} className={field} value={o.theme ?? ""} onChange={(e) => onChange({ ...o, theme: e.target.value || null })}>
          <option value="">Not in a theme</option>
          {THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <button type="button" onClick={onRemove} className="tap h-10 self-end rounded-card border border-line px-3 text-xs text-muted-strong hover:text-ink" aria-label={`Remove ${o.label || "holding"}`}>
        Remove
      </button>
    </li>
  );
}

/** Look-through: dollars in each fund plus hand-tagged outside holdings, added up by theme. Nothing is saved or sent. */
export default function LookThroughCalc({ compactFund }: { compactFund?: FundCode }) {
  const [funds, setFunds] = useState<Record<FundCode, number>>({ BREIT: 250_000, BXINFRA: 250_000, BXPE: 250_000, BCRED: 250_000 });
  const [others, setOthers] = useState<OtherHolding[]>([{ label: "Nvidia stock", amount: 200_000, theme: "ai-data-centers" }]);
  const [threshold, setThreshold] = useState(25);

  const r = useMemo(() => lookThrough({ funds: compactFund ? { [compactFund]: funds[compactFund] } : funds, others: compactFund ? [] : others }), [funds, others, compactFund]);
  const flagged = isConcentrated(r.largest, threshold);
  const data = r.slices.filter((s) => s.amount > 0).map((s) => ({ name: s.label, pct: +s.pct.toFixed(1), amount: s.amount, untagged: s.id === UNTAGGED, over: s.id !== UNTAGGED && s.pct > threshold }));

  return (
    <div className="space-y-6">
      {!compactFund && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ORDER.map((f) => (
              <NumberInput key={f} label={`${FUNDS[f].label} (${FUNDS[f].assetClass})`} value={funds[f]} onChange={(v) => setFunds((s) => ({ ...s, [f]: v }))} min={0} step={10000} prefix="$" />
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-strong">Other holdings, tagged to a theme by you</p>
            <ul className="space-y-2">
              {others.map((o, i) => (
                <OtherRow key={i} o={o} onChange={(n) => setOthers((s) => s.map((x, j) => (j === i ? n : x)))} onRemove={() => setOthers((s) => s.filter((_, j) => j !== i))} />
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setOthers((s) => [...s, { label: "", amount: 0, theme: null }])}
              className="tap inline-flex h-8 items-center rounded-full border border-line bg-bg-raised px-3 text-xs font-medium text-muted-strong hover:text-ink"
            >
              + Add a holding
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="w-48">
          <PercentInput label="Flag a theme above" value={threshold} onChange={setThreshold} />
        </div>
        <IllustrativeBadge />
      </div>

      <p className="rounded-card border border-line bg-bg-raised p-4 sm:p-5 font-serif text-lg leading-snug text-ink" aria-live="polite">
        {r.total === 0
          ? "Enter amounts to see the look-through."
          : r.largest
            ? `${r.largest.label} is the largest theme: about ${money(r.largest.amount)}, ${r.largest.pct.toFixed(1)}% of ${money(r.total)}.${flagged ? ` That's above the ${threshold}% level set here.` : ""}`
            : "None of these holdings are in a tagged theme."}
      </p>

      {r.total > 0 && (
        <figure className="space-y-2">
          <div className="h-72" role="img" aria-label={data.map((d) => `${d.name}: ${d.pct}%`).join("; ")}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart accessibilityLayer={false} data={data} layout="vertical" margin={{ top: 0, right: 56, bottom: 0, left: 0 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" unit="%" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} domain={[0, (max: number) => Math.ceil(Math.max(max, threshold + 5) / 10) * 10]} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fill: "var(--muted-strong)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <ReferenceLine x={threshold} stroke="var(--text)" strokeDasharray="4 3" label={{ value: `${threshold}%`, position: "top", fill: "var(--muted-strong)", fontSize: 11 }} />
                <Bar dataKey="pct" isAnimationActive={false} radius={2} activeBar={false}>
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.untagged ? "var(--border)" : "var(--accent)"} fillOpacity={d.over ? 1 : 0.6} />
                  ))}
                  <LabelList dataKey="pct" position="right" formatter={(v) => `${v}%`} style={{ fill: "var(--text)", fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <figcaption className="text-xs leading-relaxed text-muted">
            Each fund is split by its published sector weights (10-Q, June 30, 2026). Outside holdings count fully toward the theme you tag. Amounts stay on
            this screen only; nothing is saved or sent.
          </figcaption>
        </figure>
      )}
    </div>
  );
}
