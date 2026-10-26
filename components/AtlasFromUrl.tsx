"use client";

import { useEffect, useSyncExternalStore } from "react";
import { LAYERS } from "@/data/layers";
import type { ViewId } from "@/lib/types";
import { NCREIF_REGION } from "@/lib/regions";
import Atlas, { type AtlasStart } from "./Atlas";

const noop = () => () => {};

/**
 * Reads a starting view from the address, e.g. /?view=bcred&sector=Software&select=US&theme=ai-data-centers,
 * so links (and the guided tour) can open the map at a specific spot. Anything unknown is ignored.
 */
export function parseStart(search: string): AtlasStart | undefined {
  const p = new URLSearchParams(search);
  const view = p.get("view")?.toLowerCase();
  const layer = LAYERS.find((l) => l.id === view);
  if (!view || !(layer || view === "all")) return undefined;
  const start: AtlasStart = { view: view as ViewId };
  const data = layer?.data;
  if (data) {
    const sector = p.get("sector");
    if (sector && data.sectors.some((s) => s.key === sector)) start.sector = sector;
    const select = p.get("select");
    if (select && (data.geography.level === "us-region" ? Object.hasOwn(NCREIF_REGION, select) : data.geography.items.some((i) => i.key === select))) start.select = select;
    const theme = p.get("theme");
    if (theme) start.theme = theme;
  }
  return start;
}

export default function AtlasFromUrl() {
  // Empty on the server and while hydrating; the real address after. A new address remounts the map at that spot.
  const search = useSyncExternalStore(noop, () => window.location.search, () => "");
  // The map is showing the address's view now: lift the layout's "hide until switched" flag.
  useEffect(() => {
    if (search) document.documentElement.removeAttribute("data-deeplink");
  }, [search]);
  return <Atlas key={search} start={parseStart(search)} />;
}
