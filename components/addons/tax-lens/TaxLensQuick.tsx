"use client";

import Link from "next/link";
import type { QuickProps } from "../quick";
import { findAddon } from "@/config/addons";
import Calculator from "./Calculator";
import FundTax from "./FundTax";

/** Drawer view: BREIT gets its return-of-capital calculator; the other funds their own tax facts. */
export default function TaxLensQuick({ fund }: QuickProps) {
  const liquidity = findAddon("liquidity");
  if (fund !== "BREIT") return <FundTax fund={fund} compact />;
  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted-strong">
        Much of BREIT&apos;s payout has been return of capital: not taxed when received, but it lowers cost basis, so more is taxed at sale.
      </p>
      <Calculator compact />
      {liquidity && (
        <Link href={`/toolkit/liquidity?fund=${fund}`} className="block text-sm text-muted-strong underline decoration-line underline-offset-4 hover:text-ink">
          When does the cash arrive if you redeem? See Getting money out.
        </Link>
      )}
    </div>
  );
}
