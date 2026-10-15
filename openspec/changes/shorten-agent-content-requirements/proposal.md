# Proposal

## Why

OpenSpec 1.14.1 and later report a requirement longer than 500 characters as a warning, and
`openspec validate --all --strict` fails on that warning. Two `agent-content` requirements exceed
the limit, so `specs:check` and CI fail as soon as the OpenSpec pin moves past 1.13. A probe with
OpenSpec 1.14.2 fails on these two requirements only. Each one packs several behaviours into one
paragraph, so the fix is to split them, not to shorten them.

## What Changes

- Split "Markdown representations are faithful to the authored article" into two requirements:
    - "Markdown representations contain only the authored prose": derived from the source rather
      than from rendered HTML, no site chrome, no authoring-tool syntax.
    - "Markdown representations keep code samples and images intact": code exactly as authored,
      images as absolute URLs with their alternative text.
- Split "Agents can discover the Markdown representation" into two requirements:
    - "Agents can discover the Markdown representation from the post's page": the alternate link
      and the pointer to the index.
    - "Agents can discover the Markdown representation from the index": each post linked by its
      Markdown representation, and pages without one still linked as pages.
    - Both requirements keep the rule that discovery needs no guessed URL pattern.
- Every existing SHALL stays normative, in its present wording where the split allows. Each
  existing scenario moves, unchanged, under the new requirement it belongs to. No requirement
  text or scenario is added beyond that.
- The delta removes the two old requirements and adds the four new ones. The removal is not a
  loss of behaviour: each removed SHALL reappears in one of the added requirements.

## Non-Goals

- No change to site behaviour: no code, test, fixture, or built output changes.
- No change to the three other `agent-content` requirements, or to any other spec.
- No OpenSpec pin bump in `mise.toml`, no schema-fork reconciliation, and no regenerated Claude
  integration. Those follow as a routine tooling refresh after this change is archived.
- No direct edit of `openspec/specs/agent-content/spec.md`. The living spec changes only through
  the archive of this change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-content`: the requirements "Markdown representations are faithful to the authored
  article" and "Agents can discover the Markdown representation" are each replaced by two
  single-behaviour requirements, with the same normative content and the same scenarios.

## Impact

- Affected file at archive: `openspec/specs/agent-content/spec.md` only.
- No code, test, dependency, URL, feed, or header is affected. The `/blog/<slug>/` permalinks,
  `rss.xml`, the Markdown representations, and `llms.txt` stay as they are.
- No other change under `openspec/changes/` must merge first.
- The change lives on `chore/update-dependencies`, not on a `<type>/<change-name>` branch. The
  human waived the branch rule for this change so that it lands with the OpenSpec bump it
  unblocks.
