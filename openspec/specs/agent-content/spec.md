# agent-content Specification

## Purpose

Defines how the site exposes its writing in machine-readable form for AI agents and other
non-browser clients: a Markdown representation of each blog post, the metadata and licensing terms
those representations carry, and how an agent discovers them from an HTML page or from the site's
`llms.txt` index — without disturbing the contracts human readers and feed consumers depend on.

## Requirements

### Requirement: Markdown representation of every blog post

The site SHALL publish a Markdown representation of every published blog post at a stable,
predictable URL derived from that post's permalink. Every post SHALL have exactly one such
representation, and it SHALL be available without any request header, query parameter, or
negotiation on the client's part.

How that representation is identified to a client — the content type it is served with — is a
property of the serving layer rather than of the built artifact, and is out of scope here.

#### Scenario: Every post has a Markdown representation

- **WHEN** the site is built
- **THEN** each published blog post has a corresponding Markdown representation, and no post is
  missing one

#### Scenario: Reachable without negotiation

- **WHEN** a client requests the Markdown URL directly, sending no `Accept` header preference
- **THEN** the Markdown representation is returned

### Requirement: Markdown representations contain only the authored prose

The Markdown representation SHALL be derived from the authored article source rather than from
rendered HTML, and SHALL contain the article's prose only — no site chrome such as header,
navigation, footer, or theme controls. No authoring-tool syntax — component markup or module
imports — SHALL remain in the output.

#### Scenario: No site chrome

- **WHEN** an agent reads a post's Markdown representation
- **THEN** it contains the article's prose and no header, navigation, footer, or theme-control
  content

#### Scenario: No authoring syntax leaks

- **WHEN** an agent reads any post's Markdown representation
- **THEN** it contains no component markup and no module import statements

### Requirement: Markdown representations keep code samples and images intact

In the Markdown representation, code samples SHALL be reproduced exactly as authored, including
any markup that appears inside them. Images that appear in the article SHALL be represented as
standard Markdown images whose targets are absolute URLs resolvable outside the site, and SHALL
retain their alternative text.

#### Scenario: Code samples are untouched

- **WHEN** an article contains a fenced code sample that itself contains markup resembling component
  syntax
- **THEN** that sample appears in the Markdown representation exactly as authored, unmodified

#### Scenario: Images become resolvable Markdown images

- **WHEN** an article embeds an image
- **THEN** the Markdown representation renders it as a Markdown image with its alternative text and
  an absolute URL that resolves to the published image

### Requirement: Markdown representations carry metadata and licensing terms

Each Markdown representation SHALL begin with structured metadata identifying at least the article's
title, summary, publication date, tags, hero image, and the canonical URL of the human-readable page.
Any image the metadata names SHALL be an absolute URL resolvable outside the site, not a path
relative to the article's source. The metadata SHALL also state the copyright and attribution terms,
so that the terms travel with the content when it is consumed detached from the site.

#### Scenario: Metadata present

- **WHEN** an agent reads a post's Markdown representation
- **THEN** it finds the title, summary, publication date, tags, hero image, and canonical page URL in
  structured metadata at the top of the file

#### Scenario: Metadata images resolve away from the site

- **WHEN** an agent reads a post's Markdown representation away from the origin
- **THEN** the hero image it names is an absolute URL that resolves to the published image

#### Scenario: Terms travel with the content

- **WHEN** an agent reads a post's Markdown representation
- **THEN** the copyright and attribution terms are stated within that file, consistent with the terms
  published in the site's `llms.txt`

### Requirement: Agents can discover the Markdown representation from the post's page

A post's own HTML page SHALL advertise the post's Markdown URL as an alternate representation of
itself, and SHALL point to the site's machine-readable index. Discovery from the page SHALL NOT
require the agent to guess a URL pattern.

#### Scenario: Discoverable from the HTML page

- **WHEN** an agent fetches a post's HTML page
- **THEN** the page advertises that post's Markdown URL as an alternate `text/markdown`
  representation

#### Scenario: The page points at the index

- **WHEN** an agent fetches a post's HTML page
- **THEN** the page also points to the site's `llms.txt`, so an agent arriving at any single post
  can reach the index describing the rest

### Requirement: Agents can discover the Markdown representation from the index

The site's machine-readable index SHALL link each post by its Markdown representation rather than
by the page a human reads. Entries in the index for pages that have no Markdown representation
SHALL continue to link those pages themselves. Discovery from the index SHALL NOT require the
agent to guess a URL pattern.

#### Scenario: Discoverable from the index

- **WHEN** an agent fetches the site's `llms.txt`
- **THEN** each listed post entry links that post's Markdown representation, and its summary is
  retained

#### Scenario: Pages without a Markdown representation still listed

- **WHEN** an agent fetches the site's `llms.txt`
- **THEN** entries for pages that have no Markdown representation still link those pages

#### Scenario: Existing index content preserved

- **WHEN** an agent fetches `llms.txt` after this change
- **THEN** the site summary, page listings, licensing note, and feed and sitemap references it
  carried before are still present

### Requirement: Existing reader and crawler contracts are preserved

Adding Markdown representations SHALL NOT change any URL, feed, or document that readers, feed
consumers, or search engines already rely on. The Markdown URLs are additive. A document that agents
already read, such as a post's Markdown representation or `llms.txt`, MAY gain a new metadata key or
a new section. Every URL, entry, and metadata field that such a document already holds SHALL stay
unchanged. Because Markdown representations duplicate article content, they SHALL NOT be advertised
to search engines as indexable destinations, and each SHALL name the human-readable page as its
canonical source.

