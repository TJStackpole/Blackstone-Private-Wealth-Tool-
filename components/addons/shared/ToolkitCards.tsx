"use client";

import Link from "next/link";
import type { AddonDef } from "@/config/addons";
import { FUNDS } from "@/lib/addons/shared/funds";
import { orderFor } from "@/lib/addons/shared/audience";
import { useAudience } from "./Audience";
import ToolIcon from "./ToolIcon";

/** Toolkit home cards, in the order the current audience mode sets. */
export default function ToolkitCards({ list }: { list: AddonDef[] }) {
  const ordered = orderFor(useAudience(), list);
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {ordered.map((a) => (
        <li key={a.id}>
          <Link href={`/toolkit/${a.id}`} className="group flex h-full gap-4 rounded-card border border-line bg-bg-raised p-4 hover:border-muted sm:p-5">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-bg text-accent">
              <ToolIcon id={a.id} size={26} />
            </span>
            <div className="min-w-0">
              <h2 className="font-serif text-lg font-medium leading-snug text-ink group-hover:text-accent">{a.name}</h2>
              <span className="mt-1 block text-sm leading-relaxed text-muted-strong">{a.description}</span>
              <span className="mt-2 block text-[11px] uppercase tracking-[0.08em] text-muted">{a.appliesTo.map((f) => FUNDS[f].label).join(" · ")}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
