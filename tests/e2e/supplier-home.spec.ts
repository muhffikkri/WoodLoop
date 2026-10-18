import { expect, test, type Page } from "@playwright/test";

async function loginAsDemoSupplier(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue as Demo Supplier" }).click();
  await expect(page).toHaveURL(/\/app\/supplier$/);
  await expect(page.getByRole("heading", { name: "Your workspace" })).toBeVisible();
}

function stat(page: Page, label: string) {
  return page.getByRole("link", { name: new RegExp(`^${label}`) });
}

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`supplier home has no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await loginAsDemoSupplier(page);
    await expect(page.getByText("Recent listings")).toBeVisible();
    await expect(
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).resolves.toBeTruthy();
  });
}

test("supplier counts are computed from the seeded own listings", async ({
  page,
}) => {
  await loginAsDemoSupplier(page);
  // demo-supplier owns demo-board-01, demo-strip-01 (active) and demo-strip-02 (reserved)
  await expect(stat(page, "Active listings")).toContainText("2");
  await expect(stat(page, "Open requests")).toContainText("0");
  await expect(stat(page, "Needs stock update")).toContainText("0");
  await expect(page.getByText("No buyer requests yet")).toBeVisible();
});

test("add button opens the add-offcut route and recent listing opens its material", async ({
  page,
}) => {
  await loginAsDemoSupplier(page);
  await page.getByRole("link", { name: "Add wood offcut" }).first().click();
  await expect(page).toHaveURL(/\/app\/listings\/new$/);
  await page.goBack();
  await page.getByRole("link", { name: /wide board offcuts/i }).click();
  await expect(page).toHaveURL(/\/app\/materials\/demo-board-01$/);
});

test("supplier navigation and contextual links resolve", async ({ page }) => {
  await loginAsDemoSupplier(page);
  await page.getByRole("link", { name: "View all listings" }).click();
  await expect(page).toHaveURL(/\/app\/listings$/);
  await page.goBack();
  await page.getByRole("link", { name: "Photo tips" }).click();
  await expect(page).toHaveURL(/\/app\/guidance$/);
  await page.goto("/app/supplier");
  await stat(page, "Open requests").click();
  await expect(page).toHaveURL(/\/app\/requests\?view=incoming$/);
  await expect(
    page.getByRole("heading", { name: "No incoming requests yet" }),
  ).toBeVisible();
});

test("a buyer request increases open requests and opens the exact request", async ({
  page,
}) => {
  await loginAsDemoSupplier(page);
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open("woodloop-ai-demo");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const now = new Date().toISOString();
          const tx = db.transaction("requests", "readwrite");
          tx.objectStore("requests").add({
            id: "request-test-1",
            listingId: "demo-board-01",
            buyerId: "demo-buyer",
            supplierId: "demo-supplier",
            requestedQuantity: 4,
            unit: "pieces",
            message: "Can I collect on Friday?",
            fulfillmentMethod: "pickup",
            status: "new",
            createdAt: now,
            updatedAt: now,
            history: [],
          });
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );
  await page.reload();
  await expect(stat(page, "Open requests")).toContainText("1");
  await page.getByRole("link", { name: /Wide board offcuts.*Review request/ }).click();
  await expect(page).toHaveURL(/\/app\/requests\/request-test-1$/);
  await expect(page.getByText("Can I collect on Friday?")).toBeVisible();
});

test("a buyer cannot open the supplier incoming-requests view", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue as Demo Buyer" }).click();
  await page.goto("/app/requests?view=incoming");
  await expect(
    page.getByRole("heading", { name: "This workspace is not enabled" }),
  ).toBeVisible();
});
