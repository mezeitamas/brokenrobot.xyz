# Brief

## Problem and goal

Tool versions are declared in many places that drift apart: Node in `.node-version` and the
devcontainer, Terraform in CI and the devcontainer (no local pin), openspec as a devDependency
while the `/opsx` commands use an unpinned global CLI, codegraph in three places held together by a
drift check, and jq and typescript-language-server not pinned at all. A contributor's machine,
the devcontainer, and CI can each run different versions, and the SessionStart report already shows
local Node and openspec off their pins.

Goal: one committed, checksummed declaration fixes every tool version, and a contributor's machine,
the devcontainer, and every CI job get exactly those versions from it. Visitors see no change: the
built site is identical. The change alters no spec (`skip_specs`).

## Decisions

- **mise is the only toolchain manager.** `mise.toml` plus `mise.lock` hold the only pins.
- **Tools in `mise.toml`:** node, jq, openspec, codegraph, typescript-language-server, terraform.
  The npm scripts stay; no mise tasks.
- **Versions carry over unchanged:** node 26.8.1, openspec 1.13.2, codegraph 1.6.0, terraform
  1.16.0. New pins: jq 1.8.2, typescript-language-server 6.0.1. Bumps are a later, separate change,
  so a Verify failure points at the migration only.
- **Pins removed:** `.node-version`; the `@fission-ai/openspec` devDependency; the codegraph
  version in `.mcp.json`, the `codegraph:*` scripts, and `CODEGRAPH_VERSION` in
  `.claude/hooks/lib/dev-env-checks.sh` (callers use a bare `codegraph`; the drift check goes);
  `setup-node`, `setup-terraform`, and the devcontainer's node and terraform features.
- **SessionStart hook / `checking-dev-env`:** read `mise.toml` as plain text, compare each pin with
  the tool on PATH, report `mise install` as the fix, and check separately that mise is installed
  (replaces the fnm/nvm/asdf/volta probe). The report must stay useful on a machine without mise.
- **One image everywhere:** the devcontainer and all five CI jobs run in
  `ghcr.io/jdx/mise:<version>-debian`, pinned by digest, so visual baselines render in an identical
  environment locally and in CI. Each CI job runs `mise install --locked` with its own
  `MISE_ENABLE_TOOLS` list (verify-site: node, openspec; verify-infrastructure: terraform;
  verify-tooling: node and whatever `hooks:check` needs; build-site and test-site: node).
- **CI caching:** an `actions/cache` step (SHA-pinned) for `~/.npm` in the three npm jobs, keyed on
  OS, Node pin, and the `package-lock.json` hash. No mise tool cache for now.
- **Visual baselines are regenerated once** in the new image (Debian fonts differ from Ubuntu). The
  PNGs change; the site does not. The proposal states this.
- **Docs follow:** `docs/development-environment.md` makes mise required; other references to fnm
  and `.node-version` are updated.

## Rejected directions

- **Node only in mise:** leaves openspec and codegraph pins scattered.
- **mise tasks replacing npm scripts:** they pay off in a multi-stack monorepo; this is one project.
- **Splitting into direct commits plus a CI change:** two Node pins would coexist in between.
- **`setup-node` reading `mise.toml`, or `jdx/mise-action` on the runner:** superseded by running
  every job in the same image as the devcontainer.
- **Keeping devcontainer features with a version check:** keeps extra pins.
- **Install script in the Ubuntu devcontainer:** chosen against in favour of one shared image.
- **Bumping versions during the migration:** mixes two causes of failure.
- **The hook asking mise (`mise ls --current --json`):** the report collapses when mise is missing.

## Open questions and scope

Unchecked assumptions the proposal must settle or turn into tasks that test them:

- `MISE_ENABLE_TOOLS` together with `mise install --locked`.
- `playwright install --with-deps` as root inside the container job.
- Image pull time per job; the mise release and image digest to pin.
- The devcontainer on the mise image: the `vscode` user, `sudo chown` in `postCreateCommand`, the
  `node_modules` volume.
- The exact tool list `hooks:check` needs.

Sandbox: mise's binary, data, and state directories (the trust store included) need access.
`.claude/settings.json` is not writable by agents; the human makes that edit, and the tasks say so.

Touches: `mise.toml`, `mise.lock`, `.gitignore` if needed, `.github/workflows/pipeline.yml`,
`.devcontainer/`, `package.json`, `package-lock.json`, `.mcp.json`, `.claude/hooks/` and its tests,
the `checking-dev-env` skill and evals, `docs/`, the visual baselines. Leaves alone: `src/`, site
output, `infra/` Terraform code, `deploy.yml` (it installs no tools).

