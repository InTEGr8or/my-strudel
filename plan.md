# My Strudel Project Plan: Kids Lab Edition

## Overview
A fun, educational music live-coding environment built for children (and grandfathers!). It uses [11ty](https://www.11ty.dev/) and the [Strudel](https://strudel.cc/) REPL to bridge the gap between code, traditional music notation (ABC), and physical piano keys.

## Current State: "Strudel Kids Lab"
- **Engine**: Latest `@strudel/repl` web component via unpkg.
- **Visuals**: 
  - **Visual Piano**: An interactive keyboard that lights up as code plays.
  - **ABC Notation**: Standard sheet music rendering (via `abcjs`) that automatically adapts to Dark/Light themes.
  - **Kid-Friendly UI**: High-contrast colors, large buttons, and "Comic Sans" for readability and fun.
- **SSG**: 11ty (Eleventy) v3 with automated GitHub Pages deployment.
- **Theme Support**: Full adaptive Dark/Light mode support via CSS variables.
- **Features**:
  - **Lesson Folders**: Support for `index.md` documentation alongside `song.strudel` code.
  - **Sound Previews**: Clickable sound names in the sidebar to hear `bd`, `sd`, etc., instantly.
  - **Collapsible Sidebar**: Toggleable help panel to maximize workspace.

## Roadmap & Next Steps
- [ ] **Reference Tab**: Fully populate the "Ref" tab with easy-to-understand explanations of functions like `slow()`, `fast()`, `stack()`, and `note()`.
- [ ] **Interactive Lessons**: Expand the "sketches" into a series of progressive lessons (e.g., "Notes", "Rhythms", "Layers", "Chords").
- [ ] **Oscilloscope**: Add a waveform or spectrum visualizer to show the "shape" of the sound alongside the piano keys.
- [ ] **Local Samples**: Investigate integration with the `strudel-sampler` to allow using custom sound libraries or recorded voices.
- [ ] **Song Metadata**: Support and display tags like `@by`, `@genre`, and `@version` in a nice header card for each lesson.
- [ ] **Search & Filter**: Add a simple search bar to the "Dashboard" home page as the collection grows.

## Knowledge Base
- **ABC Notation**: Use ` ```abc ` code blocks in Markdown. The layout automatically renders these using `abcjs` and applies a dark-mode filter if needed.
- **Piano Sync**: The visual piano is "monkey-patched" into the Strudel `onDraw` cycle to ensure perfect timing with the audio.
- **Path Prefixing**: The site uses `EleventyHtmlBasePlugin` and conditional `pathPrefix` in `eleventy.config.js` to ensure navigation works both locally and on GitHub Pages (`/my-strudel/`).
- **Code Injection**: Raw code is read from `<template>` tags using `.content.textContent` to prevent HTML entity escaping (e.g., `<` staying as `<` instead of `&lt;`).