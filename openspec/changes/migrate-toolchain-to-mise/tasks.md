# Tasks

Agents cannot write `.claude/settings.json`. The sandbox also denies Bash writes under
`.claude/hooks/` and `.claude/skills/`: edit those files with the Edit and Write tools, which ask
the human for permission.

The change is implemented in its normal worktree at `.claude/worktrees/<name>/`, on the change's
branch (design D10). The main clone stays on `main`, which holds no `mise.toml` until the merge, so
no task runs a mise command in the main clone. Every trust step in these tasks runs in the change's
worktree, and it is for this change only. The one-time `mise trust` in the main clone is a setup
step for after the merge; the docs carry it (2.5), and no task here runs or checks it.

## 1. Sandbox access for mise (human)

- [ ] 1.1 **Human only.** In `.claude/settings.json`, add mise's data, state, and cache directories
      on this machine to `sandbox.filesystem.allowWrite` (`mise doctor` prints them; the defaults are
      `~/.local/share/mise`, `~/.local/state/mise`, and `~/Library/Caches/mise`, unless
      `MISE_DATA_DIR` and the related variables move them). Add the download hosts that
      `mise install` reaches to `sandbox.network.allowedDomains` (at least `nodejs.org`,
      `releases.hashicorp.com`, and the GitHub release-asset host that mise reports when a
      download is refused). Add `Bash(mise *)` to `permissions.allow` — verify that `mise --version`
      and `mise install --dry-run` run from a Claude Code session with no sandbox violation
- [ ] 1.2 Document the mise directories and hosts in `docs/tooling/sandbox.md`, in the section that
      lists the npm cache — verify that every path and host added in 1.1 appears there with the
      reason it is needed, and that no other section of that doc names fnm or `.node-version`

## 2. Declare the toolchain in mise

- [ ] 2.1 Choose the latest stable mise release and resolve the digest of the multi-arch image
      index of `ghcr.io/jdx/mise:<version>-debian` for it, not the digest of one platform image
      (design D2) — verify that
      `docker buildx imagetools inspect ghcr.io/jdx/mise:<version>-debian@sha256:<digest>` lists
      both `linux/amd64` and `linux/arm64`, that
      `docker pull ghcr.io/jdx/mise:<version>-debian@sha256:<digest>` succeeds on the host, and
      record the reference for groups 4 and 6
- [ ] 2.2 Create `mise.toml` at the repository root with the six tools at the versions in the
      brief, short names through a `[tool_alias]` table, and no `[settings]` table (design D1). In
      the change's worktree, run `mise trust` once, then `mise install` (design D10). This trust is
      for this change only. Do not run any mise command in the main clone, and do not set
      `trusted_config_paths` or any other global mise setting — verify that `mise ls --current` in
      the change's worktree on the host lists exactly node 26.8.1, jq 1.8.2, openspec 1.13.2, codegraph 1.6.0,
      typescript-language-server 6.0.1, and terraform 1.16.0, and that
      `mise settings get trusted_config_paths` prints an empty list
- [ ] 2.3 Generate `mise.lock` for `linux-x64`, `linux-arm64`, and `macos-arm64` (design D1), and
      check that `.gitignore` does not ignore either mise file — verify that `git status` shows
      both files as new, that `mise.lock` holds an entry for each of the six tools, and that
      `mise install --locked` on the host exits 0 with no `[settings]` table in `mise.toml`
- [ ] 2.4 In a container from the 2.1 image with the checkout mounted, run
      `MISE_ENABLE_TOOLS=node,openspec mise install --locked`, then
      `MISE_ENABLE_TOOLS=terraform mise install --locked` in a fresh container — verify that each
      run installs only the tools it names and that both exit 0. If `--locked` rejects the
      npm-backed tools, or `MISE_ENABLE_TOOLS` is ignored, stop and report to the human (design,
      Risks); do not continue to group 6
- [ ] 2.5 In `docs/development-environment.md`, replace the Prerequisites table rows and the
      "Node version management" section with a section titled `## Toolchain (mise)`: install mise;
      the one-time trust step, `mise trust` run once in the main clone, not in a worktree (design
      D10); `mise install`; and shell activation so that Claude Code starts with mise's tools on
      `PATH` (design D7). The trust step says that it needs a main clone whose checkout holds
      `mise.toml`: a clone made before this change merged runs it once after it pulls the merge
      into `main`. The `✗ node missing` Troubleshooting entry (5.7) and the `checking-dev-env`
      skill (5.8) point at this section by that title. In § Worktrees, say that linked worktrees
      share the main clone's trust, so a new worktree needs no mise step and the `SessionStart`
      hook still brings it up to speed, and that mise's paranoid mode disables this sharing. Update
      the § Verify block to check versions against `mise.toml` — verify that the doc names no fnm,
      nvm, asdf, volta, `.node-version`, or `trusted_config_paths`, that § Toolchain (mise) gives
      the trust step for the main clone with its after-the-merge note, that § Worktrees names the
      shared trust, and that each command in the new section other than the main-clone
      `mise trust` runs as written in the change's worktree on the host. The main-clone
      `mise trust` cannot run before the merge, and no task checks it (design D10)
