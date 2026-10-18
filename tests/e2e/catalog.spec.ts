import { expect, test } from "@playwright/test";

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`material catalog has no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/app/materials");
    await expect(
      page.getByRole("heading", { name: "Available offcuts" }),
    ).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).resolves.toBeTruthy();
  });
}

test("guest sees explore header and login CTA with returnTo preserved", async ({
  page,
}) => {
  await page.goto("/app/materials");
  await expect(
    page.getByRole("heading", { name: "Explore materials" }),
  ).toBeVisible();
  const loginLink = page.getByRole("link", { name: "Log in" });
  await expect(loginLink).toBeVisible();
  await expect(loginLink).toHaveAttribute(
    "href",
    /\/login\?returnTo=%2Fapp%2Fmaterials/,
  );
});

test("search field debounces query and clears via X button", async ({
  page,
}) => {
  await page.goto("/app/materials");
  const searchInput = page.getByLabel("Search materials");
  await searchInput.fill("strip");
  // Debounce triggers replace navigation
  await expect(page).toHaveURL(/q=strip/);
  await expect(
    page.getByRole("heading", { name: /narrow strip offcuts/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /wide board offcuts/i }),
  ).toHaveCount(0);

  // Clear button resets the search
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(page).not.toHaveURL(/q=/);
  await expect(
    page.getByRole("heading", { name: /wide board offcuts/i }),
  ).toBeVisible();
});

test("desktop sidebar applies form and dimension filters with active chips and clear all", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/app/materials");

  // On desktop, the sidebar is visible
  const sidebar = page.getByRole("complementary", { name: "Filters" });
  await expect(sidebar).toBeVisible();

  // Filter by Board form
  await sidebar.getByRole("button", { name: "Board" }).click();
  await sidebar.getByLabel("Minimum length (mm)").fill("700");
  await sidebar.getByRole("button", { name: "Apply filters" }).click();

  await expect(page).toHaveURL(/form=board/);
  await expect(page).toHaveURL(/minLength=700/);

  // Result count matches
  await expect(page.getByText("1 matching batch")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Wide board offcuts · sample batch" }),
  ).toBeVisible();

  // Active filter chips appear
  const chipsList = page.getByRole("list", { name: "Active filters" });
  await expect(chipsList.getByRole("button", { name: /Board/ })).toBeVisible();
  await expect(
    chipsList.getByRole("button", { name: /Length ≥ 700 mm/ }),
  ).toBeVisible();

  // Remove individual chip
  await chipsList.getByRole("button", { name: /Length ≥ 700 mm/ }).click();
  await expect(page).not.toHaveURL(/minLength=/);
  await expect(page).toHaveURL(/form=board/);
  await expect(page.getByText("2 matching batches")).toBeVisible();

  // Clear all button resets all criteria
  await page.getByRole("button", { name: "Clear all" }).click();
  await expect(page).not.toHaveURL(/form=/);
  await expect(page.getByText("4 matching batches")).toBeVisible();
});

test("mobile filter sheet opens and applies filters with count badge", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/materials");

  // Mobile filters button
  const filterBtn = page.getByRole("button", { name: /^Filters/ });
  await expect(filterBtn).toBeVisible();
  await filterBtn.click();

  const sheet = page.getByRole("dialog");
  await expect(
    sheet.getByRole("heading", { name: "Filter available offcuts" }),
  ).toBeVisible();

  await sheet.getByRole("button", { name: "Block" }).click();
  await sheet.getByRole("button", { name: "Apply filters" }).click();

  await expect(page).toHaveURL(/form=block/);
  await expect(
    page.getByRole("heading", { name: /Solid wood blocks/i }),
  ).toBeVisible();

  // Badge indicates 1 active filter
  await expect(filterBtn.getByLabel("1 active")).toBeVisible();
});

test("sort selector updates ordering deterministically", async ({ page }) => {
  await page.goto("/app/materials");
  const sortSelect = page.getByLabel("Sort by");

  // Sort by most pieces first
  await sortSelect.selectOption("quantity_desc");
  await expect(page).toHaveURL(/sort=quantity_desc/);

  // In quantity_desc: narrow strip offcuts (24) is first
  const headings = page.getByRole("article").getByRole("heading", { level: 3 });
  await expect(headings.first()).toHaveText(
    "Narrow strip offcuts · sample batch",
  );

  // Sort by fewest pieces first
  await sortSelect.selectOption("quantity_asc");
  await expect(page).toHaveURL(/sort=quantity_asc/);

  // In quantity_asc: short board ends (5 available) is first
  await expect(headings.first()).toHaveText("Short board ends · sample batch");
});

test("empty search displays empty state with clear all action", async ({
  page,
}) => {
  await page.goto("/app/materials?q=nonexistentwood12345");
  await expect(
    page.getByRole("heading", { name: "No matching offcuts" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await expect(page).toHaveURL("/app/materials");
  await expect(page.getByText("4 matching batches")).toBeVisible();
});

test("clicking material card navigates to detail and back preserves filters", async ({
  page,
}) => {
  await page.goto("/app/materials?q=board&sort=quantity_desc");
  await page
    .getByRole("link", { name: /Wide board offcuts/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/app\/materials\/demo-board-01$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/app\/materials\?q=board&sort=quantity_desc$/);
  await expect(
    page.getByRole("heading", { name: /Wide board offcuts/i }),
  ).toBeVisible();
});
