# Private Markets Atlas — Build Plan (5 Phases)

An interactive map that shows where Blackstone's retail wealth funds actually invest, one fund at a time, ending with a retirement (401k) lens.

**Built by TJ Stackpole as an independent prototype. Not affiliated with or endorsed by Blackstone.**

---

## HOW TO USE THIS FILE (for TJ)

1. Make a new empty folder on your computer called `private-markets-atlas`.
2. Put this file (`BUILD_PLAN.md`) inside that folder.
3. Open Claude Code in that folder.
4. Paste the **Kickoff Prompt** at the bottom of this file.
5. When Claude Code says Phase 1 is done, go through the **Done Checklist** for Phase 1 yourself. Open the site, click everything, look at it on your phone.
6. Only when every box is checked, paste the **Phase 2 prompt**. Repeat for each phase.

The rule: **build, polish, test, lock — then advance.** Never start the next phase early.

---

## THE BIG RULES (Claude Code must follow these in every phase)

### 1. Keep it simple
- Next.js (App Router) + TypeScript + Tailwind CSS.
- Map: `react-simple-maps` with the free `us-atlas` US states map. **No Mapbox, no API keys, no database, no login.**
- Animation: `framer-motion`, used lightly.
- Charts: `recharts` (only where a phase calls for it).
- All data lives in plain JSON files in `/data`. No backend.
- Must deploy to Vercel with zero configuration.

### 2. Data honesty (non-negotiable)
- **Never invent real holdings, numbers, or company names.** If real data hasn't been loaded, use clearly fake sample entries with `"sample": true`, and the UI must show a visible "SAMPLE DATA" badge.
- Every dataset carries `asOf` (date) and `source` (document name + URL). Both show in the UI.
- Geography is **state + metro level only** (e.g., "Dallas–Fort Worth, TX"). No street addresses.
- For BXPE and BCRED, locations are **company headquarters**, and the UI must say so: "Mapped by headquarters — a proxy, not where all operations sit."
- Third-party data (e.g., water or power use) is cited separately from fund filings.

### 3. No Blackstone branding
- No Blackstone logo, fonts copied from their site, or anything that looks official.
- Fund names (BREIT, BCRED, etc.) may be used as plain text.
- Footer on every page: "Independent prototype built from public filings. Not affiliated with Blackstone. Not investment advice."

### 4. Build one reusable shell
Phase 1 builds the frame. Phases 2–5 only **add a layer** into that frame. Adding a fund should mean: add one JSON file + one entry in a layer list. Nothing else should need rewriting.

---

## DESIGN SYSTEM (looks expensive, stays simple)

Feel: a quiet, editorial financial report — think a premium annual report, not a startup dashboard.

- **Colors**
  - Background: warm off-white `#F7F5F0` (dark mode: `#0F1115`)
  - Text: near-black `#14161A` (dark mode: `#ECEAE4`)
  - Muted text / borders: `#8A8F98` / `#E4E0D6`
  - One accent per fund layer:
    - BREIT (Real Estate): deep navy `#1F3A5F`
    - BX Infra (Infrastructure): teal `#1E6F6A`
    - BXPE (Private Equity): oxblood `#7A2E2E`
    - BCRED (Credit): bronze `#9A6B2F`
    - Retirement lens: slate `#4A5568`
  - Map states with no holdings: very light `#ECE8DF`. Holdings shown as shading intensity in the layer's color.
- **Type**
  - Headlines: a serif (`Fraunces` or `Source Serif 4`, from Google Fonts).
  - Everything else: `Inter`.
  - Numbers use tabular figures so they line up.
- **Layout**
  - Left (desktop): the map, big. Right: a slim detail panel.
  - Mobile: map on top, panel slides up from the bottom as a sheet.
  - Generous white space. Thin 1px borders. Soft corners (8px). No heavy shadows.
- **Motion**
  - Layer switch: states cross-fade color over ~300ms.
  - Panel: slides in, ~250ms.
  - Hover on a state: slight darken + tooltip. Nothing bouncy.
- **Accessibility**
  - Everything works with a keyboard. Visible focus rings.
  - Color is never the only signal — always a label or number too.
  - Respect "reduce motion" settings.

---

## FILE STRUCTURE

