# My Strudel Project Plan

## Overview
A minimalist, personal music live-coding environment built with [11ty](https://www.11ty.dev/) and the [Strudel](https://strudel.cc/) REPL web component. This project allows for local organization of Strudel and TidalCycles patterns in a directory-based structure while providing a fast, web-based playback and editing interface.

## Current State
- **Engine**: Using `@strudel/repl` web component via unpkg CDN.
- **SSG**: 11ty (Eleventy) v3.
- **Directory Structure**:
  - `src/songs/`: Primary location for `.strudel` and `.tidal` files.
  - `src/_includes/layout.njk`: Main template for song pages.
  - `src/index.njk`: Home page listing all discovered songs.
- **Features**:
  - Automatic song discovery with recursive directory support.
  - Metadata extraction (e.g., `@title` tags) from song comments.
  - Integrated CodeMirror editor with keyboard controls (`Ctrl+Enter` to play).
  - Basic Sidebar for quick reference.
  - Audio context initialization handling.

## Key Configuration Details
- **11ty Extension**: Custom extension for `.strudel` and `.tidal` files in `eleventy.config.js`.
- **Environment**: A `window.process` polyfill is injected in the layout to satisfy `nanostores` dependencies.
- **Code Loading**: Code is passed from 11ty to the browser via a `<template>` tag and injected into the REPL component using a polling `setInterval` to handle component initialization timing.

## Roadmap & Next Steps
- [ ] **Sidebar Enhancements**: Implement a fully functional "Sounds" tab that lists available sample banks and a "Reference" tab with common functions.
- [ ] **Local Samples**: Investigate integration with the `strudel-sampler` or local filesystem via the Tauri bridge if moved to a desktop app context.
- [ ] **Metadata Expansion**: Support more tags like `@by`, `@genre`, and `@version` in the UI.
- [ ] **UI Polish**: Improve the "Songs Browser" on the home page with better grouping and perhaps search/filter capabilities.
- [ ] **Version Control**: Move `my-strudel` into its own Git repository to track music changes independently of the Strudel engine.

## Troubleshooting / Knowledge Base
- **Empty Editor**: If the editor is empty, check the `setInterval` logic in `layout.njk` that calls `repl.editor.setCode()`.
- **Audio Error**: Ensure `initAudioOnFirstClick` is called from the `@strudel/webaudio` module or via the `repl.editor` internal state.
- **Duplicate Core**: Avoid importing `@strudel/core` separately if using the bundled `@strudel/repl` script, as it includes core.
