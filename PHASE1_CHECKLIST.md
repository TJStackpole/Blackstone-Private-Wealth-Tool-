# Phase 1 Done Checklist — what I checked, and what you should check yourself

Run `npm run dev` in this folder, open http://localhost:3000, and go down this list.

| # | Checklist item | What I verified | How you can check it yourself |
| --- | --- | --- | --- |
| 1 | Map loads in under 2 seconds | Full page load measured at about 0.6 seconds in a headless browser, with no console errors. | Open the page. The shaded map should be visible almost instantly. |
| 2 | Every state with data is clickable; panel updates | Clicked Texas, Florida, California, Minnesota in automated tests. The right-hand panel switched to that state's total, metros, and sector bars each time. | Click Texas. The panel should say "Texas · 14.4%" with four metros. Click "← Overview" to go back. |
| 3 | Sector filter changes the map and panel | Clicked "Data Centers": only Virginia, Arizona, Georgia, Texas stayed shaded, and the panel re-titled itself "Data Centers across the United States". | Click a chip. Click "All sectors" to clear it. |
| 4 | Looks right on a phone | Tested at 390 × 844. Map sits on top, a sheet labelled "BREIT overview" sits at the bottom; tapping a state opens the sheet with that state's detail. | Shrink your browser window very narrow, or open the site on your phone. Tap Florida. |
| 5 | Keyboard works | Pressing Tab moves: Dark/Light → Real Estate tab → sector chips → states in alphabetical order. Enter on a state opened its panel. Escape clears the selection. | Click in the page, press Tab repeatedly, then Enter on a state. You should see a navy outline on whatever is focused. |
| 6 | As-of date, source link, sample badge | Footer shows "As of Jun 30, 2026", a source link, and the "SAMPLE" badge. The badge also appears next to the chips and in the panel. | Scroll to the bottom of the page. |
| 7 | Dark mode looks as good as light | Captured both themes at desktop and phone sizes. The map accent switches to a lighter blue so it still reads on the dark background. Your choice is remembered next visit. | Click "Dark" at the top right. |
| 8 | `npm run build` passes; deploys to Vercel | Build, type-check, and lint all pass with zero errors. I cannot deploy from here (needs your Vercel account). | Follow "Deploy to Vercel" in README.md. |

## Things to know

- **All data is sample data.** `data/breit.json` is filled with clearly invented weights so the map has something to show. Nothing in it is a real BREIT holding. The orange "Sample data" badge will disappear only after real figures are loaded.
- The two-sentence description of what BREIT is lives in `data/breit.json` under `summary.headline`, so you can reword it without touching code.
- Phase 2 has not been started.
