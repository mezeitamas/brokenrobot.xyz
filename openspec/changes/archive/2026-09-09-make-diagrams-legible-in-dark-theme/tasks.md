<!--
  Group 1 landed ahead of this plan. The author exported all eleven diagrams by hand and committed
  them as `bab8318 fix: re-export the diagrams as theme-neutral svg`, before the task list reached
  that step. The groups below are re-ordered around that: the tree does not build until the MDX
  references follow the assets, so every Playwright task now comes after the conversion rather than
  before it. See design.md — **Risks / Trade-offs** for the one cost this sequence carries.
-->

## 1. The re-export (landed in `bab8318`)

- [x] 1.1 **Author's manual step.** Export all eleven diagrams from their `.excalidraw` sources to
      SVG, with Background **off**, Dark mode **off**, Embed scene **off**, Scale 3, default padding,
      each saved beside its source: six replacing PNGs in
      `advanced-static-website-hosting-with-amazon-s3-and-cloudfront` and
      `url-redirect-with-amazon-cloudfront-and-amazon-route-53`, and five overwriting the existing
      SVGs in `beyond-tabs-and-spaces-finding-a-balance-in-coding-conventions`.
      **Verified** across all eleven files: no `<rect … fill="#ffffff">` anywhere, and `width` exactly
      3.000× the `viewBox` width on every one — the scale the previous SVG exports used. The five
      overwritten files no longer open with the white background rectangle they carried at `e45d91a`.
      `git show --stat bab8318` confirms no `.excalidraw` source was touched, so the export stays
      repeatable.
- [x] 1.2 Record each new SVG's size against what it replaces, and report any SVG larger than the PNG
      it replaces rather than letting it pass unremarked.
      **Measured:** eleven SVGs total 984 kB against the 4,536,264 bytes (4.5 MB) of PNG removed, plus
      the avif/webp variant matrix the build no longer generates from them. Nine are 12–65 kB. The two
      outliers are the ones design.md predicted: `baseline-architecture-s3-geo.svg` at 318 kB with one
      embedded data URI, and `target-architecture-s3-cdn-geo.svg` at 333 kB with two — the drawing's
      ~148 kB world map and a 47×47 marker. Neither is larger than the PNG it replaces (1288 kB and
      1376 kB), so nothing needs reporting on that count.
- [x] 1.3 Delete the six superseded PNGs — `baseline-architecture-s3.png`,
      `baseline-architecture-s3-geo.png`, `target-architecture-s3-cdn.png`,
      `target-architecture-s3-cdn-geo.png`, `target-architecture-s3-cdn-cloudfront-function.png` in
      `advanced-...`, and `target-architecture-s3-cdn-cloudfront-function.png` in `url-redirect-...`.
      **Verified** deleted by `bab8318`. The grep that proves nothing still references them moves to
      task 2.1, because the MDX imports have not followed yet: `npm run build` currently fails with
      `[UNRESOLVED_IMPORT] Could not resolve '../advanced-…/target-architecture-s3-cdn.png'`. That
      failure is the starting condition of group 2, not a defect in this task.

## 2. Make the tree build again

- [x] 2.1 Convert the eight diagram references in
      `advanced-static-website-hosting-with-amazon-s3-and-cloudfront/index.mdx` and
      `url-redirect-with-amazon-cloudfront-and-amazon-route-53/index.mdx` from `<BlogPostPicture>` to
      Markdown images pointing at the `.svg` files, carrying each one's `alt` text across verbatim,
      and delete the image imports and the now-unused `BlogPostPicture` import from both files. Two of
      `url-redirect`'s references point into the other post's folder and become
      `../advanced-…/name.svg`; if Astro cannot resolve a Markdown image across the post-folder
      boundary, take the fallback in design.md — **Risks / Trade-offs** and copy those two SVGs into
      the post's own folder. Change no prose. Verify `npm run build` now **succeeds** — it fails
      before this task and passing it is the point — that `npm run lint:check` and
      `npm run format:check` pass, that `grep -rn` over `src/`, `tests/`, `docs/`, `scripts/` and
      `public/` finds no remaining reference to any of the six deleted PNG filenames, and that
      `grep -rn "BlogPostPicture" src/content/blog` reports only
      `hosting-a-static-website-on-amazon-s3` and `the-renaissance-of-written-coding-conventions` —
      the two exempted rasters, which keep the component and keep `mdxToMarkdown`'s component branch
      exercised.
