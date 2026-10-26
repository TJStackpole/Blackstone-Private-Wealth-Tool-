import { describe, expect, it } from "vitest";
import { cadenceOf, nextUpdate } from "@/lib/schedule";

describe("next update expected (SEC filing schedule)", () => {
  it("after a June quarter-end, the September 10-Q, due about mid-November", () => {
    expect(nextUpdate("2026-06-30")).toMatchObject({ form: "10-Q", period: "2026-09-30", due: "2026-11-14", month: "November 2026" });
  });
  it("after September, the annual 10-K, due about 90 days after December 31", () => {
    expect(nextUpdate("2026-09-30")).toMatchObject({ form: "10-K", period: "2026-12-31", due: "2027-03-31", month: "March 2027" });
  });
  it("after December, the March 10-Q; annual-only figures wait for the next 10-K", () => {
    expect(nextUpdate("2025-12-31")).toMatchObject({ form: "10-Q", period: "2026-03-31", month: "May 2026" });
    expect(nextUpdate("2025-12-31", "annual")).toMatchObject({ form: "10-K", period: "2026-12-31", month: "March 2027" });
  });
  it("a mid-quarter date points to that quarter's report; anything else gives nothing", () => {
    expect(nextUpdate("2026-09-03")?.period).toBe("2026-09-30");
    expect(nextUpdate("June 2026")).toBeNull();
  });
  it("says where the month comes from", () => {
    expect(nextUpdate("2026-06-30")!.basis).toBe("The Form 10-Q for the quarter ending September 30, 2026 is due about 45 days after it ends.");
  });
  it("month-end NAVs: the next month's, filed about three weeks after it ends", () => {
    expect(nextUpdate("2026-09-30", "monthly")).toMatchObject({ form: "8-K", period: "2026-10-31", due: "2026-11-21", month: "November 2026" });
    expect(nextUpdate("2026-12-31", "monthly")).toMatchObject({ period: "2027-01-31", month: "February 2027" });
    expect(nextUpdate("2026-10-15", "monthly")?.period).toBe("2026-10-31");
    expect(nextUpdate("2026-09-30", "monthly")!.basis).toBe("The fund files its NAV for October 31, 2026 about three weeks after that month ends.");
  });
  it("only SEC periodic reports have a schedule", () => {
    expect(cadenceOf("BREIT Form 10-Q, quarter ended June 30, 2026")).toBe("quarterly");
    expect(cadenceOf("BXPE Form 10-K, year ended December 31, 2025")).toBe("annual");
    expect(cadenceOf("Cliffwater, CDLI mid-year 2026 release")).toBeNull();
  });
});