- [ ] 2.6 Check the trust state of the change's worktree (design D10). In the change's worktree, run
      `mise trust --show` and `mise install --dry-run` — verify that both exit 0, that neither
      prints a "not trusted" error or a trust prompt, and that `mise trust --show` reports the
      worktree's `mise.toml` as trusted. If either raises a trust error, stop before group 3 and
      report to the human. This check covers the trust from 2.2 only; it does not test the
      sharing of trust from the main clone to linked worktrees

## 3. Remove the old pins

- [ ] 3.1 Delete `.node-version` — verify that `test ! -e .node-version` exits 0. Other files still
      name `.node-version` until groups 5 and 6 change them; the repository-wide check is in group 8
- [ ] 3.2 Remove the `@fission-ai/openspec` and `typescript-language-server` devDependencies with
      `npm uninstall`, so that `package-lock.json` follows — verify that `npm ls` reports neither
      package, that `npm run specs:check` passes with the mise-installed `openspec`, and that
      `command -v openspec` resolves to a mise path
- [ ] 3.3 Change the `codegraph:init` and `codegraph:status` scripts to a bare `codegraph`, and
      register codegraph in `.mcp.json` as `"command": "codegraph", "args": ["serve", "--mcp"]` —
      verify that `npm run codegraph:status` reports the index, that `/mcp` in a new session shows
      codegraph connected, and that `git grep -n "codegraph@" -- .mcp.json package.json` returns
      nothing. The hook, its suites, and `docs/tooling/code-intelligence.md` still match until 3.4
      and group 5 change them; the repository-wide check is in group 8
- [ ] 3.4 Update the docs that describe these pins: `docs/tooling/code-intelligence.md` (the
      language-server install and the codegraph registration rationale, design D7),
      `docs/tooling/workflow.md` § Setup (openspec comes from mise) and steps 1 and 3 of the
      schema-fork upgrade (design D8: confirm the layout under `mise where openspec` first), and the
      "Code-intelligence tools" section of `docs/development-environment.md` — verify that
      `git grep -n -E "npm i(nstall)? -g|@fission-ai/openspec|node_modules/@fission-ai"` returns
      only intended lines outside `openspec/changes/`, and that the paths in the upgrade steps exist

## 4. Move the devcontainer to the mise image

- [ ] 4.1 Check whether the 2.1 image has `git` on `PATH` — verify with
      `docker run --rm <image> git --version`. If git is absent, stop and report to the human
      (design, Risks)
- [ ] 4.2 Find how a container from the image trusts the mounted `mise.toml`: `mise install`
      alone (it trusts its active config in normal mode), `mise trust`, or
      `MISE_TRUSTED_CONFIG_PATHS` set to the workspace path — verify that `mise install --locked`
      runs without a trust prompt, and record the method for 4.4 and group 6
- [ ] 4.3 In a container from the image, as root, with the checkout mounted, run `mise install
--locked`, `npm ci`, and `npm run install:playwright` — verify that all three exit 0 and that
      `node_modules/.bin/playwright --version` prints 1.63.0
- [ ] 4.4 Rewrite `.devcontainer/devcontainer.json` per design D3: the 2.1 image by digest with a
      comment naming `pipeline.yml`, no node or terraform feature, the git feature only if 4.1 found
      no git, the `node_modules` volume kept, and the new `postCreateCommand` with the 4.2 trust
      method. Delete `.devcontainer/devcontainer-lock.json` if no feature remains — verify that
      `npm run dc:up` on a fresh volume completes, and that `node -v` and `terraform version` inside
      the container match `mise.toml`
- [ ] 4.5 Remove `sudo chown vscode:vscode node_modules` from the `dc:up` script in `package.json`,
      and confirm that `test:e2e:check` and `test:e2e:update` need no change under the image's login
      shell — verify that `npm run test:e2e:check` builds and runs the suite inside the container
      (snapshot differences are expected until group 7)
