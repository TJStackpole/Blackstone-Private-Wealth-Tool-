import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { parseNumber } from "@/components/addons/shared/Inputs";
import ToolkitCards from "@/components/addons/shared/ToolkitCards";
import { ADDONS, addonHref, addonsForFund, enabledAddons, toolkitAddons } from "@/config/addons";
import { toLayerId } from "@/lib/addons/shared/funds";
import { short } from "@/lib/addons/retirement-plus/format";

afterEach(cleanup);

describe("toolkit fixes", () => {
  it("a number pasted from the site, with its true minus sign, reads as negative", () => {
    expect(parseNumber("−4.6")).toBe(-4.6);
    expect(parseNumber("-4.6%")).toBe(-4.6);
    expect(parseNumber("4−6")).toBeNull();
  });

  it("the Toolkit lists the 401(k) lens too, linking to the map's Retirement tab", () => {
    const list = [...toolkitAddons(ADDONS), ...enabledAddons(ADDONS).filter((a) => a.kind === "tab")];
    render(<ToolkitCards list={list} />);
    const card = screen.getByRole("link", { name: /401\(k\) lens/ });
    expect(card.getAttribute("href")).toBe("/?view=retirement");
    expect(addonHref(ADDONS.find((a) => a.id === "liquidity")!)).toBe("/toolkit/liquidity");
  });

  it("the drawdown comparison, built on BXPE's figures, is offered from BXPE's page only", () => {
    expect(addonsForFund("BXPE").some((a) => a.id === "drawdown-vs-evergreen")).toBe(true);
    for (const f of ["BREIT", "BCRED", "BXINFRA"] as const) expect(addonsForFund(f).some((a) => a.id === "drawdown-vs-evergreen")).toBe(false);
  });

  it("fund codes map back to their map tabs", () => {
    expect(toLayerId("BCRED")).toBe("bcred");
    expect(toLayerId("BXINFRA")).toBe("bxinfra");
  });

  it("axis labels in millions keep one decimal, whatever else the chart passes in", () => {
    // The chart calls a tick formatter with (value, index); the Outcome Lab now passes the value only.
    const ticks = [0, 1e6, 2e6, 3e6, 4e6].map((v) => short(v));
    expect(ticks).toEqual(["$0", "$1.0M", "$2.0M", "$3.0M", "$4.0M"]);
  });
});
