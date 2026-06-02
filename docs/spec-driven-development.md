# Spec-driven development

Changes to this site are planned with [OpenSpec](https://github.com/Fission-AI/OpenSpec) — a
lightweight spec layer that gets a human and the AI agent to **agree on what to build before any
code is written**. A proposal captures the intent, the work is applied against it, and the agreed
spec is then folded into a living record of how the site behaves.

This keeps the documentation honest: the spec is written first and updated as part of the change,
so it never drifts behind the code.

## When to use it

Use OpenSpec for changes to the site itself:

- **Features** — new capabilities or behaviour (e.g. a theme toggle, a tags index, search).
- **Design** — visual and layout changes (typography, colour, spacing, components).
- **Infrastructure** — Terraform, deployment, CI/CD, and hosting changes under `infra/`.

Refactors and other non-trivial code changes follow the same flow when they're worth agreeing on
up front.

### Out of scope: writing blog articles

Authoring or editing a **blog article** is _not_ an OpenSpec change. Article content lives under
`src/content/blog/**` and is written directly, then committed with the custom `post` type (see
[commit-conventions](commit-conventions.md)). There is no spec for prose.

The blog _infrastructure_ — rendering components, the content schema in `src/content.config.ts`,
remark plugins, the RSS feed — is ordinary feature work and **is** in scope.

## The workflow

OpenSpec is driven from Claude Code through slash commands:

1. **`/opsx:explore "<topic>"`** _(optional)_ — a thinking mode for clarifying an idea or
   investigating the codebase before committing to a proposal. It never writes application code.
2. **`/opsx:propose "<idea>"`** — the agent reads the existing specs and the codebase, then writes
   a change folder under `openspec/changes/<name>/`: a `proposal.md` (the why and the scope),
   `tasks.md` (the work, broken into steps), an optional `design.md` (technical decisions), and
   spec deltas under `specs/`. Review and refine this before any code is written.
3. **`/opsx:apply`** — the agent implements the tasks against the agreed proposal.
4. **`/opsx:archive`** — once the change is done, its spec deltas are merged into the living
   `openspec/specs/` tree and the change is moved to `openspec/changes/archive/`.

`openspec list` and `openspec validate` are useful from the CLI.

## Where things live

```
openspec/
├── specs/      # the living source of truth — how the site behaves today
└── changes/    # in-flight proposals; completed ones move to changes/archive/
```

`specs/` answers "how does it work now?"; `changes/` answers "what are we changing, and why?".

## Guardrails for proposals

A proposal must respect the site's enduring constraints — don't restate them in each spec, but
honour them. The authoritative sources are:

- [architecture](architecture.md) — code structure, content model, and theming (CSS custom
  properties on `<html>`, both light and dark first-class).
- [coding-conventions](coding-conventions.md) — TypeScript, Astro patterns, and the testing rules.
- [tech-stack](tech-stack.md) and [vision](vision.md) — the static-only, ad-free, **CSP-strict**
  shape of the site (no third-party scripts, no inline `on*` handlers) and the principles behind it.

In short: output stays static, the CSP stays strict, both themes stay first-class, and UI changes
carry Playwright visual + accessibility coverage.

## Setup

OpenSpec is a local authoring tool, not a project dependency — it is installed on the host
(`npm install -g @fission-ai/openspec@latest`, Node ≥ 20.19) rather than added to `package.json`,
and it is not part of the build or runtime. Its Claude Code integration lives in `.claude/skills/`;
run `openspec init --tools claude` (or `openspec update` after a CLI upgrade) to install or refresh
it. The `openspec/` tree it manages is committed to the repository.
