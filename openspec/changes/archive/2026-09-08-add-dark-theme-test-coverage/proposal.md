## Why

Both themes are first-class on this site, and three separate documents already say the tests prove
it. `CLAUDE.md` states it. `docs/development/checks.md` says the e2e suite "runs visual regression
and axe accessibility checks in **both themes**". The `testing-visual-regression` skill wraps that
claim into its own description.

None of it is true. `playwright.config.ts` defines two projects, `Desktop Chrome` and `Pixel 7`,
both at the browser's default colour scheme, and nothing under `tests/` sets a theme. Every baseline
in `tests/__screenshots__/` is a light-theme image, and every axe scan reads a light palette. A
dark-only contrast regression, or a dark-only layout break, passes the suite in silence.

The theme toggle itself has never been exercised. `openspec/specs/theming/spec.md` requires that the
control flips the theme, that the choice persists across page loads, and that a stored preference
wins over the operating system's. No test clicks the button, and no test reads `localStorage`.

`docs/known-gaps.md` records the visual half of this and marks it "resolves by: changing the code".
The intent is not in doubt; the coverage is missing.

## What Changes

- Add two Playwright projects, `Desktop Chrome Dark` and `Pixel 7 Dark`, each spreading its light
  counterpart's device and adding `colorScheme: 'dark'`. The names are not free: Step 2 of the
  `testing-visual-regression` skill already looks for exactly these two, and reports dark coverage
  as unavailable when it cannot find them.
- Mirror the light projects exactly: the dark projects run the whole suite, with no per-project
  `testMatch`, `testIgnore`, or `grep`. A dark project differs from its light counterpart in one
  property and nothing else, which is the property that makes the config readable.
- Commit a dark baseline for every page that has a light one — 24 new PNGs, two per page, one per
  dark project.
- Extend axe coverage to the dark palette, which the two dark projects do by construction. Contrast
  violations found there are fixed in this change; see **Non-Goals** for the one case that is
  handed onward instead.
- Add `tests/theme.spec.ts` covering the theme control's behaviour: the toggle flips the theme and
  syncs `aria-pressed`, the choice survives a navigation, a stored preference wins on load, and an
  unseeded visit follows the operating system. Because the dark projects run the whole suite, these
  tests read the starting theme rather than assuming light — which is what lets them cover the
  toggle's **dark → light** direction, a path no light project can reach.
- Retire the light-only carve-out in the theming spec's WCAG scenario, and delete the known-gaps
  entry that this change closes.

## Non-Goals

- **Not** asserting the absence of a flash of the wrong theme. `openspec/specs/theming/spec.md`
  requires it, and nothing here proves it. A dark baseline fails loudly if the pre-paint init breaks
  altogether, which is protection by accident rather than a test of first paint. This stays an open
  gap, recorded as its own entry in `docs/known-gaps.md` rather than quietly folded into the one
  being deleted.
- **Not** redesigning the dark palette. Dark axe has never run, so it may find real contrast
  violations. Fixing a token's value is in scope. If a violation cannot be fixed without reworking
  the palette, this change stops, records the finding, and hands it to a change of its own.
- **Not** re-enabling the commented-out screenshot test in
  `tests/pages/blog-posts/beyond-tabs-and-spaces-finding-a-balance-in-coding-conventions.spec.ts`.
  Its comment blames an iPhone 12 Pro capture limit, and the config no longer defines that device,
  so the exclusion has probably outlived its reason — but confirming that is separate work, and the
  post therefore gets no dark baseline either.
- **Not** retuning `expect.toHaveScreenshot.maxDiffPixelRatio`. Its current `0.01` was set against
  light images. It is left alone unless the dark baselines prove flaky in practice.
- **Not** changing `.github/workflows/pipeline.yml`. `playwright test` already runs every configured
  project, so the new projects reach CI with no workflow edit.
- **Not** adding an npm script or a new entry to `docs/development/checks.md`. This change adds
  coverage to an existing check, not a new check.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `theming`: the **WCAG AA contrast in both themes** scenario currently excuses itself with "run
  against the light theme; dark-theme automated coverage is added with the page redesign". After
  this change the automated accessibility checks run against both themes, so the carve-out is
  removed.

The theming spec's **Theme preference selection and persistence** and **Theme toggle control**
requirements are unchanged. This change tests behaviour those requirements already specify; it does
not alter what the site does.

## Impact

**Modified test configuration**

- `playwright.config.ts` — two projects added, from two to four. Each is its light counterpart plus
  `colorScheme: 'dark'`, with no other per-project option. `testDir` in particular stays global:
  `snapshotPathTemplate` interpolates `{testDir}`, so a per-project value would send the dark
  baselines to a second, parallel tree.

**Modified tests**

- `tests/navigation.spec.ts` — its mobile skip matched the project name `Pixel 7` exactly, so
  `Pixel 7 Dark` ran a test that only makes sense on desktop. Matched by prefix instead. Mirroring
  makes every project-name comparison in the suite a place the new names must be recognised; this is
  the only one.

**New tests**

- `tests/theme.spec.ts` — the toggle, persistence, stored preference, and system preference.

**New baselines**

- `tests/__screenshots__/**` — 24 files, named by the existing `{-projectName}` suffix, so nothing
  collides with the light set. This roughly doubles the directory from 35 MB. That cost is inherent
  in wanting a dark picture of every page; the `testMatch` scoping saves CI time, not repository
  size.

**CI cost**

- Test count roughly doubles, from 132 to about 284. Of the ~152 added runs, 50 are the
  theme-sensitive ones this change is for — 25 axe scans and 25 screenshots — and roughly 82 are
  exact re-runs of assertions no theme can affect: link targets, page titles, and Markdown twin
  contents.
- That duplication is accepted, not overlooked. Filtering it out costs a per-project `testMatch` on
  each dark project, which makes a dark project structurally different from its light counterpart
  and adds a rule every future spec author has to know about. Mirroring is worth more than the
  runner minutes at this size. Raised and declined.
- `workers: 1` and the **Test site** job's `timeout-minutes: 10` therefore make wall clock the
  primary risk of this change, and the one thing measured before and after rather than estimated.

**Docs**

- `docs/known-gaps.md` — the entry "Only the light theme carries visual and accessibility coverage"
  is deleted, and a narrower entry for the unproven no-flash requirement replaces it. Two further
  entries record what running this change's own coverage exposed: architecture diagrams that are
  near-unreadable in the dark theme, and a preview server that can answer the suite's readiness
  probe before it serves the site. Neither is fixed here, and neither is about the dark palette.
- `docs/development/checks.md` — its claim that the suite covers both themes becomes true. The
  wording is reviewed rather than assumed correct; no check is added, so no section is added.

**Untouched**

- No `src/` change, unless a dark contrast violation forces a token value. No dependency change. No
  `dist/` change. The light baselines are expected to be byte-identical, because nothing the light
  projects load is modified.
