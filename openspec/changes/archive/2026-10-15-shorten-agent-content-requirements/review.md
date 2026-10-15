# Review

<!-- Reviewed 2026-10-15, against the living specs and the change's planning artifacts. -->

This is the second re-review. The last Update round revised task 1.3 to fix the earlier Blocking
finding: `validate --archived` rejected the archived copy because its tasks were unchecked. The
fix is now in the plan (`tasks.md:17-23`). Task 1.3 ticks every checkbox in the `$TMPDIR` copy
before the simulated archive, and it says the working tree stays unticked.

Checks run during this review:

- `openspec validate shorten-agent-content-requirements --strict` reports the change as valid with
  the pinned OpenSpec 1.13.2 and with `npx @fission-ai/openspec@1.14.2` (task 1.2).
- I compared the delta with `openspec show agent-content --type spec` again. Every SHALL sentence
  of the two removed requirements appears in one of the four added requirements. "Discovery SHALL
  NOT require the agent to guess a URL pattern" appears in both discovery requirements, scoped to
  each starting point. All nine scenarios (4 + 5) move with name, WHEN, and THEN unchanged
  (2 + 2 + 2 + 3 in the delta). The delta adds no other scenario (task 1.1).
- I ran task 1.3 exactly as it is written now. I copied `openspec/` into a directory under
  `$TMPDIR` and ran the task's `sed` command on the copied `tasks.md` (8 boxes ticked, 0 left
  open). `openspec archive shorten-agent-content-requirements -y` reported "Task status: ✓
  Complete" and `+ 4 added, - 2 removed`. All four runs pass:
  `validate --all --strict` gives 5 of 5 under 1.13.2 and 1.14.2, and `validate --archived` gives
  8 of 8 under 1.13.2 and 1.14.2. The copied `agent-content` spec holds the four new requirements
  and neither old one. `openspec --version` printed 1.13.2 in the copy.
- `git status` in the working tree shows only `openspec/changes/shorten-agent-content-requirements/`
  (task 1.4 holds). The sandbox did not let me delete the temporary copy, so it is still at
  `$TMPDIR/rev-sim.dU8c`. It is outside the repository.

## Findings

### Blocking

None. The earlier Blocking finding on task 1.3 is resolved. The revised procedure passes all four
runs under both versions.

### Should-fix

None.

### Nits

- `tasks.md:25-26` — This nit is carried over from the last review and is not yet folded in. The
  pinned run in the copy assumes that `openspec` under `$TMPDIR` still resolves to 1.13.2.
  `mise.toml` sets the pin only inside the repository. In a shell with `mise activate`, a change to
  a directory under `$TMPDIR` can drop the pin. (In this review's shell the pin held.) **Fix:** in
  task 1.3, run `openspec --version` in the copy and confirm that it prints 1.13.2 before the two
  pinned runs.
- `tasks.md:20` — The example `sed -i '' '...'` is BSD/macOS syntax. GNU sed, in a Linux
  devcontainer for example, reads `''` as the script and fails. The text says "for example", so
  this does not block the task. **Fix (optional):** use a portable form such as
  `perl -pi -e 's/- \[ \]/- [x]/' <file>`, or say that the example is the macOS form.
- `specs/agent-content/spec.md:3-82` — Archive appends ADDED requirements at the end of the living
  spec. The simulation confirms this again: the four new requirements come after "Existing reader
  and crawler contracts are preserved" (lines 81, 99, 118, 136 of the archived copy). The order of
  requirements is not normative, so this affects only how the spec reads. **Fix (optional):**
  accept the new order, or note it in the proposal so that the reorder at archive does not
  surprise the human.
- `specs/agent-content/spec.md:80` — The scenario "Existing index content preserved" says "after
  this change". The phrase referred to the change that introduced `llms.txt`. Here it is
  ambiguous, because this change changes no behaviour. The brief says that scenarios move unchanged
  (`brief.md:27`), so leaving the wording alone is correct. **Fix:** none in this change. Record it
  as a candidate for a later wording pass.
- `brief.md:29-30`, `proposal.md:57-59` — The plan bends the apply rule "Work on the change's own
  `<type>/<change-name>` branch" (`openspec/config.yaml:64`). The artifacts say that the human
  waived it. An artifact cannot grant that waiver, so the human must confirm it at the proposal
  gate. This is not a defect in the plan. **Fix:** the human confirms the waiver at the gate.

### Untestable scenarios

Nothing found. Every scenario moves unchanged from the living spec, and each one has a WHEN/THEN
that can be observed. The one ambiguous phrase ("after this change") is the nit above.

### Requirements that contradict the living specs

Nothing found. The delta REMOVEs both requirements that it replaces. The header names match the
living spec exactly, and archive matched both (`- 2 removed`). The added requirements keep every
normative statement. The other three `agent-content` requirements and the other four specs
(`brand-mascot`, `site-chrome`, `theming`, `typography`) are untouched. `agent-content` still has
requirements after the archive, so `retire_capabilities` is correctly absent from
`.openspec.yaml`.

### Tasks that use a primitive nobody establishes

Nothing found. No task touches code, classes, or tokens.

### A missing tier decision

Nothing found. The change adds or alters no interactive UI. The config's inclusion criteria
(`openspec/config.yaml:47`) do not call for `design.md`, so leaving it out is correct.

### Unnamed scope

Nothing found. The revised task 1.3 ticks the checkboxes in the `$TMPDIR` copy only, and it says
so (`tasks.md:18-23`). It adds no work in the working tree. The Non-Goals (`proposal.md:30-37`)
close the boundary: no code, no other requirement or spec, no pin bump, no schema-fork
reconciliation, and no direct edit of the living spec. No other open change exists under
`openspec/changes/`, so "No other change under `openspec/changes/` must merge first"
(`proposal.md:56`) holds. The Verify group is last and keeps all three items. It marks the two view
items N/A with a reason, and the preflight gate still runs.

### A `skip_specs` claim that hides a behaviour change

Nothing found. The change does not set `skip_specs`. It changes only the spec, and no visitor,
feed, crawler, or check would observe a difference in the built site.

## Verdict

Ready for the human's proposal gate. There are no Blocking or Should-fix findings. The human must
confirm the branch-rule waiver at the gate.