```
/app
  page.tsx              → main map page
  layout.tsx            → fonts, theme, footer
/components
  AtlasMap.tsx          → the US map (reused by every phase)
  LayerSwitcher.tsx     → tabs: BREIT / Infra / BXPE / BCRED / Retirement
  DetailPanel.tsx       → right-side panel (state + metro details)
  Legend.tsx            → shading scale
  SourceFooter.tsx      → as-of date, source link, disclaimers
  SampleBadge.tsx       → shows when data is sample
/data
  layers.ts             → list of layers (name, color, file, caveats)
  breit.json
  bxinfra.json
  bxpe.json
  bcred.json
  retirement.json
/lib
  types.ts              → shared data types
  aggregate.ts          → rolls metros up to state totals
```

### Shared data shape (every fund JSON follows this)

```json
{
  "fund": "BREIT",
  "assetClass": "Real Estate",
  "asOf": "2026-06-30",
  "source": { "name": "BREIT Q2 2026 Fact Sheet", "url": "https://..." },
  "locationBasis": "property",
  "summary": { "navBillions": null, "headline": "..." },
  "sectors": ["Rental Housing", "Industrial", "Data Centers", "Hospitality", "Other"],
  "holdings": [
    {
      "metro": "Dallas–Fort Worth",
      "state": "TX",
      "lat": 32.78,
      "lng": -96.80,
      "sector": "Industrial",
      "weightPct": 4.1,
      "note": "",
      "sample": true
    }
  ]
}
```

`locationBasis` is `"property"` (BREIT, Infra) or `"headquarters"` (BXPE, BCRED). The UI reads this and shows the right caveat automatically.

---

## PHASE 1 — BREIT (the foundation)

**Goal:** A finished-looking product with one fund. This phase builds the frame everything else plugs into.

**What to build**
- Header: product name, one-line description, layer tabs (only BREIT active; others show as "Coming soon," greyed).
- US map shaded by BREIT weight per state.
- Metro dots on top of states, sized by weight.
- Sector filter chips (Rental Housing, Industrial, Data Centers, etc.). Click one → map shows only that sector.
- Click a state → detail panel shows: state total weight, list of metros, sector breakdown (simple horizontal bars).
- Default panel (nothing clicked): fund overview — what BREIT is in 2 plain sentences, top 5 states, sector mix.
- Legend, source footer with as-of date, sample badge if needed, disclaimer.
- Light/dark mode toggle.

**Done Checklist**
- [ ] Map loads in under 2 seconds.
- [ ] Every state with data is clickable; panel updates correctly.
- [ ] Sector filter changes the map and the panel.
- [ ] Looks right on a phone (map on top, sheet slides up).
- [ ] Keyboard can tab through tabs, chips, and states.
- [ ] As-of date and source link show. Sample badge shows if data is fake.
- [ ] Dark mode looks as good as light mode.
- [ ] `npm run build` passes with zero errors. Deploys to Vercel.

---

## PHASE 2 — BX Infra (infrastructure layer)

**Goal:** Add the second layer. Prove the shell works.

**What to build**
- Activate the "Infrastructure" tab using `bxinfra.json`.
- Sectors: Data Centers, Power & Energy, Transportation, Digital/Fiber, Other.
- Same map, same panel — just the teal color and infra data.
- New in the panel for this layer only: a small optional "Context" card for data centers that can show third-party facts (e.g., water use) with its own separate citation. Hidden if no data.
- Smooth cross-fade when switching between BREIT and Infra.

**Done Checklist**
- [ ] Switching layers is smooth and never shows the wrong fund's data.
- [ ] BREIT still works exactly as before (nothing broke).
- [ ] Third-party facts are visually separate and separately cited.
- [ ] All Phase 1 checks still pass.

---

## PHASE 3 — BXPE (private equity layer)

**Goal:** Add the first "headquarters proxy" layer.

**What to build**
- Activate "Private Equity" tab using `bxpe.json`.
- Sectors: Technology, Healthcare, Industrials, Consumer, Financial Services, Other.
- Because `locationBasis` is `"headquarters"`, a clear caveat banner shows at the top of the panel automatically.
- Clicking a metro shows a short list of companies headquartered there (name, sector, one-line description) — only from disclosed top holdings.

**Done Checklist**
- [ ] HQ-proxy caveat shows on this layer and NOT on BREIT/Infra.
- [ ] No company appears unless it's in a public disclosure (or flagged sample).
- [ ] All three layers switch cleanly.
- [ ] All earlier checks still pass.

---

