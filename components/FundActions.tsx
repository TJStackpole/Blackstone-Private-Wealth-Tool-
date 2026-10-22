"use client";

import { useEffect, useId, useState } from "react";
import type { FundData, LayerId } from "@/lib/types";
import { talkingPoints, talkingPointsText } from "@/lib/talkingPoints";
import { formatDate } from "@/lib/dates";
import { PrintButton } from "@/components/addons/shared/PrintOnePager";

const btn =
  "tap no-print inline-flex h-8 items-center whitespace-nowrap rounded-full border border-line bg-bg-raised px-3 text-xs font-medium text-muted-strong hover:border-muted hover:text-ink";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and some embedded views: copy through a hidden text box.
    const t = document.createElement("textarea");
    t.value = text;
    t.setAttribute("readonly", "");
    t.style.position = "fixed";
    t.style.opacity = "0";
    document.body.appendChild(t);
    t.select();
    const ok = document.execCommand("copy");
    t.remove();
    return ok;
  }
}

/** "Talking points" (three sentences to copy) and "Print / Save as PDF", by the fund's title. */
export default function FundActions({ layerId, data }: { layerId: LayerId; data: FundData }) {
  const tp = talkingPoints(layerId);
  const id = useId();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"yes" | "no" | null>(null);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 2500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="no-print space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {tp && (
          <button type="button" className={btn} aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen((o) => !o)}>
            Talking points
          </button>
        )}
        <PrintButton />
      </div>
      {tp && open && (
        <section id={id} aria-label={`Talking points: ${data.fund}`} className="rounded-card border border-line bg-bg-raised p-4" data-talking-points>
          <ol className="space-y-3">
            {(
              [
                ["What it does", tp.does],
                ["Main risk", tp.risk],
                ["What changed", tp.changed],
              ] as const
            ).map(([label, text]) => (
              <li key={label}>
                <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">{label}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink">{text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
            <p className="text-[11px] leading-snug text-muted">
              From the {data.filing.form} for the period ended {formatDate(data.asOf)}. Not investment advice.
            </p>
            <button
              type="button"
              className={btn}
              onClick={async () => setCopied((await copyText(talkingPointsText(tp, data))) ? "yes" : "no")}
            >
              {copied === "yes" ? "Copied" : "Copy"}
            </button>
            <span className="sr-only" aria-live="polite">
              {copied === "yes" ? "Talking points copied." : copied === "no" ? "Couldn't copy; select the text instead." : ""}
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
