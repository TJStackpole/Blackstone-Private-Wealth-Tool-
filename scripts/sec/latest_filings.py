"""
Find each fund's newest 10-Q and 10-K on SEC EDGAR, download them (plus chart images) into a folder, and write a
manifest.json there for build_data.py. Exits 3, downloading nothing, when the site already has every newest 10-Q.

    export SEC_USER_AGENT="Your Name you@example.com"    # the SEC asks automated requests to name a contact
    python3 -I scripts/sec/latest_filings.py filings/2026-11-20 data
"""
import json
import os
import sys
import time
import urllib.request

OUT, DATA = sys.argv[1], sys.argv[2]
UA = os.environ.get("SEC_USER_AGENT")
if not UA:
    sys.exit("Set SEC_USER_AGENT to 'Your Name your@email' first (SEC fair-access rule).")
FUNDS = {"breit": 1662972, "bxinfra": 2030772, "bxpe": 1930054, "bcred": 1803498}
CHARTS = {"breit", "bxpe"}  # their sector and region figures are read from charts inside the 10-Q


def get(url):
    time.sleep(0.2)  # well under the SEC's 10 requests a second
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA})) as r:
        return r.read()


def newest(recent, form):
    for i, f in enumerate(recent["form"]):
        if f == form:
            return {"acc": recent["accessionNumber"][i].replace("-", ""), "date": recent["reportDate"][i], "doc": recent["primaryDocument"][i]}
    return None


found, new = {}, []
for fund, cik in FUNDS.items():
    recent = json.loads(get(f"https://data.sec.gov/submissions/CIK{cik:010d}.json"))["filings"]["recent"]
    q, k = newest(recent, "10-Q"), newest(recent, "10-K")
    have = json.load(open(os.path.join(DATA, f"{fund}.json")))["asOf"]
    latest = max(x["date"] for x in (q, k) if x)
    print(f"  {fund.upper():8} newest 10-Q {q['date']}, 10-K {k['date']}; site has {have}{'  NEW' if latest > have else ''}")
    if latest > have:
        new.append(fund)
    found[fund] = {"cik": cik, "10-Q": q, "10-K": k}

if not new:
    sys.exit(3)

os.makedirs(OUT, exist_ok=True)
files = {}
for fund, f in found.items():
    for form, key, name in (("10-Q", fund, f"{fund}-{f['10-Q']['date'].replace('-', '')}"), ("10-K", f"{fund}_10k", f"{fund}-10k-{f['10-K']['date'].replace('-', '')}")):
        x = f[form]
        base = f"https://www.sec.gov/Archives/edgar/data/{f['cik']}/{x['acc']}"
        open(os.path.join(OUT, name + ".htm"), "wb").write(get(f"{base}/{x['doc']}"))
        files[key] = name
        print(f"  saved {name}.htm  ({base}/{x['doc']})")
        if form == "10-Q" and fund in CHARTS:
            for item in json.loads(get(f"{base}/index.json"))["directory"]["item"]:
                if item["name"].lower().endswith(".jpg"):
                    open(os.path.join(OUT, item["name"]), "wb").write(get(f"{base}/{item['name']}"))
                    print(f"  saved {item['name']}")
json.dump({"found": found, "files": files}, open(os.path.join(OUT, "manifest.json"), "w"), indent=2)
print(f"  wrote {OUT}/manifest.json")
