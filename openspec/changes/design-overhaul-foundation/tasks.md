## 1. Fonts (self-hosted)

- [ ] 1.1 Add `@fontsource/space-grotesk`, `@fontsource/newsreader`, `@fontsource/space-mono`; remove `@fontsource/poppins` (exact-pinned, per `.npmrc`)
- [ ] 1.2 Copy required `.woff2` weights into `public/assets/fonts/` (Space Grotesk 400/500/600/700; Newsreader 400/500/600 + 400 italic; Space Mono 400/700 + 400 italic); remove the Poppins font files
- [ ] 1.3 Replace the Poppins `@font-face` block in `src/styles/base.css` with `@font-face` declarations for the three families (all `font-display: swap`)
- [ ] 1.4 Update `src/components/fonts/PreloadFonts.astro` to preload the primary new weights (drop Poppins preloads)

## 2. Design tokens & theming CSS

- [ ] 2.1 In `src/styles/base.css @layer base`, define light tokens on `:root` and dark overrides on `html[data-theme="dark"]` (`--bg`, `--surface`, `--surface-2`, `--text`, `--muted`, `--border`, `--accent` `#f59e0b`, `--accent-ink` light `#b45309`/dark `#fbbf24`, `--code-bg/-text/-line`, shadows, `--accent-soft`, `--tape`, `--ff-display/-prose/-mono`)
- [ ] 2.2 Set base `body` background/text/font from tokens; add a smooth color transition
- [ ] 2.3 Expose the common subset of tokens to Tailwind v4 via `@theme inline` (e.g. `--color-bg: var(--bg)`) so utilities resolve to tokens
- [ ] 2.4 Map Tailwind Typography `--tw-prose-*` variables to tokens and set article prose to `--ff-prose`; verify `prose` is legible in both themes

## 3. Theme init & toggle (CSP-safe)

- [ ] 3.1 In `BaseLayout.astro`, replace `class="scheme-light"` with a token-driven default and add an `is:inline` `<head>` script that resolves theme (localStorage → `prefers-color-scheme` → light) and sets `document.documentElement.dataset.theme` before paint
- [ ] 3.2 Add a dark `theme-color` meta variant alongside the existing light one
- [ ] 3.3 Confirm no inline `on*` handlers are introduced and the existing CSP is unchanged (inline script relies on the already-allowed `script-src 'unsafe-inline'`)

## 4. Mascot component

- [ ] 4.1 Create `src/components/mascot/Mascot.astro` (inline SVG) translating `design-handoff/project/mascot.jsx`, props `pose` (`head`|`neutral`|`sit404`), `size`, `animate`, `class`; fills via `currentColor`/tokens
- [ ] 4.2 Add blink/wobble/antenna animations in a scoped `<style>`, disabled under `@media (prefers-reduced-motion: reduce)`
- [ ] 4.3 Provide accessible labelling (aria-label when meaningful; `aria-hidden` when decorative); verify head + sit404 render in both themes and at small sizes

## 5. Header & Footer

- [ ] 5.1 Redesign `src/components/layout/Header.astro`: logo (Mascot `head` + "BrokenRobot" wordmark + mono `brokenrobot.xyz` line), nav with active state, sticky/blurred bar, theme-toggle `<button>` (sun/moon icon)
- [ ] 5.2 Add the toggle's `is:inline` script: `addEventListener('click', …)` flips `dataset.theme`, persists to `localStorage`, updates icon + `aria-label`/`aria-pressed`
- [ ] 5.3 Redesign `src/components/layout/Footer.astro`: Mascot + blurb, link columns (writing/about, social + RSS using existing `InternalLink`/`ExternalLink`), witty sign-off; keep `SITE_METADATA` social links and the RSS link
- [ ] 5.4 Ensure header and footer are responsive (no overflow at phone width; footer columns stack)

## 6. Documentation

- [ ] 6.1 Update `docs/brand.md`: replace the "stays open" palette/type/mascot wording with the locked decisions (amber `#f59e0b` + token roles for light/dark; Space Grotesk / Newsreader / Space Mono; the broken-robot mascot)

## 7. Verify

- [ ] 7.1 `npm run type:check`, `npm run lint:check`, `npm run format:check` all pass
- [ ] 7.2 `npm run build` succeeds; confirm no third-party font requests and no CSP violations
- [ ] 7.3 Run axe/Playwright; confirm WCAG AA in both themes; update visual snapshots and add dark-theme coverage (`npm run test:e2e:update` then `npm run test:e2e:check`)
- [ ] 7.4 Manually verify: no theme flash on load (light & dark), toggle persists across reloads, mascot + header + footer read well in both themes on desktop and mobile
