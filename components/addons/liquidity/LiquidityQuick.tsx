"use client";

import Link from "next/link";
import type { QuickProps } from "../quick";
import { findAddon } from "@/config/addons";
import { termsFor } from "@/lib/addons/liquidity/data";
import { FUNDS } from "@/lib/addons/shared/funds";
import Simulator from "./Simulator";

/** Drawer view: the fund's limit in one line, then a one-input simulation with the Stressed preset. */
export default function LiquidityQuick({ fund }: QuickProps) {
  const t = termsFor(fund);
  const tax = findAddon("tax-lens");
  return (
    <div className="space-y-5">
      {t && (
        <p className="text-sm leading-relaxed text-muted-strong">
          {FUNDS[fund].label}: {t.howOften}. {t.limits.map((l) => `${l.label}: ${l.value}${l.unit}`).join("; ")}.
        </p>
      )}
      <Simulator initialFund={fund} initialPreset="stressed" compact />
      {tax?.enabled && tax.appliesTo.includes(fund) && (
        <Link href={`/toolkit/tax-lens?fund=${fund}`} className="block text-sm text-muted-strong underline decoration-line underline-offset-4 hover:text-ink">
          Redeeming early? See when cash arrives and when tax is due in Taxes.
        </Link>
      )}
    </div>
  );
}
