import { expect, test } from "@playwright/test";

const viewports = [
  { name: "320", width: 320, height: 720 },
  { name: "375", width: 375, height: 812 },
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 900 },
  { name: "1024", width: 1024, height: 900 },
  { name: "1440", width: 1440, height: 900 },
] as const;

for (const viewport of viewports) {
  test(`foundation has no horizontal overflow at ${viewport.name}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/foundation");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /eco-industrial foundations/i,
      }),
    ).toBeVisible();

    const hasOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);

    const shortControls = await page
      .getByRole("button")
      .evaluateAll((buttons) =>
        buttons
          .map((button) => ({
            label: button.getAttribute("aria-label") ?? button.textContent,
            height: button.getBoundingClientRect().height,
            width: button.getBoundingClientRect().width,
          }))
          .filter(({ height, width }) => height < 44 || width < 44),
      );
    expect(shortControls).toEqual([]);
  });
}

test("manifest and required app icons are available", async ({ request }) => {
  const manifestResponse = await request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json();
  expect(manifest.name).toBe("WoodLoop AI");
  expect(manifest.start_url).toBe("/app?source=pwa");

  for (const icon of manifest.icons) {
    const iconResponse = await request.get(icon.src);
    expect(iconResponse.ok()).toBe(true);
  }
});
