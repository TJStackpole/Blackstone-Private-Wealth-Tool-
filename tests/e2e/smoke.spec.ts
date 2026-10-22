import { expect, test, type Page } from "@playwright/test";
import { ADDONS, toolkitAddons } from "@/config/addons";

/** Fails the test on any uncaught error or console error, and on any add-on showing its fallback. */
function watch(page: Page) {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`console: ${m.text()}`);
  });
  return problems;
}

async function noFallbacks(page: Page) {
  await expect(page.locator("[data-addon-unavailable]")).toHaveCount(0);
}

test("map loads and every layer toggles", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const funds: Record<string, string> = { "Real Estate": "BREIT", Infrastructure: "BX Infra", "Private Equity": "BXPE", Credit: "BCRED" };
  for (const [tab, fund] of Object.entries(funds)) {
    await page.getByRole("tab", { name: new RegExp(tab) }).click();
    await expect(page.getByRole("heading", { level: 2, name: `Where ${fund} invests` })).toBeVisible();
    await noFallbacks(page);
  }
  for (const tab of ["All funds", "Retirement"]) {
    await page.getByRole("tab", { name: new RegExp(tab) }).click();
    await expect(page.getByRole("tabpanel")).toBeVisible();
  }
  expect(problems).toEqual([]);
});

test("Advisor Toolkit link opens the toolkit, and every enabled add-on opens", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/");
  await page.getByRole("link", { name: "Advisor Toolkit" }).click();
  await expect(page).toHaveURL(/\/toolkit$/);
  await expect(page.getByRole("heading", { level: 1, name: "Advisor Toolkit" })).toBeVisible();
  const enabled = toolkitAddons(ADDONS);
  if (enabled.length === 0) await expect(page.getByText("Advisor tools coming soon")).toBeVisible();
  for (const a of enabled) {
    await page.goto(`/toolkit/${a.id}`);
    await expect(page.getByRole("heading", { level: 1, name: a.name })).toBeVisible();
    await noFallbacks(page);
  }
  expect(problems).toEqual([]);
});

test("every fund panel's add-on chips open their drawer, and Escape closes it", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/");
  const funds: Record<string, string> = { "Real Estate": "BREIT", Infrastructure: "BX Infra", "Private Equity": "BXPE", Credit: "BCRED" };
  for (const [tab, fund] of Object.entries(funds)) {
    await page.getByRole("tab", { name: new RegExp(tab) }).click();
    // Count chips only once this fund's panel is showing, not the previous fund's.
    await expect(page.getByRole("heading", { level: 2, name: `Where ${fund} invests` })).toBeVisible();
    const tools = page.getByRole("navigation", { name: "Advisor tools for this fund" });
    const chips = tools.getByRole("button");
    const n = await chips.count();
    for (let i = 0; i < n; i++) {
      await chips.nth(i).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("link", { name: "Full view →" })).toBeVisible();
      await expect(dialog.getByText(/ILLUSTRATIVE|SAMPLE|Source/i).first()).toBeVisible();
      await noFallbacks(page);
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
    }
  }
  expect(problems).toEqual([]);
});

