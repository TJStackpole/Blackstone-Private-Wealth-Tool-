"use client";

import { useId } from "react";
import type { FundCode } from "@/config/addons";
import { FUNDS } from "@/lib/addons/shared/funds";

const field = "tnum h-10 w-full rounded-card border border-line bg-bg-raised px-3 text-sm text-ink focus-visible:border-accent";

interface NumberProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  help?: string;
}

/** Labeled number field. Empty or invalid input is ignored rather than turned into NaN. */
export function NumberInput({ label, value, onChange, min, max, step = 1, prefix, suffix, help }: NumberProps) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-muted-strong">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {prefix && <span aria-hidden className="text-sm text-muted">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          className={field}
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          aria-describedby={help ? `${id}-help` : undefined}
          onChange={(e) => {
            const n = e.target.valueAsNumber;
            if (!Number.isFinite(n)) return;
            const clamped = Math.min(max ?? n, Math.max(min ?? n, n));
            onChange(clamped);
          }}
        />
        {suffix && <span aria-hidden className="text-sm text-muted">{suffix}</span>}
      </div>
      {help && (
        <p id={`${id}-help`} className="text-[11px] text-muted">
          {help}
        </p>
      )}
    </div>
  );
}

/** A percentage, entered as 5 for 5%. */
export function PercentInput(props: Omit<NumberProps, "suffix" | "prefix">) {
  return <NumberInput min={0} max={100} step={0.1} {...props} suffix="%" />;
}

interface SelectFundProps {
  value: FundCode;
  onChange: (f: FundCode) => void;
  /** Limit the choice, e.g. to the funds an add-on applies to. */
  funds?: FundCode[];
  label?: string;
}

export function SelectFund({ value, onChange, funds = Object.keys(FUNDS) as FundCode[], label = "Fund" }: SelectFundProps) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-muted-strong">
        {label}
      </label>
      <select id={id} className={field} value={value} onChange={(e) => onChange(e.target.value as FundCode)}>
        {funds.map((f) => (
          <option key={f} value={f}>
            {FUNDS[f].label} · {FUNDS[f].assetClass}
          </option>
        ))}
      </select>
    </div>
  );
}
