# Brand

This document defines the personality and visual direction of Broken Robot. It sets
**directional principles**: the personality and voice _are_ the lasting commitments, while
the visual recommendations below (palette, typography, mascot) are **illustrative starting
points** — the brand evolves toward them, and the exact hex values and font names stay open.

## Brand essence

**Broken Robot** is about the human behind the machine, and about embracing imperfection.

- **Embracing imperfection.** Robots break. Bugs, failures, and rewrites are where the
  learning happens. The brand is honest, humble, and iterative rather than slick and
  infallible.
- **The human behind the machine.** "Broken" is the warm, creative, fallible person behind
  otherwise cold and precise engineering. Technology is the medium; a real person is the
  point.

These two ideas should make the brand feel relatable rather than corporate.

## Personality & voice

The voice is **playful & quirky** and **warm & personable** — a real person sharing their
corner of the web with a bit of wit, never a marketing department.

**Do**

- Write in first person, conversational and friendly ("Hello there, my name is Tamas!").
- Allow gentle humor and personality, especially in incidental UI copy (404, empty states,
  buttons).
- Be honest and human — comfortable admitting things break and evolve.
- Stay clear and respectful of the reader's time; playful never means confusing.

**Don't**

- Sound corporate, salesy, or buzzword-heavy.
- Be ironic at the expense of clarity, or quirky to the point of distraction.
- Overpromise or posture as infallible — that contradicts "embracing imperfection."

_Anchor for tone:_ the existing About page copy is the reference register — friendly,
substantive, lightly playful.

## Mascot direction

A **broken robot character** is the recurring brand motif — the face of "embracing
imperfection" and the human-behind-the-machine idea. This is a directional concept; the
exact illustration stays open.

Where the mascot shows up:

- Hero / homepage greeting alongside the introduction.
- The **404 page** (a charmingly broken robot is a natural fit; today's 404 uses an image).
- Empty states (e.g. no posts for a tag) and loading/edge states.
- Favicon / logo lockup and social share imagery.

Principles for the mascot: expressive but simple, friendly not creepy, works at small sizes,
and renders well in **both light and dark themes**. Keep file weight modest (see performance
budget below).

## Visual direction (directional, stays open)

### Color & theme

Both **light and dark themes are first-class**, with the reader's preference respected. The
architecture for this lives in [architecture](architecture.md) (CSS custom properties,
CSP-friendly).

Think in **semantic token roles**, not raw colors, so both themes map cleanly:

- `bg` — page background
- `surface` — cards, code blocks, raised areas
- `text` — primary foreground
- `muted` — secondary text, borders, meta
- `accent` — the signature, ownable brand color (links, highlights, mascot cue)

_Starting suggestion (stays open):_ a near-neutral base (off-white in light, deep charcoal —
not pure black — in dark) paired with a single confident accent (e.g. a warm amber or an
electric teal evoking circuitry). The accent should read as "Broken Robot" and clear contrast
requirements in both themes. **The final palette stays open.**

### Typography

The current site uses **Poppins** (friendly geometric sans) as the baseline to evolve from.

_Recommended direction (stays open):_ pair a **characterful display face for headings** with
a **highly readable body face** for long-form articles, and a **monospace** for code that can
double as a playful "robot/engineering" accent in small doses (labels, tags, the mascot's
voice).

- Keep total font payload small and self-hosted (see [tech-stack](tech-stack.md));
  `font-display: swap` and preloading as today.
- Body legibility for long articles is the priority — don't sacrifice it for character.
- **The final type pairing stays open.**

### Motifs & imagery

- **Iconography:** Feather Icons today — keep a clean, consistent line-icon style.
- **Diagrams:** Excalidraw / draw.io; the hand-drawn Excalidraw style pairs well with the
  playful, imperfect brand.
- **Illustration style:** should harmonize with the mascot — simple, friendly, line-forward.

## Brand constraints

- **Contrast & accessibility.** Color choices meet WCAG AA contrast in _both_ themes.
  Accessibility is a standing commitment, not an afterthought (see [vision](vision.md)).
- **Performance budget.** Fonts and illustrations stay light on load performance. Prefer SVG
  for the mascot/icons, keep raster art optimized, and limit font weights to those actually
  used.
