import { expect, test } from "@playwright/test";

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`photo guidance has no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/app/guidance");
    await expect(
      page.getByRole("heading", { name: "Photograph your offcuts clearly" }),
    ).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).resolves.toBeTruthy();
  });
}

test("guidance shows four rules, two real examples and the AI disclaimer", async ({
  page,
}) => {
  await page.goto("/app/guidance");
  await expect(
    page.getByRole("list", { name: "Photo checklist" }).getByRole("listitem"),
  ).toHaveCount(4);
  await expect(page.getByText("Good example")).toBeVisible();
  await expect(page.getByText("Try again")).toBeVisible();
  for (const image of await page.getByRole("figure").getByRole("img").all()) {
    await expect(image).toHaveJSProperty("complete", true);
    await expect(image).not.toHaveJSProperty("naturalWidth", 0);
  }
  await expect(
    page.getByText("visual estimates. Species, structural strength"),
  ).toBeVisible();
});

test("skip returns to the safe default or the supplied returnTo", async ({
  page,
}) => {
  await page.goto("/app/guidance");
  await expect(page.getByRole("link", { name: "Skip for now" })).toHaveAttribute(
    "href",
    "/app/supplier",
  );
  await page.goto("/app/guidance?returnTo=%2Fapp%2Flistings%2Fnew");
  await expect(page.getByRole("link", { name: "Skip for now" })).toHaveAttribute(
    "href",
    "/app/listings/new",
  );
  await expect(
    page.getByRole("link", { name: "Start listing" }),
  ).toHaveAttribute("href", "/app/listings/new");
});

test("unsafe returnTo values are ignored", async ({ page }) => {
  await page.goto("/app/guidance?returnTo=https%3A%2F%2Fevil.example");
  await expect(page.getByRole("link", { name: "Skip for now" })).toHaveAttribute(
    "href",
    "/app/supplier",
  );
});

test("guidance is reachable from the add-listing step and returns there", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue as Demo Supplier" }).click();
  await page.goto("/app/listings/new");
  await page
    .getByRole("main")
    .getByRole("link", { name: "Photo tips" })
    .click();
  await expect(page).toHaveURL(/\/app\/guidance\?returnTo=/);
  await page.getByRole("link", { name: "Skip for now" }).click();
  await expect(page).toHaveURL(/\/app\/listings\/new$/);
  await page.goBack();
  await page.getByRole("link", { name: "Start listing" }).click();
  await expect(page).toHaveURL(/\/app\/listings\/new$/);
});
