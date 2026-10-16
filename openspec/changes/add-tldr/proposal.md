# Proposal

## Why

Most posts take 5 to 30 minutes to read. A reader who has one minute cannot get what a post
concludes without reading all of it, and has nothing short to pass on to someone else. The
`excerpt` does not fill the gap: it is a hook of about 40 words that says why to read a post, not
what the post concludes. An agent has the same problem: it must fetch the full post to learn what
the post says.

## What Changes

- A post can have an optional TL;DR: a short version of about a one-minute read, authored in full
  MDX at `src/content/blog/<slug>/tldr/index.mdx`, beside the post it summarises. Each TL;DR picks
  its own shape. About 300 words is an authoring guideline, not a build rule. Because its Markdown
  version uses the post converter, a TL;DR has the same syntax limit as a post: Markdown, imports,
  and `<BlogPostPicture>` only, with no other component, no expression, and no MDX comment.
- A new content collection holds the TL;DRs. Its frontmatter schema is strict and empty: the title,
  date, tags, hero image, and description all come from the parent post. A stray frontmatter key
  fails the build. A `tldr/` folder that has no parent post fails the build.
- The `blog` collection and the post Markdown version stop picking up `tldr/` files, so a TL;DR is
  never treated as a post.
- A new page at `/blog/<slug>/tldr/` shows the TL;DR. The page `<title>` is "TL;DR: <post title>".
  The page shows the post title, a meta row (the date and the TL;DR's own reading time), the link
  "Full post, N min read" at the top, and the link "Hooked? The full post takes N minutes." at the
  bottom. The page shows no hero image.
- The TL;DR page has its own canonical URL, `noindex, follow`, and is left out of the sitemap. Its
  Open Graph and Twitter cards reuse the post's hero image and excerpt.
- On a post that has a TL;DR, the meta row gets a third item after the reading time: an icon and
  the link "TL;DR in N min", in the `accent-ink` token. A post with no TL;DR does not change.
- Every minute count on both pages comes from the reading-time plugin. None is typed by hand.
- A Markdown version of each TL;DR at `/blog/<slug>/tldr/index.md`. Its metadata names the TL;DR
  page as canonical and links the post it summarises. The post's Markdown version links back to
  it. The TL;DR page advertises its Markdown version with `<link rel="alternate">`.
- `llms.txt` gets a new `## Post summaries` section, before `## Blog posts`, that lists the
  Markdown version of each TL;DR.
- `twins:check` also audits the TL;DR Markdown versions.
- The change ships with a real TL;DR for `more-agents-same-mythical-month`, so the feature is
  visible on merge and Verify has a real page to check. The human writes it on this branch after
  the machinery is in place and before Verify. No placeholder TL;DR is committed.

## Non-Goals

- No TL;DR content on the post page itself: no inline block, no `<details>` block, no view switch.
- No TL;DR links in the post listings (`/blog`, home) and no RSS item for a TL;DR.
- No change to the post URLs, to the `## Blog posts` section of `llms.txt`, or to the RSS feed.
  The post Markdown versions change only by the added link to the TL;DR.
- No metadata of a TL;DR's own, and no `description` override. The parent post supplies all of it.
- No fixed shape and no length rule for a TL;DR.
- No callout before the hero and no link at the end of the post.
- No client JavaScript. Both pages are static.
- The planned work does not author the TL;DR prose. Article prose stays out of OpenSpec: the
  implementer builds the machinery and stops, the human writes the TL;DR on this branch, and Verify
  runs against the human's text.

## Capabilities

### New Capabilities

- `post-summaries`: the optional TL;DR of a blog post — its page, how a reader reaches it from the
  post and returns to the post, how it relates to its parent post, and how it stays out of search
  results while it can still be shared.

### Modified Capabilities

- `agent-content`: adds the Markdown version of each TL;DR, the links between a post's Markdown
  version and its TL;DR's Markdown version, discovery of the TL;DR Markdown version from the TL;DR
  page, and the `## Post summaries` section of `llms.txt`. One existing requirement changes:
  "Existing reader and crawler contracts are preserved" now allows a document that agents already
  read (a post's Markdown version, `llms.txt`) to gain a new metadata key or a new section, while
  every URL, entry, and field it already holds stays unchanged.

## Impact

- **Content:** `src/content.config.ts` (narrower `blog` glob, new `tldr` collection), and a new
  `src/content/blog/more-agents-same-mythical-month/tldr/index.mdx` that the human authors.
- **Routes:** `src/pages/blog/[...slug].astro` (meta-row link), a new TL;DR page route,
  `src/pages/blog/[...slug].md.ts` (TL;DR Markdown versions, narrower raw-source glob, back-link),
  and `src/pages/llms.txt.ts`.
- **Shared code:** `src/utils/markdownTwin.ts` (TL;DR URLs), a new `src/utils/tldrPaths.ts` (the
  TL;DR page path and the sitemap predicate, with no aliased imports), `src/utils/mdxToMarkdown.ts`
  (a source with no frontmatter block), `src/utils/readingTimePlugin.ts` (a numeric minute
  count), a new meta-row component under `src/components/blog-posts/`.
- **Config:** `astro.config.ts` (sitemap filter).
- **Checks and tests:** `scripts/check-markdown-twins.mjs`, `tests/markdown-twins.spec.ts`, a new
  page spec for the TL;DR page, and new screenshot baselines for the TL;DR page and for the
  `more-agents-same-mythical-month` post page, whose meta row changes.
- **Docs:** `docs/architecture.md` (routing, content model), `docs/development/checks.md`
  (`twins:check`).
- **Dependencies:** none new. `astro-feather` already exports the icon.
- **CSP:** no change. No script, style source, or third-party resource is added.
- **Other changes:** none under `openspec/changes/` must merge first.
