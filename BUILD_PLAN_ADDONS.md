# Private Markets Atlas: Advisor Toolkit Add-Ons (Build Plan)

Seven add-ons for the existing **Private Markets Atlas**, each built in three phases. They help advisors and family offices explain Blackstone's perpetual funds (BREIT, BCRED, BXPE, BXINFRA) honestly.

**End state:** every add-on plugs into the existing tool, and none of them can break the map.

**Built by TJ Stackpole as an independent prototype. Not affiliated with or endorsed by Blackstone. Not investment, tax, or legal advice.**

---

## HOW TO USE THIS FILE (for TJ)

Think of the Atlas as a finished house. These add-ons are new rooms. We build each room next to the house first, and only open a door into the house once the room passes inspection.

1. **Save your working tool first.** In Claude Code, type: `Commit everything and tag it v1-stable.` This is your "undo everything" button.
2. Put this file (`BUILD_PLAN_ADDONS.md`) in the `private-markets-atlas` folder, next to the original `BUILD_PLAN.md`.
3. Open Claude Code in that folder and paste the **Foundation Prompt** (bottom of this file). It builds the shared plumbing every add-on uses. You only do this once.
4. Run the **Foundation Done Checklist** yourself. The map should look and work exactly like before.
5. Paste the **Phase Prompt**, filling in the add-on and phase. Example: `Add-on 4, Phase 1`.
6. Run that phase's **Done Checklist** plus the **Regression Checklist** (the "did anything break?" test).
7. If it all passes, tell Claude Code: `Merge this branch into main.` If something broke, tell it: `Throw away this branch and go back to main.` Nothing is lost.
8. Finish all three phases of one add-on before starting the next.

**Recommended order** (most useful to an advisor first):

| Order | Add-on | Why this order |
|---|---|---|
| 1 | 4. Liquidity Simulator | The #1 client fear right now (BCRED caps) |
| 2 | 1. Index-to-Fund Translator | Fixes the most common confusion in every brochure |
| 3 | 3. Tax Lens | Turns a generic chart into a personal number |
| 4 | 2. "Why So Smooth?" Explainer | Gets ahead of the sharpest skeptic question |
| 5 | 6. Theme Exposure Map | Reuses the map you already built, so it's the best showcase |
| 6 | 7. Drawdown vs. Evergreen | Unlocks the family office audience |
| 7 | 5. Claim vs. Live Data Check | Depends on data from the others; build last |

---

## THE INTEGRATION RULES (Claude Code must follow these every phase)

These are what make the add-ons "seamless and unbreakable." Each one is explained in plain terms.

### Rule 1: Each add-on lives in its own folders
Like giving each room its own walls. An add-on's code may only go in these places:

```
/config/addons.ts                    ← one shared list of add-ons (the "registry")
/app/toolkit/page.tsx                ← Advisor Toolkit home page
/app/toolkit/[addonId]/page.tsx      ← each add-on's full page
/components/addons/<addonId>/        ← that add-on's screens
/lib/addons/<addonId>/               ← that add-on's math (pure functions)
/data/addons/<addonId>/              ← that add-on's JSON data
/tests/addons/<addonId>/             ← that add-on's tests
```

### Rule 2: Only two existing files may ever be touched
Like a house with exactly two doorways into it.
- **Doorway A:** the site navigation gets one link, "Advisor Toolkit."
- **Doorway B:** each fund's side panel gets one line: `<AddonChips fundId={fund.id} />`. This shows small buttons ("Liquidity," "Tax Lens," and so on) for any add-on that applies to that fund.

Every other existing file (map, layers, fund JSON, design tokens) is **read-only**. If an add-on needs something from a fund file, it reads it and never edits it.

### Rule 3: Every add-on has an on/off switch (feature flag)
Like a light switch. `/config/addons.ts` lists each add-on with `enabled: true | false`. If an add-on misbehaves, flip it to `false` and it disappears completely, with the map untouched.

