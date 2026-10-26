"""
Build data/latest.json: each fund's newest month-end figures, from the filings that come between 10-Qs (a monthly
8-K, or BREIT's NAV prospectus supplement), set against the last 10-Q's figures.

Usage:
    python3 -I scripts/sec/build_monthly.py ./filings data [./quarterly-filings]

./filings holds the monthly filings as text (see MONTHLY below; scripts/sec/latest_monthly.py downloads the newest
ones and writes a monthly.json there naming them), plus (or, given a third folder, there) the 10-Qs and 10-Ks build_data.py reads. Every figure is parsed
from the filing text; if a phrase or table can't be found, or a figure fails a check, the script stops and writes
nothing.
"""
import json
import os
import re
import sys
from datetime import datetime

FILINGS, OUT = sys.argv[1], sys.argv[2]
QFILINGS = sys.argv[3] if len(sys.argv) > 3 else FILINGS
EDGAR = "https://www.sec.gov/Archives/edgar/data"

# The monthly filings: text file (in FILINGS), what it is, when it was filed, and where it is on EDGAR.
MONTHLY = {
    "breit_nav": {"file": "breit-nav-20260930", "name": "BREIT prospectus supplement (Form 424B3), October 22, 2026",
                  "filed": "2026-10-22", "url": f"{EDGAR}/1662972/000166297226000154/breitnavseptember2026.htm"},
    "breit_dist": {"file": "breit-8k-20260929", "name": "BREIT Form 8-K, September 29, 2026",
                   "filed": "2026-09-30", "url": f"{EDGAR}/1662972/000166297226000138/breit-20260929.htm"},
    "breit_noi": {"file": "breit-8k-20261022", "name": "BREIT Form 8-K, October 22, 2026",
                  "filed": "2026-10-22", "url": f"{EDGAR}/1662972/000166297226000156/breit-20261022.htm"},
    "bxinfra": {"file": "bxinfra-8k-20261022", "name": "BX Infra Form 8-K, October 22, 2026",
                "filed": "2026-10-22", "url": f"{EDGAR}/2030772/000203077226000032/bxinfra-20261022.htm"},
    "bxpe": {"file": "bxpe-8k-20261022", "name": "BXPE Form 8-K, October 22, 2026",
             "filed": "2026-10-22", "url": f"{EDGAR}/1930054/000193005426000035/bxpe-20261022.htm"},
    "bcred": {"file": "bcred-8k-20261021", "name": "BCRED Form 8-K, October 21, 2026",
              "filed": "2026-10-22", "url": f"{EDGAR}/1803498/000180349826000056/bcred-20261021.htm"},
}
if os.path.exists(os.path.join(FILINGS, "monthly.json")):
    MONTHLY.update(json.load(open(os.path.join(FILINGS, "monthly.json"))))

# The last 10-Q and 10-K the comparisons read where exact figures are needed (the same defaults as build_data.py).
QUARTER = {"breit": "breit-20260630", "breit_10k": "breit-20251231", "bcred": "bcred-20260630"}
if os.path.exists(os.path.join(QFILINGS, "manifest.json")):  # written by latest_filings.py for a newer quarter
    QUARTER.update({k: v for k, v in json.load(open(os.path.join(QFILINGS, "manifest.json"))).items() if k in QUARTER})


def read(folder, name):
    path = os.path.join(folder, name + ".txt")
    if not os.path.exists(path):
        sys.exit(f"STOPPED: {path} isn't there. See README, 'Monthly updates'. Nothing was written.")
    return open(path, encoding="utf-8").read()


def text(key):
    return read(FILINGS, MONTHLY[key]["file"])


def quarterly(key):
    return read(QFILINGS, QUARTER[key])


def sources(*xs):
    """Each filing once (by URL), keeping the first section named."""
    out = []
    for x in xs:
        if all(o["url"] != x["url"] for o in out):
            out.append(x)
    return out


def num(s):
    return float(s.replace(",", ""))


