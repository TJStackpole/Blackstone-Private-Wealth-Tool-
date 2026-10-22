import Link from "next/link";

export const SITE_NAME = "Private Markets Atlas";
export const SITE_TAGLINE = "Independent, built from public SEC filings.";

/** The site's name as a link home, top left on every page that isn't the map itself. */
export default function SiteMark() {
  return (
    <Link href="/" className="tap inline-flex items-center whitespace-nowrap font-serif text-[15px] font-medium tracking-[-0.005em] text-ink hover:text-accent">
      {SITE_NAME}
    </Link>
  );
}
