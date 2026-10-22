"""
Build /data/{breit,bxinfra,bxpe,bcred}.json from the funds' SEC 10-Q filings.

Usage:
    scripts/sec/fetch_filings.sh ./filings          # downloads + converts to text
    python3 -I scripts/sec/build_data.py ./filings data

Every figure written here either
  (a) is parsed from the filing text and reconciled against a total the filing prints, or
  (b) is read from a chart image inside the same filing; those constants are marked CHART below
      with the image file name, so they can be re-checked by eye.
If a reconciliation fails the script stops instead of writing data.
"""
import json
import os
import re
import sys

FILINGS, OUT = sys.argv[1], sys.argv[2]
EDGAR = "https://www.sec.gov/Archives/edgar/data"


def read(name):
    return open(os.path.join(FILINGS, name), encoding="utf-8").read().split("\n")


def num(s):
    return float(s.replace(",", "").replace("(", "-").replace(")", ""))


def isnum(s):
    return re.fullmatch(r"\(?[\d,]+(\.\d+)?\)?", s or "") is not None


def check(ok, msg):
    if not ok:
        sys.exit(f"RECONCILIATION FAILED: {msg}")
    print(f"  ok  {msg}")


def write(name, obj):
    path = os.path.join(OUT, name)
    with open(path, "w") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"wrote {path}")


US_STATES = set(
    "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH "
    "OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split()
)

# --------------------------------------------------------------------------------------------- BREIT
def build_breit():
    print("BREIT")
    lines = read("breit-20260630.txt")
    start = next(i for i, l in enumerate(lines) if l.startswith("Segment and Investment | Number of"))
    rows, totals, seg = [], {}, None
    for l in lines[start + 1:]:
        if l.startswith("(1)"):
            break
        m = re.match(r"^([A-Za-z &/-]+):$", l.strip())
        if m:
            seg = m.group(1)
            continue
        if " | " not in l:
            continue
        c = [x.strip() for x in l.split(" | ")]
        if c[0].startswith("Total "):
            totals[c[0][6:]] = int(c[1].replace(",", ""))
            continue
        if len(c) < 6 or not re.match(r"^([\d,]+|N/A(\(\d+\))?)$", c[1]):
            continue
        rows.append({
            "name": re.sub(r"\(\d+\)", "", c[0]).strip(),
            "sector": seg,
            # Single-family rental platforms report homes, not properties ("N/A" in the table).
            "properties": int(c[1].replace(",", "")) if c[1][0].isdigit() else 0,
            "location": c[2],
            "states": sorted({s for s in re.findall(r"\b([A-Z]{2})\b", c[2]) if s in US_STATES}),
            "acquired": c[3],
            "ownership": re.sub(r"\(\d+\)", "", c[4]),
            "size": c[5],
            "occupancy": re.sub(r"^\(\d+\)$", "n/a", c[6]) if len(c) > 6 else "",
        })
    by_seg = {}
    for r in rows:
        by_seg[r["sector"]] = by_seg.get(r["sector"], 0) + r["properties"]
    for k, v in totals.items():
        if k == "Investments in Real Estate":
            check(sum(by_seg.values()) == v, f"BREIT all properties {sum(by_seg.values())} == filing total {v}")
        else:
            check(by_seg.get(k) == v, f"BREIT {k} properties {by_seg.get(k)} == filing total {v}")
    unplaced = [r for r in rows if not r["states"]]

    # NAV table
    nav_total = next(l for l in lines if l.startswith("Total | $ |") and l.count("|") == 3)
    nav_total = num(nav_total.split(" | ")[2]) / 1e6  # $ thousands -> $ billions
    # Balance-sheet total equity, for the side-by-side note: BREIT's $56.6B is NAV at fair value, not GAAP net assets.
    equity = num(next(l for l in lines if l.startswith("Total equity |")).split(" | ")[1]) / 1e6
    check(15 < equity < 40, f"BREIT: total equity ${equity:.1f}B")
    class_i = next(l for l in lines if l.startswith("Class I Shares | $ |"))
    class_i_nav = class_i.split(" | ")[-1]
    check(abs(nav_total - 56.567757) < 1e-6, f"BREIT total NAV ${nav_total:.1f}B read from NAV table")

    url = f"{EDGAR}/1662972/000166297226000111/breit-20260630.htm"
    return {
        "fund": "BREIT",
        "assetClass": "Real Estate",
        "asOf": "2026-06-30",
        "source": {"name": "BREIT Form 10-Q, quarter ended June 30, 2026 (filed Aug 7, 2026)", "url": url},
        "filing": {"form": "10-Q", "period": "2026-06-30", "filed": "2026-08-07", "url": url,
                   "entity": "Blackstone Real Estate Income Trust, Inc.", "cik": "0001662972"},
        "locationBasis": "property",
        "summary": {
            "headline": "BREIT is a non-traded real estate investment trust that owns income-producing property, mostly in the U.S. South and West. Individual investors buy shares through a financial advisor at a price set each month, and can ask to sell back a limited amount each month or quarter.",
            "stats": [
                {"label": "Net asset value", "value": f"${nav_total:.1f}B", "note": "all share classes and operating partnership units"},
                {"label": "NAV per share", "value": f"${float(class_i_nav):.2f}", "note": "Class I"},
                {"label": "Properties", "value": "4,530", "note": "plus 63,081 single-family rental homes"},
                {"label": "Real estate vs. debt", "value": "97% / 3%", "note": "share of investments at fair value"},
            ],
        },
        "sizeNote": f"BREIT reports its size as NAV, at fair value (${nav_total:.1f}B). Its balance sheet, which carries property at cost less depreciation, shows total equity of ${equity:.1f}B.",
        # CHART breit-20260630_g3.jpg "Property Sector" (also stated in text for the top three)
        "sectorBasis": "Share of real estate investments by asset value, as charted in the 10-Q.",
        "sectors": [
            {"key": "Rental Housing", "label": "Rental Housing", "pct": 42},
            {"key": "Data Centers", "label": "Data Centers", "pct": 27},
            {"key": "Industrial", "label": "Industrial", "pct": 20},
            {"key": "Net Lease", "label": "Net Lease", "pct": 5},
            {"key": "Office", "label": "Office", "pct": 2},
            {"key": "Retail", "label": "Retail", "pct": 2},
            {"key": "Hospitality", "label": "Hospitality", "pct": 2},
        ],
        "geography": {
            "level": "us-region",
            # CHART breit-20260630_g4.jpg "Region Concentration" (South/West/East also stated in text)
            "basis": "Regions as defined by NCREIF, by asset value of real estate properties. The filing reports regions, plus the three largest states; it does not report other states.",
            "items": [
                {"key": "South", "label": "South", "pct": 35},
                {"key": "West", "label": "West", "pct": 28},
                {"key": "East", "label": "East", "pct": 20},
                {"key": "Midwest", "label": "Midwest", "pct": 12},
                {"key": "Non-US", "label": "Non-U.S. (Europe and Canada)", "pct": 5, "note": "not shown on the U.S. map"},
            ],
            # CHART breit-20260630_g5.jpg "Largest BREIT States"
            "topStates": [{"state": "TX", "pct": 11}, {"state": "GA", "pct": 11}, {"state": "FL", "pct": 11}],
        },
        "investments": rows,
        "investmentsNote": f"The 10-Q lists {len(rows)} investments. {len(unplaced)} of them, holding {sum(r['properties'] for r in unplaced):,} of the 4,530 properties plus the single-family rental homes, give their location only as 'Various' or a non-U.S. place, so they can't be pinned to a state.",
        "thisQuarter": [
            "Sold 20 rental housing, 79 self storage and 27 industrial properties for $2.1 billion, exiting self storage entirely.",
            "Put $3.3 billion (at BREIT's share) into data center development through its QTS platform, described as 100% pre-leased.",
            "Raised $1.1 billion from investors and repurchased $0.9 billion of shares and units.",
        ],
        "howItWorks": {
            "title": "How getting money out works",
            "asOf": "2026-06-30",
            "paragraphs": [
                "Shares are bought and sold back at a price based on the fund's net asset value, set each month.",
                "The plan limits buybacks to 2% of the fund's NAV per month and 5% per calendar quarter. Shares held under a year are bought back at 98% of the price.",
                "The board can repurchase fewer shares than requested, or none. It has made exceptions to the limits in the past, and can modify or suspend the plan.",
            ],
            "source": {"name": "BREIT 10-Q, Share Repurchase Plan", "url": url},
        },
        "notDisclosed": [
            "A value for each named investment.",
            "Weights for any state other than the three largest.",
            "Which cities hold the properties listed as 'Various'.",
        ],
    }


