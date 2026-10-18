# Code review: add-tldr (round 2)

Range: `git diff c5ef6c8` to the working tree, untracked files included (`src/utils/minutesReadCountOf.ts`).
The closest read went to the uncommitted diff on top of `0ffd30e`. Read against `design.md`, `tasks.md`,
`docs/architecture.md`, and `docs/development/conventions/coding-conventions.md`.

The guardrails still hold. This round adds no script, no inline handler, no external host, and no CSP
edit, and output stays static. `TldrLink` still uses only the `accent-ink` token, which resolves in
both themes. The zap icon now inherits the text colour, like `ClockIcon` and `CalendarIcon` in the
meta row. The new helper is a build-time check with zero client JS. The 7 nits from round 1 were
declined by the human and are not raised again.

## Earlier should-fix findings

1. **Unchecked minute counts:** resolved. `src/utils/minutesReadCountOf.ts` takes `Record<string, unknown>`
   and throws when the value is not a number. Both read sites use it
   (`src/pages/blog/[...slug].astro:33`, `src/pages/blog/[slug]/tldr.astro:45`), and the annotated `any`
   reads are gone. No other `minutesReadCount` read exists in `src/`. Decision 6 in `design.md:158-160`
   records that the helper replaces a typing declaration.
2. **Desktop baselines:** resolved. All 4 `more-agents-same-mythical-month.spec.ts` post baselines are
   rewritten, so the `tasks.md` Verify wording ("four updated baselines") now matches the diff. See
   **Not verified** for the eye check.
3. **Too narrow a plain-post test:** resolved. `tests/tldr.spec.ts:113` loops over all of `PLAIN_SLUGS`.
   That list comes from the content folders on disk (lines 13-18), so it includes `hello-world` and
   every future post without a TL;DR.

## Blocking

None.

## Should-fix

None.

## Nits

- `src/components/blog-posts/TldrLink.astro:16`: the `text-accent-ink` span probably has no effect. The
  meta row is inside `<main class="prose">` (`BaseLayout.astro:115`). Typography colours `a` directly
  through `--tw-prose-links: var(--accent-ink)` (`base.css:68`), and that rule wins over a colour
  inherited from the span. The link was already amber because of prose, not because of the span. You
  can drop the span. Keep it only if `TldrLink` must work outside prose.
- `openspec/changes/add-tldr/design.md:158-160`: the edited sentence runs to 134 columns. The rest of
  the file wraps at about 100. Rewrap the paragraph.

## Not verified

- The rendered result in both themes. I cannot render pages; `frontend-qa-engineer` owns that check. I
  viewed a crop of the new Desktop Chrome and Desktop Chrome Dark baselines. My crop showed article
  body, not the meta row, so I did not see the zap icon in a baseline. `verify-report.md` also says QA
  did not check the meta row in the new baselines by eye; it checked computed styles and a live
  screenshot instead. Someone should look at the meta row in the 4 forced baselines once before the
  commit.
- Whether the span in the first Nit really has no effect. That conclusion comes from the CSS. I did
  not inspect computed styles with and without the span.
- Whether the Verify steps ran. Only `verify-report.md` claims they did, and a diff cannot prove it. The
  **Manual preview** Verify item is still unticked, and it is the human's gate.
- Task 5.1 (the human's TL;DR) and its ticking are the human's call, as before.
- Link-preview cards on social platforms: a post-merge follow-up that the build cannot prove.

**Verdict:** ready to commit. All three earlier should-fix items are resolved, and the two nits are
optional.
