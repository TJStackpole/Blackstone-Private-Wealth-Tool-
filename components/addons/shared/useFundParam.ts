"use client";

import { useSyncExternalStore } from "react";
import type { FundCode } from "@/config/addons";
import { FUNDS } from "@/lib/addons/shared/funds";

const noop = () => () => {};

/** The `?fund=BCRED` a chip link adds, read in the browser. Null on the server, while hydrating, or if it isn't a fund. */
export function useFundParam(): FundCode | null {
  return useSyncExternalStore(
    noop,
    () => {
      const f = new URLSearchParams(window.location.search).get("fund");
      return f && Object.hasOwn(FUNDS, f) ? (f as FundCode) : null;
    },
    () => null,
  );
}
