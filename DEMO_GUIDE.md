# Demo guide — Private Markets Atlas

A five-minute walkthrough you can follow in an interview, plus the honest answers to the questions you are most likely to get.

## The one-sentence pitch

"It's an interactive map that shows where each of Blackstone's retail private-markets funds actually invests, one fund at a time, built only from public filings, ending with a lens on the 401(k) push."

## Walkthrough (click in this order)

1. **Real Estate (BREIT).** Start here. Point out: the map is shaded by how much of the fund sits in each state, the rings are metros sized by weight. Click **Texas**. The panel shows the state total, the metros, and a sector breakdown. Click a sector chip like **Data Centers** and watch the map and panel re-filter together. Click **All sectors** to reset.
2. **Infrastructure (BX Infra).** Same map, same panel, new fund. Click **Data Centers**, then **Virginia**. Scroll the panel to the dashed **Context** card. Say: "That number is third-party data from Berkeley Lab, so it's cited separately from the fund's own filings. Facts from outside the filings never mix with facts from inside them."
3. **Private Equity (BXPE).** Point at the grey banner at the top of the panel: "This fund owns companies, not buildings, so the map is by headquarters. The site knows that from the data file and shows the caveat automatically." Click the **Bay Area** dot on the map. The panel expands to list the companies there.
4. **Credit (BCRED).** Same headquarters caveat. Scroll the panel to **How this fund works**. Say: "Plain English, dated, and sourced from the fund's own offering terms."
5. **All funds.** "Four funds, one country, side by side. This is visually what a combined multi-asset fund is made of." Click **Open** on any one to jump back.
6. **Retirement.** Drag the slider. "This is a business line, not a fund, so there's nothing to map. Every number here is labeled illustrative. The sleeve is the small band at the top. Here's what it could draw from, and here's the public timeline with a source on every entry." Click **View on map** next to Private Credit to show the jump.
7. **Dark mode and phone.** Click **Dark** at the top right. Then narrow the window or open the link on your phone: the panel becomes a bottom sheet.

## Questions you may get, and honest answers

**"Is this real data?"**
Not yet. Every holding is a placeholder marked `sample: true` in the data file, and the orange **Sample data** badge shows wherever placeholder data is on screen. The badge disappears entry by entry as real figures from a fact sheet or 10-Q are loaded. The two things on the site that *are* real and sourced: the Berkeley Lab data center electricity fact, and the four retirement milestones.

**"Why not just show real holdings?"**
Two reasons. Public filings disclose top holdings and sector mixes, not a full property-by-property list, so anything more would be guessing. And the rule I built the site around is: never invent a holding, a number, or a company name. The architecture makes loading real data a data-file change, not a code change.

**"How do you add a fund?"**
Drop one JSON file in `data/`, add one entry to the layer list in `data/layers.ts`. The map, panel, filters, footer, caveats, and the All funds grid all pick it up. That's how Phases 2 through 4 were added.

**"How did you handle the headquarters problem?"**
Each data file declares whether it is mapped by `property` or by `headquarters`. The UI reads that field and shows the caveat, enables metro clicks, and words the footer accordingly. BREIT and Infra never show it, BXPE and BCRED always do.

**"What's the BCRED redemption cap?"**
The plan draft said 2% monthly / 5% quarterly. That's actually BREIT's structure. BCRED's own offering terms describe quarterly tender offers up to 5% of shares outstanding, prorated when requests exceed the cap, plus a 2% early repurchase deduction on shares held under a year. The site says the latter, with the source linked. Worth mentioning: it shows you checked.

**"Is this affiliated with Blackstone?"**
No. No logo, no fonts from their site, fund names in plain text only, and the disclaimer is in the footer of every view.

**"What's the stack?"**
Next.js (App Router), TypeScript, Tailwind. The map is `react-simple-maps` over the free `us-atlas` state shapes, so no map API keys. Charts are `recharts`. No backend, no database, no login. It builds to static files and deploys to Vercel or Netlify with no configuration.

## Where things live

| Path | What it is |
| --- | --- |
| `data/*.json` | One file per fund, all the same shape. `retirement.json` holds the 401(k) lens text and milestones. |
| `data/layers.ts` | The list of layers. Add a fund here. |
| `components/AtlasMap.tsx` | The map. Reused by every layer and by the All funds grid. |
| `components/DetailPanel.tsx` | The right-hand panel (bottom sheet on phones). |
| `components/RetirementView.tsx` | The 401(k) lens. |
| `lib/aggregate.ts` | Rolls metros up to state totals. |
| `BUILD_PLAN.md` | The original five-phase plan. |
| `CHECKLIST.md` | Every phase's done checklist with what was verified. |

## Loading real data later

Paste a fact sheet or quarterly report into Claude Code with the prompt in `BUILD_PLAN.md › LOADING REAL DATA`. Only entries the document actually supports lose their `sample` flag.
