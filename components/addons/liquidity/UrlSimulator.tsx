"use client";

import { useFundParam } from "@/components/addons/shared/useFundParam";
import Simulator from "./Simulator";

/** The full-page simulator, starting on the fund a chip link named (?fund=BREIT), else BCRED. */
export default function UrlSimulator() {
  const fund = useFundParam();
  return <Simulator key={fund ?? "default"} initialFund={fund ?? "BCRED"} />;
}
