"use client";

import { useCallback, useSyncExternalStore } from "react";
import { cleanClient, DEFAULT_CLIENT, type ClientProfile } from "@/lib/client";

const KEY = "pma-client";
const EVENT = "pma-client";
let cache: { raw: string | null; value: ClientProfile } = { raw: null, value: DEFAULT_CLIENT };

function read(): ClientProfile {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // Private windows and blocked storage: the defaults apply.
  }
  if (raw !== cache.raw) {
    let parsed: unknown = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = null;
    }
    cache = { raw, value: cleanClient(parsed) };
  }
  return cache.value;
}

/**
 * The client profile (state, federal bracket, amount), shared by every tool and the header's Client button, and
 * remembered in this browser. Changing it anywhere changes it everywhere.
 */
export function useClient(): [ClientProfile, (change: Partial<ClientProfile>) => void] {
  const client = useSyncExternalStore(
    (on) => {
      window.addEventListener(EVENT, on);
      window.addEventListener("storage", on);
      return () => {
        window.removeEventListener(EVENT, on);
        window.removeEventListener("storage", on);
      };
    },
    read,
    () => DEFAULT_CLIENT,
  );
  const update = useCallback((change: Partial<ClientProfile>) => {
    const next = cleanClient({ ...read(), ...change });
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      cache = { raw: JSON.stringify(next), value: next };
    } catch {
      // Storage unavailable: keep the change for this page view.
      cache = { raw: cache.raw, value: next };
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [client, update];
}
