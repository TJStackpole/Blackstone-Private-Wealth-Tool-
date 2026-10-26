import type { Claim } from "@/lib/addons/reality-check/data";
import { STATUS_LABEL } from "@/lib/addons/reality-check/data";
import { AsOfSource } from "@/components/addons/shared/Badges";
import FreshnessBadge from "./FreshnessBadge";

/** Status in neutral styling: a dot pattern, not red/green "pass/fail". */
function StatusLabel({ c }: { c: Claim }) {
  const dots = c.status === "consistent" ? "●○○" : c.status === "watch" ? "●●○" : "●●●";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg px-2 py-0.5 text-xs text-muted-strong" data-status={c.status}>
      <span aria-hidden className="tracking-[-0.1em] text-muted">{dots}</span>
      {STATUS_LABEL[c.status]}
      {c.statusSetBy === "draft" && <span className="text-muted">· preliminary</span>}
    </span>
  );
}

/** Claim on the left, what the data shows on the right. */
export default function ClaimCard({ c, compact = false }: { c: Claim; compact?: boolean }) {
  return (
    <article className="rounded-card border border-line bg-bg-raised">
      <div className={compact ? "grid" : "grid md:grid-cols-2 print:grid-cols-2"}>
        {/* The drawer is narrow at any window size, so its card stacks and keeps the divider between claim and data. */}
        <div className={["space-y-2 border-line p-4 print:space-y-1 print:border-r print:p-2", compact ? "" : "md:border-r"].join(" ")}>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">The claim</p>
          <p className="font-serif text-lg leading-snug text-ink print:text-sm">{c.claim}</p>
          <p className="text-xs text-muted">
            Paraphrased from{" "}
            <a href={c.claimSource.url} target="_blank" rel="noreferrer noopener" className="underline decoration-line underline-offset-2 hover:text-ink">
              {c.claimSource.name}
            </a>
            {c.claimSource.page ? `, ${c.claimSource.page}` : ""}
          </p>
        </div>
        <div className={["space-y-2 border-t border-line p-4 print:space-y-1 print:border-t-0 print:p-2", compact ? "" : "md:border-t-0"].join(" ")}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">What the data shows</p>
            <StatusLabel c={c} />
          </div>
          <p className="text-xs text-muted-strong">{c.metric}</p>
          <p className="tnum text-sm font-medium text-ink print:text-xs">{c.value}</p>
          {/* On paper the client line below says it in plainer words, which keeps the handout to one page. */}
          {!compact && <p className="text-sm leading-relaxed text-muted-strong print:hidden">{c.context}</p>}
          {/* The client line is the point of the tool, so the drawer keeps it too. */}
          {c.explain && (
            <div className="rounded-md border-l-2 border-accent bg-bg px-3 py-2 print:px-2 print:py-0.5" data-explain>
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">How to explain this to a client</p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink print:text-[11px] print:leading-snug">{c.explain}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 print:[&_p]:text-[9.5px] print:[&_p]:leading-snug">
            {/* On paper the as-of line says the same; the badge is for screens. */}
            <span className="print:hidden">
              <FreshnessBadge asOf={c.asOf} />
            </span>
            <AsOfSource asOf={c.asOf} source={c.source} />
          </div>
        </div>
      </div>
    </article>
  );
}
