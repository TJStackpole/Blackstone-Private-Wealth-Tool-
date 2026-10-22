"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Audience } from "@/lib/addons/shared/audience";

const Ctx = createContext<{ audience: Audience; setAudience: (a: Audience) => void } | null>(null);

/** Holds Standard / Family Office mode for the toolkit pages, in page memory only (nothing is stored). */
export function AudienceProvider({ children }: { children: ReactNode }) {
  const [audience, setAudience] = useState<Audience>("advisor");
  return <Ctx.Provider value={{ audience, setAudience }}>{children}</Ctx.Provider>;
}

/** Outside the toolkit (for example, a drawer on the map) this is always Advisor. */
export function useAudience(): Audience {
  return useContext(Ctx)?.audience ?? "advisor";
}

export function AudienceToggle() {
  const ctx = useContext(Ctx);
  if (!ctx) return null;
  const opts: { id: Audience; label: string }[] = [
    { id: "advisor", label: "Standard" },
    { id: "family-office", label: "Family Office" },
  ];
  return (
    <div role="group" aria-label="Audience" className="tap no-print inline-flex h-9 items-center rounded-full border border-line bg-bg-raised p-0.5">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={ctx.audience === o.id}
          onClick={() => ctx.setAudience(o.id)}
          className={[
            "tap-sm h-8 whitespace-nowrap rounded-full px-2.5 text-xs font-medium transition-colors sm:px-3",
            ctx.audience === o.id ? "bg-accent text-accent-contrast" : "text-muted-strong hover:text-ink",
          ].join(" ")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
