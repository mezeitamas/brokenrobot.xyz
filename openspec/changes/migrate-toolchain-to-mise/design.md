# Design

## Context

See proposal.md — Why. The current state that shapes the approach:

- **CI** (`.github/workflows/pipeline.yml`) has five jobs on `ubuntu-24.04` runners: `verify-site`,
  `verify-infrastructure`, `verify-tooling`, `build-site`, `test-site`. Four jobs use
  `actions/setup-node` with `node-version-file: '.node-version'`; three of them also use its npm
  cache. `verify-infrastructure` uses `hashicorp/setup-terraform` with `terraform_version: '1.16.0'`
  and runs every step in `infra/cloudflare`. `verify-tooling` runs no `npm ci`; the hook suites need
  only bash, git, jq, coreutils, and node.
- **Devcontainer** (`.devcontainer/devcontainer.json`) uses
  `mcr.microsoft.com/devcontainers/base:ubuntu-24.04` with the git, node (26.8.1), and terraform
  (1.16.0) features, locked in `devcontainer-lock.json`. It runs as the `vscode` user, mounts a
  named volume on `node_modules`, and its `postCreateCommand` runs `sudo chown vscode:vscode
node_modules && npm install && npm run install:playwright`. The `dc:up` script repeats that
  command. Its one job is the Playwright suite, whose baselines live in `tests/__screenshots__/`.
- **Hook and skill** share `.claude/hooks/lib/dev-env-checks.sh`. It compares node with
  `.node-version` and openspec with the `@fission-ai/openspec` devDependency (through jq). It only
  checks that typescript-language-server is present. It calls codegraph as
  `npx -y @colbymchenry/codegraph@${CODEGRAPH_VERSION}` and checks that pin against `.mcp.json` and
  the `codegraph:*` scripts. The skill-only `dev_env_check_claude` probes for fnm, nvm, asdf, or
  volta. The suites `dev-env-checks-cases.sh` and `session-start-cases.sh` stub `npx`, `openspec`,
  and `fnm`, and write a `.node-version` fixture.
- **Sandbox** (`.claude/settings.json`) allows writes to `.` and `~/.npm`, not to mise's data,
  state, or cache directories. Its network list has `github.com` and `*.npmjs.org`, but not the
  Node, HashiCorp, or GitHub release-asset download hosts. Agents cannot write this file.
- **Docs** that describe a removed pin: `docs/development-environment.md` (Prerequisites, Node
  version management, Code-intelligence tools, Verify, Troubleshooting),
  `docs/tooling/code-intelligence.md`, `docs/tooling/workflow.md` (Setup, and steps 1 and 3 of the
  schema-fork upgrade copy from `node_modules/@fission-ai/openspec/`), `docs/development/checks.md`
  (Terraform failure note), `docs/tech-stack.md` (Dev container line).
- **Agent-facing files** that state the old environment as fact:
  `.claude/agents/frontend-qa-engineer.md` and `.claude/skills/testing-visual-regression/SKILL.md`
  (CI and the devcontainer both run `ubuntu-24.04`), and the `compatibility` field of
  `.claude/skills/running-preflight-checks/SKILL.md` (the devcontainer pins Terraform 1.16.0).

## Goals / Non-Goals

**Goals:**

- One pin per tool, in `mise.toml`, with checksums in `mise.lock`.
- The devcontainer and every CI job run in the same image digest, so baselines render in the same
  environment locally and in CI, per architecture (D2, D9).
- Each CI job installs only the tools it uses.
- The SessionStart report keeps working, and keeps reporting, on a machine without mise.

**Non-Goals:**

- A mise tool cache in CI. Install time is measured in Verify; a cache is a later change.
- Making the hook install tools. It still diagnoses only; `mise install` stays a step the human
  runs.
- Editing visible site content. The About page (`src/pages/about/index.astro`) keeps its fnm entry;
  a separate change after the merge updates it (proposal, Non-Goals).

## Decisions

### D1. `mise.toml` uses short tool names through aliases

`mise.toml` declares the three npm-backed tools through aliases, so that every key in `[tools]` is
also the command name: `node`, `jq`, `openspec`, `codegraph`, `typescript-language-server`,
`terraform`. The aliases map `openspec` to `npm:@fission-ai/openspec`, `codegraph` to
`npm:@colbymchenry/codegraph`, and `typescript-language-server` to `npm:typescript-language-server`.
Each version is a plain exact string, such as `node = "26.8.1"`.

