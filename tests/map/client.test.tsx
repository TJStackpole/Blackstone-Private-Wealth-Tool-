import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ClientButton from "@/components/ClientButton";
import Calculator from "@/components/addons/tax-lens/Calculator";
import { cleanClient, DEFAULT_CLIENT } from "@/lib/client";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("client profile, set once", () => {
  it("cleans anything stored that isn't usable", () => {
    expect(cleanClient({ state: "ZZ", bracket: 400, amount: -5 })).toEqual(DEFAULT_CLIENT);
    expect(cleanClient({ state: "CA", bracket: 35, amount: 1_000_000 })).toEqual({ state: "CA", bracket: 35, amount: 1_000_000 });
  });

  it("a change in the Client panel reaches the tax calculator", () => {
    render(
      <>
        <ClientButton />
        <Calculator />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Client/ }));
    const panel = screen.getByRole("dialog", { name: "Your client" });
    fireEvent.change(panel.querySelectorAll("select")[0], { target: { value: "NY" } });
    fireEvent.change(panel.querySelectorAll("select")[1], { target: { value: "32" } });
    const used = document.querySelector("[data-rates-used]")!.textContent!;
    expect(used).toContain("10.9% New York");
    expect(used).toContain("25.6% federal (32% less the 199A deduction)");
    expect(JSON.parse(localStorage.getItem("pma-client")!)).toMatchObject({ state: "NY", bracket: 32 });
  });
});
