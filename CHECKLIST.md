# Done checklists, all five phases

Each line says what was verified and how. "Automated" means a headless-browser test in the build session. Walk them yourself on the live site too.

## Phase 1 — BREIT

| Item | Verified |
| --- | --- |
| Map loads in under 2 seconds | Automated: full load about 0.6 s, no console errors. Live site served in about 0.5 s. |
| Every state with data is clickable; panel updates | Automated: Texas, Florida, Nevada, California, Minnesota by mouse and keyboard. |
| Sector filter changes the map and the panel | Automated: Data Centers filter leaves four states; panel re-titles. If the filter removes the selected state, the panel falls back to the overview. |
| Looks right on a phone | Automated at 390 × 844: map on top, bottom sheet opens on tap, collapses on Hide, no horizontal scroll. |
| Keyboard can tab through tabs, chips, and states | Automated: theme toggle → six tabs (arrow keys also move between tabs) → sector chips → states in alphabetical order. Enter opens, Escape clears. |
| As-of date and source link show; sample badge if data is fake | Automated on every fund tab. |
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
| HQ-proxy caveat shows on this layer and NOT on BREIT/Infra | Automated: banner count is 1 on BXPE and BCRED, 0 on BREIT and Infra. |
| No company appears unless in a public disclosure (or flagged sample) | Every company is a clearly named placeholder with a Sample badge; a footnote says only disclosed companies are listed. |
| All three layers switch cleanly | Automated. |

## Phase 4 — BCRED

| Item | Verified |
| --- | --- |
| All four layers + All Funds view work and load fast | Automated in light and dark, desktop and phone. |
| "How this fund works" text is accurate and dated | Written from BCRED's offering terms (quarterly tender offers up to 5% of shares outstanding, prorated; 2% early repurchase deduction), dated, source linked. Note: the plan's "2% monthly / 5% quarterly" is BREIT's structure, not BCRED's. |
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
