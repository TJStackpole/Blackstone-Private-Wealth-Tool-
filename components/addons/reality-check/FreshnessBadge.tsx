"use client";

import { useSyncExternalStore } from "react";
import { freshness } from "@/lib/addons/reality-check/freshness";

const noop = () => () => {};
const STYLE = {
  fresh: "border-line bg-bg text-ink",
  aging: "border-sample-border bg-sample-bg text-sample",
  stale: "border-line bg-bg text-muted",
} as const;
const DOT = { fresh: "bg-accent", aging: "bg-sample", stale: "bg-muted" } as const;

/** How old a snapshot is, measured in the viewer's browser today. Renders nothing until then, so the static page never shows a build-day age. */
export default function FreshnessBadge({ asOf }: { asOf: string }) {
  const today = useSyncExternalStore(noop, () => new Date().toISOString().slice(0, 10), () => null);
  if (!today) return null;
  const f = freshness(asOf, new Date(`${today}T12:00:00Z`));
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLE[f.level]}`}
      title={`Data as of ${asOf}, ${f.days} days ago. Quarterly reports arrive about 45 days after each quarter ends (90 for the annual report).`}
      data-freshness={f.level}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${DOT[f.level]}`} />
      {f.label}
    </span>
  );
}
