# Review

<!-- Reviewed 2026-10-16, against the living specs and the change's planning artifacts. -->

Read: `brief.md`, `proposal.md`, `specs/post-summaries/spec.md`, `specs/agent-content/spec.md`,
`design.md`, `tasks.md`, `.openspec.yaml`, `openspec/config.yaml`, the living spec inventory
(`agent-content`, `brand-mascot`, `site-chrome`, `theming`, `typography`), the living
`agent-content` spec in full, `.prettierrc.json`, `.prettierignore`, `mise.toml`,
`src/components/seo/meta-og/MetaOgArticle.astro`, and `src/utils/mdxToMarkdown.ts`.
`openspec validate add-tldr --strict` passes.

This round re-checks the previous review. Its one Blocking finding is fixed:
`node_modules/.bin/prettier --check openspec/changes/add-tldr/` now reports "All matched files use
Prettier code style!", so the `format:check` verify steps (tasks 1.6, 2.2, 2.5, 3.2, 3.4, 3.5) and
the preflight run in task 4.1 no longer fail on the change's own planning files. The revision
changed nothing else of substance. The five nits from the previous review are still open and are
repeated below; this round found one new nit.

The facts that the previous review confirmed still hold, and are not repeated as findings: the Astro
glob loader accepts a negated pattern array, the minute-count rounding matches `reading-time` 1.5,
`../heroImage.jpg` resolves against `<slug>/tldr/`, `BaseLayout` emits no robots meta of its own,
and the preflight gate does not run the e2e suite.

## Findings

### Untestable scenarios

**Blocking:** none.

**Should-fix:** none.

**Nits:**

- `specs/post-summaries/spec.md:43-46` ("A TL;DR is not a post", repeated). The THEN "does not
  appear as a post anywhere a post appears" names no observable surface, and "anywhere" has no
  limit that a test can reach. The concrete surfaces are already covered by
  `specs/post-summaries/spec.md:161-176` (listings, feed) and `specs/agent-content/spec.md:25-29`,
  `:94-98` (`llms.txt`). **Fix:** name the surfaces ("not a separate entry on `/blog`, on the home
  page, in `rss.xml`, or under `## Blog posts` in `llms.txt`"), or remove the scenario.
- `specs/post-summaries/spec.md:40` (repeated). "after the post is renamed" does not produce an
  orphan: the `tldr/` folder is inside the post folder, so a rename moves it with the post. An
  orphan comes from removing the post's `index.mdx` while its folder stays. **Fix:** "for example
  after the post's source file is removed".

### Requirements that contradict the living specs

No finding. The MODIFIED "Existing reader and crawler contracts are preserved"
(`specs/agent-content/spec.md:116-140`) carries the full block and all three living scenarios
unchanged, and its new sentence allows the `tldr` metadata key and the `## Post summaries` section.
The TL;DR Markdown version names the TL;DR page, a human-readable page, as canonical, so "each SHALL
name the human-readable page as its canonical source" still holds. The living "Existing index
content preserved" scenario stays true, because the change only adds a section to `llms.txt`. No
delta touches `site-chrome`, `theming`, `typography`, or `brand-mascot`.

### Tasks that use a primitive nobody establishes

No finding on primitives or tokens. `TldrLink` uses `text-accent-ink`, which `base.css` exposes
through `--color-accent-ink`; the utilities and components that tasks 2.1 and 2.2 name exist in the
codebase or in `astro-feather`. No task uses a prototype primitive (`.btn`, `.tag`, `.card`, ...).

**Nits:**

- `design.md:197-198`, `tasks.md:80-81` (repeated). `MetaOgArticle` also requires `publishDate` and
  `tags` (`src/components/seo/meta-og/MetaOgArticle.astro:4-10`), and neither artifact names them.
  The type check catches the omission, but the implementer then has to pick values. **Fix:** say
  "the post's publish date and tags" in Decision 8 and task 2.2, as `ArticleLayout` passes them.
- `design.md:120-122`, `tasks.md:129-130` (repeated). Returning `frontmatter: ''` is half the edit:
  `src/utils/mdxToMarkdown.ts:195` starts the body at `rangeOf(frontmatterNode, slug).end`, so with
  no frontmatter block the body must start at offset 0. **Fix:** add "and the body starts at offset
  0" to Decision 5 and task 3.1.

### A missing tier decision

No finding. `design.md:183-186` (Decision 7) records **Interactivity tier: none** for `TldrLink`,
with the rationale, the ruled-out island and bundled `<script>`, and why the first frame is correct.
Task 2.1 names the tier once (`tasks.md:65-67`), and no other task names a different tier. The TL;DR
page has no interactive part.

### Unnamed scope

**Blocking:** none. The previous Prettier finding is fixed (see above).

**Should-fix:** none.

**Nits:**

- `proposal.md:80-87` (**Impact**, repeated). **Shared code** does not name `src/utils/tldr.ts`
  (the pairing helper, task 1.4), and **Checks and tests** does not name `tests/tldr.spec.ts` (task
  2.5). Both are new files the tasks create. **Fix:** add them.
- `tasks.md:119-125` with `tasks.md:182-186` (repeated). Task 2.6 says only the two screenshot tests
  fail until group 6. After task 4.3 deletes the fixture, the title and axe tests of
  `more-agents-same-mythical-month-tldr.spec.ts` and the per-TL;DR assertions stop running or fail
  too, until the human finishes task 5.1. Preflight does not run the e2e suite, so nothing breaks,
  but a `test:e2e:check` run in that window shows failures no task describes. **Fix:** in task 4.3,
  record that the whole TL;DR page spec fails until task 5.1.
- `design.md:251` (new). The line runs to about 150 characters where the rest of the file wraps at
  100, a leftover of the previous edit. Prettier accepts it, so it breaks no check. **Fix:** rewrap
  the bullet.

### A `skip_specs` claim that hides a behaviour change

No finding. `.openspec.yaml` does not set `skip_specs`, and the change carries deltas for both
capabilities it touches.

## Verdict

Ready for the human's proposal gate: no Blocking or Should-fix finding remains, and the six nits are
optional.