def find(pattern, s, what):
    m = re.search(pattern, s, re.S)
    if not m:
        sys.exit(f"STOPPED: couldn't find {what} (pattern: {pattern[:80]}...). Nothing was written.")
    return m


def check(ok, msg):
    if not ok:
        sys.exit(f"RECONCILIATION FAILED: {msg}")
    print(f"  ok  {msg}")


def iso(long_date):
    return datetime.strptime(long_date, "%B %d, %Y").strftime("%Y-%m-%d")


def short(long_date):
    return datetime.strptime(long_date, "%B %d, %Y").strftime("%b %-d, %Y")


def pct(now, before):
    ch = (now / before - 1) * 100
    return f"{'+' if ch > 0 else '−' if ch < 0 else ''}{abs(ch):.1f}%", "up" if ch > 0 else "down" if ch < 0 else "flat"


def src(key, page=None):
    m = MONTHLY[key]
    return {"name": m["name"], "url": m["url"], **({"page": page} if page else {})}


def nav_table(s, as_of):
    """BREIT's NAV-by-class table for one date: class rows sum to the printed Total. Returns (total $B, Class I NAV per share)."""
    lines = s.split("\n")
    i = next(n for n, l in enumerate(lines) if l.startswith(f"The following table provides a breakdown of our total NAV and NAV per share/unit by class as of {as_of}"))
    rows, total, class_i = [], None, None
    for l in lines[i + 2:i + 30]:
        c = [x.strip() for x in l.split(" | ") if x.strip() != "$"]
        if c[0] == "Total":
            total = num(c[1])
            break
        if len(c) >= 4:
            rows.append(num(c[1]))
            if c[0] == "Class I Shares":
                class_i = float(c[-1])
    check(total is not None and abs(sum(rows) - total) < 2, f"BREIT NAV table {as_of}: {len(rows)} class rows sum to {sum(rows):,.0f} == Total {total:,.0f}")
    return total / 1e6, class_i


def fund_json(fund):
    return json.load(open(os.path.join(OUT, f"{fund}.json")))


def stat(d, prefix):
    return next(s for s in d["summary"]["stats"] if s["label"].startswith(prefix))


def money_b(x):
    return f"${x:.1f}B"


