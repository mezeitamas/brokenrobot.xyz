# Verify report: add-tldr

**verdict: green** (with notes below; the manual-preview item stays with the human)

## visual + a11y

Devcontainer, `mise run test:e2e:check`, all four projects ran (Desktop Chrome, Desktop Chrome Dark, Pixel 7, Pixel 7 Dark): both themes covered.

- First run: 384 passed, 2 skipped (`navigation.spec.ts` header navigation, Pixel 7 and Pixel 7 Dark, skipped by design), 6 failed. All 6 were screenshot tests: 4 TL;DR page (no baseline existed) and 2 post page (Pixel 7, Pixel 7 Dark; height 17219px -> 17247px, ratio 0.13).
- After `mise run test:e2e:update`: 390 passed, 2 skipped, 0 failed.
- axe: 0 violations in every project, including the TL;DR page (the title and axe tests, 8 results, passed in all four projects).
- `tests/tldr.spec.ts`: 36 of 36 passed (9 tests x 4 projects). `tests/markdown-twins.spec.ts`: 44 of 44 passed.
- I viewed the new Desktop Chrome Dark TL;DR baseline: header, h1, meta row, "Full post, 18 min read", the text, "Hooked? The full post takes 18 minutes." all render as intended.

## baselines

Written by `test:e2e:update` in the devcontainer (`git status` shows only these):

- New (4), `tests/__screenshots__/pages/blog-posts/more-agents-same-mythical-month-tldr.spec.ts/`: Desktop Chrome, Desktop Chrome Dark, Pixel 7, Pixel 7 Dark. Reason: the new TL;DR page.
- Updated (2), `more-agents-same-mythical-month.spec.ts/`: Pixel 7 and Pixel 7 Dark. Reason: the TL;DR link in the meta row wraps on mobile (+28px).
- **Not updated: the Desktop Chrome and Desktop Chrome Dark post baselines.** The task asked for 4 post baselines, but the desktop diff stays under the `0.01` tolerance, so the update does not rewrite them. I did not force them. The committed desktop baselines therefore do not show the TL;DR link. The human decides whether that matters.
- No other baseline changed.

## manual preview

Playwright MCP, host Chrome, preview of the fresh build (see Notes for the port). Light and dark both checked. Console filtered for errors and warnings.

- Post page: console clean except `Permissions-Policy` header warnings (unrecognized `ambient-light-sensor`, `battery`, `document-domain`; a site header issue, not new). "TL;DR in 2 min" link present. Pre-paint `data-theme` was correct at DOMContentLoaded in both schemes (no flash signal; I did not watch first paint by eye). 375px: no horizontal overflow (scrollWidth 375).
- TL;DR page: console clean, theme correct, 375px no overflow, no TL;DR link on itself.
- `hello-world`: no TL;DR link, `/blog/hello-world/tldr/` 404, its twin has no `tldr` key and `/blog/hello-world/tldr/index.md` 404.
- Interactions: the post link opens the TL;DR page; the theme toggle switches light to dark and the choice persists after reload; "Full post, N min read" and "Hooked? ..." both return to the post. No console errors.
- Screenshots: `.playwright-mcp/post-375.png`, `.playwright-mcp/post-375-dark.png`, `.playwright-mcp/tldr-375-dark.png`. I did not review them by eye; the overflow numbers above are the evidence.
- Twins: `/blog/more-agents-same-mythical-month/index.md` 200, `tldr:` key present, canonical is the post page. `/blog/more-agents-same-mythical-month/tldr/index.md` 200, body opens `# TL;DR: More Agents, Same Mythical Month`, `fullPost` is the post twin. **`/blog/more-agents-same-mythical-month.md` is 404**: the site serves twins at `<page>/index.md` only, so the URL in the request does not exist (not a bug).
- `llms.txt`: `## Pages`, `## Post summaries` (one TL;DR entry), `## Blog posts`, `## Optional`, in that order. Sitemap: 0 `/tldr/` URLs. Feed: 12 items, 0 `/tldr/` links.

## perf & seo

Advisory, loopback, not production figures. No prior scores, so no regression claim. TL;DR page, mobile Lighthouse: SEO 66, best practices 100. The one failed audit is `is-crawlable` ("Page is blocked from indexing"), which is the intended `noindex, follow`. Trace: LCP 50 ms, CLS 0.01, INP not in the trace. The post page was not audited separately.

## gate

`mise run preflight`:

- Run 1: `build` FAILED, a race in the parallel run, all other checks passed:
  `[build] ENOTEMPTY: directory not empty, rename '.../node_modules/.vite/deps_temp_05a7cd27' -> '.../node_modules/.vite/deps'` (`astro build` and `astro sync`/`astro check` both re-optimized Vite deps at once).
- Run 2 (rerun of the whole gate): exit 0, every check passed. `twins:check` 12 posts and 1 TL;DR; `thirdparty:check` 48 files; `type:check` 0 errors; `format:check` clean (the `review.md` fix holds); `designmd:check` 0 errors; `tokens:check`, `headers:check`, `specs:check`, `terraform:check` (fmt + validate only, no plan) and `hooks:check` pass.
- `lint:check`: 0 errors, 5 warnings (`import/no-unresolved` for `astro:content` in `content.config.ts`, `[...slug].md.ts`, `llms.txt.ts`, `rss.xml.ts`, `tldr.ts`). Advisory. The build race is flaky and worth a note for the project.

## TypeScript diagnostic (`[...slug].md.ts` lines 64, 69, 70)

The editor's implicit-any reports are on `posts.map((post) => ...)` and `.filter((post) => ...)`. They come from `getCollection('blog')` being untyped in the editor, which is the same `astro:content` resolution failure that ESLint warns about. The type-check does NOT catch it: `astro check` reports 0 errors, 0 warnings, and `tsc --noEmit` also exits clean (the CLI resolves the generated `.astro/types.d.ts`). The cause in the editor is most likely stale or missing generated Astro types; I did not confirm it in the editor. Nothing was changed.

## verify items

- visual + a11y: supported (390 passed, 0 failed, 0 axe violations, both themes; caveat: 2 of the 4 expected post baselines were not rewritten, see baselines)
- gate: supported (run 2 passed; run 1 failed on the build race, quoted above)
- manual preview: not yours to judge, human gate
- tasks 2.5 and 2.6: supported (tldr.spec 36/36; title and axe 8/8; lint, type and format pass)
- task 4.1: supported (preflight passed on rerun)

## Notes

- The preview I started with `BROKENROBOT_PORT=8080 mise run serve` actually ran on port 8082 (astro preview daemonizes; the `.env` is unreadable here). Port 8080 and 8081 were already served by other node processes (8080 is probably the devcontainer's). I used 8082. I could not stop my preview: `kill 39269` returned "operation not permitted" and `astro preview stop` said no server was running. The human can run `kill 39269`.
- The `.playwright-mcp/` screenshots are gitignored.
