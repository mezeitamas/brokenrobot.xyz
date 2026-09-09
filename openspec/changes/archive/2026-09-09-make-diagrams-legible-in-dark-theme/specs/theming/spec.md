## ADDED Requirements

### Requirement: Content diagrams follow the active theme

Diagrams that appear in article prose SHALL be legible in both themes. Their strokes and labels
SHALL contrast with the page ground the reader is currently seeing, and the site SHALL derive that
treatment from the theme the reader has selected rather than from the operating system's preference.
Images that are not diagrams — photographs and third-party artwork — SHALL keep their authored
colours in both themes and SHALL NOT receive the treatment.

#### Scenario: Diagram legible on the dark ground

- **WHEN** a reader views an article containing a diagram with the dark theme active
- **THEN** the diagram's strokes and labels are rendered light against the dark page ground, at a
  contrast comparable to what the same diagram gives on the light ground

#### Scenario: Diagram legible on the light ground

- **WHEN** a reader views the same article with the light theme active
- **THEN** the diagram's strokes and labels are rendered dark against the light page ground, and the
  diagram shows no panel or plate in a colour other than that ground

#### Scenario: The treatment follows the reader's choice, not the operating system

- **WHEN** a reader whose operating system prefers light switches the site to dark with the theme
  toggle
- **THEN** the diagrams switch with the rest of the page, and they do so again on the next page load,
  for as long as that choice is the stored preference

#### Scenario: Photographs and third-party artwork are untreated

- **WHEN** an article shows a photograph, or artwork whose colours are not the site's to change
- **THEN** that image renders in its authored colours in both themes, and stays legible in both

### Requirement: A diagram is published as one theme-neutral asset

Each diagram SHALL be published as exactly one image file, with no separate light and dark variant.
That file SHALL carry no ground of its own, so the page's background shows through it, and SHALL
remain legible when a consumer renders it away from the site's styling.

#### Scenario: One file per diagram

- **WHEN** the site is built
- **THEN** each diagram is published as a single image, and no diagram ships a second variant
  selected by theme or by the operating system's colour-scheme preference

#### Scenario: No ground of its own

- **WHEN** a diagram image is rendered on a page
- **THEN** the page's own background is visible through the diagram, with no opaque rectangle of a
  different colour behind the drawing

#### Scenario: Legible detached from the site

- **WHEN** a consumer that does not load the site's styles — for example a reader of a post's
  Markdown representation — renders a diagram on a light surface
- **THEN** the diagram reads as dark ink on that surface, with its alternative text preserved
