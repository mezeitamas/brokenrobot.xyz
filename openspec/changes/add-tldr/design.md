# Design

## Context

See proposal.md — **Why** for the motivation, and the two spec deltas for the required behaviour.
The current state that shapes the approach:

- `src/content.config.ts` defines one collection, `blog`, with the glob `**/[^_]*.{md,mdx}` over
  `src/content/blog`. A file at `<slug>/tldr/index.mdx` matches that glob today, so without a change
  it becomes a post with id `<slug>/tldr` and fails the post schema.
- `src/pages/blog/[...slug].astro` renders each post. Its meta row is `PublishDate` and
  `ReadingTime` in a `flex` row. `ReadingTime` shows `remarkPluginFrontmatter.minutesRead`, the text
  that `readingTimePlugin` writes (for example "25 min read"). No numeric count exists.
- `src/pages/blog/[...slug].md.ts` emits every post's Markdown version. It reads the raw source from
  `import.meta.glob('../../content/blog/**/*.mdx')`, passes the post's own frontmatter block through
  with `heroImage` and `canonical` edited, and resolves image specifiers against the post's folder.
  `mdxToMarkdown` throws when a source has no frontmatter block.
- `src/utils/markdownTwin.ts` is the one place where the Markdown-version URLs are derived. Its
  first line imports `@consts`, a tsconfig path alias. `astro.config.ts` imports its own plugins
  with relative paths only, and nothing shows that the config loader resolves the alias.
- `mdxToMarkdown` throws "unhandled MDX syntax" on every MDX node other than an import or a
  `<BlogPostPicture>`: another component, an expression, and an `{/* */}` comment (an
  `mdxFlowExpression`) all fail the build.
- `ArticleLayout.astro` adds the post's SEO: the `text/markdown` alternate, `describedby` to
  `llms.txt`, Open Graph, Twitter, and the JSON-LD `Article`. `BaseLayout.astro` emits
  `rel="canonical"` from `Astro.url` and has a `seo` slot.
- `@astrojs/sitemap` runs with no filter. It lists pages only, so the `.md` endpoints are already
  absent from the sitemap. A new TL;DR page would be listed.
- `scripts/check-markdown-twins.mjs` (`twins:check`) audits `dist/blog/<slug>/` one level deep.
- `public/robots.txt` disallows nothing.
- `astro-feather` exports `ZapIcon` and `FastForwardIcon` (checked in `node_modules/astro-feather`).
- `--accent-ink` exists in both themes, and Tailwind exposes it as `accent-ink` through
  `--color-accent-ink` in `base.css`. Prose links already use it through `--tw-prose-links`.

## Goals / Non-Goals

**Goals:**

- One helper pairs each TL;DR with its post, so every surface — the post page, the TL;DR page, the
  Markdown versions, and `llms.txt` — agrees on which posts have a TL;DR, and an orphan fails the
  build in one place.
- The TL;DR Markdown version reuses the post's Markdown pipeline, so it inherits the content rules
  of a post's Markdown version without a second implementation.
- Zero client JavaScript and no change to the CSP.

**Non-Goals:**

- No new layout abstraction shared by the post page and the TL;DR page. The TL;DR page composes
  `BaseLayout` and the existing SEO components directly.
- No change to `BaseLayout`, `ArticleLayout`, `robots.txt`, or the RSS route.
- No new design token. `accent-ink` exists.

## Decisions

### 1. A new `post-summaries` capability, not `site-chrome`

`site-chrome` owns the header and the footer that every page shares. A TL;DR is a content surface of
one post, with its own search and sharing rules. Putting it in `site-chrome` would make that spec a
catch-all. A new capability, `post-summaries`, owns the TL;DR page and the post-page link;
`agent-content` gets the Markdown side, because it already owns every Markdown version and
`llms.txt`.

### 2. A `tldr` collection beside `blog`, with a strict empty schema

`src/content.config.ts` gets a second collection:

- `tldr`: `glob({ pattern: '*/tldr/index.mdx', base: './src/content/blog' })` with the schema
  `z.object({}).strict()`. The glob loader drops the trailing `/index`, so an entry id is
  `<slug>/tldr`. A frontmatter key of any name fails the schema and so fails the build.
- `blog`: the pattern becomes `['**/[^_]*.{md,mdx}', '!**/tldr/**']`. The negation removes the
  TL;DR files and keeps every other file the current glob matches.

