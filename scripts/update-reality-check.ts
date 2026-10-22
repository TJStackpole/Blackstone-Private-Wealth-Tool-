/**
 * Updates the Reality Check data from a spreadsheet you fill in by hand from fund filings and fact sheets.
 * No web scraping: it only reads the CSV you give it.
 *
 *   npx tsx scripts/update-reality-check.ts --export reality-check.csv   # write the current data to a CSV to edit
 *   npx tsx scripts/update-reality-check.ts reality-check.csv            # check every row, then rewrite the JSON files
 *
 * If any row has a problem, nothing is written and each problem is listed with its row number.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CLAIMS } from "../lib/addons/reality-check/data";
import { claimsToCsv, rowsToClaims } from "../lib/addons/reality-check/csv";

const dir = join(__dirname, "..", "data", "addons", "reality-check");
const [a, b] = process.argv.slice(2);

if (a === "--export") {
  const out = b ?? "reality-check.csv";
  writeFileSync(out, claimsToCsv(Object.values(CLAIMS)));
  console.log(`Wrote ${out}. Edit it, then run: npx tsx scripts/update-reality-check.ts ${out}`);
} else if (a) {
  const { funds, errors } = rowsToClaims(readFileSync(a, "utf8"));
  if (errors.length) {
    console.error(`Nothing was changed. Fix these and run again:\n${errors.map((e) => `  - ${e}`).join("\n")}`);
    process.exit(1);
  }
  const today = new Date().toISOString().slice(0, 10);
  for (const [fund, claims] of Object.entries(funds)) {
    const prev = CLAIMS[fund as keyof typeof CLAIMS];
    writeFileSync(join(dir, `${fund}.json`), JSON.stringify({ ...prev, updated: today, claims }, null, 2) + "\n");
    console.log(`${fund}: ${claims!.length} claims written.`);
  }
} else {
  console.log("Usage: npx tsx scripts/update-reality-check.ts --export reality-check.csv | <file.csv>");
}