```ts
// /config/addons.ts (shape)
export type AddonId =
  | "liquidity" | "index-vs-fund" | "tax-lens" | "smoothing"
  | "themes" | "drawdown-vs-evergreen" | "reality-check";

export const ADDONS: {
  id: AddonId;
  name: string;           // shown on chips and the toolkit page
  shortName: string;      // chip label, ≤ 14 characters
  enabled: boolean;
  appliesTo: ("BREIT" | "BCRED" | "BXPE" | "BXINFRA")[];
  phase: 1 | 2 | 3;       // highest phase completed
}[] = [ /* filled in as add-ons are built */ ];
```

### Rule 4: Every add-on is wrapped in a fuse (error boundary)
If an add-on crashes, its box shows "This tool is temporarily unavailable" and the rest of the page keeps working. Shared component: `<AddonBoundary addonId="...">`.

### Rule 5: Math lives in pure functions, and every function is tested
A "pure function" is like a calculator button: same inputs, same answer, every time, and it changes nothing else. All math goes in `/lib/addons/<id>/` with **Vitest** unit tests. Screens only display what the functions return.

### Rule 6: Same look as the Atlas
Use the existing design tokens: off-white background, navy text, serif headlines, and per-fund accent colors (navy BREIT, teal BXINFRA, oxblood BXPE, bronze BCRED). **No new fonts, colors, or UI libraries.** Charts use `recharts`, which the Atlas already has. Motion uses `framer-motion`, lightly.

### Rule 7: Still no backend, login, or database
Everything stays static JSON plus browser-side math, deployable to Vercel with zero configuration. Client inputs live only in the page's memory and are never saved or sent anywhere. (Real client data must never leave the advisor's screen.)

### Rule 8: Data honesty (same rules as the Atlas, plus three)
- Every dataset has `asOf`, `source` (document name + URL), and `sample: true | false`. Sample data shows the **SAMPLE DATA** badge.
- Every calculator output shows an **ILLUSTRATIVE** badge.
- **Never invent real fund numbers.** Fund terms like repurchase caps and early-redemption deductions are **parameters with a source field**, never hard-coded facts. Default values carry `"verify": "Confirm against current prospectus"`.
- **New:** no "you should" or "we recommend" language anywhere. Use neutral phrasing such as "Here's how this would have worked."
- **New:** Blackstone brochures are **paraphrased and cited** (document name + page), never copied word-for-word. Their charts are never re-pasted. Their disclosures mark the material confidential, so the tool explains ideas in its own words.
- **New:** every add-on page ends with the shared `<AddonDisclosure />`, which reads: "Illustrative only. Not investment, tax, or legal advice. Fund terms, fees, and performance vary by share class and change over time; the offering documents control. Past performance does not predict future results."

### Rule 9: Shared building blocks (built once in Foundation)
- `<AddonBoundary>`: the fuse
- `<AddonChips fundId>`: the buttons in each fund panel
- `<AddonShell title subtitle fundId?>`: the standard page frame (header, badges, disclosure)
- `<SampleBadge>`, `<IllustrativeBadge>`, `<AsOfSource asOf source>`
- `<NumberInput>`, `<PercentInput>`, `<SelectFund>`: consistent, accessible form inputs
- `<PrintOnePager>`: a print-friendly layout and "Print / Save as PDF" button using the browser's print function (no PDF library)
- `<ClientScriptCard>`: a "How to say it to a client" box with plain-language talking points

### Rule 10: Test after every phase
- `npm run build` must pass with zero errors.
- `npm run test` (Vitest) must pass.
- `npm run e2e` (one **Playwright** smoke test) must pass. It loads the map, toggles every fund layer, opens every enabled add-on, and fails if any page shows an error.

### Rule 11: One phase per git branch
Each phase gets its own branch, named like `addon/liquidity-p1`. That's a draft copy: if it goes wrong, delete it and `main` is untouched.

---

## FOUNDATION (build once, before any add-on)

**Goal:** add the plumbing with zero visible change except an empty "Advisor Toolkit" page.

