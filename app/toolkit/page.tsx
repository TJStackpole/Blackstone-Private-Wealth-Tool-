import type { Metadata } from "next";
import Link from "next/link";
import { ADDONS, enabledAddons } from "@/config/addons";
import ThemeToggle from "@/components/ThemeToggle";
import AddonDisclosure from "@/components/addons/shared/AddonDisclosure";
import { AudienceToggle } from "@/components/addons/shared/Audience";
import ToolkitCards from "@/components/addons/shared/ToolkitCards";

export const metadata: Metadata = {
  title: "Advisor Toolkit · Blackstone Private Market",
  description: "Illustrative tools that help explain perpetual private-markets funds. Independent prototype; not affiliated with Blackstone.",
};

export default function ToolkitHome() {
  const list = enabledAddons(ADDONS);
  return (
    <div className="atlas mx-auto w-full max-w-[1100px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7" style={{ ["--layer-light" as string]: "#4A5568", ["--layer-dark" as string]: "#A0AEC0" }}>
      <header className="mb-8 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-xs text-muted-strong hover:text-ink">
            ← Map
          </Link>
          <div className="flex items-center gap-2">
            <AudienceToggle />
            <ThemeToggle />
          </div>
        </div>
        <div>
          <h1 className="font-serif text-[28px] font-medium leading-tight tracking-[-0.01em] text-ink sm:text-[34px]">Advisor Toolkit</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-strong">
            Tools for explaining how perpetual private-markets funds work: liquidity limits, fees, taxes and valuation. Every output is illustrative and
            shows its sources.
          </p>
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
