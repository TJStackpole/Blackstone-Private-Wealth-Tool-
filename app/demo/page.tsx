import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import SiteMark from "@/components/SiteMark";
import ThemeToggle from "@/components/ThemeToggle";
import BuiltBy from "@/components/BuiltBy";
import TourPicker from "@/components/demo/Tour";

export const metadata: Metadata = pageMeta({
  title: "Guided tour",
  description: "A six-step tour of the fund maps and the Advisor Toolkit, plus a full tour of every feature. Independent prototype; not affiliated with Blackstone.",
  path: "/demo",
});

export default function DemoPage() {
  return (
    // Wide screens: the tour fills the window, so the live page and the step never scroll away from each other.
    <main className="atlas mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 pb-10 pt-5 sm:px-6 min-[1180px]:h-dvh min-[1180px]:min-h-[640px] min-[1180px]:flex-none min-[1180px]:pb-4 min-[1180px]:pt-4">
      <header className="mb-4 shrink-0">
        <div className="mb-1.5 flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-strong">
            <SiteMark />
          </nav>
          <ThemeToggle />
        </div>
        <h1 className="font-serif text-[28px] font-medium leading-tight tracking-[-0.01em] text-ink">Guided tour</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-strong">
          Each step explains one part of the site, with the real page beside it (below it on a phone). Click around in the page at any point; use
          Next, the arrow keys or Autoplay to move on.
        </p>
      </header>
      <TourPicker />
      <p className="mt-6 shrink-0 border-t border-line pt-3 text-xs text-muted min-[1180px]:mt-3 min-[1180px]:pt-2">
        Illustrative only. Not investment, tax, or legal advice. Independent prototype built from public filings. Not affiliated with or endorsed by
        Blackstone. <BuiltBy />.
      </p>
    </main>
  );
}
