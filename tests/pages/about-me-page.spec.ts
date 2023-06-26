import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('./about-me');
});

test.describe('about me page', () => {
    test('should have a title', async ({ page }) => {
        await expect(page).toHaveTitle(/About me/);
    });

    test('should not have any automatically detectable accessibility issues', async ({ page }) => {
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
