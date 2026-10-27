# Private Markets Atlas

An interactive map of where Blackstone's four retail private-markets funds (BREIT, BX Infra, BXPE, BCRED) invest, built from their latest SEC 10-Q filings.
Built from public filings as an independent prototype. **Not affiliated with Blackstone. Not investment advice.**

All five phases of `BUILD_PLAN.md` are built: BREIT, BX Infra, BXPE, BCRED, an All funds view, and the Retirement lens.
All seven add-ons in `BUILD_PLAN_ADDONS.md` are built (three phases each), now merged into four tools in the **Advisor Toolkit**, plus a **guided tour** at `/demo` (a six-step short tour by default; `/demo?tour=full` for all 15 steps).
The **401(k) tab upgrade** in `BUILD_PLAN_401K.md` is built (three phases): see below.
Live: https://private-markets-atlas.netlify.app

- `DEMO_GUIDE.md` — a walkthrough for an interview or client meeting, and honest answers to likely questions.
- `CHECKLIST.md` — every phase's done checklist and how each item was verified.
- `MISSING_DATA.md` — figures the site shows as "Not in filing", and which document and section they would come from.

**Where the site opens:** a **Start here** screen (`components/StartScreen.tsx`) with three ways in (explain one fund, compare the funds, answer a client question) and, below them, **Ask AI**: the AI assistant built into the page (`components/chat/InlineChat.tsx`) with ready-made questions to click. It is the same assistant and the same conversation as the corner panel (see AI assistant below); while it is on screen the corner button steps aside. The site's name in the header goes back to Start, and Back/Forward move between Start and the views.

**Each fund opens in five answers** (`components/FundBrief.tsx`, built by `lib/fundBrief.ts`): what it is, what it pays, how to get money out, what changed lately and the main risk, each dated with a **Sources** link, plus **Copy these answers**, **Print / Save as PDF** and the fund's tools. **See the details** (`/?view=bcred&details=1`) opens the map, sector mix, holdings and the two number boxes below.

**Plain definitions:** words with a dotted underline open a pop-up with a one-line definition, the filing's own words and the source (`data/glossary.json`, 31 terms; `components/Term.tsx`, `components/Glossed.tsx`). A definition that states one fund's own terms (BREIT's 2% monthly limit, say) is linked only on that fund's content, or shown as a labeled example in the comparison table. The quotes were checked word for word against the cited filings; `tests/map/glossary.test.tsx` checks every figure in a plain line is in its quote.

**Your client, set once:** the **Client** button in the header holds the client's state, federal bracket and amount (saved in the browser), and every tool uses them.

**In the details:** a **Latest monthly update** box with the newest month-end NAV, size and distribution from the filings between 10-Qs (see "Monthly updates"), a "Next update expected" month beside each as-of date (from the SEC schedule: a 10-Q about 45 days after each quarter-end, a 10-K about 90 days after December 31; `lib/schedule.ts`), a **Last quarterly report** box with the 10-Q's figures (each figure shows once: `lib/quarter.ts` folds the stat cards in and leaves the distribution rate to the monthly box when it has a newer one), and **Print / Save as PDF** for a one-page fund summary with a "Getting money out" line. The address follows the tab (`/?view=bcred`), so a fund can be shared as a link. **All funds** is a comparison table (size, value per share and its change since December 31, distribution rate, fees, repurchase limit, early-sale deduction, proration, minimum investment) for the funds you pick (two on a phone, all four on a wide screen), with a **Show sources** switch; every cell is from that fund's own filing (`data/compare.json`, built by `scripts/sec/build_data.py`, with month-end cells from `data/latest.json`).

## Advisor Toolkit (add-ons)

| Tool | Page | Client question | What it does |
| --- | --- | --- | --- |
| Getting money out | `/toolkit/liquidity` | Can my client get their money out? | Redemption limits, each fund's terms and history, a quarter-by-quarter simulator and a reserve check; second tab **Evergreen or drawdown?** (was Drawdown vs. Evergreen) with the money-at-work model and one-page IC memo |
| Taxes | `/toolkit/tax-lens` | How are the payouts taxed? | How each fund's payouts are taxed, from its own filings; for BREIT, return of capital: tax now vs. at sale, year by year; federal, NIIT and state |
| Returns, explained | `/toolkit/smoothing` | Why do the returns look the way they do? | Appraised vs. traded values and a desmoothing chart; second tab **From an index to the fund** (was the Index-to-Fund Translator) |
| Goals vs. results | `/toolkit/reality-check` | Does it do what it says? | Each fund's stated objectives next to its latest filing data, with a freshness badge |

Merged tools keep their old addresses: `/toolkit/drawdown-vs-evergreen` forwards to `/toolkit/liquidity#structure`, `/toolkit/index-vs-fund` to `/toolkit/smoothing#index`, and `/toolkit/themes` to BREIT's map with the AI & data centers theme on (themes live on the map's theme row, with their case for and against under it). Each tool can be switched off in `config/addons.ts` (`enabled: false`) and disappears everywhere. Each runs inside its own error boundary.
Each fund's page shows a button for each tool that applies; it opens a quick version in a side drawer.

