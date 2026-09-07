## Context

See `proposal.md` — Why for the motivation.

Current state that shapes the approach:

- **Five jobs, all parallel but one.** `verify-site`, `verify-terraform`, `verify-tooling` and
  `build-site` run concurrently; only `test-site` waits, on `build-site`. Nothing is proven before
  the build starts.
- **The three Verify jobs exist because of setup, not taxonomy.** `verify-site` needs
  `setup-node` + `npm ci`; `verify-terraform` needs `setup-terraform` and no Node; `verify-tooling`
  needs a Node runtime but deliberately skips `npm ci`, because the hook suites stub the tools they
  exercise and `npm run` reads `package.json` without `node_modules`.
- **Test cannot avoid `npm ci`.** `twins:check` imports `yaml`, and Playwright's `webServer` runs
  `npm run serve` (`astro preview`). The reuse between Build and Test is the `dist/` artifact only.
- **`thirdparty:check` has no dependencies at all** (`node:fs`, `node:path`); `twins:check` needs
  `yaml`, a declared direct dependency. Neither constrains which job it runs in, once that job has
  `dist/`.
- **The e2e suite is not purely `dist/`-facing.** `tests/markdown-twins.spec.ts` reads
  `src/content/blog` at test time to derive its expectations, deliberately, so it asserts against
  what was authored. Test therefore keeps its source checkout; the `dist/` artifact does not replace
  it.

## Goals / Non-Goals

**Goals:**

- A job list that can be read as three phases, where each job's name predicts what it inspects.
- One failing check in Verify reports the other checks in its job rather than hiding them.

**Non-Goals** (beyond `proposal.md` — Non-Goals):

- Reducing total runner minutes. This change likely increases wall-clock time; see Risks.
- Any new abstraction — no composite action, no reusable workflow, no matrix.

## Decisions

**Split Verify by toolchain, not by what each check inspects.**
The alternative was to mirror checks.md's headings exactly: separate jobs for source code, for
authored content and specs, and for generated artifacts. Rejected — those three all need the same
`npm ci`, and the install almost certainly costs more than `specs:check`, `designmd:check` and
`tokens:check` combined. That split would triple the expensive part to parallelize the cheap part.
Splitting where the setup genuinely differs yields three jobs with zero redundant installation, and
it is why the job count stays at five while the graph changes.

**Chain the phases with `needs:` rather than leaving Build parallel to Verify.**
The alternative was to treat Verify/Build/Test as names over a parallel graph, keeping the feedback
loop wide — a type error and a visual regression surfacing in one run. Rejected in favor of the
simpler rule: if Verify does not pass, Build does not run. The phase names then describe the order
as well as the contents, which is the legibility this change is for.

**Use `if: ${{ !cancelled() }}`, never `continue-on-error: true`.**
_Verified during design:_ every step carries an implicit `if: success()`, so a step after a failed
step is skipped. Overriding it with `!cancelled()` makes the step run, and the job still concludes
`failure` because of the earlier failed step. `continue-on-error: true` is the wrong lever and would
break the gate: it forces the step's `conclusion` to `success` in all cases, so the job would pass
with a failing check inside it. Sources: [Ken Muse, "How to Handle Step and Job
Errors"](https://www.kenmuse.com/blog/how-to-handle-step-and-job-errors-in-github-actions/) and
[actions/toolkit#1034](https://github.com/actions/toolkit/issues/1034). GitHub's own workflow-syntax
and expressions pages document the status functions but not the job-conclusion rule, so this rests
on secondary sources that agree, plus confirmation on the PR's own run. This reasoning also belongs
in `pipeline.yml` as a comment, because the failure mode is silent.

**Apply the condition to the six check steps only, and accept the `npm ci` case.**
Checkout, `setup-node` and `npm ci` keep the implicit `if: success()` — there is nothing to report
when the checkout failed. The consequence is that a failed `npm ci` makes all six check steps run
and fail together, because `!cancelled()` cannot distinguish "the previous check failed" from "the
setup failed". The precise alternative is an `id:` on the install step plus
`if: ${{ !cancelled() && steps.install.outcome == 'success' }}` on each check. Rejected: `npm ci`
failing is rare with a committed lockfile, its own step is the first red one in the log, and six
noisy-but-not-misleading failures are a smaller cost than a condition every future editor must
decode.

**Both moved checks go into `test-site`, not a fourth job.**
`test-site` already downloads `dist/` and runs `npm ci`, so both checks run there for free. A
separate "audit dist" job would repeat the artifact download and the install to save nothing.

**`deploy.yml` stops naming Pipeline's jobs.**
Its comment enumerates four jobs and there are five — it drifted when `verify-tooling` was added, and
a hand-maintained list in a comment will drift again. The gate rule ("Pipeline's conclusion is
`success` only when every job passed") is true without the enumeration, so the list goes.

## Risks / Trade-offs

- **Terraform now gates the site build.** A `terraform fmt` failure blocks the build and the e2e
  suite, coupling the Cloudflare configuration to site feedback → Accepted deliberately; the phase
  rule is the stated intent and a `fmt` failure is a seconds-long fix. Gating Build on `verify-source`
  alone was considered and rejected as breaking the model for little gain.
- **The critical path grows** from `max(Verify, Build + Test)` to `Verify + Build + Test` → Accepted.
  This is the cost of the phase gate, and it buys never building known-broken source. Not measured;
  see Open Questions.
- **A later editor "simplifies" `!cancelled()` into `continue-on-error`,** silently turning Verify
  into a job that always passes → Mitigated by a comment in `pipeline.yml` stating why, next to the
  steps it governs.
- **Workflow changes cannot be verified locally.** Nothing in the preflight gate parses or runs
  `pipeline.yml` → Mitigated by the change's own pull request: the graph must be observed on a real
  run before merge.

## Migration Plan

No migration. The change is CI configuration plus comments; there is no state, no data, and nothing
deployed differently. `dist/` is byte-for-byte unchanged, so `deploy.yml` consumes the same artifact
it does today. Rollback is reverting the commit.

## Open Questions

- Whether the longer critical path is acceptable in practice. Job durations were not measured, and
  the answer does not change the specs, the approach, or the task breakdown — if the phase gate turns
  out to hurt, the edge from Build to the Verify jobs is a one-line reversal.
