import type { FundData } from "@/lib/types";
import { LOCATION_BASIS_NOTE } from "@/data/layers";
import { formatDate } from "@/lib/aggregate";
import SampleBadge from "./SampleBadge";

interface Props {
  data?: FundData;
  hasSample: boolean;
  caveats?: string[];
}

/** As-of date, source link, how locations are mapped, and the standing disclaimer. */
export default function SourceFooter({ data, hasSample, caveats = [] }: Props) {
  return (
    <footer className="mt-10 border-t border-line pt-5 text-xs leading-relaxed text-muted">
      {data && (
        <dl className="mb-4 grid gap-x-8 gap-y-2 sm:grid-cols-[auto_1fr]">
          <dt className="font-medium text-muted-strong">As of</dt>
          <dd className="tnum">{formatDate(data.asOf)}</dd>
          <dt className="font-medium text-muted-strong">Source</dt>
          <dd className="flex flex-wrap items-center gap-2">
            <a href={data.source.url} target="_blank" rel="noreferrer noopener" className="underline decoration-line underline-offset-2 hover:text-ink">
              {data.source.name}
            </a>
            {hasSample && <SampleBadge compact />}
          </dd>
          <dt className="font-medium text-muted-strong">Locations</dt>
          <dd>
            {LOCATION_BASIS_NOTE[data.locationBasis]} Geography is shown at state and metro level only.
            {caveats.map((c) => (
              <span key={c}> {c}</span>
            ))}
          </dd>
        </dl>
      )}
      <p>
        Independent prototype built from public filings. Not affiliated with Blackstone. Not investment advice.
      </p>
    </footer>
  );
}
