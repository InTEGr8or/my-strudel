## Task: Add octave-color-coded grand staff note-chart web component

### Context
Eleventy static site (Strudel Kids Lab). Vanilla JS web components. CSS custom properties on `:root`. Layout template: `src/_includes/layout.njk`.

### Design (user-confirmed)

A `<note-chart>` web component rendering an SVG of the grand staff with HORIZONTAL color bands:
- **Grand staff**: Bass clef (5 lines G2–A3) + treble clef (5 lines E4–F5), with middle C ledger line
- **Horizontal color bands** behind each staff position (line or space), spanning the full staff width
- Each band color is based on the A→G octave band the note belongs to
- Color transitions occur at each A on the staff:
  - A2 (bass space 1): band 1→2
  - A3 (bass line 5): band 2→3  
  - A4 (treble space 2): band 3→4
- **D positions** (D3, D4, D5) are bolder: `--note-d-alpha` (0.4) vs `--note-alpha` (0.2)
- No ledger lines unless a note is on them
- Clef symbols (𝄞, 𝄢), brace ({) connecting staves
- No note names, no sharps/flats

### CSS variables (in `:root`)

```css
--note-alpha: 0.2;          /* 80% transparent for regular notes */
--note-d-alpha: 0.4;        /* 60% transparent (bolder) for D */
--octave-0: 173, 216, 230;  /* light cyan */
--octave-1: 255, 160, 122;  /* light salmon */
--octave-2: 144, 238, 144;  /* light green */
--octave-3: 255, 182, 193;  /* light pink */
--octave-4: 255, 255, 153;  /* light yellow */
--octave-5: 200, 180, 255;  /* light purple */
--octave-6: 255, 200, 150;  /* light orange */
--octave-7: 180, 230, 255;  /* light sky blue */
--octave-8: 200, 255, 200;  /* light mint */
```

### Files

| File | Action |
|------|--------|
| `src/js/note-chart.js` | **Created** — `<note-chart>` custom element, SVG rendering |
| `src/css/note-chart.css` | **Created** — container styles, dark mode |
| `src/_includes/layout.njk` | **Modified** — added CSS vars, stylesheet link, component tag, script include |

### Verification
- `npm run build` passes
- SVG renders grand staff with 21 horizontal colored bands
- Each position gets correct octave color
- D positions (D3, D4, D5) are at higher opacity
- Dark mode respects `prefers-color-scheme`