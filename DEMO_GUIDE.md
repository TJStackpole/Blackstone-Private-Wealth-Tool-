# Demo guide — Private Markets Atlas

A five-minute walkthrough you can follow in an interview, plus honest answers to the questions you are most likely to get.

Live site: https://private-markets-atlas.netlify.app
Guided tour (six steps): https://private-markets-atlas.netlify.app/demo · Full tour (all 17): https://private-markets-atlas.netlify.app/demo?tour=full

## The one-sentence pitch

"It maps where Blackstone's four retail private-markets funds invest, using only their SEC filings (the latest 10-Qs, plus the month-end NAV filings between them), and it's explicit about what each filing does and doesn't disclose."

## The insight to lead with

Each fund's filing discloses geography at a different level of detail, so each map is drawn at that level and no finer:

| Fund | What the 10-Q gives | How the site draws it |
| --- | --- | --- |
| BREIT (real estate) | U.S. regions, its three largest states, and a table of named investments with cities | U.S. map shaded by region, the three largest states labeled, dots counting named investments per state |
| BX Infra (infrastructure) | Americas / EMEA / APAC per holding | World map by region; sector filter re-splits by region |
| BXPE (private equity) | Americas / EMEA / APAC, and only two named companies | Same as BX Infra |
| BCRED (private credit) | Country groups, and every borrower by name (653 portfolio companies), but no borrower addresses | World map by country group, plus the 12 largest borrowers |

"I could have drawn a prettier state-level map for every fund. But the filings don't support it, so I didn't."

## Walkthrough (click in this order)

1. **Real Estate (BREIT).** Point out the two boxes: the **Latest monthly update** has $57.7B of NAV and $14.65 per Class I share at September 30; the **Last quarterly report** has 4,530 properties at June 30. The map is shaded by region (South 35%, West 28%, East 20%, Midwest 12%), and Texas, Georgia and Florida are labeled 11% each. Those are the only states the filing gives a figure for. Click **Nevada**: the panel lists the 18 Nevada investments the filing names, with units, occupancy and ownership. Then click **Data Centers**. The shading stays, because the filing doesn't split regions by sector, and the panel says so.
2. **Infrastructure (BX Infra).** Click **Americas**: 58.9%, and the named holdings there. Point out that the biggest holdings are code names like "Mercury Co-Invest L.P.". Click **Transportation Infrastructure** and the region split changes to that sector's own figures, from the schedule of investments. Scroll to the dashed **Context** card: third-party data, cited separately from the filing.
3. **Private Equity (BXPE).** The sector and region mix comes from the fund's own charts in the 10-Q; each sector's regional split comes from its schedule of investments. Click **Technology & Services**: 91.1% Americas, and the panel names Fortis Holdco L.P., one of only two companies the filing names.
4. **Credit (BCRED).** Under the one-line summary sit the fund's tools (Talking points, Print, and the Advisor tools), then two dated boxes. **Latest monthly update**, from BCRED's October 21 8-K: NAV per share $23.51 at September 30, net assets about $41.1B, a 9.2% distribution rate on October's $0.18 (down from $0.20 in June, next to the first half's $1.20 paid against $1.07 earned), and leverage of 0.82x. **Last quarterly report**, from the June 30 10-Q: net assets $47.6B → $42.8B, NAV per share $24.79 → $23.65, a pro-rata buyback of 5.0% (7.0% in Q1), non-accruals up from 9 to 15 issuers, payout against income, and 653 portfolio companies. Each figure shows once, with its direction, what it's compared with and its source. For a credit fund the borrowers are the story, so the 12 largest (Dropbox, IRI, Guidehouse and others) take the map's place; click **Insurance** in the panel's Sector mix to filter them. The map is one click away under **Geography**.
5. **All funds.** "Four funds, four levels of detail." Click **Open** on any card.
6. **Retirement (401(k)).** Open with the two bars: pensions about 33% in private markets, 401(k)s about 0.1%. Drag the age slider to show the private slice shifting from growth to income. In the **Outcome Lab**, point to the paper's headline result ($156k vs. $126k a year in retirement; $3.3M vs. $2.8M at 65), then set "Public return" lower or "Extra fees" higher and watch the gap shrink. The premium strip says it plainly: if private only matches public, the extra is $0. Scroll through the two-sided questions, then flip **Worker / Employer**: the order and wording change, the numbers don't. **Print / Save as PDF** makes a one-page summary for either view.
7. **Dark mode and phone.** Toggle **Dark**, then narrow the window: the panel becomes a bottom sheet.

## Then the Advisor Toolkit (five more minutes)

8. **From the map.** On BCRED's panel, under **Advisor tools**, click **Liquidity**. A drawer slides in with a quick simulation: "you ask for $500,000; in a stressed quarter about half is paid, and the rest the next quarter if you ask again." Click **Full view**.
9. **Liquidity Simulator.** Show **How the line works** (everyone in line gets the same fraction), then the presets. Scroll to **When the limits have applied**: BREIT 2022–2024 and BCRED in Q2 and Q3 2026, each linked to the filing or tender letter. Then the **reserve check**: "the question behind 'can I get out?' is 'will I need to?'"
10. **Index-to-Fund.** Pick BCRED. The index (Cliffwater) made 3.0% in the half-year; Class I made 0.2%. The bridge shows why, step by step, and switching to Class S shows the servicing fee.
11. **Theme Exposure.** Back on the map, click **AI & data centers** under **Explore a theme**, then switch to Infrastructure: the theme carries over. In the toolkit, the look-through example (four funds plus Nvidia) lands at 27% in one theme. Show the case for and against, sourced on both sides.
12. **For family offices.** Drawdown vs. Evergreen compares the two fund structures and prints as a one-page IC memo. (A Family Office mode for the toolkit is planned; its switch is hidden for now.) Every tool page is written so it can be shared with a client as is: no advisor scripts.
13. **Reality Check.** Each fund's own stated objectives next to its filing data. The labels are drafts for you to confirm; the code never sets them. The freshness badge shows the data is from June 30.

