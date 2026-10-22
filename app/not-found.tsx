import Link from "next/link";
import SiteMark from "@/components/SiteMark";

/** Any address the site doesn't have (out/404.html on the static host). */
export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-10 text-xs text-muted-strong">
        <SiteMark />
      </nav>
      <h1 className="font-serif text-[28px] font-medium leading-tight tracking-[-0.01em] text-ink sm:text-[32px]">This page doesn&apos;t exist</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-strong">The address may be mistyped, or the page may have moved.</p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link href="/" className="tap inline-flex h-9 items-center rounded-full border border-line bg-bg-raised px-4 text-muted-strong hover:text-ink">
          The map
        </Link>
        <Link href="/toolkit" className="tap inline-flex h-9 items-center rounded-full border border-line bg-bg-raised px-4 text-muted-strong hover:text-ink">
          Advisor Toolkit
        </Link>
        <Link href="/demo" className="tap inline-flex h-9 items-center rounded-full border border-line bg-bg-raised px-4 text-muted-strong hover:text-ink">
          Take the tour
        </Link>
      </div>
    </main>
  );
}
