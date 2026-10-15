# Code intelligence

Two tools give Claude Code code-intelligence in this repo. Both run **on the host** (where the
interactive session runs, not the devcontainer) and are **pinned and enabled in committed config** —
the pins in `package.json` and `.mcp.json`, the enabling in `.claude/settings.json` — so a fresh
clone reproduces the setup with no per-machine step (see [sandbox.md](sandbox.md)).

## typescript-lsp (a Claude Code plugin)

The official [`typescript-lsp`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/typescript-lsp)
plugin adds go-to-definition, find-references, and error-checking for `.ts/.tsx/.js/.jsx`.

- **Enabled** via `enabledPlugins` in [`.claude/settings.json`](../../.claude/settings.json)
  (committed). The `claude-plugins-official` marketplace is built into Claude Code, so this plugin
  needs no marketplace registration (`extraKnownMarketplaces`) — that's only for custom/third-party
  sources such as the [brokenrobot-xyz/agent-skills](https://github.com/brokenrobot-xyz/agent-skills)
  marketplace the skill plugins come from (see [workflow.md](workflow.md)).
- The plugin launches a fixed `typescript-language-server --stdio` from `PATH` — the command is set
  in the marketplace manifest and is **not** project-configurable. Claude Code's launch `PATH` does
  **not** include the repo's `node_modules/.bin`, so the server comes from mise, pinned in
  [`mise.toml`](../../mise.toml) — a single install covers every worktree, and mise's tools must be
  on the `PATH` Claude Code starts with. See
  [../development-environment.md § Toolchain (mise)](../development-environment.md#toolchain-mise)
  for the setup step.
- Inside this repo the server uses the project's own pinned `typescript`.

## Codegraph (an MCP server)

[Codegraph](https://github.com/colbymchenry/codegraph) (`@colbymchenry/codegraph`) serves a
pre-indexed SQLite code graph so the agent gets symbols, call paths, and impact analysis in a single
call instead of grep/read loops. Indexing and queries are 100% local and need no credentials, and the
only network call left is `mise install` fetching the pinned package once per machine. Both of
codegraph's own outbound calls are off, through `CODEGRAPH_TELEMETRY=0` and the cross-tool
`DO_NOT_TRACK=1` in [`.claude/settings.json`](../../.claude/settings.json), alongside the other
tools' opt-outs. Two things follow: telemetry is on by default and its CLI opt-out is saved
per-machine (`~/.codegraph/telemetry.json`), so the committed env vars are what make "off"
reproducible; and `DO_NOT_TRACK` also silences the background update check, so a new codegraph
release is something to go looking for — it is not a devDependency either, so `npm outdated` will
not surface it.

- **Registered** in [`.mcp.json`](../../.mcp.json) as a bare `codegraph serve --mcp`; the version
  is pinned in [`mise.toml`](../../mise.toml) — read the pin there, never from this page.
  Claude Code launches MCP servers before anything can install dependencies, so a
  `node_modules/.bin/…` path is simply absent in a fresh worktree and the server never starts for
  that session; mise's install exists before the session starts, so the bare command has no such
  dependency. Codegraph is deliberately **not** a devDependency: nothing loads it from
  `node_modules`, and keeping it out cuts a 293 MB platform binary from every worktree's install in
  favour of one mise install per machine. **Enabled** through `enabledMcpjsonServers` in the committed
  [`.claude/settings.json`](../../.claude/settings.json) — a clone gets it without a setup step.
- `CODEGRAPH_EXPLORE_DEDUP=0`, alongside those env vars, keeps `codegraph_explore` returning
  verbatim line-numbered source on **every** call. Codegraph 1.6.0 made deduplication the default:
  source already shown earlier in a conversation comes back as a short pointer (path, symbols, line
  range) instead. That saves context, but a pointer is not something `Edit` can match against, so
  the tool stops being the Read-equivalent its own instructions promise. Turning it on is a
  deliberate change to make on its own, not a side effect of a version bump.
- We deliberately do **not** run `codegraph install` — that writes a global `~/.claude.json` entry
  pointing at a global binary, defeating the repo-scoped version pin in `mise.toml`.
- The index lives in `.codegraph/` (SQLite + a daemon lock). It is **checkout-specific** — the lock
  and DB are tied to the path that wrote them — so it is **gitignored** and never shared between
  worktrees.

### Session start

The [`SessionStart` hook](../../.claude/settings.json) runs
[`.claude/hooks/session-start.sh`](../../.claude/hooks/session-start.sh) at the start of **every**
Claude Code session (startup and resume), in whatever checkout it opens in — the main clone or a
worktree. It's idempotent and cheap on the common path; a fresh worktree is simply the case where it
has real work to do, since it contains only tracked files and so starts with neither `node_modules/`
nor `.codegraph/`. It runs four steps and ends every session with a short step report — successes
and failures alike — delivered to both the user and the model (Claude Code reads hook output only
once the script exits, so the report arrives at the end rather than streaming):

1. **Tool sanity check** (report-only): mise is present, every pin in `mise.toml` is installed
   (mise's own answer, `mise ls --current --missing`), and `git`, `node`, `npm`, `jq`, `codegraph`,
   `openspec` and `typescript-language-server` are on `PATH`. Problems point at the `checking-dev-env` skill, whose fix guide is built from
   [development-environment.md](../development-environment.md#troubleshooting)'s Troubleshooting
   entries — the hook diagnoses, it does not install tools.
2. **Containers check** (report-only): Docker is installed, its daemon is running, and the
   devcontainer CLI is present — the same probe the `checking-dev-env` skill runs. Only the
   e2e/visual-regression suite needs them, so nothing gates on the result; a stopped daemon shows in
   the report before `mise run dc:up` fails.
3. **Dependencies**: `npm install`, but only when `node_modules/` is missing or
   `package-lock.json` has changed since the last successful install — a stamp inside
   `node_modules/` holds the lockfile's git hash, so a partial or wiped install self-invalidates.
   It's `npm install` rather than `npm ci` because the sandbox denies deleting one path inside
   `node_modules`, which `npm ci`'s wipe trips over; with the lockfile intact both resolve to the
   same tree. The same denial surfaces during install as a
   `npm warn tar TAR_ENTRY_ERROR EPERM … .vscode/settings.json` — benign: npm skips that one file
   and the install succeeds.
4. **Codegraph index**: `codegraph status --json` as the health probe — healthy ⇒ `sync -q`
   (~0.2s) to catch between-session drift (e.g. edits or `git switch`/`pull`/`rebase` made while
   no session's file watcher was running); uninitialized ⇒ `init`; built by an older codegraph or
   unreadable ⇒ `index` rebuild.

While a session is open, `codegraph serve --mcp` runs a file watcher that auto-syncs on save, so the
hook's job is really the first-run build plus between-session catch-up.

The hook is Claude Code's entry point only — it reads `CLAUDE_PROJECT_DIR` and has no `mise run`
task. Its probes, though, live in
[`.claude/hooks/lib/dev-env-checks.sh`](../../.claude/hooks/lib/dev-env-checks.sh), shared with the
`checking-dev-env` skill and runnable by hand (`bash .claude/hooks/lib/dev-env-checks.sh` — read-only,
exits non-zero on any ✗). The mutating steps stay manual: run `npm install` and
`mise run codegraph:init` yourself; `mise run codegraph:status` reports the index/sync state.

> In a fresh worktree the server is up before the index exists, because Claude Code launches it
> before this hook can build one. Queries in that window answer with "no index — use Read/Grep/Glob"
> rather than failing or guessing, and the running server picks the index up on its own once the
> hook finishes — no restart needed.

> A worktree **nested inside the main checkout** — which is where Claude Code puts them,
> `.claude/worktrees/<name>/` (see [sandbox.md](sandbox.md)) — gets **no index of its own**:
> codegraph's project detection walks up from the worktree and anchors on the main checkout's
> `.codegraph/`. The health probe does **not** fail on that. It answers `initialized:true` for the
> parent's index even while a live session's MCP server holds the database — WAL mode admits
> concurrent readers — and it names the split in a `worktreeMismatch` field carrying both
> `worktreeRoot` and `indexRoot`. So the hazard is not a missing index but a **misattributed** one:
> queries made from the worktree answer from the main checkout's files, which is wrong exactly when
> the branch has diverged. Read codegraph results in a nested worktree as the parent's, and fall
> back to Read/Grep/Glob for anything the branch changed. A checkout with no `.codegraph/` in any
> ancestor is unaffected — it probes `initialized:false` and inits normally.
>
> Re-verified September 2026 against codegraph **1.5.0 and 1.6.0**, with a parent daemon holding the
> database; both behave identically, so 1.6.0's project-resolution work does not touch this. What
> stays untested is the **write** path: whether `index`/`init` from inside the nested worktree fails
> on the parent's lock, and which file set it would write if it did not. Running it rebuilds the
> shared parent index, so it is not a probe to fire casually — the earlier "database file is in use"
> report most likely came from that write path rather than from the probe.
