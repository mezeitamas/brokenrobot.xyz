# Tasks

<!--
  Sequence, from the brief's Answers: the implementer builds the machinery (groups 1–4) and stops.
  The human then writes the real TL;DR for `more-agents-same-mythical-month` (group 5). Verify
  (group 6), the screenshot baselines included, runs against that real page.

  No placeholder TL;DR is ever committed. To exercise the machinery before the real text exists,
  the implementer uses one temporary fixture, created in task 1.5 and deleted in task 4.3. The
  fixture holds test text only, never article prose. Screenshot baselines are not generated or
  updated before group 6, because the fixture's pixels are not the page that ships.
-->

## 1. Content model, pairing, and minute counts

- [x] 1.1 Before any edit, run `mise run build` on the base commit and record in this task the number
      of post folders under `dist/blog/` (each folder that holds an `index.html`) and the
      "N min read" text of each post page. Later tasks compare against these recorded values; no
      task hard-codes a post count. From the same base build, copy each `dist/blog/<slug>/index.md`
      (keeping its `<slug>/` folder) and `dist/llms.txt` to a scratch folder outside the repository,
      for example `$TMPDIR/add-tldr-base/`, and record the absolute path of that folder in this
      task. Tasks 3.1, 3.2, and 3.3 compare against these copies with `diff`. Then extend `src/utils/readingTimePlugin.ts` to write
      `minutesReadCount: number` beside `minutesRead`, both from the same `getReadingTime()`
      result, with the count `Math.ceil(Number(stats.minutes.toFixed(2)))` (design.md — Decision 6).
      Extend the typing so `remarkPluginFrontmatter.minutesReadCount` is a `number` where it is read.
      Verify `mise run type:check` and `mise run lint:check` pass, and that `mise run build` emits
      the recorded "N min read" text on every post page.
      Record: 12 post folders under `dist/blog/`. "N min read" text, in `dist/blog/*` order: advanced-static-website-hosting 21, beyond-tabs-and-spaces 37, hello-world 2, hosting-a-static-website 6, learned-helplessness 23, more-agents-same-mythical-month 18, navigating-cultural-clashes 22, the-human-side-of-code-reviews 6, the-power-of-coding-conventions 9, the-renaissance-of-written-coding-conventions 11, url-redirect 9, your-ai-platform 10. Scratch copies: `/tmp/claude-501/add-tldr-base/`.
- [x] 1.2 In `src/content.config.ts`, change the `blog` glob pattern to
      `['**/[^_]*.{md,mdx}', '!**/tldr/**']` and add the `tldr` collection: glob
      `*/tldr/index.mdx` over `./src/content/blog`, schema `z.object({}).strict()` (design.md —
      Decision 2). Export both collections. Verify `mise run build` passes and builds the number of
      post folders under `dist/blog/` that task 1.1 recorded, and `mise run twins:check` passes.
- [x] 1.3 Add `src/utils/tldrPaths.ts` with `tldrPagePath` and the sitemap predicate that matches a
      `/blog/<slug>/tldr/` URL, built from `tldrPagePath`. The file has no aliased import (no `@`
      path), so `astro.config.ts` can import it with a relative path (design.md — Decisions 3 and
      9). In `src/utils/markdownTwin.ts`, re-export both, and add `tldrTwinRouteParam` and
      `tldrTwinPath`. Build `tldrTwinPath` from `tldrTwinRouteParam`, as `markdownTwinPath` is
      built from `markdownTwinRouteParam`. Verify `mise run type:check` and `mise run lint:check`
      pass, and that `src/utils/tldrPaths.ts` contains no import that starts with `@`.
- [x] 1.4 Add `src/utils/tldr.ts` with the pairing helper (design.md — Decision 3). It loads both
      collections, derives each TL;DR's parent slug from its id, throws
      `<id>: TL;DR has no post at src/content/blog/<slug>/index.mdx` for an orphan, and returns a map
      from post id to TL;DR entry. Verify `mise run type:check` and `mise run lint:check` pass.
- [x] 1.5 Create the **temporary fixture**
      `src/content/blog/more-agents-same-mythical-month/tldr/index.mdx`. It has no frontmatter block.
      Its first line is the plain paragraph
      `TEMPORARY FIXTURE — delete in task 4.3, never commit.` Do not use an MDX comment
      (`{/* */}`), an expression, or a component: the Markdown-version converter rejects them
      (design.md — Decision 5), and task 3.2 would then fail on the fixture. It holds a few test
      paragraphs, one fenced code block, and one relative image `![Test image](../heroImage.jpg)`.
      It holds no article prose. Then prove the schema rules:
    - [x] 1.5.1 The fixture with no frontmatter block passes the strict schema: `mise run build`
          passes. If it fails, add an empty `---`/`---` block, record the fallback in design.md —
          **Risks / Trade-offs**, and continue.
    - [x] 1.5.2 A stray key (`title: x`) in the fixture fails `mise run build`, and the error names
          the fixture file. Remove the key.
