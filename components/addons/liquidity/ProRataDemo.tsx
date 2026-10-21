"use client";

import { useState } from "react";
import { proRataFill } from "@/lib/addons/liquidity/prorata";
import { IllustrativeBadge } from "@/components/addons/shared/Badges";

/** Ten people in line, each asking for $100,000. Drag total requests past the limit and watch every fill shrink equally. */
export default function ProRataDemo({ limitPct = 5 }: { limitPct?: number }) {
  const [requests, setRequests] = useState(10);
  const fill = proRataFill(limitPct, requests);
  const people = Array.from({ length: 10 });
  return (
    <div className="space-y-4 rounded-card border border-line bg-bg-raised p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink">
          Total requests: <span className="tnum font-medium">{requests}%</span> of the fund · limit <span className="tnum font-medium">{limitPct}%</span>
        </p>
        <IllustrativeBadge />
      </div>
      <input
        type="range"
        min={1}
        max={20}
        step={1}
        value={requests}
        onChange={(e) => setRequests(Number(e.target.value))}
        aria-label="Total redemption requests as a percent of the fund"
        className="w-full accent-[var(--accent)]"
      />
      <ul aria-label="Ten investors, each requesting $100,000" className="grid grid-cols-10 gap-1.5">
        {people.map((_, i) => (
          <li key={i} className="flex h-24 flex-col justify-end overflow-hidden rounded-sm bg-map-empty" title={`Gets $${Math.round(100 * fill)}k of $100k`}>
            <div className="bg-accent transition-[height] duration-300" style={{ height: `${fill * 100}%` }} />
          </li>
        ))}
      </ul>
      <p className="text-sm leading-relaxed text-muted-strong">
        {fill >= 1 ? (
          <>Requests are within the limit, so everyone gets 100% of what they asked for.</>
        ) : (
          <>
            Requests are {(requests / limitPct).toFixed(1)}× the limit, so each person gets the same <span className="tnum font-medium text-ink">{Math.round(fill * 100)}%</span>: about
            ${Math.round(100 * fill)},000 of a $100,000 request. The rest stays invested and can usually be asked for again next period.
          </>
        )}
      </p>
    </div>
  );
}
