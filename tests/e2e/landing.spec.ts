import { expect, test } from "@playwright/test";

const widths = [320, 390, 768, 1024, 1440];

for (const width of widths) {
  test(`landing has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Give production wood offcuts another life.",
    );
    await expect(
      page.getByRole("main").getByRole("button", { name: "Install WoodLoop" }),
    ).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).resolves.toBeTruthy();
  });
}

test("landing actions lead to honest available routes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore materials" }).first().click();
  await expect(page).toHaveURL(/\/app\/materials$/);
  await expect(
    page.getByRole("heading", { name: "Materials catalog is being prepared" }),
  ).toBeVisible();

  await page.goto("/");
  await page.getByRole("link", { name: "List your offcuts" }).first().click();
  await expect(page).toHaveURL(/\/login\?intent=supplier/);
  await expect(
    page.getByRole("heading", { name: "Welcome to WoodLoop" }),
  ).toBeVisible();
});

test("install falls back to platform guidance when no native prompt is available", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("main")
    .getByRole("button", { name: "Install WoodLoop" })
    .click();
  await expect(page).toHaveURL(/\/install$/);
  await expect(
    page.getByRole("heading", { name: "Install from your browser" }),
  ).toBeVisible();
});
