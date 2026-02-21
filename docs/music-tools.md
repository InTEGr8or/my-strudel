# Music Programming Tools: Patterns vs. Scores

This document explores different text-based music notation languages, focusing on their suitability for web integration, interactivity, and educational use.

## The Core Divide: Patterns vs. Scores

- **Pattern Engines (Cycles):** Focus on loops and mathematical transformations of time. Best for electronic music and live coding. (Example: **Strudel**)
- **Linear Scores (Scores):** Focus on a start-to-finish sequence of notes, much like a traditional composer's sheet music. Best for classical arrangements and melodic storytelling.

---

## 1. ABC Notation
The standard for text-based folk music and web-based sheet music.

- **Web Integration:** **Excellent** (via `abcjs`).
- **Interactivity:** High. Can be rendered to SVG instantly and played via MIDI.
- **Rendering:** Best-in-class for traditional 5-line staff notation.
- **Child-Friendly:** High. `C D E` corresponds directly to the notes.
- **Use Case:** Bridging the gap between reading music and writing code.

## 2. Strudel (TidalCycles port)
A functional reactive language for music patterns.

- **Web Integration:** **Native**. Built for the browser.
- **Interactivity:** **Extreme**. Changes to code can update the sound in real-time without stopping.
- **Rendering:** Great for visualizers (Piano, Oscilloscopes) and highlighting active code.
- **Child-Friendly:** Medium-High. The looping nature is very rewarding, but the syntax can get complex.
- **Use Case:** Modern live coding and exploring rhythmic structures.

## 3. CSound
The "Grandfather" of music synthesis. Focuses on the physics of sound.

- **Web Integration:** **Good** (via `csound-wasm`).
- **Interactivity:** Medium. Traditionally a "compile-then-play" workflow, though WASM has made it more real-time.
- **Rendering:** Mostly focused on the audio waveform rather than notation.
- **Child-Friendly:** Low. Requires understanding Hertz (440Hz), oscillators, and envelopes.
- **Use Case:** Deep sound design and academic electronic music.

## 4. MML (Music Macro Language)
A retro syntax popular in early Japanese home computers and game music.

- **Web Integration:** **High** (many lightweight JS parsers available).
- **Interactivity:** High. Very fast to parse and play.
- **Rendering:** Usually none; it’s a "blind" stream of MIDI-like commands.
- **Child-Friendly:** Medium. `T120 L4 CDEFG` is easy to understand, but it gets cryptic quickly.
- **Use Case:** Chiptune music and retro-style games.

## 5. Alda
A modern programming language for musicians.

- **Web Integration:** **Low**. It typically requires a Clojure-based backend or a complex WASM setup to run in the browser.
- **Interactivity:** High (in a CLI/Desktop environment).
- **Rendering:** None natively.
- **Child-Friendly:** High (syntax-wise). `piano: c d e` is the most human-readable syntax on this list.
- **Use Case:** Composing full orchestral scores using code.

## 6. LilyPond
The "LaTeX" of music notation. Focuses on high-quality printing.

- **Web Integration:** **Low**. Usually requires server-side processing to generate SVGs or PDFs.
- **Interactivity:** Low. Very slow feedback loop.
- **Rendering:** **Masterpiece-level**. Produces the most beautiful sheet music in the world.
- **Child-Friendly:** Low. The syntax is very verbose and precise.
- **Use Case:** Publishing sheet music and complex archival scoring.

---

## Summary for "Strudel Kids Lab"

For an educational environment for children, a **Hybrid of ABC and Strudel** is recommended:
- **ABC** for learning to read and visualize traditional notation.
- **Strudel** for the "magic" of programming, looping, and seeing the piano light up.
