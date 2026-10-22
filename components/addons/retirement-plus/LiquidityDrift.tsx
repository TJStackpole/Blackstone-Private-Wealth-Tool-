"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { findAddon } from "@/config/addons";
import { driftAfterWithdrawals } from "@/lib/addons/retirement-plus/liquidity";
import { IllustrativeBadge } from "@/components/addons/shared/Badges";

function Bar({ label, pub, pri, width }: { label: string; pub: number; pri: number; width: number }) {
  const total = pub + pri;
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-strong">{label}</p>
      <div className="flex h-9 overflow-hidden rounded-md border border-line" style={{ width: `${width}%` }}>
        <div className="flex items-center bg-bg px-2 text-[11px] text-muted-strong" style={{ width: `${total > 0 ? (pub / total) * 100 : 0}%` }}>
          Public
        </div>
        <div className="flex items-center justify-center bg-accent text-[11px] font-medium text-accent-contrast" style={{ width: `${total > 0 ? (pri / total) * 100 : 0}%` }}>
          {total > 0 ? `${((pri / total) * 100).toFixed(0)}%` : ""}
        </div>
      </div>
    </div>
  );
}

/**
 * Liquidity inside a target date fund (BUILD_PLAN_401K.md, Phase 3): a rush of withdrawals is paid from the public part,
 * so the private slice's share drifts up until the manager can rebalance. Illustrative, with the Lab's slice size.
 */
export default function LiquidityDrift({ privatePct }: { privatePct: number }) {
  const [w, setW] = useState(10);
  const id = useId();
  const d = driftAfterWithdrawals(privatePct, w);
  const liquidity = findAddon("liquidity");
  return (
    <section aria-labelledby="rp-liq-h" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="rp-liq-h" className="font-serif text-[24px] font-medium leading-tight text-ink">
            When many savers want out
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-strong">
            Your 401(k) prices every day. The private slice doesn&apos;t. The fund&apos;s manager, not you, deals with withdrawal limits by keeping the slice small and
            holding cash and public assets around it.
          </p>
        </div>
        <IllustrativeBadge />
      </div>

      <div className="grid gap-6 rounded-card border border-line bg-bg-raised p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-10">
        <div className="space-y-4">
          <label htmlFor={id} className="block">
            <span className="block text-xs font-medium text-muted-strong">Savers withdraw, in one bad quarter</span>
            <span className="tnum font-serif text-[40px] leading-none text-ink">{w}%</span>
            <span className="ml-2 text-sm text-muted-strong">of the fund</span>
          </label>
          <input
            id={id}
            type="range"
            min={0}
            max={30}
            step={1}
            value={w}
            onChange={(e) => setW(Number(e.target.value))}
            aria-valuetext={`${w}% of the fund withdrawn`}
            className="glide-slider w-full"
            style={{ ["--pct" as string]: `${(w / 30) * 100}%` }}
          />
          <dl className="grid grid-cols-2 gap-3" aria-live="polite">
            <div className="rounded-card border border-line bg-bg p-3">
              <dt className="text-xs text-muted-strong">Savers paid</dt>
              <dd className="mt-1 font-serif text-xl leading-tight text-ink" data-liq="paid">
                {d.paidInFull ? "In full" : `${d.paidPct.toFixed(0)}% now`}
              </dd>
            </div>
            <div className="rounded-card border border-line bg-bg p-3">
              <dt className="text-xs text-muted-strong">Private share</dt>
              <dd className="tnum mt-1 font-serif text-xl leading-tight text-ink" data-liq="share">
                {privatePct}% → {d.privateShareAfter.toFixed(1)}%
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4">
          <Bar label="Before" pub={100 - privatePct} pri={privatePct} width={100} />
          <Bar label={`After ${w}% is paid out from the public part`} pub={d.publicAfter} pri={d.privateAfter} width={d.publicAfter + d.privateAfter} />
          <p className="text-sm leading-relaxed text-muted-strong">
            Next, the manager asks the private funds for money back to bring the slice toward {privatePct}%. If those funds are limiting withdrawals, that takes longer.
          </p>
          {liquidity && (
            <Link href="/toolkit/liquidity" className="inline-flex text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-accent">
              See how redemption limits work →
            </Link>
          )}
        </div>
      </div>
      <p className="text-xs text-muted">Leaves out cash buffers, new contributions and rebalancing during the quarter. Slice size follows the Outcome Lab.</p>
    </section>
  );
}
