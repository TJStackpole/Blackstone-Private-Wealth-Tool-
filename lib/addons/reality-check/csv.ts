import { z } from "zod";
import type { FundCode } from "@/config/addons";
import type { Claim, FundClaims } from "./data";

/** Column order of the update spreadsheet. */
export const COLUMNS = [
  "fund",
  "id",
  "claim",
  "claim_source_name",
  "claim_source_url",
  "claim_source_page",
  "metric",
  "value",
  "as_of",
  "source_name",
  "source_url",
  "source_page",
  "status",
  "status_set_by",
  "context",
] as const;

/** Minimal CSV parser: commas, double-quoted fields, "" for a literal quote, CRLF or LF line endings. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

const url = z.string().url().refine((u) => u.startsWith("https://"), "must start with https://");
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be a date like 2026-06-30")
  .refine((d) => !Number.isNaN(Date.parse(d)), "is not a real date");

const Row = z.object({
  fund: z.enum(["BREIT", "BCRED", "BXPE", "BXINFRA"]),
  id: z.string().regex(/^[a-z0-9-]+$/, "must be lowercase letters, numbers and dashes"),
  claim: z.string().min(10, "is too short"),
  claim_source_name: z.string().min(3),
  claim_source_url: url,
  claim_source_page: z.string(),
  metric: z.string().min(3),
  value: z.string().min(1, "is empty"),
  as_of: isoDate,
  source_name: z.string().min(3),
  source_url: url,
  source_page: z.string(),
  status: z.enum(["consistent", "watch", "diverges"]),
  status_set_by: z.enum(["draft", "TJ"]),
  context: z.string().min(10, "is too short"),
});

export interface ParseResult {
  funds: Partial<Record<FundCode, Claim[]>>;
  errors: string[];
}

/** Checks every row; returns claims grouped by fund, and a plain message for each problem ("Row 4, as_of: must be a date like 2026-06-30"). */
export function rowsToClaims(text: string, today = new Date()): ParseResult {
  const rows = parseCsv(text);
  const errors: string[] = [];
  const funds: Partial<Record<FundCode, Claim[]>> = {};
  if (rows.length === 0) return { funds, errors: ["The file is empty."] };
  const header = rows[0].map((h) => h.trim());
  const missing = COLUMNS.filter((c) => !header.includes(c));
  if (missing.length) return { funds, errors: [`Missing column(s): ${missing.join(", ")}.`] };
  const seen = new Set<string>();
  rows.slice(1).forEach((r, i) => {
    const line = i + 2;
    const obj = Object.fromEntries(header.map((h, j) => [h, (r[j] ?? "").trim()]));
    const parsed = Row.safeParse(obj);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) errors.push(`Row ${line}, ${issue.path.join(".") || "row"}: ${issue.message}`);
      return;
    }
    const v = parsed.data;
    if (Date.parse(v.as_of) > today.getTime()) errors.push(`Row ${line}, as_of: is in the future`);
    if (seen.has(v.id)) errors.push(`Row ${line}, id: "${v.id}" is used more than once`);
    seen.add(v.id);
    (funds[v.fund] ??= []).push({
      id: v.id,
      claim: v.claim,
      claimSource: { name: v.claim_source_name, url: v.claim_source_url, ...(v.claim_source_page ? { page: v.claim_source_page } : {}) },
      metric: v.metric,
      value: v.value,
      asOf: v.as_of,
      source: { name: v.source_name, url: v.source_url, ...(v.source_page ? { page: v.source_page } : {}) },
      status: v.status,
      statusSetBy: v.status_set_by,
      context: v.context,
    });
  });
  return { funds, errors };
}

const esc = (s: string) => (/[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

/** The current data as a spreadsheet, so the update starts from what's live. */
export function claimsToCsv(all: FundClaims[]): string {
  const lines = [COLUMNS.join(",")];
  for (const f of all)
    for (const c of f.claims)
      lines.push(
        [f.fund, c.id, c.claim, c.claimSource.name, c.claimSource.url, c.claimSource.page ?? "", c.metric, c.value, c.asOf, c.source.name, c.source.url, c.source.page ?? "", c.status, c.statusSetBy, c.context]
          .map(esc)
          .join(","),
      );
  return lines.join("\n") + "\n";
}
