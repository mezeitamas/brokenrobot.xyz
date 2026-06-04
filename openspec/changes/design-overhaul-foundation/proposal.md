## Why

The site is a deliberately minimal MVP with no distinct identity. A high-fidelity redesign was explored in Claude Design and handed off to this repo (`design-handoff/`). This change lands the **foundation** of that redesign — the design system, fonts, theming, mascot, and site chrome — so the page redesigns that follow have a stable base. It also locks the palette, type, and mascot that `docs/brand.md` currently leaves "open".

## What Changes

- Introduce **semantic design tokens** as CSS custom properties in `src/styles/base.css`, defined for both light and dark themes on `html[data-theme]` (background/surface/text/muted/border, amber accent + per-theme accent-ink, code colors, shadows, font-family vars). Wire Tailwind to read these tokens where practical.
- Replace **Poppins** with a self-hosted three-typeface system: **Space Grotesk** (display/UI), **Newsreader** (article prose), **Space Mono** (mono/labels). **BREAKING** for visual snapshots — Poppins is removed.
- Add a **light/dark theme toggle**: a CSP-safe inline script that sets `data-theme` before paint (no flash), persists the reader's choice, and honors `prefers-color-scheme`; plus a header toggle button. Migrate `BaseLayout` off the current `class="scheme-light"`.
- Add a **Broken Robot mascot** as a reusable Astro SVG component (poses: head, neutral, sit-404), theme-aware, with animations gated by `prefers-reduced-motion`.
- Redesign the **header and footer** (`src/components/layout/`) to the new look: logo (mascot head + wordmark + mono URL), nav, theme toggle; footer with mascot, blurb, link columns.
- Update **`docs/brand.md`** to record the now-locked palette, type pairing, and mascot (no longer "stays open").

Out of scope (follow-up change): page redesigns (home/blog/article/about/404) and hero imagery.

## Capabilities

### New Capabilities
- `theming`: Semantic design tokens for light + dark, and the theme-toggle behavior (no-flash inline init, persistence, `prefers-color-scheme`, WCAG AA contrast in both themes).
- `typography`: The self-hosted typeface system (Space Grotesk / Newsreader / Space Mono), preloading, and `font-display: swap`.
- `brand-mascot`: The reusable broken-robot SVG component — poses, theme-awareness, and reduced-motion behavior.
- `site-chrome`: The redesigned header (logo, nav, theme toggle) and footer (mascot, blurb, links, sign-off).

### Modified Capabilities
<!-- None — no existing specs; all capabilities are new. -->

## Impact

- **Code:** `src/styles/base.css` (tokens, font-face, theme); `src/layouts/BaseLayout.astro` (theme init script, `data-theme`, preload, prose mapping); `src/components/layout/Header.astro` + `Footer.astro`; new `src/components/mascot/`; `src/components/fonts/PreloadFonts.astro`; `tailwind.config.cjs` (token wiring).
- **Dependencies:** add `@fontsource/space-grotesk`, `@fontsource/newsreader`, `@fontsource/space-mono`; remove `@fontsource/poppins`.
- **Tests:** Playwright visual snapshots change (both themes need coverage); axe checks must stay green.
- **Constraints preserved:** strict CSP unchanged (self-hosted fonts `font-src 'self'`, no inline `on*` handlers), static site, ad-free/no-tracking, responsive, stable `/blog/<slug>/` URLs and RSS.
- **Docs:** `docs/brand.md` updated to reflect locked decisions.
