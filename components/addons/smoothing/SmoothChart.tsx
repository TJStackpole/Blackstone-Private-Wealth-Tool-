"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceArea, Tooltip, XAxis, YAxis } from "recharts";
import { SERIES } from "@/lib/addons/smoothing/data";
import { desmooth, levels, maxDrawdown, volatility } from "@/lib/addons/smoothing/stats";
import { AsOfSource, IllustrativeBadge, SampleBadge } from "@/components/addons/shared/Badges";
import { PrintSized } from "@/components/addons/shared/PrintSized";

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

/** Appraised vs. traded, growth of 100, with the traded series' worst fall shaded and an optional market-style estimate. */
export default function SmoothChart({ compact = false }: { compact?: boolean }) {
  const [show, setShow] = useState(false);
  const [alpha, setAlpha] = useState(SERIES.builtWithAlpha);
  const { quarters, appraised, traded } = SERIES;

  const est = useMemo(() => desmooth(appraised.returns, alpha), [appraised.returns, alpha]);
  const a = levels(appraised.returns);
  const t = levels(traded.returns);
  const e = levels(est);
  const labels = ["Start", ...quarters];
  const data = labels.map((q, i) => ({ q, appraised: +a[i].toFixed(2), traded: +t[i].toFixed(2), estimate: +e[i].toFixed(2) }));
  const ddT = maxDrawdown(traded.returns);
  const rows = [
    { name: appraised.label, vol: volatility(appraised.returns), dd: maxDrawdown(appraised.returns).drawdown },
    { name: traded.label, vol: volatility(traded.returns), dd: ddT.drawdown },
    ...(show ? [{ name: `Market-style estimate (α = ${alpha.toFixed(2)})`, vol: volatility(est), dd: maxDrawdown(est).drawdown }] : []),
  ];
  const period = `${quarters[0]} to ${quarters[quarters.length - 1]}, quarterly`;

  return (
    <div className="space-y-4 print:space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="no-print flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={show} onChange={(ev) => setShow(ev.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
          Show market-style estimate
        </label>
        <div className="flex items-center gap-2">
          <SampleBadge />
          {show && <IllustrativeBadge />}
        </div>
      </div>

      <figure className="space-y-2">
        <div className={compact ? "h-48" : "h-72 print:h-40"} role="img" aria-label={`Growth of 100: ${appraised.label} and ${traded.label}, ${period}. Worst fall of the traded series shaded.`}>
          <PrintSized height={160} off={compact}>
            <LineChart accessibilityLayer={false} data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <ReferenceArea x1={labels[ddT.peak]} x2={labels[ddT.trough]} fill="var(--muted)" fillOpacity={0.15} ifOverflow="hidden" />
              <XAxis dataKey="q" tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "var(--border)" }} interval={compact ? 11 : 7} tickFormatter={(q: string) => (q === "Start" ? "" : q.slice(0, 4))} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} axisLine={false} width={40} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Line dataKey="traded" name={traded.label} stroke="var(--muted)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line dataKey="appraised" name={appraised.label} stroke="var(--accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
              {show && <Line dataKey="estimate" name="Market-style estimate" stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} />}
            </LineChart>
          </PrintSized>
        </div>
        <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-0.5 w-4 bg-accent" /> {appraised.label}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-0.5 w-4 bg-muted" /> {traded.label}
          </span>
          {show && (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="h-0 w-4 border-t border-dashed border-accent" /> Market-style estimate
            </span>
          )}
          <span>Shaded: the traded series&apos; worst fall. Growth of 100, {period}.</span>
        </figcaption>
      </figure>

      {show && !compact && (
        <div className="space-y-1.5">
          <label htmlFor="sm-alpha" className="flex items-center justify-between gap-3 text-sm text-ink">
            <span>How much each appraisal leans on the last one (α): {alpha.toFixed(2)}</span>
            <IllustrativeBadge />
          </label>
          <input id="sm-alpha" type="range" min={0} max={0.9} step={0.05} value={alpha} onChange={(ev) => setAlpha(ev.target.valueAsNumber)} className="glide-slider w-full" style={{ ["--pct" as string]: `${(alpha / 0.9) * 100}%` }} />
          <p className="text-xs text-muted">0 means no smoothing assumed (the line matches the appraised one). Higher values assume more smoothing, so the estimate swings more.</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-card border border-line">
        <table className="tnum w-full min-w-[420px] text-right text-sm print:text-xs">
          <caption className="sr-only">Volatility and worst fall, {period}</caption>
          <thead className="bg-bg-raised text-[11px] uppercase tracking-[0.08em] text-muted">
            <tr>
              <th scope="col" className="px-3 py-2 text-left font-medium">Series</th>
              <th scope="col" className="px-3 py-2 font-medium">Volatility (a year)</th>
              <th scope="col" className="px-3 py-2 font-medium">Worst fall</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.name}>
                <th scope="row" className="px-3 py-2 text-left font-normal text-ink">{r.name}</th>
                <td className="px-3 py-2 text-ink">{pct(r.vol)}</td>
                <td className="px-3 py-2 text-ink">{r.dd === 0 ? "None" : `−${pct(r.dd)}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div id="sample-note" className="space-y-1">
        <AsOfSource asOf={SERIES.asOf} source={SERIES.source} />
        {!compact && <p className="text-xs leading-relaxed text-muted print:hidden">{SERIES.note} Period: {period}.</p>}
      </div>
    </div>
  );
}
