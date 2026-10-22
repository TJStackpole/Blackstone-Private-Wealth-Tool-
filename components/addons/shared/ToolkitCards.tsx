"use client";

import Link from "next/link";
import type { AddonDef } from "@/config/addons";
import { FUNDS } from "@/lib/addons/shared/funds";
import { orderFor } from "@/lib/addons/shared/audience";
import { useAudience } from "./Audience";
import ToolIcon from "./ToolIcon";

/** Toolkit home cards, led by the client question each tool answers, in the order the current audience mode sets. */
export default function ToolkitCards({ list }: { list: AddonDef[] }) {
  const ordered = orderFor(useAudience(), list);
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ordered.map((a) => (
        <li key={a.id}>
          <Link
            href={`/toolkit/${a.id}`}
            className="group flex h-full flex-col gap-4 rounded-card border border-line bg-bg-raised p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-muted hover:shadow-[0_8px_24px_-12px_rgba(20,22,26,0.18)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-bg text-accent">
                <ToolIcon id={a.id} size={24} />
              </span>
              <span aria-hidden className="text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink motion-reduce:transition-none">
                →
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{a.name}</h2>
              {a.question && <p className="mt-1.5 font-serif text-[22px] leading-tight text-ink">{a.question}</p>}
              <p className="mt-2 text-sm leading-relaxed text-muted-strong">{a.description}</p>
            </div>
            <ul aria-label="Applies to" className="flex flex-wrap gap-x-3 gap-y-1">
              {a.appliesTo.map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: FUNDS[f].color }} />
                  {FUNDS[f].label}
                </li>
              ))}
            </ul>
          </Link>
        </li>
      ))}
    </ul>
  );
}
