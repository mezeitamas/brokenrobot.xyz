# Proposal

## Why

The repository declares its tool versions in many places, and these places drift apart. Node is
pinned in `.node-version` and again in a devcontainer feature. Terraform is pinned in CI and in a
devcontainer feature, with no local pin. openspec is a devDependency, but the `/opsx` commands run
an unpinned global CLI. codegraph is pinned in three places that a drift check holds together. jq
has no pin. typescript-language-server is a devDependency only as a "version reference", and the
global server that Claude Code actually runs has no pin. A contributor's machine, the devcontainer,
and CI can each run a different version. The SessionStart report already shows local Node and
openspec off their pins.

## What Changes

- Add `mise.toml` and `mise.lock` at the repository root. They are the only place that pins a tool
  version. The tools are node 26.8.1, jq 1.8.2, openspec 1.13.2, codegraph 1.6.0,
  typescript-language-server 6.0.1, and terraform 1.16.0. These are the current versions; this
  change bumps no version.
- Remove every other pin:
    - `.node-version`.
    - The `@fission-ai/openspec` and `typescript-language-server` devDependencies (and their
      entries in `package-lock.json`). The brief's list names only the first one. The human
      confirmed the second one (brief, Answers), so `mise.toml` is the only pin of
      typescript-language-server.
    - The codegraph version in `.mcp.json` and in the `codegraph:*` npm scripts, and
      `CODEGRAPH_VERSION` in `.claude/hooks/lib/dev-env-checks.sh`. All callers run a bare
      `codegraph`. The codegraph pin-drift check goes, because one pin cannot drift.
    - `actions/setup-node` and `hashicorp/setup-terraform` in CI.
    - The devcontainer's node and terraform features.
- Run the devcontainer and all five CI jobs in one image, `ghcr.io/jdx/mise:<version>-debian`,
  pinned by digest. Each CI job runs `mise install --locked` for only the tools it needs. The three
  npm jobs cache `~/.npm` with a SHA-pinned `actions/cache` step.
- Change the SessionStart hook and the `checking-dev-env` skill: they read `mise.toml` as plain
  text, compare each pin with the tool on `PATH`, and give `mise install` as the fix. A separate
  check reports whether mise is installed. This check replaces the fnm/nvm/asdf/volta probe. The
  report stays useful on a machine without mise. The skill stays read-only: its rule and its
  read-only eval also forbid `mise install` and `mise trust`, because the guide now quotes them as
  fixes.
- Regenerate the Playwright visual baselines once, in the new image. Debian renders fonts
  differently from Ubuntu, so the baseline PNGs change. **The site does not change**: no file in
  `src/` or `dist/` changes, and the baselines change only because the rendering environment
  changed.
- Make mise a required prerequisite in `docs/development-environment.md`. Update every other
  document that names fnm, `.node-version`, a global `npm i -g` install of a pinned tool, or the
  removed pins. Site pages are not documents in this sense: the About page keeps its fnm entry
  (see Non-Goals).
- **BREAKING** for contributors: a machine needs mise, and `mise install` replaces the global
  `npm i -g` installs and the Node version manager. A machine without mise still gets a SessionStart
  report, which says what is missing.

## Non-Goals

- **No version bumps.** Every tool keeps its current version. A bump is a separate, later change,
  so that a Verify failure here can only come from the migration.
- **No mise tasks.** The npm scripts stay the entry points.
- **No mise tool cache in CI** for now. Only `~/.npm` is cached.
- **No change to the site.** `src/`, the built output, and the `infra/` Terraform code stay as they
  are.
- **No edit to the About page's tool list.** `src/pages/about/index.astro` lists "Fast Node Manager
  (fnm)" among the tools the site is built with. After this change that entry is out of date, but
  this change leaves visible site content alone: an edit there would change `dist/`, and Verify
  requires `dist/` to equal the output of `main`. A separate change updates that line after this
  change merges. No task in this change edits that file, and no grep in `tasks.md` expects it to be
  free of fnm.
- **No change to `deploy.yml`.** It installs no tools.
- **No change to npm dependencies other than the two removed devDependencies.** The `engines` floor
  in `package.json` and `.npmrc` stay.
- **No edit to `.claude/settings.json` by an agent.** The sandbox needs access to mise's
  directories, but agents cannot write that file. The human makes that edit (see tasks).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. The specs in this project describe what visitors and downstream consumers (feeds, crawlers)
rely on. This change alters only how contributors, the devcontainer, and CI get their tools. The
built site is identical, so no requirement changes. The change's `.openspec.yaml` sets
`skip_specs: true`.

## Impact

- **New files:** `mise.toml`, `mise.lock`.
- **Removed files:** `.node-version`; `.devcontainer/devcontainer-lock.json` if no feature remains.
- **CI:** `.github/workflows/pipeline.yml` — all five jobs move into the mise container image.
- **Devcontainer:** `.devcontainer/devcontainer.json` moves to the mise image; the `dc:up` script in
  `package.json` changes with it.
- **npm:** `package.json` (devDependencies, `codegraph:*` scripts, `dc:up`), `package-lock.json`.
- **Claude Code tooling:** `.mcp.json`; `.claude/hooks/lib/dev-env-checks.sh`,
  `.claude/hooks/session-start.sh`, and their test suites under `.claude/hooks/tests/`; the
  `checking-dev-env` skill and its evals. The human edits `.claude/settings.json` (sandbox access to
  mise's directories and download hosts).
- **Agent-facing files that describe the old environment:** `.claude/agents/frontend-qa-engineer.md`
  and `.claude/skills/testing-visual-regression/SKILL.md` (they say CI and the devcontainer run
  `ubuntu-24.04`), and `.claude/skills/running-preflight-checks/SKILL.md` (its `compatibility`
  field says the devcontainer pins Terraform 1.16.0). They change to describe the mise image and
  `mise.toml`.
- **Visual baselines:** every PNG under `tests/__screenshots__/` is regenerated.
- **Docs:** `docs/development-environment.md`, `docs/tooling/code-intelligence.md`,
  `docs/tooling/workflow.md` (Setup, and the schema-fork upgrade steps that copy from
  `node_modules/@fission-ai/openspec`), `docs/tooling/sandbox.md`, `docs/development/checks.md`,
  `docs/tech-stack.md`.
- **Contributors:** each machine installs mise, runs `mise trust` once in the main clone, and runs
  `mise install` once. An existing clone runs the trust step after this change merges, because its
  main checkout holds no `mise.toml` before then. mise's documentation says that it shares that
  trust with every git worktree under `.claude/worktrees/`, so a new worktree needs no mise step;
  this change does not test the sharing (design D10). The change itself is built in its own
  worktree, which the implementer trusts for this change only. No global mise setting changes. Claude Code must start
  from a shell where mise's tools are on `PATH`, because the typescript-lsp plugin and the codegraph
  MCP server launch bare commands.
- **Dependencies on other changes:** none. No other change is in progress under
  `openspec/changes/`.
