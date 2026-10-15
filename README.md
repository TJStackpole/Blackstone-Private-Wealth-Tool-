# Private Markets Atlas

An interactive map of where Blackstone's four retail private-markets funds (BREIT, BX Infra, BXPE, BCRED) invest, built from their latest SEC 10-Q filings.
Built from public filings as an independent prototype. **Not affiliated with Blackstone. Not investment advice.**

All five phases of `BUILD_PLAN.md` are built: BREIT, BX Infra, BXPE, BCRED, an All funds view, and the Retirement lens.
Live: https://private-markets-atlas.netlify.app

- `DEMO_GUIDE.md` — a five-minute walkthrough and honest answers to likely questions.
- `CHECKLIST.md` — every phase's done checklist and how each item was verified.

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
| `components/` | The map, tabs, sector chips, detail panel, legend, and footer. |
| `lib/` | Shared types and the math that rolls metros up into state totals. |

## Updating the data each quarter

```bash
export SEC_USER_AGENT="Your Name you@example.com"   # SEC requires a contact for automated downloads
scripts/sec/fetch_filings.sh ./filings              # update the accession numbers inside first
python3 -I scripts/sec/build_data.py ./filings data
npm run build
```

The build script stops if any total fails to reconcile with the filing.