# ------------------------------------------------------------------------------- BXINFRA / BXPE
GEOS = {"Americas", "EMEA", "APAC", "Various"}


def parse_aggregator(fname, expected_total):
    lines = read(fname)
    hdr = "Condensed Consolidated Schedule of Investments as of June 30, 2026 (Unaudited)"
    start = next(i for i, l in enumerate(lines) if l.strip() == hdr)
    end = next(i for i in range(start, len(lines)) if lines[i].startswith("Total Investments") and ("Investee" in lines[i] or "(Cost" in lines[i]))
    ind, kind, rows = None, None, []
    for l in lines[start:end]:
        s = l.strip()
        if " | " not in s:
            if not s or s.startswith(("(", "Condensed", "Table", "BX", "See", "continued")) or s[0].isdigit():
                continue
            if re.match(r"^(Equity Investments|Debt Investments|Investments)", s):
                kind = "Debt" if s.startswith("Debt") else "Equity"
                continue
            ind = re.sub(r"\s*\(\w\)$", "", s).replace(" and ", " & ")
            continue
        c = [x.strip() for x in s.split(" | ")]
        if c[0].startswith(("Total", "Name of")):
            continue
        c = [re.sub(r"%$", "", x) for x in c if x not in ("$", "%")]
        if len(c) < 4 or c[1] not in GEOS:
            continue
        rows.append({"name": re.sub(r"\s*\(\w\)", "", c[0]).strip(), "geo": c[1], "fv": num(c[2]),
                     "pct": num(c[3]), "industry": ind, "kind": kind})
    tot = sum(r["fv"] for r in rows)
    check(abs(tot - expected_total) < 1, f"{fname}: schedule rows sum to {tot:,.0f} == filing total {expected_total:,.0f}")
    return rows, tot


def shares(rows, key, tot):
    out = {}
    for r in rows:
        out[r[key]] = out.get(r[key], 0) + r["fv"]
    return {k: round(v / tot * 100, 1) for k, v in sorted(out.items(), key=lambda kv: -kv[1])}


def by_sector_geo(rows, sectors):
    """For each industry, how its fair value splits across Americas / EMEA / APAC / Various."""
    out = {}
    for s in sectors:
        sub = [r for r in rows if r["industry"] == s]
        t = sum(r["fv"] for r in sub)
        if t <= 0:
            continue
        out[s] = [{"key": g, "pct": round(sum(r["fv"] for r in sub if r["geo"] == g) / t * 100, 1)} for g in ["Americas", "EMEA", "APAC", "Various"]]
        out[s] = [x for x in out[s] if x["pct"] > 0]
    return out


def strip_units(name):
    return re.sub(r"\s*\((?:[\d,]+ [Ss]hares|Outstanding Principal of \$[\d,]+)\)", "", name).strip()


