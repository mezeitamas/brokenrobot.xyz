## Context

See proposal.md — **Why**. The constraints that shape the approach are in the code, not in the
motivation.

The theme is resolved by one blocking inline script in `src/layouts/BaseLayout.astro`, which runs in
`<head>` before first paint. It reads two sources in order:

```
                    page load
                        |
                        v
        +--------------------------------+
        | inline init in BaseLayout head |
        | blocking, runs before paint    |
        +--------------------------------+
                        |
            localStorage.getItem('theme')
                        |
          +-------------+--------------+
          |                            |
   'light' | 'dark'                null / throws
          |                            |
          v                            v
     use stored        matchMedia('(prefers-color-scheme: dark)')
          |                            |
          |                  +---------+---------+
          |                  |                   |
          |               matches            no match
          |                  |                   |
          v                  v                   v
        html[data-theme] <-- dark              light
                        |
                        v
      base.css and tokens.generated.css key every
      themed value off html[data-theme='dark'].
      No CSS rule reads prefers-color-scheme directly.
```

Three consequences drive the design:

1. There are **two independent entry paths into dark**, and a test drives one or the other, never
   both at once. `openspec/specs/theming/spec.md` has a separate scenario for each.
2. No stylesheet keys off `prefers-color-scheme`. The whole dark theme depends on that one script
   running, so a test that sets the browser's colour scheme is testing the script as much as the
   palette.
3. The toggle in `src/components/theme/theme-toggle.ts` writes `localStorage` and flips
   `document.documentElement.dataset.theme`. Persistence is therefore a property of storage plus the
   init script, not of the button alone, and a test that only clicks the button proves half of it.

`playwright.config.ts` today defines two projects at the browser default colour scheme, sets
`workers: 1`, and derives baseline paths from
`'{testDir}/__screenshots__/{testFilePath}/{arg}{-projectName}{ext}'`. The **Test site** job in
`.github/workflows/pipeline.yml` carries `timeout-minutes: 10`.

## Goals / Non-Goals

**Goals:**

- Pick one lever for forcing dark in the visual and accessibility projects, and cover the other
  entry path deliberately rather than by omission.
- Keep the dark baselines in the existing baseline tree, under the existing naming scheme.
- Keep a dark project readable as "the light one, in dark", so the config needs no accompanying
  rule about which specs go where.

**Non-Goals:**

- Deciding whether `astro preview` is the right server to test against. `docs/known-gaps.md` records
  that separately.
- Any change to how the site itself resolves the theme. This change tests the existing mechanism; it
  does not touch `BaseLayout.astro` or `theme-toggle.ts`.

## Decisions

### Force dark with `colorScheme`, not with seeded storage

The two dark projects set `use: { colorScheme: 'dark' }`. Playwright then reports
`prefers-color-scheme: dark` to the page, the init script takes its `matchMedia` branch, and
`html[data-theme]` becomes `dark` before paint.

**Why over the alternatives:**

- _Seeding `localStorage` through `storageState`_ would exercise the stored-preference branch
  instead. It is a legitimate path, but it is the returning reader's, and it needs an origin-scoped
  storage fixture in config for every project. `colorScheme` is one property and needs no fixture.
- _Clicking the toggle before each capture_ would exercise the real user gesture, but it adds a step
  to every screenshot and every axe scan, and it couples all 24 dark baselines to the toggle
  continuing to work. A toggle regression would then be reported as 24 visual failures rather than
  as one behavioural failure.

`colorScheme: 'dark'` also sets the user agent's own `color-scheme`, which affects scrollbars and
native controls. That is not a conflict here: `src/styles/base.css` already declares
`color-scheme: dark` under `html[data-theme='dark']`, so the two agree.

The stored-preference branch is not left uncovered — it moves to `tests/theme.spec.ts`, where one
test proves it directly instead of 24 baselines proving it incidentally.

**Unverified until task 1.** That `colorScheme: 'dark'` actually flips this site is read from the
init script, not demonstrated. Task 1 exists to settle it before any baseline is generated, because
every later task depends on it.

### A dark project is its light counterpart plus one property

The dark projects carry no `testMatch`, `testIgnore`, or `grep`. They run the whole suite, exactly
as the light projects do, and differ from them in `colorScheme` and nothing else.

This is a deliberate trade against filtering. Scoping the dark projects to `tests/pages/` — the only
specs whose result can depend on the theme — would keep roughly 82 redundant runs out of the suite.
It would also make a dark project a structurally different kind of thing from a light one, and
create a rule that every future spec author must know: put a theme-sensitive spec here, put a
theme-blind one there, or lose coverage silently. Mirroring keeps the config readable by inspection
and gives a new spec dark coverage by default. At this suite's size, that is the better trade;
runner minutes are cheaper than a rule nobody remembers.

