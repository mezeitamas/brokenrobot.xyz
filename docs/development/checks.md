# Checks

Every automated check in this repository: what it inspects, how to run it, and why it exists.

This page is the only place that lists the checks. Other documents, skills, and templates link
here instead of repeating the list. A copied list goes stale without anyone noticing — three
copies in this repository had already drifted apart before this page existed. One of them told
its reader that a partial gate was a complete one.

Two rules keep this page correct:

- **No counts.** This page never says how many checks there are. A number is the part that goes
  stale first, and a wrong number is worse than no number, because it reads as a verified fact.
- **One list.** A new check is added here first. Anything that needs the list links to a section
  of this page.

## How to read this page

A check is one command. It inspects part of the repository and it passes or it fails. Nothing
here fixes anything: a check reports, and the author decides what to do.

The checks are grouped by **what they inspect**, because what a check inspects explains when it
can run. A check that inspects `dist/` cannot run before the build produces `dist/`. A check that
inspects source files does not need a build at all.

Some checks run different commands in different places. The devcontainer and CI are not the same
environment, so those checks list both commands.

## Named sets

The groups below cut across the categories. Link to a set when you need "the checks that run
before a commit" rather than one specific check.

### The preflight gate

The gate is the non-visual set that runs before a commit. The
[`running-preflight-checks`](../../.claude/skills/running-preflight-checks/SKILL.md) skill runs
it and reports each check. Run every command even when an earlier one fails, because stopping at
the first failure hides the rest:

```bash
npm run type:check
npm run lint:check
npm run format:check
npm run specs:check
npm run designmd:check
npm run tokens:check
npm run headers:check
npm run build
npm run thirdparty:check
npm run twins:check
npm run terraform:check
```

The order is not arbitrary. `build` comes before `thirdparty:check` and `twins:check` because those
checks read `dist/`. The cheap source checks come first, so an obvious failure appears before the
slow build.

