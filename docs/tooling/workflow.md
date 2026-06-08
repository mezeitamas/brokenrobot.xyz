# Frontend SDD workflow

The Claude Code implementation of the site's spec-driven process: a set of **role-based agents** and
**skills** that carry an OpenSpec change from idea to merged code, adding a `verify` and a `review`
pass so changes follow the architecture by default.

The OpenSpec _process_ itself — why and when to use it, what's in scope, the
`propose → apply → archive` lifecycle, and where artifacts live — is the application doc
[../spec-driven-development.md](../spec-driven-development.md). This doc covers only the tooling
layer that sits on top of it.

## Where the agents fit

OpenSpec's lifecycle is `propose → apply → archive`. The agents wrap a `verify` and a `review` step
around `apply`, so the guardrails are checked before anything is committed:

```
explore? → PROPOSE → (human review) → APPLY → VERIFY → REVIEW → archive → PR
            spec-author              frontend-     visual-a11y-  frontend-
                                     implementer   tester +      reviewer
                                                   frontend-
                                                   preflight
```

Nothing is automatic: each agent hands back to you, and the human review of the proposal — before
any code is written — is the most important checkpoint.

## The agents (`.claude/agents/`)

Four subagents, each with focused instructions and tool access. Invoke them with the Agent/Task
tool, or let the main session delegate.

- **`spec-author`** (opus) — the architecture-aware proposer. Reads the specs, docs, and codebase
  and drives the OpenSpec propose flow to write a change (`proposal.md`, `tasks.md`, optional
  `design.md`, spec deltas). It deliberately does **not** carry the guardrails or the task structure
  itself — the `brokenrobot` schema and `config.yaml` inject those (see below), so there's one
  source of truth. Writes only under `openspec/`; never application code.
- **`frontend-implementer`** (inherit) — applies an agreed change's `tasks.md`: Astro/Preact/CSS to
  the repo's conventions (scoped `<style>` + `@reference`, token utilities, path aliases,
  `InternalLink`/`ExternalLink`). Surgical edits under `src/`; stops at the Verify step.
- **`visual-a11y-tester`** (inherit) — runs Playwright visual-regression + axe in **both** themes
  (in the devcontainer, so rendering matches CI), regenerates baselines for intentional changes, and
  reports diffs. Read-only on `src/`; hands styling bugs back to the implementer.
- **`frontend-reviewer`** (opus) — a read-only guardrail gate over the diff before commit, grouping
  findings as Blocking / Should-fix / Nits. Flags CSP, theming, interactivity-ladder, and
  convention violations the implementer missed.

## The skills (`.claude/skills/`)

Procedure skills the agents (or you) invoke, alongside the `openspec-*` lifecycle skills:

- **`both-theme-snapshots`** — run/update Playwright visual + a11y in light **and** dark (in the
  devcontainer), with the baseline-review steps. Knows the both-theme dependency on the dark
  Playwright projects.
- **`component-scaffold`** — scaffold a new Astro component or Preact island to convention
  (placement, typed props, scoped token-driven styles, the right interactivity tier).
- **`frontend-preflight`** — run the non-visual gate (`type:check` + `lint:check` + `format:check` +
  `build`) and summarize failures.

## How the proposer is customized (OpenSpec)

Rather than living in the `spec-author` prompt, the proposal/task shaping is baked into OpenSpec's
own customization, so the standard `/opsx:propose` flow (any agent, not just `spec-author`) produces
it. There is one source of truth:

- **`openspec/config.yaml` → `context`** — the site's five enduring guardrails (static output,
  strict CSP, both-themes first-class, the interactivity ladder, stable `/blog/` + `rss.xml`),
  injected into every artifact's generation. Their canonical home is
  [../architecture.md](../architecture.md), [../coding-conventions.md](../coding-conventions.md),
  and [../vision.md](../vision.md) — `config.yaml` points the propose flow at them; it doesn't
  redefine them.
- **`openspec/schemas/brokenrobot/`** — a project-local schema (forked from `spec-driven`). Its
  `templates/tasks.md` pre-seeds the mandatory **Verify** section, and its `tasks` instruction
  carries the **primitives-first** rule (a slice that uses a `.btn`/`.tag`/`.card`/… primitive must
  establish it first — the foundation shipped tokens only). `config.yaml` selects it via
  `schema: brokenrobot`.

`openspec instructions tasks --change <name>` prints the composed result (template + schema
instruction + context) — the exact text the flow follows. The seeded Verify section is:

```markdown
## N. Verify

- [ ] Visual + a11y snapshots pass in **both themes** for every touched view (both-theme-snapshots)
- [ ] `type:check`, `lint:check`, `format:check` all pass (frontend-preflight)
- [ ] `build` succeeds — no third-party requests, no CSP violations
- [ ] Manual preview: no theme flash, interactions work, console clean, responsive at 375px
```

This shapes _generation_. Structural validity is also **enforced** in CI: the `verify` job runs
`openspec validate --all --strict`, so malformed proposals or spec deltas fail a PR. The _content_
rules above (the Verify section, primitives-first ordering) are generation-shaped only — not
hard-checked — so the `frontend-reviewer` and your review are the backstop. The schema fork is
OpenSpec-experimental: it's pinned in the repo and may need reconciling when OpenSpec updates its
upstream templates.

The local sandbox that constrains the agents is documented in [sandbox.md](sandbox.md).
