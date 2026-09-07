import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { test, expect } from '@playwright/test';

// The served-site layer of the twins' coverage: what an agent actually receives over HTTP, and
// whether it can find it from either entry point. Content faults are the transform's to catch at
// generation time, and coverage of `dist/` is `npm run twins:check`'s — this file asserts neither.
//
// The content type is deliberately not asserted. A prerendered endpoint writes only its body, so
// the type comes from whichever platform serves the build; a Playwright assertion would have proved
// only the preview server's MIME table.

const BLOG_SOURCE = 'src/content/blog';

const SLUGS = readdirSync(BLOG_SOURCE, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

// The post whose prose contains a fenced `<link>` sample — markup the HTML page escapes and the twin
// carries raw.
const FENCED_SAMPLE_SLUG = 'url-redirect-with-amazon-cloudfront-and-amazon-route-53';

const twinUrl = (slug: string): string => `./blog/${slug}/index.md`;

// Everything after the closing `---` of the frontmatter block.
const bodyOf = (twin: string): string => twin.slice(twin.indexOf('\n---\n', 3) + 5).trim();

// The first fenced block in a file, taken from the source rather than typed out here, so the
// assertion proves the twin matches what was authored rather than what a test author remembered.
const firstFencedBlock = (source: string): string => {
    const open = source.indexOf('```html');
    const close = source.indexOf('```', open + '```html'.length);

    return source.slice(open, close + 3);
};

test.describe('Markdown twins', () => {
    test('should exist for every post, carrying frontmatter, an H1, and no authoring syntax', async ({ request }) => {
        expect(SLUGS.length).toBeGreaterThan(0);

        for (const slug of SLUGS) {
            const response = await request.get(twinUrl(slug));

            expect(response.status(), `${slug} twin status`).toBe(200);

            const twin = await response.text();

            expect(twin.startsWith('---\n'), `${slug} opens with frontmatter`).toBe(true);

            const body = bodyOf(twin);

            expect(body.split('\n')[0], `${slug} body opens with an H1`).toMatch(/^# \S/);
            expect(body, `${slug} body has no import statement`).not.toMatch(/^import /m);
            expect(body, `${slug} body has no component markup`).not.toContain('<BlogPostPicture');
        }
    });

    test('should reproduce a fenced code sample exactly as authored', async ({ request }) => {
        const source = readFileSync(join(BLOG_SOURCE, FENCED_SAMPLE_SLUG, 'index.mdx'), 'utf8');
        const sample = firstFencedBlock(source);

        // Guards the guard: without this, an empty match would let the assertion below pass.
        expect(sample).toContain('<link');

        const twin = await (await request.get(twinUrl(FENCED_SAMPLE_SLUG))).text();

        expect(twin).toContain(sample);
    });

    test('should be discoverable from the post page', async ({ request }) => {
        for (const slug of SLUGS) {
            const html = await (await request.get(`./blog/${slug}/`)).text();

            expect(html, `${slug} advertises its twin`).toContain(
                `<link rel="alternate" type="text/markdown" href="/blog/${slug}/index.md">`
            );
            expect(html, `${slug} points at the index`).toContain('<link rel="describedby" href="/llms.txt">');
        }
    });

    test('should be discoverable from llms.txt', async ({ request }) => {
        const llms = await (await request.get('./llms.txt')).text();

        for (const slug of SLUGS) {
            expect(llms, `llms.txt lists ${slug} by its twin`).toContain(
                `](https://www.brokenrobot.xyz/blog/${slug}/index.md):`
            );
            expect(llms, `llms.txt does not list ${slug} by its page`).not.toContain(
                `](https://www.brokenrobot.xyz/blog/${slug}):`
            );
        }
    });

    test('should stay out of the sitemap', async ({ request }) => {
        const sitemap = await (await request.get('./sitemap-0.xml')).text();

        expect(sitemap).not.toContain('index.md');

        for (const slug of SLUGS) {
            expect(sitemap, `the sitemap still lists the ${slug} page`).toContain(
                `<loc>https://www.brokenrobot.xyz/blog/${slug}/</loc>`
            );
        }
    });
});
