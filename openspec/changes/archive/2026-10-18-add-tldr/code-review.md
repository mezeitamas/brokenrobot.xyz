# Code review: add-tldr (round 3)

Range: `git diff c5ef6c8` to the working tree. No untracked files. The closest read went to the
uncommitted diff on top of `0776eae` (`TldrLink.astro`, `design.md`, `verify-report.md`). Read against
`design.md`, `tasks.md`, `docs/architecture.md`, and `docs/development/conventions/coding-conventions.md`.

The guardrails still hold. This round adds no script, no inline handler, no external host, and no CSP
edit, and output stays static. The change removes markup and adds nothing. It adds no new class or
token. The 7 nits from round 1 were declined by the human and are not raised again.

## Round 2 nits

1. **`text-accent-ink` span in `TldrLink`:** resolved. `src/components/blog-posts/TldrLink.astro:16`
   now renders `InternalLink` directly. Its only use (`src/pages/blog/[...slug].astro:56`) is inside
   `<main class="prose">` (`BaseLayout.astro:115`), outside any `not-prose`. So the link takes
   `--tw-prose-links: var(--accent-ink)` (`base.css:68`), a token that resolves in both themes. The
   `InternalLink` import is still used, so the change orphaned nothing. QA's computed colours are the
   same as before the change in both themes, and no screenshot failed.
2. **Over-long line in `design.md` Decision 6:** resolved. `openspec/changes/add-tldr/design.md:158-160`
   is rewrapped with no change to the words. The longest line is 102 columns, the same width as the rest
   of the file. No line in the file is longer.

## Blocking

None.

## Should-fix

None.

## Nits

None.

## Not verified

- The rendered result in both themes. I cannot render pages; `frontend-qa-engineer` owns that check.
  The colour values above come from `verify-report.md`, not from my own measurement.
- Whether the Verify steps ran. Only `verify-report.md` claims they did, and a diff cannot prove it.
  The manual-preview item is the human's gate.
- The meta row in the 4 forced post baselines from round 2, by eye. Neither QA nor I have looked at it
  (see round 2). This round moved no pixel, so the risk did not change.
- Task 5.1 (the human's TL;DR) and its ticking are the human's call, as before.
- Link-preview cards on social platforms: a post-merge follow-up that the build cannot prove.

**Verdict:** ready to commit. Both round-2 nits are resolved, and this round has no findings.
