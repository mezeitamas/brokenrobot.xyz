import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('./blog/hello-world');
});

test.describe('Post: Hello, World!', () => {
    test('should have a title', async ({ page }) => {
        await expect(page).toHaveTitle(/Hello, World!/);
    });

    test.skip('should not have any automatically detectable accessibility issues', async ({ page }) => {
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
