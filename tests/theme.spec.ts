import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

type Theme = 'light' | 'dark';

/**
 * Read the theme the page resolved to on load.
 *
 * This file runs in all four projects, so it starts light twice and dark twice. The toggle tests
 * therefore read the starting theme and assert it became the other value, rather than hard-coding
 * "expect dark" — which is also what covers the toggle's dark -> light direction.
 */
const startingTheme = async (page: Page): Promise<Theme> => {
    const theme = await page.locator('html').getAttribute('data-theme');

    if (theme !== 'light' && theme !== 'dark') {
        throw new Error(`The pre-paint init must resolve a theme, but data-theme was ${String(theme)}.`);
    }

    return theme;
};

const otherTheme = (theme: Theme): Theme => (theme === 'dark' ? 'light' : 'dark');

test.describe('Theme toggle control', () => {
    test('should flip the theme and sync aria-pressed', async ({ page }) => {
        await page.goto('./');

        const before = await startingTheme(page);
        const after = otherTheme(before);
        const toggle = page.locator('#theme-toggle');

        await expect(toggle).toHaveAttribute('aria-pressed', String(before === 'dark'));

        await toggle.click();

        await expect(page.locator('html')).toHaveAttribute('data-theme', after);
        await expect(toggle).toHaveAttribute('aria-pressed', String(after === 'dark'));
    });

    test('should keep the flipped choice across a navigation', async ({ page }) => {
        await page.goto('./');

        const before = await startingTheme(page);
        const after = otherTheme(before);

        await page.locator('#theme-toggle').click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', after);

        await page.goto('./about');

        await expect(page.locator('html')).toHaveAttribute('data-theme', after);
        expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(after);
    });
});

// The remaining tests pin their own conditions, so that each asserts the same thing in all four
// projects rather than restating whatever the ambient project already provides.
test.describe('Stored preference', () => {
    test.use({ colorScheme: 'dark' });

    test('should win over a conflicting system preference', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('theme', 'light');
        });

        await page.goto('./');

        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    });
});

test.describe('Diagram theme treatment', () => {
    test('should invert diagram SVGs in dark, leave them untouched in light, and never touch the hero photograph', async ({
        page
    }) => {
        await page.goto('./blog/beyond-tabs-and-spaces-finding-a-balance-in-coding-conventions');

        const theme = await startingTheme(page);

        const diagramFilters = await page
            .locator('.prose img[src$=".svg"]')
            .evaluateAll((images) => images.map((image) => getComputedStyle(image).filter));

        expect(diagramFilters.length).toBeGreaterThan(0);

        for (const filter of diagramFilters) {
            if (theme === 'dark') {
                expect(filter).not.toBe('none');
            } else {
                expect(filter).toBe('none');
            }
        }

        const heroFilter = await page.locator('img.not-prose').evaluate((image) => getComputedStyle(image).filter);

        expect(heroFilter).toBe('none');
    });
});

test.describe('System preference on a first visit', () => {
    test.describe('under a dark system', () => {
        test.use({ colorScheme: 'dark' });

        test('should resolve to the dark theme', async ({ page }) => {
            await page.goto('./');

            await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
        });
    });

    test.describe('under a light system', () => {
        test.use({ colorScheme: 'light' });

        test('should resolve to the light theme', async ({ page }) => {
            await page.goto('./');

            await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
        });
    });
});