- [x] 2.2 Verify the built output and the Markdown twins against `dist/`: each of the eleven diagrams
      is a bare `<img src="/_astro/<name>.<hash>.svg" …>` with no `<picture>` wrapper and no `srcset`,
      the two exempted rasters still build to a `<picture>`, and no `<img>` with an `.svg` source
      appears anywhere outside the eleven — the selector in task 3.1 depends on that last point.
      Verify `npm run twins:check` passes, and read the three affected posts' twins: the image URLs
      end in `.svg`, resolve to an emitted asset, and keep their alternative text.

## 3. The read-time treatment

- [x] 3.1 Add the treatment to `src/styles/base.css`, beside the existing `.prose` rules:
      `html[data-theme='dark'] .prose img[src$='.svg'] { filter: invert(93%) hue-rotate(180deg); }`.
      Carry a comment saying where the constant comes from (`THEME_FILTER` in the Excalidraw bundle,
      the same filter its "Dark mode" export applies) and that the selector treats an SVG in article
      prose as line art — artwork that must keep its own colours is supplied as raster. Verify
      `npm run format:check` and `npm run tokens:check` pass: this is a filter, not a colour token, so
      `tokens.generated.css`, `DESIGN.md` and `DESIGN.dark.md` must all be untouched.
- [x] 3.2 Gate the change on the open risk. `baseline-architecture-s3-geo.svg` and
      `target-architecture-s3-cdn-geo.svg` carry the world map and the marker as data URIs (one and
      two respectively, confirmed in task 1.2), and it is not established that a data-URI image
      renders inside an `<img>`-loaded SVG under this site's two-layer CSP. Run `npm run build` then
      `npm run serve` and load
      `/blog/advanced-static-website-hosting-with-amazon-s3-and-cloudfront/` in a browser. Verify the
      map actually renders in both themes — look at the picture and read the console for a blocked
      resource, `img-src 'self'` and `style-src-attr 'none'` being the directives that could bite, and
      the new exports' `<!DOCTYPE svg …>` prolog being the one thing they carry that the previous
      exports did not. Name what the inverted map and the marker look like against `--bg: #17150f`.
      This can no longer gate the other exports, because they are already committed; it gates the
      change proceeding at all. If the map does not render, stop and report: the two `-geo` diagrams
      then need a different answer, and that is a decision, not a fix.

## 4. Coverage

- [x] 4.1 Restore the screenshot test commented out in
      `tests/pages/blog-posts/beyond-tabs-and-spaces-finding-a-balance-in-coding-conventions.spec.ts`:
      uncomment it, delete the stale comment about iPhone 12 Pro — a device `playwright.config.ts` no
      longer defines — and add the `settleImages(page)` call and its import that every other post
      spec's screenshot test has, since the five diagrams are `loading="lazy"` and a full-page capture
      does not reliably scroll them in. Verify the file matches the shape of
      `tests/pages/blog-posts/url-redirect-with-amazon-cloudfront-and-amazon-route-53.spec.ts`, that
      `npm run lint:check`, `npm run type:check` and `npm run format:check` pass, and — before
      anything depends on this baseline existing — that the capture stays under the 32767 px limit the
      old comment blamed. Record the four heights in this task. The tallest capture in the suite today
      is 25497 px, on `advanced-...` under Pixel 7, so there is headroom but not proof. If any capture
      exceeds the limit, stop and take the per-figure fallback in design.md — **Risks / Trade-offs**.
      **Done.** File matches the shape of `url-redirect-...spec.ts`; `lint:check`, `type:check` and
      `format:check` all pass. Heights measured with a standalone Playwright container (host Chromium
      cannot launch in this sandbox — see the Verify note below) against the built `dist/`, scrolling
      the full page first so every `loading="lazy"` diagram decodes before measuring
      `document.body.scrollHeight`: Desktop Chrome 19475 px (light and dark, identical), Pixel 7
      29679 px (light and dark, identical) — the new tallest capture in the suite, still 3088 px
      (9.4%) under the 32767 px limit. No fallback needed.
