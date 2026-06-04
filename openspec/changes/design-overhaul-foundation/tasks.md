## 1. Dependencies & Preact setup

- [ ] 1.1 Add `@astrojs/preact` (+ `preact`) and `@fontsource/space-grotesk`, `@fontsource/newsreader`, `@fontsource/space-mono`; remove `@fontsource/poppins` (exact-pinned, per `.npmrc`)
- [ ] 1.2 Enable Preact in `astro.config.ts` (`integrations: [preact(), mdx(), sitemap()]`); set the JSX options Preact needs in `tsconfig.json` (`jsx: "react-jsx"`, `jsxImportSource: "preact"`) without breaking the strict config
- [ ] 1.3 Extend ESLint to cover `.tsx` (add a `*.tsx` override with the TS parser + jsx-a11y) and widen the `lint:check` glob to include `.tsx`, keeping the strict ruleset
- [ ] 1.4 Copy required `.woff2` weights into `public/assets/fonts/` (Space Grotesk 400/500/600/700; Newsreader 400/500/600 + 400 italic; Space Mono 400/700 + 400 italic); remove the Poppins font files

## 2. Fonts CSS

- [ ] 2.1 Replace the Poppins `@font-face` block in `src/styles/base.css` with `@font-face` declarations for the three families (all `font-display: swap`)
- [ ] 2.2 Update `src/components/fonts/PreloadFonts.astro` to preload the primary new weights (drop Poppins preloads)

## 3. Design tokens & theming CSS

- [ ] 3.1 In `src/styles/base.css @layer base`, define light tokens on `:root` and dark overrides on `html[data-theme="dark"]` (`--bg`, `--surface`, `--surface-2`, `--text`, `--muted`, `--border`, `--accent` `#f59e0b`, `--accent-ink` light `#b45309`/dark `#fbbf24`, `--code-bg/-text/-line`, shadows, `--accent-soft`, `--tape`, `--ff-display/-prose/-mono`)
- [ ] 3.2 Set base `body` background/text/font from tokens; add a smooth color transition
- [ ] 3.3 Expose the common subset of tokens to Tailwind v4 via `@theme inline` so utilities resolve to tokens
- [ ] 3.4 Map Tailwind Typography `--tw-prose-*` variables to tokens and set article prose to `--ff-prose`; verify `prose` is legible in both themes

## 4. Theme init (inline, no-flash)

- [ ] 4.1 In `BaseLayout.astro`, replace `class="scheme-light"` with a token-driven default and add an `is:inline` `<head>` script that resolves theme (localStorage → `prefers-color-scheme` → light) and sets `document.documentElement.dataset.theme` before paint
- [ ] 4.2 Add a dark `theme-color` meta variant alongside the existing light one
- [ ] 4.3 Confirm the inline init introduces no `on*` handlers and leaves the CSP unchanged (relies on the already-allowed `script-src 'unsafe-inline'`)

## 5. Theme toggle (Preact island)

- [ ] 5.1 Create a `ThemeToggle` Preact component (sun/moon `<button>`) that reads the current `data-theme`, flips it on click, persists to `localStorage`, and keeps `aria-pressed`/`aria-label` in sync
- [ ] 5.2 Mount it in the header with a `client:load` directive; confirm hydration ships as an external module under `script-src 'self'` (no inline handler) and that the inline init guarantees correct state before hydration

## 6. Mascot component

- [ ] 6.1 Create `src/components/mascot/Mascot.astro` (inline SVG, no JS) translating `design-handoff/project/mascot.jsx`, props `pose` (`head`|`neutral`|`sit404`), `size`, `animate`, `class`; fills via `currentColor`/tokens
- [ ] 6.2 Add blink/wobble/antenna animations in a scoped `<style>`, disabled under `@media (prefers-reduced-motion: reduce)`
- [ ] 6.3 Provide accessible labelling (aria-label when meaningful; `aria-hidden` when decorative); verify head + sit404 render in both themes and at small sizes

## 7. Header & Footer

- [ ] 7.1 Redesign `src/components/layout/Header.astro`: logo (Mascot `head` + "BrokenRobot" wordmark + mono `brokenrobot.xyz` line), nav with active state, sticky/blurred bar, and the `ThemeToggle` island
- [ ] 7.2 Redesign `src/components/layout/Footer.astro`: Mascot + blurb, link columns (writing/about, social + RSS using existing `InternalLink`/`ExternalLink`), witty sign-off; keep `SITE_METADATA` social links and the RSS link
- [ ] 7.3 Ensure header and footer are responsive (no overflow at phone width; footer columns stack)

## 8. Documentation

- [ ] 8.1 Update `docs/brand.md`: replace the "stays open" palette/type/mascot wording with the locked decisions (amber `#f59e0b` + token roles for light/dark; Space Grotesk / Newsreader / Space Mono; the broken-robot mascot)
- [ ] 8.2 Update `docs/tech-stack.md`, `docs/architecture.md`, and `docs/coding-conventions.md` to record the Preact-islands decision (superseding "no UI framework"): Preact for interactivity via `client:*` islands, the inline theme-init exception, and CSP/perf implications

## 9. Verify

- [ ] 9.1 `npm run type:check`, `npm run lint:check`, `npm run format:check` all pass (incl. the new Preact `.tsx`)
- [ ] 9.2 `npm run build` succeeds; confirm no third-party font requests and no CSP violations (Preact hydration loads from `self`)
- [ ] 9.3 Run axe/Playwright; confirm WCAG AA in both themes; update visual snapshots and add dark-theme coverage (`npm run test:e2e:update` then `npm run test:e2e:check`)
- [ ] 9.4 Manually verify: no theme flash on load (light & dark), toggle persists across reloads, mascot + header + footer read well in both themes on desktop and mobile
