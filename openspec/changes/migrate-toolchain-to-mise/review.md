# Review

<!-- Reviewed 2026-10-15 (tenth round, after the Update that answers the ninth proposal gate),
against the living specs (agent-content, brand-mascot, site-chrome, theming, typography) and the
change's brief (with its Answers), proposal, design, tasks, and .openspec.yaml. `prettier --check`
and `openspec validate` were run on the change, and the tracked files were searched for fnm and
`.node-version`. -->

## Findings

The human's ninth-gate answer (brief.md:142-148) is applied:

- **Prettier.** `node_modules/.bin/prettier --check openspec/changes/migrate-toolchain-to-mise/`
  now reports "All matched files use Prettier code style!". Round 9's Blocking finding is closed.
  `openspec validate migrate-toolchain-to-mise` reports the change valid, with `skip_specs` accepted.
- **The About page is a Non-Goal.** `proposal.md:60-65` names `src/pages/about/index.astro` and its
  "Fast Node Manager (fnm)" entry (the file holds it at line 159), says why this change leaves it
  (an edit would change `dist/`, and Verify requires `dist/` to equal `main`), and names a separate
  follow-up after the merge. `proposal.md:44-47` (What Changes), `design.md:54-55` (Non-Goals), and
  the Verify grep note (`tasks.md:280-285`) agree. Round 9's Should-fix finding is closed.

The repository search found no other fnm or `.node-version` reference outside the files the tasks
own: every hit is in the hook lib and its suites (5.1-5.6), the `checking-dev-env` skill and evals
(5.8, whose grep covers `SKILL.md:80`), `pipeline.yml` (6.1), `docs/development-environment.md`
(2.5, 5.7), `docs/tooling/code-intelligence.md` (5.9), or the About page (Non-Goal).

### Untestable scenarios

The change has no spec deltas (`skip_specs: true`), so it has no WHEN/THEN scenarios. The findings
below are task verify steps.

**Blocking**

None.

**Should-fix**

None.

**Nits**

- `tasks.md:96-97` (3.4). Deferred, still open. "Returns only intended lines" cannot be checked.
  Fix: list the lines that stay, for example the read-only guard that 5.8 keeps (`SKILL.md:23`, and
  the criterion and tripwire in `evals.json`).
- `tasks.md:87-88` (3.3). Deferred, still open. Only the human can check "`/mcp` in a new session
  shows codegraph connected". Fix: mark that part **Human only**, as 1.1 is marked.
- `tasks.md:230-231` (5.8). Deferred, still open. The task adds both `mise install` and
  `mise trust` to the rule, the criterion, and the tripwire regex (`tasks.md:223-225`). The verify
  step checks only `mise install`. Fix: verify `mise trust` in the same three places.
- `tasks.md:227` (5.8). Deferred, still open. The task rewrites "node version manager"
  (`SKILL.md:3`) and the guide order. The verify grep matches neither phrase, so a missed edit still
  passes. Fix: add `version manager` to the grep.
- `tasks.md:63-64` (2.5) and `tasks.md:130` (4.6). Deferred, still open. If the § Verify block
  lists the tool versions, it writes `terraform 1.16.0` into `docs/development-environment.md`. The
  4.6 grep then fails, and the doc holds a second copy of a pin (against brief.md:18). Fix: in 2.5,
  link `mise.toml` as the source of the versions and do not repeat them.

### Requirements that contradict the living specs

Nothing found. None of the five living specs names a tool version, CI, the devcontainer, or the
visual baselines.

### Tasks that use a primitive nobody establishes

Nothing found. The change uses no `.btn`/`.tag`/`.card` primitive and no design token.

### A missing tier decision

Nothing found. The change adds or changes no interactive UI.

### Unnamed scope

**Blocking**

None.

**Should-fix**

None.

**Nits**

- `design.md:262-266` (D6) and `tasks.md:160-161` (5.6). Deferred, still open. The rule links
  "every tool that the hook, the lib, or a case calls" into `base`. Read literally, that includes
  the stubbed tools (`npm`, `openspec`, `codegraph`, `typescript-language-server`, `docker`,
  `mise`). A real `openspec` in `base` makes a "one tool missing" case pass on a machine that has
  the tool. In the 5.10 container, the lookup finds nothing for some of them, and `ln -s ""` fails.
  Fix: say "every tool the suite does not stub".
- `tasks.md:198-205` (5.8). Deferred, still open. The `compatibility` field (`SKILL.md:4`) says that
  without jq "the openspec check falls back to presence-only". D6 reads the pins without jq
  (`design.md:169-170`), so this sentence becomes wrong. Fix: add the `compatibility` field to the
  5.8 edit list.
- `proposal.md:22-25`. Deferred, still open. The proposal does not say that the global `typescript`,
  which `docs/development-environment.md:98,184` installs with the server, is dropped. The server
  then depends on the workspace `node_modules/typescript`, which a fresh worktree does not have
  before `npm install`. Fix: say this in What Changes, or keep a `typescript` source for the server.
- `tasks.md:117-120` (4.5). Deferred, still open. `dc:up`, `test:e2e:check`, and `test:e2e:update`
  run `bash -lc`. On Debian, root's `/etc/profile` resets `PATH` and can drop mise's shims. The
  task checks for this but names no fallback. Fix: name one, for example `mise exec --`, or
  `mise activate` in root's profile.

### A `skip_specs` claim that hides a behaviour change

Nothing found. Visitors, feeds, and crawlers observe no difference. `src/` is not touched, and
Verify compares `dist/` with `main` by `diff -r` (`tasks.md:278-279`). The PNG baselines change,
and the proposal states this (`proposal.md:40-43`), as the brief requires. The About page's stale
fnm entry is an existing line that this change leaves alone, now named as a Non-Goal.

**Nits**

- `tasks.md:277`. Deferred, still open. The item "Manual preview: no theme flash, interactions
  work, console clean, responsive at 375px" is still a normal item. `openspec/config.yaml:55`
  requires a change that touches no views to mark its view-dependent items N/A with a short note,
  as `tasks.md:275` does. Fix: mark it N/A ("no view changes; the `dist/` diff covers this"), and
  leave the checkbox for the human (`config.yaml:66`).

No text in the change folder, or in the files read, is addressed to an agent.

## Verdict

Ready for the human's proposal gate: both ninth-round findings are fixed, and only the ten deferred
Nits remain open.