Why: CI's `MISE_ENABLE_TOOLS` lists, the hook's plain-text parse (D6), and the docs all use one
name per tool. The hook needs no name-to-command table.

Alternative: keys such as `"npm:@fission-ai/openspec"`. Rejected, because each consumer then needs
its own mapping from backend key to command, and the mappings can drift.

The aliases table (`[tool_alias]`) makes `mise.toml` a config that is not "safe" in mise's sense.
`mise trust --help` (mise 2026.10.0) says that only a config with `min_version`, `[tools]` entries
with plain version strings, and `[tasks]` without templates or tool options needs no trust. A probe
on this machine with mise 2026.10.0 confirmed it: a `mise.toml` with a `[tool_alias]` table, or with
a `[settings]` table, fails with "Config files in … are not trusted" in an untrusted directory. The
same file with backend keys in `[tools]` and no other table is read with no trust. So the aliases
cost one trust step per clone (D10). They cannot move elsewhere: the global mise config is per
machine and is not committed, and the devcontainer and CI would each need their own copy. The
backend-key alternative above would make the config safe and remove the trust step, but it puts a
key-to-command rule into the hook, the CI tool lists, and the docs. One `mise trust` per clone is
the smaller cost, because git worktrees share that trust (D10).

`mise.toml` has no `[settings]` table. mise 2026.10.0 has no `lockfile` setting
(`mise settings ls -a` lists none); task 2.3 confirms that `mise install --locked` uses `mise.lock`
with no setting.

`mise.lock` is generated with `mise lock` for the platforms in use: `linux-x64` (CI),
`linux-arm64` (the devcontainer on an Apple-silicon Mac), and `macos-arm64` (the host). The
implementer adds `macos-x64` only if a contributor uses it. `--locked` fails on a platform the
lockfile does not cover, so a missing platform shows up at once.

### D2. One image, pinned by digest, in two files

The devcontainer `image` and each CI job's `container.image` reference
`ghcr.io/jdx/mise:<version>-debian@sha256:<digest>`. The implementer takes the latest stable mise
release on the implementation day, and resolves its digest. The tag stays next to the digest for
readability; the digest is what pins. Both files carry the same string, and a comment in each names
the other file.

The digest is the digest of the multi-arch image index, not of one platform image. The
devcontainer runs as `linux/arm64` on the Apple-silicon host, and CI runs as `linux/amd64`. Only an
index digest resolves on both. Task 2.1 checks that the index lists both platforms. The two
platforms then get the same mise release, Debian release, and package set, but each one runs its
own platform image.

Alternative: a shared reusable workflow or a variable. Rejected: two literal occurrences are
simpler than an indirection, and a grep finds both.

### D3. The devcontainer runs as root