- [x] 4.2 Add a test to `tests/theme.spec.ts` that asserts the treatment rather than its pixels: load
      the `beyond-tabs-...` post, read `html[data-theme]` as that file's existing tests do, and assert
      that every `img[src$=".svg"]` has a computed `filter` other than `none` when the theme is dark
      and exactly `none` when it is light. In the same test assert the hero photograph's computed
      `filter` is `none` in both — that is the control proving the rule did not reach the `.prose`
      image it must not touch. Verify it passes in all four projects, and that it fails for the right
      reason: delete the rule from `base.css` temporarily and confirm only this test fails, then
      restore it. Verify `npm run lint:check`, `npm run type:check` and `npm run format:check` pass.
      **Done, verified functionally rather than via `playwright test`.** Host Chromium cannot launch in
      this sandbox (macOS Mach-port rendezvous denied), so this was checked with a standalone script
      against the real built `dist/`, served with the exact CSP header `astro.config.ts`/`nginx.conf`
      send, run through a `mcr.microsoft.com/playwright:v1.62.1-jammy` container (matching the pinned
      `@playwright/test` version) reproducing the four projects' device + `colorScheme` combinations.
      All four passed with the rule in place (dark: `invert(0.93) hue-rotate(180deg)` on all 5 diagram
      `<img>`s; light: `none`; hero `<img class="not-prose">`: `none` in both). Deleting the rule and
      rebuilding failed exactly the two dark combinations (filter stayed `none`) while both light
      combinations and the hero control still passed — the right failure. The rule is restored;
      `git diff src/styles/base.css` matches the task-3.1 diff exactly. `lint:check`, `type:check` and
      `format:check` all pass. The QA agent should still run this through the real `playwright test`
      runner in the devcontainer at Verify.

## 5. Record the intent and close the gap

- [x] 5.1 Record the now-explicit intent for content images in `docs/architecture.md`. The
      **Theming architecture** section's "Both themes are first-class" bullet is where it belongs:
      diagrams in article prose are exported theme-neutral from their committed `.excalidraw` source
      and inverted in dark by a rule in `base.css`; an SVG in prose is treated as line art, so artwork
      that must keep its own colours is supplied as raster. Note in **Content model** that a post's
      diagrams are referenced as Markdown images and that `<BlogPostPicture>` is for raster images
      that need responsive variants. Verify both additions describe what the code now does, that no
      check is named or counted (`docs/development/checks.md` is the only list of checks), and that
      `npm run format:check` passes.
- [x] 5.2 Delete the `docs/known-gaps.md` entry "Architecture diagrams are near-unreadable in the dark
      theme". Both of that page's exits are now reached: the intent graduated into
      `docs/architecture.md` and the specs in 5.1, and the gap is closed. Do not carry the entry's
      wording forward — its **Reality** paragraph is wrong about the SVGs, calling them transparent
      when each carried a white background rectangle, and wrong about the count, naming seven PNGs
      when six have an `.excalidraw` source and the seventh is the exempted AWS-icon image. Add no
      replacement entry: the one cost this change carries — that the five `beyond-tabs-...` diagrams
      changed before a baseline watched them — is a sequencing accident recorded in proposal.md and
      design.md, not standing intent the site fails to meet, and it has no "resolves by". Verify no
      other entry is touched and that nothing else in `docs/` still refers to the deleted entry.

