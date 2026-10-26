import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { GLOSSARY, glossText, glossaryTerm } from "@/lib/glossary";
import Glossed from "@/components/Glossed";

afterEach(cleanup);

const linked = (text: string, fund?: Parameters<typeof glossText>[1]) =>
  glossText(text, fund).flatMap((p) => (typeof p === "string" ? [] : [p.term.id]));

describe("glossary", () => {
  it("every term has a plain line, a quote, a filing or IRS source and a date; the plain line's figures are in the quote", () => {
    expect(GLOSSARY.length).toBe(31);
    for (const t of GLOSSARY) {
      expect(t.plain.length, t.id).toBeGreaterThan(20);
      expect(t.quote.split(/\s+/).length, t.id).toBeGreaterThanOrEqual(15);
      expect(t.source.url, t.id).toMatch(/^https:\/\/www\.(sec|irs)\.gov\//);
      expect(t.asOf, t.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const n of t.plain.match(/\d+(\.\d+)?%?/g) ?? []) expect(t.quote, `${t.id}: ${n}`).toContain(n.replace("%", ""));
    }
    expect(new Set(GLOSSARY.map((t) => t.id)).size).toBe(GLOSSARY.length);
  });

  it("links each term once, longest phrase first, and capitals-only terms only in capitals", () => {
    expect(linked("Total Transactional NAV", "BXINFRA")).toEqual(["transactional-nav"]);
    expect(linked("NAV per share fell; NAV is up", "BREIT")).toEqual(["nav"]);
    expect(linked("navigate the nav bar", "BREIT")).toEqual([]);
    expect(linked("BREIT is a REIT", "BREIT")).toEqual(["reit"]);
    expect(linked("15 borrowers' loans were on non-accrual", "BCRED")).toEqual(["non-accrual"]);
  });

  it("on a fund's own content, another fund's definition stays plain, and NAV inside it isn't linked instead", () => {
    // BX Infra's definition of Transactional NAV names BX Infra, so BXPE's page doesn't link it.
    expect(linked("Total Transactional NAV", "BXPE")).toEqual([]);
    expect(linked("Requests were filled pro rata", "BREIT")).toEqual([]);
    expect(linked("Requests were filled pro rata", "BCRED")).toEqual(["pro-rata"]);
    // With no fund (the comparison table), it is linked, labeled as an example.
    expect(linked("Buybacks pro-rated, Q2 2026?")).toEqual(["pro-rata"]);
  });

  it("the distribution rate isn't linked: BREIT's own rate averages three months, the site's is the latest payout", () => {
    expect(glossaryTerm("distribution-rate")!.match).toEqual([]);
    expect(linked("Distribution rate", "BREIT")).toEqual([]);
  });

  it("opens a definition with the filing's words and source, and closes with Escape", () => {
    render(
      <p>
        <Glossed text="15 borrowers on non-accrual" fund="BCRED" />
      </p>,
    );
    const btn = screen.getByRole("button", { name: "non-accrual" });
    fireEvent.click(btn);
    const t = glossaryTerm("non-accrual")!;
    const pop = screen.getByRole("dialog", { name: `${t.term}: definition` });
    expect(pop.textContent).toContain(t.plain);
    expect(pop.textContent).toContain(t.quote);
    expect(pop.querySelector(`a[href="${t.source.url}"]`)).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
