"use client";

import { useFundParam } from "@/components/addons/shared/useFundParam";
import IndexVsFundView from "./IndexVsFundView";

/** Starts on the fund a chip link named (?fund=BCRED), else BREIT. */
export default function UrlView() {
  const fund = useFundParam();
  return <IndexVsFundView key={fund ?? "default"} initialFund={fund ?? "BREIT"} />;
}