## 401(k) tab upgrade (`retirement-plus`)

The Retirement tab, rebuilt around Blackstone's 2026 paper *Expanding Retirement Investors' Access to Private Markets*. Every figure from the paper carries its page number. Switch it off with `enabled: false` in `config/addons.ts` and the tab is exactly the original Retirement lens.

| Section | What it shows |
| --- | --- |
| The 0.1% problem | Pensions about 33% in private markets, 401(k)s about 0.1% (p. 3), and three reasons it matters |
| The private slice changes with age | The published mix at ages 25 and 65 (p. 9), a straight line between them (stated on the page), and links to each asset type on the map |
| Outcome Lab | The paper's own result as the headline ($156k vs. $126k a year, p. 4), then its worker (p. 9) with returns you can change; the tool's 4%-of-balance income sits behind "See how this changes with your inputs"; a 0–3% premium strip and the paper's caveats |
| How it would reach your 401(k) | Worker → plan menu → target date fund → private slice (p. 6) |
| When many savers want out | What a rush of withdrawals does to the private share, with a link to Getting money out |
| Two-sided questions | Fees (each fund's own fees, from its own 10-Q), liquidity, valuation, lawsuits, complexity: the concern and the response, each sourced |
| Rules and rulings so far | Dated milestones, each linked to its source |

A **Worker | Employer** switch changes wording and order, never the numbers. **Print / Save as PDF** gives a one-page summary for either view, including the reader's own Lab result.

**Changes to existing map files (logged, as the add-on plan requires):**
1. `components/Atlas.tsx`: the "Advisor Toolkit" link (Doorway A) and the `<ThemeBar>` ("Explore a theme") above the map (Add-on 6, Phase 1, the one exception the plan allows). ThemeBar renders nothing when the Themes add-on is off.
2. `components/FundBrief.tsx` (was `components/DetailPanel.tsx`): `<AddonChips>` (Doorway B), under the fund's five answers.
3. `components/RetirementView.tsx`: one slot that renders `<RetirementPlus />` inside an error boundary when the 401(k) add-on is on (Rule B).
4. For the guided tour (not an add-on): `components/Atlas.tsx` accepts an optional starting view, and `app/page.tsx` renders it through `components/AtlasFromUrl.tsx`, so links like `/?view=bcred&sector=Software` open the map at that spot. The header also gained a "Take the tour" link.

## AI assistant ("Ask AI")

A chat panel on every page (button bottom-right; full screen on phones), also built into the bottom of the opening page, that answers questions about BREIT, BCRED, BXPE and BX Infra. Both show one conversation (`components/chat/useChat.ts`), which lasts for the browser tab's session.

**How it works.** The panel (`components/chat/ChatAssistant.tsx`) or the opening page's chat posts the question and the recent conversation to `/api/chat`, a Netlify Function (`netlify/functions/chat/chat.mts`). The function calls the Anthropic Messages API with `claude-sonnet-5-5` and streams the answer back. The API key is read **only** there, from the `ANTHROPIC_API_KEY` environment variable; it is never in front-end code or any committed file.

**Sources are locked down** (`netlify/functions/chat/policy.ts`):
- Web search (`web_search_20260318`) may return only blackstone.com, breit.com, bcred.com, bxpe.com, bxinfra.com and, on sec.gov, only the four funds' own EDGAR folders (CIKs 1662972, 1803498, 1930054, 2030772).
- Web fetch (`web_fetch_20260318`) has the same sites (it can't be narrowed by path, so it gets sec.gov by domain) and may open only addresses those searches returned, not ones a visitor pastes in.
- The system prompt tells the model to use only those sources and the four funds' own SEC filings (10-Q, 10-K, 8-K, prospectus supplements, tender offers), never news, blogs or memory; to cite a link in every answer; to link only official videos on Blackstone's sites; to say when an answer isn't in an official source; to give no investment advice; to stay on topic; and to end with the educational note.
- A final check (`sanitize.ts`) strips any link outside those sites before it is shown, and adds the educational note if missing.

**Speed.** A new question takes about 5 to 10 seconds. Both tools are called directly (`allowed_callers: ["direct"]`) rather than through dynamic filtering, which ran a round of code for every search and made answers take 15 to 40 seconds; the model runs at `low` effort (`EFFORT` in `policy.ts`), which suits look-up questions; and the instructions ask for one search where that will do. A first question asked again within 12 hours (the ready-made ones especially) gets the saved answer at once (`cache.ts`, Netlify Blobs store `chat-answers`): the same question typed differently counts as the same, follow-ups and answers that were cut short, declined or not found are never saved, a saved answer says how old it is, and changing the model, instructions or tools starts afresh. Saved answers don't count toward the hourly limit.

**Plain answers.** The instructions ask for answers a reader with no finance background can follow: the answer first in a sentence or two, up to four short points, terms explained the first time, under about 150 words. Under the newest answer, **Explain it more simply** asks for a simpler version of it, without a new search.

**Safeguards:** at most 3,000 output tokens per answer, 3 searches and 2 page reads; questions up to 1,000 characters; 20 questions per visitor (by hashed IP) per rolling hour, counted in Netlify Blobs (`rateLimit.ts`), plus Netlify's edge limit of 6 a minute per IP; the function stops itself at 52 seconds (Netlify's limit is 60). A declined answer is retried on another model by the API's server-side fallback (`fallbacks: "default"`); remove those two lines in `chat.mts` to turn that off.

**Settings** (Netlify, Site configuration, Environment variables; scope must include Functions):

| Variable | Required | What it does |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Yes | The Anthropic key. Mark it as a secret. |
| `CHAT_ENABLED` | No | `false` switches the assistant off (it answers "switched off for now"). |
| `CHAT_QUESTIONS_PER_HOUR` | No | Changes the hourly limit (default 20). |
| `CHAT_IP_SALT` | No | Any random text; mixed into the IP hash. |

Also set a monthly spend limit for the key's workspace in the Claude Console, and check that web search is enabled for the organization there (Settings, Capabilities). Web search costs $10 per 1,000 searches plus tokens; web fetch costs tokens only.

**Test it locally.** Install the Netlify CLI, link the site and run `netlify dev` (it loads the site's environment variables, including the key, for local use only):

```bash
npm install -g netlify-cli
netlify login
netlify link          # pick the private-markets-atlas site
netlify dev           # opens http://localhost:8888 with /api/chat
```

**Deploy.** Commit and push; if the site deploys from Git, Netlify builds the site and the function together. Or from the CLI: `netlify deploy` for a draft URL to try first, then `netlify deploy --prod`. After a deploy, the function's logs are under Logs, Functions, `chat` in the Netlify UI.

## Tests

```bash
npm test        # unit tests (Vitest): every calculator and data file
npm run e2e     # builds the site, then browser tests (Playwright): map, every tool, every drawer, the tour
```

## Updating Goals vs. results (the Reality Check) each quarter

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
   - **Hand-written text that quotes figures:** talking points (`data/talking-points.json`, used in each fund's five answers), Goals vs. results (see "Updating Goals vs. results (the Reality Check) each quarter" above), the Taxes fund pages (`data/addons/tax-lens/funds.json`) and the tour (`lib/demo/steps.ts`). The tests flag talking-point figures that no longer match the data.

   Then run `npm run refresh-data` again. Tip: you can hand this step to Claude Code: "Run npm run refresh-data and fix what it stops on, from the new filings."

### Monthly updates

Between 10-Qs, each fund files its month-end NAV about three weeks after the month ends: an 8-K for BX Infra, BXPE and BCRED, and a prospectus supplement (Form 424B3) for BREIT, which also files an 8-K with its monthly distribution. The site shows these in a **Latest monthly update** box on each fund page, dated on its own, above the quarter's box. They also feed each fund's five answers and the comparison table's value-per-share and distribution-rate rows. The map, sector mix and holdings stay on the last 10-Q, because the monthly filings don't give them. The figures live in `data/latest.json`, built by `scripts/sec/build_monthly.py`.

**Each month** (around the 22nd, once all four funds have filed):

1. Set `SEC_USER_AGENT` as in step 1 above.
2. Run:
   ```bash
   npm run refresh-monthly
   ```
   It (1) finds each fund's month-end filings on EDGAR that are newer than the site's, reading each filing to tell which is which, (2) saves them in `filings/<today>-monthly/`, (3) reads every figure and checks it (BREIT's NAV by class must add up to the total the filing prints), (4) runs all the tests, and (5) prints each figure, old → new. **Nothing in `data/` changes unless every check and every test passes.**
3. What you'll see:
   - **"Up to date"**: nothing newer yet.
   - **"Not every fund has filed this month's figures yet"**: one or more funds haven't filed. Try again in a few days.
   - **"Done"**: run `npm run build`, look over the site, then publish.
   - **"STOPPED"**: a filing's wording changed. Nothing was changed. The message names the line in `scripts/sec/build_monthly.py` to update. You can hand this to Claude Code: "Run npm run refresh-monthly and fix what it stops on, from the new filings."
4. Hand-written text that quotes these figures: the talking points (`data/talking-points.json`) and the Taxes cards for BCRED's distribution rate and BX Infra's quarterly distribution (`data/addons/tax-lens/funds.json`).

After a new 10-Q, run `npm run refresh-data` first. The monthly figures are then compared with that quarter.

### Tax rates (each January)

Every tax figure in Taxes adds three things: the federal rate (bracket and capital gains rate, set in the calculator), the 3.8% federal net investment income tax (IRS Topic 559), and the client's state. State rates are each state's top rate, from the Tax Foundation's yearly table, in `data/addons/tax-lens/states.json`. To update them when the new table comes out:

```bash
curl -sL -A "Mozilla/5.0" -o states.html https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/
python3 -I scripts/sec/html2txt.py states.html states.txt
python3 -I scripts/tax/state_rates.py states.txt data/addons/tax-lens/states.json
```

(Change `2026` in the address to the new year, and the same year in `URL` at the top of `scripts/tax/state_rates.py`.) The script stops without writing anything unless it finds all 50 states and DC.

Figures that no filing gives stay as "Not in filing"; `MISSING_DATA.md` lists them and where they would come from. To rebuild from the exact June 30, 2026 filings instead, use `scripts/sec/fetch_filings.sh ./filings` then `python3 -I scripts/sec/build_data.py ./filings data`.
