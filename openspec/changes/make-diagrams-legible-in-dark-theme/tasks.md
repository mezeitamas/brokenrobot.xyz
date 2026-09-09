## 1. Watch the post that nothing watches

- [ ] 1.1 Measure whether `beyond-tabs-and-spaces-finding-a-balance-in-coding-conventions` can be
      captured at all, before anything depends on its baseline. Temporarily restore the screenshot
      test commented out in its spec file and run it in all four projects with
      `npm run test:e2e:update`, then read the generated PNG dimensions. Verify no capture exceeds
      32767 px on either axis — the limit the disabling comment blames, on a device the config no
      longer defines. Record the four heights in this task. If any capture exceeds the limit, stop
      here and take the per-figure fallback in design.md — **Risks / Trade-offs** instead of deleting
      the test again.
- [ ] 1.2 Restore the screenshot test properly: uncomment it, delete the stale comment about iPhone
      12 Pro, and add the `settleImages(page)` call and its import that every other post spec's
      screenshot test has — the five diagrams are `loading="lazy"` and a full-page capture does not
      reliably scroll them in. Verify the file matches the shape of
      `tests/pages/blog-posts/url-redirect-with-amazon-cloudfront-and-amazon-route-53.spec.ts`, and
      that `npm run lint:check`, `npm run type:check` and `npm run format:check` pass.
- [ ] 1.3 Commit the four baselines this produces — two light, two dark — as the post renders
      **today**, white slabs included. Verify `git status` shows exactly four additions under
      `tests/__screenshots__/pages/blog-posts/beyond-tabs-.../` and no modification to any other
      baseline. These four are regenerated in group 6; their purpose is that the group 6 diff shows
      exactly what the re-export changed on those five figures, rather than the figures changing with
      nothing to compare against.

## 2. Prove the export and the treatment on one diagram

- [ ] 2.1 Add the read-time treatment to `src/styles/base.css`, beside the existing `.prose` rules:
      `html[data-theme='dark'] .prose img[src$='.svg'] { filter: invert(93%) hue-rotate(180deg); }`.
      Carry a comment saying where the constant comes from (`THEME_FILTER` in the Excalidraw bundle,
      the same filter its "Dark mode" export applies) and that the selector treats an SVG in article
      prose as line art — artwork that must keep its own colours is supplied as raster. Verify
      `npm run format:check` and `npm run tokens:check` pass: this is a filter, not a colour token, so
      `tokens.generated.css`, `DESIGN.md` and `DESIGN.dark.md` must all be untouched.
- [ ] 2.2 **Author's manual step.** Ask the author to export
      `advanced-static-website-hosting-with-amazon-s3-and-cloudfront/baseline-architecture-s3-geo.excalidraw`
      to SVG from Excalidraw, with Background **off**, Dark mode **off**, Embed scene **off**, Scale
      3, default padding, saved beside the source as `baseline-architecture-s3-geo.svg`. Do not
      generate this file by any other means. Verify the delivered file: it contains no background
      `<rect …fill="#ffffff">` as its first element, its `width` is 3× its `viewBox` width (the scale
      the five existing SVG exports used — `viewBox` 1166.48 against `width` 3499.43), and it embeds
      the drawing's world-map SVG as a data URI.
- [ ] 2.3 Gate on the riskiest unknown: point the post's MDX at the new SVG, run `npm run build` then
      `npm run serve`, and load the page in a browser. Verify the embedded world-map data URI actually
      renders inside the `<img>`-loaded SVG under the site's real two-layer CSP (`img-src 'self'`,
      `style-src-attr 'none'`) — check the browser console for a blocked resource as well as looking
      at the picture. Verify in both themes that the map and the strokes read, and name what the
      inverted map looks like on `--bg: #17150f`. If the map does not render, stop and report: the
      remaining exports are not worth doing until this is settled.

## 3. Re-export and re-reference the remaining ten

- [ ] 3.1 **Author's manual step.** Ask the author to export the remaining ten diagrams to SVG with
      the same dialog settings as 2.2, each saved beside its `.excalidraw` source: four more in
      `advanced-static-website-hosting-with-amazon-s3-and-cloudfront`, one in
      `url-redirect-with-amazon-cloudfront-and-amazon-route-53`, and the five in
      `beyond-tabs-and-spaces-finding-a-balance-in-coding-conventions`, which overwrite the existing
      SVGs in place. Verify all ten the way 2.2 verified the first: no background rectangle, scale 3,
      and — for the five overwrites — that the `<rect … fill="#ffffff">` the old file opened with is
      gone.
- [ ] 3.2 Record each new SVG's size against what it replaces, in this task. Verify the total is below
      the 4.5 MB of PNG source it removes, and report any single SVG that is larger than the PNG it
      replaces rather than letting it pass unremarked — the two `-geo` exports each embed a ~148 KB
      map, so they are the ones to look at.
- [ ] 3.3 Convert the eight diagram references in
      `advanced-static-website-hosting-with-amazon-s3-and-cloudfront/index.mdx` and
      `url-redirect-with-amazon-cloudfront-and-amazon-route-53/index.mdx` from `<BlogPostPicture>` to
      Markdown images, carrying each one's `alt` text across verbatim, and delete the image imports
      and the now-unused `BlogPostPicture` import from both files. Two of `url-redirect`'s references
      point into the other post's folder and become `../advanced-…/name.svg`. Change no prose. Verify
      `npm run build` succeeds, `npm run lint:check` and `npm run format:check` pass, and that
      `grep -rn "BlogPostPicture" src/content/blog` now reports only
      `hosting-a-static-website-on-amazon-s3` and `the-renaissance-of-written-coding-conventions` —
      the two exempted rasters, which keep the component and keep `mdxToMarkdown`'s component branch
      exercised.
