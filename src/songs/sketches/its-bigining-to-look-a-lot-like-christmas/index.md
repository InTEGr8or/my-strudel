---
layout: layout.njk
title: It's Beginning To Look a Lot Like Christmas
---

# It's Beginning To Look a Lot Like Christmas

Let's look at how we can play two things at the same time: the **Melody** (the high notes we sing) and the **Bass** (the low notes that keep the beat).

## Grand Staff Notation

In music, we often use two sets of lines (staves). The top one is the **Treble Clef** for high notes, and the bottom one is the **Bass Clef** for low notes.

Notice the bar where the high note is **E** and the low note is **A**. They line up vertically!

```abc
X:1
T:It's Beginning To Look a Lot Like Christmas
M:4/4
L:1/4
K:C
V:1 name="Treble"
V:2 name="Bass" clef=bass
[V:1] G | C E G c | e3 d | c B A B | c G
[V:2] z | C,2 E,2 | A,,2 z2 | G,,2 z2 | C,2 z
```

## How to read the code

When we want to play these together in Strudel, we use a `stack`. 

1. The first part of the `stack` is our melody.
2. The second part is our bass line.

Notice how the `A2` in the bass happens at the same time as the `e4` in the melody!

### Try This:
1. Hit **PLAY** and watch the piano keys.
2. See if you can find the high **E** and low **A** lighting up at the same time!
3. Try changing the melody notes to make your own version.