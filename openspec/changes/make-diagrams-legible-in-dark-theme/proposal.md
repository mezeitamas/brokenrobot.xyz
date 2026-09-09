## Why

The site's content diagrams do not follow the theme. Eleven Excalidraw drawings across four posts
were exported with the "Background" checkbox in two different states, and each state fails one
theme:

- **Transparent, dark ink — invisible on dark.** Six PNGs in
  `advanced-static-website-hosting-with-amazon-s3-and-cloudfront` and
  `url-redirect-with-amazon-cloudfront-and-amazon-route-53`. Four are ~93% transparent with `#1e1e1e`
  ink; against `--bg: #17150f` that is a contrast ratio of **1.09:1**. The two `-geo` images are ~72%
  transparent over an embedded light-grey world map. Measured on the committed dark baselines, the
  affected figure bands keep only 1.5–3.5% of their light-theme visible-pixel count.
- **Opaque light ground — a white slab on dark, and a cool-white patch on light.** The five SVGs in
  `beyond-tabs-and-spaces-finding-a-balance-in-coding-conventions`, each carrying
  `<rect x="0" y="0" ... fill="#ffffff">` as its first element. The light theme's page ground is
  `#faf7f2`, so the slab is visible in _both_ themes.

Nothing catches this. axe cannot: the text is inside an image. And the one post holding all five
SVGs has no visual-regression baseline at all — nine of the ten posts have one, and the missing one
is that post.

All eleven have a `.excalidraw` source committed beside the export, and all eleven sources record
`viewBackgroundColor: "#ffffff"`. The exports diverge only because of the export dialog, not because
of the drawings.

`docs/known-gaps.md` records this as "Architecture diagrams are near-unreadable in the dark theme"
and leaves it undecided. The decision is now made, so both of that page's exits are reached: the
intent graduates into `docs/architecture.md` and the specs, and the gap closes.

## What Changes

- **Re-export all eleven diagrams from their `.excalidraw` sources to SVG**, by hand, with the
  export dialog set to Background **off**, Dark mode **off**, Embed scene **off**, Scale 3, default
  padding. That yields one theme-neutral asset per diagram: dark ink on a transparent ground, no
  baked theme, no light/dark pair. This is a manual authoring step the author performs in Excalidraw;
  no build step and no script produces these files.
- **Apply the dark treatment at read time**, in CSS, under `html[data-theme='dark']`, to diagram
  images only: `filter: invert(93%) hue-rotate(180deg)`. That constant is `THEME_FILTER` from the
  Excalidraw bundle — the same filter its own "Dark mode" export checkbox applies — so the rendered
  result is what a dark export would have produced, except that it follows the reader's theme toggle,
  which a baked file cannot.
- **Move the six PNG diagrams to SVG** and reference all eleven as plain Markdown images. Those six
  are rendered through `<BlogPostPicture>` today, and an SVG has no raster variants for a responsive
  `<picture>` to offer — the five existing SVG diagrams already build to a bare `<img>` with no
  `srcset`. `<BlogPostPicture>` stays in use for the two raster images below.
- **Exempt two images**, which keep their own colours in both themes:
  `hosting-a-static-website-on-amazon-s3/target-architecture.png` (not an Excalidraw drawing, no
  source beside it, official-AWS-icon style — its solid brand tiles glare under the filter) and
  `the-renaissance-of-written-coding-conventions/xkcd-code_quality.png` (a third-party comic). Both
  are opaque light-ground rasters today and stay exactly as they are.
- **Give the unwatched post a visual baseline before anything is re-exported**, by re-enabling the
  screenshot test commented out in
  `tests/pages/blog-posts/beyond-tabs-and-spaces-finding-a-balance-in-coding-conventions.spec.ts`, so
  the five SVGs are not changed with nothing watching them.
- **Assert the treatment, not only its pixels**: the suite reads the computed `filter` on the diagram
  images under the dark projects, so the rule's removal fails a named test rather than only a
  snapshot diff.
- **Record the intent and close the gap**: `docs/architecture.md` gains what is expected of a content
  image in both themes, and the `docs/known-gaps.md` entry is deleted.

## Non-Goals

- **Not** shipping a second, dark variant of any diagram. One asset per diagram is the point; a pair
  doubles the authoring step and still cannot follow the toggle.
