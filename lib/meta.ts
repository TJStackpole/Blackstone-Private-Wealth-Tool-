import type { Metadata } from "next";
import { SITE_NAME } from "@/components/SiteMark";

/** The live address. Link previews need absolute image URLs, so every page's card points here. */
export const SITE_URL = "https://private-markets-atlas.netlify.app";

/** 1200×630 preview image in the site's style (public/og.png; made by scripts/og-image.mjs). */
export const OG_IMAGE = { url: "/og.png", width: 1200, height: 630, alt: `${SITE_NAME}: built from SEC filings` };

/** A page's title, description and link-preview card (Open Graph for LinkedIn, texts and email; Twitter/X). */
export function pageMeta({ title, description, path }: { title?: string; description: string; path: string }): Metadata {
  const full = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", title: full, description, url: path, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: full, description, images: [OG_IMAGE.url] },
  };
}