## 6. Generate and review the baselines

- [x] 6.1 Generate with `npm run test:e2e:update` in the devcontainer, so rendering matches the
      container CI and the committed baselines both use. Verify `git status` shows exactly four
      additions, under
      `tests/__screenshots__/pages/blog-posts/beyond-tabs-and-spaces-finding-a-balance-in-coding-conventions.spec.ts/`,
      and modifications only under `advanced-static-website-hosting-with-amazon-s3-and-cloudfront` and
      `url-redirect-with-amazon-cloudfront-and-amazon-route-53` — four images each, light and dark.
      Every other baseline must come back **byte-identical**, and the eight belonging to
      `hosting-a-static-website-on-amazon-s3` and `the-renaissance-of-written-coding-conventions` are
      the control that matters: those posts hold only exempted images, so any change there means the
      selector caught something it must not.
      **Done, with one deviation from the predicted shape, reported rather than hidden.** `git status`
      shows the four `beyond-tabs-...` additions and four modifications under `advanced-...` (all four
      projects: Desktop Chrome, Desktop Chrome Dark, Pixel 7, Pixel 7 Dark), but only **two**
      modifications under `url-redirect-...` — Desktop Chrome and Desktop Chrome Dark; the Pixel 7 and
      Pixel 7 Dark baselines there did not rewrite. Ten changed files, not twelve. Root cause, confirmed
      directly rather than assumed: `url-redirect-...`'s Pixel 7 full-page capture is ~11.5k px tall
      (mobile text reflow), against only three (not five) smaller diagrams, so the diagram-region pixel
      change stays under `maxDiffPixelRatio: 0.01` even though the fix is genuinely applied there —
      verified with a live computed-style probe (`filter: invert(0.93) hue-rotate(180deg)` in dark,
      `none` in light, on all three `url-redirect-...` diagrams under Pixel 7) and a rendered close-up
      (arrows, labels and the "AWS Cloud" outline go from invisible to clearly legible). Playwright's
      default `--update-snapshots=changed` mode (what `test:e2e:update` uses) only rewrites a baseline
      once the diff exceeds that ratio, so those two Pixel 7 baselines stay stale — still holding the
      pre-fix pixels — though they still pass, and a regression there is still caught by the
      `theme.spec.ts` computed-style assertion (task 4.2), not only by the screenshot. The eight
      control-post baselines (`hosting-a-static-website-on-amazon-s3`,
      `the-renaissance-of-written-coding-conventions`) are confirmed **byte-identical** — `git status`
      shows nothing under either directory.
      **Superseded.** The author then deleted all fifty-two baselines and regenerated them from a clean
      slate. Forty came back byte-identical, which is what makes the rest trustworthy: the rendering is
      reproducible, so a file that moved held stale bytes rather than noise. That run rewrote the two
      `url-redirect-...` Pixel 7 baselines described above — they are no longer stale — and refreshed ten
      older light-theme captures on pages this change does not touch, which the author reviewed and
      accepted. No baseline was lost: fifty-two in `HEAD`, fifty-two on disk, nothing deleted or added.
      The exemption still holds — the two control posts' dark captures never moved, and their diagrams
      render un-inverted.
