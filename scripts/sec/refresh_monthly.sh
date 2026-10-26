#!/usr/bin/env bash
# One step to add each fund's newest month-end figures (the 8-Ks, and BREIT's NAV supplement, that come between
# 10-Qs). Nothing in data/ changes unless every check against the filings and every test passes. See README,
# "Monthly updates".
#   export SEC_USER_AGENT="Your Name you@example.com"
#   npm run refresh-monthly
set -euo pipefail
: "${SEC_USER_AGENT:?Set SEC_USER_AGENT to 'Your Name your@email' first (the SEC asks automated requests to name a contact)}"
cd "$(dirname "$0")/../.."
SEC=scripts/sec
DIR="filings/$(date +%Y-%m-%d)-monthly"

# The last quarter's filings, which the month's figures are compared with: the newest refresh-data download, else fetch them.
Q=""; for m in filings/*/manifest.json; do [ -e "$m" ] && Q="$(dirname "$m")"; done
if [ -z "$Q" ]; then Q=filings/quarter; [ -e "$Q/breit-20260630.txt" ] || bash $SEC/fetch_filings.sh "$Q"; fi

echo "1/3  Looking for newer month-end filings on SEC EDGAR"
set +e; python3 -I $SEC/latest_monthly.py "$DIR" data; code=$?; set -e
if [ $code = 3 ]; then echo "Up to date: the site already has each fund's newest month-end figures. Nothing to do."; exit 0; fi
[ $code = 0 ] || exit $code

echo "2/3  Reading them and checking each figure"
NEW="$(mktemp -d)"; cp data/*.json "$NEW"/
python3 -I $SEC/build_monthly.py "$DIR" "$NEW" "$Q"

echo "3/3  Running the tests on the new figures"
OLD="$(mktemp -d)"; cp data/latest.json "$OLD"/
cp "$NEW/latest.json" data/
if ! npm test --silent; then
  cp "$OLD/latest.json" data/
  echo "Tests failed, so data/ is back to how it was. See README, 'Monthly updates'."
  exit 1
fi
python3 -I - "$OLD/latest.json" data/latest.json <<'PY'
import json, sys
old, new = (json.load(open(p)) for p in sys.argv[1:3])
for f, x in new["funds"].items():
    before = {i["label"]: i["value"] for i in old["funds"].get(f, {}).get("items", [])}
    print(f"  {f.upper():8} {x['asOf']}: " + "; ".join(f"{i['label']} {before.get(i['label'], '—')} → {i['value']}" for i in x["items"]))
PY
echo
echo "Done. Next: npm run build, look over the site, then publish."
