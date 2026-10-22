import type { Metadata } from "next";
import Link from "next/link";
import { ADDONS, toolkitAddons } from "@/config/addons";
import ThemeToggle from "@/components/ThemeToggle";
import AddonDisclosure from "@/components/addons/shared/AddonDisclosure";
import { AudienceToggle } from "@/components/addons/shared/Audience";
import ToolkitCards from "@/components/addons/shared/ToolkitCards";

export const metadata: Metadata = {
  title: "Advisor Toolkit · Private Markets Atlas",
  description: "Illustrative tools that help explain perpetual private-markets funds. Independent prototype; not affiliated with Blackstone.",
};

export default function ToolkitHome() {
  const list = toolkitAddons(ADDONS);
  return (
    <div className="atlas mx-auto w-full max-w-[1100px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7" style={{ ["--layer-light" as string]: "#4A5568", ["--layer-dark" as string]: "#A0AEC0" }}>
      <header className="mb-8 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-3 text-xs text-muted-strong">
            <Link href="/" className="tap inline-flex items-center hover:text-ink">
              ← Map
            </Link>
            <Link href="/demo" className="tap inline-flex items-center underline decoration-line underline-offset-4 hover:text-ink">
              Take the tour
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <AudienceToggle />
            <ThemeToggle />
          </div>
        </div>
        <div className="pt-4 sm:pt-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Evergreen private markets</p>
          <h1 className="mt-2 font-serif text-[36px] font-medium leading-[1.05] tracking-[-0.02em] text-ink sm:text-[48px]">Advisor Toolkit</h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-strong">Clear, sourced answers to the questions clients ask, ready to share.</p>
        </div>
      </header>

      <main className="space-y-10">
        {list.length === 0 ? (
          <section className="rounded-card border border-dashed border-line bg-bg-raised px-6 py-12 text-center">
            <h2 className="font-serif text-xl font-medium text-ink">Advisor tools coming soon</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-strong">
              Each tool will appear here as it&apos;s built, and as a button in the matching fund&apos;s panel on the map.
            </p>
          </section>
        ) : (
          <ToolkitCards list={list} />
        )}
        <AddonDisclosure />
      </main>
    </div>
  );
}
