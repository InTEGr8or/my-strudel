# Lesson modules: keys and chord progressions learning system

## Overview

Build a lesson module system for learning keys (major/minor), chords, and progressions. Each lesson is a folder with a Markdown page (theory) + ABC file (exercises), with an integrated trainer component below the theory text.

## Design Decisions (from user)

- **Section scope**: Major and minor keys to start; chords and progressions can be added later
- **Lesson layout**: Theory text at the top, interactive trainer (note-chart) below it
- **Dashboard**: The Activities/Modules section should be more prominent — moved to the top of the page, cards at 1.5x–2x current size, with richer content displayed per card
- **Navigation**: Standalone curriculum page + prev/next links on each lesson; keyboard (computer) nav is a later task
- **ABC storage**: Separate `.abc` files in each lesson's directory (same pattern as songs)

## Directory Structure

```
src/lessons/
  c-major/
    index.md          # Frontmatter + theory content
    exercises.abc     # Scale exercises, patterns, arpeggios
  a-minor/
    index.md
    exercises.abc
  g-major/
    index.md
    exercises.abc
  ... (more as needed)
```

## Lesson Frontmatter (index.md)

```yaml
---
title: "C Major Scale"
key: "C"
type: "lesson"
lessonType: "major"
difficulty: "beginner"
order: 1
description: "Learn the notes in the C major scale"
tags: [lessons, scale, major]
abc: c-major
---
```

## Implementation Steps

### 1. Dashboard Updates (src/index.njk)

- Promote the current "Activities" section to the top of the page (above "Songs")
- Increase card size to 1.5x–2x current (larger cards, more content visible)
- Show richer per-card content: title, description, difficulty badge, key badge, lesson type badge
- Create a dedicated "Lessons" section tag (type: lesson) in addition to existing Activities
- Style the section heading and card grid

### 2. Eleventy Configuration (eleventy.config.js)

- Add passthrough copy for lesson ABC files
- Add watch target for lesson ABC directory
- Add collection for `type: lesson` pages, sorted by `order`

### 3. ABC Parsing for Lessons (src/lessons/lessons.js or similar)

- Create an Eleventy `.11ty.js` template that reads all lesson directories
- For each lesson, parse `exercises.abc` to extract note sequences
- Generate a `lessons.json` at build time (similar to `songs.json`)
- The JSON includes lesson metadata + parsed notes from ABC

### 4. Trainer Component Refactoring

The current trainer logic (in `src/songs/sketches/sight-reading/index.md`) needs to be extracted into a reusable module so it can be included on lesson pages too:

- Extract shared trainer JavaScript into `src/js/trainer.js` (or similar)
- The trainer accepts a configuration: note source (ABC notes or random), window size, range
- Include the trainer in both the sight-reading trainer page and lesson pages
- The lesson page passes its ABC notes as the note source

### 5. Lesson Page Template

- Create a Nunjucks partial or layout for lesson pages
- Renders theory Markdown content
- Below it, renders the trainer component (note-chart + note window + controls)
- Includes prev/next navigation links based on `order` field
- Buttons styled for keyboard accessibility (tabbable, visible focus)

### 6. Curriculum Page (optional, phase 2)

- A dedicated curriculum page listing all lessons in order
- Shows progress or completion status (if we add that later)

### 7. ABC Exercise Files

For each key lesson:
- Ascending and descending scale patterns
- Broken thirds / interval exercises
- Simple melodic patterns using the scale
- Arpeggios (tonic triad)
- Use key signature in ABC (`K:C`, `K:G`, etc.)

Example for C major exercises.abc:
```
X:1
T:C Major Scale
M:4/4
L:1/8
K:C
| CDEF GABc | cBAG FEDC |]

X:2
T:C Major Broken Thirds
M:4/4
L:1/8
K:C
| C E D F | E G F A | G B A c | B G A F | G E F D | E C2 z |]
```

## Key Considerations

- **Reuse, don't rewrite**: The note-chart web component, MIDI handling, and playback (soundfont/oscillator) already work. The lesson page should leverage the existing infrastructure.
- **ABC parser reuse**: The existing ABC parser in `songs.11ty.js` works for note extraction. Consider extracting it to a shared module.
- **Trainer code extraction**: The trainer JavaScript (fillWindow, renderWindow, shiftWindow, MIDI observer, ghost notes) is currently ~250 lines in sight-reading/index.md. Extracting it carefully is important.
- **No CSS framework**: All styling is custom, consistent with the existing dark theme.
- **ABC files as source of truth**: The ABC files should be parseable both by the build-time tool (for note extraction) and by ABCJS (for visual rendering, if needed later).

## Questions to Resolve During Implementation

1. Should the lesson ABC notes REPLACE the sight-reading's built-in random note generation, or be an additional mode? (Likely replace — lesson exercises are fixed)
2. Should pattern size be configurable in lesson mode? (Probably yes — same as trainer)
3. How to handle completed lessons — mark as done via localStorage?
4. What's the right balance of theory content vs trainer practice on a single lesson page?


## Completion Criteria

1. Lesson directory structure with at least 3 lessons (C major, A minor, G major) with ABC exercise files
2. Dashboard displays Lessons section at top with 1.5x–2x sized cards showing richer content
3. Each lesson page renders theory Markdown at top + interactive trainer (note-chart) below
4. Trainer component reuses existing note-chart, MIDI handling, and audio playback
5. Lesson ABC exercises are parsed at build time and fed into the trainer as note sequences
6. Prev/next navigation links between lessons
7. All existing e2e tests still pass

## Solution

Implemented a full lesson module system for learning keys and music theory:

1. **Shared ABC parser** (`src/shared/parse-abc.js`) — Extracted from `songs.11ty.js` into a shared module used by both songs and lessons.

2. **Reusable trainer JS** (`src/js/trainer.js`) — Extracted the 250-line trainer logic from the sight-reading page into a `window.createTrainer(config)` function. Both the sight-reading page and lesson pages use it. Exposes `onMidi`, `start`, `setPatternSize`, `setNotes`, `posToMidi`, `getNotes`, `getPatternPos` methods.

3. **Lesson directory structure** (`src/lessons/{c-major,a-minor,g-major}/`) — Each lesson has `index.md` (frontmatter + theory) + `exercises.abc` (scale exercises, broken thirds, arpeggios).

4. **LessonNotes shortcode** (`eleventy.config.js`) — `{% lessonNotes 'lesson-name' %}` reads and parses the ABC file at build time, embedding parsed notes directly into the page HTML.

5. **LessonNav filter** (`eleventy.config.js`) — `{% assign nav = collections.all | lessonNav: page %}` computes prev/next navigation between lessons.

6. **Dashboard** (`src/index.njk`) — New "Lessons" section at top with 1.5x–2x larger cards showing type/key/difficulty badges, title, description, and "Start Lesson" button.

7. **Layout updates** (`layout.njk`) — `type: lesson` hides Play/Stop buttons and the Strudel editor, same as `type: trainer`.

8. **18 e2e tests** — 12 existing + 6 new lesson tests covering dashboard cards, theory rendering, trainer initialization, pattern buttons, score display, and prev/next navigation.

---
**Completed in commit:** `8cbf48c`
