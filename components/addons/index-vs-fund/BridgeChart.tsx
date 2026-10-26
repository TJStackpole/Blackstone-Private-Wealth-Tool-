"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, XAxis, YAxis } from "recharts";
import type { IndexVsFund, ShareClass } from "@/lib/addons/index-vs-fund/data";
import { SHARE_CLASSES, leverageGap, returnFor } from "@/lib/addons/index-vs-fund/data";
import { buildBridge } from "@/lib/addons/index-vs-fund/bridge";
import MoreDetails from "@/components/addons/shared/MoreDetails";
import { IllustrativeBadge, SampleBadge } from "@/components/addons/shared/Badges";
import { NumberInput, PercentInput } from "@/components/addons/shared/Inputs";
import { pct } from "./ComparisonCard";
import { PrintSized } from "@/components/addons/shared/PrintSized";

const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
const signed = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(2)}`;

/** Waterfall from the index's one-year return to an estimated return for one share class. Every step comes from an input. */
export default function BridgeChart({ data, compact = false }: { data: IndexVsFund; compact?: boolean }) {
  const { index, fees } = data;
  const [cls, setCls] = useState<ShareClass>("S");
  const [indexReturn, setIndexReturn] = useState(index.annual?.value ?? 8);
  const [indexIsNet, setIndexIsNet] = useState(index.feeBasis === "net");
  const [lev, setLev] = useState(leverageGap(data));
  const [borrowCost, setBorrowCost] = useState(6);
  const [cashPct, setCashPct] = useState(5);
  const [cashYield, setCashYield] = useState(4);

  const bridge = useMemo(
    () =>
      buildBridge({
        indexReturn,
        indexIsNet,
        extraLeveragePct: lev,
        borrowCostPct: borrowCost,
        cashPct,
        cashYieldPct: cashYield,
        managementFeePct: fees.management.value,
        performanceFeePct: fees.performance.value,
        hurdlePct: fees.performance.hurdle,
        servicingFeePct: fees.servicing[cls],
      }),
    [indexReturn, indexIsNet, lev, borrowCost, cashPct, cashYield, fees, cls],
  );

  const rows = [
    { name: "Index", range: [Math.min(0, bridge.start), Math.max(0, bridge.start)], label: pct(Math.round(bridge.start * 100) / 100), kind: "total" },
    ...bridge.steps.map((s) => ({
      name: s.label,
      range: [Math.min(s.from, s.to), Math.max(s.from, s.to)],
      label: indexIsNet && (s.key === "management" || s.key === "performance") ? "in the index" : signed(s.delta),
      kind: s.delta < 0 ? "down" : "up",
    })),
    { name: `Class ${cls} estimate`, range: [Math.min(0, bridge.end), Math.max(0, bridge.end)], label: pct(Math.round(bridge.end * 100) / 100), kind: "total" },
  ];
  const reported = returnFor(data, cls);
  // Whose number the bridge starts from: the index's own, the tool's placeholder, or one typed in.
  const startFrom = indexReturn === (index.annual?.value ?? 8) ? (index.annual ? "the index's" : "a placeholder index return of") : "an index return you entered of";

  return (
    <div className="space-y-5 print:space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Share class" className="no-print flex gap-2">
          {SHARE_CLASSES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={c === cls}
              onClick={() => setCls(c)}
              className={[
                "tap h-8 rounded-full border px-3 text-xs font-medium transition-colors",
                c === cls ? "border-accent bg-accent text-accent-contrast" : "border-line bg-bg-raised text-muted-strong hover:text-ink",
              ].join(" ")}
            >
              Class {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {index.sample && <SampleBadge />}
          <IllustrativeBadge />
        </div>
      </div>

      <p className="rounded-card border border-line bg-bg-raised p-4 sm:p-5 font-serif text-lg print:p-2 print:text-base leading-snug text-ink" aria-live="polite">
        Starting from {startFrom} {pct(Math.round(bridge.start * 100) / 100)}, this illustration lands at about {pct(Math.round(bridge.end * 10) / 10)} a year for Class {cls}.
      </p>

      <div className={compact ? "h-64" : "h-80 print:h-44"} role="img" aria-label={`Bridge from ${bridge.start.toFixed(2)}% to ${bridge.end.toFixed(2)}%: ${bridge.steps.map((s) => `${s.label} ${signed(s.delta)}`).join(", ")}`}>
        <PrintSized height={176} off={compact}>
          <BarChart accessibilityLayer={false} data={rows} layout="vertical" margin={{ top: 4, right: 48, bottom: 0, left: 0 }}>
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis type="number" tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} axisLine={{ stroke: "var(--border)" }} tickLine={false} domain={["auto", "auto"]} />
            <YAxis type="category" dataKey="name" width={compact ? 118 : 150} tick={{ fill: "var(--muted-strong)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <ReferenceLine x={0} stroke="var(--muted)" />
            <Bar dataKey="range" isAnimationActive={false} radius={2} activeBar={false}>
              {rows.map((r) => (
                <Cell key={r.name} fill={r.kind === "total" ? "var(--accent)" : r.kind === "down" ? "var(--muted)" : "var(--accent)"} fillOpacity={r.kind === "up" ? 0.55 : 1} />
              ))}
              <LabelList dataKey="label" position="right" style={{ fill: "var(--text)", fontSize: 11 }} />
            </Bar>
          </BarChart>
        </PrintSized>
      </div>

      {reported && (
        <p className="text-xs leading-relaxed text-muted-strong">
          For reference, Class {cls} reported {pct(reported.value)} for {lowerFirst(reported.period)}. That&apos;s a different period from this one-year
          estimate, so it&apos;s shown beside the bridge rather than as its end point.
        </p>
      )}

      {!compact && (
        <MoreDetails summary="Adjust the assumptions" hint="Borrowing, cash held for redemptions and the index return">
        <div className="no-print space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="ivf-lev" className="flex items-center justify-between gap-3 text-sm text-ink">
              <span>What if borrowing beyond the index&apos;s were {lev}% of assets?</span>
              <IllustrativeBadge />
            </label>
            <input id="ivf-lev" type="range" min={0} max={60} step={0.5} value={lev} onChange={(e) => setLev(e.target.valueAsNumber)} className="glide-slider w-full" style={{ ["--pct" as string]: `${(lev / 60) * 100}%` }} />
            <p className="text-xs text-muted">
              Starts at {leverageGap(data)}%:{" "}
              {data.leverage ? `${data.leverage.text} ` : "the filing doesn't give one fund-wide leverage figure. "}
              {index.leveragePct
                ? `The index's own leverage was ${index.leveragePct}%, so this is the extra borrowing on top of the index's return: (${data.leverage?.value}% − ${index.leveragePct}%) ÷ (100% − ${index.leveragePct}%). The two leverage figures are measured differently.`
                : ""}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NumberInput
              label="Index return, % a year"
              value={indexReturn}
              onChange={setIndexReturn}
              min={-50}
              max={50}
              step={0.1}
              suffix="%"
              help={index.annual ? `${index.annual.period}. Sample until checked against the provider.` : "No free figure is published. Enter one from a licensed source; 8% is a placeholder."}
            />
            <PercentInput label="Cost of borrowing (assumption)" value={borrowCost} onChange={setBorrowCost} />
            <PercentInput label="Cash held for redemptions (assumption)" value={cashPct} onChange={setCashPct} />
            <PercentInput label="Yield on that cash (assumption)" value={cashYield} onChange={setCashYield} />
            <label className="flex items-center gap-2 self-end text-sm text-muted-strong">
              <input type="checkbox" checked={indexIsNet} onChange={(e) => setIndexIsNet(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
              Index is already after fees
            </label>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            Fees from the fund&apos;s 10-Q: {fees.management.value}% management, {fees.performance.value}% {fees.performance.label.toLowerCase()} above a {fees.performance.hurdle}% hurdle
            (simplified here: no high-water mark or catch-up), and a {fees.servicing[cls]}% servicing fee for Class {cls}. {fees.management.verify}.
          </p>
        </div>
        </MoreDetails>
      )}
    </div>
  );
}
