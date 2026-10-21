"use client";

import Link from "next/link";
import { ADDONS, addonsForFund, type AddonDef, type FundCode } from "@/config/addons";
import type { LayerId } from "@/lib/types";
import { toFundCode } from "@/lib/addons/shared/funds";
import AddonBoundary from "./AddonBoundary";

interface Props {
  fundId: LayerId | FundCode;
  /** Injectable for tests; defaults to the registry. */
  addons?: AddonDef[];
}

/**
 * Doorway B: small buttons in a fund's side panel for each enabled add-on that applies to that fund.
 * Renders nothing at all when there are none, so the panel looks exactly as before.
 */
export default function AddonChips({ fundId, addons = ADDONS }: Props) {
  const code = toFundCode(fundId);
  const list = code ? addonsForFund(code, addons) : [];
  if (list.length === 0) return null;
  return (
    <AddonBoundary addonId="chips">
      <nav aria-label="Advisor tools for this fund" className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">Advisor tools</p>
        <ul className="flex flex-wrap gap-2">
          {list.map((a) => (
            <li key={a.id}>
              <Link
                href={`/toolkit/${a.id}?fund=${code}`}
                className="inline-flex h-8 items-center rounded-full border border-line bg-bg-raised px-3 text-xs font-medium text-muted-strong hover:border-muted hover:text-ink"
              >
                {a.shortName}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </AddonBoundary>
  );
}
