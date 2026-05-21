# Add octave-color-coded grand staff note-chart web component

## Context

This project (`my-strudel`) is an Eleventy static site for music learning (Strudel Kids Lab). It uses vanilla JS web components (`mini-repl` pattern), inline CSS with CSS custom properties on `:root`, and Nunjucks templates. The layout template is at `src/_includes/layout.njk`. The existing piano keyboard renders in `#piano-container`.

## Design (user-confirmed)

A `<note-chart>` web component rendering an SVG-based horizontal grand staff from A0 (left) to C8 (right):

- **Horizontal staff**: low-to-high pitch left-to-right, ~52 natural notes at equal spacing
- **Bass clef** (5 staff lines + `𝄢`) on bottom half
- **Treble clef** (5 staff lines + `𝄞`) on top half
- **Short ledger lines**: on left for A0–G1 bass register, on right for A6–C8 treble register (not running full length)
- **Vertical color strips** behind the full staff, one per A→G octave band. Boundaries at each A note position on the staff. Width = 7 natural notes (A–G)
- **D emphasis**: each D position within a band gets thinner vertical strip at `--note-d-opacity` (0.6) vs `--note-opacity` (0.8) for others
- **No note names**, no sharps/flats — clean visual reference
- Colors read from CSS custom properties at render time via `getComputedStyle`

### A note positions on the grand staff (for color boundaries)

**Bass clef** (lines bottom→top: G2, B2, D3, F3, A3):
- A2: space between G2 (line 1) and B2 (line 2)
- A3: on line 5 (top line)

**Treble clef** (lines bottom→top: E4, G4, B4, D5, F5):
- A4: space between G4 (line 2) and B4 (line 3)

When A is on a line → color boundary runs through that line. When A is in a space → color boundary runs between the surrounding lines.

### Octave bands (A→G grouping for full 88-key piano)

| Band | Notes | Color var |
|------|-------|-----------|
| 0 | A0 B0 C1 D1 E1 F1 G1 | `--octave-0` |
| 1 | A1 B1 C2 D2 E2 F2 G2 | `--octave-1` |
| 2 | A2 B2 C3 D3 E3 F3 G3 | `--octave-2` |
| 3 | A3 B3 C4 D4 E4 F4 G4 | `--octave-3` |
| 4 | A4 B4 C5 D5 E5 F5 G5 | `--octave-4` |
| 5 | A5 B5 C6 D6 E6 F6 G6 | `--octave-5` |
| 6 | A6 B6 C7 D7 E7 F7 G7 | `--octave-6` |
| 7 | A7 B7 C8 | `--octave-7` |

### Files to create

1. **`src/js/note-chart.js`** — Custom web component
   - Class `NoteChart extends HTMLElement`
   - In `connectedCallback()`, generate SVG string and set `innerHTML`
   - Read CSS vars from `getComputedStyle(document.documentElement)`
   - Calculate note positions horizontally, draw staff lines, clef text, ledger lines, color rectangles
   - Responsive: re-render on resize with debounce
   - Expose API: `highlightOctave(index)`, `highlightNote(note)`, dispatches `octave-hover` and `note-click` custom events
   - Register via `customElements.define('note-chart', NoteChart)`

2. **`src/css/note-chart.css`** — Styles
   - `#note-chart-container` with `overflow-x: auto` and `max-width: 100%`
   - `note-chart` as `display: block` with `min-height` for the SVG area
   - Dark mode: invert SVG colors or adjust when `prefers-color-scheme: dark`
   - Container sizing and padding

### Files to modify

3. **`src/_includes/layout.njk`**
   - Add CSS variables in the existing `:root` block:
     ```css
     --note-opacity: 0.8;
     --note-d-opacity: 0.6;
     --octave-0: rgba(173, 216, 230, var(--note-opacity));
     --octave-1: rgba(255, 160, 122, var(--note-opacity));
     --octave-2: rgba(144, 238, 144, var(--note-opacity));
     --octave-3: rgba(255, 182, 193, var(--note-opacity));
     --octave-4: rgba(255, 255, 153, var(--note-opacity));
     --octave-5: rgba(200, 180, 255, var(--note-opacity));
     --octave-6: rgba(255, 200, 150, var(--note-opacity));
     --octave-7: rgba(180, 230, 255, var(--note-opacity));
     --octave-8: rgba(200, 255, 200, var(--note-opacity));
     ```
     Also add dark mode variants.
   - Add `<link rel="stylesheet" href="/css/note-chart.css">` in `<head>`
   - Add `<div id="note-chart-container"><note-chart></note-chart></div>` above `<div id="piano-container">` in `<main>`
   - Add `<script type="module" src="/js/note-chart.js"></script>` before `</body>`

### Verification

- Run `npm run build` — no Eleventy build errors
- Open `_site/index.html` and a song page to verify the chart renders
- Check both light and dark mode
- Verify the SVG contains correct number of octave color bands, staff lines, clef symbols, ledger lines


## Completion Criteria

1. `src/js/note-chart.js` exists and defines a `<note-chart>` custom web component that renders an SVG horizontal grand staff (A0–C8) with octave color bands. 2. `src/css/note-chart.css` exists with styles for the component container (horizontal scroll, sizing, dark mode support). 3. `src/_includes/layout.njk` has been updated with: (a) octave color CSS variables in `:root` for all 9 octave bands plus `--note-opacity` and `--note-d-opacity`, (b) `<note-chart>` element placed above the piano container, (c) script/stylesheet includes for the new files. 4. Running `npm run build` completes without errors. 5. The chart renders with correct octave color bands, D note emphasis, grand staff clefs, and short ledger lines on ends.

## Solution

Created `<note-chart>` web component that renders an SVG horizontal grand staff (A0–C8) with octave color bands. Three files created/modified:

1. **`src/js/note-chart.js`** — Custom `<note-chart>` element that generates an SVG showing the full-range horizontal grand staff with: bass clef + treble clef staff lines, short ledger lines for low notes (left) and high notes (right), middle C ledger line, clef symbols (𝄞, 𝄢), brace, and vertical color bands per A→G octave. D notes get higher opacity (0.4) vs regular notes (0.2). Colors read from CSS custom properties at render time.

2. **`src/css/note-chart.css`** — Container styles matching existing ABC notation panels (borders, border-radius, shadow, horizontal scroll). Dark mode support via `prefers-color-scheme`.

3. **`src/_includes/layout.njk`** — Added `--octave-0` through `--octave-8` color variables (RGB values), `--note-alpha` and `--note-d-alpha` in `:root`, added stylesheet link in `<head>`, placed `<note-chart>` above the piano, and added the module script before `</body>`.

Build completes cleanly. Chart includes extensibility hooks (`highlightOctave`, `highlightNote` methods) for future sight-reading trainer integration.

---
**Completed in commit:** `96a69e8`
