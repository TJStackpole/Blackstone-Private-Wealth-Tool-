# Demo guide — Private Markets Atlas

A five-minute walkthrough you can follow in an interview, plus honest answers to the questions you are most likely to get.

Live site: https://private-markets-atlas.netlify.app

## The one-sentence pitch

"It maps where Blackstone's four retail private-markets funds invest, using only their latest SEC 10-Q filings, and it's explicit about what each filing does and doesn't disclose."

## The insight to lead with

Each fund's filing discloses geography at a different level of detail, so each map is drawn at that level and no finer:

| Fund | What the 10-Q gives | How the site draws it |
| --- | --- | --- |
| BREIT (real estate) | U.S. regions, its three largest states, and a table of named investments with cities | U.S. map shaded by region, the three largest states labeled, dots counting named investments per state |
| BX Infra (infrastructure) | Americas / EMEA / APAC per holding | World map by region; sector filter re-splits by region |
| BXPE (private equity) | Americas / EMEA / APAC, and only two named companies | Same as BX Infra |
| BCRED (private credit) | Country groups, and all ~800 borrowers by name, but no borrower addresses | World map by country group, plus the 12 largest borrowers |

"I could have drawn a prettier state-level map for every fund. But the filings don't support it, so I didn't."

## Walkthrough (click in this order)

1. **Real Estate (BREIT).** Point out the stats: $56.6B NAV, $14.53 per Class I share, 4,530 properties. The map is shaded by region (South 35%, West 28%, East 20%, Midwest 12%), and Texas, Georgia and Florida are labeled 11% each. Those are the only states the filing gives a figure for. Click **Nevada**: the panel lists the 18 Nevada investments the filing names, with units, occupancy and ownership. Then click **Data Centers**. The shading stays, because the filing doesn't split regions by sector, and the panel says so.
2. **Infrastructure (BX Infra).** Click **Americas**: 58.9%, and the named holdings there. Point out that the biggest holdings are code names like "Mercury Co-Invest L.P.". Click **Transportation Infrastructure** and the region split changes to that sector's own figures, from the schedule of investments. Scroll to the dashed **Context** card: third-party data, cited separately from the filing.
3. **Private Equity (BXPE).** Sector and region numbers come straight from the fund's own charts in the 10-Q. Click **Technology & Services**: 91.1% Americas, and the panel names Fortis Holdco L.P., one of only two companies the filing names.
4. **Credit (BCRED).** NAV per share fell from $24.79 to $23.65 in six months, and non-accruals rose from 9 to 15 issuers. Both are in the filing. Show the 12 largest borrowers (Dropbox, IRI, Guidehouse and others). Click **Insurance** to filter them. Scroll to **How this fund works**.
5. **All funds.** "Four funds, four levels of detail." Click **Open** on any card.
6. **Retirement.** Drag the slider. "This is a business line, not a fund, so every number is labeled illustrative. The timeline items each link to a source."
7. **Dark mode and phone.** Toggle **Dark**, then narrow the window: the panel becomes a bottom sheet.

## Questions you may get, and honest answers

**"Is this real data?"**
Yes. Every fund number comes from that fund's Form 10-Q for the quarter ended June 30, 2026, filed in August 2026. Each panel links to the exact filing. A handful of figures (BREIT's sector and region pies and its top-states map; BXPE's sector, region and strategy pies) are read from charts embedded in the same filings, because those breakdowns only exist as images there.

**"How do you know you parsed it right?"**
The build script reconciles every total against the number the filing prints, and stops if anything doesn't match. BREIT's investment table matches the property count for every sector (4,530 total). BCRED's 806 companies sum to the filing's $77,649,107 thousand to the dollar. BX Infra and BXPE match their schedule totals exactly.

**"Why isn't every fund on a U.S. state map?"**
Because their filings don't report states. BX Infra and BXPE report only continents. BCRED names its borrowers but not where they're headquartered. Drawing state maps would mean inventing data.

**"Why do some BREIT states with no dots still have color?"**
The color is the region's share, the finest level the filing reports. Dots count named investments listed with a city in that state. 58 of the 189 listed investments, holding 4,200 of the 4,530 properties, are listed only as "Various", so dots understate where the big portfolios are. The panel says this.

**"Where's BCRED's redemption cap from?"**
The 10-Q describes quarterly tender offers at quarter-end NAV and the 98% early-repurchase price. The 5%-of-shares cap is in BCRED's offering terms, not the 10-Q, and the site cites it that way. BREIT's 10-Q does state 2% of NAV per month and 5% per quarter.

**"How would you update it next quarter?"**
Run two commands: one downloads the new filings from EDGAR, one rebuilds the data files and re-checks the totals. See `scripts/sec/`. The accession numbers are the only thing to change.

**"Is this affiliated with Blackstone?"**
No. No logo, no fonts from their site, fund names in plain text only. The disclaimer is in the footer of every view. Blackstone's fund websites block automated access, so the one website quote used (BCRED's description of its own focus) came via search and is cited separately from the filing.

**"What's the stack?"**
Next.js, TypeScript, Tailwind. Maps use react-simple-maps over the free us-atlas and world-atlas shapes, so there are no map API keys. Charts use recharts. A Python script parses the SEC filings. There's no backend: it builds to static files and deploys to Netlify or Vercel with no configuration.

## Where things live

| Path | What it is |
| --- | --- |
| `scripts/sec/fetch_filings.sh` | Downloads the 10-Qs and chart images from EDGAR. Needs `SEC_USER_AGENT` set to a name and email (SEC rule). |
| `scripts/sec/build_data.py` | Parses the filings, reconciles totals, writes `data/*.json`. |
| `data/*.json` | One file per fund, generated. `retirement.json` holds the illustrative 401(k) lens. |
| `components/UsRegionMap.tsx`, `components/WorldMap.tsx` | The two map types. |
| `components/DetailPanel.tsx` | The panel (bottom sheet on phones). |
| `lib/regions.ts` | NCREIF regions for BREIT; continent and country-group assignment for the world map. |
