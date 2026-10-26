import type { ComponentType } from "react";
import type { AddonId } from "@/config/addons";
import LiquidityPage from "./liquidity/LiquidityPage";
import RealityCheckPage from "./reality-check/RealityCheckPage";
import SmoothingPage from "./smoothing/SmoothingPage";
import TaxLensPage from "./tax-lens/TaxLensPage";
import RetirementPointer from "./retirement-plus/RetirementPointer";

/**
 * Add-on id → its full-page screen. The merged ones (Index-to-Fund, Drawdown vs. Evergreen) and the map's theme row
 * have no page of their own; their old addresses forward (see app/toolkit/[addonId]/page.tsx).
 */
export const ADDON_PAGES: Partial<Record<AddonId, ComponentType>> = {
  liquidity: LiquidityPage,
  "tax-lens": TaxLensPage,
  smoothing: SmoothingPage,
  "reality-check": RealityCheckPage,
  "retirement-plus": RetirementPointer,
};
