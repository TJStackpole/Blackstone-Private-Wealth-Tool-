"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { AddonId, FundCode } from "@/config/addons";
import ToolLoading from "./shared/ToolLoading";

export interface QuickProps {
  fund: FundCode;
}

/**
 * Add-on id → its compact view for the fund-panel drawer (Phase 3 of each add-on).
 * Loaded on demand, so the map page doesn't download an add-on until a chip is opened. Meanwhile the drawer shows a
 * placeholder instead of an empty panel.
 */
export const ADDON_QUICK: Partial<Record<AddonId, ComponentType<QuickProps>>> = {
  "index-vs-fund": dynamic(() => import("./index-vs-fund/IndexVsFundQuick"), { ssr: false, loading: () => <ToolLoading /> }),
  liquidity: dynamic(() => import("./liquidity/LiquidityQuick"), { ssr: false, loading: () => <ToolLoading /> }),
  "reality-check": dynamic(() => import("./reality-check/RealityQuick"), { ssr: false, loading: () => <ToolLoading /> }),
  smoothing: dynamic(() => import("./smoothing/SmoothingQuick"), { ssr: false, loading: () => <ToolLoading /> }),
  "drawdown-vs-evergreen": dynamic(() => import("./drawdown-vs-evergreen/DrawdownQuick"), { ssr: false, loading: () => <ToolLoading /> }),
  themes: dynamic(() => import("./themes/ThemesQuick"), { ssr: false, loading: () => <ToolLoading /> }),
  "tax-lens": dynamic(() => import("./tax-lens/TaxLensQuick"), { ssr: false, loading: () => <ToolLoading /> }),
};
