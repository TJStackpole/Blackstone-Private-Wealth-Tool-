# Private Markets Atlas

An interactive map of where Blackstone's four retail private-markets funds (BREIT, BX Infra, BXPE, BCRED) invest, built from their latest SEC 10-Q filings.
Built from public filings as an independent prototype. **Not affiliated with Blackstone. Not investment advice.**

All five phases of `BUILD_PLAN.md` are built: BREIT, BX Infra, BXPE, BCRED, an All funds view, and the Retirement lens.
All seven add-ons in `BUILD_PLAN_ADDONS.md` are built (three phases each) as the **Advisor Toolkit**, plus a **guided tour** at `/demo`.
Live: https://private-markets-atlas.netlify.app

- `DEMO_GUIDE.md` — a walkthrough for an interview or client meeting, and honest answers to likely questions.
- `CHECKLIST.md` — every phase's done checklist and how each item was verified.

## Advisor Toolkit (add-ons)

| Tool | Page | What it does |
| --- | --- | --- |
| Liquidity Simulator | `/toolkit/liquidity` | Redemption limits, each fund's terms and history, a quarter-by-quarter simulator, and a reserve check |
| Index-to-Fund Translator | `/toolkit/index-vs-fund` | A brochure's index next to each share class, and a step-by-step bridge between them |
| Tax Lens | `/toolkit/tax-lens` | Return of capital: tax now vs. at sale, with BREIT's year-by-year figures |
| Why So Smooth? | `/toolkit/smoothing` | Appraised vs. traded values, a desmoothing chart, and answers to common pushback |
| Theme Exposure | `/toolkit/themes` | Themes across funds, a theme filter on the map, a client look-through, and sourced cases for and against |
| Drawdown vs. Evergreen | `/toolkit/drawdown-vs-evergreen` | The two structures compared, a cash-drag model, Family Office mode and an IC memo printout |
| Reality Check | `/toolkit/reality-check` | Each fund's stated objectives next to its latest filing data, with a freshness badge |

Each tool can be switched off in `config/addons.ts` (`enabled: false`) and disappears everywhere. Each runs inside its own error boundary.
Fund panels on the map show a button for each tool that applies; it opens a quick version in a side drawer.

**Changes to existing map files (logged, as the add-on plan requires):**
1. `components/Atlas.tsx`: the "Advisor Toolkit" link (Doorway A) and the `<ThemeBar>` above the sector chips (Add-on 6, Phase 1, the one exception the plan allows). ThemeBar renders nothing when the Themes add-on is off.
2. `components/DetailPanel.tsx`: `<AddonChips>` (Doorway B).
3. For the guided tour (not an add-on): `components/Atlas.tsx` accepts an optional starting view, and `app/page.tsx` renders it through `components/AtlasFromUrl.tsx`, so links like `/?view=bcred&sector=Software` open the map at that spot. The header also gained a "Take the tour" link.

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
| `components/` | The map, tabs, sector chips, detail panel, legend, and footer. `components/addons/<tool>/` holds each tool's screens; `components/demo/` the tour. |
| `lib/` | Shared types and the math that rolls metros up into state totals. `lib/addons/<tool>/` holds each tool's math, all tested. |
| `config/addons.ts` | The list of tools, with their on/off switches. |
| `data/addons/<tool>/` | Each tool's data, every figure with its source and date. |
| `tests/` | Unit tests per tool, and browser tests in `tests/e2e/`. |

## Updating the data each quarter

```bash
export SEC_USER_AGENT="Your Name you@example.com"   # SEC requires a contact for automated downloads
scripts/sec/fetch_filings.sh ./filings              # update the accession numbers inside first
python3 -I scripts/sec/build_data.py ./filings data
npm run build
```

The build script stops if any total fails to reconcile with the filing.
