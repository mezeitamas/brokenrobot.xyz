## Why

The pipeline's jobs do not group its checks by what those checks inspect, and one pair of checks is
in the wrong job because of it. `thirdparty:check` and `twins:check` both read `dist/`, and both run
in the job that produces `dist/` — so the job named **Build site** is also the job that tests the
build.

`docs/development/checks.md` already groups every check by what it inspects: "Source code",
"Authored content and specs", "Generated artifacts", "Build output (`dist/`)", "Infrastructure",
"Repository tooling". The pipeline is the artifact out of step with the project's own taxonomy, not
the documentation.

Nothing is broken today; every check that should run does run. The costs are legibility and
sequencing. A reader cannot tell from the job list what has been proven before the build starts, and
in fact nothing has been — every job runs in parallel today, so a build runs even when the source
that produced it has already failed type checking.

## What Changes

- Regroup `pipeline.yml` into three phases, each defined by what its checks inspect:
    - **Verify** — everything that inspects source.
    - **Build** — produces `dist/`. Nothing else.
    - **Test** — everything that inspects `dist/`, reusing what Build produced.
- Split Verify into three jobs **by toolchain**, because the toolchain is what forces a separate job
  rather than a preference: `Verify source` (Node, needs `npm ci`), `Verify infrastructure`
  (Terraform binary, no Node), `Verify tooling` (bash/git/jq, deliberately no `npm ci`). Splitting
  further — one job per checks.md category — would triple `npm ci` to parallelize checks that are
  individually cheaper than the install.
- Move `thirdparty:check` and `twins:check` from **Build site** to **Test site**. Both read `dist/`;
  neither belongs in the job that writes it. Test already downloads the `dist/` artifact and runs
  `npm ci`, so both checks run there with no added setup.
- Chain the phases with `needs:`. **Build site** gains `needs:` on all three Verify jobs; **Test
  site** keeps `needs: build-site`. A failed Verify now stops the pipeline before the build, which is
  the point of naming the phase Verify.
- Give every step in **Verify source** after the first `if: ${{ !cancelled() }}`, so one failing
  check no longer hides the other five. The job still fails, because the failing step is not marked
  `continue-on-error`. This matters more now than it did before: Verify gates Build, so a hidden
  failure costs a whole extra pipeline round trip. It also makes the pipeline honor the rule
  checks.md already states for the preflight gate — "Run every command even when an earlier one
  fails, because stopping at the first failure hides the rest."
- Rename **Verify Terraform** to **Verify infrastructure**, matching checks.md's "Infrastructure"
  heading and the naming of its two sibling Verify jobs.
- Update every place that describes the pipeline: checks.md's CI pipeline table, the header comments
  in both `dist/`-reading scripts, and `deploy.yml`'s comment enumerating Pipeline's jobs — which
  already omits **Verify tooling** and is wrong today.

No behavior changes. No check's command changes, no check is added or removed, and the built output
is byte-for-byte what it was. `deploy.yml`'s gate is untouched: it triggers on Pipeline's conclusion,
which is `success` only when every job passed, and that stays true with jobs chained rather than
parallel.

## Non-Goals

- **Not** building the container image in CI. The `Dockerfile` is built by hand and stays that way;
  Build produces `dist/` and only `dist/`.
- **Not** changing what the e2e suite runs against. It serves `dist/` through `astro preview`.
  `docs/known-gaps.md` records that this is a server the site never deploys to and that resolving it
  needs its own discovery; this change does not touch it.
- **Not** finding a home for `audit:check`. It inspects the dependency tree, which is neither source
  nor `dist/`, so it belongs to none of the three phases. checks.md already records the question as
  open and argues for a schedule rather than a per-change gate; that decision stays open.
- **Not** deduplicating the three `npm ci` runs behind a composite action or reusable workflow. The
  duplication costs runner minutes rather than wall-clock time, and an indirection layer is a worse
  trade at this size. Raised and declined.
- **Not** changing `deploy.yml` beyond its stale comment — no trigger, permission, or step change.
- **Not** adding, removing, or rewriting any check, npm script, or check-script behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. Specs in this project describe what visitors and downstream consumers rely on; this change
alters no site output, no permalink, no feed, and no check's result — only which CI job runs which
existing command, and in what order. `.openspec.yaml` sets `skip_specs: true` accordingly.

## Impact

**Modified CI**

- `.github/workflows/pipeline.yml` — the job graph. Two steps move from **Build site** to **Test
  site**; **Build site** gains `needs:` on the three Verify jobs; **Verify source** steps gain
  `if: ${{ !cancelled() }}`; **Verify Terraform** is renamed **Verify infrastructure**. Job count is
  unchanged at five.
- `.github/workflows/deploy.yml` — the comment at the top listing Pipeline's jobs. It is already
  wrong (it omits **Verify tooling**), and an enumerated list in a comment will drift again, so the
  fix is to state the gate rule without naming the jobs.

**Modified scripts** — comments only, no logic

- `scripts/check-third-party-resources.mjs` — its header says "in CI's Build job after `astro
build`".
- `scripts/check-markdown-twins.mjs` — the same sentence.

**Docs**

- `docs/development/checks.md` — the **CI pipeline** table under "Named sets": the Build site and
  Test site rows change, and the Verify Terraform row is renamed. The per-check sections need no
  change; they already file both moved checks under **Build output (`dist/`)**, which is what makes
  this change a correction of the pipeline rather than of the docs. This page is the only place the
  checks are listed, so nothing else grows a copy.

**Accepted trade-off**

- Gating Build on all three Verify jobs couples the Cloudflare Terraform configuration to the site
  build: a `terraform fmt` failure now blocks the build and the e2e suite. Accepted deliberately.
  The phase rule — if Verify does not pass, Build does not run — is the simple, stated intent, and a
  `fmt` failure is a seconds-long fix. The alternative, gating Build on `Verify source` alone, buys
  little and breaks the phase model.

**Build & verification**

- No `src/` change, no dependency change, no `dist/` change. Playwright visual baselines and axe
  results are expected to be unchanged, because nothing the browser loads is touched.
- The change is verified by the pipeline running on its own pull request: the phases must appear in
  order, a Verify failure must stop the run before Build, and the two moved checks must execute in
  **Test site**.
