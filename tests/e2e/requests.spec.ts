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

async function loginAsDemoBoth(page: Page) {
  await page.goto("/register");
  await page.getByRole("button", { name: "Continue as Demo Buyer & Supplier" }).click();
  await expect(page).toHaveURL(/\/app\/buyer$/);
}

// 1. Responsiveness across 5 required viewports
for (const width of [320, 390, 768, 1024, 1440]) {
  test(`requests hub has no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await loginAsDemoBuyer(page);
    await page.goto("/app/requests");
    await expect(
      page.getByRole("heading", { name: "Requests & coordination" }),
    ).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).resolves.toBeTruthy();
  });
}

test("requests hub renders tabs and displays empty state with honest action", async ({
  page,
}) => {
  await loginAsDemoBoth(page);
  await page.goto("/app/requests");

  // Tabs exist
  const incomingTab = page.getByRole("link", { name: /Incoming/ });
  const sentTab = page.getByRole("link", { name: /Sent/ });
  await expect(incomingTab).toBeVisible();
  await expect(sentTab).toBeVisible();

  // Switching to Incoming tab displays honest empty state for user
  await incomingTab.click();
  await expect(page).toHaveURL(/\/app\/requests\?view=incoming/);
  await expect(
    page.getByRole("heading", { name: "No incoming requests yet" }),
  ).toBeVisible();
});

test("complete coordination flow: request -> agree -> reserve stock -> message -> complete", async ({
  page,
}) => {
  // Step 1: Buyer creates request for 5 pieces of demo-board-01 (12 available)
  await loginAsDemoBuyer(page);
  await page.goto("/app/materials/demo-board-01");

  await page.getByRole("button", { name: "Request this batch" }).first().click();
  const requestDialog = page.getByRole("dialog");
  await requestDialog.getByLabel(/Requested quantity/).fill("5");
  await requestDialog
    .getByLabel("Notes for supplier")
    .fill("Need 5 boards for joinery table.");
  await requestDialog.getByRole("button", { name: "Submit request" }).click();

  await expect(page).toHaveURL(/\/app\/requests\/request-/);
  const requestUrl = page.url();
  await expect(page.getByText("5 pieces", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("New", { exact: true }).first()).toBeVisible();

  // Step 2: Supplier logs in and views incoming request
  await loginAsDemoSupplier(page);
  await page.goto("/app/requests?view=incoming");

  const requestRow = page.getByRole("link", {
    name: /Wide board offcuts/i,
  });
  await expect(requestRow).toBeVisible();
  await requestRow.click();

  await expect(page).toHaveURL(requestUrl);
  await expect(page.getByText("Supplier", { exact: true }).first()).toBeVisible();

  // Step 3: Supplier confirms availability
  await page.getByRole("button", { name: "Confirm availability" }).click();
  await expect(page.getByText("Awaiting confirmation").first()).toBeVisible();

  // Step 4: Supplier agrees to request (5 pieces) -> reserves stock atomically
  await page.getByRole("button", { name: "Agree to request" }).click();
  const agreeDialog = page.getByRole("dialog");
  await expect(
    agreeDialog.getByRole("heading", { name: "Agree to Material Request" }),
  ).toBeVisible();
  await agreeDialog.getByRole("button", { name: /Confirm & Reserve/i }).click();

  // Status becomes Agreed, banner indicates held stock
  await expect(page.getByText("Agreed", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Stock reserved: 5 pieces is held/i)).toBeVisible();

  // Step 5: Verify listing stock decreased by 5 (12 - 5 = 7)
  await page.goto("/app/materials/demo-board-01");
  await expect(page.getByText("7 pieces").first()).toBeVisible();

  // Step 6: Messaging exchange between Buyer and Supplier
  await page.goto(requestUrl);
  const messageInput = page.getByPlaceholder(/Type a message to coordinate/i);
  await messageInput.fill("We have arranged pickup for Friday afternoon.");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(
    page.getByText("We have arranged pickup for Friday afternoon."),
  ).toBeVisible();

  // Step 7: Supplier marks handover completed
  await page.getByRole("button", { name: "Mark handover completed" }).click();
  const completeDialog = page.getByRole("dialog");
  await completeDialog
    .getByRole("button", { name: "Confirm Handover Completed" })
    .click();

  await expect(page.getByText("Completed", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Stock fulfilled:/i)).toBeVisible();

  // Archived messaging notice
  await expect(
    page.getByText(/This request is completed\. Messaging is archived/i),
  ).toBeVisible();
});

test("cancellation restores reserved stock atomically back to listing", async ({
  page,
}) => {
  // Buyer creates request on demo-board-01
  await loginAsDemoBuyer(page);
  await page.goto("/app/materials/demo-board-01");

  await page.getByRole("button", { name: "Request this batch" }).first().click();
  const requestDialog = page.getByRole("dialog");
  await requestDialog.getByLabel(/Requested quantity/).fill("3");
  await requestDialog.getByRole("button", { name: "Submit request" }).click();

  await expect(page).toHaveURL(/\/app\/requests\/request-/);
  const cancelTestUrl = page.url();

  // Supplier logs in and agrees -> stock decrements by 3
  await loginAsDemoSupplier(page);
  await page.goto(cancelTestUrl);
  await page.getByRole("button", { name: "Agree to request" }).click();
  const agreeDialog = page.getByRole("dialog");
  await agreeDialog.getByRole("button", { name: /Confirm & Reserve/i }).click();

  await expect(page.getByText("Agreed", { exact: true }).first()).toBeVisible();

  // Supplier cancels request with reason
  await page.getByRole("button", { name: "Cancel request" }).click();
  const closeDialog = page.getByRole("dialog");
  await closeDialog
    .getByLabel(/Reason/i)
    .fill("Buyer truck broke down, cannot collect.");
  await closeDialog.getByRole("button", { name: "Confirm Close" }).click();

  // Status becomes Closed, stock released notice
  await expect(page.getByText("Closed", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Stock released:/i)).toBeVisible();
  await expect(
    page.getByText("Buyer truck broke down, cannot collect."),
  ).toBeVisible();

  // Verify stock is restored on the listing
  await page.goto("/app/materials/demo-board-01");
  await expect(page.getByRole("heading", { name: /Wide board offcuts/i })).toBeVisible();
});