#### Scenario: Permalinks and feed unchanged

- **WHEN** a reader or feed consumer requests an existing article permalink or the RSS feed
- **THEN** it responds exactly as it did before this change, with no altered or broken URLs

#### Scenario: Twins stay out of the sitemap

- **WHEN** a search engine reads the site's sitemap
- **THEN** the sitemap lists the human-readable pages and does not list the Markdown
  representations

#### Scenario: Canonical page identified

- **WHEN** any client reads a post's Markdown representation
- **THEN** that file names the corresponding human-readable page URL as canonical

### Requirement: Markdown representation of every TL;DR

The site SHALL publish a Markdown representation of every TL;DR at `/blog/<slug>/tldr/index.md`,
available without any request header, query parameter, or negotiation. It SHALL follow the rules for
a post's Markdown representation: authored prose only, code samples and images intact, and the
copyright and attribution terms included.

#### Scenario: Every TL;DR has a Markdown representation

- **WHEN** the site is built
- **THEN** each TL;DR page has a corresponding Markdown representation, and no TL;DR is missing one

#### Scenario: Same content rules as a post

- **WHEN** an agent reads a TL;DR's Markdown representation
- **THEN** it contains the TL;DR's prose with no site chrome, no component markup, and no module
  import statements; any image is a Markdown image with its alternative text and an absolute URL
  that resolves to the published image; and the copyright and attribution terms are stated in the
  file

#### Scenario: A TL;DR is not listed as a post

- **WHEN** the site is built
- **THEN** the `## Blog posts` section of `llms.txt` lists no TL;DR Markdown representation, and
  every post Markdown representation names a `/blog/<slug>/` page as canonical

### Requirement: TL;DR Markdown metadata names its page and its post

A TL;DR's Markdown representation SHALL begin with structured metadata that names the TL;DR page as
canonical, links the post it summarises, and gives the post's title, summary, publication date,
tags, and hero image. The hero image SHALL be an absolute URL that resolves away from the site.

#### Scenario: Canonical is the TL;DR page

- **WHEN** an agent reads a TL;DR's Markdown representation
- **THEN** its metadata names `/blog/<slug>/tldr/` on the site's origin as canonical

#### Scenario: Links the full post

- **WHEN** an agent reads a TL;DR's Markdown representation
- **THEN** its metadata gives an absolute URL to the Markdown representation of the post it
  summarises

#### Scenario: Post metadata carried

- **WHEN** an agent reads a TL;DR's Markdown representation
- **THEN** it finds the post's title, summary, publication date, tags, and hero image as an absolute
  URL in the metadata at the top of the file

### Requirement: A post's Markdown representation links its TL;DR

When a post has a TL;DR, the post's Markdown representation SHALL give, in its metadata, an absolute
URL to the TL;DR's Markdown representation, under the metadata key `tldr`. The Markdown
representation of a post with no TL;DR SHALL have no `tldr` key in its metadata.

#### Scenario: Post with a TL;DR

- **WHEN** an agent reads the Markdown representation of a post that has a TL;DR
- **THEN** its metadata gives an absolute URL to that TL;DR's Markdown representation

#### Scenario: Post without a TL;DR

- **WHEN** an agent reads the Markdown representation of a post that has no TL;DR
- **THEN** its metadata has no `tldr` key

### Requirement: Agents can discover the TL;DR Markdown representation from the TL;DR page

A TL;DR page SHALL advertise its own Markdown representation as an alternate `text/markdown`
representation, and SHALL point to the site's `llms.txt`.

#### Scenario: Discoverable from the TL;DR page

- **WHEN** an agent fetches a TL;DR page
- **THEN** the page advertises `/blog/<slug>/tldr/index.md` as an alternate `text/markdown`
  representation, and points to `/llms.txt`

### Requirement: The index lists post summaries before the posts

When at least one TL;DR exists, the site's `llms.txt` SHALL have a `## Post summaries` section,
before `## Blog posts`, with one entry for each TL;DR that links its Markdown representation. The
`## Blog posts` section SHALL list each post once, linked by its Markdown representation, and SHALL
list no TL;DR. With no TL;DR, `llms.txt` SHALL have no such section.

#### Scenario: Summaries listed first

- **WHEN** an agent fetches `llms.txt` and at least one TL;DR exists
- **THEN** a `## Post summaries` section comes before `## Blog posts`, and each TL;DR has one entry
  that links the absolute URL of its Markdown representation and names the post it summarises

#### Scenario: Blog posts section lists posts only

- **WHEN** an agent fetches `llms.txt`
- **THEN** each post appears once in `## Blog posts`, linked by its Markdown representation, and no
  TL;DR Markdown representation appears in that section

#### Scenario: No TL;DRs

- **WHEN** no post has a TL;DR
- **THEN** `llms.txt` has no `## Post summaries` section

### Requirement: TL;DR Markdown representations stay out of the sitemap

A TL;DR's Markdown representation SHALL NOT be listed in the sitemap.

#### Scenario: Not in the sitemap

- **WHEN** a search engine reads the sitemap
- **THEN** it lists no TL;DR Markdown representation
