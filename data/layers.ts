import type { LayerDef } from "@/lib/types";
import breit from "./breit.json";
import bxinfra from "./bxinfra.json";
import bxpe from "./bxpe.json";
import bcred from "./bcred.json";
import retirement from "./retirement.json";
import type { FundData, RetirementData } from "@/lib/types";

/**
 * The list of map layers. Fund data files are generated from SEC filings by scripts/sec/build_data.py.
 * To add a fund: generate its JSON (same shape as the others), import it here, set `data` + status: "active".
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

/** The retirement lens has no holdings to map; its content is illustrative. */
export const RETIREMENT: RetirementData = retirement as RetirementData;
