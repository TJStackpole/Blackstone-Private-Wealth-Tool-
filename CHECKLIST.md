# Done checklists: the map, the Advisor Toolkit, and the tour

**Data update:** all four fund layers now use the June 30, 2026 Form 10-Q filings (see `DEMO_GUIDE.md`). The automated suite runs 201 checks, including that every headline number on screen matches the generated data files.

Each line says what was verified and how. "Automated" means a headless-browser test in the build session. Walk them yourself on the live site too.

## Phase 1 — BREIT

| Item | Verified |
| --- | --- |
| Map loads in under 2 seconds | Automated: full load about 0.6 s, no console errors. Live site served in about 0.5 s. |
| Every state with data is clickable; panel updates | Automated: every state opens its region share, its own share where the filing gives one, and the named investments listed there. |
| Sector filter changes the map and the panel | Automated: on BREIT, a sector filters the investment dots and state lists, and a note explains that region shading covers all sectors (the filing has no region-by-sector split). On BX Infra and BXPE, a sector re-splits the regions using the schedule of investments. On BCRED, it filters the borrower list. |
| Looks right on a phone | Automated at 390 × 844: map on top, bottom sheet opens on tap, collapses on Hide, no horizontal scroll. |
| Keyboard can tab through tabs, chips, and states | Automated: theme toggle → six tabs (arrow keys also move between tabs) → sector chips → states in alphabetical order. Enter opens, Escape clears. |
| As-of date and source link show; sample badge if data is fake | Automated on every fund tab: SEC 10-Q badge, as-of date, filing link and EDGAR CIK. No sample data remains; the suite also checks that no "sample" wording appears. |
| Dark mode looks as good as light | Screenshots in both themes at desktop and phone widths. Choice is remembered after reload (automated). |
| `npm run build` passes with zero errors; deploys | Build, type-check and lint clean. Deployed to Netlify. |

## Phase 2 — BX Infra

| Item | Verified |
| --- | --- |
| Switching layers is smooth and never shows the wrong fund's data | Panel cross-fades; exit is instant so the old fund never lingers. Automated: 150 ms after switching, the panel already names the new fund. |
| BREIT still works exactly as before | Phase 1 suite re-run after every phase. |
| Third-party facts are visually separate and separately cited | Dashed "Context · not from fund filings" card with its own source link and date. |

## Phase 3 — BXPE

| Item | Verified |
| --- | --- |
| HQ-proxy caveat shows on this layer and NOT on BREIT/Infra | Superseded by real data: the filings give no headquarters, so nothing is mapped by headquarters. Each layer instead states its geography basis in the panel and footer. |
| No company appears unless in a public disclosure (or flagged sample) | Every company shown is named in the fund's 10-Q schedule of investments. The original plan mapped BXPE and BCRED by headquarters; their filings don't give headquarters, so those layers use the filings' own region and country groupings instead. |
| All three layers switch cleanly | Automated. |

## Phase 4 — BCRED

| Item | Verified |
| --- | --- |
| All four layers + All Funds view work and load fast | Automated in light and dark, desktop and phone. |
| "How this fund works" text is accurate and dated | Rewritten from the 10-Q (91% first lien, 99.8% floating rate, quarterly tender offers at quarter-end NAV, 98% for shares held under a year). The 5% cap comes from BCRED's offering terms and is cited that way. The plan's "2% monthly / 5% quarterly" is BREIT's structure, which BREIT's layer now shows from its own 10-Q. |
| Final mobile, keyboard, and dark-mode check across every layer | Automated. |
| Deployed at a clean URL | https://private-markets-atlas.netlify.app |

## Phase 5 — Retirement lens

| Item | Verified |
| --- | --- |
| Slider is smooth on desktop and phone | Range input; chart updates instantly with no animation lag. Keyboard: Home/End/arrows (automated). |
| Every number is labeled illustrative; every milestone has a source | "Illustrative" badge on the header, the mix card, the chart caption, and the sleeve card. Four milestones, each with a source link. |
| "View on map" jumps to the correct layer | Automated: third button opens Private Equity. |
| Nothing implies a real product's actual allocation | Framing paragraph says so; closing line repeats it. |
| All earlier checks still pass; final deploy | Full suite re-run after Phase 5. |

