# Development environment

How to set up a machine to work on brokenrobot.xyz. This is the human counterpart to the root
[README](../README.md) quickstart (`npm install` / `mise run start`): it covers the prerequisites, the
tooling that `npm ci` doesn't install, and how the pieces fit together. It **links** the sources of
truth rather than restating them, so versions and commands live in one place.

## Prerequisites

| Tool   | Needed for                                              | How to get it                                      |
| ------ | ------------------------------------------------------- | -------------------------------------------------- |
| git    | cloning, and the session hook's lockfile stamp          | macOS Command Line Tools, or `brew install git`    |
| mise   | every other tool, pinned in [`mise.toml`](../mise.toml) | see [Toolchain (mise)](#toolchain-mise)            |
| Docker | only the e2e / visual-regression suite                  | see [Host vs. devcontainer](#host-vs-devcontainer) |

npm comes with the Node that mise installs. `engines` in [`package.json`](../package.json) sets
floors for both (Node ≥ 26.8.1, npm ≥ 11.19.0), and [`.npmrc`](../.npmrc) sets `engine-strict=true`,
so an install **fails** below them — that catches a shell that isn't using mise's Node. `.npmrc`
also sets `save-exact=true` (dependencies are pinned to exact versions, no `^`).

## Toolchain (mise)

[mise](https://mise.jdx.dev) is required. [`mise.toml`](../mise.toml) is the only place tool
versions are pinned: Node, jq, Terraform, openspec, codegraph, and typescript-language-server.
Nothing is installed globally with npm.

1. Install mise — see [mise's install guide](https://mise.jdx.dev/installing-mise.html).
2. Put mise's tools on `PATH` in your shell profile, then start Claude Code from that shell:

    ```sh
    eval "$(mise activate zsh)"                                         # interactive shells
    export PATH="${MISE_DATA_DIR:-$HOME/.local/share/mise}/shims:$PATH" # everything else
    ```

    `mise activate` updates `PATH` at each prompt. Claude Code's commands, the codegraph MCP server,
    and the language server never see a prompt, so the shims line is what keeps them on the pinned
    tools.

3. In the checkout: `mise install`.

`mise.toml` holds only plain tool versions, so mise reads it without a `mise trust` step, in the
main clone and in every worktree.

## Install

```sh
git clone git@github.com:brokenrobot-xyz/website.git
cd website
npm ci         # reproducible install from the committed package-lock.json
mise run start # dev server on http://localhost:4321
```

Use `npm ci` (not `npm install`) for a clean, lockfile-exact install. Every project command is a
task in [`mise.toml`](../mise.toml): `mise tasks` lists them, and `mise run preflight` runs every
check CI runs except the e2e suite. One check also runs alone, e.g. `mise run type:check`.

### The dev server in the background

Since Astro 7, `astro dev` **detaches automatically when it detects an AI coding agent**, so it
does not block the agent's terminal. Started that way it is managed through subcommands rather
than Ctrl-C:

```sh
npx astro dev status  # URL, PID, uptime
npx astro dev logs -f # stream the log (also at .astro/dev.log)
npx astro dev stop    # SIGTERM, escalating to SIGKILL after 5s
```

A lock file at `.astro/dev.json` (gitignored) records the URL, port and PID, and stops a second
server being started for the same project. Related flags: `--background` to detach explicitly,
`--force` to replace a running server, and `--ignore-lock` to start one _alongside_ an existing
server — the latter is untracked, so `stop`/`status`/`logs` will not see it. Set
`ASTRO_DEV_BACKGROUND=0` to opt out and run in the foreground.

The dev server also exposes `/_astro/status`, returning `{"ok":true}` — a better readiness check
than sleeping. It exists only in dev, never in a build.

Running a dev server per worktree is fine (each has its own `.astro/`, so the locks are
independent), but they all default to port 4321 — give each one `--port`.

> **Caveat when an agent starts the server on the host.** See
> [sandbox](tooling/sandbox.md#the-dev-server-lock-file) — the lock file is not written under the
> Claude Code sandbox, which leaves the server unmanageable by `astro dev stop`.

## Host vs. devcontainer

Do day-to-day development — and run your Claude Code session — **on the host**. The
[devcontainer](../.devcontainer/devcontainer.json) exists for **one** job: the Playwright
visual-regression e2e suite, which must render in a Linux environment matching CI (host macOS
rendering is not authoritative). Drive it through the mise tasks:

```sh
mise run dc:up           # bring the devcontainer up (installs deps + Playwright browsers)
mise run test:e2e:check  # build + run the visual-regression / a11y suite inside it
mise run test:e2e:update # regenerate snapshots for an intentional visual change
```

Why git and Docker behave the way they do under the agent sandbox is documented in
[tooling/sandbox.md](tooling/sandbox.md).

## Code-intelligence tools (Claude Code)

Two tools give Claude Code code intelligence in this repo; the full rationale is in
[tooling/code-intelligence.md](tooling/code-intelligence.md). mise installs both (see
[Toolchain (mise)](#toolchain-mise)):

- **typescript-lsp plugin** — the plugin launches a bare `typescript-language-server` from your
  shell `PATH`, which is why mise's tools must be on the `PATH` Claude Code starts with. Inside this
  repo the server uses the project's own pinned `typescript`.
- **Codegraph MCP server** — [`.mcp.json`](../.mcp.json) starts a bare `codegraph` from the same
  `PATH`; the `SessionStart` hook described below builds its index.

## Worktrees

This repo is worked on in git worktrees. A fresh worktree checks out only tracked files, so it starts
with **no `node_modules/` and no `.codegraph/`** (both gitignored). Claude Code brings one up to speed
automatically: its `SessionStart` hook — which runs in every session, worktree or not — installs
dependencies when `node_modules/` is missing or `package-lock.json` has changed, then builds or
refreshes the Codegraph index (with a caveat for nested worktrees — see the note in
[tooling/code-intelligence.md](tooling/code-intelligence.md)). Outside a session, run `npm install`
yourself.

Details, including the between-session sync behavior, are in
[tooling/code-intelligence.md](tooling/code-intelligence.md); why worktrees sit under
`.claude/worktrees/` and how the sandbox treats them is in [tooling/sandbox.md](tooling/sandbox.md).

## Editor

Formatting is governed by [`.editorconfig`](../.editorconfig) (LF, UTF-8, final newline, 4-space
indent — 2 for `.tf`/`.yml`). The [devcontainer](../.devcontainer/devcontainer.json)
declares the recommended extensions, worth installing in your host editor too:

- **EditorConfig**, **Prettier**, **ESLint** — formatting and linting parity with CI.
- **Astro**, **Tailwind CSS**, **MDX** — first-class support for the stack.
- **Terraform**, **YAML** — infrastructure and CI config.
- **Playwright** — running/debugging the e2e suite.

## Verify

After setup, confirm the environment:

```sh
mise ls --current --missing # prints nothing when every pin is installed
mise run type:check         # Astro + tsc, no errors
mise run lint:check         # ESLint clean
mise run format:check       # Prettier clean
mise run build              # production build succeeds
openspec config get profile # core — the six-workflow set the repo commits
mise run codegraph:status   # "Index is up to date"
```

In Claude Code, `/plugin` should list **typescript-lsp** as enabled, and `/mcp` should show
**codegraph** connected.

## Troubleshooting

The symptoms below are the ✗ lines emitted by the Claude Code `SessionStart` report and by the
`checking-dev-env` skill — both run the same probes,
[`.claude/hooks/lib/dev-env-checks.sh`](../.claude/hooks/lib/dev-env-checks.sh). Per this doc's
charter each entry links the fix rather than restating it; the skill turns matching entries into
an ordered setup guide. (Detection wording lives in the lib; keep these headings in step with it.)

### ✗ git missing

Install with Homebrew: `brew install git`.

### ✗ mise missing · ✗ mise cannot read mise.toml

For `mise missing`, install mise — see [Toolchain (mise)](#toolchain-mise). For
`cannot read mise.toml`, run `mise install` in the checkout: it prints mise's own error.

### ✗ … not installed — mise.toml pins it

Run `mise install` in the checkout.

### ✗ node missing · ✗ npm missing · ✗ jq missing · ✗ codegraph missing · ✗ typescript-language-server missing · ✗ openspec missing

Run `mise install` in the checkout. When `mise ls --current --missing` already prints nothing, the
tools are installed but not on the `PATH` Claude Code started with — fix step 2 of
[Toolchain (mise)](#toolchain-mise), then restart Claude Code from a new terminal.

### ✗ dependencies: node_modules missing or stale · ✗ npm install failed

Run `npm ci` from the checkout — see [Install](#install). Inside a Claude Code session the
`SessionStart` hook installs on the next session start by itself.

### ✗ openspec profile is …

`openspec config profile core` — once per machine. The committed `/opsx` integration is the
six-workflow core set; on any other profile `openspec update` regenerates only that profile's
workflows and leaves the rest stale at the previous version. Why the setting is machine-global
rather than committed is in [tooling/workflow.md § Setup](tooling/workflow.md#setup).

### ✗ typescript-lsp plugin not enabled

The plugin is committed in [`.claude/settings.json`](../.claude/settings.json) under
`enabledPlugins`, so a ✗ means this checkout's settings diverged — restore
`"typescript-lsp@claude-plugins-official": true` there, or re-enable it via `/plugin` in a session.

### ✗ codegraph MCP not enabled

Both halves are committed: [`.mcp.json`](../.mcp.json) registers the server and
[`.claude/settings.json`](../.claude/settings.json) enables it through `enabledMcpjsonServers`. A ✗
means this checkout's config diverged — restore `"codegraph"` to that list. Background in
[tooling/code-intelligence.md](tooling/code-intelligence.md).

### ✗ codegraph: no index · index unreadable · built by an older codegraph

Run `mise run codegraph:init` in the checkout, or start a Claude Code session and let the
`SessionStart` hook rebuild it. Caveats (nested worktrees, the fresh-worktree race) are in
[tooling/code-intelligence.md](tooling/code-intelligence.md).

### ✗ docker missing · ✗ docker daemon not running · ✗ devcontainer CLI missing

Only the e2e/visual-regression suite needs these — see
[Host vs. devcontainer](#host-vs-devcontainer). Install and start Docker Desktop; the
devcontainer CLI ships as a devDependency, so a plain `npm ci` provides it.

### ✗ dependencies: not checked · ✗ codegraph: not checked · ✗ claude code integration: not checked · ✗ cannot enter …

Cascades, not separate problems: a missing prerequisite (node, npm, codegraph, or jq — named in the line's
parentheses) kept that probe from running at all. Fix the root-cause ✗ in the entries above and
these clear on the next run. The `cannot enter` line means the checkout path itself was
inaccessible — re-run from the repo root.

### Verify-suite failures (`type:check`, `lint:check`, `format:check`, `build`)

Those are code problems, not environment ones — this section ends where the `running-preflight-checks`
skill (or the [`mise.toml`](../mise.toml) tasks run by hand) takes over.
