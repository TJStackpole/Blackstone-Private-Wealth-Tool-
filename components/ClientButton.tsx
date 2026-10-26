"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useClient } from "./useClient";
import { FEDERAL_BRACKETS } from "@/lib/client";
import { STATES, stateRate } from "@/lib/addons/tax-lens/states";
import { fieldClass, NumberInput } from "@/components/addons/shared/Inputs";

const money = (n: number) => (n >= 1e6 ? `$${+(n / 1e6).toFixed(2)}M` : `$${Math.round(n / 1000)}k`);

/**
 * "Client: Illinois · 37% · $250k". The client's state, federal bracket and amount, set once here and used by every
 * tool (taxes, getting money out, evergreen vs. drawdown). Kept in this browser only.
 */
export default function ClientButton() {
  const [client, update] = useClient();
  const [open, setOpen] = useState(false);
  const panel = useId();
  const stateId = useId();
  const bracketId = useId();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);
  const place = stateRate(client.state);
  return (
    <div ref={root} className="relative no-print">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? panel : undefined}
        onClick={() => setOpen((o) => !o)}
        className="tap inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-bg-raised px-3 text-xs font-medium text-muted-strong transition-colors hover:text-ink"
      >
        <svg aria-hidden width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="8" cy="5.5" r="2.8" />
          <path d="M2.8 14c.6-2.8 2.7-4.3 5.2-4.3s4.6 1.5 5.2 4.3" />
        </svg>
        <span className="tnum">
          Client <span className="hidden sm:inline">· {place.code} · {client.bracket}% · {money(client.amount)}</span>
        </span>
      </button>
      {open && (
        <div
          id={panel}
          role="dialog"
          aria-label="Your client"
          className="absolute right-0 top-11 z-40 w-[min(320px,calc(100vw-2rem))] space-y-3 rounded-card border border-line bg-bg-raised p-4 text-left shadow-[0_12px_32px_-12px_rgba(20,22,26,0.35)]"
        >
          <div>
            <p className="text-sm font-medium text-ink">Your client</p>
            <p className="text-[11px] leading-snug text-muted">Set once; every tool uses it. Saved in this browser only.</p>
          </div>
          <div className="space-y-1">
            <label htmlFor={stateId} className="block text-xs font-medium text-muted-strong">
              State
            </label>
            <select id={stateId} className={fieldClass} value={place.code} onChange={(e) => update({ state: e.target.value })}>
              {STATES.states.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} · {s.top ? `${s.top}%` : "no income tax"}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor={bracketId} className="block text-xs font-medium text-muted-strong">
              Federal tax bracket
            </label>
            <select id={bracketId} className={fieldClass} value={client.bracket} onChange={(e) => update({ bracket: Number(e.target.value) })}>
              {(FEDERAL_BRACKETS.includes(client.bracket) ? FEDERAL_BRACKETS : [...FEDERAL_BRACKETS, client.bracket].sort((a, b) => a - b)).map((b) => (
                <option key={b} value={b}>
                  {b}%
                </option>
              ))}
            </select>
          </div>
          <NumberInput label="Amount invested" value={client.amount} onChange={(v) => update({ amount: v })} min={0} step={10000} prefix="$" />
          <button type="button" onClick={() => setOpen(false)} className="tap h-8 rounded-full border border-line px-3 text-xs font-medium text-muted-strong hover:text-ink">
            Done
          </button>
        </div>
      )}
    </div>
  );
}
