<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Project rules

Read `BUILD_PLAN.md` before any change. Phases are built one at a time and only when the user says so.
Never invent holdings or numbers. Fund data comes only from SEC filings via `scripts/sec/build_data.py`, which reconciles every total; say what a filing does not disclose instead of filling gaps.
