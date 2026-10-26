"use client";

import { useEffect, useRef } from "react";
import type { LayerDef, ViewId } from "@/lib/types";
import { useEdgeFade } from "./useEdgeFade";

interface Props {
  layers: LayerDef[];
  /** null on the Start screen: no tab is selected, and Tab enters the strip on the first one. */
  activeId: ViewId | null;
  onChange: (id: ViewId) => void;
  /** Where to place the "All funds" tab; omitted = no such tab. */
  allFundsAfter?: ViewId;
}

/** One entry per tab: either a real layer or the synthetic "All funds" view. */
interface TabDef {
  id: ViewId;
  label: string;
  sub: string;
  ready: boolean;
  light: string;
  dark: string;
}

/**
 * Tabs across the top: one per fund layer, plus "All funds".
 * Keyboard: Tab enters the strip on the selected tab; arrow keys, Home and End move between tabs.
 */
export default function LayerSwitcher({
  layers,
  activeId,
  onChange,
  allFundsAfter,
}: Props) {
  const refs = useRef(new Map<ViewId, HTMLButtonElement>());
  const scroller = useRef<HTMLDivElement>(null);
  const keyboardMove = useRef(false);
  useEdgeFade(scroller);

  const tabs: TabDef[] = [];
  for (const l of layers) {
    tabs.push({
      id: l.id,
      label: l.label,
      sub: l.fund,
      ready: l.status === "active",
      light: l.color,
      dark: l.colorDark,
    });
    if (allFundsAfter === l.id) {
      tabs.push({
        id: "all",
        label: "All funds",
        sub: "Side by side",
        ready: true,
        light: "#14161A",
        dark: "#ECEAE4",
      });
    }
  }

  const entry = tabs.some((t) => t.id === activeId) ? activeId : tabs.find((t) => t.ready)?.id;

  // Keep the selected tab visible on narrow screens, and move focus with it after an arrow key.
  // Scrolls only the tab strip (not the page), so the browser's Tab order starting point is untouched.
  useEffect(() => {
    if (!activeId) return;
    const el = refs.current.get(activeId);
    const box = scroller.current;
    if (!el || !box) return;
    const left = el.offsetLeft - box.offsetLeft;
    const right = left + el.offsetWidth;
    if (left < box.scrollLeft) box.scrollTo({ left: Math.max(0, left - 16) });
    else if (right > box.scrollLeft + box.clientWidth)
      box.scrollTo({ left: right - box.clientWidth + 40 });
    if (keyboardMove.current) {
      el.focus({ preventScroll: true });
      keyboardMove.current = false;
    }
  }, [activeId]);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const ready = tabs.filter((t) => t.ready);
    const i = ready.findIndex((t) => t.id === activeId);
    let next: TabDef | undefined;
    if (e.key === "ArrowRight") next = ready[(i + 1) % ready.length];
    else if (e.key === "ArrowLeft")
      next = ready[i < 0 ? ready.length - 1 : (i - 1 + ready.length) % ready.length];
    else if (e.key === "Home") next = ready[0];
    else if (e.key === "End") next = ready[ready.length - 1];
    if (!next) return;
    e.preventDefault();
    keyboardMove.current = true;
    onChange(next.id);
  }

  return (
    <div className="tab-strip relative -mx-4 sm:mx-0">
      {/* Phones: a 3 × 2 grid, so no tab is cut off. Wider screens: one row that scrolls if it must. */}
      <div
        ref={scroller}
        className="edge-fade sm:overflow-x-auto sm:[scrollbar-width:none] sm:[&::-webkit-scrollbar]:hidden"
      >
        <div
          role="tablist"
          aria-label="Fund layers"
          onKeyDown={onKeyDown}
          className="grid grid-cols-3 gap-1 px-4 pb-1 sm:flex sm:w-max sm:px-0 sm:pb-0"
        >
          {tabs.map((tab) => {
            const active = tab.id === activeId;
            const ready = tab.ready;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  if (el) refs.current.set(tab.id, el);
                  else refs.current.delete(tab.id);
                }}
                id={`tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={active}
                aria-disabled={!ready || undefined}
                aria-controls={active ? `panel-${tab.id}` : undefined}
                tabIndex={tab.id === entry ? 0 : -1}
                onClick={() => ready && onChange(tab.id)}
                title={ready ? undefined : `${tab.label}: coming soon`}
                style={{
                  ["--tab-light" as string]: tab.light,
                  ["--tab-dark" as string]: tab.dark,
                }}
                className={[
                  "group relative flex min-w-0 shrink-0 flex-col items-start gap-0.5 rounded-md px-2 pb-2 pt-1.5 text-left transition-colors sm:rounded-b-none sm:rounded-t-md sm:px-3 sm:pb-2.5 sm:pt-2",
                  active
                    ? "bg-bg-raised text-ink sm:bg-transparent"
                    : ready
                      ? "text-muted-strong hover:text-ink"
                      : "cursor-default text-muted",
                ].join(" ")}
              >
                <span className="flex min-w-0 max-w-full items-center gap-1.5 whitespace-nowrap text-[13px] font-medium sm:gap-2 sm:text-sm">
                  <span
                    aria-hidden
                    className={[
                      "inline-block h-2 w-2 shrink-0 rounded-full",
                      ready ? "tab-dot" : "bg-line",
                    ].join(" ")}
                  />
                  {/* Phones lead with the short name (BREIT, BX Infra…); wider screens with the asset class. */}
                  <span className="truncate sm:hidden">{tab.id === "all" ? tab.label : tab.sub}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
                <span className="max-w-full truncate whitespace-nowrap text-[11px] text-muted sm:hidden">
                  {tab.id === "all" ? tab.sub : tab.label}
                </span>
                <span className="hidden whitespace-nowrap text-[11px] uppercase tracking-[0.08em] text-muted sm:inline">
                  {ready ? tab.sub : "Coming soon"}
                </span>
                <span
                  aria-hidden
                  className={[
                    "tab-dot absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