Alternatives: `*/index.{md,mdx}` for `blog` is stricter but also changes what the glob matches for
non-TL;DR files, which this change has no reason to touch. A `generateId` or a `parent` frontmatter
key was ruled out: the folder already names the parent, and the brief rules out any frontmatter.

A TL;DR file needs no frontmatter block at all. The author can write the prose and nothing else.

### 3. One pairing helper fails the build on an orphan

A new `src/utils/tldr.ts` exports `getPostsWithTldrs()` (name open to the implementer). It loads
both collections, strips `/tldr` from each TL;DR id to get the parent slug, and throws
`<id>: TL;DR has no post at src/content/blog/<slug>/index.mdx` when no post has that slug. It returns
a map from post id to TL;DR entry. Every route that needs to know about TL;DRs calls it, so the
first route to build throws, and the error names the folder.

The URL helpers do not go in `tldr.ts`. `markdownTwin.ts` already states that it is the one place
where twin URLs are derived, so every TL;DR URL is exported from it: `tldrPagePath(postId)` →
`/blog/<postId>/tldr/`, and `tldrTwinPath(postId)` → `/blog/<postId>/tldr/index.md`, built from a
`tldrTwinRouteParam(postId)` → `<postId>/tldr/index` in the same way `markdownTwinPath` is built
from `markdownTwinRouteParam`.

`tldrPagePath` and the sitemap predicate (Decision 9) are defined in a new
`src/utils/tldrPaths.ts` that has no aliased import, and `markdownTwin.ts` re-exports them.
`astro.config.ts` can then import the predicate from `tldrPaths.ts` with a relative path, and the
config loader never meets `@consts`. The predicate is built from `tldrPagePath`, so the URL the page
route builds and the URL the sitemap drops cannot drift apart.

### 4. Routes: a new page route, and the existing endpoint emits both kinds of Markdown version

- **Page:** `src/pages/blog/[slug]/tldr.astro`. With Astro's default `build.format: 'directory'` it
  builds to `/blog/<slug>/tldr/index.html`. Its `getStaticPaths` returns one path for each pair from
  the helper. It does not collide with `[...slug].astro`: no post id contains `/tldr`, and Astro
  ranks a route with more static segments first.
- **Markdown versions:** `src/pages/blog/[...slug].md.ts` keeps one endpoint for every Markdown
  version. `getStaticPaths` returns the posts as today and adds one path for each TL;DR, with the
  route parameter `<slug>/tldr/index`. The props carry a discriminant (`kind: 'post' | 'tldr'`).

    Alternative: a second endpoint file for TL;DRs. Ruled out: two routes would then generate `.md`
    paths under `/blog/`, so the paths would no longer come from one place, and a file named
    `index.md.ts` inside a `[slug]/tldr/` folder relies on how Astro names an `index` endpoint, which
    the current route avoids on purpose by appending `/index` to the parameter.

- **Raw sources:** the one glob `../../content/blog/**/*.mdx` becomes two named globs,
  `POST_SOURCES` (`../../content/blog/*/index.mdx`) and `TLDR_SOURCES`
  (`../../content/blog/*/tldr/index.mdx`), so a post lookup can never return a TL;DR source.

### 5. The TL;DR Markdown version reuses the post's frontmatter

`mdxToMarkdown` returns `frontmatter: ''` when the source has no frontmatter block, in place of
throwing, and the body then starts at offset 0 of the source, because the body start today is the
end of the frontmatter node. The post branch of the endpoint keeps its guard: it throws when a
post's frontmatter is empty, so a post still cannot lose its metadata.

The TL;DR branch builds its metadata from the **post's** raw frontmatter block, edited the same way
the post's Markdown version edits it. This reuses the free-text title and excerpt that Astro already
parses, so no new escaping path exists:

- `heroImage` → the absolute URL of the post's hero image.
- `canonical` → the absolute URL of the TL;DR page.
- `fullPost` → the absolute URL of the post's Markdown version (new key).

The body is `# TL;DR: <post title>`, the converted TL;DR prose, and the attribution line. Images
resolve against `<slug>/tldr/`, so `../heroImage.jpg` resolves to `<slug>/heroImage.jpg` through the
existing `IMAGES` map, which already covers the whole blog tree.

The post branch adds `tldr` → the absolute URL of the TL;DR's Markdown version when the post has a
TL;DR. The link goes in the metadata, not the body, because the `agent-content` requirement
"Markdown representations contain only the authored prose" covers the body.