## Questions you may get, and honest answers

**"Is this real data?"**
Yes. The map, sector mix, holdings and quarter figures come from each fund's Form 10-Q for the quarter ended June 30, 2026, filed in August 2026. The **Latest monthly update** figures (September 30, 2026) come from the month-end 8-Ks each fund filed on October 21–22, 2026, and BREIT's NAV prospectus supplement. Each panel links to the exact filing. A handful of figures (BREIT's sector and region pies and its top-states map; BXPE's sector and region pies) are read from charts embedded in the same filings, because those breakdowns only exist as images there.

**"How do you know you parsed it right?"**
The build script reconciles every total against the number the filing prints, and stops if anything doesn't match. BREIT's investment table matches the property count for every sector (4,530 total). Every position in BCRED's schedule of investments sums to the filing's $77,649,107 thousand, to the thousand dollars. Counts like BCRED's 653 portfolio companies are read from the filing rather than computed. BX Infra and BXPE match their schedule totals exactly.

**"Why isn't every fund on a U.S. state map?"**
Because their filings don't report states. BX Infra and BXPE report only continents. BCRED names its borrowers but not where they're headquartered. Drawing state maps would mean inventing data.

**"Why do some BREIT states with no dots still have color?"**
The color is the region's share, the finest level the filing reports. Dots count named investments listed with a city in that state. 60 of the 191 listed investments, holding 4,200 of the 4,530 properties, are listed only as "Various" or a non-U.S. place, so dots understate where the big portfolios are. The panel says this.

**"Why does BXPE show $14.2B when other numbers mention $17.3B?"**
BXPE and BX Infra each invest through an "aggregator" vehicle that also holds money from a parallel fund. The headline net assets are the fund's own ($14.2B for BXPE U.S., which owns 83.7% of the aggregator; $5.2B for BX Infra U.S., which owns 94.5%). Holding percentages are shares of the aggregator's net assets, because that's how the schedule of investments reports them. The panel says so.

**"Where's BCRED's redemption cap from?"**
The 10-Q: at the board's discretion the fund may buy back up to 5% of shares per quarter, at quarter-end NAV, with a 98% price for shares held under a year. It's a target, not a guarantee: the fund bought back 7% in Q1 and pro-rated requests in Q2. BREIT's 10-Q states 2% of NAV per month and 5% per quarter, and that the board can repurchase fewer shares or none.

**"How would you update it next quarter?"**
Run two commands: one downloads the new filings from EDGAR, one rebuilds the data files and re-checks the totals. See `scripts/sec/`. The accession numbers are the only thing to change.

**"Is this affiliated with Blackstone?"**
No. No logo, no fonts from their site, fund names in plain text only. The disclaimer is in the footer of every view. Blackstone's fund websites block automated access, so the one website quote used (BCRED's description of its own focus) came via search and is cited separately from the filing.

**"What's the stack?"**
Next.js, TypeScript, Tailwind. Maps use react-simple-maps over the free us-atlas and world-atlas shapes, so there are no map API keys. Charts use recharts. A Python script parses the SEC filings. There's no backend: it builds to static files and deploys to Netlify or Vercel with no configuration.

**"Where do the toolkit's numbers come from?"**
Fund terms, fees, returns and tax splits come from each fund's 10-Q and 10-K, with links. Index figures (NFI-ODCE, Cliffwater, Cambridge) are marked SAMPLE because they come from the providers' public releases found through search, not opened documents; private infrastructure indices are licensed, so none is shown. The smoothing chart uses a clearly labeled synthetic series because the real indices are licensed.

**"Isn't the calculator just making things up?"**
Every calculator is a small, tested function: same inputs, same answer. Each result is labeled ILLUSTRATIVE, shows its inputs, and the defaults come from the filings. There are over 100 automated tests, including hand-checked cases (for example, the Tax Lens one-year case: $5,000 paid, $1,000 taxed now, basis down $4,000).

**"Two details people get wrong."**
BCRED prorated repurchases in two quarters (Q2 and Q3 2026), not three. And BX Infra's filing doesn't name AirTrunk; the related holding appears as "Eucalyptus I HoldCo (CYM) L.P." in Asia-Pacific digital infrastructure. The site sticks to what the filings say.

**"Could a tool break the map?"**
No. Each tool lives in its own folders, sits inside an error boundary, and has an on/off switch in `config/addons.ts`. The only changes to the map's own files are the toolkit link, the tool buttons in the panel, the theme row, and the tour's link support, all listed in the README.

## Where things live

| Path | What it is |
| --- | --- |
| `scripts/sec/fetch_filings.sh` | Downloads the 10-Qs and chart images from EDGAR. Needs `SEC_USER_AGENT` set to a name and email (SEC rule). |
| `scripts/sec/build_data.py` | Parses the filings, reconciles totals, writes `data/*.json`. |
| `data/*.json` | One file per fund, generated. `retirement.json` holds the illustrative 401(k) lens. |
| `components/UsRegionMap.tsx`, `components/WorldMap.tsx` | The two map types. |
| `components/DetailPanel.tsx` | The panel (bottom sheet on phones). |
| `lib/regions.ts` | NCREIF regions for BREIT; continent and country-group assignment for the world map. |