## PHASE 4 — BCRED (private credit layer)

**Goal:** Complete all four asset classes.

**What to build**
- Activate "Credit" tab using `bcred.json`.
- Sectors: Software, Healthcare, Business Services, Industrials, Consumer, Other.
- Same HQ-proxy caveat as BXPE.
- Panel adds a small plain-English "How this fund works" box: senior secured loans, floating rate, monthly NAV, redemptions capped at roughly 2% monthly / 5% quarterly of fund NAV, prorated when requests exceed the cap. (Text lives in the JSON so it's easy to update.)
- New: an **"All Funds" view** tab. Shows every layer at once as small multiples (four mini-maps side by side) so you can compare at a glance. This visually shows what a combined fund like BXPM is made of.
- Final polish pass across the whole site.

**Done Checklist**
- [ ] All four layers + All Funds view work and load fast.
- [ ] "How this fund works" text is accurate and dated.
- [ ] Final mobile, keyboard, and dark-mode check across every layer.
- [ ] Deployed on Vercel at a clean URL.

---

## PHASE 5 — Retirement Lens (Blackstone's 401(k) push)

**Important framing:** Blackstone's 401(k) effort is a **business line, not one public fund.** It delivers private markets into retirement plans through partners (for example, the Empower partnership using collective investment trusts, or CITs). There is no public, holding-by-holding fund to map. So this phase is an **educational, illustrative lens** — every number on it is labeled "Illustrative, not a real plan allocation."

**Goal:** Show how a small slice of private markets could sit inside a normal 401(k), and connect it back to the four layers already built.

**What to build**
- New "Retirement" tab with a different layout (no map as the main view).
- **Slider: "Years until retirement" (0–40).** As you move it, a simple stacked bar or area chart shows an example target-date mix: stocks, bonds, cash, and a small **private markets sleeve** (illustrative range, e.g., 5–15%, set in `retirement.json`).
- **"What's in the sleeve" card:** shows which of the four layers (Real Estate, Infra, PE, Credit) the sleeve could draw from, with a "View on map" button that jumps to that layer.
- **Plain-English explainer cards** (3 short cards):
  1. Why private markets in a 401(k) at all (diversification, long time horizon).
  2. How it gets there (inside a professionally managed fund via a CIT — you don't pick it yourself).
  3. The trade-offs (fees, valuation, liquidity — handled by the fund manager keeping the sleeve small).
- **Timeline card:** key public milestones with dates and source links (e.g., Aug 2025 executive order on alternatives in retirement plans; Jan 2026 Empower partnership). Pulled from `retirement.json`, each with a source.
- Big "Illustrative" badge on every chart.

**Done Checklist**
- [ ] Slider is smooth on desktop and phone.
- [ ] Every number is labeled illustrative; every milestone has a source.
- [ ] "View on map" jumps to the correct layer.
- [ ] Nothing on this page implies a real product's actual allocation.
- [ ] All earlier checks still pass. Final Vercel deploy.

---

## KICKOFF PROMPT (paste this into Claude Code first)

```
Read BUILD_PLAN.md in this folder carefully. We are building this in five
phases. Start with PHASE 1 (BREIT) only.

Follow THE BIG RULES, DESIGN SYSTEM, FILE STRUCTURE, and shared data shape
exactly. Build the reusable shell so later phases only add a JSON file and a
layer entry.

Use sample data marked "sample": true for now — do not invent real holdings.
Use my frontend design skill for polish.

When Phase 1 is built, run `npm run build`, fix any errors, start the dev
server, and walk me through the Phase 1 Done Checklist one item at a time in
plain, non-technical language. Do NOT start Phase 2 until I say so.
```

## PHASE 2–5 PROMPTS (paste one at a time, only after the last phase is locked)

```
Phase [N] time. Read the PHASE [N] section of BUILD_PLAN.md and build only
that. Do not change how earlier layers look or behave. When done, run the
build, then walk me through the Phase [N] Done Checklist AND re-check every
earlier phase's checklist. Explain anything in plain language. Stop and wait
for me before the next phase.
```

## LOADING REAL DATA (anytime, any phase)

```
Here is [fund]'s latest fact sheet / quarterly report: [paste text or attach
PDF]. Update /data/[fund].json with ONLY what this document actually states.
Set asOf and source. Remove "sample": true only from entries backed by the
document. List anything you could not find instead of guessing.
```
