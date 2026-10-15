import type { Holding } from "./types";

export interface StateSummary {
  state: string;
  totalPct: number;
  metros: Holding[];
  bySector: Record<string, number>;
}

/** Keep only holdings in one sector (null = all sectors). */
export function filterBySector(holdings: Holding[], sector: string | null): Holding[] {
  if (!sector) return holdings;
  return holdings.filter((h) => h.sector === sector);
}

/** Roll metro-level holdings up to one summary per state. */
export function aggregateByState(holdings: Holding[]): Map<string, StateSummary> {
  const map = new Map<string, StateSummary>();
  for (const h of holdings) {
    let s = map.get(h.state);
    if (!s) {
      s = { state: h.state, totalPct: 0, metros: [], bySector: {} };
      map.set(h.state, s);
    }
    s.totalPct += h.weightPct;
    s.metros.push(h);
    s.bySector[h.sector] = (s.bySector[h.sector] ?? 0) + h.weightPct;
  }
  for (const s of map.values()) {
    s.totalPct = round1(s.totalPct);
    s.metros.sort((a, b) => b.weightPct - a.weightPct);
  }
  return map;
}

/** Share of the fund in each sector, sorted largest first. */
export function sectorMix(holdings: Holding[], sectorOrder: string[]): { sector: string; pct: number }[] {
  const totals: Record<string, number> = {};
  for (const h of holdings) totals[h.sector] = (totals[h.sector] ?? 0) + h.weightPct;
  const ordered = sectorOrder.filter((s) => totals[s]).map((s) => ({ sector: s, pct: round1(totals[s]) }));
  // Any sector in the data but missing from the declared list still shows.
  for (const s of Object.keys(totals)) {
    if (!sectorOrder.includes(s)) ordered.push({ sector: s, pct: round1(totals[s]) });
  }
  return ordered.sort((a, b) => b.pct - a.pct);
}

export function topStates(byState: Map<string, StateSummary>, n: number): StateSummary[] {
  return [...byState.values()].sort((a, b) => b.totalPct - a.totalPct).slice(0, n);
}

/** Combine metros that appear more than once in a state (one row per metro). */
export function metroTotals(metros: Holding[]): { metro: string; state: string; lat: number; lng: number; pct: number; sectors: string[]; sample: boolean }[] {
  const map = new Map<string, { metro: string; state: string; lat: number; lng: number; pct: number; sectors: string[]; sample: boolean }>();
  for (const h of metros) {
    const key = `${h.metro}|${h.state}`;
    let m = map.get(key);
    if (!m) {
      m = { metro: h.metro, state: h.state, lat: h.lat, lng: h.lng, pct: 0, sectors: [], sample: false };
      map.set(key, m);
    }
    m.pct += h.weightPct;
    if (!m.sectors.includes(h.sector)) m.sectors.push(h.sector);
    if (h.sample) m.sample = true;
  }
  return [...map.values()].map((m) => ({ ...m, pct: round1(m.pct) })).sort((a, b) => b.pct - a.pct);
}

export function sumPct(holdings: Holding[]): number {
  return round1(holdings.reduce((t, h) => t + h.weightPct, 0));
}

export function hasSampleData(holdings: Holding[]): boolean {
  return holdings.some((h) => h.sample);
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function formatPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}
