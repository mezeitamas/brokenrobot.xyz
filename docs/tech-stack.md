# Technology stack

[`package.json`](../package.json) is the authoritative source for exact dependencies,
versions, and script commands — this document does not duplicate it. Instead it captures what
that file can't: the _shape_ of the stack, why it looks the way it does, and how it shapes the
design overhaul.

## Shape of the stack

- **Astro** is the foundation — a static-site generator. Pages are Astro components rendered
  to static HTML at build time, shipping zero JS by default.
- **Preact** (via `@astrojs/preact`) is the standard for interactive UI, added as hydrated
  **islands** (`client:*`) to minimize hand-written vanilla JS. Non-interactive pages still
  ship no JS; only islands (e.g. the header theme toggle) load the small Preact runtime. The
  one deliberate vanilla exception is a tiny pre-paint theme-init script (see below).
- **Content is Markdown/MDX**, authored as one folder per post under `src/content/blog/` and
  loaded through Astro's content collections (see [architecture](architecture.md)). A small
  remark plugin adds reading-time to each post.
- **Styling is Tailwind CSS** (via PostCSS) plus the typography plugin for long-form `prose`.
- **TypeScript runs in the strictest mode** — the type system is a first-class guardrail (see
  [coding-conventions](coding-conventions.md)).
- **Fonts are self-hosted** (Space Grotesk for display/UI, Newsreader for article prose, Space
  Mono for code/labels), not pulled from a third-party CDN.
- **Discoverability is built in:** an RSS feed and an XML sitemap are generated at build time,
  and structured data (JSON-LD) is typed.
- **Quality is automated:** ESLint + Prettier for static analysis and formatting; Playwright
  for end-to-end and visual-regression tests, with axe-core for accessibility checks.
- **npm is the package manager**, configured for reproducibility (exact version pinning,
  engine-strict, committed lockfile).

## Build & deployment

- `astro build` produces a fully **static** `dist/`. HTML is compressed, stylesheets are
  **always inlined**, and images use responsive styles (see `astro.config.ts`).
- **CI/CD** runs in GitHub Actions (`.github/workflows/pipeline.yml`): a `verify` →
  `build` → `test` sequence (format, lint, type-check, then build, then Playwright), followed
  by deployment from `main`.
- **Dual-cloud delivery:** the built site is published to both **AWS** (S3 sync + CloudFront
  invalidation) and **Cloudflare Pages**. Production deploys are gated by environment approval.

## Infrastructure & tooling

- **Infrastructure as code:** Terraform under `infra/` (AWS, Cloudflare) plus Kubernetes
  manifests. CI also runs `terraform fmt`/`validate`.
- **Container:** a `Dockerfile` serves `dist/` via unprivileged Nginx.
- **Dev container:** a reproducible environment with Node and Terraform pre-installed.

## Implications for the overhaul

- **Interactivity via Preact islands.** Stateful UI (e.g. the theme toggle) is a Preact island
  hydrated with `client:*`; its hydration loads as an external module under `script-src 'self'`
  (no inline handlers). Prefer this over hand-written vanilla JS.
- **Theme set before paint by one inline script.** The pre-paint theme resolution (read
  preference → set `data-theme`) cannot be an island — hydration runs after load and would
  flash. It stays a tiny inline script, CSP-safe via the already-allowed
  `script-src 'unsafe-inline'`, with no inline `on*` handlers. See [architecture](architecture.md).
- **Fonts stay self-hosted** (`font-src 'self'`, no third-party font CDNs), with preloading and
  `font-display: swap`; only the weights actually used are shipped.
- **Stylesheets are inlined**, so keep CSS lean; design tokens belong in `src/styles/base.css`.
- **Everything is static** — there is no server runtime to lean on for theming or
  personalization.
