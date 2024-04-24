import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test.describe('About page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('./about');
    });

    test('should have a title', async ({ page }) => {
        await expect(page).toHaveTitle(/About/);
    });

    test('should not have any automatically detectable accessibility issues', async ({ page }) => {
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should match the screenshot', async ({ page }) => {
        await expect(page).toHaveScreenshot({ fullPage: true });
    });
});
