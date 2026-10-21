import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import AddonBoundary from "@/components/addons/shared/AddonBoundary";
import AddonChips from "@/components/addons/shared/AddonChips";
import AddonDisclosure, { ADDON_DISCLOSURE } from "@/components/addons/shared/AddonDisclosure";
import { NumberInput, PercentInput } from "@/components/addons/shared/Inputs";
import type { AddonDef } from "@/config/addons";

afterEach(cleanup);

const liquidity: AddonDef = { id: "liquidity", name: "Liquidity Simulator", shortName: "Liquidity", description: "", enabled: true, appliesTo: ["BCRED"], phase: 1 };

function Boom(): never {
  throw new Error("test");
}

describe("AddonChips (Doorway B)", () => {
  it("renders nothing at all when no add-on applies, so the panel is unchanged", () => {
    const { container } = render(<AddonChips fundId="breit" addons={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing for a fund the add-on doesn't apply to", () => {
    const { container } = render(<AddonChips fundId="breit" addons={[liquidity]} />);
    expect(container.innerHTML).toBe("");
  });

  it("shows a chip linking to the add-on for a fund it applies to", () => {
    render(<AddonChips fundId="bcred" addons={[liquidity]} />);
    const link = screen.getByRole("link", { name: "Liquidity" });
    expect(link.getAttribute("href")).toBe("/toolkit/liquidity?fund=BCRED");
  });

  it("hides a switched-off add-on", () => {
    const { container } = render(<AddonChips fundId="bcred" addons={[{ ...liquidity, enabled: false }]} />);
    expect(container.innerHTML).toBe("");
  });
});

describe("AddonBoundary (the fuse)", () => {
  it("shows a calm message instead of crashing the page", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <div>
        <p>Map still here</p>
        <AddonBoundary addonId="test">
          <Boom />
        </AddonBoundary>
      </div>,
    );
    expect(screen.getByText(/temporarily unavailable/)).toBeTruthy();
    expect(screen.getByText("Map still here")).toBeTruthy();
  });
});

describe("AddonDisclosure", () => {
  it("uses the plan's exact wording", () => {
    render(<AddonDisclosure />);
    expect(screen.getByText(ADDON_DISCLOSURE)).toBeTruthy();
    expect(ADDON_DISCLOSURE).toContain("Not investment, tax, or legal advice.");
  });
});

describe("Inputs", () => {
  it("labels the field and reports numbers, ignoring empty input", () => {
    const onChange = vi.fn();
    render(<NumberInput label="Amount" value={100} onChange={onChange} />);
    const input = screen.getByLabelText("Amount") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "250" } });
    expect(onChange).toHaveBeenLastCalledWith(250);
    onChange.mockClear();
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps a percentage between 0 and 100", () => {
    const onChange = vi.fn();
    render(<PercentInput label="Cap" value={5} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Cap"), { target: { value: "140" } });
    expect(onChange).toHaveBeenLastCalledWith(100);
  });
});
