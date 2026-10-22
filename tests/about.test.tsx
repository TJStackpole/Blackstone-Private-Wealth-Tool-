import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import AboutPage from "@/app/about/page";
import SourceFooter from "@/components/SourceFooter";
import AddonDisclosure from "@/components/addons/shared/AddonDisclosure";

afterEach(cleanup);

describe("About", () => {
  it("names the builder, the background and the purpose, with LinkedIn and email as visible text", () => {
    render(<AboutPage />);
    expect(screen.getByRole("heading", { level: 1, name: "About" })).toBeTruthy();
    const text = document.body.textContent!;
    for (const s of ["Built by TJ Stackpole", "Marine Corps infantry officer and company commander", "McDonough School of Business", "2027", "only public SEC filings"]) expect(text).toContain(s);
    expect(screen.getByText("linkedin.com/in/terence-stackpole").getAttribute("href")).toBe("https://www.linkedin.com/in/terence-stackpole");
    expect(screen.getByText("ts1582@georgetown.edu")).toBeTruthy();
    expect(text).toContain("Not affiliated with or endorsed by Blackstone");
  });

  it("every footer says Built by TJ Stackpole and links to it", () => {
    for (const el of [<SourceFooter key="a" />, <AddonDisclosure key="b" />]) {
      render(el);
      expect(screen.getByRole("link", { name: "Built by TJ Stackpole" }).getAttribute("href")).toBe("/about");
      cleanup();
    }
  });
});
