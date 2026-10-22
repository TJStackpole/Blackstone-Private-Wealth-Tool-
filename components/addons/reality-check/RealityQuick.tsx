"use client";

import type { QuickProps } from "../quick";
import { CLAIMS, topClaims } from "@/lib/addons/reality-check/data";
import ClaimCard from "./ClaimCard";

/** Drawer view: the two claims most worth raising for this fund, each with its freshness. */
export default function RealityQuick({ fund }: QuickProps) {
  return (
    <div className="space-y-3">
      {topClaims(CLAIMS[fund]).map((c) => (
        <ClaimCard key={c.id} c={c} compact />
      ))}
    </div>
  );
}