- **Not** inlining the SVG markup into the page. Both CSP layers set `style-src-attr 'none'`, and
  every Excalidraw SVG carries `style="white-space: pre;"` on its text nodes, so inlined markup would
  be stripped or blocked. The diagrams stay external files loaded through `<img>`, which the policy
  does not reach into.
- **Not** using `prefers-color-scheme` as the switch, in a `<picture>` `media` attribute or inside
  the SVG. The theme is `data-theme` on `<html>`, and the toggle can disagree with the operating
  system; an OS-driven asset would contradict the reader's own choice.
- **Not** adding a light plate, panel, or card behind the exempted images. They are opaque and
  legible in both themes as they stand, and a plate would be a new primitive with one user.
- **Not** adding a new automated check or an entry to `docs/development/checks.md`. The new baseline
  and the computed-style assertion ride existing checks.
- **Not** adding a design token. A filter is not a colour role; `DESIGN.md`, `DESIGN.dark.md`, and
  `src/styles/tokens.generated.css` are untouched.
- **Not** editing any article's prose. Only the image references inside the MDX change.
- **Not** re-drawing any diagram, changing its content, or restyling it.

## Capabilities

### New Capabilities

None. `theming` already owns both-theme legibility, and no capability under `openspec/specs/`
describes article body rendering, so introducing one for two requirements would add a spec home
nothing else uses.

### Modified Capabilities

- `theming`: two requirements added — content diagrams follow the active theme and stay legible in
  both, and a diagram is published as a single theme-neutral asset. The capability's existing
  requirements are unchanged; nothing about tokens, theme selection, pre-paint application, or the
  toggle moves.

`agent-content` needs no delta. Its requirement that images reach the Markdown twin as resolvable
Markdown images with their alternative text keeps holding; only the extension in the emitted URL
changes.

## Impact

**Content assets** — 11 diagrams re-exported to SVG. Six PNGs are deleted:
`baseline-architecture-s3.png`, `baseline-architecture-s3-geo.png`, `target-architecture-s3-cdn.png`,
`target-architecture-s3-cdn-geo.png` and `target-architecture-s3-cdn-cloudfront-function.png` in
`advanced-static-website-hosting-with-amazon-s3-and-cloudfront`, and
`target-architecture-s3-cdn-cloudfront-function.png` in
`url-redirect-with-amazon-cloudfront-and-amazon-route-53` — 4.5 MB of source, plus the avif/webp
variant matrix the build generated from them. Five SVGs are overwritten in place. The two `-geo`
exports will each embed the drawing's ~148 KB world-map SVG as a data URI, so they will not be small.

**Content sources** — three `index.mdx` files. `advanced-...` and `url-redirect-...` lose their
`BlogPostPicture` import and their five and three image imports, and their eight `<BlogPostPicture>`
elements become Markdown images; `url-redirect-...` keeps referring to two of the diagrams across the
post-folder boundary. `beyond-tabs-...` changes only if a reference needs adjusting — its five
Markdown images already name the files being overwritten.

**Styles** — one rule in `src/styles/base.css`, beside the existing `.prose` block.

**Tests** — the commented-out screenshot test in the `beyond-tabs-...` spec is restored, adding four
baselines. The dark baselines for `advanced-...` and `url-redirect-...` change, and their light
baselines change too, because the white-ground SVGs and the PNG-to-SVG swap alter what is drawn in
both themes. `hosting-a-static-website-on-amazon-s3` and `the-renaissance-of-written-coding-conventions`
hold only exempted images, so their four baselines each must come back byte-identical — that is the
check that the exemption worked.

**Markdown twins** — `src/pages/blog/[...slug].md.ts` already globs `svg` and already resolves
Markdown images, so the twins keep building; the URLs they carry change extension. Removing eight
`<BlogPostPicture>` uses leaves the component used by two posts, so `mdxToMarkdown`'s component path
stays exercised. `npm run twins:check` audits presence, not content, and is unaffected.

**Docs** — `docs/architecture.md` records the content-image intent; `docs/known-gaps.md` loses the
diagram entry. `docs/development/checks.md` is untouched: no check is added.

**Untouched** — no dependency, no component, no Astro or Playwright configuration, no CSP directive,
no token.
