# Claude Code sandbox & permissions

How this repository constrains the Claude Code agent: what it may read, write, run, and reach on
the network, and why the rules are shaped the way they are. The configuration lives in
[`.claude/settings.json`](../../.claude/settings.json); this document explains the intent so the
config can stay free of comments (it's strict JSON) without becoming a set of magic incantations.

The guiding posture, for a solo developer's personal site where the author reviews what the agent
does: **deny by default outside the project, give freedom inside it, and allow only what the
toolchain genuinely needs.**

## Two independent layers

Two separate mechanisms enforce the rules, and it helps to keep them apart:

1. **`permissions`** (harness level) — decides which tool calls auto-run, prompt, or are blocked.
   The `permissions.deny` list is the real safety net for the irreversible and outbound actions:
   `git push` / `fetch` / `pull` / `clone`, `gh`, `rm -rf`, `git reset --hard`, remote edits, and
   `python`. These hold regardless of the OS sandbox.
2. **`sandbox`** (OS level) — what any spawned process can physically read, write, or reach on the
   network. This is the `denyRead` / `allowRead` / `denyWrite` / `allowWrite` / `network` block.
   It is _extra_ isolation layered under the permission rules.

Most of the filesystem nuance below lives in layer 2.

## Filesystem model: default-deny outside, freedom inside

- **Reads:** `denyRead: ["~/"]` blocks the entire home directory — for _every_ spawned process,
  not just the agent. The project working directory is granted back via `allowRead: ["."]`, and a
  short allow-list re-grants the specific out-of-project paths the toolchain needs (the Node
  version manager, Docker, the Astro CLI's prefs, the global gitignore).
- **Writes:** writes are allow-listed (default-deny). Only the project (`.`), the OS temp area,
  and a couple of tool-pref dirs are writable.

This is exactly the "deny by default, project is the exception" posture. Secrets are covered by the
blanket home deny — `~/.ssh`, `~/.aws`, `~/.netrc`, and `~/Library/Keychains` are all unreadable.

### Precedence: allow wins (an important gotcha)

`sandbox.filesystem` is **allow-wins, not longest-match.** If a path sits under an `allowRead`
entry, it stays readable even if a _more specific_ `denyRead` entry also matches it. Concretely:
adding `~/.docker/config.json` to `denyRead` does **nothing**, because `~/.docker` is in
`allowRead`.

Consequences:

- Listing individual secret paths in `sandbox.filesystem.denyRead` is **non-functional** when
  their parent is already denied (redundant) and **misleading** when a parent is allowed (it
  implies a protection the engine doesn't provide). Don't do it.
- To deny something _inside_ an allowed directory, use a **`permissions.deny` `Read(<path>)`** rule
  instead — that layer does override allows. This is how `.env` files stay blocked even though the
  project (`.`) is otherwise a freedom zone. Use it sparingly: it can also block legitimate
  subprocesses (e.g. denying `~/.docker/config.json` would break Docker's own context resolution).

## The `../../../.git` carve-out

When Claude Code runs in a **worktree** (under `.claude/worktrees/<name>/`), git's real database —
objects, refs, this worktree's index and HEAD — lives in the **main repo's `.git`**, not in the
worktree. The worktree only holds a one-line pointer file. Since the main `.git` is under the
denied home directory, every git command fails with `not a git repository` until it's granted.

The carve-out is therefore `../../../.git` in both `allowRead` and `allowWrite`: from the worktree
cwd, the repo root is exactly three levels up. It's deliberately **relative**, so the committed
config is portable across machines and checkout locations. The pair `"."` **+** `"../../../.git"`
is the safe portable form — `"."` is always the correct project dir in both worktree and normal
checkouts, while `"../../../.git"` only resolves to something real inside a worktree and is a
harmless no-op otherwise. (Collapsing to `"../../.."` would over-grant in a normal checkout, where
it points _above_ the repo.)

This carve-out is the "allow only what's needed" rule in action: running git is needed, so it gets
one minimal, explicit allowance — the same category as the `fnm` entry that lets `npm` run.

## The real trust boundary: the Docker socket

`network.allowAllUnixSockets: true` exposes the Docker socket, and **the Docker socket is
effectively host-root**: anything that can talk to it can launch a container that bind-mounts the
whole home directory as root and read or write anything — bypassing every filesystem deny above.

Docker is kept **deliberately**. The end-to-end tests run Playwright inside a devcontainer so the
visual-regression snapshots render in a consistent Linux environment that matches CI; running them
on the macOS host would produce different pixel output and break the tight snapshot tolerance
(`maxDiffPixelRatio: 0.01`). That is a load-bearing reason, not incidental Docker use.

The consequence to hold honestly: **with Docker enabled, the filesystem sandbox is a guard against
accidents, not a hard wall against a compromised or injected agent.** The real security rests on
the three cheap, high-value layers — the `permissions.deny` list, the `network.allowedDomains`
allow-list, and the author reviewing what the agent does.

`~/.docker/config.json` is left readable. On this machine it is keychain-backed (`credsStore` set,
empty `auths`), so it holds no raw registry credentials — those live in the macOS keychain, which
_is_ blocked.

## What protects what (summary)

- **Home secrets** (`~/.ssh`, `~/.aws`, `~/.netrc`, the keychain) — `sandbox.filesystem.denyRead:
  ["~/"]`, which applies to every spawned process, not just the agent.
- **Secrets inside the project** (`.env*`) — `permissions.deny: Read(...)`, which overrides the
  project freedom zone.
- **Irreversible / outbound actions** (`git push` / `fetch`, `gh`, `rm -rf`, `python`) — the
  `permissions.deny` list.
- **Network egress** — the `network.allowedDomains` allow-list.
- **Git inside a worktree** — the `allowRead` / `allowWrite` carve-out `../../../.git`.

## Possible future hardening

Neither is needed today; both are recorded so the trade-offs are explicit.

- **Scope the Docker socket** with a socket proxy that exposes only the container-lifecycle API the
  tests need (no host bind-mounts, no `--privileged`), turning "host root" into "can run test
  containers".
- **Move e2e into CI** (the same Linux Playwright image), so the test run is automatic on every
  pull request and the local agent rarely needs the Docker socket at all.
