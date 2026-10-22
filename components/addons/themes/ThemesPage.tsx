import Link from "next/link";
import AddonShell from "@/components/addons/shared/AddonShell";
import { AsOfSource } from "@/components/addons/shared/Badges";
import { FUND_DATA, TAGS, findTheme, themeWeight } from "@/lib/addons/themes/tags";
import type { FundCode } from "@/config/addons";
import { formatPct } from "@/lib/aggregate";
import { formatDate } from "@/lib/dates";
import BullBear from "./BullBear";
import LookThroughCalc from "./LookThroughCalc";
import PrintOnePager from "@/components/addons/shared/PrintOnePager";
import { ADDON_DISCLOSURE } from "@/components/addons/shared/AddonDisclosure";
import ThemeMatrix from "./ThemeMatrix";



/** A headline tile: one fund's share in one theme, from its own 10-Q. */
function tile(fund: FundCode, themeId: string, label: string) {
  return { value: formatPct(Math.round(themeWeight(findTheme(themeId)!, fund) * 10) / 10), label, source: FUND_DATA[fund].source };
}

/** Add-on 6: the themes that run across funds, and how much of each fund sits in each. */
export default function ThemesPage() {
  return (
    <AddonShell
      addonId="themes"
      title="Theme Exposure"
      subtitle="Themes like AI run through several funds at once. See each fund's share, and a client's total."
      glance={[
        tile("BREIT", "ai-data-centers", "of BREIT in data centers"),
        tile("BXINFRA", "ai-data-centers", "of BX Infra in digital infrastructure"),
        tile("BCRED", "software-tech", "of BCRED in software and IT services"),
      ]}
      badges={<AsOfSource asOf={TAGS.asOf} source={TAGS.source} />}
    >
      <div className="space-y-12">
        <PrintOnePager title="Theme Exposure one-pager">
          <div className="space-y-12 print:space-y-4">
            <div className="hidden print:block">
              <h2 className="font-serif text-xl">Theme Exposure across BREIT, BX Infra, BXPE and BCRED</h2>
              <p className="text-xs">Each cell: the fund&apos;s published share in that theme&apos;s sectors, from its Form 10-Q for the quarter ended {formatDate(TAGS.asOf, "long")}.</p>
            </div>
            <section aria-labelledby="th-matrix-h" className="space-y-4 print:space-y-2">
              <h2 id="th-matrix-h" className="font-serif text-[22px] font-medium leading-tight text-ink print:hidden">
                Each fund, theme by theme
              </h2>
              <p className="max-w-3xl text-sm text-muted-strong print:hidden">
                From the sector weights in each fund&apos;s filing. The{" "}
                <Link href="/?view=breit&theme=ai-data-centers" className="underline decoration-line underline-offset-2 hover:text-ink">
                  Theme row on the map
                </Link>{" "}
                shows the same thing, fund by fund.
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
            Your look-through
          </h2>
          <p className="max-w-3xl text-sm text-muted-strong">
            Enter what you hold in each fund, plus any stocks tied to a theme. The example: $250,000 in each fund and $200,000 of Nvidia stock.
          </p>
          <LookThroughCalc />
        </section>
      </div>
    </AddonShell>
  );
}
