---
layout: layout.njk
title: Mary Had a Little Lamb - Lesson 1
---

# Mary Had a Little Lamb

Welcome to your first Strudel lesson! We're going to learn how a simple melody maps from sheet music to Strudel code.

## The Melody

Here is the melody for the first phrase of the song. Notice how the notes go down (`E` -> `D` -> `C`) and then back up.

```abc
T: Mary's First Phrase
M: 4/4
L: 1/4
K: C
e2 d2 | c2 d2 | e e e2 |
```

## Mapping to Strudel

In Strudel, we use strings to represent these notes. 

1. **Notes**: `e4` means the note E in the 4th octave.
2. **Timing**: In Strudel, every note in a string takes up an equal amount of time by default.

Look at the code below. We've defined the `theme` as a string of notes:
`"e4 d4 c4 d4 e4 e4 e4"`

Notice how we repeat `e4` three times at the end to match the "lamb, lamb, lamb" part of the lyrics!

### Try This:
1. Change the notes in the editor below.
2. Try changing `e4` to `g4` and see how it sounds.
3. Hit **Play** to hear your changes.