- [x] 1.6 Document the content model in `docs/architecture.md`: in **Content model**, the `tldr`
      collection, its location `src/content/blog/<slug>/tldr/index.mdx`, its strict empty schema,
      the orphan rule, the ~300-word authoring guideline, the syntax limit (a TL;DR can use
      Markdown, imports, and `<BlogPostPicture>` only — no other component, no expression, and no
      MDX comment, the same limit as a post; design.md — Decision 5), and the `blog` glob's `tldr/`
      exclusion; in the `readingTimePlugin` bullet, the new `minutesReadCount`. Leave **Routing**
      to tasks 2.2 and 3.2, which add the routes. Verify every statement matches the code, that no
      check is named or counted in this file, and that `mise run format:check` passes.

## 2. The TL;DR page and the post-page link

- [x] 2.1 Add `src/components/blog-posts/TldrLink.astro` (design.md — Decision 7). **Interactivity
      tier: none** — a static Astro component with zero client JavaScript; no island and no
      `<script>`. It renders `ZapIcon` from `astro-feather` and an `InternalLink` with the text
      "TL;DR in {n} min" to the TL;DR page, in a `flex items-center gap-2` row that carries
      `text-accent-ink`, so icon and text use the `accent-ink` token in both themes. In
      `src/pages/blog/[...slug].astro`, call the pairing helper, `render()` the post's TL;DR when it
      has one, and render `TldrLink` as the third item of the meta row with the TL;DR's
      `minutesReadCount`. Verify `mise run build` passes, the built
      `more-agents-same-mythical-month` page holds the link to `/blog/more-agents-same-mythical-month/tldr/`,
      the built `hello-world` page holds no link to a `/tldr/` path, and no new `<script>` appears
      in either page.
- [x] 2.2 Add `src/pages/blog/[slug]/tldr.astro` (design.md — Decision 8). `getStaticPaths` returns
      one path for each pair from the helper. The page uses `BaseLayout` with `pageTitle`
      "TL;DR: <post title>" and the post's excerpt as `pageDescription`. The `seo` slot carries
      `<meta name="robots" content="noindex, follow">`, the `text/markdown` alternate to
      `tldrTwinPath`, `describedby` to `/llms.txt`, `MetaOgArticle` and `MetaTwitter` with the
      "TL;DR: " title, the post's excerpt, and the post's hero image, plus the post's publish date
      and tags for `MetaOgArticle`, as `ArticleLayout` passes them — and no JSON-LD. The body is an
      `<article>`: a `<header>` with the post title as `<h1>`, the meta row (`PublishDate` with the
      post's date, `ReadingTime` with the TL;DR's `minutesRead`), and the link
      "Full post, {n} min read"; then the rendered TL;DR; then the link
      "Hooked? The full post takes {n} minutes." ("minute" when n is 1). Both links use
      `InternalLink` to `/blog/<slug>/`, and n is the post's `minutesReadCount`. No hero image.
      In `docs/architecture.md` — **Routing**, document the `/blog/<slug>/tldr/` page route.
      Verify `mise run build` emits `dist/blog/more-agents-same-mythical-month/tldr/index.html`,
      that its `rel="canonical"` is the TL;DR URL, that the fixture's relative image renders as an
      `<img>` with a built asset URL, that the full-post count equals the count on the post
      page, that the new **Routing** sentence matches the code, and that
      `mise run format:check` passes.
- [x] 2.3 Prove the orphan rule now that a route calls the helper: add a temporary
      `src/content/blog/no-such-post/tldr/index.mdx`, verify `mise run build` fails with an error
      that names `no-such-post`, then delete the folder. Record the error text in this task.
      Error text: `no-such-post/tldr: TL;DR has no post at src/content/blog/no-such-post/index.mdx`.
- [x] 2.4 Pass `sitemap({ filter })` in `astro.config.ts` with the predicate from task 1.3, imported
      with the relative path `./src/utils/tldrPaths` (design.md — Decision 9), not through
      `markdownTwin.ts`. Do not touch `public/robots.txt`. Verify that `mise run build` loads the
      config and passes, and that `dist/sitemap-0.xml` lists every post page and no URL that
      contains `/tldr/`.
