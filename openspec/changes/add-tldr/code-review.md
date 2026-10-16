# Code review: add-tldr

Range: `git diff c5ef6c8` (implementation commit `dfc0c07` plus the working tree), untracked files
included. Read against `design.md`, `tasks.md`, both spec deltas, `docs/architecture.md`, and
`docs/development/conventions/coding-conventions.md`.

The guardrails hold. The diff adds no script, no inline handler, no external host, and no CSP edit.
Output stays static, and the TL;DR link uses only the `accent-ink` token (defined for both themes in
`tokens.generated.css`). `TldrLink` is a static component with zero client JS, it uses
`InternalLink`, and `/blog/<slug>/` and `rss.xml` are unchanged.

## Blocking

None.

## Should-fix

- `src/pages/blog/[slug]/tldr.astro:44` and `src/pages/blog/[...slug].astro:32-33`: `remarkPluginFrontmatter` is `Record<string, any>`, so `const postMinutes: number = …minutesReadCount` asserts a type without checking it. That is an `any` behind an annotation, and it does not do task 1.1's "extend the typing". If the field ever goes missing, the post page silently drops the TL;DR link (the `tldrMinutes !== undefined` guard), and the TL;DR page prints "undefined min read". Fix: add one helper in `src/utils/`, for example `minutesReadCountOf(frontmatter: Record<string, unknown>): number`, that throws when the value is not a number. Use it at both read sites, and record in design.md (Decision 6) that this replaces the declaration.
- `openspec/changes/add-tldr/tasks.md:213-216` and the post baselines: the Verify item is ticked, but it promises "four updated baselines" for the post page, and only Pixel 7 and Pixel 7 Dark changed. The conventions settle this. `coding-conventions.md` (Testing) says to update baselines when an intentional visual change lands, and the 0.01 tolerance is a noise budget, not an exemption. The Desktop Chrome and Desktop Chrome Dark baselines now show a page that does not ship, and they spend part of the next change's budget. Fix: in the devcontainer, re-run `more-agents-same-mythical-month.spec.ts` for the two desktop projects with `--update-snapshots=all`, review the result, and stage it. If the human prefers not to, rewrite the Verify item so it states two updated baselines.
- `tests/tldr.spec.ts:113`: `PLAIN_SLUGS.slice(0, 1)` checks only the first post alphabetically (`advanced-static-website-hosting`). Task 2.5 names `hello-world`, and the spec scenario covers every post that has no TL;DR. Fix: loop over all of `PLAIN_SLUGS`.

## Nits

- `src/pages/blog/[...slug].md.ts:104-112`: when the post source is missing, the TL;DR branch falls back to the TL;DR's empty frontmatter and throws "the post has no frontmatter block", which names the wrong cause. Fix: when `isTldr && postSource === undefined`, throw "no MDX source found for the post". The full second conversion with an identity resolver is correct, but it is heavy. A frontmatter-only export from `mdxToMarkdown.ts` would remove it, so this is optional.
- `tests/markdown-twins.spec.ts:33-36`: the old `bodyOf` comment ("Everything after the closing `---`…") now sits above `frontmatterOf`. Move it back above `bodyOf`.
- `src/utils/tldrPaths.ts:3,10`: the comment says `markdownTwin.ts` re-exports only `tldrPagePath`, but it also re-exports `isNotTldrPage`, which nothing imports from there. Fix the comment. The `.replaceAll('/', '\\/')` is unneeded in `new RegExp(...)` and can go. The regex is otherwise correct, and it is built from `tldrPagePath` as Decision 9 asks.
- `docs/architecture.md:49`: "It is `noindex`, so the sitemap leaves it out" has the cause wrong. The `sitemap({ filter })` in `astro.config.ts` drops the page, not the robots meta. Reword it.
- `src/utils/markdownTwin.ts:4` ("Three surfaces advertise them") and the header of `scripts/check-markdown-twins.mjs:1-19` were not updated for TL;DRs. The TL;DR page is a fourth advertiser, and the script now audits `tldr/`.

2 more nits: `tests/tldr.spec.ts:59` puts an unescaped title into `new RegExp`, and the orphan check at `src/pages/blog/[slug]/tldr.astro:21-23` duplicates the helper's error even though it cannot be reached.

## Points the engineer flagged

- **`Props` discriminant and the two branches in `[...slug].md.ts`**: sound. `satisfies Props` on each arm, plus narrowing on `kind`, keeps `hasTldr` on post paths only.
- **Nested `mdxToMarkdown` call**: see the first Nit.
- **Sitemap regex**: correct. See the third Nit.
- **`TldrLink` with `text-accent-ink`**: the token resolves in both themes. Inside `prose`, the link already takes `accent-ink` through `--tw-prose-links`, so the class mainly colours the icon. This is as designed.
- **`tldr.astro`**: `closingMinutes` in the frontmatter, no JSON-LD, and no hero image all match Decision 8 and the spec.
- **Typed locals for `remarkPluginFrontmatter`**: see the first Should-fix.
- **Editor implicit `any` at `[...slug].md.ts:64,69,70`**: this is not a code finding. `checks.md` names `type:check` (`astro check && tsc --noEmit`) as the type gate, and both are clean. The editor errors match `getCollection` being unresolved (`any`) in the editor's TypeScript server, which reads the types that `astro sync` generates. Run `mise run lint:check` (which runs `astro sync`), then restart the TS server. If the errors persist, record them in `docs/known-gaps.md`, because they are an editor-setup gap.
- **Desktop post baselines**: see the second Should-fix.

## Not verified

- The rendered result in both themes. I can judge token usage but cannot render pages, so this belongs to `frontend-qa-engineer`. I did not open the PNG baselines.
- Whether the Verify steps ran. Only `verify-report.md` claims they did, and the diff cannot prove it. The **Manual preview** Verify item is still unticked, and it is the human's gate.
- Task 5.1 (the human's TL;DR) is still unticked in `tasks.md`, although the file is staged. Ticking it is the human's call.
- The root cause of the editor diagnostics (inferred above, not reproduced).
- Link-preview cards on social platforms. This is a post-merge follow-up that the build cannot prove.

**Verdict:** no blocking findings. Resolve the three Should-fix items (the typing helper, the desktop baselines or the Verify wording, and the plain-post loop) before committing.
