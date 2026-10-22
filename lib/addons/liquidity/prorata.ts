/**
 * Pro rata: when everyone's requests together exceed what the fund will buy back, every request
 * is filled by the same fraction. Requests at or under the limit are filled in full.
 * Both inputs are percentages of the fund (e.g. 5 and 10).
 */
export function proRataFill(limitPct: number, requestsPct: number): number {
  // A limit of 0 means the plan buys nothing back (for example, suspended), whatever the requests.
  if (!(limitPct > 0)) return 0;
  if (!(requestsPct > 0)) return 1;
  return Math.min(1, limitPct / requestsPct);
}
