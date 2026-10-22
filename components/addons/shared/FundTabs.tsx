"use client";

import type { FundCode } from "@/config/addons";
import { FUNDS } from "@/lib/addons/shared/funds";

/** A row of fund buttons for add-on pages, each with its accent dot. */
export default function FundTabs({ value, onChange, funds = Object.keys(FUNDS) as FundCode[] }: { value: FundCode; onChange: (f: FundCode) => void; funds?: FundCode[] }) {
  return (
    <div role="group" aria-label="Fund" className="flex flex-wrap gap-2">
      {funds.map((f) => (
        <button
          key={f}
          type="button"
          aria-pressed={f === value}
          onClick={() => onChange(f)}
          className={[
            "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm transition-colors",
            f === value ? "border-ink bg-bg-raised font-medium text-ink" : "border-line text-muted-strong hover:text-ink",
          ].join(" ")}
        >
          <span aria-hidden className="tab-dot inline-block h-2 w-2 rounded-full" style={{ ["--tab-light" as string]: FUNDS[f].color, ["--tab-dark" as string]: FUNDS[f].colorDark }} />
          {FUNDS[f].label}
          <span className="hidden text-xs text-muted sm:inline">{FUNDS[f].assetClass}</span>
        </button>
      ))}
    </div>
  );
}
