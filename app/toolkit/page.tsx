import type { Metadata } from "next";
import Link from "next/link";
import { ADDONS, toolkitAddons } from "@/config/addons";
import SiteMark from "@/components/SiteMark";
import ThemeToggle from "@/components/ThemeToggle";
import AddonDisclosure from "@/components/addons/shared/AddonDisclosure";
import ToolkitCards from "@/components/addons/shared/ToolkitCards";

export const metadata: Metadata = {
  title: "Advisor Toolkit",
  description: "Illustrative tools that help explain perpetual private-markets funds. Independent prototype; not affiliated with Blackstone.",
};

export default function ToolkitHome() {
  const list = toolkitAddons(ADDONS);
  return (
    <div className="atlas mx-auto w-full max-w-[1100px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7" style={{ ["--layer-light" as string]: "#4A5568", ["--layer-dark" as string]: "#A0AEC0" }}>
      <header className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-strong">
            <SiteMark />
            <Link href="/demo" className="tap inline-flex items-center whitespace-nowrap underline decoration-line underline-offset-4 hover:text-ink">
              Take the tour
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            {/*
              Future feature: Family Office mode. Today it only reorders the cards below, so its switch is hidden.
              To bring it back, render <AudienceToggle /> (components/addons/shared/Audience.tsx) here; the
              provider in app/toolkit/layout.tsx and the ordering in lib/addons/shared/audience.ts are still in place.
            */}
            <ThemeToggle />
          </div>
        </div>
        <div className="pt-4 sm:pt-8">
          <h1 className="font-serif text-[36px] font-medium leading-[1.05] tracking-[-0.02em] text-ink sm:text-[48px]">Advisor Toolkit</h1>
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
