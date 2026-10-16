# Brief

## Problem and goal

Most posts run from 1,300 to 7,300 words, or 5 to 30 minutes of reading. A reader who has one
minute has no way to get what a post says without reading all of it, and has nothing short to pass
on to someone else. The `excerpt` does not fill the gap: it is a ~40-word hook that says why to read
a post, not what the post concludes.

Once this is done, a post can offer a short version — about half a page, a one-minute read — that
a reader finds from the post, can read on its own, can share by its own link, and can leave for the
full post at any point. An agent can find and read the short version without fetching the full
post first.

## Decisions

- **Optional, per post.** Only some posts get a TL;DR. Each one picks its own shape (key claims for
  an essay, the steps in brief for a how-to). About 300 words is an authoring guideline, not a
  build rule.
- **Its own page, a companion of the post.** URL `/blog/<slug>/tldr/`, so it is linkable. It has its
  own canonical URL, `noindex, follow`, and is left out of the sitemap, so search keeps sending
  readers to the full post.
- **Source next to the post, in full MDX.** `src/content/blog/<slug>/tldr/index.mdx`, so the source
  path mirrors the URL and the author is not limited in what the TL;DR can contain. It has its own
  collection with a strict, empty frontmatter schema: title, date, tags, hero, and description all
  come from the parent post, and a stray key fails the build. A `tldr/` folder with no parent post
  fails the build.
- **Slim page.** Page `<title>` "TL;DR: <post title>". The page shows the post title, the meta row
  (date, the TL;DR's own reading time), and links to the full post at the top and bottom. No hero
  image on the page; the Open Graph card reuses the post's hero image.
- **Wording.** On the post page, a third item in the meta row, after the reading time: an icon and
  the link "TL;DR in 1 min", in `accent-ink`. On the TL;DR page, the top link "Full post, 25 min
  read" and the closing link "Hooked? The full post takes 25 minutes." Every minute count comes
  from the reading-time plugin, never typed by hand.
- **A Markdown version for agents.** `/blog/<slug>/tldr/index.md`, built the same way as the post's
  Markdown version. Its metadata names the TL;DR page as canonical and links the post it
  summarises; the post's Markdown version links back to it. The TL;DR page advertises its Markdown
  version with `<link rel="alternate">`.
- **`llms.txt`** gets a new `## Post summaries` section, before `## Blog posts`, that lists each
  TL;DR's Markdown version. Agents with a small context see the short versions first.
- **Ships with a real TL;DR** for `more-agents-same-mythical-month`, so the feature is visible on
  merge and Verify has a real page to check.

## Rejected directions

- **A fixed shape or a length rule for every post** — posts differ: essays and how-tos summarise
  differently.
- **TL;DR on the post page** (an inline block, a `<details>` block, or a TL;DR/full-post view
  switch) — the human wants a linkable URL. The view switch also needed JavaScript and risked a
  flash on load.
- **An indexed TL;DR page** — it would compete with its own post in search. **A canonical to the
  post** — a summary is not a duplicate, so search engines may ignore it.
- **A frontmatter field or a separate `src/content/tldr/` tree** — Markdown in YAML is clumsy; a
  separate tree drifts from its post and can be orphaned by a rename.
- **Plain `.md`** — limits what a TL;DR can contain.
- **Nesting TL;DRs under each post in `llms.txt`** — unverified that tools parse nested lists, and it
  would change the shape of the existing post lines. **Leaving them out of `llms.txt`** — an agent
  would fetch the full post just to learn that a summary exists.
- **A callout before the hero, or a link at the end of the post** — the callout makes the TL;DR the
  headline; the meta-row link alone was chosen.
- **TL;DR links in the post listings (`/blog`, home) or in RSS** — listings stay the way into the
  full post; a TL;DR is not a new post, so it gets no feed item. Both can be added later.
- **Own frontmatter metadata, or an optional `description` override** — duplicates the post and
  drifts; can be added later if a TL;DR needs its own preview text.

## Open questions and scope

Touches: the content collections, the `blog` collection's glob and the Markdown-version route's
raw-source glob (both must stop picking up `tldr/` files), a new TL;DR page route, the post page's
meta row, the Markdown-version pipeline, `llms.txt`, page head metadata (robots, canonical,
alternate, Open Graph), and the sitemap exclusion. The `agent-content` spec gains a requirement for
the TL;DR's Markdown version; the planner decides whether the page itself belongs in `site-chrome`
or a new capability.

Leaves alone: the post URLs, the existing post Markdown versions apart from the added link, the
`## Blog posts` section of `llms.txt`, the post listings, and the RSS feed.

To check during planning, not settled by Explore:

- Does `astro-feather` export a fitting icon (for example `ZapIcon` or `FastForwardIcon`)?
- Do Open Graph previews render for a `noindex` page? Recalled, not verified.
- Do images referenced from the nested `tldr/` folder (for example `../heroImage.jpg`) resolve, both
  on the page and in the Markdown version?
- The TL;DR prose for `more-agents-same-mythical-month` is article prose, which the project keeps
  out of OpenSpec. How does it enter the change so Verify has a real page, while the human writes
  the text?

## Answers

- **Who writes the TL;DR text for `more-agents-same-mythical-month`, and when?** Neither (a) nor
  (b). The human writes it on this branch, before the merge, after the machinery is in place. The
  implementer builds the machinery and stops before Verify; the human then adds
  `src/content/blog/more-agents-same-mythical-month/tldr/index.mdx`; Verify, including the
  screenshot baselines, runs against that real page. No placeholder TL;DR is committed. The change
  still ships with a real TL;DR.
