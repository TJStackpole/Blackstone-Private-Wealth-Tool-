# Private Markets Atlas

An interactive map of where Blackstone's four retail private-markets funds (BREIT, BX Infra, BXPE, BCRED) invest, built from their latest SEC 10-Q filings.
Built from public filings as an independent prototype. **Not affiliated with Blackstone. Not investment advice.**

All five phases of `BUILD_PLAN.md` are built: BREIT, BX Infra, BXPE, BCRED, an All funds view, and the Retirement lens.
All seven add-ons in `BUILD_PLAN_ADDONS.md` are built (three phases each) as the **Advisor Toolkit**, plus a **guided tour** at `/demo` (a six-step short tour by default; `/demo?tour=full` for all 17 steps).
The **401(k) tab upgrade** in `BUILD_PLAN_401K.md` is built (three phases): see below.
Live: https://private-markets-atlas.netlify.app

- `DEMO_GUIDE.md` — a walkthrough for an interview or client meeting, and honest answers to likely questions.
- `CHECKLIST.md` — every phase's done checklist and how each item was verified.
- `MISSING_DATA.md` — figures the site shows as "Not in filing", and which document and section they would come from.

**On every fund page:** a "Next update expected" month beside each as-of date (from the SEC schedule: a 10-Q about 45 days after each quarter-end, a 10-K about 90 days after December 31; `lib/schedule.ts`), and **Print / Save as PDF** for a one-page fund summary. **All funds** adds a comparison table (distribution rate, fees, repurchase limit, proration, minimum investment, NAV change), every cell from that fund's own filing (`data/compare.json`, built by `scripts/sec/build_data.py`).

## Advisor Toolkit (add-ons)

| Tool | Page | What it does |
| --- | --- | --- |
| Liquidity Simulator | `/toolkit/liquidity` | Redemption limits, each fund's terms and history, a quarter-by-quarter simulator, and a reserve check |
| Index-to-Fund Translator | `/toolkit/index-vs-fund` | A brochure's index next to each share class, and a step-by-step bridge between them |
| Tax Lens | `/toolkit/tax-lens` | How each fund's payouts are taxed, from its own filings; for BREIT, return of capital: tax now vs. at sale, year by year |
| Why So Smooth? | `/toolkit/smoothing` | Appraised vs. traded values, a desmoothing chart, and answers to common pushback |
| Theme Exposure | `/toolkit/themes` | Themes across funds, a theme filter on the map, a client look-through, and sourced cases for and against |
| Drawdown vs. Evergreen | `/toolkit/drawdown-vs-evergreen` | The two structures at a glance, a money-at-work model, and a one-page IC memo printout |
| Reality Check | `/toolkit/reality-check` | Each fund's stated objectives next to its latest filing data, with a freshness badge |

Each tool can be switched off in `config/addons.ts` (`enabled: false`) and disappears everywhere. Each runs inside its own error boundary.
Fund panels on the map show a button for each tool that applies; it opens a quick version in a side drawer.

## 401(k) tab upgrade (`retirement-plus`)

The Retirement tab, rebuilt around Blackstone's 2026 paper *Expanding Retirement Investors' Access to Private Markets*. Every figure from the paper carries its page number. Switch it off with `enabled: false` in `config/addons.ts` and the tab is exactly the original Retirement lens.

