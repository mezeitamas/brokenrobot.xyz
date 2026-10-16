# Spec Delta

## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Markdown representations are faithful to the authored article

**Reason**: The requirement exceeds the 500-character limit that OpenSpec 1.14.1 and later enforce
under `--strict`, and it states several behaviours in one paragraph.

**Migration**: Split, with no change in behaviour, into "Markdown representations contain only the
authored prose" and "Markdown representations keep code samples and images intact". Every SHALL
and every scenario moves to one of the two.

### Requirement: Agents can discover the Markdown representation

**Reason**: The requirement exceeds the 500-character limit that OpenSpec 1.14.1 and later enforce
under `--strict`, and it states several behaviours in one paragraph.

**Migration**: Split, with no change in behaviour, into "Agents can discover the Markdown
representation from the post's page" and "Agents can discover the Markdown representation from
the index". Every SHALL and every scenario moves to one of the two; both keep the rule that
discovery needs no guessed URL pattern.
