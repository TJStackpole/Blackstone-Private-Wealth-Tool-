"use client";

import type { LayerDef, LayerId } from "@/lib/types";

interface Props {
  layers: LayerDef[];
  activeId: LayerId;
  onChange: (id: LayerId) => void;
}

/** Tabs across the top: one per fund layer. Inactive layers show as "Coming soon". */
export default function LayerSwitcher({ layers, activeId, onChange }: Props) {
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const active = layers.filter((l) => l.status === "active");
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
      {layers.map((layer) => {
        const active = layer.id === activeId;
        const ready = layer.status === "active";
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
            style={active ? { ["--tab-accent" as string]: "var(--accent)" } : undefined}
            className={[
              "group relative flex shrink-0 flex-col items-start gap-0.5 rounded-t-md px-3 pb-2.5 pt-2 text-left transition-colors",
              active ? "text-ink" : ready ? "text-muted-strong hover:text-ink" : "cursor-default text-muted",
            ].join(" ")}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: ready ? "var(--accent)" : "var(--border)" }}
              />
              {layer.label}
            </span>
            <span className="text-[11px] uppercase tracking-[0.08em] text-muted">
              {ready ? layer.fund : "Coming soon"}
            </span>
            <span
              aria-hidden
              className={[
                "absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-opacity",
                active ? "opacity-100" : "opacity-0",
              ].join(" ")}
              style={{ background: "var(--accent)" }}
            />
          </button>
        );
      })}
    </div>
  );
}
