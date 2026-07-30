import { expect, test } from "@playwright/test";

test("@smoke project foundation renders the CanvasDoc entry screen", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("CanvasDoc");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "文書を、自由に描いて、正しく届ける。",
    }),
  ).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(4);
});
