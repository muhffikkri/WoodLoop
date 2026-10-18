import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const SAMPLE_PHOTO = path.join(
  process.cwd(),
  "public/images/demo/boards-offcuts-demo.webp",
);

async function loginAsSupplier(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue as Demo Supplier" }).click();
  await expect(page).toHaveURL(/\/app\/supplier$/);
}

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`create listing page has no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await loginAsSupplier(page);
    await page.goto("/app/listings/new");
    await expect(
      page.getByRole("heading", { name: "Upload batch photos" }),
    ).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).resolves.toBeTruthy();
  });
}

test("step 1 requires photos and allows uploading a photo with cover badge", async ({
  page,
}) => {
  await loginAsSupplier(page);
  await page.goto("/app/listings/new");

  // Step 1 header
  await expect(
    page.getByRole("heading", { name: "Upload batch photos" }),
  ).toBeVisible();
  await expect(
    page.getByText("Start with clear photos of your offcuts"),
  ).toBeVisible();

  // Continue button is disabled without photos
  const continueBtn = page.getByRole("button", {
    name: "Continue to Details",
  });
  await expect(continueBtn).toBeDisabled();

  // Upload sample image
  const fileInput = page.locator("#photo-file-input");
  await fileInput.setInputFiles(SAMPLE_PHOTO);

  // Uploaded photo grid appears with cover badge
  await expect(page.getByText(/Uploaded photos \(1\/8\)/)).toBeVisible();
  await expect(page.getByText("Cover", { exact: true })).toBeVisible();
  await expect(continueBtn).toBeEnabled();

  // Photo tips link retains draft
  await page
    .getByRole("main")
    .getByRole("link", { name: "Photo tips" })
    .click();
  await expect(page).toHaveURL(/\/app\/guidance\?returnTo=/);
});

test("complete wizard flow: upload, details, AI sample preview, review, and publish", async ({
  page,
}) => {
  await loginAsSupplier(page);
  await page.goto("/app/listings/new");

  // Step 1: Upload photo
  await page.locator("#photo-file-input").setInputFiles(SAMPLE_PHOTO);
  await expect(page.getByText("Cover", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue to Details" }).click();

  // Step 2: Details
  await expect(
    page.getByRole("heading", { name: "Batch specifications & origin" }),
  ).toBeVisible();

  // Fill in title
  await page.locator("#listing-title").fill("Custom Walnut Table Offcuts");

  // Test AI sample suggestion preview
  await page
    .getByRole("button", { name: "Preview example AI suggestions" })
    .click();
  await expect(
    page.getByText("Demo example, not generated from your photo"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Accept suggestion" }).click();
  await expect(page.getByText("Accepted by supplier")).toBeVisible();

  // Dimensions
  await page.locator("#length-mm").fill("650");
  await page.locator("#width-mm").fill("140");
  await page.locator("#thickness-mm").fill("25");

  // Quantity
  await page.locator("#batch-quantity").fill("8");

  // Declared species
  await page.locator("#declared-species").fill("Walnut");

  // Treatment status (untreated selected by default)
  await expect(
    page.getByRole("radio", { name: /Untreated solid wood/ }),
  ).toBeChecked();

  // Proceed to Review
  await page.getByRole("button", { name: "Review Listing" }).click();

  // Step 3: Review
  await expect(
    page.getByRole("heading", { name: "Review your batch listing" }),
  ).toBeVisible();
  await expect(page.getByText("Custom Walnut Table Offcuts")).toBeVisible();
  await expect(page.getByText("650 mm L × 140 mm W × 25 mm T")).toBeVisible();
  await expect(page.getByText("8 pieces")).toBeVisible();
  await expect(
    page.getByText(/Walnut.*Supplier-declared/i),
  ).toBeVisible();

  // Publish button is disabled until acknowledgment checked
  const publishBtn = page.getByRole("button", { name: "Publish listing" });
  await expect(publishBtn).toBeDisabled();

  // Check acknowledgment
  await page.locator("#scope-acknowledgment").check();
  await expect(publishBtn).toBeEnabled();

  // Click publish
  await publishBtn.click();

  // Step 4: Publish Confirmation
  await expect(
    page.getByRole("heading", { name: "Listing published" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View listing" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Go to supplier home" }),
  ).toBeVisible();

  // Navigate to newly created listing
  await page.getByRole("link", { name: "View listing" }).click();
  await expect(page).toHaveURL(/\/app\/materials\/listing-/);
  await expect(
    page.getByRole("heading", { name: "Custom Walnut Table Offcuts" }),
  ).toBeVisible();
});

test("chemically treated wood triggers scope warning and blocks active publishing", async ({
  page,
}) => {
  await loginAsSupplier(page);
  await page.goto("/app/listings/new");

  // Upload photo
  await page.locator("#photo-file-input").setInputFiles(SAMPLE_PHOTO);
  await page.getByRole("button", { name: "Continue to Details" }).click();

  // Fill in title and quantity
  await page.locator("#listing-title").fill("Treated Outdoor Decking Cutoffs");
  await page.locator("#length-mm").fill("500");
  await page.locator("#width-mm").fill("100");
  await page.locator("#thickness-mm").fill("20");
  await page.locator("#batch-quantity").fill("5");

  // Select treated radio
  await page
    .getByRole("radio", { name: /Chemically treated \/ painted/ })
    .check();

  // Scope alert is shown in Details
  await expect(page.getByText("Outside WoodLoop Scope:")).toBeVisible();

  // Go to Review
  await page.getByRole("button", { name: "Review Listing" }).click();

  // Active publication is blocked
  await expect(page.getByText("Active Publication Blocked:")).toBeVisible();
  await expect(page.locator("#scope-acknowledgment")).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Publish listing" }),
  ).toBeDisabled();

  // Save as draft is still available
  await expect(
    page.getByRole("button", { name: "Save as draft" }),
  ).toBeEnabled();
});

test("draft autosaves and survives reload, with discard option", async ({
  page,
}) => {
  await loginAsSupplier(page);
  await page.goto("/app/listings/new");

  // Upload photo & enter title
  await page.locator("#photo-file-input").setInputFiles(SAMPLE_PHOTO);
  await page.getByRole("button", { name: "Continue to Details" }).click();
  await page.locator("#listing-title").fill("Draft Cypress Beam Offcuts");

  // Wait for draft auto-save indicator
  await expect(page.getByText("Draft saved locally")).toBeVisible();

  // Reload page
  await page.reload();

  // Step and inputs should be restored
  await expect(
    page.getByRole("heading", { name: "Batch specifications & origin" }),
  ).toBeVisible();
  await expect(page.locator("#listing-title")).toHaveValue(
    "Draft Cypress Beam Offcuts",
  );

  // Discard draft
  await page.getByRole("button", { name: "Discard draft" }).click();
  await expect(
    page.getByRole("heading", { name: "Discard draft?" }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Discard draft" })
    .click();

  // Wizard resets to Step 1 Photos with empty state
  await expect(
    page.getByRole("heading", { name: "Upload batch photos" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue to Details" }),
  ).toBeDisabled();
});

test("edit existing owned listing pre-fills details and saves update", async ({
  page,
}) => {
  await loginAsSupplier(page);

  // demo-supplier owns demo-board-01
  await page.goto("/app/listings/demo-board-01/edit");

  // Should load edit form
  await expect(
    page.getByRole("heading", {
      name: /Edit listing · Wide board offcuts/i,
    }),
  ).toBeVisible();

  // Go to Details
  await page.getByRole("button", { name: "Continue to Details" }).click();
  await expect(page.locator("#listing-title")).toHaveValue(
    "Wide board offcuts · sample batch",
  );

  // Update title
  await page
    .locator("#listing-title")
    .fill("Updated Wide Board Offcuts · batch 01");

  // Go to Review
  await page.getByRole("button", { name: "Review Listing" }).click();
  await expect(
    page.getByText("Updated Wide Board Offcuts · batch 01"),
  ).toBeVisible();

  // Acknowledge and save changes
  await page.locator("#scope-acknowledgment").check();
  await page.getByRole("button", { name: "Save changes" }).click();

  // Confirmation
  await expect(
    page.getByRole("heading", { name: "Listing published" }),
  ).toBeVisible();
});
