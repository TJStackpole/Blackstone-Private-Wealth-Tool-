"""Print each fund's headline figures, before and after a refresh:  python3 -I scripts/sec/what_changed.py OLD_DIR NEW_DIR"""
import json
import os
import sys

OLD, NEW = sys.argv[1], sys.argv[2]
for fund in ["breit", "bxinfra", "bxpe", "bcred"]:
    a, b = (json.load(open(os.path.join(d, f"{fund}.json"))) for d in (OLD, NEW))
    print(f"\n{b['fund']}  as of {a['asOf']} -> {b['asOf']}")
    before = {s["label"]: s["value"] for s in a["summary"]["stats"]}
    for s in b["summary"]["stats"]:
        was = before.get(s["label"], "(new)")
        print(f"  {s['label']:28} {was:>10} -> {s['value']:<10}{'' if was != s['value'] else '  (same)'}")