- [ ] 3.4 Delete the six superseded PNGs: `baseline-architecture-s3.png`,
      `baseline-architecture-s3-geo.png`, `target-architecture-s3-cdn.png`,
      `target-architecture-s3-cdn-geo.png`, `target-architecture-s3-cdn-cloudfront-function.png` in
      `advanced-...`, and `target-architecture-s3-cdn-cloudfront-function.png` in `url-redirect-...`.
      Verify `grep -rn` over `src/`, `tests/`, `docs/`, `scripts/` and `public/` finds no remaining
      reference to any of the six filenames, and that `npm run build` still succeeds afterwards. Keep
      every `.excalidraw` source: it is what makes the export repeatable.
- [ ] 3.5 Verify the built output and the Markdown twins. `npm run build` then check `dist/`: each of
      the eleven diagrams is a bare `<img src="/_astro/<name>.<hash>.svg" …>` with no `<picture>`
      wrapper and no `srcset`, the two exempted rasters still build to a `<picture>`, and no `<img>`
      with an `.svg` source appears anywhere outside the eleven — the selector in 2.1 depends on that
      last point. Verify `npm run twins:check` passes, and read the three affected posts' twins: the
      image URLs end in `.svg`, resolve to an emitted asset, and keep their alternative text.

## 4. Name the rule in the suite

- [ ] 4.1 Add a test to `tests/theme.spec.ts` that asserts the treatment rather than its pixels: load
      the `beyond-tabs-...` post, read `html[data-theme]` as that file's existing tests do, and assert
      that every `img[src$=".svg"]` has a computed `filter` other than `none` when the theme is dark
      and exactly `none` when it is light. In the same test assert the hero photograph's computed
      `filter` is `none` in both — that is the control proving the rule did not reach the `.prose`
      image it must not touch. Verify it passes in all four projects, and that it fails for the right
      reason: delete the rule from `base.css` temporarily and confirm only this test fails, then
      restore it. Verify `npm run lint:check`, `npm run type:check` and `npm run format:check` pass.

## 5. Record the intent and close the gap

- [ ] 5.1 Record the now-explicit intent for content images in `docs/architecture.md`. The
      **Theming architecture** section's "Both themes are first-class" bullet is where it belongs:
      diagrams in article prose are exported theme-neutral from their committed `.excalidraw` source
      and inverted in dark by a rule in `base.css`; an SVG in prose is treated as line art, so artwork
      that must keep its own colours is supplied as raster. Note in **Content model** that a post's
      diagrams are referenced as Markdown images and that `<BlogPostPicture>` is for raster images
      that need responsive variants. Verify both additions describe what the code now does, that no
      check is named or counted (`docs/development/checks.md` is the only list of checks), and that
      `npm run format:check` passes.
- [ ] 5.2 Delete the `docs/known-gaps.md` entry "Architecture diagrams are near-unreadable in the dark
      theme". Both of that page's exits are now reached: the intent graduated into
      `docs/architecture.md` and the specs in 5.1, and the gap is closed. Do not carry the entry's
      wording forward — its **Reality** paragraph is wrong about the SVGs, calling them transparent
      when each carried a white background rectangle, and wrong about the count, naming seven PNGs
      when six have an `.excalidraw` source and the seventh is the exempted AWS-icon image. Verify no
      other entry is touched and that nothing else in `docs/` still refers to the deleted entry.

## 6. Regenerate and review the baselines

- [ ] 6.1 Regenerate with `npm run test:e2e:update` in the devcontainer, so rendering matches the
      container CI and the committed baselines both use. Verify `git status` shows modifications only
      under `advanced-static-website-hosting-with-amazon-s3-and-cloudfront`,
      `url-redirect-with-amazon-cloudfront-and-amazon-route-53` and `beyond-tabs-...` — four images
      each, light and dark — and that the four baselines of
      `hosting-a-static-website-on-amazon-s3` and the four of
      `the-renaissance-of-written-coding-conventions` come back **byte-identical**. Those eight are
      the control: they hold only exempted images, so any change there means the selector caught
      something it must not.
- [ ] 6.2 Review all twelve regenerated images individually before staging. Verify in the dark pair of
      each post that every diagram's strokes and labels read against `--bg: #17150f`, and in the light
      pair that no diagram shows a cool-white panel against `--bg: #faf7f2` any more. Verify
      specifically how the two `-geo` diagrams came out — the inverted world map and the 47×47 marker
      placed five times are the judgement call flagged in design.md — and that no figure is
      half-loaded: each post's dark capture must keep the same pixel height as its light counterpart,
      since a half-loaded image changes the page height.

## 7. Verify

- [ ] Visual + a11y snapshots pass in **both themes** for every touched view (testing-visual-regression skill)
- [ ] All preflight gate checks pass — the set in `docs/development/checks.md` (running-preflight-checks skill)
- [ ] Manual preview: no theme flash, interactions work, console clean, responsive at 375px
