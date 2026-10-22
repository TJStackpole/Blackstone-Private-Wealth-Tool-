import { expect, test, type Page } from "@playwright/test";
import { ADDONS, enabledAddons } from "@/config/addons";

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
  const enabled = enabledAddons(ADDONS);
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

test("Family Office mode reorders the toolkit, carries across tool pages, and leaves the map alone", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/toolkit");
  const toggle = page.getByRole("group", { name: "Audience" });
  if ((await toggle.count()) === 0) return;
  await toggle.getByRole("button", { name: "Family Office" }).click();
  await expect(page.getByRole("listitem").first().getByRole("heading", { level: 2 })).toHaveText("Drawdown vs. Evergreen");
  await page.getByRole("link", { name: /Liquidity Simulator/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Liquidity Simulator" })).toBeVisible();
  await expect(page.getByText("What your investment committee may ask")).toBeVisible();
  await page.getByRole("link", { name: "← Map" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Blackstone Private Market" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Audience" })).toHaveCount(0);
  expect(problems).toEqual([]);
});
