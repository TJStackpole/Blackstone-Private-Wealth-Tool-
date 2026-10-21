import type { Metadata } from "next";
import Link from "next/link";
import { ADDONS, enabledAddons } from "@/config/addons";
import { FUNDS } from "@/lib/addons/shared/funds";
import ThemeToggle from "@/components/ThemeToggle";
import AddonDisclosure from "@/components/addons/shared/AddonDisclosure";

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
          <ThemeToggle />
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
          <ul className="grid gap-4 sm:grid-cols-2">
            {list.map((a) => (
              <li key={a.id}>
                <Link href={`/toolkit/${a.id}`} className="group block h-full rounded-card border border-line bg-bg-raised p-5 hover:border-muted">
                  <h2 className="font-serif text-lg font-medium text-ink group-hover:text-accent">{a.name}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-strong">{a.description}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.08em] text-muted">{a.appliesTo.map((f) => FUNDS[f].label).join(" · ")}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <AddonDisclosure />
      </main>
    </div>
  );
}
