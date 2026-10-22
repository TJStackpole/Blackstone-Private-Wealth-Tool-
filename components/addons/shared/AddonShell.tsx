import Link from "next/link";
import type { ReactNode } from "react";
import type { FundCode } from "@/config/addons";
import { FUNDS, NEUTRAL_ACCENT } from "@/lib/addons/shared/funds";
import ThemeToggle from "@/components/ThemeToggle";
import AddonBoundary from "./AddonBoundary";
import AddonDisclosure from "./AddonDisclosure";
import ToolIcon from "./ToolIcon";
import type { AddonId } from "@/config/addons";
import { AudienceToggle } from "./Audience";

interface Props {
  addonId: string;
  title: string;
  subtitle?: string;
  /** Tints the page with that fund's accent, like the Atlas does. */
  fundId?: FundCode;
  /** Badges row (SampleBadge, IllustrativeBadge, AsOfSource…). */
  badges?: ReactNode;
  /** Up to three key figures shown as tiles under the title. Each must come from the tool's sourced data. */
  glance?: { value: string; label: string }[];
  children: ReactNode;
}

/** Standard frame for every add-on page: header, badges, the add-on inside its fuse, then the disclosure. */
export default function AddonShell({ addonId, title, subtitle, fundId, badges, glance, children }: Props) {
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
        <div className="flex items-start gap-4">
          <span className="mt-1 hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-bg-raised text-accent sm:inline-flex">
            <ToolIcon id={addonId as AddonId} size={28} />
          </span>
          <div className="min-w-0">
            <h1 className="font-serif text-[28px] font-medium leading-tight tracking-[-0.01em] text-ink sm:text-[32px]">{title}</h1>
            {subtitle && <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-strong">{subtitle}</p>}
          </div>
        </div>
        {glance && glance.length > 0 && (
          <dl className="grid gap-3 sm:grid-cols-3">
            {glance.map((g) => (
              <div key={g.label} className="flex flex-col gap-2 rounded-card border border-line bg-bg-raised p-4">
                <dt className="order-2 text-xs leading-snug text-muted-strong">{g.label}</dt>
                <dd className="tnum order-1 font-serif text-[26px] leading-none text-ink">{g.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {badges && <div className="flex flex-wrap items-center gap-2">{badges}</div>}
      </header>
      <main className="space-y-8">
        <AddonBoundary addonId={addonId}>{children}</AddonBoundary>
        <AddonDisclosure />
      </main>
    </div>
  );
}
