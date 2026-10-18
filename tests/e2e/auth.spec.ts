import { expect, test } from "@playwright/test";

const widths = [320, 390, 768, 1024, 1440] as const;

for (const width of widths) {
  test(`login has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Welcome to WoodLoop" }),
    ).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).resolves.toBeTruthy();
  });
}

test("login shows stable inline validation and an honest credential error", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByText("Enter your email.")).toBeVisible();
  await expect(page.getByText("Enter your password.")).toBeVisible();

  await page.getByLabel("Email").fill("buyer@example.com");
  await page.locator("#password").fill("not-the-demo-password");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "do not match a WoodLoop seed profile" }),
  ).toBeVisible();
});

test("password visibility control uses password-manager compatible semantics", async ({
  page,
}) => {
  await page.goto("/login");
  const password = page.locator("#password");
  await expect(password).toHaveAttribute("autocomplete", "current-password");
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(password).toHaveAttribute("type", "password");
});

test("demo buyer opens buyer home and the session persists on reload", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue as Demo Buyer" }).click();
  await expect(page).toHaveURL(/\/app\/buyer$/);
  await expect(
    page.getByRole("heading", {
      name: "Find materials for your next project.",
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Find materials for your next project.",
    }),
  ).toBeVisible();
});

test("supplier login preserves the listing returnTo intent", async ({
  page,
}) => {
  await page.goto("/login?intent=supplier&returnTo=%2Fapp%2Flistings%2Fnew");
  await page.getByRole("button", { name: "Continue as Demo Supplier" }).click();
  await expect(page).toHaveURL(/\/app\/listings\/new$/);
  await expect(
    page.getByRole("heading", { name: "Your supplier intent was preserved" }),
  ).toBeVisible();
});

test("guest route guard returns a demo buyer to the protected destination", async ({
  page,
}) => {
  await page.goto("/app/buyer");
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fapp%2Fbuyer$/);
  await page.getByRole("button", { name: "Continue as Demo Buyer" }).click();
  await expect(page).toHaveURL(/\/app\/buyer$/);
});

test("supplier cannot enter buyer workspace and has a recovery action", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue as Demo Supplier" }).click();
  await page.goto("/app/buyer");
  await expect(
    page.getByRole("heading", { name: "This workspace is not enabled" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Go to my workspace" }),
  ).toHaveAttribute("href", "/app/supplier");
});

test("register creates a passwordless local profile and persists it", async ({
  page,
}) => {
  await page.goto("/register?intent=supplier");
  await page.getByLabel("Display name").fill("Kita Workshop");
  await page.getByLabel("Work email").fill("hello@kita.example");
  await page.getByLabel("I supply offcuts").check();
  await page.getByRole("button", { name: "Create local demo profile" }).click();
  await expect(page).toHaveURL(/\/app\/supplier$/);
  await expect(
    page.getByRole("heading", { name: "Your workspace" }),
  ).toBeVisible();
  await expect(page.getByText("No listings yet")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your workspace" }),
  ).toBeVisible();
});

test("forgot password never claims to send recovery email", async ({
  page,
}) => {
  await page.goto("/forgot-password");
  await expect(
    page.getByRole("heading", {
      name: "Password recovery is unavailable in demo mode",
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /send/i })).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Try a demo profile" }),
  ).toHaveAttribute("href", "/login");
});

test("both-role profile switches workspace and logout clears only the session", async ({
  page,
}) => {
  await page.goto("/register");
  await page
    .getByRole("button", { name: "Continue as Demo Buyer & Supplier" })
    .click();
  await expect(page).toHaveURL(/\/app\/buyer$/);
  await page.goto("/app/profile");
  await page.getByRole("button", { name: "Supplying" }).click();
  await expect(page).toHaveURL(/\/app\/supplier$/);
  await page.goto("/app/profile");
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fapp$/);
});
