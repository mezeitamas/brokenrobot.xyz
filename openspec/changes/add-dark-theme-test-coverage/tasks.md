## 1. Establish the lever and the cost baseline

- [x] 1.1 Confirm that `colorScheme: 'dark'` actually drives this site before anything is built on
      it. Add a throwaway test that runs under a project with `use: { colorScheme: 'dark' }`, loads
      `./`, and asserts `document.documentElement.dataset.theme === 'dark'`. Verify it passes in the
      devcontainer, then delete it — its only job is to prove the `matchMedia` branch of the
      pre-paint init in `src/layouts/BaseLayout.astro` responds to the emulated preference. If it
      fails, stop and take the seeded-storage fallback in design.md — **Decisions** instead of
      improvising a third lever.
- [x] 1.2 Record the current e2e suite's wall-clock duration and test count from a clean
      devcontainer run of `npm run test:e2e:check`. Verify the number is written into this task's
      line, so the growth in task 5.2 is measured against it rather than estimated. The **Test site**
      job in `.github/workflows/pipeline.yml` caps at `timeout-minutes: 10`, and that cap is the
      thing this number is for.
      **Measured before the change:** 130 tests (129 passed, 1 skipped) in **31.8 s** of Playwright
      wall clock, 35 s including `astro build`. That is ~5% of the ten-minute cap, so the doubling
      this change buys has room. proposal.md estimated 132 tests; 130 is the real figure, and 5.2 is
      measured against 130.

## 2. Wire the dark projects

- [x] 2.1 Add `Desktop Chrome Dark` and `Pixel 7 Dark` to `playwright.config.ts`, each spreading its
      light counterpart's `devices[...]` entry and adding `colorScheme: 'dark'`. Use those two names
      exactly: Step 2 of `.claude/skills/testing-visual-regression/SKILL.md` matches on them to
      decide whether dark coverage exists, and any other name leaves the skill reporting no dark
      coverage while the suite runs it. Verify `node_modules/.bin/playwright test --list` reports
      four projects.
- [x] 2.2 Keep each dark project a mirror of its light counterpart: `colorScheme` is the only
      property that differs, and no `testMatch`, `testIgnore`, or `grep` is added to any project. Do
      **not** reach for a per-project `testDir` either — `snapshotPathTemplate` interpolates
      `{testDir}`, so a per-project value would write the dark baselines into a second tree. Verify
      `--list` shows all four projects running the same spec files, and that `npm run type:check`,
      `npm run lint:check` and `npm run format:check` pass on the edited config.

## 3. Dark accessibility

- [x] 3.1 Run the two dark projects' axe scans before generating any baseline, so a palette problem
      is found while the change is still cheap to redirect. Verify every `tests/pages/` spec's
      accessibility test passes under both dark projects, or that each violation is captured with
      its rule id, the element, and the token behind the failing colour.
      **Result:** all 26 dark axe scans pass — 13 pages under each dark project, zero violations. The
      dark palette needs no change, so 3.2 has nothing to resolve.
- [x] 3.2 Resolve whatever 3.1 found. A violation fixable by changing a token's dark value in
      `src/styles/` is fixed here; verify the axe scans pass afterwards and that
      `npm run tokens:check` and `npm run designmd:check` still pass. A violation that cannot be
      fixed without reworking the dark palette stops this change: record it as a new entry in
      `docs/known-gaps.md` with its intent, reality, and resolution, note it in proposal.md, and
      leave the palette alone — proposal.md — **Non-Goals** already commits to handing that case on
      rather than absorbing it.

## 4. Dark baselines

- [x] 4.1 Generate the dark baselines with `npm run test:e2e:update` in the devcontainer, so
      rendering matches the container the committed baselines and CI both use. Verify exactly 24 new
      PNGs appear under `tests/__screenshots__/`, two per page, carrying the `-Desktop-Chrome-Dark`
      and `-Pixel-7-Dark` suffixes the existing `snapshotPathTemplate` applies, and that they sit
      beside the light images rather than in a new tree.