- [ ] 4.6 Update the docs that name the old devcontainer: `docs/tech-stack.md` (Dev container line),
      `docs/development/checks.md` (the Terraform note "The devcontainer pins 1.16.0"),
      `docs/tooling/workflow.md` (the devcontainer Terraform pin), and the "Host vs. devcontainer"
      section of `docs/development-environment.md`. Update the agent-facing files that describe the
      old environment, with the Edit tool: `.claude/agents/frontend-qa-engineer.md` and
      `.claude/skills/testing-visual-regression/SKILL.md` (CI and the devcontainer run the same mise
      Debian image, and the baselines are rendered there, per design D9), and the `compatibility`
      field of `.claude/skills/running-preflight-checks/SKILL.md` (Terraform comes from
      `mise.toml`). Bump `metadata.version` of the two skills — verify that
      `git grep -n -E "1\.16\.0|ubuntu-24\.04|vscode:vscode" -- .devcontainer/ package.json docs/tech-stack.md docs/development/checks.md docs/tooling/workflow.md docs/development-environment.md .claude/agents/frontend-qa-engineer.md .claude/skills/testing-visual-regression/SKILL.md .claude/skills/running-preflight-checks/SKILL.md`
      returns nothing. The grep covers only the files that group 4 owns. Outside them, these lines
      match and stay: `.github/workflows/deploy.yml` (`runs-on: ubuntu-24.04`; `deploy.yml` is out of
      scope, because it installs no tools) and `infra/cloudflare/versions.tf` (`required_version`;
      the `infra/` Terraform code is out of scope). `pipeline.yml` changes in group 6, and 6.1
      checks it

## 5. Point the SessionStart hook and the checking-dev-env skill at mise.toml

- [ ] 5.1 In `.claude/hooks/lib/dev-env-checks.sh`, add the plain-text `[tools]` reader of design
      D6, and replace the `.node-version` and `package.json` pin reads with it — verify with the
      suite cases in 5.6
- [ ] 5.2 Add the per-tool version comparison of design D6 for all six tools, after you confirm each
      version command's output form against the installed tool; each ✗ line ends with
      `mise install` — verify with the suite cases in 5.6
- [ ] 5.3 Move the mise presence check into the toolchain section, and remove the fnm/nvm/asdf/volta
      probe from `dev_env_check_claude` — verify that the toolchain section reports `✗ mise missing`
      when mise is not on `PATH`, and that the other tool checks still run in that case
- [ ] 5.4 Remove `CODEGRAPH_VERSION`, the `codegraph()` npx wrapper, and the pin-drift check; change
      the codegraph gates as design D6 describes: the lib's index probe on `have_codegraph &&
have_jq`, with the line `✗ codegraph: not checked (codegraph or jq missing)`, and the index
      steps of `.claude/hooks/session-start.sh` on `have_codegraph`, with a skipped line that names
      codegraph in place of node — verify that
      `grep -rn -E "CODEGRAPH_VERSION|npx|node or jq missing|skipped \(node missing\)" .claude/hooks/`
      returns nothing, and the 5.6 cases for node missing and codegraph missing
- [ ] 5.5 Update the header comments of both scripts, which describe npx, `.node-version`, and the
      three codegraph pins — verify that no comment in either file describes a removed mechanism
- [ ] 5.6 Update `.claude/hooks/tests/dev-env-checks-cases.sh` and `session-start-cases.sh`: stub
      `codegraph` and `mise` instead of `npx` and `fnm`, write a `mise.toml` fixture instead of
      `.node-version` and the pin fields in `package.json` and `.mcp.json`. Apply the suite rule of
      design D6 in both suites: at suite start, link the real binary of every tool that the hook,
      the lib, or a case calls into `base` with `mise which "${tool}" 2>/dev/null || command -v
