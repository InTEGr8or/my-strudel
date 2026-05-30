# Tape head timing-based note scrolling trainer

Replace the current "press correct key to advance" trainer mechanic with a BPM-driven tape head system:

- **Fixed HEAD line** at 10% from the left edge of the staff
- **Notes scroll right-to-left** at BPM rate using requestAnimationFrame or CSS transitions
- **Hit detection**: Notes become target when crossing HEAD; played correctly = score, missed beyond threshold = auto-advance
- **Metronome integration**: BPM slider drives both metronome click and scroll speed. Slider 3x wider with +/- buttons.
- **Implementation**: Can be new mode in trainer.js (`config.mode: 'tape-head'`) or full migration. Decide during implementation.
- **Note-bar visualization**: Staff bars and note heads move together, HEAD stays fixed.

## Completion Criteria

- HEAD line renders at ~10% from left of staff, notes scroll right-to-left at BPM speed
- Correct note detection works when note crosses HEAD; missed notes auto-advance after threshold
- +/- BPM buttons work, BPM slider is 3x wider (from 70px to ~210px)
- Existing lesson tests still pass
- New Playwright test verifies tape head rendering and scroll
