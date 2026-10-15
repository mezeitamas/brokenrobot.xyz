---
name: running-preflight-checks
description: Runs the brokenrobot.xyz quality gate — type-check, lint, format-check, spec validation, DESIGN lint, design-token drift, the CSP header sync, the Terraform check, the hook suites, build, the third-party-resource guardrail, and the Markdown-twin audit — through `mise run preflight`, and summarizes failures. Use before committing a change or handing it to review; the same set CI's Pipeline jobs enforce. This is the non-visual half of Verify; pair it with testing-visual-regression.
compatibility: Requires mise and the tools mise.toml pins (mise install), with dependencies installed (npm ci). `terraform:check` additionally needs `infra/cloudflare` already initialized.
model: claude-sonnet-5
allowed-tools: Bash
metadata:
    author: brokenrobot.xyz
    version: '5.0'
---

Run the gate once, from the repo root: `mise run preflight`. **The preflight gate** in [docs/development/checks.md](../../../docs/development/checks.md) describes what it runs; read that section first. The task keeps going past a failing check, so one run reports every check — do not stop it, and do not rerun checks one by one to fill gaps.

Every line of a check's output carries its `[<check>]` prefix. A failing check ends with `[<check>] exited with status N` and `[<check>] ERROR task failed`; a check with no such lines passed. Report each check as pass/fail from its own section. For a failing check, quote its first error, as `file:line` + message where the check reports one. A check that never ran is `not run`, not pass. Open with the overall verdict: red when any check failed or is `not run`. Report failures — do not fix anything; the caller reviews and fixes.

Some checks fail for reasons that are not the caller's code — Terraform missing from PATH, an uninitialized `infra/cloudflare`, a `thirdparty:check` that found no `dist/`. checks.md documents these against each check and says which are `not run` rather than `FAIL`. Read a failing check's section there before you judge its exit status. One fix the caller must run is `terraform -chdir=infra/cloudflare init -backend=false`: it needs network access to the Terraform registry, so it will not work from a sandboxed shell.

Where a check's section says what it does not cover, carry that into the report. `terraform:check` is the one that misleads most: it runs no plan, so a change that is valid and wrong still passes it.

For example:

```
red — 2 checks failed

type:check       pass
lint:check       FAIL — src/components/ThemeToggle.tsx:18 — no-floating-promises (3 errors)
designmd:check   pass — 0 errors (2 warnings, advisory)
tokens:check     FAIL — src/styles/tokens.generated.css is stale; run `mise run tokens:generate`
headers:check    pass — CSP header byte-identical across 3 files
terraform:check  pass — fmt + validate clean (no plan; apply is Terraform Cloud's)
```

The example is abridged to show the shape of a row. A real report has one row per check in the preflight output, in the order of the CI pipeline table in checks.md.

This gate covers no visual regression or accessibility — a change is not verified until `testing-visual-regression` has also run.
