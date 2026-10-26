"use client";

import { useId } from "react";
import { fieldClass } from "@/components/addons/shared/Inputs";
import { formatDate } from "@/lib/dates";
import { STATES, stateRate, stateRateLine } from "@/lib/addons/tax-lens/states";
import { combinedRates, type TaxParams } from "@/lib/addons/tax-lens/roc";

const pct = (n: number) => `${+n.toFixed(2)}%`;

/** The client's state: sets the state rate every tax figure adds to the federal ones. */
export function StatePicker({ code, onChange, compact = false }: { code: string; onChange: (code: string) => void; compact?: boolean }) {
  const id = useId();
  const s = stateRate(code);
  return (
    // On paper the sentence it feeds names the state and rate; the menu itself is for screens.
    <div className="space-y-1 print:hidden">
      <label htmlFor={id} className="block text-xs font-medium text-muted-strong">
        Client&apos;s state
      </label>
      <select id={id} className={fieldClass} value={s.code} onChange={(e) => onChange(e.target.value)}>
        {STATES.states.map((x) => (
          <option key={x.code} value={x.code}>
            {x.name} · {x.top ? `${x.top}%` : "no income tax"}
          </option>
        ))}
      </select>
      {!compact && <StateSource code={s.code} />}
    </div>
  );
}

/** Where the state's rate comes from, with its date. */
export function StateSource({ code }: { code: string }) {
  return (
    <p className="text-[11px] leading-snug text-muted">
      {stateRateLine(stateRate(code))}.{" "}
      <a href={STATES.source.url} target="_blank" rel="noreferrer noopener" className="underline decoration-line underline-offset-2 hover:text-ink">
        {STATES.source.name}
      </a>
      , as of {formatDate(STATES.asOf)}.
    </p>
  );
}

/**
 * "Taxed now: 29.6% federal + 3.8% NIIT + 4.95% Illinois = 38.35%." The rates a result used, spelled out, so a figure
 * never reads as federal-only by accident.
 */
export function RatesUsed({ p, stateName, gains = true }: { p: Pick<TaxParams, "ordinaryRatePct" | "capitalGainsRatePct" | "stateRatePct" | "niit" | "qrdDeduction">; stateName: string; gains?: boolean }) {
  const r = combinedRates(p);
  const parts = (fed: number, fedLabel: string) =>
    [`${pct(fed)} ${fedLabel}`, r.niit ? `${pct(r.niit)} NIIT` : null, `${pct(r.state)} ${stateName}`].filter(Boolean).join(" + ");
  return (
    <p className="tnum text-xs leading-relaxed text-muted-strong" data-rates-used>
      Rates used: payouts taxed as income at {parts(r.fedIncome, p.qrdDeduction ? `federal (${pct(p.ordinaryRatePct)} less the 199A deduction)` : "federal")} ={" "}
      <span className="font-medium text-ink">{pct(r.income)}</span>
      {gains && (
        <>
          ; capital gains at {parts(p.capitalGainsRatePct, "federal")} = <span className="font-medium text-ink">{pct(r.gains)}</span>
        </>
      )}
      .
    </p>
  );
}
