"""
Build data/addons/tax-lens/states.json: each state's top income tax rate, from the Tax Foundation's table of state
individual income tax rates and brackets. Every rate is read from the table, not typed in.

Usage (each January, when the Tax Foundation publishes the new year's table):
    curl -sL -A "Mozilla/5.0" -o states.html https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/
    python3 -I scripts/sec/html2txt.py states.html states.txt
    python3 -I scripts/tax/state_rates.py states.txt data/addons/tax-lens/states.json

The table lists each state's brackets for single and joint filers, one row per bracket, continuation rows starting
with "- <State>". The top rate is the highest rate in either column; "from" is the joint income where it starts.
"""
import json
import re
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
URL = "https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/"

CODES = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA", "Colorado": "CO", "Connecticut": "CT",
    "Delaware": "DE", "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
    "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI",
    "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH",
    "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
    "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN",
    "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI",
    "Wyoming": "WY", "Washington DC": "DC",
}

lines = open(SRC, encoding="utf-8").read().split("\n")
title = next(l for l in lines if "State Individual Income Tax Rates and Brackets, as of" in l)
as_of = re.search(r"as of (\w+ \d+, \d{4})", title).group(1)
start = next(i for i, l in enumerate(lines) if l.startswith("State | Single Filer (Rates)"))
end = next(i for i, l in enumerate(lines) if i > start and l.startswith("(a) Local income taxes"))

pct = lambda s: float(s.rstrip("%"))
money = lambda s: int(s.replace("$", "").replace(",", ""))
rows = {}
for l in lines[start + 1:end]:
    c = [x.strip() for x in l.split(" | ")]
    name = re.sub(r"\s*\(.*\)$", "", c[0].lstrip("- ").strip())
    if name not in CODES:
        continue
    s = rows.setdefault(name, {"single": [], "joint": [], "none": False, "gainsOnly": False, "deduction": None})
    if len(c) > 1 and c[1] == "none":
        s["none"] = True
    elif len(c) > 1 and c[1] == "Capital gains income only":
        s["gainsOnly"] = True
    elif len(c) >= 7 and c[1].endswith("%") and c[4].endswith("%"):
        s["single"].append((pct(c[1]), money(c[3])))
        s["joint"].append((pct(c[4]), money(c[6])))
        if len(c) > 7 and re.fullmatch(r"\$[\d,]+", c[7]) and s["deduction"] is None:
            s["deduction"] = money(c[7])
    elif len(c) >= 4 and c[1].endswith("%"):
        # A joint filer's extra bracket (New Jersey has one more than single filers).
        s["joint"].append((pct(c[1]), money(c[3])))

states = []
for name, s in rows.items():
    entry = {"code": CODES[name], "name": "District of Columbia" if name == "Washington DC" else name}
    if s["none"]:
        entry.update({"top": 0, "note": "No state income tax."})
    elif s["gainsOnly"]:
        top, frm = max(s["joint"])
        entry.update({"top": 0, "note": f"Taxes long-term capital gains only, not dividends: {s['joint'][0][0]:g}% on gains above a ${s['deduction']:,} deduction, {top:g}% above ${frm:,}. The calculator counts none."})
    else:
        top = max(r for r, _ in s["single"] + s["joint"])
        frm = next(b for r, b in s["joint"] if r == top)
        entry.update({"top": top, "from": frm})
        if len({r for r, _ in s["joint"]}) == 1:
            entry["flat"] = True
    states.append(entry)

missing = set(CODES.values()) - {s["code"] for s in states}
if missing or len(states) != 51:
    sys.exit(f"STOPPED: expected 50 states and DC, got {len(states)} (missing {sorted(missing)}). Nothing was written.")
for s in states:
    if not 0 <= s["top"] < 20:
        sys.exit(f"STOPPED: {s['name']} top rate {s['top']}% is outside 0–20%. Nothing was written.")
states.sort(key=lambda s: s["name"])

out = {
    "asOf": "-".join([re.search(r"\d{4}", as_of).group(0), "%02d" % (["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].index(as_of.split()[0]) + 1), "%02d" % int(re.search(r" (\d+),", as_of).group(1))]),
    "source": {"name": f"Tax Foundation, State Individual Income Tax Rates and Brackets, {as_of[-4:]}", "url": URL, "page": f"Rates and brackets as of {as_of}"},
    "basis": "Each state's top rate on income and, for married couples filing jointly, the taxable income where it starts. Local income taxes (New York City's, for example) are left out.",
    "default": "IL",
    "states": states,
}
with open(OUT, "w") as fh:
    json.dump(out, fh, indent=1, ensure_ascii=False)
    fh.write("\n")
print(f"wrote {OUT}: {len(states)} states, rates as of {as_of}")
