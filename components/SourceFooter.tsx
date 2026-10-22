import type { FundData } from "@/lib/types";
import { formatDate } from "@/lib/dates";
import { nextUpdate } from "@/lib/schedule";
import BuiltBy from "./BuiltBy";

/**
 * Which filing the numbers came from, how geography is reported, and the standing disclaimer. `disclosure` adds a
 * view's own wording (the 401(k) tab's calculator disclosure) to the same block, so a page never ends in two.
 */
export default function SourceFooter({ data, disclosure }: { data?: FundData; disclosure?: string }) {
  const next = data && nextUpdate(data.asOf);
  return (
    <footer className="mt-10 border-t border-line pt-5 text-xs leading-relaxed text-muted">
      {data && (
        <dl className="mb-4 grid gap-x-8 gap-y-2 sm:grid-cols-[auto_1fr]">
          <dt className="font-medium text-muted-strong">As of</dt>
          <dd className="tnum">{formatDate(data.asOf)}</dd>
          {next && (
            <>
              <dt className="font-medium text-muted-strong">Next update expected</dt>
              <dd className="tnum" data-next-update={next.due}>
                {next.month}. {next.basis}
              </dd>
            </>
          )}
          <dt className="font-medium text-muted-strong">Source</dt>
          <dd>
            <a href={data.source.url} target="_blank" rel="noreferrer noopener" className="underline decoration-line underline-offset-2 hover:text-ink">
              {data.source.name}
            </a>
            <span> · SEC EDGAR, CIK {data.filing.cik}</span>
          </dd>
          <dt className="font-medium text-muted-strong">Geography</dt>
          <dd>{data.geography.basis}</dd>
          <dt className="font-medium text-muted-strong">Method</dt>
          <dd>
            Figures are parsed from the filing and checked against the totals it prints; a few come from charts inside the filing. Percentages are the
            fund&apos;s own, rounded as reported.
          </dd>
        </dl>
      )}
      {disclosure ? (
        <>
          <p>{disclosure}</p>
          <p className="mt-2">
            Independent prototype built from public filings. Not affiliated with Blackstone. <BuiltBy />.
          </p>
        </>
      ) : (
        <p>
          Independent prototype built from public filings. Not affiliated with Blackstone. Not investment advice. <BuiltBy />.
        </p>
      )}
    </footer>
  );
}
