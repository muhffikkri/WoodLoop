import { expect, test } from "@playwright/test";

async function loginAsDemoBuyer(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue as Demo Buyer" }).click();
  await expect(page).toHaveURL(/\/app\/buyer$/);
}

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`buyer home has no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await loginAsDemoBuyer(page);
    await expect(
      page.getByRole("heading", {
        name: "Find materials for your next project.",
      }),
    ).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).resolves.toBeTruthy();
  });
}

test("buyer search carries the board query into the shared catalog", async ({
  page,
}) => {
  await loginAsDemoBuyer(page);
  await page.getByLabel("What material does your project need?").fill("board");
  await page
    .getByRole("button", { name: "Search", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/app\/materials\?q=board$/);
  await expect(
    page.getByRole("heading", { name: "Available offcuts" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /wide board offcuts/i }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: /narrow strip offcuts/i }),
  ).toHaveCount(0);
});

test("buyer filter shortcut applies supplier-declared constraints in the catalog", async ({
  page,
}) => {
  await loginAsDemoBuyer(page);
  await page.getByRole("button", { name: "Form" }).click();
  await page.getByRole("button", { name: "Board" }).click();
  await page.getByLabel("Minimum length (mm)").fill("700");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/form=board/);
  await expect(page).toHaveURL(/minLength=700/);
  await expect(
    page.getByRole("heading", { name: /wide board offcuts/i }),
  ).toHaveCount(1);
});

test("a buyer home card opens the matching repository-backed material detail", async ({
  page,
}) => {
  await loginAsDemoBuyer(page);
  await page.getByRole("link", { name: /wide board offcuts/i }).click();
  await expect(page).toHaveURL(/\/app\/materials\/demo-board-01$/);
  await expect(
    page.getByRole("heading", { name: "Wide board offcuts · sample batch" }),
  ).toBeVisible();
  await expect(page.getByText("720 × 180 × 20 mm")).toBeVisible();
  await expect(page.getByText("12 pieces")).toBeVisible();
});

test("buyer requests navigation resolves to an honest dependency state", async ({
  page,
}) => {
  await loginAsDemoBuyer(page);
  await page.getByRole("link", { name: "Requests" }).click();
  await expect(page).toHaveURL(/\/app\/requests\?view=sent$/);
  await expect(
    page.getByRole("heading", { name: "Requests are not available yet" }),
  ).toBeVisible();
});