- [x] 4.2 Review every one of the 24 new images before staging. Verify each is genuinely the dark
      theme rather than a light page captured under a dark user agent, that fonts and images have
      settled as `tests/settleImages.ts` intends, and that no page shows an unreadable or unthemed
      region. Verify the existing light baselines are unchanged: `git status` must show 24 additions
      and no modifications, because neither the light projects' configuration nor the pages they
      load were touched.
      **Result:** 24 additions, no modifications. All 24 are genuinely dark — mean luminance 27–67
      against 199–241 for the light counterparts — and each matches its light counterpart's pixel
      dimensions, which is what proves the images settled: a half-loaded image would change the page
      height. One unreadable region found, and it is not the palette: the Excalidraw diagrams are
      transparent PNGs with dark ink, so their strokes and labels sit near-black on the dark ground.
      Seven diagrams across three posts. axe cannot see it, because the text is inside an image. The
      baselines are committed as rendered rather than hiding it, and 6.1 records it as a known gap —
      a dark diagram treatment is a design decision this change does not own.

## 5. The theme control

- [x] 5.1 Add `tests/theme.spec.ts`, covering the five behaviours mapped in design.md —
      **Decisions**: clicking `#theme-toggle` flips `html[data-theme]` and syncs `aria-pressed`; the
      flipped choice survives a navigation to another page; a `localStorage` value seeded before
      load wins over the system preference; and an unseeded visit resolves to dark under a dark
      system and to light under a light one, each pinned by its own describe-scoped
      `test.use({ colorScheme: ... })`. The first two must **read** `html[data-theme]` and assert it
      became the other value rather than hard-coding "expect dark" — this file runs in all four
      projects, so it starts light twice and dark twice, and reading the start is what covers the
      toggle's dark → light direction. Assert attribute and storage state only, never appearance —
      the baselines own appearance. Verify each test fails when the behaviour it names is broken
      (temporarily disable the toggle's click handler to prove it), then passes against the real
      code, in all four projects.
      **Result:** 20 tests, five per project, all passing. Three temporary mutations proved each one
      catches its own behaviour, and nothing else: disabling the toggle's click handler failed only
      the two toggle tests; making the init ignore `localStorage` failed only the persistence and
      stored-preference tests; inverting the init's `matchMedia` result failed only the two
      system-preference tests. Each mutation failed in all four projects, which is what pinning both
      system directions buys.
- [x] 5.2 Re-measure the suite against the number recorded in 1.2. Verify the count landed near the
      expected ~284 tests — roughly double, which is what mirroring the projects buys and costs —
      and that the **Test site** job still finishes inside `timeout-minutes: 10` with margin. If it
      does not, raise the cap rather than the `workers: 1` setting: more workers changes rendering
      timing and would invalidate the 24 baselines this change just generated.
      **Measured after the change:** 280 tests (278 passed, 2 skipped) in **66 s** of Playwright wall
      clock, 70 s including `astro build`. Against 1.2's 130 tests in 31.8 s that is 2.15× the count
      and 2.08× the clock — the estimate held. 66 s is 11% of the ten-minute cap, so
      `timeout-minutes: 10` and `workers: 1` both stay as they are.

## 6. Documentation

- [x] 6.1 Delete the `docs/known-gaps.md` entry "Only the light theme carries visual and
      accessibility coverage", and replace it with a narrower entry for the one requirement still
      unproven: `openspec/specs/theming/spec.md` requires no flash of the wrong theme, and nothing
      asserts first paint. State that a dark baseline fails only if the pre-paint init breaks
      altogether, which is protection by accident rather than a test. Verify the new entry carries
      the page's three-part shape — intent, reality, resolves by — and that no other gap entry was
      touched.
      **Note:** two entries replace the deleted one, not one. The no-flash entry this task specifies,
      and a second for the dark-theme diagram legibility that task 4.2 found. No other entry changed.
- [x] 6.2 Review the both-themes claims in `docs/development/checks.md` that this change makes true,
      in the **Visual verification** section and the `test:e2e:check` section. Verify the wording
      still reads correctly now that it describes reality, and that no new check section is added —
      this change adds coverage to an existing check, and checks.md stays the only place the checks
      are listed.
      **Result:** no section added, no heading changed. Both claims needed a correction rather than
      only a re-read. **Visual verification** credited the `testing-visual-regression` skill with
      running the suite in both themes; that is now a property of the projects, so CI gets it without
      the skill. The `test:e2e:check` section asserted both-theme coverage without saying what
      carries it, so it now names the four projects.

## 7. Verify

- [x] Visual + a11y snapshots pass in **both themes** for every touched view (testing-visual-regression skill)
- [x] All preflight gate checks pass — the set in `docs/development/checks.md` (running-preflight-checks skill)
- [ ] Manual preview: no theme flash, interactions work, console clean, responsive at 375px
