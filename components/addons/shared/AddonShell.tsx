import Link from "next/link";
import type { ReactNode } from "react";
import type { FundCode } from "@/config/addons";
import { FUNDS, NEUTRAL_ACCENT } from "@/lib/addons/shared/funds";
import ThemeToggle from "@/components/ThemeToggle";
import AddonBoundary from "./AddonBoundary";
import AddonDisclosure from "./AddonDisclosure";
import { AudienceToggle } from "./Audience";

interface Props {
  addonId: string;
  title: string;
  subtitle?: string;
  /** Tints the page with that fund's accent, like the Atlas does. */
  fundId?: FundCode;
  /** Badges row (SampleBadge, IllustrativeBadge, AsOfSource…). */
  badges?: ReactNode;
  children: ReactNode;
}

/** Standard frame for every add-on page: header, badges, the add-on inside its fuse, then the disclosure. */
export default function AddonShell({ addonId, title, subtitle, fundId, badges, children }: Props) {
  const accent = fundId ? FUNDS[fundId] : NEUTRAL_ACCENT;
  return (
    <div
      className="atlas mx-auto w-full max-w-[1100px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7"
      style={{ ["--layer-light" as string]: accent.color, ["--layer-dark" as string]: accent.colorDark }}
    >
      <header className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted-strong">
            <Link href="/" className="tap inline-flex items-center hover:text-ink">
              ← Map
            </Link>
            <span aria-hidden className="text-muted">/</span>
            <Link href="/toolkit" className="tap inline-flex items-center hover:text-ink">
              Advisor Toolkit
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <AudienceToggle />
            <ThemeToggle />
          </div>
        </div>
        <div>
          <h1 className="font-serif text-[28px] font-medium leading-tight tracking-[-0.01em] text-ink sm:text-[32px]">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-strong">{subtitle}</p>}
        </div>
        {badges && <div className="flex flex-wrap items-center gap-2">{badges}</div>}
      </header>
      <main className="space-y-8">
        <AddonBoundary addonId={addonId}>{children}</AddonBoundary>
        <AddonDisclosure />
      </main>
    </div>
  );
}
