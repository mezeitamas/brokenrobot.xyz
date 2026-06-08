# How we run the workflow

The mechanics behind the [development workflow](../development-workflow.md). We implement it with
**OpenSpec** for the artifacts, **role-based Claude Code agents** for the phases, a few **skills** for
the repeatable procedures, and **scaled trunk-based** integration (one change = one short-lived
branch = one PR). Each phase maps to a concrete tool:

| Phase                     | How it's run                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| Explore                   | `/opsx:explore` (or the `openspec-explore` skill)                                           |
| Propose                   | `spec-author` agent / `/opsx:propose`                                                       |
| Review the proposal       | **you** read and approve the change folder                                                  |
| Implement                 | `frontend-implementer` agent / `/opsx:apply`, on a `<type>/<change-name>` branch            |
| Verify                    | `visual-a11y-tester` agent + `frontend-preflight` skill                                     |
| Archive                   | `/opsx:archive` (on the branch, so the PR carries code + spec)                              |
| Review the implementation | the pull request: CI runs the gates, `frontend-reviewer` surfaces findings, **you** approve |
| Integrate                 | merge the PR into `main`                                                                    |
| Deploy                    | `pipeline.yml` releases to production (the environment-approval gate is pending)            |

Nothing is automatic: each agent hands back to you, and **you** hold the three gates — the proposal
before any code, the implementation before it merges, and the production release.

## OpenSpec — the artifacts and commands

[OpenSpec](https://github.com/Fission-AI/OpenSpec) is the spec layer, driven from Claude Code through
slash commands:

- **`/opsx:explore "<topic>"`** — the optional Explore phase; never writes application code.
- **`/opsx:propose "<idea>"`** — reads the specs and codebase, then writes a change folder under
  `openspec/changes/<name>/`: `proposal.md` (why + scope), `tasks.md` (the work), an optional
  `design.md`, and spec deltas under `specs/`.
- **`/opsx:apply`** — implements the tasks against the agreed proposal.
- **`/opsx:archive`** — merges the change's spec deltas into the living `openspec/specs/` tree and
  moves the change to `openspec/changes/archive/`.

`openspec list` and `openspec validate` inspect changes and specs from the CLI.

```
openspec/
├── specs/      # the living record — how the site behaves today
├── changes/    # in-flight proposals; completed ones move to changes/archive/
└── schemas/    # the project-local workflow schema (see "How the proposer is customized")
```

## Branches, integration, and deploy

Each change is one short-lived branch and one pull request — the trunk-based half of the workflow:

- **Branch naming** — `<type>/<change-name>`: a Conventional-Commits type plus the OpenSpec change
  name, e.g. `feat/tags-index`, `fix/rss-urls`. Branch ↔ change ↔ commit type line up.
- **Archive on the branch**, before opening the PR, so the pull request carries the code and the
  updated spec together — they land atomically.
- **The PR runs CI** ([`pipeline.yml`](../../.github/workflows/pipeline.yml)): `format` / `lint` /
  `type` / `specs:check` in the verify job, the build, and the e2e suite — the same gates the
  `frontend-preflight` and `both-theme-snapshots` skills run locally.
- **Merge to `main` deploys.** No release branches; the deploy jobs ship to production on every merge
  — see [tech-stack](../tech-stack.md) for the targets.
- **The deploy gate** (the third human gate) is meant to be a required approval on the `Production`
  and `Cloudflare` GitHub Environments. It isn't configured yet — a planned change.

## The agents (`.claude/agents/`)

Four role-based subagents, each with focused instructions and tool access. Invoke them with the
Agent/Task tool, or let the main session delegate.

- **`spec-author`** (opus) — the architecture-aware proposer. Reads the specs, docs, and codebase
  and drives the propose flow to write a change (`proposal.md`, `tasks.md`, optional `design.md`,
  spec deltas). It deliberately does **not** carry the guardrails or the task structure itself — the
  `brokenrobot` schema and `config.yaml` inject those (see below), so there's one source of truth.
  Writes only under `openspec/`; never application code.
- **`frontend-implementer`** (inherit) — applies an agreed change's `tasks.md`: Astro/Preact/CSS to
  the repo's conventions (scoped `<style>` + `@reference`, token utilities, path aliases,
  `InternalLink`/`ExternalLink`). Surgical edits under `src/`; stops at the Verify step.
