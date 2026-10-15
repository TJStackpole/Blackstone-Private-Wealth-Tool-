"use client";

import type { LayerDef, ViewId } from "@/lib/types";

interface Props {
  layers: LayerDef[];
  activeId: ViewId;
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

/** Tabs across the top: one per fund layer. Inactive layers show as "Coming soon". */
export default function LayerSwitcher({ layers, activeId, onChange, allFundsAfter }: Props) {
  const tabs: TabDef[] = [];
  for (const l of layers) {
    tabs.push({ id: l.id, label: l.label, sub: l.fund, ready: l.status === "active", light: l.color, dark: l.colorDark });
    if (allFundsAfter === l.id) {
      tabs.push({ id: "all", label: "All funds", sub: "Side by side", ready: true, light: "#14161A", dark: "#ECEAE4" });
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const active = tabs.filter((l) => l.ready);
    const i = active.findIndex((l) => l.id === activeId);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = active[(i + (e.key === "ArrowRight" ? 1 : active.length - 1)) % active.length];
      if (next) onChange(next.id);
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Fund layers"
      onKeyDown={onKeyDown}
      className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0"
    >
      {tabs.map((layer) => {
        const active = layer.id === activeId;
        const ready = layer.ready;
        return (
          <button
            key={layer.id}
            role="tab"
            type="button"
            aria-selected={active}
            aria-disabled={!ready}
            aria-controls={`panel-${layer.id}`}
            tabIndex={active ? 0 : ready ? 0 : -1}
            onClick={() => ready && onChange(layer.id)}
            title={ready ? undefined : `${layer.label} — coming soon`}
            style={{ ["--tab-light" as string]: layer.light, ["--tab-dark" as string]: layer.dark }}
            className={[
              "group relative flex shrink-0 flex-col items-start gap-0.5 rounded-t-md px-3 pb-2.5 pt-2 text-left transition-colors",
              active ? "text-ink" : ready ? "text-muted-strong hover:text-ink" : "cursor-default text-muted",
            ].join(" ")}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <span aria-hidden className={["inline-block h-2 w-2 rounded-full", ready ? "tab-dot" : "bg-line"].join(" ")} />
              {layer.label}
            </span>
            <span className="text-[11px] uppercase tracking-[0.08em] text-muted">
              {ready ? layer.sub : "Coming soon"}
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
  );
}