| Section | What it shows |
| --- | --- |
| The 0.1% problem | Pensions about 33% in private markets, 401(k)s about 0.1% (p. 3), and three reasons it matters |
| The private slice changes with age | The published mix at ages 25 and 65 (p. 9), a straight line between them (stated on the page), and links to each asset type on the map |
| Outcome Lab | The paper's own result as the headline ($156k vs. $126k a year, p. 4), then its worker (p. 9) with returns you can change; the tool's 4%-of-balance income sits behind "See how this changes with your inputs"; a 0–3% premium strip and the paper's caveats |
| How it would reach your 401(k) | Worker → plan menu → target date fund → private slice (p. 6) |
| When many savers want out | What a rush of withdrawals does to the private share, with a link to the Liquidity Simulator |
| Two-sided questions | Fees (each fund's own fees, from its own 10-Q), liquidity, valuation, lawsuits, complexity: the concern and the response, each sourced |
| Rules and rulings so far | Dated milestones, each linked to its source |

A **Worker | Employer** switch changes wording and order, never the numbers. **Print / Save as PDF** gives a one-page summary for either view, including the reader's own Lab result.

**Changes to existing map files (logged, as the add-on plan requires):**
1. `components/Atlas.tsx`: the "Advisor Toolkit" link (Doorway A) and the `<ThemeBar>` ("Explore a theme") above the map (Add-on 6, Phase 1, the one exception the plan allows). ThemeBar renders nothing when the Themes add-on is off.
2. `components/DetailPanel.tsx`: `<AddonChips>` (Doorway B).
3. `components/RetirementView.tsx`: one slot that renders `<RetirementPlus />` inside an error boundary when the 401(k) add-on is on (Rule B).
4. For the guided tour (not an add-on): `components/Atlas.tsx` accepts an optional starting view, and `app/page.tsx` renders it through `components/AtlasFromUrl.tsx`, so links like `/?view=bcred&sector=Software` open the map at that spot. The header also gained a "Take the tour" link.

## Tests

```bash
npm test        # unit tests (Vitest): every calculator and data file
npm run e2e     # builds the site, then browser tests (Playwright): map, every tool, every drawer, the tour
```

## Updating the Reality Check each quarter

```bash
npm run reality-check:export    # writes reality-check.csv from the live data
# edit reality-check.csv from the funds' new filings; set each status yourself
npm run reality-check:update    # checks every row; nothing changes if any row has a problem
```

A GitHub Action opens a reminder issue on the 1st of each month.

## Run it on your computer

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Check the build

```bash
npm run build
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. On vercel.com, click **Add New → Project**, pick the repository, and click **Deploy**.
   No settings need to change. Vercel detects Next.js automatically.

## Where things live

| Folder / file | What it is |
| --- | --- |
| `data/*.json` | One file per fund, generated from SEC filings by `scripts/sec/build_data.py`. `retirement.json` holds the illustrative 401(k) lens. |
| `scripts/sec/` | Downloads the filings from EDGAR and rebuilds the data, checking every total against the filing. |
| `data/layers.ts` | The list of map layers (one per fund). Adding a fund = add one JSON file + one entry here. |
| `components/` | The map, tabs, detail panel (its Sector mix doubles as the sector filter), legend, and footer. `components/addons/<tool>/` holds each tool's screens; `components/demo/` the tour. |
| `lib/` | Shared types and the math that rolls metros up into state totals. `lib/addons/<tool>/` holds each tool's math, all tested. |
| `config/addons.ts` | The list of tools, with their on/off switches. |
| `data/addons/<tool>/` | Each tool's data, every figure with its source and date. |
| `tests/` | Unit tests per tool, and browser tests in `tests/e2e/`. |

## Refreshing the data

When the funds file new 10-Qs (about 45 days after each quarter ends: mid-May, mid-August, mid-November; the 10-K about 90 days after December 31), one command updates all four funds.

**One-time setup:** install Node.js and Python 3, then run `npm install` in this folder.

**Each time:**

1. Tell the SEC who's asking (it requires a contact name on automated downloads):
   ```bash
   export SEC_USER_AGENT="Your Name you@example.com"
   ```
2. Run:
   ```bash
   npm run refresh-data
   ```
   It (1) checks EDGAR for each fund's newest 10-Q and 10-K, (2) downloads them, with the chart images, into `filings/<today>/`, (3) rebuilds every fund file and checks each figure against the totals the filing itself prints, (4) runs all the tests, and (5) prints each headline figure, old → new. **Nothing in `data/` changes unless every check and every test passes.**
3. What you'll see:
   - **"Up to date"**: the site already has the newest filings. Nothing to do.
   - **"Done"** with the old → new table: run `npm run build`, look over the site, then publish.
   - **"RECONCILIATION FAILED"** or **"STOPPED"**: something didn't match or couldn't be found. Nothing was changed. Go to step 4.
4. A new quarter usually needs a short by-hand pass the first time, because some things can't be read automatically:
   - **Chart figures.** BREIT's sector, region and largest-state shares and BXPE's sector and region shares are printed only as charts. Open the chart images in `filings/<today>/` and update the lines marked `CHART` in `scripts/sec/build_data.py`.
   - **Wording that names the period.** The builder looks for phrases such as "three months ended June 30, 2026" and "six months". A new quarter changes them; the STOPPED message names the line to update.
   - **BCRED's buyback proration** comes from its letter to investors (an SEC exhibit, not the 10-Q). Save the new letter's text in `filings/<today>/` and point `bcred_letter` in `FILES` (top of `build_data.py`) at it.
   - **Hand-written text that quotes figures:** talking points (`data/talking-points.json`), Reality Check (see below), the Tax Lens fund pages (`data/addons/tax-lens/funds.json`) and the tour (`lib/demo/steps.ts`). The tests flag talking-point figures that no longer match the data.

   Then run `npm run refresh-data` again. Tip: you can hand this step to Claude Code: "Run npm run refresh-data and fix what it stops on, from the new filings."

Figures that no filing gives stay as "Not in filing"; `MISSING_DATA.md` lists them and where they would come from. To rebuild from the exact June 30, 2026 filings instead, use `scripts/sec/fetch_filings.sh ./filings` then `python3 -I scripts/sec/build_data.py ./filings data`.
