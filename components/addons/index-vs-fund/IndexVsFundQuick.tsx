"use client";

import type { QuickProps } from "../quick";
import { INDEX_VS_FUND } from "@/lib/addons/index-vs-fund/data";
import BridgeChart from "./BridgeChart";
import ComparisonCard from "./ComparisonCard";

/** Drawer view: the compact comparison card and the bridge, without the assumption inputs. */
export default function IndexVsFundQuick({ fund }: QuickProps) {
  const data = INDEX_VS_FUND[fund];
  return (
    <div className="space-y-6">
      <ComparisonCard data={data} compact />
      <BridgeChart data={data} compact />
    </div>
  );
}