# The last 10-Q's period and the year-end before it, read from the fund files build_data.py wrote, so nothing here
# names a quarter by hand.
Q_ISO = json.load(open(os.path.join(OUT, "breit.json")))["asOf"]
Q_LONG = datetime.strptime(Q_ISO, "%Y-%m-%d").strftime("%B %-d, %Y")
Q_SHORT, Q_MONTH = short(Q_LONG), Q_LONG.split()[0]
Q_ORD = ["first", "second", "third", "fourth"][(int(Q_ISO[5:7]) + 2) // 3 - 1]
DEC_SHORT = re.search(r"since (\w+ \d+, \d{4})", next(r for r in json.load(open(os.path.join(OUT, "compare.json")))["rows"] if r["id"] == "navChange")["label"]).group(1)
DEC_LONG = datetime.strptime(DEC_SHORT, "%b %d, %Y").strftime("%B %-d, %Y")


def quarter_of(iso_date):
    return f"Q{(int(iso_date[5:7]) + 2) // 3} {iso_date[:4]}"


def short_iso(iso_date):
    return datetime.strptime(iso_date, "%Y-%m-%d").strftime("%b %-d, %Y")


def build_breit():
    print("BREIT")
    nav_s = text("breit_nav")
    as_of_long = find(r"calculation of our (\w+ \d+, \d{4}) NAV per share", nav_s, "BREIT's NAV date").group(1)
    nav, navps = nav_table(nav_s, as_of_long)
    q, k = quarterly("breit"), quarterly("breit_10k")
    nav_q, navps_q = nav_table(q, Q_LONG)
    _, navps_dec = nav_table(k, DEC_LONG)
    check(1 < navps < 50 and 10 < nav < 200, f"BREIT {as_of_long}: NAV ${nav:.1f}B, Class I ${navps}")
    month_ret = find(r"For the month ended " + re.escape(as_of_long) + r", BREIT.s Class I NAV per share was \$([\d.]+) and Class I total return was (-?[\d.]+)% \(not annualized\)", nav_s, "BREIT's monthly total return")
    check(f"{navps:.2f}" == month_ret.group(1), f"BREIT: the table's Class I ${navps} matches the text's ${month_ret.group(1)}")
    dc = re.search(r"During the (\w+) months ended " + re.escape(as_of_long) + r", BREIT deployed \$([\d.]+) billion \(at BREIT.s share\) into the development of data centers through its QTS platform\. This represents a (\d+)% increase over the \$([\d.]+) billion", nav_s)

    dist_s = text("breit_dist")
    dist_month = find(r"(\w+ \d{4}) Distributions", dist_s, "BREIT's distribution month").group(1)
    dist = float(find(r"Class I Common Stock \| \$([\d.]+) \| \$0\.0000 \| \$([\d.]+)", dist_s, "BREIT's Class I distribution").group(2))
    check(dist_month.split()[0] == as_of_long.split()[0], f"BREIT: {dist_month} distribution goes with the {as_of_long} NAV")
    rate = dist * 12 / navps * 100
    check(2 < rate < 10, f"BREIT: Class I distribution rate {rate:.2f}% ({dist_month}'s ${dist} × 12 ÷ ${navps})")

    noi = re.search(r"expects same property NOI for the (\w+) months ended (\w+ \d+, \d{4}) to have increased approximately (\d+)% from the same period in the prior year", text("breit_noi")) if MONTHLY.get("breit_noi") else None  # an occasional 8-K

    nav_src = src("breit_nav", f"{as_of_long} NAV per Share")
    items = [
        {"label": "NAV per share", "value": f"${navps:.2f}", "from": f"Class I, from ${navps_q:.2f} on {Q_SHORT}",
         **dict(zip(("change", "direction"), pct(navps, navps_q))), "sources": [nav_src]},
        {"label": "Net asset value", "value": money_b(nav), "from": f"from {money_b(nav_q)} on {Q_SHORT}",
         **dict(zip(("change", "direction"), pct(nav, nav_q))), "sources": [nav_src]},
        {"label": "Distribution rate", "value": f"{rate:.1f}%", "from": f"Class I: {dist_month.split()[0]}'s ${dist:.4f} a share × 12 ÷ ${navps:.2f} NAV",
         "sources": [src("breit_dist"), nav_src]},
    ]
    if dc:
        items.append({"label": "Data center development", "value": f"${float(dc.group(2)):.1f}B", "from": f"{dc.group(1)} months to {short(as_of_long)}, at BREIT's share",
                      "change": f"+{dc.group(3)}% vs. a year earlier", "direction": "up", "sources": [nav_src]})
    notes = [{"text": f"Class I total return for the month: {month_ret.group(2)}% (not annualized).", "sources": [nav_src]}]
    if noi:
        notes.append({"text": f"Preliminary estimate: same-property net operating income for the {noi.group(1)} months to {short(noi.group(2))} up about {noi.group(3)}% from a year earlier. The fund says its review isn't finished.",
                      "sources": [src("breit_noi")]})
    return {"asOf": iso(as_of_long), "filed": MONTHLY["breit_nav"]["filed"], "items": items, "notes": notes,
            "compare": {"navps": navps, "navps_dec": navps_dec, "dist": dist, "dist_label": f"{dist_month}'s ${dist:.4f} a share × 12",
                        "rate": rate, "sources": [src("breit_dist"), nav_src], "nav_src": nav_src}}


def build_units(fund, key, entity, label, d):
    """BX Infra and BXPE: the Transactional NAV per unit, the fund's total, and (BX Infra) the quarter's distribution."""
    print(label)
    s = text(key)
    as_of_long = find(r"Transactional NAV as of\s*(\w+ \d+, \d{4})", s, f"{label}'s NAV date").group(1)
    sec = s[s.index("The Transactional NAV per Unit for each class of the Funds as of"):]
    navpu = float(find(r"\n" + re.escape(entity) + r"\nClass I Unit\nSeries I \| \$ \| ([\d.]+)", sec, f"{label}'s Class I-Series I NAV").group(1))
    agg = find(r"As of " + re.escape(as_of_long) + r", (BXINFRA|BXPE).s aggregate Transactional NAV was approximately \$([\d.]+) billion", s, f"{label}'s total Transactional NAV")
    raise_ = re.search(r"On (\w+ \d+, \d{4}), the (BXINFRA|BXPE) Fund Program \(inclusive of the Funds\) issued interests for an? ?aggregate consideration of approximately \$([\d.]+) (million|billion)", s)
    navpu_q = float(re.search(r"\$([\d.]+)", stat(d, "NAV per unit")["value"]).group(1))
    navpu_dec = float(re.search(r"from \$([\d.]+) on " + re.escape(DEC_SHORT), stat(d, "NAV per unit")["from"]).group(1))
    check(10 < navpu < 100, f"{label} {as_of_long}: Class I-Series I Transactional NAV ${navpu} ({Q_SHORT}: ${navpu_q})")
    s_src = src(key, f"Item 7.01: Transactional NAV as of {as_of_long}")
    items = [
        {"label": "NAV per unit", "value": f"${navpu:.2f}", "from": f"Class I, Series I, from ${navpu_q:.2f} on {Q_SHORT}",
         **dict(zip(("change", "direction"), pct(navpu, navpu_q))), "sources": [s_src]},
    ]
    out = {"asOf": iso(as_of_long), "filed": MONTHLY[key]["filed"], "items": items, "notes": [],
           "compare": {"navps": navpu, "navps_dec": navpu_dec, "sources": [s_src], "nav_src": s_src}}
    dist_m = re.search(r"(\w+ \d{4}) Distributions\n.*?\n" + re.escape(entity) + r"\nClass I Unit\nSeries I \| \$ \| ([\d.]+)", s, re.S)
    if dist_m:
        dist = float(dist_m.group(2))
        record = find(r"payable to unitholders of record as of the open of business on (\w+ \d+, \d{4})", s, f"{label}'s record date").group(1)
        check(record == as_of_long, f"{label}: the distribution's record date ({record}) is the NAV date")
        q2 = float(re.search(re.escape(quarter_of(Q_ISO)) + r"'s \$([\d.]+) a unit", json.load(open(os.path.join(OUT, "compare.json")))["rows"][0]["cells"]["BXINFRA"]["note"]).group(1))
        rate = dist * 4 / navpu * 100
        check(0 < dist < 2 and 0 < rate < 10, f"{label}: quarterly distribution ${dist} ({rate:.2f}% a year)")
        d_src = src(key, "Item 7.01: Distributions")
        diff = dist - q2
        items.append({"label": "Quarter's distribution", "value": f"${dist:.4f}", "from": f"a unit, Class I, Series I, from ${q2:.4f} for the {Q_ORD} quarter",
                      "change": f"{'+' if diff > 0 else '−'}${abs(diff):.4f}", "direction": "up" if diff > 0 else "down", "sources": [d_src]})
        items.append({"label": "Distribution rate", "value": f"{rate:.1f}%", "from": f"${dist:.4f} × 4 ÷ ${navpu:.2f}", "sources": sources(d_src, s_src)})
        out["compare"].update({"dist": dist, "dist_label": f"{quarter_of(iso(as_of_long))}'s ${dist:.4f} a unit × 4", "rate": rate, "sources": sources(d_src, s_src)})
    items.append({"label": "Total Transactional NAV", "value": f"${float(agg.group(2)):.1f}B",
                  "from": f"{agg.group(1)}: the U.S. fund, its feeder and parallel vehicles (not the Luxembourg fund), {short(as_of_long)}", "sources": [s_src]})
    if raise_:
        amount = float(raise_.group(3)) * (1000 if raise_.group(4) == "billion" else 1)
        out["notes"].append({"text": f"New money: the {raise_.group(2)} Fund Program issued about ${amount:,.1f} million of interests on {short(raise_.group(1))}.",
                             "sources": [src(key, "Item 3.02: Unregistered Sales of Equity Securities")]})
    return out


def build_bcred(d):
    print("BCRED")
    s = text("bcred")
    as_of_long = find(r"NAV as of (\w+ \d+, \d{4})\nClass I Common Shares \| \$ \| ([\d.]+)", s, "BCRED's NAV").group(1)
    navps = float(find(r"NAV as of \w+ \d+, \d{4}\nClass I Common Shares \| \$ \| ([\d.]+)", s, "BCRED's Class I NAV").group(1))
    agg = find(r"As of " + re.escape(as_of_long) + r", the Fund.s aggregate NAV was approximately \$([\d.]+) billion, the fair value of its investment portfolio was approximately \$([\d.]+) billion, and it had approximately \$([\d.]+) billion of debt outstanding \(at principal\)\. The average debt-to-equity leverage ratio during (\w+ \d{4}) of approximately ([\d.]+) times", s, "BCRED's size, portfolio and leverage")
    dist_month = find(r"(\w+ \d{4}) Distributions", s, "BCRED's distribution month").group(1)
    dist = float(find(r"Class I Common Shares \| \$ \| ([\d.]+) \| \$ \| 0\.0000 \| \$ \| ([\d.]+)", s, "BCRED's Class I distribution").group(2))
    # Exact quarter-end net assets ($ thousands), from the 10-Q's balance sheet, so the change isn't measured from a rounded figure.
    nav_q = float(next(l for l in quarterly("bcred").split("\n") if l.startswith("Total net assets |")).split(" | ")[1].replace(",", "")) / 1e6
    navps_q = float(re.search(r"\$([\d.]+)", stat(d, "NAV per share")["value"]).group(1))
    navps_dec = float(re.search(r"from \$([\d.]+) on " + re.escape(DEC_SHORT), stat(d, "NAV per share")["from"]).group(1))
    june = float(re.search(re.escape(Q_MONTH) + r"'s \$([\d.]+) a share", stat(d, "Distribution rate")["note"]).group(1))  # the quarter's last month
    rate = dist * 12 / navps * 100
    check(10 < navps < 40 and 7 < rate < 12, f"BCRED {as_of_long}: NAV ${navps}, {dist_month} ${dist} ({rate:.2f}% a year)")
    s_nav = src("bcred", f"Item 8.01: Net Asset Value as of {as_of_long}")
    s_dist = src("bcred", f"Item 7.01: {dist_month} Distributions")
    aggnav = float(agg.group(1))
    items = [
        {"label": "NAV per share", "value": f"${navps:.2f}", "from": f"Class I, from ${navps_q:.2f} on {Q_SHORT}",
         **dict(zip(("change", "direction"), pct(navps, navps_q))), "sources": [s_nav]},
        {"label": "Net assets", "value": f"${aggnav:.1f}B", "from": f"approximate, from ${nav_q:.1f}B on {Q_SHORT}",
         **dict(zip(("change", "direction"), pct(aggnav, nav_q))), "sources": [s_nav]},
        {"label": "Distribution rate", "value": f"{rate:.1f}%", "from": f"Class I: {dist_month.split()[0]}'s ${dist:.2f} a share × 12 ÷ ${navps:.2f} NAV",
         **({"change": f"{'+' if dist > june else '−'}${abs(dist - june):.2f} a month", "direction": "up" if dist > june else "down"}
            if round(dist, 4) != round(june, 4) else {"change": "no change", "direction": "flat"}),
         "note": f"Monthly payout, from ${june:.2f} in {Q_MONTH}.", "sources": sources(s_dist, s_nav)},
        {"label": "Leverage", "value": f"{float(agg.group(5)):.2f}x", "from": f"debt to equity, {agg.group(4)} average; ${float(agg.group(3)):.1f}B of debt",
         "sources": [s_nav]},
    ]
    notes = [{"text": f"Portfolio at fair value: about ${float(agg.group(2)):.1f} billion at {short(as_of_long)}.", "sources": [s_nav]}]
    return {"asOf": iso(as_of_long), "filed": MONTHLY["bcred"]["filed"], "items": items, "notes": notes,
            "compare": {"navps": navps, "navps_dec": navps_dec, "dist": dist, "dist_label": f"{dist_month}'s ${dist:.2f} a share × 12",
                        "rate": rate, "sources": sources(s_dist, s_nav), "nav_src": s_nav}}


def compare_rows(funds, as_of):
    """Comparison-table rows the monthly filings make newer: the distribution rate and the change in NAV since Dec 31."""
    code = {"breit": "BREIT", "bxinfra": "BXINFRA", "bxpe": "BXPE", "bcred": "BCRED"}
    tenk = json.load(open(os.path.join(OUT, "compare.json")))
    nav_row = next(r for r in tenk["rows"] if r["id"] == "navChange")
    dist, navch = {}, {}
    for f, x in funds.items():
        c = x["compare"]
        label = "Class I" if f in ("breit", "bcred") else "Class I, Series I, Transactional NAV"
        ch = (c["navps"] / c["navps_dec"] - 1) * 100
        before = nav_row["cells"][code[f]]["sources"]  # where the Dec 31 figure comes from: the 10-K, or (BCRED) the 10-Q
        k_src = [s for s in before if "10-K" in s["name"]] or before
        navch[code[f]] = {"value": f"{'+' if ch > 0 else '−'}{abs(ch):.1f}%", "note": f"{label}: ${c['navps_dec']:.2f} → ${c['navps']:.2f}",
                          "sources": k_src + [c["nav_src"]]}
        if "rate" in c:
            dist[code[f]] = {"value": f"{c['rate']:.1f}%", "note": f"{label.split(',')[0] if f != 'bxinfra' else 'Class I, Series I'}: {c['dist_label']} ÷ ${c['navps']:.2f} NAV",
                             "sources": c["sources"]}
    return {"distribution": {"help": f"Class I, latest declared distribution, annualized, over the {short_iso(as_of)} NAV", "cells": dist},
            "navChange": {"label": f"NAV change since {DEC_SHORT}", "help": f"Class I, to {short_iso(as_of)}", "cells": navch}}


if __name__ == "__main__":
    try:
        data = {f: fund_json(f) for f in ["breit", "bxinfra", "bxpe", "bcred"]}
        funds = {
            "breit": build_breit(),
            "bxinfra": build_units("bxinfra", "bxinfra", "Blackstone Infrastructure Strategies L.P.", "BX Infra", data["bxinfra"]),
            "bxpe": build_units("bxpe", "bxpe", "Blackstone Private Equity Strategies Fund L.P.", "BXPE", data["bxpe"]),
            "bcred": build_bcred(data["bcred"]),
        }
    except (StopIteration, AttributeError, IndexError, KeyError, ValueError) as e:
        import traceback
        where = traceback.extract_tb(e.__traceback__)[-1]
        sys.exit(f"STOPPED: couldn't read a monthly filing (build_monthly.py line {where.lineno}: {where.line}). Nothing was written.")
    for f, x in funds.items():
        check(x["asOf"] > data[f]["asOf"], f"{f}: monthly figures ({x['asOf']}) are newer than the 10-Q ({data[f]['asOf']})")
    as_of = max(x["asOf"] for x in funds.values())
    out = {"asOf": as_of, "funds": {f: {k: v for k, v in x.items() if k != "compare"} for f, x in funds.items()},
           "compare": compare_rows(funds, as_of)}
    path = os.path.join(OUT, "latest.json")
    with open(path, "w") as fh:
        json.dump(out, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    print(f"wrote {path}")
