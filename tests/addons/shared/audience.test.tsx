import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ADDONS, enabledAddons } from "@/config/addons";
import { FAMILY_OFFICE_FIRST, orderFor } from "@/lib/addons/shared/audience";
import { AudienceProvider, AudienceToggle } from "@/components/addons/shared/Audience";
import ClientScriptCard from "@/components/addons/shared/ClientScriptCard";

afterEach(cleanup);

describe("Family Office mode", () => {
  it("leaves the advisor order alone and puts the three family-office tools first otherwise", () => {
    const list = enabledAddons(ADDONS);
    expect(orderFor("advisor", list)).toEqual(list);
    const fo = orderFor("family-office", list).map((a) => a.id);
    const present = FAMILY_OFFICE_FIRST.filter((id) => list.some((a) => a.id === id));
    expect(fo.slice(0, present.length)).toEqual(present);
    expect(fo.length).toBe(list.length);
  });

  it("swaps the client script for investment-committee wording, and back", () => {
    render(
      <AudienceProvider>
        <AudienceToggle />
        <ClientScriptCard points={["Say this to a client."]} icPoints={["The committee may ask this."]} />
      </AudienceProvider>,
    );
    expect(screen.getByText("Say this to a client.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Family Office" }));
    expect(screen.getByText("What your investment committee may ask")).toBeTruthy();
    expect(screen.getByText("The committee may ask this.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Advisor" }));
    expect(screen.getByText("Say this to a client.")).toBeTruthy();
  });

  it("outside the toolkit (no provider) shows no toggle and the advisor wording", () => {
    const { container } = render(<AudienceToggle />);
    expect(container.innerHTML).toBe("");
    render(<ClientScriptCard points={["Advisor words."]} icPoints={["IC words."]} />);
    expect(screen.getByText("Advisor words.")).toBeTruthy();
  });
});
