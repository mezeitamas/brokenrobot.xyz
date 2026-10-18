# Review

<!-- Reviewed 2026-10-16, against the living specs and the change's planning artifacts. -->

Read: `brief.md`, `proposal.md`, `specs/post-summaries/spec.md`, `specs/agent-content/spec.md`,
`design.md`, `tasks.md`, `.openspec.yaml`, `openspec/config.yaml`, the living spec inventory
(`agent-content`, `brand-mascot`, `site-chrome`, `theming`, `typography`), the living
`agent-content` spec, `src/utils/markdownTwin.ts`, `src/pages/llms.txt.ts`,
`src/pages/blog/[...slug].md.ts`, `tests/markdown-twins.spec.ts`, and the uncommitted diff of the
planning artifacts against `5acc798`. `openspec validate add-tldr --strict` passes, and
`prettier --check openspec/changes/add-tldr/` reports "All matched files use Prettier code style!".

This round re-checks the previous review's one Should-fix, the missing baseline for the
"byte-identical" comparisons. It is fixed: task 1.1 now copies every `dist/blog/<slug>/index.md` and
`dist/llms.txt` from the base build to a scratch folder and records its path (`tasks.md:19-22`).
Tasks 3.1, 3.2, and 3.3 now compare against those copies with `diff` (`tasks.md:137-138`,
`:151-152`, `:158-159`), and design.md records the baseline as a risk mitigation
(`design.md:249-252`). The copies are a valid baseline: twin image URLs are content-hashed asset
URLs, and neither the twins nor `llms.txt` hold a build-time value, so two builds of the same
content give the same bytes.

This round found one new Should-fix and one new nit, and no Blocking finding. The facts that earlier
reviews confirmed still hold and are not repeated as findings.

## Findings

### Untestable scenarios

**Blocking:** none.

**Should-fix:**

- `tasks.md:151-152` (task 3.2) and `tasks.md:157-159` (task 3.3). The new baseline is applied
  more narrowly than the requirement it guards. The MODIFIED "Existing reader and crawler contracts
  are preserved" says that a post twin or `llms.txt` MAY gain a key or a section, and that "every
  URL, entry, and metadata field that such a document already holds SHALL stay unchanged"
  (`specs/agent-content/spec.md:119-122`). Three outputs that this guarantee covers are not
  compared:
    - The `more-agents-same-mythical-month` post twin. It is the only post twin that changes, and
      task 3.2 edits the code that writes its frontmatter. Task 3.2 checks only that it "has the
      `tldr` key", so a lost or reordered field would pass.
    - The other post twins after task 3.2. Task 3.2 replaces the raw-source glob with
      `POST_SOURCES`, after the task 3.1 diff ran, and then compares only `hello-world`'s twin.
    - The parts of `llms.txt` outside `## Blog posts`. Task 3.3 compares only that section. The
      summary, `## Pages`, the attribution line, and `## Optional` are what the living scenario
      "Existing index content preserved" protects, and `tests/markdown-twins.spec.ts` checks only the
      post entries (`tests/markdown-twins.spec.ts:82-89`).

    **Fix:** in task 3.2, `diff` every post twin against its copy from task 1.1. Require no
    difference for each post with no TL;DR, and exactly one added line, the `tldr` key, for
    `more-agents-same-mythical-month`. In task 3.3, `diff` the whole built `llms.txt` against its
    copy, and require that the only difference is the added `## Post summaries` heading, its entries,
    and the blank lines around them.

**Nits:**

- `tasks.md:22` and `tasks.md:151`. The revision did not rewrap these two lines. Line 22 is about
  128 characters long, and line 151 is about 114. Every other line in the file wraps at 100.
  Prettier passes because it does not rewrap prose. **Fix:** rewrap both lines at 100 columns, as the
  previous round did for `design.md`.

### Requirements that contradict the living specs

No finding. The revision changes no spec delta. The MODIFIED "Existing reader and crawler contracts
are preserved" (`specs/agent-content/spec.md:116-140`) still carries the full block and all three
living scenarios. Its new sentence allows the `tldr` metadata key and the `## Post summaries`
section. The living "Existing index content preserved" and "Discoverable from the index" scenarios
stay true, because the new section goes between `## Pages` and `## Blog posts`
(`src/pages/llms.txt.ts:26`, `:34`).

### Tasks that use a primitive nobody establishes

No finding. The revision adds no primitive and no token. `TldrLink` still uses `text-accent-ink`,
which `base.css` exposes through `--color-accent-ink`.

### A missing tier decision

No finding. `design.md:184-187` (Decision 7) records **Interactivity tier: none** for `TldrLink`,
with the rationale and the alternatives that were ruled out. Task 2.1 names the tier once
(`tasks.md:68-70`).

### Unnamed scope

No finding. The scratch copies in task 1.1 live outside the repository, so they add no file to the
change. **Impact** (`proposal.md:73-94`) still names every file the tasks touch, and the Non-Goals
(`proposal.md:42-54`) still close the boundaries the brief drew. The Verify group is last and keeps
its seeded items.

### A `skip_specs` claim that hides a behaviour change

No finding. `.openspec.yaml` does not set `skip_specs`, and the change carries deltas for both
capabilities it touches.

## Verdict

Ready for the human's proposal gate. No finding is Blocking. One Should-fix is open: tasks 3.2 and
3.3 should `diff` every post twin and the whole of `llms.txt` against the task 1.1 copies, not only
`hello-world` and `## Blog posts`.