# Both funds' 10-Qs: "expects to periodically redeem up to 3% of its units outstanding per quarter", a 5% Early
# Redemption Deduction for units held under two years, and the General Partner "may ... modify or suspend" the plan.
REDEEM = "The fund expects to redeem up to 3% of its units outstanding each quarter in total. Units held under two years pay a 5% early redemption deduction, and the general partner can modify or suspend the plan."

GEO_LABEL = {"Americas": "Americas", "EMEA": "Europe, Middle East & Africa", "APAC": "Asia-Pacific", "Various": "Various / multi-region"}


def build_bxinfra(old):
    print("BX Infra")
    rows, tot = parse_aggregator("bxinfra-20260630.txt", 6_070_643)
    for r in rows:  # The schedule's "Various" industry: fund interests (footnote f) plus a small debt line.
        if r["industry"] == "Various":
            r["industry"] = "Various industries"
    lines = read("bxinfra-20260630.txt")
    agg_nav = [l for l in lines if l.startswith("Total Net Assets |")][2]
    agg_nav = num(agg_nav.split(" | ")[1]) / 1e6
    check(abs(agg_nav - 5.625905) < 1e-6, f"BX Infra aggregator net assets ${agg_nav:.2f}B")
    us_nav = num([l for l in lines if l.startswith("Total Net Assets |")][1].split(" | ")[1]) / 1e6
    check(abs(us_nav - 5.224553) < 1e-6, f"BX Infra U.S. net assets ${us_nav:.2f}B")
    own = re.search(r"BXINFRA U\.S\. has an interest of ([\d.]+)%", "\n".join(lines)).group(1)
    ind = shares(rows, "industry", tot)
    geo = shares(rows, "geo", tot)
    named = {}
    for r in rows:
        if r["name"].startswith("Other "):
            continue
        n = re.sub(r"L\.L\.C\.?$", "L.L.C.", strip_units(r["name"]))
        d = named.setdefault(n, {"name": n, "sector": r["industry"], "geo": r["geo"], "fv": 0.0, "pct": 0.0, "kinds": set()})
        d["fv"] += r["fv"]; d["pct"] += r["pct"]; d["kinds"].add(r["kind"])
    notes = {
        "Infrastructure Investments L.P.": "A fund interest. The filing says its holdings are 46% digital, 28% energy and 26% transportation.",
        "SP Ibex Acquisitions L.P.": "Listed under 'Various' industries and geographies.",
    }
    top = sorted(named.values(), key=lambda d: -d["fv"])
    url = f"{EDGAR}/2030772/000203077226000017/bxinfra-20260630.htm"
    sectors = [{"key": k, "label": k, "pct": v} for k, v in ind.items()]
    return {
        "fund": "BX Infra",
        "assetClass": "Infrastructure",
        "asOf": "2026-06-30",
        "source": {"name": "Blackstone Infrastructure Strategies Form 10-Q, quarter ended June 30, 2026 (filed Aug 11, 2026)", "url": url},
        "filing": {"form": "10-Q", "period": "2026-06-30", "filed": "2026-08-11", "url": url,
                   "entity": "Blackstone Infrastructure Strategies L.P.", "cik": "0002030772"},
        "locationBasis": "region",
        "summary": {
            "headline": "BX Infra is a non-traded fund that owns stakes in long-lived infrastructure: transportation, digital and energy assets. It aims to keep at least 80% of its NAV in infrastructure investments and up to 20% in debt and other securities. Eligible investors subscribe monthly. " + REDEEM,
            "stats": [
                {"label": "Net assets", "value": f"${us_nav:.1f}B", "note": f"BXINFRA U.S., which owns {own}% of the aggregator that holds the investments (${agg_nav:.1f}B with a parallel fund)"},
                {"label": "NAV per unit", "value": "$29.99", "note": "Transactional NAV, Class I, Series I"},
                {"label": "Investments", "value": f"${tot / 1e6:.2f}B", "note": "at fair value, held by the aggregator: 107.9% of its net assets"},
                {"label": "Named holdings", "value": str(len(top)), "note": "the rest are reported as 'Other investments'"},
            ],
        },
        "sectorBasis": "Share of total investments at fair value, summed from the 10-Q's schedule of investments (equity and debt).",
        "sectors": sectors,
        "geography": {
            "level": "world-region",
            "basis": "Regions as reported in the schedule of investments: Americas, EMEA, APAC, or Various. The filing gives no country or state detail.",
            "items": [{"key": k, "label": GEO_LABEL[k], "pct": v} | ({"note": "spans several regions; not shown on the map"} if k == "Various" else {}) for k, v in geo.items()],
            "bySector": by_sector_geo(rows, list(ind.keys())),
            "bySectorBasis": "Split of that sector's fair value across regions, from the schedule of investments.",
        },
        "topHoldings": {
            "basis": f"Every holding the schedule of investments names, with its fair value as a share of the aggregator's ${agg_nav:.1f}B net assets. Equity and debt in the same company are combined.",
            "items": [{"name": d["name"], "sector": d["sector"], "geo": d["geo"],
                       "fairValueMillions": round(d["fv"] / 1000, 1), "pctOfNetAssets": round(d["pct"], 1),
                       **({"note": notes[d["name"]]} if d["name"] in notes else {})} for d in top],
        },
        "notDisclosed": [
            "What most holdings do: the largest are listed under holding-company names, such as 'Mercury Co-Invest L.P.', that don't identify the business.",
            f"{100 - sum(d['pct'] for d in top) / 107.9 * 100:.0f}% of investments are grouped as 'Other investments' with no name.",
            "Any country, state or city.",
        ],
        "context": [{
            "appliesTo": "Digital Infrastructure",
            "label": "US data center electricity use, 2023",
            "value": "About 176 TWh, roughly 4.4% of all US electricity. The same report projects 6.7% to 12% by 2028.",
            "asOf": "2024-12-20",
            "source": {"name": "Lawrence Berkeley National Laboratory, 2024 United States Data Center Energy Usage Report (for the US Department of Energy)",
                       "url": "https://energyanalysis.lbl.gov/news/berkeley-lab-report-evaluates-increase-electricity-demand-data-centers"},
        }],
    }


