import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('./blog/hello-world');
});

test.describe('Post: Hello, World!', () => {
    test('should have a title', async ({ page }) => {
        await expect(page).toHaveTitle(/Hello, World!/);
    });

    test('should not have any automatically detectable accessibility issues', async ({ page }) => {
        const accessibilityScanResults = await new AxeBuilder({ page })
            // JavaScript code snipets won't be checked for now, because the test fails when
            // it has a scrollbar, but cannot use keyboard navigation.
            // It is not clear for now how to solve it, until then the checks for this element
            // are disabled.
            // More info here: https://github.com/PrismJS/prism/issues/2695
            .exclude(['.language-javascript'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
