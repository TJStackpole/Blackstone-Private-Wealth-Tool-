"use client";

import { useState } from "react";
import { reserveSentence, yearsCovered } from "@/lib/addons/liquidity/reserve";
import { IllustrativeBadge } from "@/components/addons/shared/Badges";
import { NumberInput } from "@/components/addons/shared/Inputs";

/** "Will I need to?" rather than "Can I get out?": years of spending the client's liquid assets cover on their own. */
export default function ReserveCheck() {
  const [liquid, setLiquid] = useState(400_000);
  const [spending, setSpending] = useState(150_000);
  const years = yearsCovered(liquid, spending);
  const pct = years === Infinity ? 100 : Math.min(100, (years / 5) * 100);
  return (
    <div className="space-y-4 rounded-card border border-line bg-bg-raised p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">Liquidity reserve check</p>
        <IllustrativeBadge />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput label="Liquid assets outside the fund (cash, bonds, public stocks)" value={liquid} onChange={setLiquid} min={0} step={10000} prefix="$" />
        <NumberInput label="Annual spending needs" value={spending} onChange={setSpending} min={0} step={5000} prefix="$" />
      </div>
      <p className="font-serif text-lg leading-snug text-ink" aria-live="polite">
        {reserveSentence(years)}
      </p>
      <div aria-hidden className="space-y-1">
        <div className="h-2 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
        <div className="tnum flex justify-between text-[11px] text-muted">
          <span>0</span>
          <span>5+ years</span>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted">
        Liquid assets divided by yearly spending. It ignores market moves, taxes and new income, and isn&apos;t a recommended reserve size.
      </p>
    </div>
  );
}