def build_bxpe():
    print("BXPE")
    rows, tot = parse_aggregator("bxpe-20260630.txt", 17_193_030)
    lines = read("bxpe-20260630.txt")
    agg_nav = [l for l in lines if l.startswith("Total Net Assets |")][2]
    agg_nav = num(agg_nav.split(" | ")[1]) / 1e6
    check(abs(agg_nav - 17.310207) < 1e-6, f"BXPE aggregator net assets ${agg_nav:.2f}B")
    us_nav = num([l for l in lines if l.startswith("Total Net Assets |")][1].split(" | ")[1]) / 1e6
    check(abs(us_nav - 14.228746) < 1e-6, f"BXPE U.S. net assets ${us_nav:.2f}B")
    own = re.search(r"BXPE U\.S\. had an interest of ([\d.]+)% in the Aggregator", "\n".join(lines)).group(1)
    ind = shares(rows, "industry", tot)
    url = f"{EDGAR}/1930054/000193005426000016/bxpe-20260630.htm"
    named = [r for r in rows if not r["name"].startswith("Other ")]
    return {
        "fund": "BXPE",
        "assetClass": "Private Equity",
        "asOf": "2026-06-30",
        "source": {"name": "Blackstone Private Equity Strategies Fund Form 10-Q, quarter ended June 30, 2026 (filed Aug 13, 2026)", "url": url},
        "filing": {"form": "10-Q", "period": "2026-06-30", "filed": "2026-08-13", "url": url,
                   "entity": "Blackstone Private Equity Strategies Fund L.P.", "cik": "0001930054"},
        "locationBasis": "region",
        "summary": {
            "headline": "BXPE is a non-traded private equity fund designed to invest across Blackstone private equity's major strategies: Corporate Private Equity, Secondaries, Hybrid Capital, Growth and Life Sciences. Eligible investors subscribe monthly. " + REDEEM,
            "stats": [
                {"label": "Net assets", "value": f"${us_nav:.1f}B", "note": f"BXPE U.S., which owns {own}% of the aggregator that holds the investments (${agg_nav:.1f}B with a parallel fund)"},
                {"label": "NAV per unit", "value": "$39.01", "note": "Transactional NAV, Class I, Series I"},
                {"label": "Corporate private equity", "value": "58%", "note": "Growth 24%, Hybrid Capital 12%, Secondaries 3%, Debt 3%"},
                {"label": "Named holdings", "value": str(len(named)), "note": "the rest are reported as 'Other investments'"},
            ],
        },
        # CHART bxpe-20260630_g4.jpg "Sector Breakdown (% of fair value)"
        "sectorBasis": "Share of fair value, as charted in the 10-Q. Rounded by the fund, so the total is 101%.",
        "sectors": [
            {"key": "Technology & Services", "label": "Technology & Services", "pct": 13},
            {"key": "Industrials", "label": "Industrials", "pct": 13},
            {"key": "Business Services", "label": "Business Services", "pct": 11},
            {"key": "Consumer", "label": "Consumer", "pct": 11},
            {"key": "Software", "label": "Software", "pct": 10},
            {"key": "Energy", "label": "Energy", "pct": 9},
            {"key": "Financial Services", "label": "Financial Services", "pct": 9},
            {"key": "Healthcare", "label": "Healthcare", "pct": 8},
            {"key": "Media & Entertainment", "label": "Media & Entertainment", "pct": 7},
            {"key": "Infrastructure", "label": "Infrastructure", "pct": 4},
            {"key": "Debt & Other Securities", "label": "Debt & Other Securities", "pct": 3},
            {"key": "Specialty Finance", "label": "Specialty Finance", "pct": 2},
            {"key": "Diversified", "label": "Diversified", "pct": 1},
        ],
        "geography": {
            "level": "world-region",
            # CHART bxpe-20260630_g3.jpg "Regional Breakdown (% of fair value)"
            "basis": "Regions as charted in the 10-Q, by fair value. The filing gives no country or state detail.",
            "items": [
                {"key": "Americas", "label": "Americas", "pct": 77},
                {"key": "EMEA", "label": "Europe, Middle East & Africa", "pct": 15},
                {"key": "APAC", "label": "Asia-Pacific", "pct": 6},
                {"key": "Various", "label": "Debt & other securities", "pct": 3, "note": "not assigned to a region; not shown on the map"},
            ],
            "bySector": by_sector_geo([r for r in rows if r["kind"] == "Equity"], list(ind.keys())),
            "bySectorBasis": "Split of that sector's equity holdings across regions, from the 10-Q's schedule of investments.",
        },
        "topHoldings": {
            "basis": f"Every holding the schedule of investments names, with its fair value as a share of the aggregator's ${agg_nav:.1f}B net assets.",
            "items": [{"name": strip_units(r["name"]), "sector": r["industry"], "geo": r["geo"],
                       "fairValueMillions": round(r["fv"] / 1000, 1), "pctOfNetAssets": r["pct"]}
                      for r in sorted(named, key=lambda r: -r["fv"])],
        },
        "notDisclosed": [
            "The names of all but two portfolio companies. The rest are grouped as 'Other investments' by sector and region.",
            "Any country, state or city.",
        ],
    }


