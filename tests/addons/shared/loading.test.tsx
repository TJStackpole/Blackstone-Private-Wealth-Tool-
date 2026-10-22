import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import ToolLoading from "@/components/addons/shared/ToolLoading";

afterEach(cleanup);

describe("tool loading state", () => {
  it("announces itself to screen readers instead of leaving the panel empty", () => {
    render(<ToolLoading />);
    expect(screen.getByRole("status").textContent).toContain("Loading the tool…");
  });
});
