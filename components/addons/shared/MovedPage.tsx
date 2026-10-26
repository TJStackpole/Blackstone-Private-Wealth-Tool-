"use client";

import Link from "next/link";
import { useEffect } from "react";
import SiteMark from "@/components/SiteMark";

/**
 * An old tool's address: it's now part of another page. Forwards there, keeping a tool page's ?fund= so an old link
 * still opens the same fund, with a link in case scripts are off.
 */
export default function MovedPage({ name, to, toName }: { name: string; to: string; toName: string }) {
  useEffect(() => {
    const fund = new URLSearchParams(window.location.search).get("fund");
    const [path, hash] = to.split("#");
    window.location.replace(fund && path.startsWith("/toolkit/") ? `${path}?fund=${encodeURIComponent(fund)}${hash ? `#${hash}` : ""}` : to);
  }, [to]);
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-8 text-xs text-muted-strong">
        <SiteMark />
      </nav>
      <h1 className="font-serif text-[28px] font-medium leading-tight text-ink">{name} has moved</h1>
      <p className="mt-2 text-sm text-muted-strong">It&apos;s now part of {toName}.</p>
      <Link href={to} className="tap mt-6 inline-flex h-9 items-center rounded-full border border-line bg-bg-raised px-4 text-sm font-medium text-ink hover:border-muted">
        Go to {toName} →
      </Link>
    </div>
  );
}
