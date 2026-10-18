# post-summaries Specification

## Purpose

Defines the optional TL;DR of a blog post: a short version that a reader can find from the post,
read on its own, share by its own link, and leave for the full post at any point, without the
TL;DR competing with its post in search results.

## Requirements

### Requirement: A post can have one optional TL;DR page

A blog post SHALL have zero or one TL;DR. Each TL;DR SHALL have its own page at
`/blog/<slug>/tldr/`, where `<slug>` is the slug of its post. A post that has no TL;DR SHALL have no
TL;DR page. Adding a TL;DR SHALL NOT change the post's URL.

#### Scenario: A post with a TL;DR

- **WHEN** a post has a TL;DR and the site is built
- **THEN** the TL;DR page is available at `/blog/<slug>/tldr/`, and the post is still available at
  `/blog/<slug>/`

#### Scenario: A post without a TL;DR

- **WHEN** a post has no TL;DR and the site is built
- **THEN** no page exists at `/blog/<slug>/tldr/`

### Requirement: A TL;DR takes its metadata from its post

A TL;DR SHALL take its title, publication date, tags, hero image, and description from its post. The
build SHALL fail when a TL;DR declares metadata of its own, and SHALL fail when a TL;DR has no post.

#### Scenario: A TL;DR declares its own metadata

- **WHEN** a TL;DR declares any metadata field, for example a title
- **THEN** the build fails and names the TL;DR

#### Scenario: A TL;DR has no post

- **WHEN** a TL;DR exists for a slug that has no post, for example after the post's source file is
  removed
- **THEN** the build fails and names the TL;DR

#### Scenario: A TL;DR is not a post

- **WHEN** the site is built with a TL;DR present
- **THEN** the TL;DR is not a separate entry on `/blog`, on the home page, in `rss.xml`, or under
  `## Blog posts` in `llms.txt`

### Requirement: The TL;DR page shows the short version and the way back to the post

The TL;DR page SHALL have the document title "TL;DR: <post title>". It SHALL show the post title as
its heading, a meta row with the post's publication date and the TL;DR's own reading time, the
TL;DR content, and a link to the full post at the top and at the bottom. It SHALL NOT show the hero
image.

#### Scenario: Page title and heading

- **WHEN** a reader opens the TL;DR page of the post "More Agents, Same Mythical Month"
- **THEN** the document title is "TL;DR: More Agents, Same Mythical Month", and the page heading is
  "More Agents, Same Mythical Month"

#### Scenario: Meta row

- **WHEN** a reader opens a TL;DR page
- **THEN** the meta row shows the post's publication date and the reading time of the TL;DR, not of
  the full post

#### Scenario: Link to the full post at the top

- **WHEN** a reader opens a TL;DR page for a post that takes 25 minutes to read
- **THEN** a link "Full post, 25 min read" before the TL;DR content leads to `/blog/<slug>/`

#### Scenario: Link to the full post at the bottom

- **WHEN** a reader reaches the end of a TL;DR page for a post that takes 25 minutes to read
- **THEN** a closing link "Hooked? The full post takes 25 minutes." leads to `/blog/<slug>/`

#### Scenario: No hero image

- **WHEN** a reader opens a TL;DR page
- **THEN** the page shows no hero image

### Requirement: The post page links to its TL;DR

The page of a post that has a TL;DR SHALL show a link to the TL;DR as the third item of its meta
row, after the reading time: an icon and the text "TL;DR in <N> min", where N is the TL;DR's reading
time. The page of a post with no TL;DR SHALL NOT show the link.

#### Scenario: Post with a TL;DR

- **WHEN** a reader opens a post that has a TL;DR that takes 1 minute to read
- **THEN** the meta row shows, after the reading time, a link "TL;DR in 1 min" that leads to
  `/blog/<slug>/tldr/`

#### Scenario: Post without a TL;DR

- **WHEN** a reader opens a post that has no TL;DR
- **THEN** the meta row shows the date and the reading time only, and the page has no link to a
  `/tldr/` path

### Requirement: Reading times on TL;DR links are computed

Every minute count that the post page or the TL;DR page shows SHALL come from the same reading-time
calculation that gives the post's own reading time. No minute count SHALL be typed by hand. In the
closing link of the TL;DR page, a count of one SHALL read "1 minute", not "1 minutes". The short
forms "N min" and "N min read" do not change with the count.

#### Scenario: The TL;DR count matches the TL;DR page

- **WHEN** a reader compares a post page and its TL;DR page from the same build
- **THEN** the N in the post page's "TL;DR in N min" link equals the reading time on the TL;DR
  page's meta row

#### Scenario: The full-post count matches the post page

- **WHEN** a reader compares the post page and its TL;DR page
- **THEN** the full-post minute count on the TL;DR page equals the reading time on the post page

#### Scenario: Singular in the closing link

- **WHEN** a reader reaches the end of a TL;DR page for a post that takes 1 minute to read
- **THEN** the closing link reads "Hooked? The full post takes 1 minute."

### Requirement: TL;DR pages stay out of search results

A TL;DR page SHALL tell search engines not to index it and to follow its links. It SHALL name its
own URL as canonical, and the sitemap SHALL NOT list it, so that search engines send readers to the
full post.

#### Scenario: Robots directive

- **WHEN** a crawler fetches a TL;DR page
- **THEN** the page carries the robots directive `noindex, follow`

#### Scenario: Own canonical

- **WHEN** a crawler fetches a TL;DR page
- **THEN** the canonical URL the page names is `/blog/<slug>/tldr/` on the site's origin

#### Scenario: Not in the sitemap

- **WHEN** a search engine reads the sitemap
- **THEN** it lists the post pages and lists no TL;DR page

#### Scenario: Post page still indexable

- **WHEN** a crawler fetches a post page that has a TL;DR
- **THEN** the post page carries no `noindex` directive and stays in the sitemap

### Requirement: A shared TL;DR link shows a preview

A TL;DR page SHALL carry link-preview metadata so that a shared link shows a card. The card SHALL
use the post's hero image and the post's description, and SHALL use the page title
"TL;DR: <post title>".

#### Scenario: Preview card

- **WHEN** a social platform or a chat client reads a TL;DR page's link-preview metadata
- **THEN** it finds the title "TL;DR: <post title>", the post's description, an absolute URL to the
  post's hero image, and the TL;DR page URL

### Requirement: TL;DRs stay out of listings and the feed

A TL;DR SHALL NOT appear in the post listings or in the RSS feed. Each listing entry SHALL link the
full post at `/blog/<slug>/`. The feed SHALL have one item for each post and no link to a `/tldr/`
path.

#### Scenario: Listings link full posts only

- **WHEN** a reader opens `/blog` or the home page
- **THEN** no post appears twice, each listing entry links `/blog/<slug>/`, and no link leads to a
  `/tldr/` path

#### Scenario: Feed lists posts only

- **WHEN** a feed reader fetches `rss.xml`
- **THEN** it has one item for each post and no `/tldr/` link

### Requirement: TL;DR surfaces are accessible in both themes

The TL;DR page and the TL;DR link on the post page SHALL be readable and keyboard-operable in the
light and the dark theme, SHALL pass the automated accessibility checks that post pages pass, and
SHALL need no client-side script.

#### Scenario: Accessible in both themes

- **WHEN** the automated accessibility check runs on a TL;DR page and on its post page in the light
  and the dark theme
- **THEN** it reports no violations

#### Scenario: Works with no script

- **WHEN** a reader opens a post page or a TL;DR page with JavaScript turned off
- **THEN** the TL;DR link, the TL;DR content, and both links to the full post are present and work
