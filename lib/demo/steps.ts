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

/** The full tour: every feature, 15 steps. */
export const STEPS: TourStep[] = [
  {
    chapter: "The map",
    title: "Start here",
    body: [
      "This site explains Blackstone's four perpetual funds for individual investors: real estate (BREIT), infrastructure (BX Infra), private equity (BXPE) and private credit (BCRED).",
      "It opens on three ways in: explain one fund, compare the funds, or answer a client's question. Below them, 'Ask a question' answers from the funds' filings already on the site, each answer with its date and sources.",
    ],
    tryThis: "Click one of the example questions under 'Ask a question'.",
    url: "/",
  },
  {
    chapter: "The map",
    title: "A fund in five answers",
    body: [
      "Each fund opens with the five things a client asks first: what it is, what it pays, how to get money out, what changed lately and the main risk. Each answer has its date and a 'Sources' link to the filings.",
      "Words with a dotted underline, such as non-accrual or tender offer, open a plain definition with the filing's own words. 'Copy these answers' copies all five with their sources.",
    ],
    tryThis: "Click a dotted word, then 'See the details'.",
    url: "/?view=bcred",
  },
  {
    chapter: "The map",
    title: "Real estate, down to the state",
    body: [
      "'See the details' opens the map, the sector mix, the newest month's figures and the last quarter's. BREIT's filing names each investment with a city, so its map goes down to the state.",
      "Here Nevada is selected: the panel lists the Nevada investments named in the filing, with units, occupancy and ownership.",
    ],
    tryThis: "Click another state, or use the Tab key to move between them.",
    url: "/?view=breit&details=1&select=NV",
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
      "BCRED lends to 653 companies. Its details lead with the largest borrowers, then the share in each industry, the newest month's value per share and borrowing, and what moved last quarter, such as loans on non-accrual (where the fund doubts it will be paid in full).",
    ],
    tryThis: "Scroll the panel to 'How this fund works'.",
    url: `/?view=bcred&sector=Software`,
  },
  {
    chapter: "The map",
    title: "Themes that cut across funds",
    body: [
      "'Explore a theme', above the map, picks the same idea in every fund at once. 'AI & data centers' is Data Centers in BREIT and Digital Infrastructure in BX Infra.",
      "Under it, 'The case for and against' gives outside views on the theme, each with its source, in equal space. The theme stays on as you switch funds.",
    ],
    tryThis: "With the theme on, click the Infrastructure tab.",
    url: "/?view=breit&theme=ai-data-centers",
  },
  {
    chapter: "The map",
    title: "The funds, side by side",
    body: [
      "'All funds' is one table: size, value per share and its change since December 31, distribution rate, fees, buy-back limits, the early-sale deduction, whether last quarter's buy-backs were pro-rated, and the minimum investment.",
      "Pick which funds to compare (two on a phone fits best). 'Show sources' puts each cell's filing under it, and a fund's name opens its page.",
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
    title: "Four tools, one client question each",
    body: [
      "Getting money out, Taxes, Returns explained and Goals vs. results. Every calculator result carries an ILLUSTRATIVE label, and placeholder data a SAMPLE label.",
      "The 'Client' button at the top sets your client's state, tax bracket and amount once, and every tool uses them.",
    ],
    tryThis: "Click 'Client' and change the state.",
    url: "/toolkit",
  },
  {
    chapter: "Advisor Toolkit",
    title: "Getting money out",
    body: [
      "These funds buy shares back up to a limit. When more people ask than the limit allows, everyone gets the same fraction. The simulator shows, quarter by quarter, how much of a request would be paid.",
      "Its second part, 'Evergreen or drawdown?', compares these funds with traditional funds that call money over years, and prints as a one-page memo.",
    ],
    tryThis: "Pick the 'Prolonged backlog' preset.",
    url: "/toolkit/liquidity?fund=BCRED#simulator",
  },
  {
    chapter: "Advisor Toolkit",
    title: "Taxes",
    body: [
      "Each fund's payouts are taxed differently, so each gets its own page from its own filings. Most of BREIT's recent payouts were return of capital: not taxed when received, but they lower cost basis. BCRED's were all ordinary income.",
      "Every tax figure adds the federal rate, the investment income tax and the client's state.",
    ],
    tryThis: "Switch between the fund tabs.",
    url: "/toolkit/tax-lens#calculator-h",
  },
  {
    chapter: "Advisor Toolkit",
    title: "Returns, explained",
    body: [
      "Private funds are valued by appraisal, not daily trading, so their values move more gently. This explains why, and what that does and doesn't mean for risk.",
      "Its second part walks from an index return to a share class's return, step by step: borrowing, cash held back, and each fee.",
    ],
    tryThis: "Tick 'Show market-style estimate' to see the swings widen.",
    url: "/toolkit/smoothing#sm-chart-h",
  },
  {
    chapter: "Advisor Toolkit",
    title: "Goals vs. results",
    body: [
      "Each fund's own stated goals, from its annual report, next to what its latest 10-Q shows, with neutral labels set by a person and a badge showing how old the data is.",
    ],
    url: "/toolkit/reality-check?fund=BCRED",
  },
  {
    chapter: "Good to know",
    title: "Built to be trusted",
    body: [
      "Every figure has its date and a 'Sources' link to the filing it comes from. The site never invents fund numbers, labels sample data and illustrations, and avoids advice wording.",
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
    title: "Start here",
    body: [
      "The site opens on three ways in: explain one fund, compare the funds, or answer a client's question. 'Ask a question' answers from the funds' filings, with dates and sources.",
    ],
    tryThis: "Click one of the example questions.",
    url: "/",
  },
  {
    chapter: "The map",
    title: "A fund in five answers",
    body: [
      "What it is, what it pays, how to get money out, what changed lately and the main risk, each dated and sourced. The newest values come from the September 30 month-end filings; the rest from the 10-Q for the quarter ended June 30, 2026.",
      "Dotted words open a plain definition with the filing's own words.",
    ],
    tryThis: "Click 'See the details' for the map and the full numbers.",
    url: "/?view=bcred",
  },
  {
    chapter: "Advisor Toolkit",
    title: "Getting money out",
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
    title: "Goals vs. results",
    body: [
      "Each fund's own stated goals, from its annual report, next to what its latest 10-Q shows, with neutral labels and a badge showing how old the data is.",
    ],
    url: "/toolkit/reality-check?fund=BCRED",
  },
  {
    chapter: "The map",
    title: "The funds, side by side",
    body: [
      "One table compares the funds you pick: size, value per share, distribution rate, fees, buy-back limits, the early-sale deduction, whether last quarter's buy-backs were pro-rated, and the minimum investment.",
      "Each cell comes from that fund's own filing. Where a filing doesn't say, the cell says 'Not in filing'.",
    ],
    url: "/?view=all#compare-h",
  },
];
