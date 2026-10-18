# Verify report: add-tldr

**verdict: green** (the manual-preview item stays with the human; one preview server could not be stopped, see Notes)

## What changed since the last Verify

The zap icon on the post page now takes the default text colour; `minutesReadCountOf.ts` is new; the test "should not appear on a post without a TL;DR" now covers every post without a TL;DR. This run replaces the earlier results.

## visual + a11y

Devcontainer, `mise run test:e2e:check`, all four projects (Desktop Chrome, Desktop Chrome Dark, Pixel 7, Pixel 7 Dark): both themes covered.

- 390 passed, 2 skipped (`navigation.spec.ts` header navigation on Pixel 7 and Pixel 7 Dark, skipped by design), 0 failed. No screenshot failed, so no TL;DR-page baseline was regenerated.
- axe: 0 violations in every project, including the TL;DR page and the post page.
- `tests/tldr.spec.ts`, including the new "should not appear on a post without a TL;DR" (hello-world included): passed in all four projects. That test ran for the first time and passed.

## baselines

The plain run passed, so there was nothing to update that way. The 4 post-page baselines were forced with `playwright test tests/pages/blog-posts/more-agents-same-mythical-month.spec.ts --grep screenshot --update-snapshots=all` in the devcontainer (`--update-snapshots` alone skips a diff under 0.01, `=all` rewrites regardless). 4 passed.

- Rewritten (4), `more-agents-same-mythical-month.spec.ts/`: Desktop Chrome, Desktop Chrome Dark, Pixel 7, Pixel 7 Dark. Reason: the zap icon colour change; the human accepted the finding that an intentional visual change needs new baselines.
- `git status` shows no other baseline changed. The 4 TL;DR-page baselines are untouched.
- I did not review the new desktop baselines by eye for the meta row (my crop missed it). I checked the icon with computed styles and a live screenshot instead, see manual preview.

## manual preview

Playwright MCP, host Chrome, preview of the fresh build on port 8085.

- Zap icon colour (both themes): the icon is outside the link and takes the default text colour: light `rgb(33, 29, 24)`, dark `rgb(244, 239, 228)`. The link text keeps the accent: light `rgb(180, 83, 9)`, dark `rgb(251, 191, 36)`. A dark 1280px screenshot of the meta row shows the icon in the same colour as the calendar and clock icons, with the link in amber: `.playwright-mcp/post-meta-dark.png`.
- 375px: no horizontal overflow (scrollWidth 375) on the post page, the TL;DR page and hello-world.
- `/blog/hello-world/`: no TL;DR link. TL;DR page: no link to itself.
- Interactions: post link opens `/tldr/`; "Full post" returns to the post. No console errors. Only the known `Permissions-Policy` header warnings (`ambient-light-sensor`, `battery`, `document-domain`) appeared; they are not new.
- Theme flash: `data-theme` was set at load; I did not watch first paint by eye. I did not re-test the toggle (unchanged since the last run).

## perf & seo

Advisory, loopback, not production figures. TL;DR page, mobile Lighthouse: SEO 66 (one failed audit, `is-crawlable`, the intended `noindex`), best practices 100. Trace: LCP 46 ms, CLS 0.01, INP not in the trace. Against the prior scores (SEO 66, BP 100, LCP 50 ms, CLS 0.01): no regression.

## gate

`mise run preflight`: exit 0 on the first run, every check passed. The `ENOTEMPTY` build race did not occur this time. `type:check` 0 errors, 0 warnings; `lint:check` 0 errors, 5 warnings (`import/no-unresolved` for `astro:content`, advisory, as before); `designmd:check` 0 errors; `tokens:check`, `headers:check` pass. `terraform:check` runs no plan.

## verify items

- visual + a11y: supported (390 passed, 0 failed, 0 axe violations, both themes; 4 post baselines forced)
- gate: supported (first run passed)
- manual preview: not yours to judge, human gate

Both supported items were already ticked in `tasks.md` and stay ticked. The manual-preview item stays unticked.

## Notes

- Preview server PID 50517 (`astro preview` on port 8085) is still running. `astro preview stop` said "No preview server is running" and `kill 50517` returned "operation not permitted". The human can run `kill 50517`. PIDs 39301 and 39515 also listen on 8080 to 8085 and are not mine (39301 is probably the earlier run's preview).
- The `.playwright-mcp/` files are gitignored.
