import Link from "next/link";
import AddonShell from "@/components/addons/shared/AddonShell";
import ClientScriptCard from "@/components/addons/shared/ClientScriptCard";
import { AsOfSource } from "@/components/addons/shared/Badges";
import { TAGS } from "@/lib/addons/themes/tags";
import BullBear from "./BullBear";
import LookThroughCalc from "./LookThroughCalc";
import PrintOnePager from "@/components/addons/shared/PrintOnePager";
import { ADDON_DISCLOSURE } from "@/components/addons/shared/AddonDisclosure";
import ThemeMatrix from "./ThemeMatrix";

export const THEME_SCRIPT = [
  "Owning four different funds isn't the same as owning four different bets. Some themes, like AI and data centers, run through more than one of them.",
  "Here's how much of each fund sits in each theme, from the sector weights in its own filing.",
  "Adding up what you hold across funds, plus any stocks tied to the same theme, shows how concentrated the whole portfolio really is.",
];

export const IC_THEME = [
  "What is our look-through exposure to AI and data centers across all managers and public holdings?",
  "Would this fund take any theme above our concentration limits?",
  "What are the strongest arguments against our largest theme, and who makes them?",
];

/** Add-on 6: the themes that run across funds, and how much of each fund sits in each. */
export default function ThemesPage() {
  return (
    <AddonShell
      addonId="themes"
      title="Theme Exposure"
      subtitle="Some investment themes run through several funds at once. This shows how much of each fund sits in each theme, using the sector weights in the funds' own filings, so a client holding several funds can see what they add up to."
      badges={<AsOfSource asOf={TAGS.asOf} source={TAGS.source} />}
    >
      <div className="space-y-12">
        <PrintOnePager title="Theme Exposure one-pager">
          <div className="space-y-12 print:space-y-4">
            <div className="hidden print:block">
              <h2 className="font-serif text-xl">Theme Exposure across BREIT, BX Infra, BXPE and BCRED</h2>
              <p className="text-xs">Each cell: the fund&apos;s published share in that theme&apos;s sectors, from its Form 10-Q for the quarter ended June 30, 2026.</p>
            </div>
            <section aria-labelledby="th-matrix-h" className="space-y-4 print:space-y-2">
              <h2 id="th-matrix-h" className="font-serif text-[22px] font-medium leading-tight text-ink print:hidden">
                Each fund, theme by theme
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-strong print:hidden">
                {TAGS.method} On the{" "}
                <Link href="/" className="underline decoration-line underline-offset-2 hover:text-ink">
                  map
                </Link>
                , the Theme row above the sector filter applies a theme to every fund as you switch between them.
              </p>
              <ThemeMatrix />
            </section>
            <section aria-labelledby="th-bb-h" className="space-y-4 print:space-y-2">
              <h2 id="th-bb-h" className="font-serif text-[22px] font-medium leading-tight text-ink print:text-base">
                Case for and case against
              </h2>
              <BullBear />
            </section>
            <p className="hidden border-t pt-2 text-[10px] print:block">
              {ADDON_DISCLOSURE} Independent prototype built from public filings. Not affiliated with or endorsed by Blackstone.
            </p>
          </div>
        </PrintOnePager>
        <section aria-labelledby="th-lt-h" className="space-y-4">
          <h2 id="th-lt-h" className="font-serif text-[22px] font-medium leading-tight text-ink">
            A client&apos;s look-through
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-strong">
            Enter what a client holds in each fund, and any other holdings tied to a theme (a stock, an ETF). The total by theme shows how concentrated the
            whole portfolio is. The example starts with $250,000 in each fund plus $200,000 of Nvidia stock tagged to AI &amp; data centers.
          </p>
          <LookThroughCalc />
        </section>
        <ClientScriptCard points={THEME_SCRIPT} icPoints={IC_THEME} />
      </div>
    </AddonShell>
  );
}
