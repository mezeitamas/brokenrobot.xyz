## Context

See proposal.md — **Why** for the defect. What shapes the approach is the surrounding machinery,
all of it verified against the repository and against the `dist/` built from `main` (`e45d91a`),
before this change's first commit:

- **The theme is `data-theme` on `<html>`**, resolved by the pre-paint script from
  localStorage → `prefers-color-scheme` → light, and flippable by the toggle. The reader's choice can
  therefore disagree with the operating system. Any switch keyed on `prefers-color-scheme` — a
  `<picture><source media>`, or a `@media` block inside an SVG — would contradict the toggle.
- **`.prose` wraps the whole page.** `BaseLayout` renders `<main class="prose ...">`, so a bare
  `.prose img` rule would also reach the hero photograph, which is a plain `<img>` in that subtree.
- **The five SVG diagrams already build to a bare `<img>`.** In the current `dist/`, each is
  `<img src="/_astro/<name>.<hash>.svg" alt="…" loading="lazy" decoding="async" width height>` —
  no `srcset`, no class, no wrapper. The six PNG diagrams instead build to a `<picture>` with an
  avif/webp `srcset`, because `<BlogPostPicture>` renders Astro's `<Picture>`.
- **Those five `<img>` elements are the only `<img>` in the whole built site whose `src` ends in
  `.svg`.** Checked across every HTML file in `dist/`. Inline `<svg>` elements (icons, the mascot)
  exist, and an attribute selector on `img` cannot match them.
- **The Markdown-twin transform knows exactly one component.** `src/utils/mdxToMarkdown.ts` sets
  `PICTURE_COMPONENT = 'BlogPostPicture'` and throws `unhandled MDX syntax` on any other MDX element,
  which fails the build. It already resolves plain Markdown images through the same lookup.
- **Both CSP layers set `style-src-attr 'none'`**, and every Excalidraw SVG carries
  `style="white-space: pre;"` on its text nodes.
- **The `-geo` drawings embed images.** `baseline-architecture-s3-geo.excalidraw` embeds one file and
  `target-architecture-s3-cdn-geo.excalidraw` embeds two, all `image/svg+xml`: a ~148 KB world map,
  and a 1 KB 47×47 marker placed five times. An SVG export inlines those as data URIs inside the
  exported SVG.
- **The post holding the five SVGs has no screenshot test.** The one in its spec file is commented
  out, blaming a capture limit — "Cannot take screenshot larger than 32767 pixels on any dimension" —
  on iPhone 12 Pro, a device `playwright.config.ts` no longer defines.

One thing has moved since: the author exported all eleven diagrams by hand and committed them as
`bab8318`, ahead of the task list. So the assets are already theme-neutral, the six PNGs are gone, and
`npm run build` fails on the MDX imports that still name them. Every decision below was taken before
that commit and none is changed by it; the sequence in tasks.md is.

## Goals / Non-Goals

**Goals:**

- One authoring step per diagram, repeatable from the committed `.excalidraw` source.
- A treatment that is a property of the page's CSS, so it follows the toggle with no JavaScript.
- A handle narrow enough that the hero photograph and the two exempted rasters cannot be caught by
  it.
- Coverage on the five SVGs that had none, and a plain record of the fact that it arrives after they
  were changed rather than before.

**Non-Goals:**

- Any change to the drawings themselves. The exports are a re-run of an existing step with one
  checkbox corrected.
- Any general theory of content images beyond diagrams and the two exemptions named in the proposal.

## Decisions

### Treat at read time with Excalidraw's own filter, rather than exporting a dark variant

`filter: invert(93%) hue-rotate(180deg)` is `THEME_FILTER`, taken verbatim from the Excalidraw
bundle; its "Dark mode" export checkbox applies exactly this filter to the same drawing. So the
rendered pixels are what a dark export would have produced, and the difference is only _when_ the
filter is applied. Applying it in CSS follows the toggle; a baked file cannot, because the file is
chosen at build time and the theme is chosen by the reader.

Applied to a transparent asset, `invert()` flips the ink and leaves alpha alone, so the transparent
ground stays transparent and the page's `--bg` shows through. This is why the re-export has to come
with the treatment rather than after it: an opaque white ground under the filter becomes an opaque
near-black slab, which trades one defect for another.

_Alternative — a dark variant per diagram, selected by `prefers-color-scheme`._ Rejected: 22 files
instead of 11, and it answers the operating system rather than the reader.

_Alternative — hand-tuned per-diagram colours._ Rejected: eleven drawings, no source of truth, and
the next diagram inherits nothing.

### The handle is `.prose img[src$='.svg']` under `html[data-theme='dark']`

One rule in `src/styles/base.css`, beside the `.prose` block:

```css
html[data-theme='dark'] .prose img[src$='.svg'] {
    filter: invert(93%) hue-rotate(180deg);
}
```

Verified precise today: the only `<img>` in the built site with an `.svg` source are the five
diagrams, and after this change the other six join them. The hero photographs are `.jpg`, and both
exempted images are `.png`, so the exemption needs no rule of its own — which is why none is added.

_Alternative — a Sätteri hast plugin adding `class="diagram"`._ The plugin slot exists
(`codeBlockFocusPlugin` is one), and the class would be an explicit marker rather than an inferred
one. Rejected for this change: it is a build-time mechanism, a plugin, and a class, in exchange for
naming what the selector already picks out exactly. Reconsider when the first prose SVG that is _not_
a diagram appears.

_Alternative — a `<Diagram>` component._ Rejected, and it would not merely be heavier: any MDX
element other than `<BlogPostPicture>` makes `mdxToMarkdown` throw and the build fail, so this option
also drags the Markdown-twin transform into a legibility change.

