export interface TourStep {
  chapter: "The map" | "Advisor Toolkit" | "Good to know";
  title: string;
  /** Plain-language explanation of what's on screen. */
  body: string[];
  /** One thing to try in the live view. */
  tryThis?: string;
  /** The live page to show, opened at the right spot. */
  url: string;
}

const enc = encodeURIComponent;

/** The full tour: every feature, 17 steps. */
export const STEPS: TourStep[] = [
  {
    chapter: "The map",
    title: "Where four Blackstone funds invest",
    body: [
      "This site maps where Blackstone's four perpetual funds for individual investors put their money: real estate (BREIT), infrastructure (BX Infra), private equity (BXPE) and private credit (BCRED).",
      "Every number comes from each fund's own SEC filings, mainly its 10-Q for the quarter ended June 30, 2026 and its 10-K, and links back to its source.",
    ],
    tryThis: "Click the fund tabs along the top to switch funds.",
    url: "/",
  },
  {
    chapter: "The map",
    title: "Real estate, down to the state",
    body: [
      "BREIT's filing reports its U.S. regions and names each investment with a city, so its map can go down to the state.",
      "Here Nevada is selected: the panel lists the Nevada investments named in the filing, with units, occupancy and ownership.",
    ],
    tryThis: "Click another state, or use the Tab key to move between them.",
    url: "/?view=breit&select=NV",
  },
  {
    chapter: "The map",
    title: "Filter by sector",
    body: [
      "Each line of the panel's Sector mix is also a filter. Here it's Data Centers, 27% of BREIT.",
      "Where the filing doesn't split a region by sector, the map says so instead of guessing.",
    ],
    tryThis: "Pick a different sector, or All sectors to reset.",
    url: `/?view=breit&sector=${enc("Data Centers")}`,
  },
  {
    chapter: "The map",
    title: "Each fund drawn at the detail its filing allows",
    body: [
      "BX Infra and BXPE only report continents, so their maps are drawn by region. BCRED names every borrower but not where they're based, so it's drawn by country group.",
      "Here BX Infra is filtered to Transportation Infrastructure, using that sector's own regional split from the schedule of investments.",
    ],
    url: `/?view=bxinfra&sector=${enc("Transportation Infrastructure")}`,
  },
  {
    chapter: "The map",
    title: "Private credit, borrower by borrower",
    body: [
      "BCRED lends to 653 companies. The panel shows the largest borrowers, the share in each industry, and what changed in the quarter, such as the value per share and loans that stopped paying.",
    ],
    tryThis: "Scroll the panel to 'How this fund works'.",
    url: `/?view=bcred&sector=Software`,
  },
  {
    chapter: "The map",
    title: "Themes that cut across funds",
    body: [
      "'Explore a theme', above the map, picks the same idea in every fund at once. 'AI & data centers' is Data Centers in BREIT and Digital Infrastructure in BX Infra.",
      "The theme stays on as you switch funds. 'No theme' turns it off and puts back the sector you had before.",
    ],
    tryThis: "With the theme on, click the Infrastructure tab.",
    url: "/?view=breit&theme=ai-data-centers",
  },
  {
    chapter: "The map",
    title: "All four funds, side by side",
    body: [
      "'All funds' puts the four next to each other, each at the level of detail its filing gives. 'Open' jumps to that fund's map.",
      "Below the maps, one table compares them: distribution rate, fees, buy-back limits, minimum investment and the change in value per share. Each cell comes from that fund's own filing.",
    ],
    url: "/?view=all",
  },
  {
    chapter: "The map",
    title: "The 401(k) story",
    body: [
      "From Blackstone's 2026 paper: pensions hold about 33% in private markets, 401(k)s about 0.1%.",
      "The paper's own result comes first. The Outcome Lab then rebuilds its worker with returns you can change. A Worker / Employer switch changes the wording, never the numbers.",
    ],
    tryThis: "In the Outcome Lab, raise 'Extra fees, private' and watch the difference shrink.",
    url: "/?view=retirement",
  },
  {
    chapter: "Advisor Toolkit",
    title: "Seven tools for explaining these funds",
    body: [
      "Seven tools, each answering one common question about these funds. Every calculator result carries an ILLUSTRATIVE label, and placeholder data a SAMPLE label.",
      "Each fund's panel on the map also has small buttons for the tools that apply; they open a quick version in a side drawer.",
    ],
    tryThis: "Open any tool, then use its fund tabs to switch funds.",
    url: "/toolkit",
  },
  {
    chapter: "Advisor Toolkit",
    title: "Liquidity Simulator: when does the money come back?",
    body: [
      "These funds buy shares back up to a limit. When more people ask than the limit allows, everyone gets the same fraction.",
      "The simulator shows, quarter by quarter, how much of a request would be paid, with presets for normal times, stress and a prolonged backlog.",
    ],
    url: "/toolkit/liquidity?fund=BCRED#simulator",
  },
  {
    chapter: "Advisor Toolkit",
    title: "Index-to-Fund Translator",
    body: [
      "Brochures often quote an index return. This walks from the index to a share class, step by step: borrowing, cash held back, and each fee.",
    ],
    tryThis: "Switch between Class I, D and S.",
    url: "/toolkit/index-vs-fund?fund=BCRED#ivf-bridge-h",
  },
  {
    chapter: "Advisor Toolkit",
    title: "Tax Lens: how are the payouts taxed?",
    body: [
      "Each fund's payouts are taxed differently, so each gets its own page from its own filings. Most of BREIT's recent payouts were return of capital: not taxed when received, but they lower cost basis. BCRED's were all ordinary income.",
      "For BREIT, a calculator shows the tax now and at sale for a client's own numbers.",
    ],
    tryThis: "Switch between the fund tabs.",
    url: "/toolkit/tax-lens#calculator-h",
  },
  {
    chapter: "Advisor Toolkit",
    title: "Why so smooth?",
    body: [
      "Private funds are valued by appraisal, not daily trading, so their values move more gently. This explains why, and what that does and doesn't mean for risk.",
    ],
    tryThis: "Tick 'Show market-style estimate' to see the swings widen.",
    url: "/toolkit/smoothing#sm-chart-h",
  },
  {
    chapter: "Advisor Toolkit",
    title: "Theme Exposure: what does it all add up to?",
    body: [
      "Enter what a client holds in each fund, plus any stocks tied to a theme, and see the total by theme. The example, four funds plus Nvidia stock, comes to 27% in AI and data centers.",
      "Each theme also has a sourced case for and case against, given equal space.",
    ],
    url: "/toolkit/themes#th-lt-h",
  },
  {
    chapter: "Advisor Toolkit",
    title: "Drawdown vs. Evergreen, for family offices",
    body: [
      "Family offices often own private assets through traditional funds that call money over years. This compares the two structures and shows how much money is actually at work in each.",
      "It prints as a one-page memo for an investment committee.",
    ],
    url: "/toolkit/drawdown-vs-evergreen#cash-drag-h",
  },
  {
    chapter: "Advisor Toolkit",
    title: "Reality Check",
    body: [
      "Each fund's own stated goals, from its annual report, next to what its latest filing shows, with neutral labels set by a person and a badge showing how old the data is.",
    ],
    url: "/toolkit/reality-check?fund=BCRED",
  },
  {
    chapter: "Good to know",
    title: "Built to be trusted",
    body: [
      "Every figure links to its source. The site never invents fund numbers, labels sample data and illustrations, and avoids advice wording.",
      "Each fund page and tool page has a Print / Save as PDF button for a one-page handout. Dark mode is in the top corner, and every page works on a phone.",
      "It's an independent prototype built from public filings, not affiliated with or endorsed by Blackstone.",
    ],
    url: "/?view=bcred",
  },
];

