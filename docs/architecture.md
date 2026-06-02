# Architecture & conventions

How the codebase is organized today, and the architectural guidance for the overhaul
(especially theming). Descriptive sections reflect the current repo.

## Directory layout

```
src/
  components/      Reusable Astro components, grouped by feature
    blog-posts/    BlogPosts, CompactBlogPosts, ReadingTime, PublishDate
    layout/        Header, Footer
    links/         InternalLink, ExternalLink
    picture/       BlogPostPicture
    seo/           meta-og/, meta-twitter/, rich-results/ (JSON-LD)
    fonts/         PreloadFonts
  content/blog/    One folder per post: index.mdx + collocated images
  layouts/         BaseLayout, PageLayout, ArticleLayout
  pages/           File-based routes
  styles/          base.css (global styles, tokens, font-face)
  utils/           remarkReadingTimePlugin.ts
  consts.ts        Centralized site metadata
  content.config.ts Content collection schema
public/            Static assets (favicon, robots.txt, self-hosted fonts)
tests/             Playwright specs + visual snapshots
infra/             Terraform (AWS, Cloudflare) + Kubernetes
```

**Path aliases** (`tsconfig.json`): `@assets/*`, `@components/*`, `@layouts/*`, `@styles/*`.
Prefer these over deep relative imports.

## Layouts

A three-level hierarchy:

- **`BaseLayout.astro`** — HTML root: `<head>`, global styles, `Header`, `Footer`, the
  `<html>` element (currently `class="scheme-light"`), and the `prose` wrapper for content.
- **`PageLayout.astro`** — extends Base; SEO metadata for standalone pages.
- **`ArticleLayout.astro`** — extends Base; article-specific SEO and structure for blog posts.

## Routing

File-based (Astro standard):

- `pages/index.astro` — homepage (recent posts).
- `pages/blog/index.astro` — blog listing.
- `pages/blog/[...slug].astro` — dynamic post route via `getStaticPaths()`. **These
  `/blog/<slug>/` permalinks must remain stable** (see [vision](vision.md)).
- `pages/about/index.astro`, `pages/404/index.astro`.
- `pages/rss.xml.ts` — RSS feed. Must keep working.

## Content model

Defined in `src/content.config.ts` via a `glob` loader (`**/[^_]*.{md,mdx}`) and a Zod schema:

| Field         | Type                      | Notes                                 |
| ------------- | ------------------------- | ------------------------------------- |
| `title`       | `string`                  |                                       |
| `excerpt`     | `string`                  | Summary / meta description            |
| `publishDate` | `string \| date` → `Date` | Transformed to `Date`                 |
| `heroImage`   | `image()`                 | Astro-optimized; collocated with post |
| `tags`        | `string[]`                |                                       |

Posts live at `src/content/blog/<slug>/index.mdx` with images in the same folder. The
`remarkReadingTimePlugin` (`src/utils/`) injects `minutesRead` into frontmatter, consumed by
the `ReadingTime` component.

## Conventions

- **Component organization:** group by feature in subfolders (`seo/`, `blog-posts/`,
  `links/`, `layout/`). PascalCase component files.
- **SEO / structured data:** OpenGraph (`meta-og/`), Twitter cards (`meta-twitter/`), and
  JSON-LD (`rich-results/`, typed with `schema-dts`). Fonts preloaded via `PreloadFonts`.
- **Links:** use `InternalLink` / `ExternalLink` rather than raw `<a>`.
- **Site metadata:** centralized in `src/consts.ts` (`SITE_METADATA`) — title, description,
  author, socials, image breakpoints. Add new global constants here.

## Theming architecture (for the overhaul)

The light/dark system is new work. Guidance:

- **Design tokens as CSS custom properties** defined in `src/styles/base.css` under
  `@layer base`. Express the semantic roles from [brand](brand.md) (`--color-bg`,
  `--color-surface`, `--color-text`, `--color-muted`, `--color-accent`, …).
- **Theme selection on `<html>`** via a `class` or `data-theme` attribute (today it's
  `class="scheme-light"`). Define token values once for light and override them for dark.
  Map Tailwind to these tokens so utilities and `prose` follow the theme.
- **Toggle must be CSP-safe.** No inline `on*` event handlers. Use a small `<script>`
  (allowed by `script-src 'self' 'unsafe-inline'`) to read/persist the preference
  (localStorage), honor `prefers-color-scheme`, and set the attribute before paint to avoid
  a flash. See [tech-stack](tech-stack.md) for the CSP details.
- **Both themes are first-class** — every component, the mascot, and `prose` article styling
  must be verified in light and dark (see [coding-conventions](coding-conventions.md) for
  snapshot coverage).
