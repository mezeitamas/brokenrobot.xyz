---
name: both-theme-snapshots
description: Run and update Playwright visual-regression + axe accessibility checks for brokenrobot.xyz in both light and dark themes. Use at a change's Verify step, when UI snapshots need refreshing after an intentional visual change, or when an a11y check needs to run. Encodes the sandbox browser-install workaround and the both-theme dependency.
metadata:
    author: brokenrobot.xyz
    version: '1.0'
---

Run the site's visual-regression and accessibility coverage in **both themes**, and refresh baselines when a visual change is intentional. This is the automated half of every change's **Verify** step.

## Ground truth

- Config: `playwright.config.ts`. Specs: `tests/`. Snapshot tolerance `maxDiffPixelRatio: 0.01`; shared `tests/screenshot.css`.
- Web server: `npm run serve` on `http://localhost:${BROKENROBOT_PORT}` (set `BROKENROBOT_PORT`).
- Scripts: `npm run test:e2e:check` (run), `npm run test:e2e:update` (regenerate snapshots).
- A11y: `@axe-core/playwright` runs inside the specs — a failure is a real bug, not a baseline to bless.

## Step 1 — Ensure browsers are installed (sandbox workaround)

In this environment Playwright can't write its default cache (`~/Library/Caches/ms-playwright` → `EPERM: mkdir`); a plain run errors with "Executable doesn't exist … chrome-headless-shell". The CDN is reachable — only the cache path is blocked. Install to a repo-local path:

```bash
PLAYWRIGHT_BROWSERS_PATH="$PWD/.pw-browsers" npx playwright install chromium
```

**Prefix every Playwright run with the same `PLAYWRIGHT_BROWSERS_PATH`.** Do **not** commit `.pw-browsers/` (and don't commit `.env` with the port). Re-check whether this workaround is still needed — the sandbox is being fixed; if a normal install works, skip the prefix.

## Step 2 — Know which themes you can cover

Both themes are first-class, so UI needs coverage in light AND dark. Check `playwright.config.ts` for the dark projects:

- **`Desktop Chrome Dark` / `Pixel 7 Dark` present** → cover both themes.
- **Absent** → they ship with the **`add-dark-theme-test-coverage`** change. Run the light projects (`Desktop Chrome`, `Pixel 7`) and **explicitly report that dark coverage is not wired yet** — never claim both themes passed when only light ran. Note the prerequisite.

## Step 3 — Run the checks

```bash
PLAYWRIGHT_BROWSERS_PATH="$PWD/.pw-browsers" npm run test:e2e:check
```

Reports land in `reports/tests/e2e/` (list, html, json, junit). Read failures from there.

## Step 4 — Update baselines (only for intentional visual changes)

If snapshots fail because the change is deliberate:

1. Open the diffs in `reports/tests/e2e/` and confirm each matches the intended change — never bless a diff you can't explain.
2. Regenerate:
   ```bash
   PLAYWRIGHT_BROWSERS_PATH="$PWD/.pw-browsers" npm run test:e2e:update
   ```
3. Review every updated baseline under `tests/__screenshots__/` (both themes if available) before staging. An a11y failure is **not** fixed by updating snapshots — fix the underlying issue.

## Step 5 — Report

State: which projects/themes ran, pass/fail counts, any contrast or axe failures (with the offending selector/view), whether dark coverage was available, and which baselines you updated and why. If anything is red, report it with the output — don't round up to green.
