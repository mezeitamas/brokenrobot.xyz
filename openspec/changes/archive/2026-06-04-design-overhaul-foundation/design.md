## Context

The redesign was prototyped in Claude Design (React + Google-Fonts CDN + inline styles) and handed off under `design-handoff/`. The production site is Astro 6 + Tailwind 4, statically built, behind a strict CSP, with self-hosted fonts. Today: a single light theme (`html.scheme-light`), Poppins self-hosted (`@font-face` in `src/styles/base.css`, files in `public/assets/fonts/`, preloaded by `PreloadFonts.astro`), Tailwind-default colors, and `prose` typography in `BaseLayout`'s `<main>`. This change builds the foundation only; page redesigns follow separately.

## Goals / Non-Goals

**Goals:**

- Token-driven theming with first-class light + dark, switchable and persistent, with no flash, under the existing CSP.
- Self-hosted Space Grotesk / Newsreader / Space Mono replacing Poppins.
- A reusable, theme-aware, motion-respecting mascot component.
- Redesigned header + footer matching the prototype.
- Lock the decisions into `docs/brand.md`.

**Non-Goals:**

- Page redesigns (home/blog/article/about/404) and hero imagery — follow-up change.
- Porting the prototype's React app wholesale or its in-prototype "Tweaks" panel — we adopt Preact but author our own minimal islands.
- Changing routes, RSS, content schema, or the CSP itself.

## Decisions

- **Tokens in `base.css @layer base`.** Light tokens on `:root`; dark overrides on `html[data-theme="dark"]`. Light is the no-JS default. Names mirror the prototype (`--bg`, `--surface`, `--surface-2`, `--text`, `--muted`, `--border`, `--accent`, `--accent-ink`, `--code-*`, shadows, `--accent-soft`, `--tape`, `--ff-display/-prose/-mono`). _Why:_ matches the prototype 1:1 and keeps theming in one place. _Alt considered:_ Tailwind `dark:` variant utilities — rejected; tokens give one source of truth and keep the toggle independent of class sprinkling.
- **Tailwind v4 mapping where practical.** Expose a subset of tokens to Tailwind via `@theme inline` (e.g. `--color-bg: var(--bg)`), so utilities like `bg-[--bg]`/`text-muted` work; component-scoped styles otherwise read `var(--token)` directly via the existing `@reference` + `@apply` pattern. _Why:_ pragmatic — avoids fighting the framework while keeping tokens primary.
- **Prose mapping.** Point Tailwind Typography's `--tw-prose-*` variables at our tokens and set article body to `--ff-prose` (Newsreader). _Why:_ `BaseLayout` wraps content in `prose`; theming it now keeps every page legible in both themes even before the page-level redesign.
- **Preact reserved for stateful islands.** Add `@astrojs/preact` as the standard for genuinely stateful interactivity (page phase: search, mobile menu, code-copy), hydrated with `client:*`. _Why:_ the user wants to minimize hand-written vanilla JS and standardize interactivity on components; Astro still ships zero JS for non-interactive pages. Preact is installed in the foundation but not yet used by an island — the theme toggle, originally planned as the first island, was moved to a bundled Astro `<script>` (see below) because an island flashed the wrong icon on load.
- **No-flash theme init stays inline.** A single inline `<head>` script (passed via `set:html`) resolves theme (localStorage → `prefers-color-scheme` → light) and sets `document.documentElement.dataset.theme` before paint. This cannot be a module/island — both run after load and would flash. The CSP already allows `script-src 'self' 'unsafe-inline'`, so the inline script is compliant; no inline `on*` attributes are used. _Why:_ the only reliable way to avoid FOUC on a static site.
- **Theme toggle as a bundled Astro `<script>` + CSS-driven icons.** `ThemeToggle.astro` renders both sun and moon SVGs; CSS shows the correct one based on `html[data-theme]` (already set pre-paint), so the icon is right on the first frame. A bundled `<script>` importing `theme-toggle.ts` wires the click (flip `data-theme`, persist, sync `aria-pressed`); it loads from `script-src 'self'`. _Why:_ a Preact island renders its initial icon before it can know the theme (SSR has no `data-theme`), causing a visible icon flip after hydration. CSS keyed on `data-theme` avoids that entirely and is lighter. _ESLint:_ `<script>` blocks lint as virtual `*.astro/*.ts` files via a dedicated override.
- **Mascot as inline-SVG Astro component** at `src/components/mascot/Mascot.astro`, translating `design-handoff/project/mascot.jsx`. Props: `pose` (`head` | `neutral` | `sit404`), `size`, `animate`, `class`. Fills derive from `currentColor`/tokens; animations live in a scoped `<style>` gated by `@media (prefers-reduced-motion: reduce)`. _Why:_ inline SVG is theme-aware and CSP-safe; no raster assets. Only the poses the foundation needs (head/neutral/sit404) are ported now; wave/confused can come with the home page.
- **Fonts self-hosted like Poppins is today.** Copy required `.woff2` weights from `@fontsource/space-grotesk|newsreader|space-mono` into `public/assets/fonts/`, declare `@font-face` (with `font-display: swap`) in `base.css`, and update `PreloadFonts.astro`. Remove Poppins faces + files and `@fontsource/poppins`. _Why:_ mirrors the established, CSP-compliant pattern (`font-src 'self'`). Limit to weights the design uses (Grotesk 400–700; Newsreader 400/500/600 + italic; Space Mono 400/700) to keep payload modest.
- **`theme-color` meta** gains a dark variant alongside the existing light one.

## Risks / Trade-offs

- **Visual snapshot tests will all change** → update Playwright snapshots; add dark-theme coverage so both themes are guarded. Treat as expected, review diffs deliberately.
- **Prose restyle touches every page now** (foundation lands before page redesigns) → keep prose mapping conservative and legible; verify existing article renders acceptably in both themes.
- **Inline theme script depends on `'unsafe-inline'`** in the current CSP → acceptable today; if the CSP later moves to nonces/hashes, the script must adopt a nonce. Note in `architecture.md` follow-up.
- **Preact runtime ships sitewide** because the toggle lives in the header (~5 KB gzipped) → accepted; keep islands few and small, and ensure non-interactive pages add no further JS. Astro hydration modules are `script-src 'self'` (CSP-friendly); verify no CSP violations after adding the integration.
- **Font swap affects layout metrics** (Newsreader/Grotesk differ from Poppins) → check headings/measure; adjust sizes in tokens, not per-component.
- **Mascot SVG fidelity** vs the JSX original → translate geometry faithfully; verify head + sit404 in both themes and at small sizes.

## Migration Plan

Incremental and low-risk: default theme is light (unchanged for no-JS), no routes/URLs/RSS change. Steps roughly follow `tasks.md`: tokens → fonts → theme init/toggle → mascot → header/footer → docs → update snapshots → verify (build, type, lint, axe, Playwright). Rollback = revert the change branch; nothing persisted server-side.

## Open Questions

- Exact `theme-color` dark value (tie to `--bg` dark `#17150f`) — resolve during implementation.
- Whether to expose all tokens to Tailwind `@theme` or only the common subset — start minimal, expand if page work needs it.
