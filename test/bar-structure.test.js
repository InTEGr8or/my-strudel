const { parseAbc } = require('../src/shared/parse-abc');

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL: ' + message);
    process.exitCode = 1;
  } else {
    console.log('PASS: ' + message);
  }
}

// Bar validation helper: groups notes into bars based on startBeat and
// time signature, then checks that each bar's total duration matches.
function validateBars(notes, timeSig) {
  const beatsPerBar = timeSig.top;
  const unit = timeSig.bottom; // e.g. 4 = quarter note gets 1 beat
  const errors = [];
  if (notes.length === 0) return errors;

  notes.sort((a, b) => a.startBeat - b.startBeat);
  let barStart = 0;
  let barEnd = barStart + beatsPerBar;
  let barIndex = 0;
  let i = 0;

  while (i < notes.length) {
    const barNotes = [];
    while (i < notes.length && notes[i].startBeat < barEnd) {
      barNotes.push(notes[i]);
      i++;
    }

    if (barNotes.length === 0) {
      barStart = barEnd;
      barEnd = barStart + beatsPerBar;
      barIndex++;
      continue;
    }

    let totalDuration = 0;
    for (const n of barNotes) {
      totalDuration += n.duration;
    }

    if (Math.abs(totalDuration - beatsPerBar) > 0.01) {
      errors.push({
        barIndex,
        barNotes: barNotes.map(n => ({ note: n.note + n.oct, startBeat: n.startBeat, duration: n.duration })),
        totalDuration,
        expectedDuration: beatsPerBar,
      });
    }

    barStart = barEnd;
    barEnd = barStart + beatsPerBar;
    barIndex++;
  }

  return errors;
}

// --- Tests ---

// 1. Ode to Joy — M:4/4, L:1/8 → 8 eighth notes per bar, each 0.5 beats
(function testOdeToJoy() {
  const abc = `X:1\nT:Ode to Joy\nM:4/4\nL:1/8\nK:C\n| E E F G | G F E D | C C D E | E D2 D2 |`;
  const result = parseAbc(abc);
  assert(result.timeSignature.top === 4, 'Ode: time sig top is 4');
  assert(result.timeSignature.bottom === 4, 'Ode: time sig bottom is 4');
  assert(result.notes.length > 0, 'Ode: has notes');

  // Each note should be 0.5 beats (L:1/8)
  for (const n of result.notes.slice(0, 8)) {
    assert(Math.abs(n.duration - 0.5) < 0.01,
      `Ode: note ${n.note}${n.oct} at beat ${n.startBeat} has duration ${n.duration} (expected 0.5)`);
  }

  // First 8 notes should span beats 0–3.5 (one bar in 4/4)
  assert(result.notes[0].startBeat === 0, 'Ode: first note at beat 0');
  assert(result.notes[7].startBeat === 3.5, 'Ode: 8th note at beat 3.5');
  assert(result.notes[8].startBeat === 4, 'Ode: 9th note starts bar 2 at beat 4');

  // First bar must be exactly 4 beats (8 eighth notes)
  const firstBarNotes = result.notes.filter(n => n.startBeat < result.timeSignature.top);
  assert(firstBarNotes.length === 8,
    `Ode: 8 notes in first bar (4/4, L:1/8), got ${firstBarNotes.length}`);
  const firstBarDur = firstBarNotes.reduce((s, n) => s + n.duration, 0);
  assert(Math.abs(firstBarDur - 4) < 0.01,
    `Ode: first bar duration is 4.0, got ${firstBarDur}`);
})();

// 2. Twinkle Twinkle — M:2/4, L:1/4 → 2 quarter notes per bar
(function testTwinkle() {
  const abc = `X:1\nT:Twinkle\nM:2/4\nL:1/4\nK:C\n| C C G G | A A G2 | F F E E | D D C2 |`;
  const result = parseAbc(abc);
  assert(result.timeSignature.top === 2, 'Twinkle: time sig top is 2');
  assert(result.timeSignature.bottom === 4, 'Twinkle: time sig bottom is 4');

  // Each note should be 1 beat (L:1/4) or 2 beats (the "2" notes)
  assert(Math.abs(result.notes[0].duration - 1) < 0.01, 'Twinkle: first note duration 1');
  assert(Math.abs(result.notes[6].duration - 2) < 0.01, 'Twinkle: G2 at index 6 has duration 2, got ' + result.notes[6].duration);

  // Bar validation
  const errors = validateBars(result.notes, result.timeSignature);
  assert(errors.length === 0,
    `Twinkle: all bars correct. Errors: ${JSON.stringify(errors)}`);
})();

// 3. Mary Had a Little Lamb — M:2/4, L:1/8 → 4 eighth notes per bar (2 beats)
(function testMary() {
  const abc = `X:1\nT:Mary\nM:2/4\nL:1/8\nK:C\n| E D C D | E E E2 | D D D2 | E G G2 |\n| E D C D | E4 | E2 E2 | D D E D | C4 |`;
  const result = parseAbc(abc);
  assert(result.timeSignature.top === 2, 'Mary: time sig top is 2');
  assert(result.timeSignature.bottom === 4, 'Mary: time sig bottom is 4');

  // Each note should be 0.5 beats (L:1/8)
  assert(Math.abs(result.notes[0].duration - 0.5) < 0.01, 'Mary: first note duration 0.5');

  // Note count in first bar: notes with startBeat < 2
  const firstBarNotes = result.notes.filter(n => n.startBeat < 2);
  assert(firstBarNotes.length === 4, `Mary: 4 notes in first bar, got ${firstBarNotes.length}`);

  const errors = validateBars(result.notes, result.timeSignature);
  assert(errors.length === 0,
    `Mary: all bars correct. Errors: ${JSON.stringify(errors)}`);
})();

// 4. Jingle Bells — M:4/4, L:1/4 → 4 quarter notes per bar
(function testJingle() {
  const abc = `X:1\nT:Jingle\nM:4/4\nL:1/4\nK:C\nE E E E E E E G C D E |\nF F F F F E E E E E D D E D G |`;
  const result = parseAbc(abc);
  assert(result.timeSignature.top === 4, 'Jingle: time sig top is 4');
  assert(result.timeSignature.bottom === 4, 'Jingle: time sig bottom is 4');

  // Each note should be 1 beat (L:1/4)
  assert(Math.abs(result.notes[0].duration - 1) < 0.01, 'Jingle: first note duration 1');
  assert(Math.abs(result.notes[0].startBeat - 0) < 0.01, 'Jingle: first note at beat 0');
  // Note: Jingle ABC has no bar checks — the source data doesn't align with M:4/4
})();

// 5. Minuet in G — M:3/4, L:1/8 → 6 eighth notes per bar (3 beats)
(function testMinuet() {
  const abc = `X:1\nT:Minuet\nM:3/4\nL:1/8\nK:C\n| G A B c | d c B A | G F E D | E F G G |\n| A G F E | D C D E | D2 C4 |`;
  const result = parseAbc(abc);
  assert(result.timeSignature.top === 3, 'Minuet: time sig top is 3');
  assert(result.timeSignature.bottom === 4, 'Minuet: time sig bottom is 4');

  const errors = validateBars(result.notes, result.timeSignature);
  assert(errors.length === 0,
    `Minuet: all bars correct. Errors: ${JSON.stringify(errors)}`);
})();

console.log('\nDone.');
if (process.exitCode) {
  console.log('Some tests FAILED.');
} else {
  console.log('All tests PASSED.');
}
