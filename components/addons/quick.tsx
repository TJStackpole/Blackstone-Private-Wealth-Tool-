"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { AddonId, FundCode } from "@/config/addons";

export interface QuickProps {
  fund: FundCode;
}

/**
 * Add-on id → its compact view for the fund-panel drawer (Phase 3 of each add-on).
 * Loaded on demand, so the map page doesn't download an add-on until a chip is opened.
 */
export const ADDON_QUICK: Partial<Record<AddonId, ComponentType<QuickProps>>> = {
  "index-vs-fund": dynamic(() => import("./index-vs-fund/IndexVsFundQuick"), { ssr: false }),
  liquidity: dynamic(() => import("./liquidity/LiquidityQuick"), { ssr: false }),
  smoothing: dynamic(() => import("./smoothing/SmoothingQuick"), { ssr: false }),
  "drawdown-vs-evergreen": dynamic(() => import("./drawdown-vs-evergreen/DrawdownQuick"), { ssr: false }),
  themes: dynamic(() => import("./themes/ThemesQuick"), { ssr: false }),
  "tax-lens": dynamic(() => import("./tax-lens/TaxLensQuick"), { ssr: false }),
};
