## Context

See [proposal.md](proposal.md) — Why.

Three surfaces send the site's security headers, and they are not peers:

| Surface                                   | Role                                          |
| ----------------------------------------- | --------------------------------------------- |
| `infra/cloudflare/modules/domain/main.tf` | Production. The only one a reader ever meets. |
| `nginx.conf`                              | The container image, run under Kubernetes.    |
| `server.headers` in `astro.config.ts`     | `astro preview`, and the Playwright suite.    |

Two facts shaped the approach:

- **Production is verifiably correct.** `curl -sSI https://www.brokenrobot.xyz/` returns
  `strict-transport-security: max-age=31536000; includeSubDomains`, matching the Terraform
  source byte for byte. The Terraform side needs no repair.
- **The other two copies are stale, not dissenting.** The `nginx.conf` header line last changed in
  `76e5960`, before `0c70bd5 chore: migrate to cloudflare`. It is the pre-Cloudflare value, carried
  forward untouched.

A comparison of all six security headers across the three files found `Strict-Transport-Security`
is the only one out of parity. `Cache-Control` also differs, but legitimately: it is absent from
the Cloudflare header ruleset because that zone drives caching from a separate cache ruleset.

## Goals / Non-Goals

**Goals:**

- One intended value for the header, written down where a reader will find it before editing any
  of the three copies.
- The three copies agree.
- The rule that keeps them agreeing covers the security header set, not one header.

**Non-Goals:**

See [proposal.md](proposal.md) — Non-Goals. At design level, one addition: this change does not
restructure how headers are configured. Three copies remain three copies; making one the generated
source of the other two is a larger change with its own trade-offs, and is not attempted here.

## Decisions

### Adopt production's value rather than the container's

The two candidate values were production's `max-age=31536000; includeSubDomains` and the stale
copies' `max-age=63072000; includeSubDomains; preload`.

Production's wins on three counts. It is what the site actually serves, so adopting it changes
nothing a reader experiences. It agrees with
[infra/cloudflare/README.md](../../../infra/cloudflare/README.md), which declines `preload`
deliberately and records that the domain is ineligible for it regardless — the apex→www redirect
fires before `always_use_https`, so `http://<apex>` never redirects to HTTPS on the same host.
And the alternative would require changing production: raising a `max-age` binds returning browsers
for the new window, and lowering it again takes effect only as each client's pin expires.

_Alternative considered:_ a middle value of two years without `preload`. Rejected — it changes
production for a marginal gain, and inherits the slow-rollback property without the preload
argument to justify it.

### Guard the drift with prose, in a section that owns it

The byte-identity rule already exists in `docs/architecture.md`, but it lives inside the
`## Content-Security-Policy` section. A reader editing `Strict-Transport-Security` has no reason to
read a CSP section, which is the most likely explanation for how this drift survived a migration.

The fix is placement, not new machinery: a `## Security headers` section owns the header set, the
three locations, the intended HSTS value, and a pointer to the preload rationale. The CSP section
keeps the two-layer explanation, which is genuinely CSP-specific and is the site's most
load-bearing header documentation.

_Alternative considered:_ an automated parity check comparing the three files. It would enforce
what prose only requests, and would cover CSP too. Rejected for now as disproportionate — the three
files change perhaps twice a year, and a new check carries its own maintenance. The proposal
records it as a legitimate future change.

_Alternative considered:_ deleting the header from `nginx.conf` and `astro.config.ts` entirely,
leaving Cloudflare as the sole owner. Two fewer copies cannot drift, and the deleted lines are
inert where they sit. Rejected because the container is meant to be a portable host of the same
site; a container fronted by TLS should not silently lose HSTS.

### Fix the `includeSubdomains` spelling while the line is open

`nginx.conf` spells the directive `includeSubdomains`; the other two use `includeSubDomains`.
RFC 6797 §6.1 makes directive names case-insensitive, so this has no effect on behaviour — but the
rule this change introduces is byte-identity, and byte-identity does not tolerate it. The line is
being rewritten anyway.

## Risks / Trade-offs

- **Lowering an advertised `max-age` normally strands clients on the old, longer pin.** → Does not
  apply. Both edited surfaces serve plain HTTP — `astro preview` on localhost, nginx on `:8080`
  behind an ingress — and RFC 6797 §8.1 requires a user agent to ignore an STS header received over
  insecure transport. No browser is believed to hold a pin from either. Production, the only surface
  that could have set one, is unchanged.
- **Prose does not enforce.** → Accepted knowingly. The same guard is what CSP relies on today, and
  this change strengthens it by giving the rule a section a header-editor will actually open. If it
  fails again, the parity check is the recorded next step.
- **A reader may look for the intended value in the living record rather than in
  `docs/architecture.md`.** → Mitigated by keeping the value in the same document that already
  carries the CSP header guidance, so all header intent sits in one place rather than split between
  a spec and a doc.

## Migration Plan

No migration. No Terraform change means no production deploy touches the edge configuration, and
the header production sends is identical before and after. The container and preview server pick up
the new value on their next build, with no state to carry over.

Rollback is a revert of the commit.
