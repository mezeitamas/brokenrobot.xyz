## 1. Regroup the pipeline into Verify, Build and Test

- [x] 1.1 Move the `thirdparty:check` and `twins:check` steps from `build-site` to `test-site` in
      `.github/workflows/pipeline.yml`, placing both after the `dist/` download and before the
      Playwright steps — verify by reading the file: `build-site` runs only `npm ci`, `build` and the
      artifact upload, and `test-site` runs both checks against the downloaded `dist/`
- [x] 1.2 Add `needs: [verify-site, verify-terraform, verify-tooling]` to `build-site`, using the job
      ids as they end up after task 1.3 — verify `test-site` still declares `needs: build-site`, and
      that no job declares a dependency on a job id that does not exist
- [x] 1.3 Rename the `verify-terraform` job to `verify-infrastructure` and its display name from
      `Verify Terraform` to `Verify infrastructure` — verify `grep -rn "Verify Terraform\|verify-terraform"`
      returns nothing outside `openspec/changes/archive/`
- [x] 1.4 Add `if: ${{ !cancelled() }}` to the six check steps of `verify-site` (`format:check`
      through `tokens:check`), leaving checkout, `setup-node` and `npm ci` unconditional, and add a
      comment stating why `continue-on-error` must never replace it — verify by reading the file:
      every one of the six carries the condition, and `grep -n "continue-on-error" .github/workflows/`
      returns nothing

## 2. Correct every description of the pipeline

- [x] 2.1 Update the **CI pipeline** table in `docs/development/checks.md`: `thirdparty:check` and
      `twins:check` move from the Build site row to the Test site row, and the Verify Terraform row
      is renamed — verify each of the five table rows names the job's display name exactly as
      `pipeline.yml` declares it, and that the surrounding prose about the gate not covering
      `hooks:check` or the e2e suite still reads true
- [x] 2.2 Record the phase ordering in that same section — the pipeline now runs Verify, then Build,
      then Test, and a failed Verify stops the run before the build — verify the section states the
      ordering without listing the checks a second time, since this page's rule is one list only
- [x] 2.3 Fix the header comment in `scripts/check-third-party-resources.mjs`, which says the check
      runs "in CI's Build job after `astro build`" — verify the sentence names the Test job and that
      no other line in the file names the Build job
- [x] 2.4 Fix the same sentence in the header comment of `scripts/check-markdown-twins.mjs` — verify
      as in 2.3
- [x] 2.5 Replace the job enumeration in `.github/workflows/deploy.yml`'s leading comment with the
      gate rule stated without naming jobs, keeping the two paragraphs about `workflow_run` firing
      once per matching run — verify the comment names no individual Pipeline job, so it cannot drift
      again, and that nothing below the comment changed

## 3. Verify

- [x] Visual + a11y snapshots pass in **both themes** for every touched view (testing-visual-regression skill)
- [x] All preflight gate checks pass — the set in `docs/development/checks.md` (running-preflight-checks skill)
- [x] Manual preview: no theme flash, interactions work, console clean, responsive at 375px
- [ ] On the change's pull request, confirm the run this repository cannot verify locally: the three
      Verify jobs start first, `build-site` waits for all three, `test-site` waits for `build-site`,
      and both moved checks execute inside **Test site**
- [ ] On that same run, confirm a failing check in `verify-site` does not hide the checks after it —
      push a deliberate formatting error on a scratch commit, observe all six check steps report and
      the job still conclude `failure`, then drop the commit
