import { describe, expect, it } from "vitest";
import { parseStart } from "@/components/AtlasFromUrl";

describe("parseStart (links into the map)", () => {
  it("reads a fund, sector, selection and theme", () => {
    expect(parseStart("?view=bcred&sector=Software&select=US&theme=software-tech")).toEqual({ view: "bcred", sector: "Software", select: "US", theme: "software-tech" });
    expect(parseStart("?view=breit&select=NV")).toEqual({ view: "breit", select: "NV" });
    expect(parseStart("?view=all")).toEqual({ view: "all" });
  });
  it("ignores anything it doesn't recognize", () => {
    expect(parseStart("")).toBeUndefined();
    expect(parseStart("?view=nope&sector=Software")).toBeUndefined();
    expect(parseStart("?view=breit&sector=Not a sector&select=Nevada")).toEqual({ view: "breit" });
    expect(parseStart("?view=bxinfra&select=Mars")).toEqual({ view: "bxinfra" });
    expect(parseStart("?view=breit&select=ZZ")).toEqual({ view: "breit" });
  });
});
