import { geoCentroid } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, Geometry } from "geojson";
import worldTopo from "world-atlas/countries-110m.json";

/**
 * NCREIF regions, which BREIT's 10-Q uses for "Region Concentration".
 * South + West match the "Sunbelt" states shaded on the filing's own map (BREIT 10-Q, Jun 30 2026, image g5).
 */
export const NCREIF_REGION: Record<string, "West" | "South" | "Midwest" | "East"> = {
  // West: Mountain + Pacific
  AK: "West", AZ: "West", CA: "West", CO: "West", HI: "West", ID: "West", MT: "West", NV: "West", NM: "West",
  OR: "West", UT: "West", WA: "West", WY: "West",
  // South: Southeast + Southwest
  AL: "South", AR: "South", FL: "South", GA: "South", LA: "South", MS: "South", OK: "South", TN: "South", TX: "South",
  // Midwest: East North Central + West North Central
  IA: "Midwest", IL: "Midwest", IN: "Midwest", KS: "Midwest", MI: "Midwest", MN: "Midwest", MO: "Midwest",
  ND: "Midwest", NE: "Midwest", OH: "Midwest", SD: "Midwest", WI: "Midwest",
  // East: Northeast + Mideast
  CT: "East", DC: "East", DE: "East", KY: "East", MA: "East", MD: "East", ME: "East", NC: "East", NH: "East",
  NJ: "East", NY: "East", PA: "East", RI: "East", SC: "East", VA: "East", VT: "East", WV: "East",
};

export type WorldRegion = "Americas" | "EMEA" | "APAC";

export interface CountryShape {
  id: string;
  name: string;
  feature: Feature<Geometry, { name: string }>;
  /** Americas / EMEA / APAC, the split BX Infra and BXPE report. */
  region: WorldRegion;
  /** BCRED's country groups, where this country belongs to one. */
  bcredGroup?: "US" | "Europe" | "Canada" | "AusNZ" | "Asia";
}

const topo = worldTopo as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
const ANTARCTICA = "010";
const RUSSIA = "643";
/** Countries north of 35°N in the EMEA band that are not European. */
const NOT_EUROPE = new Set(["792" /* Turkey */, "760" /* Syria */, "268" /* Georgia */]);

/**
 * Assign each country to a reporting region by where its centroid sits.
 * West of 25°W is the Americas; east of 60°E is Asia-Pacific (including Australia and New Zealand);
 * everything between is Europe, the Middle East and Africa. Russia is counted as EMEA.
 */
function classify(id: string, lon: number): WorldRegion {
  if (id === RUSSIA) return "EMEA";
  if (lon < -25) return "Americas";
  if (lon > 60) return "APAC";
  return "EMEA";
}

function bcredGroup(id: string, region: WorldRegion, lon: number, lat: number): CountryShape["bcredGroup"] {
  if (id === "840") return "US";
  if (id === "124") return "Canada";
  if (id === "036" || id === "554") return "AusNZ";
  if (region === "EMEA" && !NOT_EUROPE.has(id) && lat > 35 && lon > -25 && lon < 45) return "Europe";
  if (region === "APAC") return "Asia";
  return undefined;
}

export const COUNTRIES: CountryShape[] = feature(topo, topo.objects.countries)
  .features.filter((f) => f.id !== ANTARCTICA)
  .map((f) => {
    const id = String(f.id);
    const [lon, lat] = geoCentroid(f);
    const region = classify(id, lon);
    return { id, name: f.properties.name, feature: f as Feature<Geometry, { name: string }>, region, bcredGroup: bcredGroup(id, region, lon, lat) };
  });

/** The map key a country belongs to, for a given level of reporting. */
export function countryKey(c: CountryShape, level: "world-region" | "country-group"): string | undefined {
  return level === "world-region" ? c.region : c.bcredGroup;
}