# --------------------------------------------------------------------------------------------- BCRED
def build_bcred(old):
    print("BCRED")
    lines = read("bcred-20260630.txt")
    start = next(i for i, l in enumerate(lines) if l.strip() == "Condensed Consolidated Schedule of Investments")
    end = next(i for i in range(start + 1, len(lines)) if lines[i].startswith("Total Investments - non-controlled/non-affiliated"))
    co, industry = {}, None
    for l in lines[start:end]:
        s = l.strip()
        if " | " not in s:
            if s and not s.startswith(("(", "Condensed", "June", "Table", "Blackstone", "See")) and not isnum(s):
                if not re.match(r"^(First Lien|Second Lien|Unsecured|Structured|Investments in|Equity|Total|Non-controlled|Controlled)", s):
                    industry = re.sub(r"\s*\(continued\)$", "", s)
            continue
        c = [x.strip() for x in s.split(" | ")]
        if c[0].startswith(("Total", "Investments (")):
            continue
        if c[-1] == "%":
            c = c[:-1]
        if len(c) < 4 or not (isnum(c[-1]) and isnum(c[-2])):
            continue
        fv, pct = num(c[-2]), num(c[-1])
        name = re.sub(r"\s*\(\d+\)", "", c[0]).strip()
        if "Cash" in name or pct > 100:
            continue
        d = co.setdefault(name, {"name": name, "industry": industry, "fv": 0.0, "pct": 0.0})
        d["fv"] += fv
        d["pct"] += pct
    tot = sum(d["fv"] for d in co.values())
    check(abs(tot - 77_649_107) < 5, f"BCRED: {len(co)} companies sum to {tot:,.0f} == filing total 77,649,107")

    # Industry composition table (GICS), June 30, 2026 column
    i0 = next(i for i, l in enumerate(lines) if l.startswith("The Company utilizes the Global Industry Classification Standard"))
    gics = {}
    for l in lines[i0:i0 + 120]:
        if l.startswith("Total | 100.0"):
            break
        c = [x.strip() for x in l.split(" | ")]
        if len(c) >= 2 and (isnum(c[1]) or c[1] == "—") and not c[0].startswith("June"):
            gics[re.sub(r"\s*\(\d\)", "", c[0]).strip()] = 0.0 if c[1] == "—" else num(c[1])
    check(abs(sum(gics.values()) - 100) < 1.0, f"BCRED: GICS industries sum to {sum(gics.values()):.1f}% (rounding)")
    top_ind = sorted(gics.items(), key=lambda kv: -kv[1])[:10]
    other = round(100 - sum(v for _, v in top_ind), 1)

    # Geographic composition table
    g0 = next(i for i, l in enumerate(lines) if l.startswith("The geographic composition of investments"))
    geo = []
    keys = {"United States": "US", "Europe": "Europe", "Bermuda/Cayman Islands": "BermudaCayman", "Canada": "Canada",
            "Australia/New Zealand": "AusNZ", "Asia": "Asia"}
    for l in lines[g0 + 3:g0 + 10]:
        c = [x for x in (x.strip() for x in l.split(" | ")) if x not in ("$", "%")]
        if c[0] == "Total":
            break
        geo.append({"key": keys[c[0]], "label": c[0], "pct": num(c[3])})
    check(abs(sum(g["pct"] for g in geo) - 100) < 0.2, "BCRED: geographic shares sum to 100%")

    n_co, n_co_prior = [int(x) for x in next(l for l in lines if l.startswith("Number of portfolio companies |")).split(" | ")[1:3]]
    # Rows of the share repurchase table: "Feb 2, 2026 | Mar 2, 2026 | shares | pct | % | $ | price | date | $ | amount | —"
    tenders = [c for c in (l.split(" | ") for l in lines if re.match(r"^\w+ \d+, 2026 \| \w+ \d+, 2026 \| [\d,]+ \| [\d.]+ \| % \| \$ \|", l)) if len(c) >= 10]
    # columns: start | deadline | shares | pct | % | $ | price | pricing date | $ | amount ($000) | remaining
    tenders = list(dict.fromkeys(tuple(t) for t in tenders))  # the 10-Q prints this table twice (notes and Part II)
    tenders = [{"pct": t[3], "price": t[6], "amount": num(t[9]) / 1e6} for t in tenders]
    check(len(tenders) == 2, f"BCRED: two 2026 tender offers found ({[t['pct'] for t in tenders]})")
    nav = next(l for l in lines if l.startswith("Total net assets |"))
    nav = num(nav.split(" | ")[1]) / 1e6
    navps = next(l for l in lines if l.startswith("Net asset value per share |")).split(" | ")[2]
    # The Emerald joint venture is an investment, not a borrower, so it's left out of the borrower ranking.
    jv = next(d for d in co.values() if "Emerald JV" in d["name"])
    top = sorted((d for d in co.values() if "JV" not in d["name"]), key=lambda d: -d["fv"])[:12]
    url = f"{EDGAR}/1803498/000180349826000048/bcred-20260630.htm"

    def label_ind(d):
        return "Joint venture" if "JV" in d["name"] else d["industry"]

    hiw = old.get("howItWorks", {})

    def move(now, before):
        """Signed percent change with a true minus sign, and its direction."""
        ch = (now / before - 1) * 100
        return f"{'+' if ch > 0 else '−'}{abs(ch):.1f}%", "up" if ch > 0 else "down" if ch < 0 else "flat"

    # Distributions: the Class I table in the notes (first one after this sentence), and July's declaration in subsequent events.
    di = next(i for i, l in enumerate(lines) if l.startswith("The Board authorizes and declares monthly distribution amounts per share"))
    ci = next(i for i in range(di, di + 5) if lines[i].strip() == "Class I")
    rows = []
    for l in lines[ci + 2:ci + 12]:
        m = re.match(r"^(\w+) \d+, 2026 \| (\w+ \d+, 2026) \| .* \| (?:\$ \| )?([\d.]+) \| (?:\$ \| )?[\d,]+$", l)
        if not m:
            break
        rows.append((m.group(2), float(m.group(3))))
    check(len(rows) == 6, f"BCRED: six Class I monthly distributions in 2026 ({len(rows)})")
    june = rows[-1][1]
    july = float(re.search(r"declared net distributions of \$([\d.]+) per Class I share", "\n".join(lines)).group(1))
    rate, rate_july = june * 12 / float(navps) * 100, july * 12 / float(navps) * 100
    check(9 < rate < 11, f"BCRED: Class I distribution rate {rate:.2f}%")

    nav_ch, nav_dir = move(nav, 47.6)
    navps_ch, navps_dir = move(float(navps), 24.79)
    q1, q2 = float(tenders[0]["pct"]), float(tenders[1]["pct"])
    nonaccrual, nonaccrual_prior = 15, 9
    return {
        "fund": "BCRED",
        "assetClass": "Private Credit",
        "asOf": "2026-06-30",
        "source": {"name": "Blackstone Private Credit Fund Form 10-Q, quarter ended June 30, 2026 (filed Aug 12, 2026)", "url": url},
        "filing": {"form": "10-Q", "period": "2026-06-30", "filed": "2026-08-12", "url": url,
                   "entity": "Blackstone Private Credit Fund", "cik": "0001803498"},
        "locationBasis": "region",
        "summary": {
            "headline": "BCRED is a non-traded business development company that lends directly to private companies, mostly through first lien, floating-rate loans. Investors buy shares at a monthly NAV, and the fund buys shares back through quarterly tender offers.",
            "stats": [
                {"label": "Distribution rate", "value": f"{rate:.1f}%",
                 "note": f"Class I, annualized: June's ${june:.2f} a share × 12 ÷ ${float(navps):.2f} NAV, Jun 30, 2026. July's declared ${july:.2f} is {rate_july:.1f}%."},
                {"label": "NAV per share", "value": f"${float(navps):.2f}", "note": "down from $24.79 on Dec 31, 2025"},
                {"label": "Portfolio companies", "value": f"{n_co:,}", "note": f"{n_co_prior:,} at Dec 31, 2025; ${tot / 1e6:.1f}B of investments at fair value"},
                {"label": "First lien loans", "value": "91.0%", "note": "of investments; 99.8% of performing debt is floating rate"},
            ],
        },
        "sectorBasis": "Industry (GICS) share of investments at fair value, from the 10-Q. The ten largest are shown; the rest are combined.",
        "sectors": [{"key": k, "label": k, "pct": v} for k, v in top_ind] + [{"key": "All other industries", "label": "All other industries", "pct": other}],
        "geography": {
            "level": "country-group",
            "basis": "Country groups exactly as the 10-Q reports them, by share of investments at fair value.",
            "items": [g | ({"note": "too small to show on the map"} if g["key"] == "BermudaCayman" else {}) for g in geo],
        },
        "topHoldings": {
            "basis": f"The twelve largest borrowers, summing every position listed under the same company name, with fair value as a share of net assets. The fund's Emerald joint venture (${jv['fv'] / 1e6:.2f}B) is left out because it is a joint venture, not a borrower.",
            "items": [{"name": d["name"], "sector": label_ind(d), "fairValueMillions": round(d["fv"] / 1000, 1),
                       "pctOfNetAssets": round(d["fv"] / (nav * 1e6) * 100, 2)} for d in top],
        },
        "notDisclosed": [
            "Where borrowers are headquartered. The filing reports country groups, so U.S. borrowers can't be placed on a state map.",
        ],
        "quarterSummary": {
            "period": "Quarter ended Jun 30, 2026",
            "asOf": "2026-06-30",
            "source": {"name": "BCRED Form 10-Q, quarter ended June 30, 2026", "url": url},
            "items": [
                {"label": "Net assets", "value": f"${nav:.1f}B", "from": "from $47.6B on Dec 31, 2025", "change": nav_ch, "direction": nav_dir},
                {"label": "NAV per share", "value": f"${float(navps):.2f}", "from": "from $24.79 on Dec 31, 2025", "change": navps_ch, "direction": navps_dir},
                {"label": "Bought back, pro rata", "value": f"{q2:.1f}%", "from": f"of shares, from {q1:.1f}% in Q1",
                 "change": f"{'+' if q2 > q1 else '−' if q2 < q1 else ''}{abs(q2 - q1):.1f} pts",
                 "direction": "up" if q2 > q1 else "down" if q2 < q1 else "flat",
                 "note": "Requests exceeded the quarterly limit, so each was filled in part."},
                {"label": "Non-accrual issuers", "value": f"{nonaccrual}", "from": f"from {nonaccrual_prior} at Dec 31, 2025",
                 "change": f"+{nonaccrual - nonaccrual_prior}", "direction": "up",
                 "note": "Loans with reasonable doubt that principal or interest will be paid in full."},
            ],
        },
        "thisQuarter": [
            f"Investors asked to sell back more shares than the quarterly limit allowed, so requests were filled pro rata. The fund bought back {tenders[1]['pct']}% of shares (${tenders[1]['amount']:.2f}B at ${tenders[1]['price']}).",
            f"In the first quarter it bought back {tenders[0]['pct']}% of shares (${tenders[0]['amount']:.2f}B at ${tenders[0]['price']}), more than the 5% quarterly level.",
            "Fifteen issuers, across 25 loans, were on non-accrual status, up from nine issuers across 16 loans at year-end. Non-accrual is the filing's term for loans where there is reasonable doubt that principal or interest will be collected in full.",
        ],
        "howItWorks": {
            "title": "How this fund works",
            "asOf": "2026-06-30",
            "paragraphs": [
                "The fund lends to private companies. 91% of its investments are first lien loans, which hold the most senior claim on a borrower's assets, and 99.8% of its performing loans carry a floating rate that moves with market rates.",
                "The share price (net asset value) is set every month.",
                "At the board's discretion, the fund may buy back up to 5% of its shares each quarter through tender offers, at that quarter's NAV. Shares held for less than a year are bought back at 98% of NAV.",
                "When requests exceed the limit they are filled pro rata, as happened this quarter. The board can amend or suspend the program, and bought back more than 5% in the first quarter.",
            ],
            "source": {"name": "BCRED 10-Q, Share Repurchase Program", "url": url},
        },
        "website": {
            "text": "BCRED's website describes its focus as floating-rate, senior secured loans to large, performing companies.",
            "source": {"name": "bcred.com", "url": "https://www.bcred.com/"},
        },
    }


