import { test, expect } from "@playwright/test";

test("onboarding offers a path for mothers and one for staff", async ({ page }) => {
  await page.goto("/onboarding", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Who are you?" })).toBeVisible();
  await expect(page.getByRole("link", { name: /I'm a mother or partner/ })).toHaveAttribute("href", "/activate");
  await expect(page.getByRole("link", { name: /I work at a health facility/ })).toHaveAttribute("href", "/login");
});

test("onboarding states the privacy rule", async ({ page }) => {
  await page.goto("/onboarding", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Your health record is private.")).toBeVisible();
});

test("forgot password asks for a phone number", async ({ page }) => {
  await page.goto("/forgot-password", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Forgot password?" })).toBeVisible();
  await expect(page.getByPlaceholder("024 123 4567")).toBeVisible();
});
