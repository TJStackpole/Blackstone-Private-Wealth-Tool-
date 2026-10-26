"use client";

import { useCallback } from "react";
import { useClient } from "@/components/useClient";

/** The client's state from the shared client profile (see components/useClient.ts). */
export function useClientState(): [string, (code: string) => void] {
  const [client, update] = useClient();
  const set = useCallback((state: string) => update({ state }), [update]);
  return [client.state, set];
}
