## MODIFIED Requirements

### Requirement: Light and dark themes

The site SHALL provide both a light and a dark theme as first-class options, selected by a `data-theme` attribute (`"light"` or `"dark"`) on the root `html` element. Every themed token SHALL have a value defined for both themes.

#### Scenario: Dark theme overrides tokens

- **WHEN** `html[data-theme="dark"]` is set
- **THEN** every semantic token resolves to its dark value (deep charcoal background, light text), with no token left undefined

#### Scenario: WCAG AA contrast in both themes

- **WHEN** text, links, and UI controls are rendered in either theme
- **THEN** their color/background pairings meet WCAG AA contrast in both themes, and the automated accessibility (axe) checks pass against both the light and the dark theme
