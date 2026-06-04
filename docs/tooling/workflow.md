# Frontend SDD workflow

How a change to the site goes from an idea to merged code, using **OpenSpec** for the plan and a
set of **role-based agents** and **skills** to carry it out. The agents and skills live in
[`.claude/`](../../.claude); the OpenSpec _process_ they follow (proposing and applying changes) is
documented with the application docs in
[../spec-driven-development.md](../spec-driven-development.md).

This layer exists so that spec-driven changes follow the site's architecture and conventions by
default — the guardrails are baked into the agent and skill instructions rather than re-explained
each time.

## The loop

A change moves through four phases. The first three OpenSpec phases (`propose` → `apply` →
`archive`) are the lifecycle; the agents add a `verify` and a `review` step around `apply` so the
guardrails are enforced before anything is committed:

```
explore? → PROPOSE → (human review) → APPLY → VERIFY → REVIEW → archive → PR
            spec-author              frontend-     visual-a11y-  frontend-
                                     implementer   tester +      reviewer
                                                   frontend-
                                                   preflight
```

Nothing is automatic: each agent hands back to you, and the human review of the proposal (before
any code is written) is the most important checkpoint.

## The agents (`.claude/agents/`)

Four subagents, each with focused instructions, tool access, and the guardrails inlined. Invoke
them with the Agent/Task tool, or let the main session delegate.

- **`spec-author`** (opus) — the architecture-aware proposer. Reads the specs, docs, and codebase
  and drives the OpenSpec propose flow to write a change (`proposal.md`, `tasks.md`, optional
  `design.md`, spec deltas). It deliberately does **not** carry the guardrails or the task structure
  itself — the `brokenrobot` schema and `config.yaml` inject those (see below), so there's one
  source of truth. Writes only under `openspec/`; never application code.
- **`frontend-implementer`** (inherit) — applies an agreed change's `tasks.md`: Astro/Preact/CSS to
  the repo's conventions (scoped `<style>` + `@reference`, token utilities, path aliases,
  `InternalLink`/`ExternalLink`). Surgical edits under `src/`; stops at the Verify step.
- **`visual-a11y-tester`** (inherit) — runs Playwright visual-regression + axe in **both** themes,
  regenerates baselines for intentional changes, and reports diffs. Read-only on `src/`; hands
  styling bugs back to the implementer.
- **`frontend-reviewer`** (opus) — a read-only guardrail gate over the diff before commit, grouping
  findings as Blocking / Should-fix / Nits. Flags CSP, theming, interactivity-ladder, and
  convention violations the implementer missed.

## The skills (`.claude/skills/`)

Procedure skills the agents (or you) invoke, alongside the `openspec-*` lifecycle skills:

- **`both-theme-snapshots`** — run/update Playwright visual + a11y in light **and** dark, with the
  baseline-review steps. Knows the both-theme dependency on the dark Playwright projects.
- **`component-scaffold`** — scaffold a new Astro component or Preact island to convention
  (placement, typed props, scoped token-driven styles, the right interactivity tier).
- **`frontend-preflight`** — run the non-visual gate (`type:check` + `lint:check` + `format:check` +
  `build`) and summarize failures.

## How the proposer is customized (OpenSpec)

Rather than living in the `spec-author` prompt, the proposal/task shaping is baked into OpenSpec's
own customization, so the standard `/opsx:propose` flow (any agent, not just `spec-author`) produces
it. There is one source of truth:

- **`openspec/config.yaml` → `context`** — the five guardrails (below), injected into every
  artifact's generation.
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

This shapes _generation_; it doesn't _block_ a non-compliant change (that would be a separate
validation/CI step). The schema fork is OpenSpec-experimental — it's pinned in the repo and may need
reconciling when OpenSpec updates its upstream templates.

## The guardrails

The five constraints `config.yaml` injects (and the execution-phase agents also honor), with the
canonical docs as the authoritative source:

1. **Static output** — no SSR, no runtime backend.
2. **Strict CSP** — no third-party scripts, no inline `on*` handlers; the only inline script is the
   pre-paint theme-init.
3. **Both themes first-class** — components read design tokens, never hard-coded colors; light and
   dark both covered by snapshots + a11y.
4. **Interactivity ladder** — Preact island only for stateful UI; otherwise a bundled Astro
   `<script>`; pre-paint only is the single inline init.
5. **Stable contracts** — `/blog/<slug>/` permalinks and `rss.xml` keep working.

The authoritative sources are [../architecture.md](../architecture.md),
[../coding-conventions.md](../coding-conventions.md), and
[../spec-driven-development.md](../spec-driven-development.md). The local sandbox that constrains
the agents is documented in [sandbox.md](sandbox.md).

## A change, end to end

1. _(optional)_ **Explore** an idea with `/opsx:explore` or the `openspec-explore` skill — no code
   is written.
2. **Propose** with `spec-author` (or `/opsx:propose`): a change folder under
   `openspec/changes/<name>/`. **Review and refine it before any code** — this is the key gate.
3. **Apply** with `frontend-implementer`: implement the tasks, checking them off as you go.
4. **Verify**: `visual-a11y-tester` (both-theme snapshots + a11y) and `frontend-preflight` (the
   static gate).
5. **Review** with `frontend-reviewer`: a final guardrail pass over the diff.
6. **Archive** the change (`/opsx:archive`) — its spec deltas merge into `openspec/specs/` — then
   open a PR.
