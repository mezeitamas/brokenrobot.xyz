import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test.describe('Post: Hello, World!', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('./blog/hello-world');
    });

    test('should have a title', async ({ page }) => {
        await expect(page).toHaveTitle(/Hello, World!/);
    });

    test('should not have any automatically detectable accessibility issues', async ({ page }) => {
        const accessibilityScanResults = await new AxeBuilder({ page }).exclude('.astro-code').analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should match the screenshot', async ({ page }) => {
        await expect(page).toHaveScreenshot();
    });
});
