import type { LayerDef } from "@/lib/types";
import breit from "./breit.json";
import bxinfra from "./bxinfra.json";
import bxpe from "./bxpe.json";
import bcred from "./bcred.json";
import retirement from "./retirement.json";
import type { FundData, RetirementData } from "@/lib/types";

/**
 * The list of map layers. To add a fund in a later phase:
 *   1. drop its JSON into /data (same shape as breit.json)
 *   2. import it here and set `data` + status: "active"
 * Nothing else should need to change.
 */
export const LAYERS: LayerDef[] = [
  {
    id: "breit",
    label: "Real Estate",
    fund: "BREIT",
    color: "#1F3A5F",
    colorDark: "#7FA3D1",
    status: "active",
    data: breit as FundData,
  },
  {
    id: "bxinfra",
    label: "Infrastructure",
    fund: "BX Infra",
    color: "#1E6F6A",
    colorDark: "#6FC3BC",
    status: "active",
    data: bxinfra as FundData,
  },
  {
    id: "bxpe",
    label: "Private Equity",
    fund: "BXPE",
    color: "#7A2E2E",
    colorDark: "#D98A8A",
    status: "active",
    data: bxpe as FundData,
  },
  {
    id: "bcred",
    label: "Credit",
    fund: "BCRED",
    color: "#9A6B2F",
    colorDark: "#D9B07A",
    status: "active",
    data: bcred as FundData,
  },
  {
    id: "retirement",
    label: "Retirement",
    fund: "401(k) lens",
    color: "#4A5568",
    colorDark: "#A0AEC0",
    status: "active",
  },
];

export const DEFAULT_LAYER_ID = "breit";

/** Caveat text chosen automatically from locationBasis. */
export const LOCATION_BASIS_NOTE: Record<FundData["locationBasis"], string> = {
  property: "Mapped by where each property or asset is located.",
  headquarters: "Mapped by headquarters — a proxy, not where all operations sit.",
};

/** The retirement lens has no holdings to map; its content is illustrative. */
export const RETIREMENT: RetirementData = retirement as RetirementData;
