"use client";

import Link from "next/link";
import { FUNDS, toLayerId } from "@/lib/addons/shared/funds";
import { useFundParam } from "./useFundParam";

/** Opened from a fund's page (?fund=BCRED): a way straight back to that fund on the map. */
export default function BackToFund() {
  const fund = useFundParam();
  if (!fund) return null;
  return (
    <>
      <span aria-hidden className="text-muted">
        ·
      </span>
      <Link href={`/?view=${toLayerId(fund)}`} className="tap inline-flex items-center hover:text-ink">
        ← {FUNDS[fund].label} on the map
      </Link>
    </>
  );
}
