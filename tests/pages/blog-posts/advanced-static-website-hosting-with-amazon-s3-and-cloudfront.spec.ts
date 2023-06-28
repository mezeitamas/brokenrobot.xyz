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
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
