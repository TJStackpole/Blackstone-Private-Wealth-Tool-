import Link from "next/link";
import AddonShell from "@/components/addons/shared/AddonShell";
import ClientScriptCard from "@/components/addons/shared/ClientScriptCard";
import { AsOfSource } from "@/components/addons/shared/Badges";
import { TAGS } from "@/lib/addons/themes/tags";
import LookThroughCalc from "./LookThroughCalc";
import ThemeMatrix from "./ThemeMatrix";

export const THEME_SCRIPT = [
  "Owning four different funds isn't the same as owning four different bets. Some themes, like AI and data centers, run through more than one of them.",
  "Here's how much of each fund sits in each theme, from the sector weights in its own filing.",
  "Adding up what you hold across funds, plus any stocks tied to the same theme, shows how concentrated the whole portfolio really is.",
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
        <section aria-labelledby="th-matrix-h" className="space-y-4">
          <h2 id="th-matrix-h" className="font-serif text-[22px] font-medium leading-tight text-ink">
            Each fund, theme by theme
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-strong">
            {TAGS.method} On the{" "}
            <Link href="/" className="underline decoration-line underline-offset-2 hover:text-ink">
              map
            </Link>
            , the Theme row above the sector filter applies a theme to every fund as you switch between them.
          </p>
          <ThemeMatrix />
        </section>
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
        <ClientScriptCard points={THEME_SCRIPT} />
      </div>
    </AddonShell>
  );
}
