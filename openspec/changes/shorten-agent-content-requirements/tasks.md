# Tasks

This change edits no code. Its only output is the spec delta in
`specs/agent-content/spec.md`, which archive applies to `openspec/specs/agent-content/spec.md`.
Do not edit the living spec by hand.

## 1. Spec delta

- [ ] 1.1 Compare the delta with `openspec/specs/agent-content/spec.md` and confirm that each
  SHALL sentence of the two removed requirements appears in one of the four added requirements,
  reworded only where the split needs it. Confirm that all nine scenarios of the two removed
  requirements appear under the added requirements, with name, WHEN, and THEN unchanged, and that
  the delta adds no other scenario.
- [ ] 1.2 Run `openspec validate shorten-agent-content-requirements --strict` with the pinned
  OpenSpec (1.13.2) and with `npx @fission-ai/openspec@1.14.2`, and confirm that both report the
  change as valid.
- [ ] 1.3 Simulate the archive on a copy: copy `openspec/` into a directory under `$TMPDIR`. In
  that copy only, tick every checkbox in
  `openspec/changes/shorten-agent-content-requirements/tasks.md` (for example,
  `sed -i '' 's/- \[ \]/- [x]/' <copy>/openspec/changes/shorten-agent-content-requirements/tasks.md`).
  Without this step, `validate --archived` rejects the archived copy for incomplete tasks. Do not
  tick the checkboxes in the working tree: the real archive runs after Verify, when the tasks are
  complete. Then run `openspec archive shorten-agent-content-requirements -y` in that copy, and
  run the two commands of `specs:check` (`mise.toml`) in that copy:
  - with the pinned OpenSpec (1.13.2): `openspec validate --all --strict`, then
    `openspec validate --archived`;
  - with OpenSpec 1.14.2: `npx @fission-ai/openspec@1.14.2 validate --all --strict`, then
    `npx @fission-ai/openspec@1.14.2 validate --archived`.

  Confirm that all four runs pass, and that the copied `agent-content` spec holds the four new
  requirements and neither of the two old ones. Do not archive in the working tree; archive is a
  later phase.
- [ ] 1.4 Run `git status` and confirm that no file outside
  `openspec/changes/shorten-agent-content-requirements/` changed.

## 2. Verify

- [ ] Visual + a11y snapshots pass in **both themes** for every touched view (testing-visual-regression skill) — N/A: the change touches no view, no code, and no built output.
- [ ] All preflight gate checks pass — the set in `docs/development/checks.md` (running-preflight-checks skill)
- [ ] Manual preview: no theme flash, interactions work, console clean, responsive at 375px — N/A: the change touches no view, no code, and no built output.