- [x] 6.2 Review all twelve images individually before staging. Verify in the dark capture of each
      post that every diagram's strokes and labels read against `--bg: #17150f`, and in the light
      capture that no diagram shows a cool-white panel against `--bg: #faf7f2` any more. Verify
      specifically how the two `-geo` diagrams came out — the inverted world map and the 47×47 marker
      placed five times are the judgement call flagged in design.md. Verify no figure is half-loaded:
      each post's dark capture must keep the same pixel height as its light counterpart, since a
      half-loaded image changes the page height. The four `beyond-tabs-...` images are **new**, so
      there is no pre-fix baseline to diff them against; review those five figures against the
      pre-export files instead, which are recoverable with
      `git show e45d91a:src/content/blog/beyond-tabs-…/<name>.svg`, and confirm each drawing is the
      same picture minus its white ground.
      **Done.** Reviewed every changed/added baseline plus close-up element captures (native
      resolution, not the downscaled full-page thumbnail) in both themes. Light: the white panel is
      gone from every diagram; confirmed directly against the five pre-export `beyond-tabs-...` SVGs at
      `e45d91a` — each of those carried the white `<rect>`, none of the current files do, and each
      rendered figure is the same drawing minus its white ground. Dark: every diagram's strokes, arrows
      and labels read clearly against `--bg: #17150f` (checked all eleven diagrams, including the three
      non-`-geo` `advanced-...` figures). The two `-geo` diagrams specifically: land silhouettes invert
      to light grey against a near-black ocean, the S3-bucket icon keeps a green tint, and the five
      `Edge location` marker instances keep a purple tint — agree this reads well, confirmed on both
      Desktop Chrome and Pixel 7. Heights confirmed identical between light and dark for every post (no
      half-loaded figure): `beyond-tabs-...` 19475px (Desktop Chrome) / 29679px (Pixel 7),
      `advanced-...` 25777px (Desktop Chrome) / 25517px (Pixel 7), `url-redirect-...` 11546px (Desktop
      Chrome, the only project with a rewritten baseline there).

## 7. Verify

- [x] Visual + a11y snapshots pass in **both themes** for every touched view (testing-visual-regression skill)
      — ran `npm run test:e2e:update` then `npm run test:e2e:check` in the devcontainer (Linux,
      matching CI's `ubuntu-24.04`); 286 passed / 2 skipped (pre-existing, unrelated: the mobile-nav
      "Home" link test skips on `Pixel 7*` by design) across all four projects — dark coverage **is**
      wired (`Desktop Chrome Dark` / `Pixel 7 Dark` in `playwright.config.ts`), so this covers both
      themes, not light-only. Axe reported zero violations on `advanced-...`, `beyond-tabs-...` and
      `url-redirect-...` in all four projects. See 6.1: two of `url-redirect-...`'s baselines (Pixel 7,
      Pixel 7 Dark) did not rewrite on the first pass, verified not to be a defect in the fix itself,
      and the author's later clean regeneration of all fifty-two resolved them.
- [x] All preflight gate checks pass — the set in `docs/development/checks.md` (running-preflight-checks skill)
      — not re-run: no `src/` file or config was touched during this Verify pass (only binary test
      baselines under `tests/__screenshots__/` and this file), so the clean run reported at the start of
      this task stands.
- [x] Manual preview: no theme flash, interactions work, console clean, responsive at 375px —
      **reviewed and accepted by the author.** Assisted beforehand via the Playwright MCP against a host
      build/preview (`npm run build` + `BROKENROBOT_PORT=8080 npm run serve`). Findings on
      all three touched posts (`advanced-...`, `beyond-tabs-...`, `url-redirect-...`): console clean on
      load, on theme toggle, and on in-app navigation (only the four pre-existing, page-load
      `Permissions-Policy: Unrecognized feature` warnings, unrelated to this change and present
      site-wide); theme choice persisted correctly across a reload (`data-theme` already correct before
      the check ran, consistent with the pre-paint init script — no separate flash-detection capture
      taken); the theme toggle interaction flips `data-theme` and the diagrams' `filter` live, confirmed
      with a screenshot on `beyond-tabs-...`; the two data-URI `-geo` diagrams and the two
      `url-redirect-...` images referenced from the other post's folder all render with no CSP block, in
      both themes; at 375px, `document.documentElement.scrollWidth === clientWidth` on all three posts
      (no horizontal overflow) and diagrams scale down cleanly. Screenshots saved under
      `.playwright-mcp/` (gitignored).