Both new keys are camelCase, like `heroImage` and `publishDate`. They point at Markdown versions
rather than HTML pages, because the reader of these files is an agent; each file's `canonical`
already names the HTML page.

**The syntax limit is accepted.** Because the TL;DR uses the post converter, it has the same limit
as a post: Markdown, imports, and `<BlogPostPicture>` only. Any other component, any expression, and
any MDX comment fail the build with "unhandled MDX syntax". The brief's "full MDX" therefore means
"the MDX a post can use", not "any MDX". Every post already lives with this limit, and a second
converter for TL;DRs would be the second implementation that the goals rule out. The limit is
stated in the authoring guidance (task 1.6) so the human knows it before writing the TL;DR. When a
TL;DR needs a new component, the converter learns it the same way it would for a post.

### 6. A numeric minute count from the reading-time plugin

`readingTimePlugin` writes a second field, `minutesReadCount: number`, beside `minutesRead`. Both
come from the same `getReadingTime()` result: the count is
`Math.ceil(Number(stats.minutes.toFixed(2)))`, the rounding `reading-time` 1.5 uses for its `text`.
So "25 min read" and 25 always agree. The `DataMap`/frontmatter typing extends to match.

The post page needs the TL;DR's count, and the TL;DR page needs the post's count, so each page calls
`render()` on the other entry and reads `remarkPluginFrontmatter.minutesReadCount`. This is a
build-time cost only.

The copy uses the count as follows:

- Post page: "TL;DR in {n} min".
- TL;DR page, top: "Full post, {n} min read".
- TL;DR page, bottom: "Hooked? The full post takes {n} minutes.", with "minute" when n is 1.

The strings stay in the two components that render them. They are site copy, so they follow
`docs/brand.md`, and the brief settled them.

### 7. The post-page link is a static Astro component

A new `src/components/blog-posts/TldrLink.astro`, the same shape as `PublishDate` and `ReadingTime`:
a `flex items-center gap-2` row of `ZapIcon` and an `InternalLink` to the TL;DR page. The row carries
`text-accent-ink`, so the icon (which draws in `currentColor`) and the text share the `accent-ink`
token in both themes. The post page renders it as the third item of the meta row only when the
helper returns a TL;DR for the post.

`ZapIcon` over `FastForwardIcon`: a lightning bolt reads as "quick"; fast-forward reads as media
playback, and beside the clock icon it suggests skipping ahead in the same post.

**Interactivity tier: none.** The link is plain server-rendered Astro with zero client JavaScript.
A Preact island and a bundled `<script>` were ruled out because nothing changes after the page
loads: the link exists or not at build time. The first frame is therefore correct, with no
hydration and so no flash.

### 8. The TL;DR page composes `BaseLayout` directly

`src/pages/blog/[slug]/tldr.astro` uses `BaseLayout` with `pageTitle` "TL;DR: <post title>" and
`pageDescription` set to the post's excerpt. `BaseLayout` already emits `rel="canonical"` from
`Astro.url`, which is the TL;DR page's own URL. The `seo` slot adds:

- `<meta name="robots" content="noindex, follow">`.
- `<link rel="alternate" type="text/markdown" href={tldrTwinPath(slug)}>` and
  `<link rel="describedby" href="/llms.txt">`, as `ArticleLayout` does for a post.
- `MetaOgArticle` and `MetaTwitter` with the title "TL;DR: <post title>", the post's excerpt, and
  the post's `heroImage.src`. `MetaOgArticle` also gets the post's `publishDate` and `tags`, as
  `ArticleLayout` passes them. `og:url` comes from `Astro.url`, so it is the TL;DR page.

No JSON-LD `Article`. The page is `noindex`, so rich results bring nothing, and a second `Article`
with the post's headline and date would describe the same article twice.

Alternative: reuse `ArticleLayout` with new props. Ruled out: it would need a switch for the
alternate link, the robots directive, the title, and the JSON-LD, and every switch is a way to break
the post page, which is a stable contract.

The body is an `<article>`: a `<header>` with the post title as `<h1>`, the meta row
(`PublishDate` with the post's date, `ReadingTime` with the TL;DR's `minutesRead`), and the top link;
then the rendered TL;DR `<Content />`; then the closing link. Both links use `InternalLink` to
`/blog/<slug>/`.

### 9. The sitemap filter