The devcontainer uses the image's default user, root. `postCreateCommand` becomes `mise trust &&
mise install --locked && npm install && npm run install:playwright`, with no `sudo chown`. The
named `node_modules` volume stays, because it keeps Linux binaries out of the host's
`node_modules`. The `dc:up` script drops its `sudo chown vscode:vscode node_modules`. The git
feature stays only if the image has no git (task 4.1 checks); the node and terraform features go.
If no feature remains, `devcontainer-lock.json` is deleted.

Why: CI container jobs run as root, so the devcontainer and CI then run as the same user. The
image's mise data directory belongs to root, so a non-root user cannot install tools there without
extra setup. `playwright install --with-deps` runs `apt-get`, which needs root. Playwright launches
Chromium without its sandbox by default, so Chromium runs as root.

Alternative: create a `vscode` user with the `common-utils` feature. Rejected: it adds a feature,
a user switch, and a `chown` of the mise data directory, and the devcontainer then runs as a
different user from CI. Alternative: an install script in the Ubuntu image. Rejected in the brief.

### D4. CI jobs: container, trust, and per-job tool lists

Each of the five jobs gets `container.image` (D2) and removes `setup-node` or `setup-terraform`.
After checkout, one step runs `mise install --locked`. The job's `env` sets `MISE_ENABLE_TOOLS` and
makes the checkout's `mise.toml` trusted (`mise install` itself, which trusts its active config in
normal mode; or `mise trust`; or `MISE_TRUSTED_CONFIG_PATHS` set to the container's workspace path;
task 4.2 checks which works).

| Job                     | `MISE_ENABLE_TOOLS` | Why                                                                       |
| ----------------------- | ------------------- | ------------------------------------------------------------------------- |
| `verify-site`           | `node,openspec`     | npm scripts; `specs:check` runs `openspec` from `PATH`                    |
| `verify-infrastructure` | `terraform`         | Terraform only                                                            |
| `verify-tooling`        | `node,jq`           | the suites link `node` and `jq`; bash, git, coreutils come from the image |
| `build-site`            | `node`              | `npm ci`, `astro build`                                                   |
| `test-site`             | `node`              | `npm ci`, the `dist/` checks, Playwright                                  |

The `verify-tooling` list `node,jq` answers the brief's open question on what `hooks:check` needs.
It is an assumption until task 5.10 runs `hooks:check` in a container from the image with only
these two tools installed. If 5.10 fails because a tool is missing, the implementer adds that tool
to this row and to 6.1.

`verify-infrastructure` keeps `defaults.run.working-directory: infra/cloudflare`; mise finds
`mise.toml` in a parent directory.

The `verify-tooling` comment that says the suites need "bash, git, jq, and node from the runner" is
updated to say they come from the image and from mise.

### D5. npm cache in the three npm jobs

In `verify-site`, `build-site`, and `test-site`, the order is: checkout, `mise install --locked`, a
step that writes the installed Node version to a step output (`mise current node`),
`actions/cache` (SHA-pinned, with the version in a comment, as the other actions are) for `~/.npm`,
then `npm ci`. The key is `npm-<runner.os>-node<version>-<hashFiles('package-lock.json')>`, with a
restore key that drops the lockfile hash.

Why the Node version and not a hash of `mise.toml`: a bump of jq or terraform must not invalidate
the npm cache.

### D6. The hook reads `mise.toml` as plain text

`dev-env-checks.sh` gets a function that reads the `[tools]` table of `mise.toml` with bash and
`grep`/`sed` only: each `name = "version"` line between `[tools]` and the next `[` header. It does
not call mise and does not need jq. For each pin it runs the tool's version command and compares:

| Tool                         | Version command                        | Normalization                   |
| ---------------------------- | -------------------------------------- | ------------------------------- |
| `node`                       | `node --version`                       | strip the leading `v`           |
| `jq`                         | `jq --version`                         | strip the leading `jq-`         |
| `openspec`                   | `openspec --version`                   | none                            |
| `codegraph`                  | `codegraph --version`                  | take the version token          |
| `typescript-language-server` | `typescript-language-server --version` | none                            |
| `terraform`                  | `terraform version`                    | first line, strip `Terraform v` |

The implementer confirms each command's output form against the installed tool (task 5.2).
Each problem gets one ✗ line, ending with `mise install` as the fix:

- `✗ <tool> missing — <consequence>; mise install`
- `✗ <tool> is <found> but mise.toml pins <pin> — <consequence>; mise install`

A tool counts as `missing` in two cases: `command -v <tool>` finds nothing, or the version command
exits non-zero. The second case covers mise shims. With mise's shims directory on `PATH`,
`command -v node` succeeds even when the pinned version is not installed, and `node --version` then
exits non-zero with a mise error. The check never puts the output of a failed version command into
a ✗ line.

A line in `[tools]` that is not a plain `name = "version"` gives `✗ mise.toml pin for <tool>
unreadable`. A missing `mise.toml` gives one ✗ line and the tools are then checked for presence
only.

The mise presence check moves from the skill-only `dev_env_check_claude` into the toolchain section,
so the hook reports it too: `✗ mise missing — the pinned toolchain cannot be installed; see
docs/development-environment.md`. Why: every other ✗ fix is now `mise install`, so the hook must say
when that fix cannot run.

The openspec profile check stays. The codegraph pin-drift check goes. A `codegraph()` shell
function no longer exists; callers run the binary. `have_codegraph` is true when the toolchain check
above does not report `✗ codegraph missing`. The gates on the codegraph steps change as follows:

- In `dev-env-checks.sh`, the index probe changes its gate from `have_node && have_jq` to
  `have_codegraph && have_jq`, because codegraph no longer runs through npx. The probe still needs jq
  to parse `codegraph status --json`. The line printed when the gate is false becomes
  `✗ codegraph: not checked (codegraph or jq missing)`.
- In `session-start.sh`, the `have_node` gate on the index steps becomes `have_codegraph`, and the
  skipped line names codegraph in place of node.

On a real machine, missing node makes the cascade grow, not shrink. openspec, codegraph, and
typescript-language-server are npm-backed tools (D1), and their executables start through `node`.
Without `node`, each version command exits non-zero, so the rule above reports each one as
`missing`. `have_codegraph` is then false. So with node missing, the lib prints these lines:

- `✗ node missing`
- `✗ openspec missing`
- `✗ codegraph missing`
- `✗ typescript-language-server missing`
- `✗ dependencies: not checked (node or npm missing)`
- `✗ codegraph: not checked (codegraph or jq missing)`

All lines after the first follow from node. The skill folds them under the node item through the
entry that each line matches, because the skill's Step 3 opens only the entry whose heading matches
a line's prefix:

- The `✗ openspec missing`, `✗ codegraph missing`, and `✗ typescript-language-server missing`
  entries each say: when `✗ node missing` is also reported, this line follows from it; fix node
  first (task 5.7).
- The cascade entry, which the two `not checked` lines match, says that these lines follow from the
  ✗ line of the missing prerequisite in their parentheses (task 5.7 states this in the fold rule's
  words).
- Step 3 gets one fold rule: when the matched entry says that the line follows from another ✗ line
  in the same report, the guide folds the line under that line's item and gives it no fix of its
  own. When that other line is itself folded, the guide folds the line under the item that the
  other line is folded under (task 5.8). For example, `✗ codegraph: not checked (codegraph or jq
missing)` follows from `✗ codegraph missing`, which is folded under `✗ node missing`, so it
  lands under the node item too. The pointer-only eval tests the rule with all five lines.

The suites model this case: the stubs of the three npm-backed tools exit 127 when `node` is not on
`PATH`, as the real executables do.

Alternative: ask mise (`mise ls --current --json`). Rejected in the brief: the report collapses
when mise is missing.

The `Troubleshooting` headings in `docs/development-environment.md` are re-keyed to the new ✗
prefixes, because the skill matches ✗ lines to those headings. The `✗ node missing` entry stays a
pointer-only entry: it links to the new § Toolchain (mise) section, which replaces § Node version
management and holds the `mise install` command. The skill's Step 3 and its pointer-only eval keep
their premise, and they name § Toolchain (mise) in place of the deleted section.

The hook test suites never see mise's shims. A shim resolves its version from the `mise.toml` in
its working directory. In the suites, that file is the fixture in `proj`, which is not trusted and
can pin a version that is not installed (the mismatch case). Today only `dev-env-checks-cases.sh`
controls its `PATH` fully (`PATH="${shim}:${base}"`). `session-start-cases.sh` runs most cases on
`PATH="${shim}:${PATH}"`, the inherited `PATH`, which holds shims in the image and on a host with
mise activated. So both suites follow one rule:

- At suite start, before any case runs, each suite links the real binary of every tool that the
  hook, the lib, or a case calls into a `base` directory, with
  `ln -s "$(mise which "${tool}" 2>/dev/null || command -v "${tool}")" "${base}/${tool}"`. For a
  tool that mise does not manage (`bash`, `git`, `cat`, `awk`, `cut`, `grep`, `sort`, and the
  others), and for every tool when mise is not on `PATH`, `mise which` fails and `command -v` gives
  the path. The links are made from the suite's own directory, so `mise which` resolves the pins of
  the repository's `mise.toml`, not the fixture's.
- Every case runs the hook or the lib with `PATH="${shim}:${base}"`, or with a directory built from
  the `base` links, such as the no-node directory. No case runs on the inherited `PATH`. This
  includes the manual-run case of `session-start-cases.sh`, which changes into `proj`.
- The healthy fixture pins are read through the links (`"${base}/node" --version`), not through the
  inherited `PATH`.

`mise` itself is a stub in `shim`, so no case can reach the real mise. Task 5.10 proves the rule in
the image, where every pinned tool on the inherited `PATH` is a shim.

### D7. Bare commands for the MCP server and the language server

`.mcp.json` registers codegraph as `"command": "codegraph", "args": ["serve", "--mcp"]`. The
typescript-lsp plugin already launches a bare `typescript-language-server`. Both now resolve through
mise, so Claude Code must start from a shell where mise's tools are on `PATH` (`mise activate` in
the shell profile, or mise's shims directory on `PATH`). `docs/development-environment.md` states
this as a setup step, and `docs/tooling/code-intelligence.md` replaces its "npx with the pin in the
command" rationale with this one. The reason codegraph is not a devDependency still holds: mise
installs it once per machine, not per worktree.

### D8. The schema-fork upgrade reads from mise's install

Steps 1 and 3 of the schema-fork upgrade in `docs/tooling/workflow.md` copy from
`node_modules/@fission-ai/openspec/`. That path no longer exists. They change to the install
directory that `mise where openspec` prints, under its `lib/node_modules/@fission-ai/openspec/`
(task 3.4 confirms the exact layout).

### D9. Baselines are regenerated once, and only in the new image

After CI and the devcontainer run on the new image, `npm run test:e2e:update` regenerates
`tests/__screenshots__/` once. The reviewer of the PNG diff expects only font-rendering
differences; a layout or color difference means something other than the environment changed and
blocks the change.

The baselines come from the devcontainer, which runs as `linux/arm64` on the Apple-silicon host.
CI compares them in `linux/amd64` containers from the same image index (D2). "Identical
environment" holds only per architecture: the mise release, Debian release, and fonts are the same,
but the two platform images are separate builds. This is not new: today the arm64 devcontainer also
writes the baselines that the amd64 runner compares. If CI reports snapshot differences that the
devcontainer does not, the implementer stops and reports to the human.

### D10. One `mise trust` in the main clone covers every worktree

The aliases table makes `mise.toml` a config that mise must trust (D1). mise trusts a config file by
its path. This repository is worked on in a git worktree per change, at `.claude/worktrees/<name>/`
inside the clone, and each worktree has its own `mise.toml` path. Without trust, mise's shims refuse
to read the config. The `SessionStart` hook then reports every pinned tool as missing, its
`npm install` fails, and the codegraph and language servers do not start.

mise's built-in trust behaviour covers this. `mise trust --help` (mise 2026.10.0) says:

- "Trust is shared across git worktrees: a config file inside a linked worktree is trusted when the
  equivalent path in the repository's main checkout has been trusted." Paranoid mode disables this
  sharing.
- In normal mode, `mise install` and `mise exec` "automatically trust their active config".

So each machine runs `mise trust` once, in the main clone, before the first `mise install`. Every
linked worktree under `.claude/worktrees/`, including worktrees created later, is then trusted
through the clone's `mise.toml`, with no step of its own, and the hook brings a new worktree up to
speed as it does today. This repository sets no global mise setting for trust: no
`trusted_config_paths` entry and no paranoid mode.

The main clone can take this trust only after this change merges. The change is implemented in its
normal worktree at `.claude/worktrees/<name>/`, and the main clone stays on `main`, which holds no
`mise.toml` until the merge. `mise trust` on a missing file fails ("Path does not exist", mise
2026.10.0). So:

- The implementer runs `mise trust` inside the change's worktree, for this change only, in task 2.2,
  after 1.1 opens mise's state directory (which holds the trust store) to the sandbox. Task 2.6
  checks the result in that worktree: `mise trust --show` and `mise install --dry-run` raise no
  trust error. No task runs a mise command in the main clone.
- `docs/development-environment.md` § Toolchain (mise) gives `mise trust`, run once in the main
  clone, as the trust step before `mise install`. It says that the step needs a main clone whose
  checkout holds `mise.toml`: a clone made before this change merged runs it once after it pulls
  the merge into `main`. § Worktrees says that linked worktrees share that trust, so a new worktree
  needs no mise step, and that paranoid mode disables the sharing (task 2.5).
- Every Troubleshooting entry whose fix is `mise install` says: if mise refuses because the config
  is not trusted, do the trust step in § Toolchain (mise) first (task 5.7). The hook does not detect
  trust: it does not call mise (D6), and an untrusted config shows as `✗ node missing` and the other
  tools missing, whose entries lead to the trust step.
- The `checking-dev-env` skill stays read-only: it quotes the trust step from the doc and never runs
  `mise trust` or `mise install` (task 5.8).

This change does not test the sharing of trust from the main clone to a linked worktree. The claim
rests on mise's documentation (`mise trust --help`, quoted above). A test needs a main clone that
holds `mise.toml` and is trusted, and that exists only after the merge, when every task of this
change is already ticked. The first change after the merge exercises the sharing: its worktree is
the first one made from a trusted main clone (Risks).

The devcontainer (D3) and CI (D4) trust their own checkout inside the container, so the host's
trust does not apply to them.

Alternative: the global `trusted_config_paths` setting set to the clone's root. Rejected: worktree
trust sharing covers the same configs with no change to the global mise config, which is outside
the sandbox's write paths. Alternative: a `mise trust` in each new worktree. Rejected: it is one
more manual step per change, and the shared trust makes it unnecessary.

## Risks / Trade-offs

- [`mise install --locked` may reject npm-backed tools, whose lockfile entries hold a version but no
  download URL, or may ignore `MISE_ENABLE_TOOLS`] → Task 2.4 tests both together, before any CI
  edit. If `--locked` cannot cover npm tools, the implementer stops and reports; the fallback
  (plain `mise install`, which still uses `mise.lock`) is the human's decision, because it weakens
  the "checksummed" goal.
- [The mise image may lack git; `actions/checkout` then downloads a tarball with no `.git`, and the
  hook suites fail on `git hash-object`] → Task 4.1 checks. If git is absent, the implementer stops
  and reports, because adding git is a new pin outside the brief's tool list.
- [`playwright install --with-deps` may not support the image's Debian release] → Task 4.3 runs it in
  the image as root before the CI edit.
- [Each job pulls the image, which adds time] → Verify records the pull time per job from the first
  CI run. No mitigation now; a slow pull is input for the later cache change.
- [GitHub API rate limits during `mise install` in CI] → With lockfile URLs, mise does not call the
  API. If a job still hits a limit, set `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}` in that job's
  env.
- [`~/.npm` in a container job resolves to the container's `HOME`, not the runner's] →
  `actions/cache` runs inside the container, so both sides use the same `HOME`. Verify confirms a
  cache hit on the second run.
- [Chromium in a container may run out of shared memory] → If the e2e step crashes, add
  `options: --ipc=host` to `test-site`'s container.
- [Claude Code started outside a mise-activated shell starts no codegraph MCP server and no language
  server] → D7's doc step; the SessionStart report shows `✗ codegraph missing` and
  `✗ typescript-language-server missing` in that case.
- [The sandbox blocks mise's state writes and downloads] → Group 1 of tasks.md lists the edit for
  the human. Until then, `mise install` runs outside Claude Code.
- [A linked worktree may not inherit the main clone's trust] → Low: `mise trust --help` (mise
  2026.10.0) states the sharing, and this repository does not use paranoid mode (D10). This change
  does not test it: a test needs a trusted main clone that holds `mise.toml`, which exists only
  after the merge. The first change after the merge exercises it. If that change's worktree reports
  toolchain ✗ lines after the main clone is trusted, D10 needs a new decision in a later change.
  Until then, `mise trust` in the affected worktree is a working stopgap, as this change's own
  worktree shows (task 2.6).
- [Contributors must install mise] → Accepted. The report names the gap on a machine without mise.

## Migration Plan

One pull request carries the whole change, so two Node pins never exist side by side. The change
is built in its own worktree (D10). Order within the branch follows tasks.md: the human's sandbox
edit, the mise files and the trust step in the change's worktree, removal of the old pins, the
devcontainer on the new image, the hook and skill, CI, then the baselines. Each group updates the
docs its own work makes wrong.

After the merge, each machine runs the one-time `mise trust` in its main clone, as
`docs/development-environment.md` § Toolchain (mise) says (D10). This step is not a task of this
change.

Rollback is a revert of the merge commit; the old pins come back with it, and each machine keeps
working because mise and the old managers can be installed together.

## Open Questions

- Which mise release and digest to pin. This is decided on the implementation day (D2) and does not
  change the approach.
