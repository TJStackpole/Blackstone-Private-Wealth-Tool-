"use client";

import { useEffect, useMemo, useState } from "react";
import type { FundData, LayerDef } from "@/lib/types";
import { briefText, fundBrief } from "@/lib/fundBrief";
import { formatDate } from "@/lib/dates";
import { PrintButton } from "./addons/shared/PrintOnePager";
import AddonChips from "./addons/shared/AddonChips";
import FilingBadge from "./FilingBadge";
import { SourceLinks } from "./QuarterBox";
import Sources from "./Sources";
import { copyText } from "./copyText";
import Glossed, { GlossedLines } from "./Glossed";
import { toFundCode } from "@/lib/addons/shared/funds";

const btn =
  "tap no-print inline-flex h-8 items-center whitespace-nowrap rounded-full border border-line bg-bg-raised px-3 text-xs font-medium text-muted-strong hover:border-muted hover:text-ink";

interface Props {
  layer: LayerDef;
  data: FundData;
  /** Whether the map, sectors, holdings and number boxes below are showing. */
  details: boolean;
  onDetails: (open: boolean) => void;
  /** The id of the details block, for aria-controls. */
  detailsId: string;
}

/**
 * The client view: a fund in five plain answers, each dated and sourced, with copy, print and the fund's tools. The map
 * and the full numbers wait behind "See the details".
 */
export default function FundBrief({ layer, data, details, onDetails, detailsId }: Props) {
  const answers = useMemo(() => fundBrief(layer.id, data), [layer.id, data]);
  const code = toFundCode(layer.id);
  const [copied, setCopied] = useState<"yes" | "no" | null>(null);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 2500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <section aria-labelledby={`brief-h-${layer.id}`} className="mb-6" data-fund-brief={data.fund}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
          {data.fund} · {data.assetClass}
        </p>
        <FilingBadge data={data} />
      </div>
      <h2 id={`brief-h-${layer.id}`} className="mt-2 font-serif text-[28px] font-medium leading-[1.1] tracking-[-0.01em] text-ink">
        {data.fund}, in five answers
      </h2>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-strong">
        What a client usually asks first, answered from the fund&rsquo;s own filings. Each answer has its date and sources.
      </p>

      <ol className="mt-4 grid gap-3 sm:grid-cols-2">
        {answers.map((a, i) => (
          <li
            key={a.id}
            className={["flex flex-col rounded-card border border-line bg-bg-raised p-4 sm:p-5", i === 0 ? "sm:col-span-2" : ""].join(" ")}
            data-answer={a.id}
          >
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-strong">{a.question}</h3>
            {a.lines.length === 1 ? (
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink">
                <Glossed text={a.lines[0]} fund={code} />
              </p>
            ) : (
              <GlossedLines lines={a.lines} fund={code} className="mt-1.5 space-y-1.5 text-[15px] leading-relaxed text-ink" first="font-medium" />
            )}
            <p className="tnum mt-auto pt-3 text-[11px] text-muted">
              As of {formatDate(a.asOf)} ·{" "}
              <Sources>
                <SourceLinks sources={a.sources} />
              </Sources>
            </p>
          </li>
        ))}
      </ol>

      <div className="no-print mt-4 flex flex-wrap items-center gap-2">
        <button type="button" className={btn} onClick={async () => setCopied((await copyText(briefText(data.fund, answers))) ? "yes" : "no")}>
          {copied === "yes" ? "Copied" : "Copy these answers"}
        </button>
        <PrintButton />
        <span className="sr-only" aria-live="polite">
          {copied === "yes" ? "Answers copied, with their sources." : copied === "no" ? "Couldn't copy; select the text instead." : ""}
        </span>
      </div>
      <div className="mt-4">
        <AddonChips fundId={layer.id} />
      </div>

      <button
        type="button"
        aria-expanded={details}
        aria-controls={detailsId}
        onClick={() => onDetails(!details)}
        className="tap no-print mt-5 flex w-full items-center justify-between gap-3 rounded-card border border-line bg-bg-raised px-4 py-3 text-left hover:border-muted sm:px-5"
        data-details-toggle
      >
        <span className="min-w-0">
          <span className="block text-sm font-medium text-ink">{details ? "Hide the details" : "See the details"}</span>
          <span className="block text-xs text-muted">
            {data.geography.level === "us-region" ? "Map" : "Holdings, map"}, sectors, the latest month and the last quarter&rsquo;s numbers
          </span>
        </span>
        <span aria-hidden className={["flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-transform duration-200 motion-reduce:transition-none", details ? "rotate-45" : ""].join(" ")}>
          +
        </span>
      </button>
    </section>
  );
}