**Build:**
1. Install dev tools: `vitest`, `@testing-library/react`, `@playwright/test`. No new runtime libraries.
2. Create `/config/addons.ts` with an empty list.
3. Build every shared component in Rule 9.
4. Create `/app/toolkit/page.tsx`, which lists enabled add-ons as cards (empty state: "Advisor tools coming soon").
5. Add Doorway A (nav link) and Doorway B (`<AddonChips>` in the fund panel, which renders nothing while the list is empty).
6. Write the Playwright smoke test.
7. Add `npm` scripts: `test`, `e2e`.

**Foundation Done Checklist:**
- [ ] The map looks and behaves exactly as before on desktop and phone
- [ ] "Advisor Toolkit" link opens the empty toolkit page
- [ ] Fund side panels look unchanged (no empty gaps)
- [ ] `build`, `test`, and `e2e` all pass
- [ ] `git diff main --stat` shows only the two allowed existing files changed

---

## ADD-ON 1: Index-to-Fund Translator

**The problem it solves:** brochures show index returns (NFI-ODCE, Cliffwater, Cambridge) that are often gross of fees and unlevered. Clients assume they'll earn those numbers.
**Plain example:** "The brochure's lending index made 9.4% a year. Your share class, after fees and with the fund's borrowing, is a different number. Here's the bridge between the two."
**Applies to:** all four funds. **Id:** `index-vs-fund`

### Phase 1: The comparison card (read-only)
- Data: `/data/addons/index-vs-fund/<FUND>.json`. Each file holds the benchmark index name, what it measures, whether it's gross or net of fees, whether it uses leverage, the index return and period, and sample fund net returns by share class. Each field carries `source` and `asOf`.
- Screen: side-by-side card with **Index** on the left and **Fund (by share class)** on the right. Below it, the "Why they differ" list: fees, leverage, cash held for liquidity, share-class servicing fees, appraisal timing.
- Add `<ClientScriptCard>` with three plain sentences an advisor can say.
- **Done when:** all four funds show a card with SAMPLE badges and sources visible.

### Phase 2: The bridge chart (interactive)
- Function: `lib/addons/index-vs-fund/bridge.ts`. It's a `buildBridge(params)` function that returns the steps from index return to fund net return: management fee, performance fee, servicing fee, leverage effect, and cash drag. Each step's size comes from inputs, never invented.
- Screen: a recharts waterfall (step) chart. Share class selector (for example I / D / S) changes the fee steps. A "What if leverage were X%?" slider is labeled ILLUSTRATIVE.
- Tests: the steps always add up exactly from the start number to the end number; zero fees equals no change; the chart handles negative returns.
- **Done when:** changing share class visibly changes the bridge, and the math is tested.

### Phase 3: Embed and export
- Turn on the chip in BREIT, BCRED, BXPE, and BXINFRA panels. Clicking it opens a slide-over drawer with the compact card, plus a "Full view" link to the toolkit page.
- `<PrintOnePager>` version: card + bridge chart + disclosure on one page.
- Real data hook: the "Loading Real Data" process from the original plan, applied to these JSON files.
- **Done when:** the chip works from every fund panel, the printout fits one page, and the regression checklist passes.

---

## ADD-ON 2: "Why So Smooth?" Explainer

**The problem it solves:** a private fund's value comes from appraisals, not daily trading, so it moves less than public markets. The real estate brochure's own footnote says so. Skeptics call it "volatility laundering," and the advisor needs to raise it before the client does.
**Plain example:** "Your house's Zillow estimate doesn't drop 20% in a week the way a REIT stock can. The house didn't get safer; it just isn't priced every day."
**Applies to:** BREIT, BXINFRA (and BXPE in Phase 3). **Id:** `smoothing`

### Phase 1: The explainer
- Content file: `/data/addons/smoothing/content.json`, written in your own words with a source for each claim.
- Screen: three short sections:
  1. **Appraised vs. traded price** (with the house analogy)
  2. **What smoothing does and doesn't mean**: lower measured volatility, not necessarily lower risk
  3. **The honest answer**: why it can still be useful (less panic selling) and what to watch (NAV vs. secondary-market bids)
