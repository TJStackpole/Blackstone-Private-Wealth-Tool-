#!/usr/bin/env bash
# One step to refresh all four funds from their newest SEC filings. Nothing in data/ changes unless every check
# against the filings' own totals passes and every test passes. See README, "Refreshing the data".
#   export SEC_USER_AGENT="Your Name you@example.com"
#   npm run refresh-data
set -euo pipefail
: "${SEC_USER_AGENT:?Set SEC_USER_AGENT to 'Your Name your@email' first (the SEC asks automated requests to name a contact)}"
cd "$(dirname "$0")/../.."
SEC=scripts/sec
DIR="filings/$(date +%Y-%m-%d)"
FUNDS="breit bxinfra bxpe bcred compare"

echo "1/4  Looking for newer filings on SEC EDGAR"
set +e; python3 -I $SEC/latest_filings.py "$DIR" data; code=$?; set -e
if [ $code = 3 ]; then echo "Up to date: the site already has each fund's newest filing. Nothing to do."; exit 0; fi
[ $code = 0 ] || exit $code
for f in "$DIR"/*.htm; do python3 -I $SEC/html2txt.py "$f" "${f%.htm}.txt"; done
# BCRED's buyback proration comes from its letter to investors, which isn't a 10-Q. Reuse the last one until a new one is added.
cp -n filings/*/bcred-tender-*.txt "$DIR"/ 2>/dev/null || true

echo "2/4  Rebuilding the fund files and checking every figure against the filings' totals"
NEW="$(mktemp -d)"; cp data/*.json "$NEW"/
python3 -I $SEC/build_data.py "$DIR" "$NEW"

echo "3/4  Running the tests on the new data"
OLD="$(mktemp -d)"; for f in $FUNDS; do cp "data/$f.json" "$OLD/"; done
for f in $FUNDS; do cp "$NEW/$f.json" data/; done
if ! npm test --silent; then
  for f in $FUNDS; do cp "$OLD/$f.json" data/; done
  echo "Tests failed, so data/ is back to how it was. See README, 'Refreshing the data', step 4."
  exit 1
fi

echo "4/4  What changed"
python3 -I $SEC/what_changed.py "$OLD" data
echo
echo "Done. Next: npm run build, look over the site, then publish."
