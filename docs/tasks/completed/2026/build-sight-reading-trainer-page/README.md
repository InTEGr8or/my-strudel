# Build sight-reading trainer page

## Scope
- Extend `src/js/note-chart.js` with `renderNoteHead(noteName, type)` and `clearNoteHeads()` methods
- Add MIDI observer hook to `src/_includes/layout.njk`
- Create `src/songs/sketches/sight-reading/index.md` — standalone trainer page

## Design decisions (from user)
- **Page type**: New standalone page (not a toggle in the existing layout)
- **Note range**: Configurable (user can constrain clef/range)
- **Wrong answer feedback**: Ghost note only (hollow note head at target position, no text label)

## Implementation plan

### 1. note-chart.js — note head rendering
- Store `_getY` function reference during render() so note head methods can calculate positions outside the render() closure
- Add `renderNoteHead(noteName, type)`:
  - Parse noteName (e.g. "c4", "ds5")
  - Calculate Y from stored _getY or recalculate using same algorithm
  - Draw `<ellipse>` at correct staff position (rotated ~20°), horizontally centered
  - Draw stem (vertical line, ~3.5 staff spaces)
  - Draw ledger lines if outside staff range
  - `type`: 'target' (filled, default color), 'correct' (green fill), 'ghost' (hollow, dashed stroke)
- Add `clearNoteHeads()` — removes all note-head elements from the SVG
- Use a dedicated `<g id="note-heads">` for tidy DOM management

### 2. layout.njk — MIDI observer hook
- Add a simple array `window.__midiObservers = []`
- In `handleMidiMessage`, after existing logic, call each observer with `(midiNote, isNoteOn)`
- Keep it minimal — 3-4 lines total

### 3. sight-reading/index.md — standalone trainer page
- **Frontmatter**: `layout: layout.njk`, `title: Sight Reading Trainer`, `type: trainer`
- **Content**: Markdown body contains:
  - Trainer control panel (score display, range config, new-note button)
  - Trainer logic script that:
    - Registers a MIDI observer
    - Generates random notes within configured range
    - Shows target via note-chart's renderNoteHead
    - Compares incoming MIDI notes to target
    - Updates score and feedback
  - Inline CSS for trainer-specific UI
- Configuration UI:
  - Clef/range selector (dropdown or buttons)
  - Configurable via JS state, displayed as buttons

### 4. Files to create/modify
- MODIFY: src/js/note-chart.js
- MODIFY: src/_includes/layout.njk (small change)
- CREATE: src/songs/sketches/sight-reading/index.md
- CREATE: src/songs/sketches/sight-reading/song.strudel (placeholder, required by build)

## Build verification
- `npm run build` must succeed
- `node -c src/js/note-chart.js` must pass syntax check

## Completion Criteria

A standalone page at src/songs/sketches/sight-reading/ with: (1) note-chart extended to render note heads, target/correct/ghost states, and ledger lines; (2) trainer generates random notes within a configurable range, waits for MIDI input, shows ghost note on wrong answer, marks green on correct; (3) score tracking with correct/wrong counters; (4) synth voice selection preserved from sidebar; (5) page builds without errors.

## Solution

Created a standalone sight-reading trainer page. Extended note-chart.js with renderNoteHead() supporting 'target', 'correct', and 'ghost' note types plus ledger lines. Added window.__midiObservers hook in layout.njk for any page to observe MIDI events. Built the trainer at /songs/sketches/sight-reading/ with configurable range (Grand Staff, Treble, Bass clef), score tracking, and ghost-note wrong-answer feedback.

---
**Completed in commit:** `d918cdd`
