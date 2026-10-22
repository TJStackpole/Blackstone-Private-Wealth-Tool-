import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import Tour from "@/components/demo/Tour";

export const metadata: Metadata = {
  title: "Guided tour · Private Markets Atlas",
  description: "A step-by-step tour of every feature: the fund maps, the Advisor Toolkit and how the data is sourced. Independent prototype; not affiliated with Blackstone.",
};

export default function DemoPage() {
  return (
    <main className="atlas mx-auto w-full max-w-[1500px] flex-1 px-4 pb-12 pt-5 sm:px-6 lg:pt-6">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted-strong">
            <Link href="/" className="tap inline-flex items-center hover:text-ink">
              ← Map
            </Link>
          </nav>
          <h1 className="font-serif text-[28px] font-medium leading-tight tracking-[-0.01em] text-ink sm:text-[32px]">Guided tour</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-strong">
            Everything the site does, one step at a time. The right side is the real site, live: click around in it at any point. Use Next, the arrow keys,
            or Autoplay.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <Tour />
      <p className="mt-8 border-t border-line pt-4 text-xs text-muted">
        Illustrative only. Not investment, tax, or legal advice. Independent prototype built from public filings. Not affiliated with or endorsed by
        Blackstone.
      </p>
    </main>
  );
}