test("a theme drives each fund's sector filter across fund switches, and turning it off restores the map", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/");
  const sectors = page.getByRole("group", { name: "Filter by sector" });
  const themes = page.getByRole("group", { name: "Filter by theme, across funds" });
  if ((await themes.count()) === 0) return; // add-on switched off: nothing to check
  await themes.getByRole("button", { name: "AI & data centers" }).click();
  await expect(sectors.getByRole("button", { name: /^Data Centers/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("tab", { name: /Infrastructure/ }).click();
  // The theme carries over: BX Infra's panel opens already filtered to its matching sector.
  await expect(page.getByRole("heading", { level: 2, name: "Digital Infrastructure in BX Infra" })).toBeVisible();
  await expect(sectors.getByRole("button", { name: /^Digital Infrastructure/ })).toHaveAttribute("aria-pressed", "true");
  await themes.getByRole("button", { name: "No theme" }).click();
  await expect(sectors.getByRole("button", { name: "All sectors" })).toHaveAttribute("aria-pressed", "true");
  await noFallbacks(page);
  expect(problems).toEqual([]);
});

test("Family Office mode reorders the toolkit, is kept while browsing tools, and leaves the map alone", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/toolkit");
  const toggle = page.getByRole("group", { name: "Audience" });
  if ((await toggle.count()) === 0) return;
  await toggle.getByRole("button", { name: "Family Office" }).click();
  await expect(page.getByRole("listitem").first().getByRole("heading", { level: 2 })).toHaveText("Drawdown vs. Evergreen");
  await page.getByRole("link", { name: /Liquidity Simulator/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Liquidity Simulator" })).toBeVisible();
  // The switch only reorders the toolkit's cards, so tool pages don't show it; the choice is still there on return.
  await expect(page.getByRole("group", { name: "Audience" })).toHaveCount(0);
  await page.getByRole("link", { name: "Advisor Toolkit" }).click();
  await expect(page.getByRole("group", { name: "Audience" }).getByRole("button", { name: "Family Office" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "← Map" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Blackstone Private Market" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Audience" })).toHaveCount(0);
  expect(problems).toEqual([]);
});

test("the guided tour opens from the map, steps through live views, and deep links land in the right place", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/");
  await page.getByRole("link", { name: "Take the tour" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Guided tour" })).toBeVisible();
  await expect(page.getByText(/Step 1 of \d+/)).toBeVisible();
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(page.getByText(/Step 2 of \d+/)).toBeVisible();
  const frame = page.frameLocator("iframe");
  // Step 2 opens BREIT with Nevada selected.
  await expect(frame.getByRole("heading", { level: 2, name: "Nevada" })).toBeVisible();
  // Every step's live view loads without an error page.
  const count = await page.getByRole("navigation", { name: "All steps" }).getByRole("button").count();
  for (let n = 0; n < count; n++) {
    await page.getByRole("navigation", { name: "All steps" }).getByRole("button").nth(n).click();
    await expect(frame.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(frame.getByText("This tool isn't available")).toHaveCount(0);
    await expect(frame.locator("[data-addon-unavailable]")).toHaveCount(0);
  }
  expect(problems).toEqual([]);
});

test("a theme survives a visit to All funds, and No theme restores the sector picked before it", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/");
  const sectors = page.getByRole("group", { name: "Filter by sector" });
  const themes = page.getByRole("group", { name: "Filter by theme, across funds" });
  if ((await themes.count()) === 0) return;
  await sectors.getByRole("button", { name: /^Industrial/ }).click();
  await themes.getByRole("button", { name: "AI & data centers" }).click();
  await expect(sectors.getByRole("button", { name: /^Data Centers/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("tab", { name: /All funds/ }).click();
  await page.getByRole("tab", { name: /Real Estate/ }).click();
  await expect(sectors.getByRole("button", { name: /^Data Centers/ })).toHaveAttribute("aria-pressed", "true");
  await themes.getByRole("button", { name: "No theme" }).click();
  await expect(sectors.getByRole("button", { name: /^Industrial/ })).toHaveAttribute("aria-pressed", "true");
  // Picking a sector yourself sets the theme aside.
  await themes.getByRole("button", { name: "AI & data centers" }).click();
  await sectors.getByRole("button", { name: /^Rental Housing/ }).click();
  await expect(themes.getByRole("button", { name: "AI & data centers" })).toHaveAttribute("aria-pressed", "false");
  expect(problems).toEqual([]);
});

test("the drawer keeps keyboard focus inside it and resets when reopened on another fund", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: /Credit/ }).click();
  await page.getByRole("navigation", { name: "Advisor tools for this fund" }).getByRole("button", { name: "Index vs fund" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 25; i++) await page.keyboard.press("Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest("[role=dialog]"))).toBe(true);
  await expect(dialog.getByText(/Starting from the index's 7.7%/)).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("tab", { name: /Real Estate/ }).click();
  await page.getByRole("navigation", { name: "Advisor tools for this fund" }).getByRole("button", { name: "Index vs fund" }).click();
  await expect(page.getByRole("dialog").getByText(/Starting from the index's 4.45%/)).toBeVisible();
});

test("the 401(k) tab: Lab reacts and resets, audience switch keeps the numbers, and cross-links work", async ({ page }) => {
  test.skip(!ADDONS.find((a) => a.id === "retirement-plus" && a.enabled), "401(k) add-on is off");
  const problems = watch(page);
  await page.goto("/?view=retirement");
  await expect(page.getByRole("heading", { name: "The 0.1% problem" })).toBeVisible();
  await noFallbacks(page);
  const diff = page.locator('[data-lab="difference"]');
  const start = await diff.textContent();
  const fees = page.getByLabel("Extra fees, private");
  await fees.fill("2");
  await fees.blur();
  await expect(diff).not.toHaveText(start!);
  await page.getByRole("button", { name: "Reset to paper's assumptions" }).click();
  await expect(diff).toHaveText(start!);
  await page.getByRole("button", { name: "Employer", exact: true }).click();
  await expect(page.locator("[data-section]").first()).toHaveAttribute("data-section", "why");
  await expect(page.locator("[data-concern]").first()).toHaveAttribute("data-concern", "lawsuits");
  await expect(diff).toHaveText(start!);
  await page.getByRole("link", { name: /See how redemption limits work/ }).click();
  await expect(page).toHaveURL(/\/toolkit\/liquidity$/);
  expect(problems).toEqual([]);
});