The gate covers no visual regression and no accessibility. A change is not verified until
[visual verification](#visual-verification) has also run.

### The CI pipeline

[`pipeline.yml`](../../.github/workflows/pipeline.yml) enforces the checks as named jobs:

| Job                   | Checks                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------- |
| Verify site           | `format:check`, `lint:check`, `type:check`, `specs:check`, `designmd:check`, `tokens:check`, `headers:check` |
| Verify infrastructure | the Terraform check, with its own `init` step                                               |
| Verify tooling        | `hooks:check`                                                                               |
| Build site            | `build`                                                                                     |
| Test site             | `thirdparty:check`, `twins:check`, then the e2e suite                                       |

The jobs form three phases, and the pipeline runs them in that order: the three Verify jobs
inspect source and run first, Build produces `dist/` and only `dist/`, and Test inspects the
`dist/` that Build uploaded. Each phase waits for the one before it, so a failed Verify stops the
run before the build — nothing is built from source already known to be broken. Within Verify site,
one failing check does not hide the checks after it; all six report and the job still fails.

CI runs more than the preflight gate. It adds `hooks:check` and the e2e suite, which the gate
leaves out. A green gate therefore predicts a green pipeline, but it does not guarantee one.

The pipeline runs on every pull request and on every push to `main`, unfiltered. `deploy.yml`
ships only when the whole pipeline succeeds.

### Visual verification

The e2e suite is the visual half of Verify, and it covers both themes by configuration rather than
by how it is invoked, so CI gets the same coverage a local run does. The
[`testing-visual-regression`](../../.claude/skills/testing-visual-regression/SKILL.md) skill wraps
it. See [test:e2e:check](#teste2echeck) below.

## Source code

These checks read the files as written. They need no build.

### `format:check`

```bash
npm run format:check # prettier --check, across every supported extension
npm run format:fix   # rewrites the offending files
```

Prettier checks formatting across source, configuration, and documentation. A tool settles
formatting so that no review spends attention on it, and so that diffs show intent instead of
whitespace.

### `lint:check`

```bash
npm run lint:check # astro sync && eslint 'src/**/*.{astro,ts,tsx}'
```

ESLint inspects the application source. It catches correctness problems that types alone do not,
and it enforces the accessibility rules in
[coding-conventions](conventions/coding-conventions.md). The `astro sync` step runs first because
it generates the Astro types that ESLint then reads.

### `type:check`

```bash
npm run type:check # astro check && tsc --noEmit
```

Two passes, because one tool cannot see everything. `astro check` types the `.astro` components,
including their templates. `tsc --noEmit` types the rest of the TypeScript.

## Authored content and specs

These checks inspect files that a person writes, but that carry structure a tool can verify.

### `specs:check`

```bash
npm run specs:check # openspec validate --all --strict && openspec validate --archived
```

OpenSpec validates the change artifacts and the specs. This is what makes the planning workflow
enforceable rather than advisory: a malformed proposal or spec delta fails a pull request, and so
does an archived change that still has unticked tasks.

The check validates **structure**, not content. It cannot tell whether a proposal is a good idea.

### `designmd:check`

```bash
npm run designmd:check # design.md lint DESIGN.md && design.md lint DESIGN.dark.md
```

The check lints both theme files, because both themes are first-class. Only **errors** fail this
check. Warnings and infos are advisory, and they do not fail it.

## Generated artifacts

### `tokens:check`

```bash
npm run tokens:check    # node scripts/generate-tokens.mjs --check
npm run tokens:generate # regenerates the file
```

`scripts/generate-tokens.mjs` generates `src/styles/tokens.generated.css` from `DESIGN.md`, and
the repository commits the result. This check verifies that the committed file still matches what
the generator produces now.

It also compares the two `theme-color` `<meta>` values hard-coded in `BaseLayout.astro` against the
generated light and dark `--bg` tokens. A meta tag cannot read a CSS custom property, so those two
literals are the one place a token value is duplicated by hand; without this comparison nothing
would notice when `DESIGN.md` moves on and the browser chrome keeps the old background.

The check exists because the failure it catches is invisible otherwise. Editing a token in `DESIGN.md`
without regenerating leaves a stale CSS file that types, lints, formats, and builds perfectly —
every other check passes, and the site renders the old value.

## Cross-file consistency

### `headers:check`

```bash
npm run headers:check # node scripts/check-header-sync.mjs
```

The site's security headers are declared in three places that must stay byte-identical:
`server.headers` in `astro.config.ts`, `nginx.conf`, and
`infra/cloudflare/modules/domain/main.tf`. This check extracts all three and compares them.

Nothing else catches drift between them. The Playwright suite exercises the `astro.config.ts` copy
alone, because that is the one `astro preview` serves — so a change to the CSP that lands in the
preview copy and not in the Cloudflare module passes every other check and every test, and reaches
production as a header nobody serves. See
[Security headers](../architecture.md#security-headers) for what each copy serves.

An exit code of 2 means extraction itself broke — a file moved, or its shape changed enough that
the script could not find the header. Report that as `not run` rather than a pass or a failure.

## Build output (`dist/`)

These checks need `dist/`. Run the build first, or they inspect nothing.

### `build`

```bash
npm run build # astro build
```

The build is a check in its own right: it fails on errors that no static pass catches. It is also
the precondition for everything else in this category.

### `thirdparty:check`

```bash
npm run thirdparty:check # node scripts/check-third-party-resources.mjs
```

The site self-hosts its assets. This check scans the built output for requests to third-party
origins and fails when it finds one. It runs against `dist/` rather than source because that is
where the truth is — a build step or a dependency can introduce an external request that no
source file mentions.

Its exit codes carry meaning:

- **1** — a third-party resource was found. This is a failure.
- **2** — `dist/` is missing or half-written. The check did not run. Report the result as
  `not run` and never as a pass, because a pass claims coverage that never happened. Fix the build
  first.

The check has one known blind spot. Cloudflare injects the Web Analytics beacon at the edge, so
the beacon never appears in `dist/` and this check cannot see it. The CSP list in
[`astro.config.ts`](../../astro.config.ts) is the only place that dependency is visible.

It skips `.md` files. The check exists because a resource a browser fetches from a third party is a
page the site's own CSP silently breaks. A Markdown file is data an agent reads, not a document a
browser parses into requests, so nothing inside one can produce a fetch. Without the exclusion, one
post's fenced `<link rel="canonical" href="https://…">` code sample — which the HTML page escapes
and the Markdown twin carries raw — fails the Build job.

### `twins:check`

```bash
npm run twins:check # node scripts/check-markdown-twins.mjs
```

Every blog post is published twice: as the HTML page a person reads, and as the Markdown twin at
`/blog/<slug>/index.md` that an agent reads. This check confirms the build produced the second one —
a twin beside every built post page and no orphan beside none, each twin non-empty, each opening
with a frontmatter block that parses.

It audits **coverage, not content**. Twins and pages are generated from one source on every build,
so they cannot drift apart. A wrong twin is the transform's failure, and the transform fails the
build and names the offending post; what this check catches is the missing or empty one — a real
failure mode in the wild, where a site serves `.md` that answers 200 with no body and nothing looks
broken to anyone.

Its exit codes carry the same meaning as `thirdparty:check`'s:

- **1** — a twin is missing, empty, orphaned, or does not open with parseable frontmatter. This is a
  failure.
- **2** — `dist/blog/` is missing or holds no post directories. The check did not run. Report the
  result as `not run` and never as a pass. Fix the build first.

### `test:e2e:check`

```bash
# locally — runs in the devcontainer
npm run test:e2e:check

# in CI — dist/ is downloaded from the Build site job
node_modules/.bin/playwright test
```

Playwright runs visual regression and axe accessibility checks in **both themes**. Four projects
carry that: `Desktop Chrome` and `Pixel 7`, and a dark counterpart of each. A dark project differs
from its light one in `colorScheme` alone and runs the same specs, so every page holds a baseline
and an axe scan per theme, and a new spec gets dark coverage without being told to. The
[`testing-visual-regression`](../../.claude/skills/testing-visual-regression/SKILL.md) skill wraps
this check, including the baseline-review steps.

Run the check in the devcontainer locally. Rendering differs between a host and the container, and
the committed baselines come from the container, so a host run reports differences that are not
real.

This check is not part of the preflight gate. It is slower than the gate's checks, and it needs a
container, so it runs as its own part of Verify.

## Infrastructure

### `terraform:check`

```bash
# locally
npm run terraform:check # fmt -check -recursive, then validate -no-color, in infra/cloudflare

# in CI — the Verify infrastructure job adds an init step
terraform fmt -check -recursive
terraform init -backend=false
terraform validate -no-color
```

The check formats and validates the Cloudflare configuration under `infra/cloudflare`.

**It covers much less than a green result suggests.** No plan runs, and the apply belongs to
Terraform Cloud. A change that is well-formed, valid, and wrong still passes. Only a human read
catches such a change.

Two failures are not the author's code, and both are `not run` rather than a real failure:

- Terraform is missing from `PATH` (exit 127). The devcontainer pins 1.16.0 to match CI.
- `infra/cloudflare` was never initialized. `validate` reports `Module not installed`. Fix it with
  `terraform -chdir=infra/cloudflare init -backend=false`, which needs network access to the
  Terraform registry.

A `fmt` failure is a real failure. `fmt` needs no initialization.

## Repository tooling

### `hooks:check`

```bash
npm run hooks:check # runs every .claude/hooks/tests/*-cases.sh suite
```

The Claude Code hooks are shell scripts with real logic, so they have their own test suites. CI
runs the check in the Verify tooling job.

The check is not part of the preflight gate, because it inspects the repository's tooling rather
than the site. A change to `src/` cannot break it.

## Dependencies

### `audit:check`

```bash
npm run audit:check # npm audit --package-lock-only --omit=dev
```

Audits the production dependency tree for known advisories.

**Nothing runs this check.** It is in no gate and in no CI job. The script exists and works, but
only a person who types the command invokes it.

The question is open rather than decided: whether to add the check to the pipeline, add it to the
gate, or remove it. Each option has a cost. An advisory published after a change is written can
fail a pull request that changed nothing relevant, which argues for keeping this check out of a
per-change gate and running it on a schedule instead.

## Related

- [development-workflow.md](../development-workflow.md) — where the checks sit in the workflow.
- [tooling/workflow.md](../tooling/workflow.md) — the skills and CI jobs that run them.
- [development-environment.md](../development-environment.md) — setting up a machine so the checks
  can run at all.