### All eleven diagrams become plain Markdown images

`<BlogPostPicture>` renders `<Picture formats={['avif','webp']} widths=…>`, which exists to generate
raster variants. An SVG has none to generate — the five SVG diagrams already prove it, building to a
bare `<img>`. Keeping the component on an SVG would leave a wrapper doing nothing.

Markdown images are the smaller option in the other direction too: `mdxToMarkdown` already resolves
them, so the twins keep working without the transform being taught anything. `<BlogPostPicture>`
remains the handle for the two exempted rasters, so neither the component nor its branch in the
transform becomes dead.

### The exemptions get no rule

`target-architecture.png` and `xkcd-code_quality.png` are opaque, light-ground rasters. They are
legible on the dark ground today, as a light card on a dark page, and the selector above cannot
reach them. Adding a plate or panel would introduce a primitive with two users and no other caller,
against Simplicity First. The proposal records the exemption; the spec states it as behaviour
("photographs and third-party artwork keep their authored colours"), not as a mechanism.

### The diagrams stay external files, never inlined

`style-src-attr 'none'` in both CSP layers versus `style="white-space: pre;"` on Excalidraw's text
nodes. Inlined markup would have that attribute stripped or blocked, and the labels would reflow. An
`<img>`-loaded SVG is a separate document that the page's `style-src-attr` does not reach into.

### Coverage: one new assertion, no new check script

Two things watch the fix. The visual baselines, once the missing post has them, catch a bad export
and a lost rule. And a computed-style assertion — reading `filter` on the diagram images and
expecting it to be something other than `none` under the dark projects, and `none` under the light
ones — names the rule, so deleting it fails a test with a readable message instead of only a pixel
diff.

Nothing else here is worth asserting. A static guard that scanned the committed SVGs for a
`fill="#ffffff"` background rectangle would catch a future mis-set export checkbox, but it is a new
script, a new npm script, a new CI step and a new `docs/development/checks.md` section, and the
beyond-tabs baseline this change adds already fails on exactly that regression. Raised and declined.
There is no non-flaky way to assert legibility _inside_ the image itself: axe cannot read it, and a
pixel-statistics threshold over a figure band is the kind of check that goes red for an unrelated
redraw.

## Risks / Trade-offs

- **The `-geo` exports embed a data-URI SVG, and it is not established that it renders inside an
  `<img>`-loaded SVG under this site's CSP.** Confirmed present in the committed exports: one data URI
  in `baseline-architecture-s3-geo.svg`, two in `target-architecture-s3-cdn-geo.svg`. If they do not
  render, the world map disappears and those two diagrams are worse than before → checked on a served
  build, in both themes, with the console read for a blocked resource. This was planned as a gate on
  doing the remaining exports; those are already committed, so it is now a gate on the change
  proceeding at all. If the map does not render, the change stops and reports rather than improvising:
  those two diagrams then need a decision, and reverting them to PNG is one option rather than the
  answer.
- **The 47×47 marker embedded five times in `target-architecture-s3-cdn-geo`, and the world map
  itself, are inverted along with everything else** — the filter applies to the whole image. That is
  the same treatment Excalidraw's own dark mode gives them, but it is a visual judgement, not a
  provable one → both `-geo` diagrams get a named look at the rendered dark result before the
  baselines are accepted.
- **The five `beyond-tabs-...` diagrams changed with nothing watching them.** The plan put that post's
  missing baseline first, precisely so the re-export would show up as a diff; the export landed before
  the plan reached that step, and reconstructing a pre-fix baseline now means building at `e45d91a`
  with the old MDX, PNGs and SVGs — a detour for evidence the files' own git history already carries.
  Accepted, not hidden: those five figures get their first baseline in the post-export state, and
  their re-export will never appear as a baseline diff → the substitute is a direct review against
  `git show e45d91a:…/<name>.svg`, and the eight byte-identical baselines of the two exempted-image
  posts remain the change's real control. This does not earn a `docs/known-gaps.md` entry: that page
  records intent the site does not meet, and this is a one-off sequencing accident with no "resolves
  by" to write.
- **`beyond-tabs-...` may be uncapturable.** Its screenshot test was disabled for exceeding 32767 px
  on a device no longer configured; the tallest capture in the suite today is 25497 px, on
  `advanced-...` under Pixel 7, so there is headroom but not proof → the height is measured when the
  test is restored, before the baselines are generated. If it exceeds the limit, capturing the five
  figures individually is the fallback. There is no longer an export to hold back if it does: the
  change would ship its diagram fix with that one post watched per figure instead of per page.
- **`url-redirect-...` references two diagrams from the other post's folder**, and after the change
  it does so with a `../…/name.svg` Markdown image rather than an ESM import → the build is the
  proof; the fallback is to copy those two SVGs into the post's own folder, which is cheap now that
  they are not megabyte PNGs.
- **The selector infers "SVG in prose means diagram".** A future prose SVG that is artwork would be
  inverted silently → the rule carries a comment saying so, and `docs/architecture.md` records the
  expectation for authors: supply raster for artwork that must keep its own colours.
- **Asset weight — measured, not predicted.** The eleven SVGs total 984 kB against 4.5 MB of PNG
  removed, plus the avif/webp matrix no longer generated from it. Nine are 12–65 kB; the two `-geo`
  files are 318 kB and 333 kB because of the embedded map, and both are still well under the PNGs they
  replace. No file needs reporting as a regression on this count.
- **Both light and dark baselines move for two posts.** A wrong export would be accepted by a blanket
  snapshot update → every regenerated image is reviewed individually, and the eight baselines of the
  two exempted-image posts — four each — must come back byte-identical, which is the control.