## Advisor Toolkit: Foundation and all seven add-ons

Every phase ran on its own branch (`addon/<tool>-p1` … `-p3`) and merged only after the full check passed: types, lint, unit tests, a production build with browser tests, and the 201-check map regression. Branches are on GitHub.

| Regression item (run after every phase) | How it's verified |
| --- | --- |
| `build`, `test` and `e2e` pass | Automated on every phase; merging is blocked if any step fails. Now 104 unit tests and 6 browser tests. |
| Map loads; every fund layer toggles | Browser test plus the 201-check regression. |
| Fund panels show chips only for tools that apply | Unit tests (registry, chips) and a browser test that opens every chip's drawer in every fund panel and closes it with Escape. |
| A switched-off tool vanishes with no gaps | Unit tests render chips and the registry with tools switched off; the Theme row renders nothing when Themes is off. |
| A crashing tool shows "temporarily unavailable" and the map keeps working | Unit test throws inside the error boundary; browser tests fail if any fallback appears. |
| Works at 375px with no sideways scrolling | Screenshot check of every tool page and drawer at 375px, light and dark, measuring page width. |
| SAMPLE / ILLUSTRATIVE badges, dates, sources and the disclosure are visible | Checked on every page; data tests require a source and date on every figure. |
| No "you should" / "we recommend"; no copied brochure text or charts | Data tests scan every content file for advice wording. All text is our own; charts are drawn from data. |
| Printouts fit one page | Each tool's Print / Save as PDF output measured as a Letter PDF: one page each. |

| Tool | Phase 1 | Phase 2 | Phase 3 |
| --- | --- | --- | --- |
| Liquidity Simulator | Terms and history from each 10-Q and BCRED's tender letters | `simulateRedemption`, tested (under limit fills 100%, 2× limit fills 50%, hand-checked resubmission, never pays more than asked) | Reserve check (`yearsCovered`), drawer, Tax Lens link, print |
| Index-to-Fund Translator | Fund returns and fees from each 10-Q; index figures marked sample with sources | `buildBridge`, tested (steps add up exactly, zero fees = no change, negative returns) | Drawer in all four panels, print |
| Tax Lens | Worked example; BREIT's 2020–2025 return-of-capital split from its 10-Ks | `projectTax`, tested (one- and ten-year hand cases, 0% ROC, basis floor, 199A, sale at a loss) | Three-input drawer, Liquidity link, print |
| Why So Smooth? | Explainer; valuation claims cite the funds' filings | `volatility`, `maxDrawdown`, `desmooth`, tested; sample series clearly labeled | Objections, drawer for BREIT/BX Infra/BXPE, print |
| Theme Exposure | Theme filter on the map (the one logged exception) | `lookThrough`, tested (four funds plus Nvidia = 27.3%) | Sourced cases for and against, equal space; drawer; print |
| Drawdown vs. Evergreen | Eight-row comparison, each row sourced | `compare`, tested (100% day-one call = evergreen before fees; fees lower value monotonically) | Family Office mode (toolkit only), IC memo print, drawer |
| Reality Check | Three claims per fund from the funds' own objectives, draft status for TJ to confirm | CSV update script with row-numbered errors; freshness badge thresholds tested | Drawer with the two claims most worth raising, monthly GitHub reminder, print |

## Guided tour

| Item | Verified |
| --- | --- |
| "Take the tour" link on the map and the toolkit | Browser test clicks it from the map. |
| Every step's live view loads at the right spot | Browser test opens all 16 steps and checks each page loaded with no error or missing tool; step 2 lands on Nevada. |
| Desktop layout inside the tour on laptop screens | The live view renders at 1280px and scales to fit; checked at 1280 and 1440. |
| Links into the map are safe | Unit tests: unknown funds, sectors or regions in the address are ignored. |
