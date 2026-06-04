## 1. Dependencies & Preact setup

- [x] 1.1 Add `@astrojs/preact` (+ `preact`) and `@fontsource/space-grotesk`, `@fontsource/newsreader`, `@fontsource/space-mono`; remove `@fontsource/poppins` (exact-pinned, per `.npmrc`)
- [x] 1.2 Enable Preact in `astro.config.ts` (`integrations: [preact(), mdx(), sitemap()]`); set the JSX options Preact needs in `tsconfig.json` (`jsx: "react-jsx"`, `jsxImportSource: "preact"`) without breaking the strict config
- [x] 1.3 Extend ESLint to cover `.tsx` (add a `*.tsx` override with the TS parser + jsx-a11y) and widen the `lint:check` glob to include `.tsx`, keeping the strict ruleset
- [x] 1.4 Copy required `.woff2` weights into `public/assets/fonts/` (Space Grotesk 400/500/600/700; Newsreader 400/500/600 + 400 italic; Space Mono 400/700 + 400 italic); remove the Poppins font files

## 2. Fonts CSS

- [x] 2.1 Replace the Poppins `@font-face` block in `src/styles/base.css` with `@font-face` declarations for the three families (all `font-display: swap`)
- [x] 2.2 Update `src/components/fonts/PreloadFonts.astro` to preload the primary new weights (drop Poppins preloads)

## 3. Design tokens & theming CSS

- [x] 3.1 In `src/styles/base.css @layer base`, define light tokens on `:root` and dark overrides on `html[data-theme="dark"]` (`--bg`, `--surface`, `--surface-2`, `--text`, `--muted`, `--border`, `--accent` `#f59e0b`, `--accent-ink` light `#b45309`/dark `#fbbf24`, `--code-bg/-text/-line`, shadows, `--accent-soft`, `--tape`, `--ff-display/-prose/-mono`)
- [x] 3.2 Set base `body` background/text/font from tokens; add a smooth color transition
- [x] 3.3 Expose the common subset of tokens to Tailwind v4 via `@theme inline` so utilities resolve to tokens
- [x] 3.4 Map Tailwind Typography `--tw-prose-*` variables to tokens and set article prose to `--ff-prose`; verify `prose` is legible in both themes

## 4. Theme init (inline, no-flash)

- [x] 4.1 In `BaseLayout.astro`, replace `class="scheme-light"` with a token-driven default and add an inline `<head>` script (passed via `set:html`) that resolves theme (localStorage → `prefers-color-scheme` → light) and sets `document.documentElement.dataset.theme` before paint
- [x] 4.2 Add a dark `theme-color` meta variant alongside the existing light one
- [x] 4.3 Confirm the inline init introduces no `on*` handlers and leaves the CSP unchanged (relies on the already-allowed `script-src 'unsafe-inline'`)

## 5. Theme toggle (Astro client-side script)

- [x] 5.1 Create `ThemeToggle.astro` rendering both sun/moon SVGs, with CSS choosing the icon from `html[data-theme]` so it's correct on the first frame (no flash); a bundled `<script>` importing `theme-toggle.ts` wires the click (flip `data-theme`, persist to `localStorage`, sync `aria-pressed`)
- [x] 5.2 Mount it in the header; confirmed the script loads as an external module under `script-src 'self'` (no inline handler) and there is no island/hydration. Add the `*.astro/*.ts` ESLint override so component `<script>`s lint. (Initially built as a Preact island; switched to an Astro script to eliminate a post-hydration icon flash.)

## 6. Mascot component

- [x] 6.1 Create `src/components/mascot/Mascot.astro` (inline SVG, no JS) translating `design-handoff/project/mascot.jsx`, props `pose` (`head`|`neutral`|`sit404`), `size`, `animate`, `class`; fills via token-driven CSS classes (`currentColor`/vars)
- [x] 6.2 Add blink/wobble/antenna animations in a scoped `<style>`, disabled under `@media (prefers-reduced-motion: reduce)`
- [x] 6.3 Provide accessible labelling (aria-label when meaningful; `aria-hidden` when decorative); verified head renders in both themes (stroke follows theme)

## 7. Header & Footer

- [x] 7.1 Redesign `src/components/layout/Header.astro`: logo (Mascot `head` + "BrokenRobot" wordmark + mono `brokenrobot.xyz` line), nav with active state, sticky/blurred bar, and the `ThemeToggle` island
- [x] 7.2 Redesign `src/components/layout/Footer.astro`: Mascot + blurb, link columns (writing/about, social + RSS using existing `InternalLink`/`ExternalLink`), witty sign-off; keep `SITE_METADATA` social links and the RSS link
- [x] 7.3 Ensure header and footer are responsive (no overflow at phone width; footer columns stack) — _verified desktop; mobile to confirm in 9.4_

## 8. Documentation

- [x] 8.1 Update `docs/brand.md`: replace the "stays open" palette/type/mascot wording with the locked decisions (amber `#f59e0b` + token roles for light/dark; Space Grotesk / Newsreader / Space Mono; the broken-robot mascot)
- [x] 8.2 Update `docs/tech-stack.md`, `docs/architecture.md`, and `docs/coding-conventions.md` to record the Preact-islands decision (superseding "no UI framework"): Preact for interactivity via `client:*` islands, the inline theme-init exception, and CSP/perf implications

## 9. Verify

- [x] 9.1 `npm run type:check`, `npm run lint:check`, `npm run format:check` all pass (incl. the new Preact `.tsx`) — _note: `format:check` flags only the pre-existing, out-of-scope `.claude/settings.json`_
- [x] 9.2 `npm run build` succeeds; confirmed no third-party font requests and the toggle island hydrates from `self` (no CSP violations observed)
- [ ] 9.3 Run axe/Playwright; confirm WCAG AA in both themes; update visual snapshots and add dark-theme coverage (`npm run test:e2e:update` then `npm run test:e2e:check`) — _deferred: needs `.env` (BROKENROBOT_PORT) + browser binaries; run locally/CI_
- [ ] 9.4 Manually verify: no theme flash on load (light & dark), toggle persists across reloads, mascot + header + footer read well in both themes on desktop and mobile — _verified via preview on desktop (both themes, no-flash, persistence, console clean); mobile widths still to confirm_
