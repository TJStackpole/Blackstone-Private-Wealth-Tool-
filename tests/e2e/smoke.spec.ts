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

test("the site opens on Start here, and every fund opens with five answers and then its details", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Start here" })).toBeVisible();
  const funds: Record<string, string> = { "Real Estate": "BREIT", Infrastructure: "BX Infra", "Private Equity": "BXPE", Credit: "BCRED" };
  for (const [tab, fund] of Object.entries(funds)) {
    await page.getByRole("tab", { name: new RegExp(tab) }).click();
    await expect(page.getByRole("heading", { level: 2, name: `${fund}, in five answers` })).toBeVisible();
    await page.getByRole("button", { name: /See the details/ }).click();
    await expect(page.getByRole("heading", { level: 2, name: `Where ${fund} invests` })).toBeVisible();
    await page.getByRole("button", { name: /Hide the details/ }).click();
    await noFallbacks(page);
  }
  for (const tab of ["All funds", "Retirement"]) {
    await page.getByRole("tab", { name: new RegExp(tab) }).click();
    await expect(page.getByRole("tabpanel")).toBeVisible();
  }
  expect(problems).toEqual([]);
});

test("once opened, the details (and BCRED's map) stay open on every fund, however it's reached", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/?view=breit");
  await expect(page.locator("[data-details]")).toHaveCount(0);
  await page.getByRole("button", { name: /See the details/ }).click();
  for (const [tab, fund] of [["Infrastructure", "BX Infra"], ["Private Equity", "BXPE"], ["Credit", "BCRED"]]) {
    await page.getByRole("tab", { name: new RegExp(tab) }).click();
    await expect(page.getByRole("heading", { level: 2, name: `Where ${fund} invests` })).toBeVisible();
  }
  // BCRED's map sits in its Geography section, which is open.
  const geography = page.locator('section[aria-label="Map"] details');
  await expect(geography).toHaveAttribute("open", "");
  await expect(geography.locator("svg").first()).toBeVisible();
  // From the Start screen, and on a new visit, a fund still opens with its details.
  await page.getByRole("link", { name: "Private Markets Atlas" }).first().click();
  await page.locator('[data-path="fund"] a').filter({ hasText: "BXPE" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Where BXPE invests" })).toBeVisible();
  await page.goto("/?view=bcred");
  await expect(page.getByRole("heading", { level: 2, name: "Where BCRED invests" })).toBeVisible();
  // Closing the map and the details is remembered too.
  await geography.locator("summary").click();
  await expect(geography).not.toHaveAttribute("open", "");
  await page.getByRole("button", { name: /Hide the details/ }).click();
  await page.goto("/?view=breit");
  await expect(page.locator("[data-details]")).toHaveCount(0);
  await page.goto("/?view=bcred&details=1");
  await expect(geography).not.toHaveAttribute("open", "");
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
    // Count chips only once this fund's answers are showing, not the previous fund's.
    await expect(page.getByRole("heading", { level: 2, name: `${fund}, in five answers` })).toBeVisible();
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
  await page.goto("/?view=breit&details=1");
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

test("the Family Office switch is hidden for now (a future feature), and the toolkit keeps its standard order", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/toolkit");
  await expect(page.getByRole("heading", { level: 1, name: "Advisor Toolkit" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Audience" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Family Office" })).toHaveCount(0);
  await expect(page.getByRole("listitem").first().getByRole("heading", { level: 2 })).not.toHaveText("Drawdown vs. Evergreen");
  expect(problems).toEqual([]);
});

test("the guided tour opens from the map, steps through live views, and deep links land in the right place", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/");
  await page.getByRole("link", { name: "Take the tour" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Guided tour" })).toBeVisible();
  // The short tour is the default.
  await expect(page.getByText("Step 1 of 6", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(page.getByText("Step 2 of 6", { exact: false })).toBeVisible();
  const frame = page.frameLocator("iframe");
  // Step 2 opens BCRED in five answers. Inside the live view there's no second tour button or theme switch.
  await expect(frame.getByRole("heading", { name: "BCRED, in five answers" })).toBeVisible();
  await expect(frame.getByRole("link", { name: "Take the tour" })).toHaveCount(0);
  await expect(frame.getByRole("button", { name: /Switch to (dark|light) mode/ })).toHaveCount(0);
  // Step 3, the comparison, lands on its table.
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(frame.getByRole("heading", { name: "Compare the funds" })).toBeInViewport();
  const steps = page.getByRole("navigation", { name: "All steps" }).getByRole("button");
  const visitAll = async () => {
    const count = await steps.count();
    for (let n = 0; n < count; n++) {
      await steps.nth(n).click();
      await expect(frame.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(frame.getByText("This tool isn't available")).toHaveCount(0);
      await expect(frame.locator("[data-addon-unavailable]")).toHaveCount(0);
    }
    return count;
  };
  expect(await visitAll()).toBe(6);
  // The last short step is Goals vs. results.
  await expect(frame.getByRole("heading", { level: 1, name: "Goals vs. results" })).toBeVisible();
  // The full tour is one click away, and keeps every step.
  await page.getByRole("button", { name: /^Full tour \(\d+ steps\)/ }).click();
  await expect(page.getByText(/Step 1 of 15/)).toBeVisible();
  await expect(page).toHaveURL(/\?tour=full$/);
  await expect(frame.getByRole("heading", { level: 2, name: "Start here" })).toBeVisible();
  await page.getByRole("button", { name: "Next →" }).click();
  await page.getByRole("button", { name: "Next →" }).click();
  // Full tour step 3 opens BREIT's details with Nevada selected, scrolled to the map.
  await expect(frame.getByRole("heading", { level: 2, name: "Nevada" })).toBeVisible();
  await expect(frame.locator("#map-breit")).toBeInViewport();
  expect(await visitAll()).toBe(15);
  await page.getByRole("group", { name: "Tour length" }).getByRole("button", { name: /Short tour/ }).click();
  await expect(page.getByText("Step 1 of 6", { exact: false })).toBeVisible();
  expect(problems).toEqual([]);
});

test("a theme survives a visit to All funds, and No theme restores the sector picked before it", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/?view=breit&details=1");
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
  await page.goto("/?view=bcred");
  await page.getByRole("navigation", { name: "Advisor tools for this fund" }).getByRole("button", { name: "Money out" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 25; i++) await page.keyboard.press("Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest("[role=dialog]"))).toBe(true);
  await expect(dialog.getByText(/^BCRED: Quarterly tender offers/)).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("tab", { name: /Real Estate/ }).click();
  await page.getByRole("navigation", { name: "Advisor tools for this fund" }).getByRole("button", { name: "Money out" }).click();
  await expect(page.getByRole("dialog").getByText(/^BREIT: Monthly/)).toBeVisible();
});

test("the opening page's Ask AI answers a ready-made question in place, with its sources", async ({ page }) => {
  const problems = watch(page);
  // A stand-in for the server's answer stream, so the test needs no AI key.
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/x-ndjson",
      body:
        [
          { t: "status", text: "Searching: BCRED repurchases" },
          {
            t: "done",
            text: "BCRED offers to buy back up to 5% of its shares each quarter ([BCRED offering terms](https://www.bcred.com/offering-terms/)).\n\n_Educational information only, not investment advice._",
            sources: [{ url: "https://www.bcred.com/offering-terms/", title: "BCRED offering terms" }],
          },
        ]
          .map((e) => JSON.stringify(e))
          .join("\n") + "\n",
    }),
  );
  await page.goto("/");
  const chat = page.locator("[data-inline-chat]");
  await expect(chat.getByRole("heading", { name: "Ask AI" })).toBeVisible();
  await chat.getByRole("button", { name: "Can my client get money out of BCRED?" }).click();
  const answer = chat.locator("[data-chat-answer]");
  await expect(answer).toContainText("up to 5% of its shares each quarter");
  await expect(answer.getByRole("link", { name: "BCRED offering terms" }).first()).toHaveAttribute("href", "https://www.bcred.com/offering-terms/");
  // While the page's chat is on screen, the corner button steps aside.
  await expect(page.locator("[data-chat-launcher]")).toHaveCount(0);
  expect(problems).toEqual([]);
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
