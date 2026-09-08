## 1. Align the header copies

- [ ] 1.1 Set the `Strict-Transport-Security` `add_header` in `nginx.conf` to
      `max-age=31536000; includeSubDomains` — dropping `preload` and correcting `includeSubdomains`
      to `includeSubDomains`. Verify by re-reading the line: it matches the Terraform value in
      `infra/cloudflare/modules/domain/main.tf` character for character.
- [ ] 1.2 Set the `Strict-Transport-Security` entry in `server.headers` in `astro.config.ts` to
      `max-age=31536000; includeSubDomains`. Verify the same way.
- [ ] 1.3 Confirm `infra/cloudflare/modules/domain/main.tf` is untouched — verify `git diff` reports
      no change under `infra/`.
- [ ] 1.4 Re-run the header comparison across the three files and verify every security header now
      reports parity, with `Cache-Control` remaining the only expected divergence (absent from the
      Cloudflare header ruleset, which drives caching from a separate cache ruleset).

## 2. Record the intent

- [ ] 2.1 Add a `## Security headers` section to `docs/architecture.md` that names the three
      locations, states the byte-identity rule for the security header set, and records the intended
      `Strict-Transport-Security` value. Point at `infra/cloudflare/README.md` for the `preload`
      rationale instead of restating it. Verify the section names all three file paths and the exact
      header value.
- [ ] 2.2 Narrow the `## Content-Security-Policy` section in `docs/architecture.md` so it keeps the
      two-layer explanation and the `'unsafe-inline'` rationale, and defers the three-places rule to
      the new section rather than duplicating it. Verify the rule is stated once in the document.
- [ ] 2.3 Remove the "The container and production disagree on HSTS" entry from
      `docs/known-gaps.md`. Verify no remaining occurrence of `HSTS` or `Strict-Transport-Security`
      in that file.
- [ ] 2.4 Verify no automated check is described or enumerated in any file this change touches —
      `docs/development/checks.md` is the only place checks are listed, and this change adds none.

## 3. Verify

- [ ] Visual + a11y snapshots pass in **both themes** for every touched view (testing-visual-regression skill)
- [ ] All preflight gate checks pass — the set in `docs/development/checks.md` (running-preflight-checks skill)
- [ ] Manual preview: no theme flash, interactions work, console clean, responsive at 375px