`astro.config.ts` passes `sitemap({ filter })` with a filter that drops any URL whose path ends in
`/tldr/` under `/blog/`. The predicate lives in `src/utils/tldrPaths.ts` beside `tldrPagePath`
(Decision 3), and `astro.config.ts` imports it with a relative path, as it imports
`readingTimePlugin`. `tldrPaths.ts` imports no tsconfig alias, so the config loader does not have to
resolve one. The TL;DR Markdown versions are endpoints, so the sitemap already leaves them out.

Alternative: keep the predicate in `markdownTwin.ts` and verify that the config loader resolves
`@consts`. Ruled out: it ties the build's first step to a loader behaviour that nothing documents.

`robots.txt` does not change. A `Disallow` for `/tldr/` would also stop the link-preview crawlers of
some platforms from reading the Open Graph tags, which would break the shared card.

### 10. `llms.txt` lists the summaries first

`src/pages/llms.txt.ts` adds `## Post summaries` between `## Pages` and `## Blog posts`, with one
entry for each TL;DR, newest post first, in the same shape as a post entry:
`- [TL;DR: <post title>](<absolute TL;DR Markdown URL>): <post excerpt>`. With no TL;DR, the section
and its heading are omitted, because an empty heading tells an agent nothing. The `## Blog posts`
lines do not change.

### 11. `twins:check` covers the TL;DRs

`scripts/check-markdown-twins.mjs` runs the same `problemsWith` audit on `dist/blog/<slug>/tldr/`
when that folder exists: a TL;DR page needs a non-empty Markdown version with parseable
frontmatter, and a Markdown version needs a page. The pass line reports the TL;DR count separately.
`docs/development/checks.md` describes the extended coverage.

## Risks / Trade-offs

- [The narrowed `blog` glob drops a post] → The `markdown-twins` e2e spec reads the slugs from the
  source folders and requests every post's twin and page, and `twins:check` audits every built post
  folder. An implementation task also records the number of built post folders from a build on the
  base commit, and later tasks compare against that recorded number, so no count is hard-coded.
- [A post twin or an existing `llms.txt` entry changes without notice] → The same base build keeps
  a copy of every post twin and of `llms.txt` in a scratch folder outside the repository. The
  Markdown-version and `llms.txt` tasks compare the new output against those copies with `diff`,
  so the "Existing reader and crawler contracts are preserved" requirement has a real baseline.
- [The real TL;DR does not exist while the machinery is built] → The human writes it after
  implementation and before Verify (brief — **Answers**). Implementation exercises the machinery
  with one temporary, uncommitted fixture that holds test text only, and deletes it before the
  hand-off. The fixture uses only syntax the converter accepts (Decision 5), so its "temporary"
  marker is a plain paragraph, not an MDX comment. The tests discover TL;DRs from disk and assert
  no TL;DR text, so they hold for the human's text. Screenshot baselines are generated only at
  Verify, against the real page.
- [Astro does not accept an MDX file with no frontmatter block against `z.object({}).strict()`] →
  The implementation verifies it with the fixture before any other task depends on it. The
  fallback is an empty `---\n---` block, which the strict schema still accepts.
- [A relative image in a TL;DR does not resolve on the page or in its Markdown version] → The
  resolution logic is the same as for a post's images, with `<slug>/tldr/` as the base. The real
  TL;DR may hold no image, so the fixture carries one relative image and proves the path.
- [Link-preview crawlers skip a `noindex` page] → The robots meta tag tells search engines not to
  index; it does not tell a preview crawler not to read the page. Facebook, LinkedIn, Slack, and
  similar crawlers fetch the page and read its Open Graph tags whatever its robots meta says, and
  `robots.txt` does not block them. This is recalled, not verified against each platform. A
  post-merge check with a preview debugger is the evidence; the build cannot prove it.
- [Two `render()` calls per page lengthen the build] → One TL;DR exists now, and only a post that
  has a TL;DR renders a second entry. Accepted.
- [The `TL;DR in 1 min` link draws the eye away from the post] → The brief chose the meta row as the
  only entry point, and it uses the same weight as the date and the reading time.

## Migration Plan

No migration. All URLs are additive, and a post without a TL;DR builds to the same output as
before, except the post Markdown version of `more-agents-same-mythical-month`, which gains the
`tldr` key, and `llms.txt`, which gains the `## Post summaries` section. The modified `agent-content`
requirement "Existing reader and crawler contracts are preserved" allows both additions, because no
existing URL, entry, or field changes. Rollback is a revert of the change's commits.
