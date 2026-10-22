"use client";

import { useState } from "react";
import type { FundCode } from "@/config/addons";
import { CLAIMS } from "@/lib/addons/reality-check/data";
import { FUNDS } from "@/lib/addons/shared/funds";
import { formatDate } from "@/lib/dates";
import NextUpdate from "@/components/NextUpdate";
import FundTabs from "@/components/addons/shared/FundTabs";
import PrintOnePager from "@/components/addons/shared/PrintOnePager";
import { ADDON_DISCLOSURE } from "@/components/addons/shared/AddonDisclosure";
import { useFundParam } from "@/components/addons/shared/useFundParam";
import ClaimCard from "./ClaimCard";
import FreshnessBadge from "./FreshnessBadge";

function View({ initial }: { initial: FundCode }) {
  const [fund, setFund] = useState<FundCode>(initial);
  const d = CLAIMS[fund];
  const oldest = d.claims.map((c) => c.asOf).sort()[0];
  return (
    <div className="atlas space-y-5" style={{ ["--layer-light" as string]: FUNDS[fund].color, ["--layer-dark" as string]: FUNDS[fund].colorDark }}>
      <div className="no-print">
        <FundTabs value={fund} onChange={setFund} />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-strong">
        <FreshnessBadge asOf={oldest} />
        <span className="text-muted">
          Data as of {formatDate(oldest)} · checked {formatDate(d.updated)} · <NextUpdate asOf={oldest} />
        </span>
      </div>
      <PrintOnePager title="Reality Check one-pager">
        <div className="space-y-3 print:space-y-2">
          <h2 className="hidden font-serif text-xl print:block">Reality Check: {FUNDS[fund].label}</h2>
          {d.claims.map((c) => (
            <ClaimCard key={c.id} c={c} />
          ))}
          <p className="text-xs leading-relaxed text-muted">{d.note}</p>
          <p className="hidden border-t pt-1 text-[9px] print:block">
            {ADDON_DISCLOSURE} Independent prototype built from public filings. Not affiliated with or endorsed by Blackstone.
          </p>
        </div>
      </PrintOnePager>
    </div>
  );
}

/** Fund picker and the claim cards, starting on the fund a chip link named. */
export default function ClaimsView() {
  const f = useFundParam();
  return <View key={f ?? "default"} initial={f ?? "BCRED"} />;
}
