# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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