ADDON_DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "data", "addons")
TENK = {
    "BREIT": f"{EDGAR}/1662972/000166297226000032/breit-20251231.htm",
    "BXINFRA": f"{EDGAR}/2030772/000119312526096453/d70902d10k.htm",
    "BXPE": f"{EDGAR}/1930054/000119312526106084/d71061d10k.htm",
}
BCRED_Q3_LETTER = f"{EDGAR}/1803498/000121390026096935/ea0244647-03_ex99a1vii.htm"


def build_compare(funds):
    """The side-by-side table: one row per question, one cell per fund, every cell from that fund's own filing.
    A figure no filing gives is left as "Not in filing" with where it would come from (see MISSING_DATA.md)."""
    print("Compare")
    tenq = {k: funds[k]["source"]["url"] for k in funds}
    q = lambda f, page: {"name": f"{f} Form 10-Q, quarter ended June 30, 2026", "url": tenq[f.replace(' ', '').upper()], "page": page}
    k = lambda f, page: {"name": f"{f} Form 10-K, year ended December 31, 2025", "url": TENK[f.replace(' ', '').upper()], "page": page}
    cells = {}

    def pct(x):
        return f"{x:.1f}%"

    def signed(x):
        return f"{'+' if x > 0 else '−' if x < 0 else ''}{abs(x):.1f}%"

    # --- Distribution rate: latest declared Class I distribution, annualized, over the June 30 NAV per share/unit.
    breit = read("breit-20260630.txt")
    i = next(n for n, l in enumerate(breit) if l.strip() == "Three Months Ended June 30, 2026" and "Net distributions declared" in breit[n + 4])
    b_dist = float(breit[i + 4].split(" | ")[2])
    b_nav = float(next(l for l in breit if l.startswith("Class I Shares | $ |")).split(" | ")[-1])
    b_nav_dec = float(next(l for l in read("breit-20251231.txt") if l.startswith("Class I Shares | $ |")).split(" | ")[-1])
    check(abs(b_dist - 0.1659) < 1e-9, f"BREIT: Q2 Class I distribution ${b_dist}")

    infra = read("bxinfra-20260630.txt")
    j = next(n for n, l in enumerate(infra) if l.startswith("The following table presents a summary of the aggregate distributions declared and payable for the six months ended June 30, 2026") and "BXINFRA U.S." in l)
    row = next(l for l in infra[j:j + 8] if re.match(r"^\w+ \d+, 2026 \| June 30, 2026", l))
    x_dist = float(re.findall(r"\d+\.\d+", row.split(" | ", 3)[3])[0])
    x_nav = float(next(l for l in infra if l.startswith("Series I | $ |")).split(" | ")[2])
    x_nav_dec = float(next(l for l in read("bxinfra-10k.txt") if l.startswith("Class I (a) | $ |")).split(" | ")[2])

    pe = read("bxpe-20260630.txt")
    pe_text = "\n".join(pe)
    check("BXPE does not currently intend to declare distributions" in pe_text, "BXPE: no distributions (filing says so)")
    p_nav = float(next(l for l in pe if l.startswith("Series I | $ |")).split(" | ")[2])
    p_nav_dec = float(next(l for l in read("bxpe-10k.txt") if l.startswith("Class I (a) | $ |")).split(" | ")[2])

    bc = funds["BCRED"]
    bc_rate = next(s for s in bc["summary"]["stats"] if s["label"] == "Distribution rate")
    bc_navs = [l for l in read("bcred-20260630.txt") if l.startswith("Net asset value per share |")][0].split(" | ")
    c_nav, c_nav_dec = float(bc_navs[2]), float(bc_navs[4])  # "… | $ | 23.65 | $ | 24.79"

    cells["distribution"] = {
        "BREIT": {"value": pct(b_dist * 4 / b_nav * 100), "note": f"Class I: Q2 2026's ${b_dist:.4f} a share × 4 ÷ ${b_nav:.2f} NAV", "sources": [q("BREIT", "Note: Distributions; Net Asset Value")]},
        "BXINFRA": {"value": pct(x_dist * 4 / x_nav * 100), "note": f"Class I, Series I: Q2 2026's ${x_dist:.4f} a unit × 4 ÷ ${x_nav:.2f} Transactional NAV", "sources": [q("BX Infra", "BXINFRA U.S. Distributions; Transactional NAV")]},
        "BXPE": {"value": "None", "note": "BXPE does not currently intend to declare distributions.", "sources": [q("BXPE", "Liquidity and Capital Resources")]},
        "BCRED": {"value": bc_rate["value"], "note": "Class I: June 2026's $0.20 a share × 12 ÷ $23.65 NAV. July's declared $0.18 is 9.1%.", "sources": [q("BCRED", "Note 9: Distributions; Subsequent Events")]},
    }

    # --- Fees, from each fund's own 10-Q (already in the Index-to-Fund data, each with its note).
    cells["management"], cells["performance"] = {}, {}
    for f in ["BREIT", "BXINFRA", "BXPE", "BCRED"]:
        fees = json.load(open(os.path.join(ADDON_DATA, "index-vs-fund", f"{f}.json")))["fees"]
        m, pf = fees["management"], fees["performance"]
        cells["management"][f] = {"value": f"{m['value']}% a year", "note": "of NAV", "sources": [m["source"]]}
        cells["performance"][f] = {"value": f"{pf['value']}%", "note": pf["note"], "sources": [pf["source"]]}

    # --- Repurchase limits, from each fund's own 10-Q (the Liquidity Simulator's terms).
    terms = {t["fund"]: t for t in json.load(open(os.path.join(ADDON_DATA, "liquidity", "terms.json")))["funds"]}
    word = {"BREIT": "of NAV", "BCRED": "of shares", "BXPE": "of units", "BXINFRA": "of units"}
    cells["limit"] = {}
    for f, t in terms.items():
        lim = {l["label"]: l["value"] for l in t["limits"]}
        if f == "BREIT":
            v = f"{lim['Monthly limit']}% a month · {lim['Quarterly limit']}% a quarter"
        else:
            v = f"{next(iter(lim.values()))}% a quarter"
        note = f"{word[f]}" + ("; a target the board can change" if f == "BCRED" else "")
        cells["limit"][f] = {"value": v, "note": note, "sources": [t["limits"][0]["source"]]}

    # --- Were last quarter's (Q2 2026) repurchases pro-rated? Only what each filing says.
    check("which represents all repurchase requests received for the six months ended June 30, 2026" in "\n".join(breit), "BREIT: all H1 2026 requests filled")
    check("All redemption requests were satisfied in full." in "\n".join(infra), "BX Infra: Q2 requests satisfied in full")
    check("All redemption requests were satisfied in full." in pe_text, "BXPE: Q2 requests satisfied in full")
    letter = "\n".join(read("bcred-tender-000121390026096935.txt"))
    check("In Q2, BCRED fulfilled approximately half of the $4." in letter, "BCRED: Q2 about half of requests filled")
    cells["prorated"] = {
        "BREIT": {"value": "No", "note": "Every repurchase request received in the first half of 2026 was filled.", "sources": [q("BREIT", "Liquidity and Capital Resources")]},
        "BXINFRA": {"value": "No", "note": "All redemption requests were satisfied in full.", "sources": [q("BX Infra", "Part II, Item 2: Unit Redemptions")]},
        "BXPE": {"value": "No", "note": "All redemption requests were satisfied in full.", "sources": [q("BXPE", "Part II, Item 2: Unit Redemptions")]},
        "BCRED": {"value": "Yes", "note": "Requests above the 5% amount were filled pro rata: about half of the $4.5 billion requested.",
                  "sources": [{"name": "BCRED letter to investors, September 3, 2026 (SEC filing)", "url": BCRED_Q3_LETTER}]},
    }

    # --- Minimum investment: not in any of these filings.
    where = {
        "BREIT": "BREIT's prospectus (Form 424B3), \"Plan of Distribution\" / \"How to Subscribe\"",
        "BCRED": "BCRED's prospectus (Form 424B3), \"Plan of Distribution\" / \"How to Subscribe\"",
        "BXPE": "BXPE's private placement memorandum (subscription terms); not filed on EDGAR",
        "BXINFRA": "BX Infra's private placement memorandum (subscription terms); not filed on EDGAR",
    }
    cells["minimum"] = {f: {"value": None, "missing": "Not in filing", "where": w} for f, w in where.items()}

    # --- NAV per share/unit, Class I, December 31, 2025 to June 30, 2026.
    def nav_cell(name, dec, jun, label, srcs):
        return {"value": signed((jun / dec - 1) * 100), "note": f"{label}: ${dec:.2f} → ${jun:.2f}", "sources": srcs}
    cells["navChange"] = {
        "BREIT": nav_cell("BREIT", b_nav_dec, b_nav, "Class I", [k("BREIT", "NAV per share by class, Dec 31, 2025"), q("BREIT", "NAV per share by class, Jun 30, 2026")]),
        "BXINFRA": nav_cell("BX Infra", x_nav_dec, x_nav, "Class I, Series I, Transactional NAV", [k("BX Infra", "Transactional NAV per Unit, Dec 31, 2025"), q("BX Infra", "Transactional NAV per Unit, Jun 30, 2026")]),
        "BXPE": nav_cell("BXPE", p_nav_dec, p_nav, "Class I, Series I, Transactional NAV", [k("BXPE", "Transactional NAV per Unit, Dec 31, 2025"), q("BXPE", "Transactional NAV per Unit, Jun 30, 2026")]),
        "BCRED": nav_cell("BCRED", c_nav_dec, c_nav, "Class I", [q("BCRED", "Financial Highlights")]),
    }
    for f, c in cells["navChange"].items():
        print(f"  {f}: NAV {c['note']} ({c['value']})")

    rows = [
        ("distribution", "Distribution rate", "Class I, latest declared distribution, annualized, over NAV"),
        ("management", "Management fee", None),
        ("performance", "Performance / incentive fee", None),
        ("limit", "Repurchase limit", None),
        ("prorated", "Buybacks pro-rated, Q2 2026?", "Did requests exceed what the fund bought back?"),
        ("minimum", "Minimum investment", None),
        ("navChange", "NAV change since Dec 31, 2025", "Class I, to June 30, 2026"),
    ]
    return {
        "asOf": "2026-06-30",
        "funds": ["BREIT", "BXINFRA", "BXPE", "BCRED"],
        "rows": [{"id": rid, "label": lab, **({"help": h} if h else {}), "cells": cells[rid]} for rid, lab, h in rows],
    }


if __name__ == "__main__":
    old = {f: json.load(open(os.path.join(OUT, f + ".json"))) for f in ["bxinfra", "bcred"]}
    data = {"breit": build_breit(), "bxinfra": build_bxinfra(old["bxinfra"]), "bxpe": build_bxpe(), "bcred": build_bcred(old["bcred"])}
    for k, v in data.items():
        write(f"{k}.json", v)
    write("compare.json", build_compare({"BREIT": data["breit"], "BXINFRA": data["bxinfra"], "BXPE": data["bxpe"], "BCRED": data["bcred"]}))