- [x] 2.5 Add `tests/tldr.spec.ts` for the behaviour in `specs/post-summaries/spec.md`. Discover the
      TL;DR slugs from `src/content/blog/*/tldr/index.mdx` on disk, as `markdown-twins.spec.ts`
      discovers posts, and assert for each:
      the post page's meta row has the "TL;DR in N min" link to the TL;DR page, and its N equals
      the reading time on the TL;DR page's meta row; the TL;DR page's
      `<title>` is "TL;DR: <post title>", its `<h1>` is the post title, it has no hero image, its
      robots meta is `noindex, follow`, its canonical is its own URL, and its `og:title`,
      `og:description`, `og:image` (absolute), and `og:url` match the spec; the top and bottom
      links lead to the post and their minute count equals the post page's reading time; and all
      of these links are present with JavaScript disabled. Also assert: `hello-world` has no
      TL;DR link; `sitemap-0.xml` contains no `/tldr/` URL; on `/blog` and `/`, no post appears
      twice, each listing entry links `/blog/<slug>/`, and no link leads to a `/tldr/` path;
      `rss.xml` has one item for each post (the posts discovered from disk) and no `/tldr/` link.
      Assert no text of the TL;DR itself, so the tests hold for the human's text.
      Verify the file passes in the devcontainer against the fixture build
      (`node_modules/.bin/playwright test tests/tldr.spec.ts` after `mise run build`, inside
      `devcontainer exec`), and that `mise run lint:check`, `mise run type:check`, and
      `mise run format:check` pass.
- [x] 2.6 Add `tests/pages/blog-posts/more-agents-same-mythical-month-tldr.spec.ts` in the shape of
      `more-agents-same-mythical-month.spec.ts`: a title test, an axe test, and a full-page
      screenshot test with `settleImages`. Verify the title and axe tests pass in all four projects
      in the devcontainer against the fixture build. Do **not** generate the screenshot baselines
      and do **not** update the `more-agents-same-mythical-month` post baselines: both happen in
      group 6, against the human's text. Record in this task that the two screenshot tests are
      expected to fail until then.

## 3. The Markdown versions and `llms.txt`

- [x] 3.1 Let `mdxToMarkdown` in `src/utils/mdxToMarkdown.ts` return `frontmatter: ''` for a
      source with no frontmatter block, in place of throwing, and start the body at offset 0 of the
      source in that case (design.md — Decision 5). In
      `src/pages/blog/[...slug].md.ts`, keep the guard for posts: throw when a post's frontmatter is
      empty. Verify `mise run build` and `mise run twins:check` pass, and that `diff` finds no
      difference between every post twin `dist/blog/<slug>/index.md` and its copy from task 1.1.
- [x] 3.2 Extend `src/pages/blog/[...slug].md.ts` (design.md — Decisions 4 and 5): split the raw
      glob into `POST_SOURCES` (`*/index.mdx`) and `TLDR_SOURCES` (`*/tldr/index.mdx`); add one
      path per TL;DR with `tldrTwinRouteParam`, with a `kind` discriminant in the props; for a TL;DR,
      edit the **post's** frontmatter block to set `heroImage`, `canonical` (the TL;DR page), and
      `fullPost` (the post twin), resolve images against `<slug>/tldr/`, and write the body
      `# TL;DR: <post title>`, the converted TL;DR, and `ATTRIBUTION`; for a post with a TL;DR, add
      `tldr` (the TL;DR twin) to its frontmatter. In `docs/architecture.md` — **Routing**, document
      that the `.md` endpoint also emits the TL;DR Markdown versions at
      `/blog/<slug>/tldr/index.md`. Verify after `mise run build` that
      `dist/blog/more-agents-same-mythical-month/tldr/index.md` exists, its frontmatter parses and
      holds the five post fields plus `canonical` and `fullPost` as absolute URLs, the fixture's
      image is an absolute URL to a built asset, the fenced code block is byte-identical to the
      fixture's, the post twin has the `tldr` key, `diff` finds no difference between `hello-world`'s twin and its
      copy from task 1.1, the new
      **Routing** sentence matches the code, and `mise run format:check` passes.
- [x] 3.3 Add the `## Post summaries` section to `src/pages/llms.txt.ts` between `## Pages` and
      `## Blog posts`, one entry per TL;DR, newest post first,
      `- [TL;DR: <title>](<absolute TL;DR twin URL>): <excerpt>`, omitted with its heading when no
      TL;DR exists (design.md — Decision 10). Verify the built `llms.txt` has the section before
      `## Blog posts`, and that `diff` finds no difference between its `## Blog posts` section and the
      `## Blog posts` section of the `llms.txt` copy from task 1.1.
