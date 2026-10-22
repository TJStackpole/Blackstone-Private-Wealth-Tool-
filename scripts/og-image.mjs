// Makes public/og.png, the 1200×630 link-preview image, in the site's own fonts and colors.
// Run after a build (it borrows the built CSS for the fonts):  npm run build && node scripts/og-image.mjs
import { chromium } from "@playwright/test";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = join(import.meta.dirname, "..");
const out = join(root, "out");
const css = [...readFileSync(join(out, "index.html"), "utf8").matchAll(/<link rel="stylesheet" href="\/(_next\/static\/[^"]+\.css)"/g)].map((m) => m[1]);
if (!css.length) throw new Error("No stylesheet in out/index.html. Run `npm run build` first.");

const funds = [
  ["BREIT", "Real Estate", "#1F3A5F"],
  ["BX Infra", "Infrastructure", "#1E6F6A"],
  ["BXPE", "Private Equity", "#7A2E2E"],
  ["BCRED", "Private Credit", "#9A6B2F"],
];
const html = `<!doctype html><html><head><meta charset="utf-8">${css.map((h) => `<link rel="stylesheet" href="./${h}">`).join("")}
<style>
  html, body { margin: 0; width: 1200px; height: 630px; background: #F7F5F0; color: #14161A; }
  .card { box-sizing: border-box; width: 1200px; height: 630px; padding: 72px 80px; display: flex; flex-direction: column; justify-content: space-between; }
  .eyebrow { font: 600 18px/1 var(--font-inter), sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #5B6170; }
  h1 { font-family: var(--font-fraunces), serif; font-weight: 500; font-size: 104px; line-height: .98; letter-spacing: -.02em; margin: 26px 0 0; }
  .sub { font-family: var(--font-fraunces), serif; font-size: 40px; margin-top: 22px; color: #3B414D; }
  .funds { display: flex; gap: 12px; font: 500 20px/1 var(--font-inter), sans-serif; white-space: nowrap; }
  .fund { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border: 1.5px solid #D9D6CE; border-radius: 999px; background: #FBFAF7; }
  .fund i { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
  .fund span { color: #5B6170; font-weight: 400; }
  .foot { display: flex; justify-content: space-between; font: 400 18px/1 var(--font-inter), sans-serif; color: #5B6170; }
  .bars { position: absolute; right: 80px; top: 92px; display: grid; gap: 14px; width: 240px; }
  .bars b { display: block; height: 18px; border-radius: 4px; }
</style></head><body class="${readFileSync(join(out, "index.html"), "utf8").match(/<html[^>]*class="([^"]+)"/)[1]}">
<div class="card">
  <div>
    <div class="eyebrow">Independent · Four evergreen funds</div>
    <h1>Private Markets<br>Atlas</h1>
    <div class="sub">Built from SEC filings.</div>
  </div>
  <div class="bars" aria-hidden="true">${funds.map(([, , c], i) => `<b style="background:${c};width:${[100, 78, 62, 46][i]}%"></b>`).join("")}</div>
  <div>
    <div class="funds">${funds.map(([n, a, c]) => `<div class="fund"><i style="background:${c}"></i>${n} <span>${a}</span></div>`).join("")}</div>
    <div class="foot" style="margin-top:34px"><span>private-markets-atlas.netlify.app</span><span>Not affiliated with Blackstone · Not investment advice</span></div>
  </div>
</div></body></html>`;

const page = join(out, "__og.html");
writeFileSync(page, html);
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await p.goto(pathToFileURL(page).href, { waitUntil: "load" });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: join(root, "public", "og.png") });
await browser.close();
rmSync(page);
console.log("wrote public/og.png");
