"""
Find each fund's month-end filings on SEC EDGAR that are newer than the site's (data/latest.json), download them as
text into a folder, and write a monthly.json there naming them for build_monthly.py. Exits 3, downloading nothing,
when there are none, and stops when only some funds have filed.

    export SEC_USER_AGENT="Your Name you@example.com"    # the SEC asks automated requests to name a contact
    python3 -I scripts/sec/latest_monthly.py filings/2026-11-24 data

Which filing is which is read from its text, not guessed from its name: the NAV filing is the one that prints the
fund's NAV table; BREIT's distribution 8-K is the one with the Class I distribution table.
"""
import json
import os
import subprocess
import sys
import time
import urllib.request
from datetime import datetime

OUT, DATA = sys.argv[1], sys.argv[2]
UA = os.environ.get("SEC_USER_AGENT")
if not UA:
    sys.exit("Set SEC_USER_AGENT to 'Your Name your@email' first (SEC fair-access rule).")
HERE = os.path.dirname(os.path.abspath(__file__))
FUNDS = {"breit": 1662972, "bxinfra": 2030772, "bxpe": 1930054, "bcred": 1803498}
NAMES = {"breit": "BREIT", "bxinfra": "BX Infra", "bxpe": "BXPE", "bcred": "BCRED"}
# The phrase each kind of filing prints, so the right one is picked even when a month brings several 8-Ks.
KINDS = {
    "breit": [("breit_nav", "424B3", "The following table provides a breakdown of our total NAV and NAV per share/unit by class"),
              ("breit_dist", "8-K", "Class I Common Stock |"),
              ("breit_noi", "8-K", "same property NOI")],
    "bxinfra": [("bxinfra", "8-K", "Transactional NAV per Unit for each class")],
    "bxpe": [("bxpe", "8-K", "Transactional NAV per Unit for each class")],
    "bcred": [("bcred", "8-K", "Class I Common Shares | $ |")],
}


def get(url):
    time.sleep(0.2)  # well under the SEC's 10 requests a second
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA})) as r:
        return r.read()


def long_date(iso):
    return datetime.strptime(iso, "%Y-%m-%d").strftime("%B %-d, %Y")


latest = json.load(open(os.path.join(DATA, "latest.json")))
os.makedirs(OUT, exist_ok=True)
monthly = {}
for fund, cik in FUNDS.items():
    have = latest["funds"].get(fund, {}).get("filed", "0000-00-00")
    recent = json.loads(get(f"https://data.sec.gov/submissions/CIK{cik:010d}.json"))["filings"]["recent"]
    picked = {}
    for i, form in enumerate(recent["form"]):  # newest first
        filed = recent["filingDate"][i]
        if filed <= have:
            break
        wanted = [k for k in KINDS[fund] if k[1] == form and k[0] not in picked]
        if not wanted:
            continue
        acc, doc = recent["accessionNumber"][i].replace("-", ""), recent["primaryDocument"][i]
        url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{acc}/{doc}"
        name = f"{fund}-{form.lower()}-{filed.replace('-', '')}-{acc[-6:]}"
        htm, txt = os.path.join(OUT, name + ".htm"), os.path.join(OUT, name + ".txt")
        open(htm, "wb").write(get(url))
        subprocess.run([sys.executable, "-I", os.path.join(HERE, "html2txt.py"), htm, txt], check=True)
        body = open(txt, encoding="utf-8").read()
        for key, _, phrase in wanted:
            if phrase in body:
                label = "prospectus supplement (Form 424B3)" if form == "424B3" else "Form 8-K"
                # An 8-K's title date is the event date in its file name (bcred-20261021.htm), else the filing date.
                event = next((f"{d[:4]}-{d[4:6]}-{d[6:8]}" for d in [doc.rsplit("-", 1)[-1][:8]] if d.isdigit() and len(d) == 8), filed)
                picked[key] = {"file": name, "name": f"{NAMES[fund]} {label}, {long_date(event if form == '8-K' else filed)}", "filed": filed, "url": url}
                print(f"  {key:11} {form:6} filed {filed}  {url}")
                break
    if not any(k[0] in picked for k in KINDS[fund][:1]):
        print(f"  {NAMES[fund]}: no NAV filing newer than {have}")
    monthly.update(picked)

if not any(KINDS[f][0][0] in monthly for f in FUNDS):
    sys.exit(3)
missing = [k for f in FUNDS for k, _, _ in KINDS[f] if k not in monthly and k != "breit_noi"]
if missing:
    sys.exit(f"Not every fund has filed this month's figures yet (missing: {', '.join(missing)}). They usually all land within a few days; try again then.")
monthly.setdefault("breit_noi", None)  # an occasional 8-K, not a monthly one
json.dump(monthly, open(os.path.join(OUT, "monthly.json"), "w"), indent=1)
print(f"wrote {os.path.join(OUT, 'monthly.json')}")
