"""Convert an SEC inline-XBRL HTML filing to plain text, one table row per line with cells joined by ' | '."""
import sys, re, html
from html.parser import HTMLParser

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.cell, self.row, self.in_td, self.skip = [], [], [], False, 0
    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "ix:header"): self.skip += 1
        if tag in ("td", "th"): self.in_td, self.cell = True, []
        if tag == "tr": self.row = []
        if tag in ("p", "div", "br") and not self.in_td: self.out.append("\n")
    def handle_endtag(self, tag):
        if tag in ("script", "style", "ix:header"): self.skip -= 1
        if tag in ("td", "th"):
            t = re.sub(r"\s+", " ", "".join(self.cell)).strip()
            if t: self.row.append(t)
            self.in_td = False
        if tag == "tr":
            if self.row: self.out.append("\n" + " | ".join(self.row) + "\n")
            self.row = []
    def handle_data(self, d):
        if self.skip: return
        if self.in_td: self.cell.append(d)
        else: self.out.append(d)

src, dst = sys.argv[1], sys.argv[2]
p = P(); p.feed(open(src, encoding="utf-8", errors="replace").read())
txt = "".join(p.out)
txt = re.sub(r"[ \t\xa0]+", " ", txt)
txt = re.sub(r"\n\s*\n+", "\n", txt)
open(dst, "w").write(txt)
