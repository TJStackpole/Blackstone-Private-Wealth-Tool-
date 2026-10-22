import { GLIDE, MODEL } from "./data";
import type { LabParams } from "./model";

/**
 * The Outcome Lab's starting point. The worker (ages, salary, raises, saving rates, slice, withdrawal rate) is the paper's
 * stated worker (p. 9). The market returns are this tool's own starting guesses, chosen so the base case lands near the
 * paper's published balances; the paper used historical index returns, which this tool doesn't have.
 */
const a = MODEL.assumptions;
export const PAPER_DEFAULTS: LabParams = {
  startAge: a.startAge.value,
  retireAge: a.retireAge.value,
  startSalary: a.startSalary.value,
  raisePct: a.raisePct.value,
  contribStartPct: a.contribStartPct.value,
  contribEndPct: a.contribEndPct.value,
  privatePct: a.privatePct.value,
  publicReturnPct: 8.8,
  premiumPct: { privateEquity: 5, privateRealAssets: 3, privateCredit: 2 },
  privateFeePct: 0,
  withdrawalPct: a.withdrawalPct.value,
  rows: GLIDE.rows,
};
