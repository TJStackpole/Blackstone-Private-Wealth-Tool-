import { describe, expect, it } from "vitest";
import { formatDate, formatMonth, todayInNewYork } from "@/lib/dates";

describe("dates, in New York time", () => {
  it("shows a plain date exactly as written, whatever the time zone", () => {
    expect(formatDate("2026-06-30")).toBe("Jun 30, 2026");
    expect(formatDate("2026-06-30", "long")).toBe("June 30, 2026");
    expect(formatMonth("2022-11-30")).toBe("Nov 2022");
  });
  it("shows a timestamp as the date it was in New York", () => {
    // 01:03 UTC on Oct 22 is 9:03 pm on Oct 21 in New York.
    expect(formatDate("2026-10-22T01:03:29Z")).toBe("Oct 21, 2026");
    expect(formatDate("2026-10-22T05:00:00Z")).toBe("Oct 22, 2026");
  });
  it("knows today's date in New York, including across midnight UTC and daylight saving", () => {
    expect(todayInNewYork(new Date("2026-10-22T02:41:30Z"))).toBe("2026-10-21");
    expect(todayInNewYork(new Date("2026-10-22T04:00:01Z"))).toBe("2026-10-22");
    expect(todayInNewYork(new Date("2026-01-15T04:30:00Z"))).toBe("2026-01-14"); // EST, five hours behind
  });
  it("returns anything that isn't a date unchanged", () => {
    expect(formatDate("not a date")).toBe("not a date");
    expect(formatDate("2026-02-30")).toBe("2026-02-30");
  });
});
