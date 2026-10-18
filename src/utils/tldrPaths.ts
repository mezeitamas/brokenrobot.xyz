// The TL;DR page URL and the sitemap predicate that drops it. Kept free of aliased imports so
// `astro.config.ts` can import it with a relative path: the config loader is not known to resolve
// tsconfig aliases. `markdownTwin.ts` re-exports `tldrPagePath`.

// The trailing-slash form the TL;DR page's own `rel="canonical"` declares.
const tldrPagePath = (postId: string): string => `/blog/${postId}/tldr/`;

// Built from the same `/blog/…/tldr/` shape as `tldrPagePath`, so the URL the page route builds and
// the URL the sitemap drops cannot drift apart.
const TLDR_PAGE_PATTERN = new RegExp(`^${tldrPagePath('[^/]+').replaceAll('/', '\\/')}$`);

const isNotTldrPage = (url: string): boolean => !TLDR_PAGE_PATTERN.test(new URL(url).pathname);

export { isNotTldrPage, tldrPagePath };
