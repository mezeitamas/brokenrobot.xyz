import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('./blog/advanced-static-website-hosting-with-amazon-s3-and-cloudfront');
});

test.describe('Post: Advanced static website hosting with Amazon S3 and CloudFront', () => {
    test('should have a title', async ({ page }) => {
        await expect(page).toHaveTitle(/Advanced static website hosting with Amazon S3 and CloudFront/);
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
