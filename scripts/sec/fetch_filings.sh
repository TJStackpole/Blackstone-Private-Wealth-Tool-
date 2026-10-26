#!/usr/bin/env bash
# Download the June 30, 2026 10-Q for each fund from SEC EDGAR (plus the 10-Ks, BCRED's letter, and BREIT's and BXPE's chart images).
# The SEC requires automated requests to name a contact. Set it before running:
#   export SEC_USER_AGENT="Your Name you@example.com"
#   scripts/sec/fetch_filings.sh ./filings
set -euo pipefail
: "${SEC_USER_AGENT:?Set SEC_USER_AGENT to 'Your Name your@email' (SEC fair-access rule)}"
OUT="${1:-./filings}"; mkdir -p "$OUT"
get() { curl -sSf -A "$SEC_USER_AGENT" -o "$OUT/$1" "$2"; sleep 0.25; echo "  $1"; }
B=https://www.sec.gov/Archives/edgar/data
# Accession numbers for the quarter ended June 30, 2026. Update these each quarter
# (find them at https://data.sec.gov/submissions/CIK<10-digit CIK>.json).
get breit-20260630.htm   "$B/1662972/000166297226000111/breit-20260630.htm"
get bxinfra-20260630.htm "$B/2030772/000203077226000017/bxinfra-20260630.htm"
get bxpe-20260630.htm    "$B/1930054/000193005426000016/bxpe-20260630.htm"
get bcred-20260630.htm   "$B/1803498/000180349826000048/bcred-20260630.htm"
# The 10-Ks (year ended December 31, 2025) the year-start comparisons read, and BCRED's letter to investors on its buybacks.
get breit-20251231.htm   "$B/1662972/000166297226000032/breit-20251231.htm"
get bxinfra-10k.htm      "$B/2030772/000119312526096453/d70902d10k.htm"
get bxpe-10k.htm         "$B/1930054/000119312526106084/d71061d10k.htm"
get bcred-tender-000121390026096935.htm "$B/1803498/000121390026096935/ea0244647-03_ex99a1vii.htm"
for g in 3 4 5; do get "breit-20260630_g$g.jpg" "$B/1662972/000166297226000111/breit-20260630_g$g.jpg"; done
for g in 2 3 4; do get "bxpe-20260630_g$g.jpg" "$B/1930054/000193005426000016/bxpe-20260630_g$g.jpg"; done
for f in "$OUT"/*.htm; do python3 -I "$(dirname "$0")/html2txt.py" "$f" "${f%.htm}.txt"; done
echo "Done. Next: python3 -I scripts/sec/build_data.py $OUT data"
