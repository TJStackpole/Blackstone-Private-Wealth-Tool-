"use client";

import Link from "next/link";
import type { AddonDef } from "@/config/addons";
import { FUNDS } from "@/lib/addons/shared/funds";
import { orderFor } from "@/lib/addons/shared/audience";
import { useAudience } from "./Audience";

/** Toolkit home cards, in the order the current audience mode sets. */
export default function ToolkitCards({ list }: { list: AddonDef[] }) {
  const ordered = orderFor(useAudience(), list);
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {ordered.map((a) => (
        <li key={a.id}>
          <Link href={`/toolkit/${a.id}`} className="group block h-full rounded-card border border-line bg-bg-raised p-5 hover:border-muted">
            <h2 className="font-serif text-lg font-medium text-ink group-hover:text-accent">{a.name}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-strong">{a.description}</p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.08em] text-muted">{a.appliesTo.map((f) => FUNDS[f].label).join(" · ")}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
