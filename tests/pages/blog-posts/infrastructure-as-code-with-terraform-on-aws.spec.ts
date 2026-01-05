import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test.describe('Post: Infrastructure as Code with Terraform on AWS', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('./blog/infrastructure-as-code-with-terraform-on-aws');
    });

    test('should have a title', async ({ page }) => {
        await expect(page).toHaveTitle(/Infrastructure as Code with Terraform on AWS/);
    });

    test('should not have any automatically detectable accessibility issues', async ({ page }) => {
        const accessibilityScanResults = await new AxeBuilder({ page }).exclude('.astro-code').analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should match the screenshot', async ({ page }) => {
        await expect(page).toHaveScreenshot({ fullPage: true });
    });
});