"${tool}"` (this also covers the tools that mise does not manage, such as `bash`, `git`,
      `cat`, `awk`, `cut`, `grep`, and `sort`); run every case on `PATH="${shim}:${base}"` or on a
      directory built from the `base` links; and read the healthy fixture pins through the links.
      In `session-start-cases.sh` this replaces `export PATH="${shim}:${PATH}"` (line 105), the
      no-node link list (line 281), and the inherited `PATH` of the manual-run case (line 295), and
      the comments that describe the inherited `PATH` change with it. The stubs of `openspec`,
      `codegraph`, and `typescript-language-server` exit 127 when `node` is not on `PATH`, as the
      real executables do (design D6). Add cases for: all pins matched, one version mismatched,
      one tool missing, a tool whose version command exits non-zero as a mise shim does (reported
      as `✗ <tool> missing`, with no error text in the line), mise missing (the other checks still
      run), no `mise.toml`, an unreadable `[tools]` line, node missing (the lib prints the six ✗
      lines that design D6 lists for this case, and `session-start.sh` attempts no codegraph call),
      and codegraph missing with node present (the lib prints
      `✗ codegraph: not checked (codegraph or jq missing)`) — verify that
      `grep -n -E 'export PATH|:\$\{PATH\}' .claude/hooks/tests/dev-env-checks-cases.sh .claude/hooks/tests/session-start-cases.sh`
      returns nothing, and that `npm run hooks:check` passes on the host, both with mise activated
      in the shell and with mise removed from `PATH`
- [ ] 5.7 Re-key the Troubleshooting section of `docs/development-environment.md` to the new ✗
      prefixes: drop the `.node-version`, version-manager, `npm i -g`, and "codegraph pins drifted"
      entries, and add entries whose fix is `mise install` or installing mise. The node entry stays
      pointer-only: it links to § Toolchain (mise) from 2.5 and names no command itself (design
      D6). In the cascade entry (`### ✗ dependencies: not checked · ✗ codegraph: not checked · …`),
      add codegraph to the list of missing prerequisites that the line's parentheses name, and say
      in the words of the 5.8 fold rule that each such line follows from the ✗ line of the
      prerequisite in its parentheses. In each
      of the `✗ openspec missing`, `✗ codegraph missing`, and `✗ typescript-language-server missing`
      entries, add: "When `✗ node missing` is also reported, this line follows from it, because
      this tool starts through `node`; fix node first" (design D6). In every entry whose fix is
      `mise install`, add: "If mise refuses because the config is not trusted, do the trust step in
      § Toolchain (mise) first" (design D10) — verify that every ✗ prefix the lib can print has
      exactly one matching `### ✗` heading, that no heading names a prefix the lib no longer
      prints, that the cascade entry names codegraph as a prerequisite and says that its lines
      follow from the prerequisite's ✗ line, that each of the three
      npm-backed `missing` entries says that its line follows from `✗ node missing`, that each
      entry whose fix is `mise install` names the trust step, and that the node entry's link
      resolves to the `## Toolchain (mise)` heading
