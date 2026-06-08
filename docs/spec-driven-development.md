# Spec-driven development

We agree on **what to build before any code is written**. A change starts by capturing intent — the
why, the scope, and the work — and once it's done, the agreed behaviour is folded into a living
record of how the site behaves. The intent is written first and updated as part of the change, so
the documentation never drifts behind the code.

This page is the _what_: the way we work, independent of any tool. The _how_ — the specific tooling,
commands, and agents that implement it — is in [tooling/workflow.md](tooling/workflow.md).

## When to use it

For changes to the site itself:

- **Features** — new capabilities or behaviour (e.g. a theme toggle, a tags index, search).
- **Design** — visual and layout changes (typography, colour, spacing, components).
- **Infrastructure** — Terraform, deployment, CI/CD, and hosting changes under `infra/`.

Refactors and other non-trivial code changes follow the same flow when they're worth agreeing on up
front.

### Out of scope: writing blog articles

Authoring or editing a **blog article** is _not_ a spec-driven change. Article content lives under
`src/content/blog/**` and is written directly, then committed with the custom `post` type (see
[commit-conventions](commit-conventions.md)). There is no spec for prose.

The blog _infrastructure_ — rendering components, the content schema, remark plugins, the RSS feed —
is ordinary feature work and **is** in scope.

## The workflow

A change moves through these phases. Two of them are explicitly **yours to decide** — you approve the
proposal before any code, and the implementation before it merges; the rest is work done for you to
accept or send back.

1. **Explore** _(optional)_ — clarify the idea and investigate the codebase before committing to a
   proposal. No code is written.
2. **Propose** — capture the intent: the why and scope, how the site's behaviour changes, and the
   work broken into small steps. This is the agreement.
3. **Review the proposal** — **you** read and refine it, then approve it **before any code is
   written**. The most important gate.
4. **Implement** — do the agreed work, surgically; nothing beyond the proposal.
5. **Verify** — every change is checked: visual + accessibility coverage in **both themes**, and the
   quality gate (types, lint, formatting, build).
6. **Review the implementation** — **you** examine the result against the guardrails (below) and
   approve it before it merges.
7. **Archive** — fold the agreed behaviour into the living record of how the site works.

The two **you** steps are the decision gates: accept the plan, then accept the result. Everything
between is execution you oversee.

## The living record

We keep two things: a **living record of how the site behaves today**, and the **in-flight changes**
modifying it. The record answers "how does it work now?"; a change answers "what are we changing, and
why?". When a change is done, its agreed behaviour merges into the record — which is what keeps the
record honest.

## Guardrails

Every change must respect the site's enduring constraints — don't restate them in each proposal, but
honour them. The authoritative sources are:

- [architecture](architecture.md) — code structure, content model, and theming (CSS custom
  properties on `<html>`, both light and dark first-class).
- [coding-conventions](coding-conventions.md) — TypeScript, Astro patterns, and the testing rules.
- [tech-stack](tech-stack.md) and [vision](vision.md) — the static-only, ad-free, **CSP-strict**
  shape of the site (no third-party scripts, no inline `on*` handlers) and the principles behind it.

In short: output stays static, the CSP stays strict, both themes stay first-class, and UI changes
carry visual + accessibility coverage.
