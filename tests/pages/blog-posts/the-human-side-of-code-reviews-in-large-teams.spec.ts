import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test.describe('Post: The human side of code reviews in large teams', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('./blog/the-human-side-of-code-reviews-in-large-teams');
    });

    test('should have a title', async ({ page }) => {
        await expect(page).toHaveTitle(/The human side of code reviews in large teams/);
    });

    test('should not have any automatically detectable accessibility issues', async ({ page }) => {
        const accessibilityScanResults = await new AxeBuilder({ page }).exclude('.astro-code').analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should match the screenshot', async ({ page }) => {
        await expect(page).toHaveScreenshot({ fullPage: true });
    });
});
