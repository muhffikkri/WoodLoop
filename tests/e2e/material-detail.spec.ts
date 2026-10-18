import { expect, test, type Page } from "@playwright/test";

async function loginAsDemoBuyer(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue as Demo Buyer" }).click();
  await expect(page).toHaveURL(/\/app\/buyer$/);
}

async function loginAsDemoSupplier(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue as Demo Supplier" }).click();
  await expect(page).toHaveURL(/\/app\/supplier$/);
}

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`material detail has no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/app/materials/demo-board-01");
    await expect(
      page.getByRole("heading", { name: /Wide board offcuts/i }),
    ).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).resolves.toBeTruthy();
  });
}

test("material detail renders distinct supplier confirmed, AI, and not verified sections", async ({
  page,
}) => {
  await page.goto("/app/materials/demo-board-02");

  // Title and header
  await expect(
    page.getByRole("heading", { name: "Short board ends · sample batch" }),
  ).toBeVisible();

  // Distinct section headings
  await expect(
    page.getByRole("heading", { name: "Supplier confirmed" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "AI visual suggestions" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "What is not verified" }),
  ).toBeVisible();

  // AI suggestion contains explicit disclaimer and visual estimate flag
  await expect(page.getByText("Demo visual estimate")).toBeVisible();
  await expect(
    page.getByText(/Visual estimates are not material grading/i),
  ).toBeVisible();

  // Not verified items
  await expect(
    page.getByText(/Exact wood species and biological grade/i),
  ).toBeVisible();
  await expect(
    page.getByText(/Structural load-bearing capacity/i),
  ).toBeVisible();

  // Photo gallery with thumbnails
  const thumbnails = page.getByRole("button", { name: /Show photo/ });
  await expect(thumbnails).toHaveCount(2);
  await thumbnails.nth(1).click();
  await expect(thumbnails.nth(1)).toHaveAttribute("aria-current", "true");
});

test("batch without AI analysis shows honest not-available state", async ({
  page,
}) => {
  await page.goto("/app/materials/demo-board-01");
  await expect(
    page.getByRole("heading", { name: "AI visual suggestions" }),
  ).toBeVisible();
  await expect(
    page.getByText(/Not available \(no visual analysis was run/i),
  ).toBeVisible();
});

test("guest clicking request or inquire redirects to login with returnTo", async ({
  page,
}) => {
  await page.goto("/app/materials/demo-board-01");

  // Guest clicks Request this batch
  await page
    .getByRole("button", { name: "Request this batch" })
    .first()
    .click();
  await expect(page).toHaveURL(
    /\/login\?returnTo=%2Fapp%2Fmaterials%2Fdemo-board-01$/,
  );

  // Return to detail as guest and try Ask a question
  await page.goto("/app/materials/demo-board-01");
  await page.getByRole("button", { name: "Ask a question" }).first().click();
  await expect(page).toHaveURL(
    /\/login\?returnTo=%2Fapp%2Fmaterials%2Fdemo-board-01$/,
  );
});

test("own listing shows manage listing button instead of request CTA", async ({
  page,
}) => {
  // demo-supplier owns demo-board-01
  await loginAsDemoSupplier(page);
  await page.goto("/app/materials/demo-board-01");
  await expect(
    page.getByRole("link", { name: "Manage listing" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Request this batch" }),
  ).toHaveCount(0);
});

test("out of stock batch disables request and offers browse other materials", async ({
  page,
}) => {
  // demo-block-02 is unavailable
  await page.goto("/app/materials/demo-block-02");
  const disabledBtn = page.getByRole("button", { name: "Batch unavailable" }).first();
  await expect(disabledBtn).toBeDisabled();
  await expect(
    page.getByRole("link", { name: "Browse other materials" }).first(),
  ).toHaveAttribute("href", "/app/materials");
});

test("request modal validates quantity strictly and prevents requesting more than available", async ({
  page,
}) => {
  await loginAsDemoBuyer(page);
  // demo-board-01 has 12 pieces available
  await page.goto("/app/materials/demo-board-01");
  await page
    .getByRole("button", { name: "Request this batch" })
    .first()
    .click();

  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Request this batch" }),
  ).toBeVisible();

  const qtyInput = dialog.getByLabel(/Requested quantity/);

  // 1. Cannot request 30 pieces from 12 available (acceptance gate!)
  await qtyInput.fill("30");
  await dialog.getByRole("button", { name: "Submit request" }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Quantity cannot exceed the available",
  );

  // 2. Cannot enter 0 or negative
  await qtyInput.fill("0");
  await dialog.getByRole("button", { name: "Submit request" }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Quantity must be a positive whole number",
  );

  // 3. Cannot enter fractional numbers
  await qtyInput.fill("2.5");
  await dialog.getByRole("button", { name: "Submit request" }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Quantity must be a positive whole number",
  );
});

test("submitting a valid request creates request in repository and navigates to detail", async ({
  page,
}) => {
  await loginAsDemoBuyer(page);
  await page.goto("/app/materials/demo-board-01");
  await page
    .getByRole("button", { name: "Request this batch" })
    .first()
    .click();

  const dialog = page.getByRole("dialog");
  const qtyInput = dialog.getByLabel(/Requested quantity/);
  await qtyInput.fill("4");
  await dialog.getByLabel("Notes for supplier").fill("Need for workshop table shelving.");
  await dialog.getByRole("button", { name: "Submit request" }).click();

  // Navigates to the created request detail
  await expect(page).toHaveURL(/\/app\/requests\/request-/);
  await expect(
    page.getByRole("heading", { name: "Wide board offcuts · sample batch" }),
  ).toBeVisible();
  await expect(page.getByText("4 pieces")).toBeVisible();
  await expect(page.getByText("Need for workshop table shelving.")).toBeVisible();

  // Verify it appears in Sent requests
  await page.goto("/app/requests?view=sent");
  await expect(
    page.getByRole("link", { name: /Wide board offcuts/i }),
  ).toBeVisible();
});

test("ask a question modal requires message and submits inquiry", async ({
  page,
}) => {
  await loginAsDemoBuyer(page);
  await page.goto("/app/materials/demo-board-01");
  await page
    .getByRole("button", { name: "Ask a question" })
    .first()
    .click();

  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Ask a question" }),
  ).toBeVisible();

  // Empty message fails validation
  await dialog.getByRole("button", { name: "Send question" }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Please enter your message or question",
  );

  // Valid message succeeds
  await dialog.getByLabel("Your question").fill("Can I arrange evening pickup?");
  await dialog.getByRole("button", { name: "Send question" }).click();

  await expect(page).toHaveURL(/\/app\/requests\/request-/);
  await expect(page.getByText("Can I arrange evening pickup?")).toBeVisible();
});
