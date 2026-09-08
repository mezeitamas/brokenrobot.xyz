## Why

The `Strict-Transport-Security` header exists in three copies, and they disagree. Production
(Cloudflare) sends `max-age=31536000; includeSubDomains`; `nginx.conf` and `astro.config.ts` both
declare `max-age=63072000` with a `preload` token. Nothing records which value is intended, so
[known-gaps](../../../docs/known-gaps.md) has carried the disagreement as an open question rather
than a bug anyone could act on.

The disagreement is larger than a number. `preload` asks browsers to hard-code the domain into
their binaries — a commitment [infra/cloudflare/README.md](../../../infra/cloudflare/README.md)
declines on purpose, and one the domain is currently ineligible for. Two files advertise a policy
the infrastructure documentation argues against.

## What Changes

- The intended header is fixed at `max-age=31536000; includeSubDomains`, with no `preload` token.
  Production already sends exactly this, so the value is confirmed by what the site does today
  rather than chosen fresh.
- `nginx.conf` and `astro.config.ts` adopt that value. They drop `preload`, and `nginx.conf`
  additionally gains the `includeSubDomains` spelling the other two copies use.
- `infra/cloudflare/modules/domain/main.tf` is **unchanged**. Production was right; the two stale
  copies predate the Cloudflare migration and were never revisited.
- `docs/architecture.md` gains a `## Security headers` section that owns the intended value and the
  rule that the three copies stay byte-identical. That rule exists today, but it sits inside the
  `## Content-Security-Policy` section, which makes it read as a CSP-only rule — which is how this
  drift went unnoticed. The CSP section keeps the two-layer explanation that is genuinely about CSP.
- The HSTS entry is removed from `docs/known-gaps.md`.

## Non-Goals

- **No automated parity check.** The drift guard stays prose. A check that compares the three files
  is a reasonable future change, but it is not this one.
- **No assertion in the end-to-end suite.** That suite runs against `astro preview`, which
  known-gaps already records as a server the site never deploys to. Asserting response headers
  there would deepen a gap rather than close one.
- **No preload submission**, and no change to the apex→www redirect chain that currently makes the
  domain ineligible for it. The reasoning against preloading stands.
- **No new capability spec for response headers.** Headers stay documented in
  `docs/architecture.md`, where the other header guidance already lives.
- **No change to any other header.** A comparison of all six security headers across the three
  files found `Strict-Transport-Security` is the only one out of parity.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This change aligns two non-production copies of a response header with the value production
already sends, and relocates a documentation rule. The site's rendered output, its permalinks, its
feed, and the behaviour every existing capability describes are untouched, and no capability
currently covers response headers. `.openspec.yaml` sets `skip_specs: true`.

## Impact

- `nginx.conf` — one `add_header` line. Affects the container image and the Kubernetes deployment.
- `astro.config.ts` — one entry in `server.headers`. Affects `astro preview`, and therefore the
  server the Playwright suite runs against.
- `docs/architecture.md` — a new section, mostly relocating text that already exists.
- `docs/known-gaps.md` — one entry removed.
- No Terraform change, so **no production deploy risk**: the header production sends is identical
  before and after.
- Both edited copies serve plain HTTP (`astro preview` on localhost, nginx on `:8080` behind an
  ingress). RFC 6797 §8.1 requires user agents to ignore an STS header received over insecure
  transport, so neither line is believed to have had any browser-visible effect. Lowering the
  advertised `max-age` there carries no risk of stranding a client on a long-lived pin.
