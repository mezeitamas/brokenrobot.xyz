# Code review: shorten-agent-content-requirements

**Range:** working tree against `HEAD` (`git diff HEAD`, plus untracked files in the change
folder). Touched views: none.

The range holds four files, all inside `openspec/changes/shorten-agent-content-requirements/`:
Prettier re-indentation in `brief.md` and `proposal.md`, the same re-indentation plus checkbox
ticks in `tasks.md`, and the new `verify-report.md`. No file under `src/`, no config, no CSP
surface, and no blog article is touched, so the CSP, theming, interactivity, and component
convention items do not apply.

The delta spec `specs/agent-content/spec.md` is not in this range: it was committed in `e3d2b21`.
The delegation asked for it explicitly, so this review compares it with
`openspec/specs/agent-content/spec.md` as well.

## Spec delta against the living spec

**"Markdown representations are faithful to the authored article"** (living spec lines 35-41).
Every sentence carries over word for word. The prose-only SHALL and the authoring-syntax SHALL go
to "contain only the authored prose" (delta lines 7-10). The code-sample SHALL and the image SHALLs
go to "keep code samples and images intact" (delta lines 25-28). The only edit is the added lead-in
"In the Markdown representation," on line 25. That lead-in is needed because the sentence no longer
follows the derivation sentence. No SHALL is weakened, dropped, or added.

**"Agents can discover the Markdown representation"** (living spec lines 93-100). The
page-advertises-alternate SHALL, the page-points-to-index SHALL, the index-links-Markdown SHALL,
and the pages-without-Markdown SHALL all carry over, reworded only as subjects (delta lines 44-45
and 62-64). The no-guessed-URL SHALL NOT is stated once in each new requirement (lines 45-46 and
64-65), so taken together they cover what the original covered. The umbrella sentence "An agent
SHALL be able to find ... from two independent starting points" is not kept as a sentence. Its
obligation still holds, because each starting point is now its own standalone requirement (see
the Nit below).

**Scenarios.** All nine scenarios appear in the delta, with name, WHEN, and THEN identical to the
living spec, line wrapping included. Four sit under the two prose and code/image requirements, and
five under the two discovery requirements. The delta adds no other scenario. The only difference
is order: "No authoring syntax leaks" now comes right after "No site chrome", under its new
requirement.

The REMOVED entries name both old requirements exactly as the living spec spells them, and they
give a Reason and a Migration. `openspec validate shorten-agent-content-requirements --strict`
passes with the pinned OpenSpec.

## Blocking

None.

## Should-fix

None.

## Nits

- `specs/agent-content/spec.md:44-46,62-65` (committed in `HEAD`, outside the range): the
  delta drops the original umbrella sentence "An agent SHALL be able to find a post's Markdown
  representation from two independent starting points". The two standalone requirements already
  carry its meaning, so no fix is needed. If you want the word "independent" to stay explicit,
  add "independently of the index" to line 44, and do this only if the planner agrees.
- `verify-report.md:25-26`: the gate evidence points at `/tmp/claude-501/preflight{1,2}.log`.
  These files do not persist, so the audit log cannot be checked again later. Move the relevant
  lines into the report, or leave as is if the report alone is accepted as the record.

## Surgical check

Every changed line traces to a task. The `brief.md` and `proposal.md` hunks are whitespace only
(nested bullets re-indented). `npx prettier --check` on the change folder passes, which confirms
they are formatter output and not rewording. The `tasks.md` ticks on 1.1-1.4 and on the gate item
match `verify-report.md`. The two N/A Verify items stay unticked, which is correct for a change
with no touched view. The note in task 1.3, "Do not tick the checkboxes in the working tree",
refers to the simulated archive, so ticking after the tasks are done does not break it.

## Not verified

- **Whether the Verify steps ran.** A diff cannot show this. `verify-report.md` claims a green
  `mise run preflight` (run 2), but the logs it cites are outside the repo and were not read.
- **OpenSpec 1.14.2 validation and the archive simulation (tasks 1.2, 1.3).** Only the pinned
  OpenSpec's `validate --strict` was re-run here. `npx openspec` for 1.14.2 did not run in this
  session, and the archive copy was not reproduced.
- **The delta spec's place in the range.** It is committed in `HEAD`, so `git diff HEAD` does not
  show it. It was reviewed against the living spec only because the delegation asked for it.

**Verdict:** ready to commit. The delta keeps every SHALL and all nine scenarios unchanged, and
the working-tree changes are formatting, ticks, and the verify report only.
