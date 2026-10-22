import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ADDONS, toolkitAddons } from "@/config/addons";
import { FAMILY_OFFICE_FIRST, orderFor } from "@/lib/addons/shared/audience";
import { AudienceProvider, AudienceToggle } from "@/components/addons/shared/Audience";

afterEach(cleanup);

describe("Family Office mode", () => {
  it("leaves the advisor order alone and puts the three family-office tools first otherwise", () => {
    const list = toolkitAddons(ADDONS);
    expect(orderFor("advisor", list)).toEqual(list);
    const fo = orderFor("family-office", list).map((a) => a.id);
    const present = FAMILY_OFFICE_FIRST.filter((id) => list.some((a) => a.id === id));
    expect(fo.slice(0, present.length)).toEqual(present);
    expect(fo.length).toBe(list.length);
  });

  it("switches between Standard and Family Office", () => {
    render(
      <AudienceProvider>
        <AudienceToggle />
      </AudienceProvider>,
    );
    const fo = screen.getByRole("button", { name: "Family Office" });
    expect(fo.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(fo);
    expect(fo.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Standard" }));
    expect(fo.getAttribute("aria-pressed")).toBe("false");
  });

  it("outside the toolkit (no provider) shows no toggle", () => {
    const { container } = render(<AudienceToggle />);
    expect(container.innerHTML).toBe("");
  });
});
