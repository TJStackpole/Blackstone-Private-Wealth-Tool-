import type { FundCode } from "@/config/addons";
import type { LayerId } from "@/lib/types";

/** Atlas layer id → add-on fund code. */
export const FUND_CODE: Partial<Record<LayerId, FundCode>> = {
  breit: "BREIT",
  bxinfra: "BXINFRA",
  bxpe: "BXPE",
  bcred: "BCRED",
};

/** Display names and accents, matching the Atlas's per-fund colors (Rule 6). */
export const FUNDS: Record<FundCode, { label: string; assetClass: string; color: string; colorDark: string }> = {
  BREIT: { label: "BREIT", assetClass: "Real Estate", color: "#1F3A5F", colorDark: "#7FA3D1" },
  BXINFRA: { label: "BX Infra", assetClass: "Infrastructure", color: "#1E6F6A", colorDark: "#6FC3BC" },
  BXPE: { label: "BXPE", assetClass: "Private Equity", color: "#7A2E2E", colorDark: "#D98A8A" },
  BCRED: { label: "BCRED", assetClass: "Private Credit", color: "#9A6B2F", colorDark: "#D9B07A" },
};

/** Neutral slate accent for pages that aren't about one fund (same as the Retirement lens). */
export const NEUTRAL_ACCENT = { color: "#4A5568", colorDark: "#A0AEC0" };

export function toFundCode(id: LayerId | FundCode): FundCode | undefined {
  return (FUNDS as Record<string, unknown>)[id] ? (id as FundCode) : FUND_CODE[id as LayerId];
}

/** Add-on fund code → Atlas layer id ("BCRED" → "bcred"), for links back to the map. */
export function toLayerId(code: FundCode): LayerId {
  return (Object.keys(FUND_CODE) as LayerId[]).find((id) => FUND_CODE[id] === code)!;
}