- Add `<ClientScriptCard>` with a 30-second answer to "Why does this look so stable?"
- **Done when:** the page reads clearly to someone with no finance background (test it on a friend).

### Phase 2: The side-by-side chart
- Data: `/data/addons/smoothing/series.json`, with sample quarterly series for a private real estate index and a public REIT index over the same dates.
- Function: `lib/addons/smoothing/stats.ts`, containing `volatility()`, `maxDrawdown()`, and `desmooth(series, alpha)`. The last one is a standard textbook adjustment that estimates what returns might look like if priced like markets; the alpha slider is labeled ILLUSTRATIVE.
- Screen: two lines on one chart with the worst drawdown shaded. Toggle: "Show market-style estimate."
- Tests: a flat series has zero volatility; drawdown on a known series matches a hand calculation; alpha = 0 returns the original series.
- **Done when:** the toggle visibly widens the swings, and all stats show their period and source.

### Phase 3: Objection handling and embed
- Add an "If the client says…" accordion with three common pushbacks and plain responses.
- Turn on chips for BREIT, BXINFRA, and BXPE. The drawer shows the 30-second answer plus a mini chart.
- Print one-pager.
- **Done when:** chips work and the regression checklist passes.

---

## ADD-ON 3: Tax Lens (Return-of-Capital Calculator)

**The problem it solves:** the brochure shows a 5% payout becoming an "8% tax-equivalent" because most of it is return of capital (ROC). The footnote warns that ROC lowers your cost basis, delays tax until you sell, and varies every year. Clients need **their** number, both today and at exit.
**Plain example:** "You get $5,000 this year and owe tax on only about $1,000 of it now. But your 'purchase price' on paper drops by $4,000, so you'll owe more when you sell."
**Applies to:** BREIT (REIT structure). For other funds, show a short note explaining their distributions are taxed differently, with no calculator. **Id:** `tax-lens`

### Phase 1: The worked example
- Screen: a step-by-step walk-through of the 5% / 80% ROC example **in your own words**:
  1. The payout
  2. The part taxed now
  3. The part that lowers basis
  4. What happens at sale
- Simple visual: a "cost basis" bar shrinking each year.
- **Done when:** the example is accurate, sourced, and clearly labeled general education, not tax advice.

### Phase 2: The personal calculator
- Function: `lib/addons/tax-lens/roc.ts` with `projectTax(params)`.
  - Inputs: amount invested, distribution rate, ROC % (default from source, editable), ordinary income rate, capital gains rate, state rate, years held, and an optional qualified-REIT-dividend deduction toggle.
  - Outputs (per year): cash received, tax now, after-tax cash, ending basis. At exit: estimated tax due on sale and total after-tax result.
  - Rule: basis never goes below zero; any ROC beyond basis is treated as a gain, and the function says so.
- Screen: inputs on the left; a year-by-year table plus "Tax now vs. tax later" bars on the right.
- Tests: 0% ROC means all payouts are taxed now; basis floors at zero; one-year and ten-year scenarios match hand calculations.
- **Done when:** every number traces to an input, and the ILLUSTRATIVE badge plus "Consult a tax advisor" are visible.

### Phase 3: Embed and connect
- BREIT chip on. The drawer holds a three-input quick version (amount, bracket, years); "Full view" opens the full calculator.
- Cross-link to Add-on 4: "Redeeming early? See when cash arrives and when tax is due."
- Print one-pager.
- **Done when:** the regression checklist passes.

---

## ADD-ON 4: Liquidity Simulator

**The problem it solves:** "monthly/quarterly liquidity, subject to limits" sounds like a mutual fund until a cap hits. BCRED has prorated repurchases at its 5% quarterly cap for three straight quarters. Clients need "here's your money and when," not "the fund was gated."
**Plain example:** "You ask for $500,000 back. If half of all requests are filled each quarter, you'd get about $250,000 in three months and about $375,000 in six."
**Applies to:** all four funds. **Id:** `liquidity`

