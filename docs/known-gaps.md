# Known gaps

Intent the site does not yet meet, or does not yet record.

Most intent starts undocumented. A principle is clear to the person holding it and written nowhere,
and it becomes visible only when something breaks it. This page is where that intent is captured
first, before it earns a place in [vision.md](vision.md), [architecture.md](architecture.md),
[tech-stack.md](tech-stack.md), or a spec.

## How to read an entry

Each entry states three things:

- **Intent** — what the site is supposed to do. State it even when no other document says it. This
  is the part that evaporates, so it is the part worth writing first.
- **Reality** — what the site does today.
- **Resolves by** — change the code, change the intent, or undecided. Undecided is a valid answer,
  and it is usually the honest one when the gap is found.

An entry has two exits, and they are independent. The intent graduates into the document that owns
it. The gap closes, or the project accepts it and records why. An entry that reaches both exits is
deleted.

Nothing here is subordinate to the enduring principles in [vision.md](vision.md). An entry may
conclude that a principle is wrong.

## Response content types depend on the platform

**Intent:** every file the site publishes is served with a content type that identifies it
correctly, on every platform the site is deployed to.

**Reality:** the built artifact carries no content-type configuration, by design — see the
**Portable artifact** principle. Each platform decides for itself, and the platforms disagree. The
container image maps no extension to Markdown, so it would serve a `.md` file as
`application/octet-stream`. What Cloudflare Pages serves for `.md` is not verified. `astro dev` and
`astro preview` both answer `text/markdown`, for two reasons that apply to neither deployment
target. The Markdown twins are the first files this affects.

**Resolves by:** undecided. Each target may need its own mapping, and something must verify the
served type per target rather than against a local server.

## The end-to-end suite runs against a server the site never deploys to

**Intent:** what the tests exercise before a release behaves like production.

**Reality:** Playwright runs against `astro preview`. Its DOM and visual assertions hold, because
the HTML is the same file production serves. Its response-level behaviour does not: headers,
content types, redirects, and error pages all come from a server that exists only on a developer
machine and in CI.

**Resolves by:** undecided. This needs discovery — whether a platform emulator, or the project's own
container image, can serve the suite instead.

## The e2e suite can start against a server that is not yet serving the site

**Intent:** when the suite starts, the server under test serves the build the suite is meant to
check. A test never fails because the server was not ready.

**Reality:** observed once, and it did not reproduce on the next run. A test asserting the home
page's title received `"Error"` — Astro's generic error page — with
`ENOENT: no such file or directory, open '/workspaces/website/dist/index.html'` behind it. So
`astro preview` answered Playwright's `webServer` readiness probe during a window in which
`dist/index.html` was absent. Which window is not established. Two candidates: `webServer` treats
any response as ready, including an error page, so a server that binds before its files are in
place passes the probe; and `reuseExistingServer` is on outside CI, so a preview server left over
from an earlier run can be serving `dist/` while `npm run build` rewrites it underneath. The two
are not exclusive, and a single non-reproducing observation cannot separate them.

**Resolves by:** undecided. It needs the mechanism established before a fix, because the two
candidates take opposite fixes — a stricter readiness condition against the first, and not reusing
a server across a rebuild against the second. Its rarity is not evidence that it is harmless: it
fails an arbitrary test with an unrelated-looking message, which costs more to diagnose than to
prevent.

## Nothing proves the absence of a flash of the wrong theme

**Intent:** a visitor never sees a frame of the wrong theme.
`openspec/specs/theming/spec.md` requires it, and it is the whole reason the theme is resolved by a
blocking inline script in `<head>` rather than by the bundled toggle module.

**Reality:** every theme assertion in `tests/` reads `html[data-theme]` after the page has settled.
Nothing inspects the first painted frame. A dark baseline fails if the pre-paint init breaks
altogether, because the whole page would then capture light — but that is protection by accident,
and it says nothing about a flash that resolves within a frame or two.

**Resolves by:** undecided. Asserting on first paint needs a capture the current setup does not take,
and it is not yet established which of a trace, a video, or a paint-timing probe can carry that
assertion without becoming flaky.

## The main session does the work it is meant to coordinate

**Intent:** one Claude Code session carries a change end to end — Explore, Propose, an adversarial
review of the proposal by a subagent and then by the human, Apply, Verify by a subagent, a review
of the implementation by a subagent and then by the human, Archive — with the main thread as the
coordinator. Its context holds only what matters: the explore conversation, the human's gate
decisions, one short report per phase, and the questions a subagent returned instead of guessing.
Every phase that reads files, runs commands, or writes artifacts runs in a subagent's context, and
each subagent stops and returns the question when the phase would need to ask the human.

**Reality:** three phases are delegated and return short reports — Apply (`frontend-engineer`),
Verify (`frontend-qa-engineer`), and the implementation review (`frontend-code-reviewer`). The
rest run inline. Propose reads the specs, the docs, and the codebase, and writes four artifacts,
all in the main thread; it sits there so it can ask questions. No subagent reviews the proposal
before the human does. The `running-preflight-checks`, `testing-visual-regression`, and
`scaffolding-components` skills carry a `model:` pin and nothing else, which switches the model for
one turn and isolates nothing, so their output lands in the main thread whenever it calls them
directly. The committing skill replays the full diff into the main thread on every commit. Nothing
loaded in a fresh session names the sequence, the owner of each phase, or the two points where the
main thread must stop for the human, so a session can drift into doing the work itself.

**Resolves by:** change the tooling, through the OpenSpec flow, even though tooling under
`.claude/` otherwise commits directly. The shape is known: a planner subagent that wraps the
vanilla propose and update skills and returns questions instead of guessing, as the engineer does;
a read-only proposal reviewer that attacks the change folder — untestable scenarios, requirements
that contradict the living specs, tasks that use a primitive nobody establishes, a missing tier
decision, unnamed scope, a `skip_specs` claim that hides a behaviour change; `context: fork` with an
`agent:` on the project-owned skills and on the committing skill in the marketplace plugin, which
the docs confirm isolates a skill's tool output; and a coordinator skill, with one pointer line in
`CLAUDE.md`, that names the sequence, the owners, and the stops. The vendored `openspec-*` skills
stay untouched, because `openspec update` regenerates them. Archive and update stay in the main
thread until they prove noisy. Open decisions: whether Blocking proposal findings reach the human
directly or after one automatic planner fix round, and whether this lands on the branch that
restored the engineer or on a branch after it.
