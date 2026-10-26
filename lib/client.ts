import { STATES } from "./addons/tax-lens/states";

/** The client an advisor is preparing for: set once, used by every tool. Stored only in this browser. */
export interface ClientProfile {
  /** Two-letter state code; sets the state income tax rate. */
  state: string;
  /** Federal income tax bracket, percent. */
  bracket: number;
  /** Amount invested, dollars. */
  amount: number;
}

export const DEFAULT_CLIENT: ClientProfile = { state: STATES.default, bracket: 37, amount: 250_000 };

/** The 2026 federal brackets (IRS, 2026 inflation adjustments). */
export const FEDERAL_BRACKETS = [10, 12, 22, 24, 32, 35, 37];

/** A stored profile, with anything missing or out of range put back to the default. */
export function cleanClient(raw: unknown): ClientProfile {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<ClientProfile>;
  return {
    state: typeof r.state === "string" && STATES.states.some((s) => s.code === r.state) ? r.state : DEFAULT_CLIENT.state,
    bracket: typeof r.bracket === "number" && r.bracket >= 0 && r.bracket <= 100 ? r.bracket : DEFAULT_CLIENT.bracket,
    amount: typeof r.amount === "number" && Number.isFinite(r.amount) && r.amount >= 0 ? r.amount : DEFAULT_CLIENT.amount,
  };
}
