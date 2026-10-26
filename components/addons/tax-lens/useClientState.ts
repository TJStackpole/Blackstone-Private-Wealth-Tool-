"use client";

import { useCallback, useSyncExternalStore } from "react";
import { STATES } from "@/lib/addons/tax-lens/states";

const KEY = "pma-client-state";
const EVENT = "pma-client-state";

function read(): string {
  try {
    const v = localStorage.getItem(KEY);
    if (v && STATES.states.some((s) => s.code === v)) return v;
  } catch {
    // Private windows and blocked storage: fall back to the default state.
  }
  return STATES.default;
}

/**
 * The client's state for every tax figure in the Tax Lens, shared by the calculator, the worked example and each
 * fund's "in round numbers", and remembered in this browser. A convenience only: nothing depends on it being stored.
 */
export function useClientState(): [string, (code: string) => void] {
  const code = useSyncExternalStore(
    (on) => {
      window.addEventListener(EVENT, on);
      window.addEventListener("storage", on);
      return () => {
        window.removeEventListener(EVENT, on);
        window.removeEventListener("storage", on);
      };
    },
    read,
    () => STATES.default,
  );
  const set = useCallback((next: string) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Storage unavailable: the choice still applies on this page until it reloads.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [code, set];
}