Two things follow from mirroring that filtering would have cost:

- `tests/theme.spec.ts` runs in the dark projects as well, which is where the toggle's
  **dark → light** direction gets covered. A light-only run can never reach it. This is a gain, not
  a tolerated side effect — but it constrains how those tests are written; see below.
- `navigation.spec.ts` and `markdown-twins.spec.ts` re-run in dark, proving nothing new. Accepted.

One option stays off the table regardless. Per-project `testDir` must not be used to scope anything
here: `snapshotPathTemplate` interpolates `{testDir}`, which resolves per project, so a dark project
with its own `testDir` would write its baselines into a second tree under
`tests/pages/__screenshots__/`. Leaving `testDir` global keeps every baseline in
`tests/__screenshots__/`, distinguished only by the `{-projectName}` suffix the template already
applies.

### `workers: 1` makes wall clock the cost that matters

The suite runs serially, and the **Test site** job caps at `timeout-minutes: 10`. Mirroring roughly
doubles the test count, so it roughly doubles the job. This is the risk that the measurement tasks
in tasks.md group 1 exist to quantify before the config changes, rather than the one discovered by a
red pipeline.

Raising `workers` is the wrong lever if the job gets close to the cap. Parallel workers change
rendering timing, which is exactly what the visual baselines are sensitive to, and this change
generates 24 of those. Raise the cap instead.

### Project names are fixed by existing tooling

`Desktop Chrome Dark` and `Pixel 7 Dark` are not free choices. Step 2 of
`.claude/skills/testing-visual-regression/SKILL.md` looks for those two names to decide whether dark
coverage is available, and instructs the agent to report dark coverage as missing when it cannot
find them. Any other name leaves the skill reporting no dark coverage while the suite runs it.

### The toggle tests assert the mechanism, not the pixels

`tests/theme.spec.ts` covers five things, each mapping to a scenario already in
`openspec/specs/theming/spec.md`:

| Test                                               | Spec scenario covered                   |
| -------------------------------------------------- | --------------------------------------- |
| Click flips `data-theme` and syncs `aria-pressed`  | Toggle switches theme                   |
| The flipped choice survives a navigation           | Explicit choice persists                |
| A seeded `localStorage` value wins over the system | Explicit choice persists                |
| An unseeded visit under a dark system goes dark    | Honors system preference on first visit |
| An unseeded visit under a light system goes light  | Honors system preference on first visit |

**The first two must read the starting theme, not assume it.** This file runs in all four projects,
so it starts light twice and dark twice. A test that hard-codes "click, expect dark" passes in the
light projects and fails in the dark ones. Reading `html[data-theme]` first and asserting it became
the other value is both what makes the file project-agnostic and what earns the dark → light
coverage described above.

The last three must not depend on the ambient project at all, or they assert nothing in two of the
four. Each pins its own condition: the seeded test writes `localStorage` before load, and the two
system-preference tests each declare `test.use({ colorScheme: ... })` in their own describe block.
Pinning both directions rather than one is what makes the pair deterministic in every project.

These assert attribute and storage state, not appearance. Appearance is what the baselines are for,
and duplicating it here would create two things to update for one visual change.

## Risks / Trade-offs

- **Dark axe has never run and may find real violations** → This is the coverage working, not a
  defect in the change. A token value fix is in scope. A violation that needs the palette reworked
  stops this change: record the finding and hand it on, as proposal.md — **Non-Goals** states. Task
  ordering puts the dark axe result before the baselines so this is discovered early.
- **The suite may exceed the ten-minute Test site cap** → Mirroring roughly doubles it, so this is
  the most likely thing to go wrong. Task 1.2 records the current duration before anything is added,
  so the decision is made against a number rather than a guess, and the lever is the cap rather than
  `workers` for the reason given above.
- **Baseline directory roughly doubles, from 35 MB** → Accepted. It is inherent in wanting a dark
  picture of every page, and no scoping choice avoids it. The `testMatch` scoping saves CI time, not
  repository size.
- **Dark screenshots may prove flakier than light ones** → Antialiased light text on a dark ground
  produces different edge noise than the reverse, and `maxDiffPixelRatio: 0.01` was tuned against
  light images. Left alone deliberately. If it proves too tight, that is evidence gathered here and
  spent in its own change, not a value guessed now.
- **`colorScheme` proves not to drive the site** → Task 1 catches this before any baseline exists.
  The fallback is the seeded-storage lever described above, which costs a storage fixture in config
  and changes which branch the baselines exercise, but not the shape of the change.

## Migration Plan

None. Nothing deploys, and no committed artifact is invalidated. The light baselines are expected
byte-identical, because the light projects' configuration and the pages they load are untouched.
Rollback is reverting the branch.