- **`visual-a11y-tester`** (inherit) — runs Playwright visual-regression + axe in **both** themes (in
  the devcontainer, so rendering matches CI), regenerates baselines for intentional changes, and
  reports diffs. Read-only on `src/`; hands styling bugs back to the implementer.
- **`frontend-reviewer`** (opus) — a read-only guardrail gate over the diff before commit, grouping
  findings as Blocking / Should-fix / Nits. Flags CSP, theming, interactivity-ladder, and convention
  violations the implementer missed.

## The skills (`.claude/skills/`)

Procedure skills the agents (or you) invoke, alongside the `openspec-*` lifecycle skills:

- **`both-theme-snapshots`** — run/update Playwright visual + a11y in light **and** dark (in the
  devcontainer), with the baseline-review steps. Knows the both-theme dependency on the dark
  Playwright projects.
- **`component-scaffold`** — scaffold a new Astro component or Preact island to convention
  (placement, typed props, scoped token-driven styles, the right interactivity tier).
- **`frontend-preflight`** — run the non-visual gate (`type:check` + `lint:check` + `format:check` +
  `build`) and summarize failures.

## How the proposer is customized

Rather than living in the `spec-author` prompt, the proposal/task shaping is baked into OpenSpec's
own customization, so the standard `/opsx:propose` flow (any agent, not just `spec-author`) produces
it. One source of truth:

- **`openspec/config.yaml` → `context`** — the site's enduring guardrails, injected into every
  artifact's generation. Their canonical home is the project docs ([architecture](../architecture.md),
  [coding-conventions](../coding-conventions.md), [vision](../vision.md)); `config.yaml` points the
  propose flow at them rather than redefining them.
- **`openspec/schemas/brokenrobot/`** — a project-local schema (forked from `spec-driven`). Its
  `templates/tasks.md` pre-seeds the mandatory **Verify** section, and its `tasks` instruction
  carries the **primitives-first** rule (a slice that uses a `.btn`/`.tag`/`.card`/… primitive must
  establish it first — the foundation shipped tokens only). `config.yaml` selects it via
  `schema: brokenrobot`.

`openspec instructions tasks --change <name>` prints the composed result (template + schema
instruction + context). The seeded Verify section is:

```markdown
## N. Verify

- [ ] Visual + a11y snapshots pass in **both themes** for every touched view (both-theme-snapshots)
- [ ] `type:check`, `lint:check`, `format:check` all pass (frontend-preflight)
- [ ] `build` succeeds — no third-party requests, no CSP violations
- [ ] Manual preview: no theme flash, interactions work, console clean, responsive at 375px
```

This shapes _generation_. Structural validity is also **enforced** in CI: the `verify` job runs
`npm run specs:check` (`openspec validate --all --strict`), so malformed proposals or spec deltas
fail a PR. The _content_ rules above (the Verify section, primitives-first) are generation-shaped
only — not hard-checked — so the `frontend-reviewer` and your review are the backstop. The schema
fork is OpenSpec-experimental: it's pinned in the repo and may need reconciling when OpenSpec updates
its upstream templates.

## Setup

OpenSpec is pinned as a **devDependency** (`@fission-ai/openspec`), so `npm ci` installs it for both
CI and local use, and `npm run specs:check` runs that pinned version — it's what CI gates on. It is
dev-only (not part of the build or runtime), and `audit:check` omits devDependencies.

For **interactive** authoring the `opsx` slash commands call `openspec` directly on your `PATH`, so
also install the CLI on the host (`npm install -g @fission-ai/openspec`, Node ≥ 20.19). Its Claude
Code integration lives in `.claude/skills/`; run `openspec init --tools claude` (or `openspec update`
after a CLI upgrade) to install or refresh it. The customized schema (`openspec/schemas/brokenrobot/`)
and the rest of the `openspec/` tree are committed to the repository.

The local sandbox that constrains the agents is documented in [sandbox.md](sandbox.md).
