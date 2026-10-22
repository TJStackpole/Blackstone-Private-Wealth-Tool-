"use client";

import Link from "next/link";
import type { QuickProps } from "../quick";
import { findAddon } from "@/config/addons";
import Calculator from "./Calculator";

/** Drawer view: three inputs (amount, bracket, years) with BREIT's latest return-of-capital share. */
export default function TaxLensQuick({ fund }: QuickProps) {
  const liquidity = findAddon("liquidity");
  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted-strong">
        Much of BREIT&apos;s payout has been return of capital: not taxed when received, but it lowers cost basis, so more is taxed at sale.
      </p>
      <Calculator compact />
      {liquidity && (
        <Link href={`/toolkit/liquidity?fund=${fund}`} className="block text-sm text-muted-strong underline decoration-line underline-offset-4 hover:text-ink">
          Redeeming early? See when cash arrives in the Liquidity Simulator.
        </Link>
      )}
    </div>
  );
}