### Phase 1: How redemption caps work
- Data: `/data/addons/liquidity/terms.json`, with each fund's repurchase frequency, cap levels, early-redemption deduction, and the manager's right to change or suspend. All entries are **parameters with source and `verify` notes**. Also `history.json`: a dated timeline of past cap events (for example, BREIT 2022–2024 and BCRED 2026), each with a source link.
- Screen:
  1. "How the line works" explainer, with a pro-rata illustration (everyone in line gets the same fraction)
  2. Fund terms table
  3. History timeline
- **Done when:** every term and event shows its source and as-of date.

### Phase 2: The "what happens to my money" simulator
- Function: `lib/addons/liquidity/simulate.ts` with `simulateRedemption(params)`.
  - Inputs: redemption amount, fund, quarterly cap (% of NAV), total requests as % of NAV (by quarter), whether unfilled amounts are resubmitted, NAV change per quarter, and early-redemption deduction.
  - Output: a quarter-by-quarter schedule of amount requested, % filled, cash received, cumulative received, and remaining.
- Presets (all ILLUSTRATIVE, each with a source note):
  - **Normal times** (requests below cap: 100% filled)
  - **Stressed** (requests at 2× cap: about 50% filled)
  - **Prolonged backlog** (several quarters at 2× cap)
- Screen: preset buttons, inputs, a cumulative-cash line chart, and a schedule table. The headline sentence is auto-generated, e.g. "In this scenario, you'd receive about $375,000 within 6 months."
- Tests: requests under the cap fill 100%; at 2× cap, fill is 50%; resubmission math matches a hand-checked case; the function never pays out more than requested.
- **Done when:** the three presets give sensible, tested results, and the headline sentence matches the table.

### Phase 3: Right-sizing helper and embed
- Add the **Liquidity Reserve check**: inputs are annual spending needs and liquid assets; output is "Years of spending covered without redeeming." This turns the conversation from "Can I get out?" to "Will I need to?"
- Chips on for all four funds; the drawer holds a one-input quick sim (amount) with the Stressed preset.
- Cross-link to the Tax Lens.
- Print one-pager.
- **Done when:** the regression checklist passes.

---

## ADD-ON 5: Claim vs. Live Data Check ("Reality Check")

**The problem it solves:** brochures make claims like "defensive," "principal preservation," and "lower volatility." Recent fund data (NAV per share, distributions, repurchases) may tell a more complicated story. Advisors need both side by side so they're never surprised.
**Plain example:** "The brochure says senior secured loans protect principal. Here's what the fund's NAV per share actually did over the last 18 months, and why."
**Applies to:** all four funds. **Id:** `reality-check`

### Phase 1: Manual snapshot
- Data: `/data/addons/reality-check/<FUND>.json`, where each entry contains:
  - `claim`: paraphrased, with document name and page
  - `metric`: what data tests it (for example, "NAV per share, trailing 18 months")
  - `value`: manual snapshot from the fund's public filings, with `asOf` and `source` URL
  - `status`: one of `consistent` | `watch` | `diverges`, set by TJ, never by code
  - `context`: one or two neutral sentences explaining why
- Screen: two-column cards (Claim | What the data shows), with a small status label in neutral colors (no red "fail" styling).
- **Done when:** at least three claims per fund are entered (SAMPLE until real), each with sources.

### Phase 2: Freshness and an update script
- `scripts/update-reality-check.ts`, which TJ runs locally. It reads a simple CSV he fills in from fund fact sheets and filings, checks every row with `zod` (required fields, valid dates, numbers in range), and rewrites the JSON. **No web scraping.**
- Freshness badge: green if `asOf` is under 45 days old, amber at 45–90, grey "Stale" over 90.
- Tests: bad CSV rows are rejected with a clear message; freshness thresholds work.
- **Done when:** running the script with a test CSV updates the page correctly.

