import { SITE_METADATA } from '@consts';

// The one place the twin URLs are derived. Three surfaces advertise them — the endpoint that emits
// them, `llms.txt`, and the `alternate` link in `ArticleLayout` — and they agree by construction
// rather than by three authors remembering the same shape.

// The `slug` rest parameter of `src/pages/blog/[...slug].md.ts`. It matches slashes, so appending
// `/index` to the post's id puts the twin inside the post's own directory.
const markdownTwinRouteParam = (postId: string): string => `${postId}/index`;

// The llms.txt convention puts a page's Markdown twin at the page's own URL with `.md` appended, and
// at `index.md` for a URL with no filename. This site's post URLs are directories, so the twin sits
// beside the `index.html` it mirrors. Built from the route parameter above, so the URL advertised
// and the URL generated cannot drift apart.
const markdownTwinPath = (postId: string): string => `/blog/${markdownTwinRouteParam(postId)}.md`;

// The trailing-slash form the page's own `rel="canonical"` declares, which is the directory the twin
// sits in.
const postPagePath = (postId: string): string => `/blog/${postId}/`;

// Stated in `llms.txt` and repeated in every twin's frontmatter, so the terms travel with the file
// when it is read detached from the site.
const ATTRIBUTION = `Content is © ${SITE_METADATA.AUTHOR.NAME}, all rights reserved. Quote briefly with attribution and a link to the canonical URL.`;

export { ATTRIBUTION, markdownTwinPath, markdownTwinRouteParam, postPagePath };
