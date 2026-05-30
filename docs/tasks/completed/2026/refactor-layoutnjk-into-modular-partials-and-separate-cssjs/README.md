# Refactor layout.njk into modular partials and separate CSS/JS

# Goal
Break the monolithic `src/_includes/layout.njk` into reusable Nunjucks partials and external CSS/JS files, without changing any behavior.

## Plan

### 1. Extract CSS from inline `<style>` into `src/css/` files
- `vars.css` — `:root` CSS variables + `@media (prefers-color-scheme: dark)` overrides
- `layout.css` — body, header, `.app-container`, main, `.doc-container`, `.editor-container`, button styles
- `piano.css` — `#piano-container`, `.piano-key`, `.black`, `.active`, `.dimmed`, color tint bands
- `sidebar.css` — `aside`, `.tabs`, `.tab`, `.tab-content`, `.color-toggle`, `.tint-slider`, `.synth-voice`
- `trainer.css` — `.abc-notation`, dark mode SVG inversion, responsive column layout
- **Delete** `src/css/note-chart.css` (only 35 lines; fold into `src/css/layout.css` or keep as-is)
- `layout.njk` replaces inline `<style>` with `<link>` tags

### 2. Extract HTML into Nunjucks partials under `src/_includes/components/`
- `head.njk` — `<head>` block (meta, title, stylesheet links, CDN scripts, process.env polyfill)
- `header.njk` — `<header>` with home link, play/stop buttons, title, MIDI status, sidebar toggle
- `sidebar.njk` — `<aside id="sidebar">` with tabs and tab content (sounds, synth, ref)
- `staff.njk` — `#note-chart-container` + `<note-chart>` element
- `piano.njk` — `#piano-container` element (the `<div>`, piano generation script stays inline in the partial since it uses device config from a `<script>` tag)
- `strudel.njk` — `#song-source` template + `.editor-container` + `<strudel-editor>` (conditional on `type !== 'trainer' and type !== 'lesson'`)
- `device-config.njk` — `<script type="application/json" id="device-config">`

### 3. Extract inline `<script>` into Nunjucks partials under `src/_includes/components/scripts/`
- `midi.njk` — `requestMIDIAccess`, `handleMidiMessage`, `activeMidi` Map, `__midiObservers`, `__midiAudioCtx`
- `piano.njk` — piano DOM creation loop, `keyOn()`, `keyOff()`, `flashKey()`, `midiToNoteName()`, `staffNote()`
- `synth.njk` — `midiAudioCtx`, `midiToFreq()`, `loadFontData()`, `findZone()`, `decodeBuffer()`, `sfStatus()`, `playFromLocalSoundfont()`, `playOscillator()`, `playFallback*()`, `VOICES`, `selectVoice()`, `playMidiNote()`
- `audio-init.njk` — `initAudioCtx()`, capture-phase event listeners
- `abc-render.njk` — `window.addEventListener('load', ...)` for `.language-abc` rendering via ABCJS
- `strudel-repl.njk` — `{% if type !== 'trainer' and type !== 'lesson' %}` block that sets up the Strudel REPL with code injection, play/stop buttons, previewSound (conditional)
- `init.njk` — localStorage restore (tab, tint, color-guide), MIDI probe, sidebar toggle handler

### 4. Keep standalone JS modules as-is
- `src/js/note-chart.js` — web component, loaded via `<script type="module">`
- `src/js/trainer.js` — shared trainer logic, loaded via `<script>`
- `src/shared/parse-abc.js` — build-time and test-time only

### 5. Verify
- All 23 e2e tests pass
- Manual visual check: piano renders, sidebar tabs work, MIDI input works, lessons display correctly on all page types

## Key decisions
- Keep `<script>` code inline in Nunjucks partials (not `.js` files) because it depends on template variables (`{{ strudelCode }}`, `{% if type ... %}`) and Eleventy conditionals. Only pure-logic pieces already extracted (note-chart.js, trainer.js) stay in standalone files.
- Per-component granularity (one partial per functional area) to make it easy to nest components later.
- No functional changes — this is purely structural.


## Completion Criteria

layout.njk is a clean skeleton of `<html>` wrapping `{% include %}` tags; all CSS is in separate files linked via `<link>`; all JS is in separate Nunjucks partials or standalone modules; all 23 e2e tests pass.

## Solution

Refactored monolithic layout.njk into modular Nunjucks partials and separate CSS files. No behavior changes.

**CSS files** (`src/css/`):
- `vars.css` — :root CSS variables + dark mode overrides + keyframes
- `layout.css` — body, header, .controls, button, .app-container, main, .doc-container, .editor-container, #note-chart-container, responsive layout
- `piano.css` — #piano-container, .piano-key styles, tints, dimmed states
- `sidebar.css` — aside, .tabs, .tab, .tab-content, .synth-voice, .color-toggle, .tint-slider
- `trainer.css` — .abc-notation, dark SVG inversion, note-chart color toggle, responsive column layout
- `note-chart.css` deleted (content merged into `layout.css`)

**HTML partials** (`src/_includes/components/`):
- `head.njk` — meta, title, CDN scripts, CSS link tags
- `header.njk` — home link, play/stop buttons, title, MIDI status, sidebar toggle
- `sidebar.njk` — tabs (sounds, synth, ref), synth voices, color guide, tint slider
- `staff.njk` — #note-chart-container + <note-chart>
- `piano.njk` — #piano-container
- `strudel.njk` — #song-source template + .editor-container (conditional)
- `device-config.njk` — JSON config script

**Script partials** (`src/_includes/components/scripts/`):
- `piano.njk` — piano DOM generation, keyOn/keyOff/flashKey, midiToNoteName
- `ui.njk` — sidebar toggle, previewSound, activateTab, toggleColorGuide, setPianoTint
- `synth.njk` — AudioContext, soundfont loader, playMidiNote, VOICES, selectVoice
- `midi.njk` — activeMidi Map, staffNote, __midiObservers, handleMidiMessage, requestMIDIAccess
- `audio-init.njk` — initAudioCtx, capture-phase event listeners
- `abc-render.njk` — ABCJS load-time renderer
- `strudel-repl.njk` — conditional Strudel REPL setup
- `init.njk` — font probe, voice active class, tint/guide/tab localStorage restore

`layout.njk` is now a clean skeleton: `<html>` → `{% include %}` tags.

---
**Completed in commit:** `28999b9`