## Answers

- **The `typescript-language-server` devDependency:** remove it. `mise.toml` is its only pin.
- **Proposal gate, first round:** fix all four Blocking findings in `review.md` (the verify steps of
  tasks 3.1, 3.3, 4.6, and 5.8). The Should-fix items and Nits are not part of this round.
- **`mise trust` in the forbidden commands of `checking-dev-env`:** yes, keep it.
- **Proposal gate, second round:** fix all five Should-fix findings in `review.md` — the four
  deferred from round one, and the new one (task 2.5 deletes the "Node version management" section
  that the `checking-dev-env` skill and its eval still point at). The Nits are not part of this
  round.
- **Proposal gate, third round:** fix both new Should-fix findings in `review.md` — `mise which`
  called for tools mise does not manage (D6, the hook test suites), and eval 7's setup still
  expecting `✗ codegraph: not checked`. The Nits are not part of this round.
- **Proposal gate, fourth round:** fix both new Should-fix findings in `review.md`, in this
  direction, so the hook-test area stops producing new gaps:
    - The hook test suites never see mise's shims. Each case runs on a PATH built only from real
      binaries linked at suite start, never the inherited PATH, so the fixture's untrusted
      `mise.toml` cannot reach any case.
    - D6 and eval 7 describe a real machine: with node missing, codegraph, openspec, and
      typescript-language-server are reported missing too, and the codegraph line says
      `not checked`.

    The Nits are not part of this round.

- **D9 stop rule:** yes, keep it. If CI finds screenshot differences that the devcontainer does
  not, the implementer stops and reports.
- **Multi-platform image digest:** yes, keep it. One pin serves the arm64 devcontainer and amd64 CI.
- **Proposal gate, fifth round:** fix both new Should-fix findings in `review.md` — no artifact
  says how a new git worktree gets its `mise.toml` trusted, and eval 7 expects folding that the
  `checking-dev-env` skill's Step 3 matching rule does not produce. The Nits are not part of this
  round.
- **Proposal gate, sixth round:** fix both Blocking and both Should-fix findings in `review.md`.
  Direction for the Blocking ones: the trust test needs no git worktree. mise's settings reference
  says `trusted_config_paths` "covers config files at or below these paths, including projects you
  create there later". So the test puts a copy of the change's `mise.toml` in a temporary directory
  under the clone and checks that mise trusts it without asking. The real new-worktree check moves
  to a manual step at the human's implementation gate, after the change is committed. The Nits
  are not part of this round.
- **Proposal gate, seventh round:** rebase D10 on mise's built-in trust behaviour, and fix the one
  Should-fix in `review.md` in the same round. `mise trust --help` (mise 2026.10.0, checked on
  this machine) says: safe configs ("only `min_version`, `[tools]` entries with plain version
  strings (or arrays of them), and `[tasks]` without templates or tool options") need no trust in
  normal mode; `mise install` and `mise exec` automatically trust their active config; and trust
  is shared across git worktrees — a config in a linked worktree is trusted when the same path in
  the main checkout is trusted (paranoid mode disables this). Direction:
    - Keep `mise.toml` safe if the design allows it, so no trust step is needed. If D1's aliases or a
      `[settings]` table rule that out, the step is one `mise trust` in the main clone.
    - Drop the global `trusted_config_paths` setting either way.
    - Replace task 1.3 and the 2.6 copy test with one check: in the clone, `mise trust --show` and
      `mise install --dry-run` raise no trust error.
    - Move the new-worktree check to after the code commit and before archive, so it is ticked
      before the merge.

    The Nits are not part of this round.

- **Proposal gate, eighth round:** fix the Blocking finding (the main clone stays on `main` with
  no `mise.toml` while this change is built in its worktree, so `mise trust` there fails) this
  way:
    - The change is implemented in its normal worktree. The implementer runs `mise trust` inside
      that worktree, for this change only.
    - The shared-trust / new-worktree check leaves `tasks.md`: it cannot pass before the merge.
    - The docs gain a one-time setup step: after this change merges, run `mise trust` once in the
      main clone; later worktrees share that trust.
    - D10's worktree sharing stays backed by mise's documentation; this change does not test it.
      The first change after the merge exercises it.

    The Nits are not part of this round.

- **Proposal gate, ninth round:** fix both findings in `review.md`:
    - Blocking: run Prettier over the change folder so `format:check` passes.
    - Should-fix: name the About page's fnm entry (`src/pages/about/index.astro`) as a Non-Goal.
      This change leaves visible site content alone; updating that line is a separate follow-up
      after the merge.

    The Nits are not part of this round.
