# Private Markets Atlas

An interactive US map showing where retail private-markets funds invest, one fund at a time.
Built from public filings as an independent prototype. **Not affiliated with Blackstone. Not investment advice.**

The full build plan (five phases) is in `BUILD_PLAN.md`. Phase 1 (BREIT) is built.

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
| `data/breit.json` | The fund's holdings. Every entry marked `"sample": true` is a placeholder, not a real holding. |
| `data/layers.ts` | The list of map layers (one per fund). Adding a fund = add one JSON file + one entry here. |
| `components/` | The map, tabs, sector chips, detail panel, legend, and footer. |
| `lib/` | Shared types and the math that rolls metros up into state totals. |

## Loading real data

Paste the latest fact sheet or quarterly report into Claude Code with the prompt in
`BUILD_PLAN.md › LOADING REAL DATA`. Only entries backed by the document lose their `"sample": true` flag.
