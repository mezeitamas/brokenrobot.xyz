# Coding conventions

The rules below are enforced by tooling (`.eslintrc.json`, `.prettierrc.json`,
`tsconfig.json`). They are documented here so the overhaul stays consistent. Run
`npm run format:check`, `npm run lint:check`, and `npm run type:check` before committing.

## TypeScript

Extends `astro/tsconfigs/strictest`. Notable, ESLint-enforced rules:

- **No `any`** (`@typescript-eslint/no-explicit-any`).
- **Strict boolean expressions** — no implicit truthiness on strings, numbers, or
  nullables; compare explicitly.
- **Type-only imports** — use `import type { ... }` (`consistent-type-imports`).
- Prefer **optional chaining**; avoid confusing/unsafe non-null assertions.
- **No unused vars.** `verbatimModuleSyntax` and strict null checks are on.

## Imports

Enforced order (`eslint-plugin-import`): builtin → external → internal → parent → sibling →
index, with `exports-last`. Prefer the path aliases (`@components`, `@layouts`, `@assets`,
`@styles`) over deep relative paths.

## Formatting (Prettier)

- Print width **120**.
- **Single quotes**, **no trailing commas**.
- **One attribute per line** (`singleAttributePerLine`) — applies to Astro markup.
- Tailwind classes auto-sorted (`prettier-plugin-tailwindcss`).
- Covers `.astro, .js, .jsx, .ts, .tsx, .cjs, .mjs, .css, .json, .md, .mdx, .yml`.

## Naming

- **Components:** PascalCase `.astro` files.
- **Utilities & non-component files:** camelCase or kebab-case as in the existing tree.
- **Feature folders:** kebab-case (`blog-posts/`, `meta-og/`, `rich-results/`).

## Astro component patterns

- Type props with a local `type Props = { ... }`; destructure from `Astro.props`.
- **Scoped `<style>` blocks** with `@reference '../../styles/base.css';` then `@apply`
  Tailwind utilities — match the existing `Header.astro` pattern.
- Use **named slots** for content/SEO injection (e.g. `<slot name="content" />`).
- Prefer the existing `InternalLink` / `ExternalLink` components over raw anchors.

## Preact islands

- **Interactivity is a Preact island, not vanilla JS.** Write interactive UI as a Preact
  component (`.tsx`) and mount it from an Astro file with a `client:*` directive (e.g.
  `client:load`). Reserve plain inline scripts for the rare pre-paint case (the theme init).
- Keep islands **small and few** — they ship the Preact runtime to the page. Non-interactive
  UI stays plain Astro.
- `.tsx` follows the same strict TypeScript rules as `.ts` (and jsx-a11y); it is covered by
  `lint:check`, `format:check`, and `type:check`. JSX uses Preact (`jsxImportSource: preact`).
- Use the idiomatic `class` attribute (not `className`) and style via Tailwind utilities that
  resolve to tokens (e.g. `bg-surface`, `text-text`, `border-border`).

## Styling

- **Tailwind-first.** Reach for utilities before custom CSS.
- **Design tokens via CSS custom properties** in `src/styles/base.css` (see
  [architecture](architecture.md)). Theme-aware components read tokens, not hard-coded
  colors — this is what makes light/dark work.
- Article body uses the `@tailwindcss/typography` `prose` classes; tune `prose` to the
  tokens so long-form content respects the active theme.

## Testing

- **Playwright** E2E specs live in `tests/` (desktop Chrome + mobile Pixel 7 projects).
- **Visual regression** via screenshot snapshots (tight pixel tolerance). When intentional
  visual changes land, update with `npm run test:e2e:update` and review the diffs.
- **Accessibility** checks via `@axe-core/playwright` — keep them green.
- **Theme coverage:** because light and dark are both first-class, new UI needs snapshot /
  a11y coverage in **both** themes.

## Working principles

Follow the principles in [CLAUDE.md](../CLAUDE.md), which govern how changes are made here:

- **Simplicity First** — minimum code that solves the problem; nothing speculative.
- **Surgical Changes** — touch only what the task requires; match existing style.
- **Goal-Driven Execution** — define verifiable success criteria and loop until they pass.
