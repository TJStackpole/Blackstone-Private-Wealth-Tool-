import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { OG_IMAGE, pageMeta } from "@/lib/meta";

describe("link previews", () => {
  it("each page's card carries its own title, the description and the 1200×630 image", () => {
    const m = pageMeta({ title: "About", description: "Built by TJ Stackpole.", path: "/about" });
    expect(m.openGraph).toMatchObject({ title: "About · Private Markets Atlas", description: "Built by TJ Stackpole.", url: "/about", images: [OG_IMAGE] });
    expect(m.twitter).toMatchObject({ card: "summary_large_image", title: "About · Private Markets Atlas", images: ["/og.png"] });
  });
  it("the image exists and is a 1200×630 PNG", () => {
    const png = readFileSync("public/og.png");
    expect(existsSync("public/og.png")).toBe(true);
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
});
