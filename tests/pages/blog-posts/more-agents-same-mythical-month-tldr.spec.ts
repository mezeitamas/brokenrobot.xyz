import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

import { settleImages } from '../../settleImages';

test.describe('TL;DR: More Agents, Same Mythical Month', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('./blog/more-agents-same-mythical-month/tldr');
    });

    test('should have a title', async ({ page }) => {
        await expect(page).toHaveTitle(/TL;DR: More Agents, Same Mythical Month/);
    });

    test('should not have any automatically detectable accessibility issues', async ({ page }) => {
        const accessibilityScanResults = await new AxeBuilder({ page }).exclude('.astro-code').analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should match the screenshot', async ({ page }) => {
        await settleImages(page);

        await expect(page).toHaveScreenshot({ fullPage: true });
    });
});
