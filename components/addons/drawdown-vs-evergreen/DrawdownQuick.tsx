"use client";

import type { QuickProps } from "../quick";
import { FUNDS } from "@/lib/addons/shared/funds";
import CashDrag from "./CashDrag";

/** Drawer view: the "% of money at work" comparison with default assumptions. */
export default function DrawdownQuick({ fund }: QuickProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-strong">
        {FUNDS[fund].label} is an evergreen fund: the whole amount is invested on day one. A traditional drawdown fund calls money over several years. Here&apos;s how much
        of the money is at work in each, with the same assumed return.
      </p>
      <CashDrag compact />
    </div>
  );
}