/** The default tour: six stops, a few minutes. */
export const SHORT_STEPS: TourStep[] = [
  {
    chapter: "The map",
    title: "One fund, from its own filing",
    body: [
      "Each fund has its own page: where the money is, the sector mix and the key numbers. Every figure comes from the fund's own SEC filings, mainly its 10-Q for the quarter ended June 30, 2026, and links back to its source.",
    ],
    tryThis: "Click a state to see the investments the filing names there.",
    url: "/?view=breit",
  },
  {
    chapter: "The map",
    title: "This quarter, in four numbers",
    body: [
      "BCRED's 'This quarter' box shows what moved: net assets, value per share, how much of the buy-back requests were paid, and loans that stopped paying.",
      "Each shows which way it moved and what it's compared with.",
    ],
    url: "/?view=bcred",
  },
  {
    chapter: "Advisor Toolkit",
    title: "Liquidity: when does the money come back?",
    body: [
      "These funds buy shares back up to a limit. When more people ask than the limit allows, everyone gets the same fraction.",
      "The simulator shows, quarter by quarter, how much of a request would be paid.",
    ],
    tryThis: "Pick the 'Prolonged backlog' preset.",
    url: "/toolkit/liquidity?fund=BCRED#simulator",
  },
  {
    chapter: "The map",
    title: "The 401(k) lens",
    body: [
      "From Blackstone's 2026 paper: pensions hold about 33% in private markets, 401(k)s about 0.1%.",
      "The paper's own result comes first. Then change the assumptions and see how much it moves.",
    ],
    url: "/?view=retirement",
  },
  {
    chapter: "Advisor Toolkit",
    title: "Reality Check",
    body: [
      "Each fund's own stated goals, from its annual report, next to what its latest filing shows, with neutral labels and a badge showing how old the data is.",
    ],
    url: "/toolkit/reality-check?fund=BCRED",
  },
  {
    chapter: "The map",
    title: "All four, side by side",
    body: [
      "One table compares the four funds: distribution rate, fees, buy-back limits, whether last quarter's buy-backs were pro-rated, minimum investment and the change in value per share.",
      "Each cell comes from that fund's own filing. Where a filing doesn't say, the cell says 'Not in filing'.",
    ],
    url: "/?view=all#compare-h",
  },
];