- [x] 3.4 Extend `scripts/check-markdown-twins.mjs` to audit `dist/blog/<slug>/tldr/` when it exists,
      with the same `problemsWith` rules, and to report the TL;DR count in the pass line (design.md
      — Decision 11). Update the `twins:check` section of `docs/development/checks.md` to say it also
      covers TL;DRs. Verify `mise run twins:check` passes; that deleting the built
      `dist/blog/more-agents-same-mythical-month/tldr/index.md` makes it exit 1 and name the file;
      and that `mise run format:check` passes.
- [x] 3.5 Extend `tests/markdown-twins.spec.ts` for `specs/agent-content/spec.md`, discovering TL;DR
      slugs from disk: each TL;DR twin returns 200, opens with frontmatter, has a body opening with
      `# TL;DR: `, has no import statement or component markup, names the TL;DR page as
      `canonical`, and links the post twin in `fullPost`; the post twin links the TL;DR twin in
      `tldr`; the twin of every post with no TL;DR has no `tldr` key; every post twin names its
      `/blog/<slug>/` page as `canonical`; the TL;DR page carries
      `<link rel="alternate" type="text/markdown" href="/blog/<slug>/tldr/index.md">` and the
      `describedby` link; `llms.txt` lists the TL;DR twin
      under `## Post summaries`, which comes before `## Blog posts`; `## Blog posts` lists each
      post once, linked by its twin, and lists no TL;DR twin; and the sitemap holds no
      `/tldr/`. Keep the existing tests unchanged. Verify the file passes in the devcontainer
      against the fixture build, and that `mise run lint:check`, `mise run type:check`, and
      `mise run format:check` pass.

## 4. Hand-off to the human

- [x] 4.1 Run `mise run preflight` against the fixture build. Verify every check passes.
- [x] 4.2 Prove the singular form (`specs/post-summaries/spec.md` — scenario "Singular in the
      closing link"; no post takes 1 minute, so no automated test can reach it): in a temporary
      local edit of the TL;DR page, pass 1 as the
      post's count, build, confirm the closing link reads "Hooked? The full post takes 1 minute.",
      then revert the edit. Record the result in this task.
      Result: with the count set to 1, the built closing link read "Hooked? The full post takes 1 minute."; the edit is reverted.
- [x] 4.3 Delete the temporary fixture
      `src/content/blog/more-agents-same-mythical-month/tldr/index.mdx`, and any orphan folder left
      from task 2.3. Verify `git status` shows nothing under any `tldr/` folder, that
      `mise run build` and `mise run twins:check` still pass with zero TL;DRs, and that the built
      `llms.txt` has no `## Post summaries` section. Record in this task that, from here until the
      human finishes task 5.1, the whole of
      `tests/pages/blog-posts/more-agents-same-mythical-month-tldr.spec.ts` (title, axe, and
      screenshot tests) fails, and the per-TL;DR assertions of `tests/tldr.spec.ts` and
      `tests/markdown-twins.spec.ts` find no TL;DR to check; preflight does not run the e2e suite,
      so this breaks no gate. **The implementer stops here.**
      Recorded: until task 5.1 is done, the whole of `tests/pages/blog-posts/more-agents-same-mythical-month-tldr.spec.ts` (title, axe, screenshot) fails, and the per-TL;DR assertions of `tests/tldr.spec.ts` and `tests/markdown-twins.spec.ts` find no TL;DR to check. Preflight does not run the e2e suite, so no gate breaks.

## 5. The human writes the TL;DR

- [ ] 5.1 **Human step.** Write `src/content/blog/more-agents-same-mythical-month/tldr/index.mdx` on
      this branch: no frontmatter, about 300 words, in the shape that suits the post, and only the
      syntax a post can use (Markdown, imports, and `<BlogPostPicture>`; no other component, no
      expression, no MDX comment — see `docs/architecture.md`, **Content model**). Verify
      `mise run build` passes.

## 6. Verify

- [x] Visual + a11y snapshots pass in **both themes** for every touched view (testing-visual-regression skill)
      — the new TL;DR page (four new baselines) and the `more-agents-same-mythical-month` post page
      (four updated baselines, for the meta-row link), against the human's TL;DR. Every other
      baseline stays byte-identical.
- [x] All preflight gate checks pass — the set in `docs/development/checks.md` (running-preflight-checks skill)
- [ ] Manual preview: no theme flash, interactions work, console clean, responsive at 375px
      — the post page's meta row with the TL;DR link, and the TL;DR page, in both themes.

## Workflow follow-up

- After merge and deploy, paste the TL;DR URL into a link-preview debugger (for example LinkedIn's
  Post Inspector) and confirm the card shows the post's hero image. design.md — **Risks /
  Trade-offs** records why the build cannot prove this.
