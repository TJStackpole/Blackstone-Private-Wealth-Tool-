"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ADDONS, addonsForFund, type AddonDef, type FundCode } from "@/config/addons";
import type { LayerId } from "@/lib/types";
import { toFundCode } from "@/lib/addons/shared/funds";
import { ADDON_QUICK } from "../quick";
import AddonBoundary from "./AddonBoundary";
import AddonDrawer from "./AddonDrawer";

interface Props {
  fundId: LayerId | FundCode;
  /** Injectable for tests; defaults to the registry. */
  addons?: AddonDef[];
}

const chip = "inline-flex h-8 items-center rounded-full border border-line bg-bg-raised px-3 text-xs font-medium text-muted-strong hover:border-muted hover:text-ink";

/**
 * Doorway B: small buttons in a fund's side panel for each enabled add-on that applies to that fund.
 * Once an add-on reaches Phase 3 its chip opens a drawer with a compact view; before that it links to the full page.
 * Renders nothing at all when there are none, so the panel looks exactly as before.
 */
export default function AddonChips({ fundId, addons = ADDONS }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  // The last opened add-on stays rendered while the drawer slides closed.
  const [shownId, setShownId] = useState<string | null>(null);
  const close = useCallback(() => setOpenId(null), []);
  const code = toFundCode(fundId);
  const list = code ? addonsForFund(code, addons) : [];
  if (!code || list.length === 0) return null;
  const opened = list.find((a) => a.id === shownId);
  const Quick = opened ? ADDON_QUICK[opened.id] : undefined;
  return (
    <AddonBoundary addonId="chips">
      <nav aria-label="Advisor tools for this fund" className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">Advisor tools</p>
        <ul className="flex flex-wrap gap-2">
          {list.map((a) => (
            <li key={a.id}>
              {a.phase >= 3 && ADDON_QUICK[a.id] ? (
                <button type="button" className={chip} aria-haspopup="dialog" onClick={() => {
                    setOpenId(a.id);
                    setShownId(a.id);
                  }}>
                  {a.shortName}
                </button>
              ) : (
                <Link href={`/toolkit/${a.id}?fund=${code}`} className={chip}>
                  {a.shortName}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <AddonDrawer open={!!openId && !!opened} onClose={close} addonId={opened?.id ?? "drawer"} title={opened?.name ?? ""} fullHref={opened ? `/toolkit/${opened.id}?fund=${code}` : "/toolkit"} fundId={code}>
        {Quick && <Quick fund={code} />}
      </AddonDrawer>
    </AddonBoundary>
  );
}
