import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";
import { ALL_ADDON_IDS, findAddon, type AddonId } from "@/config/addons";
import { ADDON_PAGES } from "@/components/addons/registry";

/** Static export: build a page for every planned add-on; switched-off or unbuilt ones render "not found". */
export function generateStaticParams() {
  return ALL_ADDON_IDS.map((addonId) => ({ addonId }));
}
export const dynamicParams = false;

type Params = { params: Promise<{ addonId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { addonId } = await params;
  const addon = findAddon(addonId);
  if (!addon) return { title: "Advisor Toolkit" };
  return pageMeta({ title: addon.name, description: `${addon.description} Independent prototype built from SEC filings; not affiliated with Blackstone.`, path: `/toolkit/${addonId}` });
}

export default async function AddonPage({ params }: Params) {
  const { addonId } = await params;
  const addon = findAddon(addonId);
  const Screen = ADDON_PAGES[addonId as AddonId];
  if (!addon || !Screen) notFound();
  return <Screen />;
}
