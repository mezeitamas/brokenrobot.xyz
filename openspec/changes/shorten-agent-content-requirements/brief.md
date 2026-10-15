# Brief

## Problem and goal

OpenSpec 1.14.1 and later report a requirement longer than 500 characters as a warning, and
`openspec validate --all --strict` fails on it. Two requirements in the `agent-content` spec exceed
that limit: "Markdown representations are faithful to the authored article" and "Agents can
discover the Markdown representation". Each one packs several behaviours into one paragraph. A
probe with OpenSpec 1.14.2 (`npx @fission-ai/openspec@1.14.2 validate --all --strict`) fails on
these two only; every other spec and the archive pass.

Once done, every `agent-content` requirement states one behaviour, the spec passes strict
validation under OpenSpec 1.14.2, and the site behaves exactly as before.

## Decisions

- **Split each requirement into two, one behaviour each.** It keeps every existing SHALL normative,
  in its present wording where possible, and it is the remedy the OpenSpec warning names.
  - "Faithful to the authored article" becomes: the content is the authored prose only (derived
    from the source rather than rendered HTML, no site chrome, no authoring-tool syntax); and code
    samples and images survive intact (code exactly as authored, images as absolute URLs with
    their alternative text).
  - "Agents can discover the Markdown representation" becomes: discoverable from the post's HTML
    page (the alternate link, and the pointer to the index); and discoverable from the index (each
    post linked by its Markdown representation, pages without one still linked as pages). The rule
    that discovery needs no guessed URL pattern stays.
  - The existing scenarios move, unchanged, under the requirement they belong to.
- **No behaviour change.** The change rewords the spec only; no code, test, or built output changes.
- **The change lives on `chore/update-dependencies`.** The human waived the `<type>/<change-name>`
  branch rule for this change, so that it lands with the OpenSpec bump it unblocks.

## Rejected directions

- **Shorten the text and let the scenarios carry the detail.** Some rules appear only in the
  requirement text, such as "derived from the source, not from rendered HTML" and "no URL
  guessing", so they would be lost or need new scenarios.
- **Edit the living spec directly, without a change.** No document says that a direct edit of
  `openspec/specs/` is allowed; specs change through archive.
- **Bump OpenSpec and fix the spec later.** `specs:check` and CI would fail in the meantime.

## Open questions and scope

- Touches only `openspec/specs/agent-content/spec.md`, through this change's spec delta.
- Leaves alone the three other `agent-content` requirements, every other spec, and all code.
- Out of scope: the OpenSpec pin bump in `mise.toml`, the schema-fork reconciliation, and the
  regenerated Claude integration. Those follow as a routine tooling refresh after this change is
  archived.

## Answers