### Phase 3: Embed and reminder
- Chips on for all funds. The drawer shows the two most relevant claims and the freshness badge.
- Add a GitHub Action that opens a reminder issue monthly: "Update Reality Check data." (No server, just a reminder.)
- Print one-pager.
- **Done when:** the regression checklist passes.

---

## ADD-ON 6: Theme Exposure Map

**The problem it solves:** the AI and data center theme (the subject of Jon Gray's September 2026 investor presentation) runs through several funds at once: QTS in real estate, AirTrunk in infrastructure, and data center–related borrowers in credit. A client holding BREIT, BXINFRA, BCRED, and Nvidia stock may be far more concentrated than they realize.
**Plain example:** "You think you own four different funds. Look-through, about a third of it is betting on the same thing: data centers."
**Applies to:** all four funds and the map itself. **Id:** `themes`

### Phase 1: Theme filter on the existing map
- Data: `/data/addons/themes/tags.json`, which maps existing holding ids to themes such as "AI & data centers," "Housing," "Logistics," "Energy transition," and "Healthcare." It **references** fund JSON ids and never edits the fund files.
- Screen: a "Theme" filter chip row above the map. Picking a theme highlights matching pins **across all layers at once** and dims the rest. This is a new overlay component that reads the map's existing pin data; it does not rewrite the map. If the map has no clean overlay hook, add one small, reviewed prop and log it as the only exception.
- **Done when:** picking "AI & data centers" lights up pins across multiple fund layers, and turning the filter off restores the map exactly.

### Phase 2: Client look-through calculator
- Data: `/data/addons/themes/fund-weights.json`, with sample theme weights per fund plus source and asOf.
- Function: `lib/addons/themes/lookthrough.ts` with `lookThrough(holdings)`.
  - Input: the client's dollar amounts in each fund, plus optional public holdings the advisor tags with a theme manually.
  - Output: total dollars and % by theme, plus the largest single theme.
- Screen: holdings inputs, a horizontal bar chart by theme, and a concentration flag if one theme is above a user-set threshold (default 25%, editable, labeled ILLUSTRATIVE).
- Tests: weights summing to 100% stay consistent; empty input handled; manual tags add correctly.
- **Done when:** the four-fund-plus-Nvidia example shows a clear, correctly calculated concentration.

### Phase 3: Bull vs. bear panel
- Per theme, a two-column "Case for / Case against," each point sourced and written in your own words. For AI, the bull side can cite the video's demand and supply-shortage thesis; the bear side covers the risks it raises plus independent sources.
- Chips on all funds; the drawer shows that fund's top themes.
- Print one-pager.
- **Done when:** both sides have equal space and sources, and the regression checklist passes.

---

## ADD-ON 7: Drawdown vs. Evergreen (Family Office Mode)

**The problem it solves:** the brochures argue that individuals are underallocated. Family offices already own private assets through traditional drawdown funds, so their real question is why switch, or add, an evergreen fund.
**Plain example:** "With a drawdown fund, you promise $10M but the manager only takes it bit by bit over years, so much of it sits in cash. An evergreen fund invests it all on day one, but you accept redemption caps and different fees."
**Applies to:** all four funds (and a whole-app toggle in Phase 3). **Id:** `drawdown-vs-evergreen`

### Phase 1: Structure comparison
- Screen: a comparison table written in your own words, covering:
  - Capital calls
  - When money is invested
  - The early-years dip ("J-curve")
  - Liquidity
  - Fee structure
  - Reporting frequency
  - Paperwork
  - Fund life
- Add a "When each fits" section, neutral and two-sided.
- **Done when:** the table is accurate, sourced, and balanced.

### Phase 2: Cash-drag model
- Function: `lib/addons/drawdown-vs-evergreen/model.ts` with `compare(params)`.
  - Inputs: commitment, call schedule (default 25% per year over four years, editable), distribution timing, return on uninvested cash, assumed asset return (same for both, so the structure is the only difference), and fee rate for each structure.
  - Output: yearly % actually invested, value over time, and ending value for each structure.
- Screen: two lines ("% of money at work") plus an ending-value comparison and the ILLUSTRATIVE badge. A note explains that identical asset returns are an assumption and real results differ.
- Tests: a 100% day-one call makes both structures identical before fees; a zero cash yield behaves correctly; fees reduce the ending value monotonically.
- **Done when:** changing the call schedule visibly changes the "money at work" gap.

### Phase 3: Family Office Mode toggle
- A header toggle, **Advisor | Family Office**, stored in page memory only.
  - **Family Office mode** reorders the Toolkit home (this add-on, Theme Exposure, and Index-to-Fund first) and swaps client-script wording for investment-committee wording (for example, "your IC may ask…").
  - It changes **only** add-on content and order, never the map.
- Print one-pager formatted like an IC memo page.
- **Done when:** toggling modes changes only toolkit content, and the regression checklist passes.

---

## REGRESSION CHECKLIST (run after every single phase)

This is the "did anything break?" test. Every box must pass before merging.

- [ ] `npm run build`, `npm run test`, and `npm run e2e` all pass
- [ ] Map loads; every fund layer toggles on and off smoothly
- [ ] Every fund side panel opens and looks right; chips appear only for enabled add-ons
- [ ] Turning this add-on's flag to `false` makes it vanish completely, with no errors and no empty gaps
- [ ] Forcing an error in this add-on shows "temporarily unavailable" while the map keeps working (temporarily add `throw new Error("test")`, check, then remove it)
- [ ] Works on a phone-width screen (375px) with no sideways scrolling
- [ ] SAMPLE / ILLUSTRATIVE badges, as-of dates, sources, and the disclosure are all visible
- [ ] No "you should" or "we recommend" wording; no copied brochure text or charts
- [ ] `git diff main --stat` shows changes only in this add-on's folders, `/config/addons.ts`, and (only in Phase 3, if needed) the two allowed doorway files

---

## PROMPTS FOR CLAUDE CODE

### Foundation Prompt (paste once)
```
Read BUILD_PLAN.md (the original Atlas plan) and BUILD_PLAN_ADDONS.md. The Atlas is finished and working; do not change how it looks or behaves.

Create a git branch called addon/foundation. Build only the FOUNDATION section of BUILD_PLAN_ADDONS.md, following every Integration Rule. The only existing files you may edit are the site navigation (one link) and the fund side panel (one <AddonChips> line).

When done, run build, test, and e2e, show me `git diff main --stat`, and walk me through the Foundation Done Checklist. Do not start any add-on.
```

### Phase Prompt (reuse for every phase; fill in the blanks)
```
Read BUILD_PLAN_ADDONS.md. Create a git branch called addon/[ADDON-ID]-p[PHASE].

Build ONLY Add-on [NUMBER] ([NAME]), Phase [PHASE]. Follow every Integration Rule, especially: own folders only, feature flag, error boundary, pure tested functions, existing design tokens, no backend, data honesty, no copied brochure text.

Use SAMPLE data unless I've given you real data. Never invent real fund numbers or terms; fund terms are parameters with a source and a "verify" note.

When done: run build, test, and e2e; show me `git diff main --stat`; and walk me through this phase's "Done when" plus the full Regression Checklist. Then stop and wait for me. Do not merge.
```

Example: `Add-on 4 (Liquidity Simulator), Phase 1`, branch `addon/liquidity-p1`.

### If something breaks
```
Something broke after this phase. Do not try to patch around it.
First, set this add-on's flag to false and confirm the Atlas works again.
Then show me exactly which files changed, find the cause, and fix it inside the add-on's own folders only.
If the fix would require editing an existing Atlas file beyond the two doorways, stop and ask me first.
```

### Loading Real Data (any add-on)
```
I'm giving you real data from [DOCUMENT NAME, DATE, URL] for Add-on [NUMBER].
Update only that add-on's JSON in /data/addons/[ADDON-ID]/. Set "sample": false, fill in "asOf" and "source", and paraphrase; never copy brochure wording.
If any field I need isn't in what I gave you, leave it as sample and list what's missing. Then run the full Regression Checklist.
```
