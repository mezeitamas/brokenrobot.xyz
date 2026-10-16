import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// The behaviour of `openspec/changes/add-tldr/specs/post-summaries/spec.md`, asserted for every
// TL;DR found on disk. The tests assert no text of a TL;DR itself, so they hold for any TL;DR.

const BLOG_SOURCE = 'src/content/blog';
const ORIGIN = 'https://www.brokenrobot.xyz';

const SLUGS = readdirSync(BLOG_SOURCE, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

const TLDR_SLUGS = SLUGS.filter((slug) => existsSync(join(BLOG_SOURCE, slug, 'tldr', 'index.mdx')));
const PLAIN_SLUGS = SLUGS.filter((slug) => !TLDR_SLUGS.includes(slug));

const metaContent = async (page: Page, selector: string): Promise<string | null> =>
    page.locator(selector).getAttribute('content');

// The "N" of an "N min …" text in the page's article header.
const minutesIn = async (page: Page, pattern: RegExp): Promise<number> => {
    const text = (await page.locator('article header').innerText()).match(pattern)?.[1];

    expect(text, `${pattern} appears in the header`).toBeDefined();

    return Number(text);
};

test.describe('TL;DR', () => {
    test('should be linked from its post page, with the TL;DR page reading time', async ({ page }) => {
        for (const slug of TLDR_SLUGS) {
            await page.goto(`./blog/${slug}/`);

            const link = page.locator('article header a[href$="/tldr/"]');

            await expect(link, `${slug} links its TL;DR`).toHaveAttribute('href', `/blog/${slug}/tldr/`);

            const linked = Number((await link.innerText()).match(/^TL;DR in (\d+) min$/)?.[1]);

            await page.goto(`./blog/${slug}/tldr/`);

            expect(await minutesIn(page, /(\d+) min read/), `${slug} TL;DR reading time`).toBe(linked);
        }
    });

    test('should describe itself with the post metadata', async ({ page }) => {
        for (const slug of TLDR_SLUGS) {
            await page.goto(`./blog/${slug}/`);

            const title = await page.locator('article h1').innerText();
            const postImage = await metaContent(page, 'meta[property="og:image"]');
            const excerpt = await metaContent(page, 'meta[property="og:description"]');

            await page.goto(`./blog/${slug}/tldr/`);

            await expect(page, `${slug} title`).toHaveTitle(new RegExp(`^TL;DR: ${title}`));
            await expect(page.locator('article h1'), `${slug} heading`).toHaveText(title);
            await expect(page.locator('article img[loading="eager"], article header img')).toHaveCount(0);
            await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
            await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${ORIGIN}/blog/${slug}/tldr/`);

            expect(await metaContent(page, 'meta[property="og:title"]'), `${slug} og:title`).toBe(`TL;DR: ${title}`);
            expect(await metaContent(page, 'meta[property="og:description"]'), `${slug} og:description`).toBe(excerpt);
            expect(await metaContent(page, 'meta[property="og:url"]'), `${slug} og:url`).toBe(
                `${ORIGIN}/blog/${slug}/tldr/`
            );
            expect(await metaContent(page, 'meta[property="og:image"]'), `${slug} og:image`).toBe(postImage);
            expect(postImage, `${slug} og:image is absolute`).toMatch(/^https?:\/\//);
        }
    });

    test('should link back to the full post at the top and the bottom, with the post reading time', async ({
        page
    }) => {
        for (const slug of TLDR_SLUGS) {
            await page.goto(`./blog/${slug}/`);

            const postMinutes = await minutesIn(page, /(\d+) min read/);

            await page.goto(`./blog/${slug}/tldr/`);

            const top = page.locator('article header a[href="/blog/' + slug + '/"]');
            const bottom = page.locator('article footer a[href="/blog/' + slug + '/"]');

            await expect(top, `${slug} top link`).toHaveText(`Full post, ${postMinutes} min read`);
            await expect(bottom, `${slug} bottom link`).toHaveText(
                `Hooked? The full post takes ${postMinutes} ${postMinutes === 1 ? 'minute' : 'minutes'}.`
            );
        }
    });

    test.describe('with JavaScript disabled', () => {
        test.use({ javaScriptEnabled: false });

        test('should still show the link, the content, and both links to the post', async ({ page }) => {
            for (const slug of TLDR_SLUGS) {
                await page.goto(`./blog/${slug}/`);

                await expect(page.locator('article header a[href$="/tldr/"]'), `${slug} link`).toBeVisible();

                await page.goto(`./blog/${slug}/tldr/`);

                await expect(page.locator('article section'), `${slug} content`).not.toBeEmpty();
                await expect(page.locator(`article a[href="/blog/${slug}/"]`), `${slug} links`).toHaveCount(2);
            }
        });
    });

    test('should not appear on a post without a TL;DR', async ({ page }) => {
        for (const slug of PLAIN_SLUGS.slice(0, 1)) {
            await page.goto(`./blog/${slug}/`);

            await expect(page.locator('a[href*="/tldr/"]'), `${slug} has no TL;DR link`).toHaveCount(0);
        }
    });

    test('should stay out of the sitemap', async ({ request }) => {
        const sitemap = await (await request.get('./sitemap-0.xml')).text();

        expect(sitemap).not.toContain('/tldr/');
    });

    for (const path of ['./blog', './']) {
        test(`should stay out of the listing at ${path}`, async ({ page }) => {
            await page.goto(path);

            const hrefs = await page
                .locator('a[href^="/blog/"]')
                .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
            const postHrefs = hrefs.filter((href) => /^\/blog\/[^/]+\/$/.test(href));

            expect(new Set(postHrefs).size, 'no post appears twice').toBe(postHrefs.length);

            for (const href of postHrefs) {
                expect(SLUGS, `${href} is a post`).toContain(href.split('/')[2]);
            }

            expect(hrefs.filter((href) => href.includes('/tldr/'))).toEqual([]);
        });
    }

    test('should stay out of the feed', async ({ request }) => {
        const feed = await (await request.get('./rss.xml')).text();

        expect(feed.match(/<item>/g)?.length ?? 0).toBe(SLUGS.length);
        expect(feed).not.toContain('/tldr');
    });
});
