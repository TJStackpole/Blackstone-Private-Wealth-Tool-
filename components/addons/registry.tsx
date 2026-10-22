import type { ComponentType } from "react";
import type { AddonId } from "@/config/addons";
import IndexVsFundPage from "./index-vs-fund/IndexVsFundPage";
import LiquidityPage from "./liquidity/LiquidityPage";
import TaxLensPage from "./tax-lens/TaxLensPage";

/**
 * Add-on id → its full-page screen. Each add-on registers here when its Phase 1 is built,
 * e.g. `liquidity: LiquidityPage` imported from components/addons/liquidity/.
 */
export const ADDON_PAGES: Partial<Record<AddonId, ComponentType>> = {
  liquidity: LiquidityPage,
  "index-vs-fund": IndexVsFundPage,
  "tax-lens": TaxLensPage,
};
