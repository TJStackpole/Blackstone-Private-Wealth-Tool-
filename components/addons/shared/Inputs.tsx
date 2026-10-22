"use client";

import { useId, useState } from "react";
import type { FundCode } from "@/config/addons";
import { FUNDS } from "@/lib/addons/shared/funds";

/** 16px text on phones so iPhone Safari doesn't zoom in when a field is tapped; 14px from tablet width up. */
export const fieldClass =
  "tnum h-10 w-full rounded-card border border-line bg-bg-raised px-3 text-base text-ink focus-visible:border-accent sm:text-sm";
const field = fieldClass;

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 });

/** Reads what a person typed: commas, spaces, "$" and "%" are ignored. Returns null if it isn't a number yet. */
export function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/[,\s$%]/g, "");
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

interface NumberProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Shown inside the field, e.g. "$" or "%". */
  prefix?: string;
  suffix?: string;
  help?: string;
}

/**
 * Labeled number field. Shows big numbers with commas (500,000), accepts them typed either way, ignores anything that
 * isn't a number yet, and steps with the up and down arrow keys. Above the maximum it clamps at once; below the minimum
 * it waits until the field loses focus, since more digits may be coming.
 */
export function NumberInput({ label, value, onChange, min, max, step = 1, prefix, suffix, help }: NumberProps) {
  const id = useId();
  // While the field has focus, show exactly what's typed; otherwise show the value formatted.
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (Number.isFinite(value) ? fmt.format(value) : "");
  const clamp = (n: number) => Math.min(max ?? n, Math.max(min ?? n, n));
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-muted-strong">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={[field, prefix ? "pl-7" : "", suffix ? "pr-8" : ""].join(" ")}
          value={shown}
          aria-describedby={help ? `${id}-help` : undefined}
          onFocus={() => setDraft(shown)}
          onBlur={() => {
            // A number below the minimum is held while typing (the "6" on the way to "60"), then raised to it on leaving.
            const n = draft === null ? null : parseNumber(draft);
            if (n !== null && min !== undefined && n < min) onChange(min);
            setDraft(null);
          }}
          onChange={(e) => {
            setDraft(e.target.value);
            const n = parseNumber(e.target.value);
            if (n === null || (min !== undefined && n < min)) return;
            onChange(clamp(n));
          }}
          onKeyDown={(e) => {
            if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
            e.preventDefault();
            const next = clamp(+((Number.isFinite(value) ? value : 0) + (e.key === "ArrowUp" ? step : -step)).toFixed(6));
            onChange(next);
            setDraft(fmt.format(next));
          }}
        />
        {suffix && (
          <span aria-hidden className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted">
            {suffix}
          </span>
        )}
      </div>
      {help && (
        <p id={`${id}-help`} className="text-xs text-muted">
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
