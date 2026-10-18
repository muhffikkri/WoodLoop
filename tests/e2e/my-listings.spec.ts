import { expect, test, type Page } from "@playwright/test";

async function loginAsDemoSupplier(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue as Demo Supplier" }).click();
  await expect(page).toHaveURL(/\/app\/supplier$/);
}

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`my listings has no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await loginAsDemoSupplier(page);
    await page.goto("/app/listings");
    await expect(page.getByRole("heading", { name: "Batch Inventory" })).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).resolves.toBeTruthy();
  });
}

test.describe("My Listings functionality", () => {
  test("displays computed status tabs with counts and filters correctly", async ({
    page,
  }) => {
    await loginAsDemoSupplier(page);
    await page.goto("/app/listings");

    // Header and add button
    await expect(page.getByRole("heading", { name: "Batch Inventory" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Add wood offcut" }).first()).toBeVisible();

    // Tab buttons
    const activeTab = page.getByRole("tab", { name: /Active/i });
    const reservedTab = page.getByRole("tab", { name: /Reserved/i });
    const unavailableTab = page.getByRole("tab", { name: /Unavailable/i });
    const draftsTab = page.getByRole("tab", { name: /Drafts/i });

    await expect(activeTab).toBeVisible();
    await expect(reservedTab).toBeVisible();
    await expect(unavailableTab).toBeVisible();
    await expect(draftsTab).toBeVisible();

    // Default tab is active; shows demo-supplier's active batches
    await expect(activeTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Wide board offcuts")).toBeVisible();

    // Switch to Reserved tab
    await reservedTab.click();
    await expect(reservedTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Reserved trim strips")).toBeVisible();

    // Switch to Unavailable tab (empty state)
    await unavailableTab.click();
    await expect(unavailableTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("No unavailable listings")).toBeVisible();

    // Switch to Drafts tab (empty state)
    await draftsTab.click();
    await expect(draftsTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("No saved drafts")).toBeVisible();
    await expect(page.getByRole("link", { name: "Start a listing" })).toBeVisible();
  });

  test("confirms batch availability and updates verification indicator", async ({
    page,
  }) => {
    await loginAsDemoSupplier(page);
    await page.goto("/app/listings");

    const boardCard = page.locator("article").filter({ hasText: "Wide board offcuts" });
    await expect(boardCard).toBeVisible();

    const confirmBtn = boardCard.getByRole("button", { name: /Confirm stock/i });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // Changes to verified state
    await expect(boardCard.getByRole("button", { name: "Verified" })).toBeVisible();
  });

  test("toggles availability between active and unavailable", async ({
    page,
  }) => {
    await loginAsDemoSupplier(page);
    await page.goto("/app/listings");

    const boardCard = page.locator("article").filter({ hasText: "Wide board offcuts" });
    await expect(boardCard).toBeVisible();

    // Click Unavailable button to open dialog
    await boardCard.getByRole("button", { name: "Unavailable" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Mark batch as unavailable")).toBeVisible();

    // Confirm marking unavailable
    await dialog.getByRole("button", { name: "Mark unavailable" }).click();
    await expect(dialog).not.toBeVisible();

    // Should now appear under Unavailable tab
    const unavailableTab = page.getByRole("tab", { name: /Unavailable/i });
    await unavailableTab.click();

    const unavailCard = page.locator("article").filter({ hasText: "Wide board offcuts" });
    await expect(unavailCard).toBeVisible();
    await expect(unavailCard.getByText("Unavailable").first()).toBeVisible();

    // Reactivate batch back to active
    await unavailCard.getByRole("button", { name: "Make active" }).click();
    const reactivateDialog = page.getByRole("dialog");
    await expect(reactivateDialog).toBeVisible();
    await reactivateDialog.getByRole("button", { name: "Make active" }).click();
    await expect(reactivateDialog).not.toBeVisible();

    // Switch back to Active tab and verify it is restored
    const activeTab = page.getByRole("tab", { name: /Active/i });
    await activeTab.click();
    await expect(page.locator("article").filter({ hasText: "Wide board offcuts" })).toBeVisible();
  });

  test("updates total quantity with validation checks", async ({
    page,
  }) => {
    await loginAsDemoSupplier(page);
    await page.goto("/app/listings");

    const boardCard = page.locator("article").filter({ hasText: "Wide board offcuts" });
    await expect(boardCard).toBeVisible();

    // Click Update qty button
    await boardCard.getByRole("button", { name: "Update qty" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Update batch quantity")).toBeVisible();

    const input = dialog.getByLabel(/New total quantity/i);
    await expect(input).toBeVisible();

    // Test non-positive validation
    await input.fill("0");
    await expect(dialog.getByRole("button", { name: "Save changes" })).toBeDisabled();

    // Restore to valid quantity
    await input.fill("12");
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).not.toBeVisible();
  });

  test("inquiries button navigates to filtered incoming requests", async ({
    page,
  }) => {
    await loginAsDemoSupplier(page);
    await page.goto("/app/listings");

    const boardCard = page.locator("article").filter({ hasText: "Wide board offcuts" });
    await boardCard.getByRole("link", { name: "Inquiries" }).click();

    await expect(page).toHaveURL(/\/app\/requests\?view=incoming&listingId=demo-board-01$/);
    await expect(page.getByRole("heading", { name: "Material requests" })).toBeVisible();
    await expect(page.getByText("No inquiries for this listing")).toBeVisible();
    await expect(page.getByText("There are no incoming requests for this batch yet.")).toBeVisible();

    // View all inquiries link clears filter
    await page.getByRole("link", { name: "View all inquiries" }).click();
    await expect(page).toHaveURL(/\/app\/requests\?view=incoming$/);
  });

  test("view and edit buttons route to the respective pages", async ({
    page,
  }) => {
    await loginAsDemoSupplier(page);
    await page.goto("/app/listings");

    const boardCard = page.locator("article").filter({ hasText: "Wide board offcuts" });

    // Test View button
    await boardCard.getByRole("link", { name: "View" }).click();
    await expect(page).toHaveURL(/\/app\/materials\/demo-board-01$/);

    // Return to listings
    await page.goto("/app/listings");

    // Test Edit button
    const boardCardAgain = page.locator("article").filter({ hasText: "Wide board offcuts" });
    await boardCardAgain.getByRole("link", { name: "Edit" }).click();
    await expect(page).toHaveURL(/\/app\/listings\/demo-board-01\/edit$/);
  });

  test("search filter filters batches in real time", async ({
    page,
  }) => {
    await loginAsDemoSupplier(page);
    await page.goto("/app/listings");

    const searchInput = page.getByRole("searchbox", { name: /Search within my listings/i });
    await searchInput.fill("Narrow strip");

    await expect(page.getByText("Narrow strip offcuts")).toBeVisible();
    await expect(page.getByText("Wide board offcuts")).not.toBeVisible();

    await searchInput.fill("nonexistent timber");
    await expect(page.getByText("No matching active batches")).toBeVisible();
    await page.getByRole("button", { name: "Clear search" }).click();

    await expect(page.getByText("Wide board offcuts")).toBeVisible();
  });
});