- [ ] 5.8 Update `.claude/skills/checking-dev-env/SKILL.md` (the description's "node version
      manager", the guide order, the example guide item, the Step 3 pointer example that says
      "`✗ node missing` points at § Node version management", which now names § Toolchain (mise),
      a fold rule in Step 3, and a version bump in `metadata`). The fold rule (design D6): when the
      matched Troubleshooting entry says that the line follows from another ✗ line in the same
      report, the guide folds the line under that line's item and gives it no fix of its own. When
      that other line is itself folded, the guide folds the line under the item that the other
      line is folded under. Also
      update `evals/evals.json` (replace the
      `eval-committed-pin-drift` eval and its entry in the `coverage_map`; in the
      `eval-pointer-only-entry-node-cascade` eval, rewrite the setup, `expected_output`, the fnm
      assertion, and the baseline that names `.node-version`, so that they name § Toolchain (mise)
      and its `mise install` command. In the same eval, rewrite the setup's scan output to the lib
      output of design D6 on a real machine with node missing: Step 1 emits `✗ node missing`,
      `✗ openspec missing`, `✗ codegraph missing`, `✗ typescript-language-server missing`,
      `✗ dependencies: not checked (node or npm missing)`, and
      `✗ codegraph: not checked (codegraph or jq missing)`. Change the `expected_output`, the
      cascade assertion, and the baseline from "the `not checked` lines" (two lines) to the five
      lines after `✗ node missing`, all folded under the node item by Step 3's fold rule, because
      each line's matched entry (5.7) says that it follows from `✗ node missing`, and given no
      fixes of their own. Also replace the
      expectations that quote `npm i -g typescript-language-server` as the doc's fix, with mise
      equivalents). The node entry
      stays pointer-only (5.7), so the pointer-only scenario and its `coverage_map` entry ("5 and 7
      cover the two pointer-only entries") keep their premise. Keep the
      read-only guard and make it stricter: add `mise install` and `mise trust` to the commands
      that the "Diagnose and guide, never fix" rule in `SKILL.md` forbids, to the read-only
      criterion in `evals.json`, and to the tripwire regex of the read-only eval. Do not remove
      `npm i -g` from any of these lines — verify that
      `grep -n -E "fnm|nvm|asdf|volta|pin drift|npm i -g typescript|§ Node version|\.node-version" .claude/skills/checking-dev-env/SKILL.md .claude/skills/checking-dev-env/evals/evals.json`
      returns nothing; that `grep -n "npm i -g"` on the same two files returns only the read-only
      rule in `SKILL.md`, and the read-only criterion, the tripwire regex, and the "Runs NO install"
      expectation in `evals.json`; that the rule, the criterion, and the tripwire regex each also
      name `mise install`; that the eval-7 setup quotes the same six ✗ lines as the 5.6 case for
      node missing, and its cascade assertion names the five lines after `✗ node missing`; that
      Step 3 in `SKILL.md` states the fold rule, including the fold through a line that is itself
      folded (so `✗ codegraph: not checked (codegraph or jq missing)` follows from
      `✗ codegraph missing` and lands under the node item); that for each of those five lines the entry Step
      3 matches by heading prefix says that the line follows from another ✗ line; and
      that `bash .claude/hooks/lib/dev-env-checks.sh` on the host prints only ✗ lines
      that the doc's Troubleshooting section covers
- [ ] 5.9 Update step 1 of § Session start in `docs/tooling/code-intelligence.md` to describe the
      `mise.toml` comparison and the mise presence check — verify that it names no `.node-version`
      and no codegraph cross-check
- [ ] 5.10 Test the `verify-tooling` tool list of design D4 in the image: in a container from the 2.1
      image with the checkout mounted and the 4.2 trust method, run
      `MISE_ENABLE_TOOLS=node,jq mise install --locked && npm run hooks:check` — verify that it exits
      0 with every tool on `PATH` as a mise shim. If a tool is missing, add it to the D4 row and to
      6.1. If a suite fails only in the container, find the case that reached a shim or a tool not
      linked into `base`, and fix the `base` links or that case's `PATH` (5.6, design D6) before
      group 6

## 6. Run every CI job in the mise image

- [ ] 6.1 In `.github/workflows/pipeline.yml`, give all five jobs `container.image` with the 2.1
      reference and a comment naming `devcontainer.json`; remove `setup-node` and
      `setup-terraform`; add a `mise install --locked` step after checkout; set each job's
      `MISE_ENABLE_TOOLS` per the table in design D4 and the 4.2 trust method — verify by reading the
      file that no job names `setup-node`, `setup-terraform`, or `.node-version`, and that each job's
      tool list matches design D4
- [ ] 6.2 In `verify-site`, `build-site`, and `test-site`, add the Node-version output step and a
      SHA-pinned `actions/cache` step for `~/.npm` before `npm ci`, keyed per design D5 — verify by
      reading the file that the key holds the OS, the Node version, and the `package-lock.json`
      hash, and that the action reference is a full commit SHA with its version in a comment
- [ ] 6.3 Update the comments in `pipeline.yml` that name `setup-node` or say the hook suites take
      tools "from the runner" — verify that every comment describes the container and mise

## 7. Regenerate the visual baselines

- [ ] 7.1 Run `npm run test:e2e:update` in the group-4 devcontainer — verify that the following
      `npm run test:e2e:check` passes with no snapshot difference
- [ ] 7.2 Review the PNG diff under `tests/__screenshots__/` — verify that every changed image
      differs only in font rendering, and that no file under `src/` changed in this change (design
      D9). A layout or color difference blocks the change; report it

## 8. Verify

- [ ] Visual + a11y snapshots pass in **both themes** for every touched view (testing-visual-regression skill) — no view changes; this run proves the regenerated baselines from group 7
- [ ] All preflight gate checks pass — the set in `docs/development/checks.md` (running-preflight-checks skill)
- [ ] Manual preview: no theme flash, interactions work, console clean, responsive at 375px
- [ ] `npm run build` output is identical to the output of `main`: build both and compare `dist/`
      with `diff -r` (the site must not change)
- [ ] No removed pin is named anywhere: `git grep -n "\.node-version" -- ':!openspec/changes/'`
      and `git grep -n "codegraph@" -- ':!openspec/changes/'` both return nothing (the
      repository-wide checks that 3.1 and 3.3 defer to this group). No repository-wide grep looks
      for `fnm`: the About page (`src/pages/about/index.astro`) keeps its fnm entry, because this
      change leaves visible site content alone (proposal, Non-Goals); the fnm greps in 1.2, 2.5,
      and 5.8 cover only the files those tasks own
- [ ] `npm run hooks:check` passes, and `bash .claude/hooks/lib/dev-env-checks.sh` run with mise
      removed from `PATH` still prints a full report that includes `✗ mise missing`
- [ ] On the change's pull request, all five jobs run in the pinned image and pass; record each
      job's image-pull time and `mise install` time from the logs
- [ ] On a second run of that pull request, the three npm jobs report an `actions/cache` hit
