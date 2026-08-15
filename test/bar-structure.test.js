const fs = require('fs');
const path = require('path');
const { parseAbc } = require('../src/shared/parse-abc');

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL: ' + message);
    process.exitCode = 1;
  } else {
    console.log('PASS: ' + message);
  }
}

// Bar validation helper: checks that notes + rests in every bar sum to timeSig.top beats
function validateBars(events, timeSig) {
  const beatsPerBar = timeSig.top;
  const errors = [];
  if (!events || events.length === 0) return errors;

  const sorted = events.slice().sort((a, b) => a.startBeat - b.startBeat);
  const totalBeats = sorted[sorted.length - 1].startBeat + sorted[sorted.length - 1].duration;

  for (let barStart = 0, barIndex = 0; barStart < totalBeats - 0.01; barStart += beatsPerBar, barIndex++) {
    const barEnd = barStart + beatsPerBar;
    const barEvents = sorted.filter(e => e.startBeat >= barStart - 0.001 && e.startBeat < barEnd - 0.001);
    if (barEvents.length === 0) continue;

    const uniqueBeats = new Map();
    barEvents.forEach(e => {
      uniqueBeats.set(e.startBeat, Math.max(uniqueBeats.get(e.startBeat) || 0, e.duration));
    });
    const totalDur = Array.from(uniqueBeats.values()).reduce((a, b) => a + b, 0);
    if (Math.abs(totalDur - beatsPerBar) > 0.05) {
      errors.push({ barIndex, barStart, totalDur, expected: beatsPerBar, eventCount: barEvents.length });
    }
  }
  return errors;
}

// --- Tests ---

// Test MuseScore converted score bar structure
(function testMuseScoreStructure() {
  const abc = `X:1\nT:Test MuseScore Score\nM:4/4\nL:1/16\nK:C\n| e4 d4 c4 B4 | c8 e8 |]`;
  const result = parseAbc(abc);
  assert(result.timeSignature.top === 4, 'Score: time sig top is 4');
  assert(result.timeSignature.bottom === 4, 'Score: time sig bottom is 4');
  assert(result.notes.length === 6, `Score: has 6 notes, got ${result.notes.length}`);
  const errors = validateBars(result.events, result.timeSignature);
  assert(errors.length === 0, `Score: all bars correct. Errors: ${JSON.stringify(errors)}`);
})();

// 5. Test notes + rests structure on MuseScore converted ABC files
(function testMuseScoreRestSummation() {
  const musescoreDir = path.join(__dirname, '..', 'src', 'songs', 'sight-reading', 'songs', 'musescore');
  if (!fs.existsSync(musescoreDir)) return;

  const files = fs.readdirSync(musescoreDir).filter(f => f.endsWith('.abc'));
  for (const file of files) {
    const content = fs.readFileSync(path.join(musescoreDir, file), 'utf-8');
    const result = parseAbc(content);
    assert(result.notes.length > 0, `MuseScore ${file}: has notes (${result.notes.length})`);
    assert(result.keySignature !== undefined, `MuseScore ${file}: has key signature`);
    assert(result.timeSignature !== null, `MuseScore ${file}: has time signature (${result.timeSignature.top}/${result.timeSignature.bottom})`);
    assert(result.rests !== undefined, `MuseScore ${file}: has rests array (${result.rests.length} rests)`);
  }
})();

console.log('\nDone.');
if (process.exitCode) {
  console.log('Some tests FAILED.');
} else {
  console.log('All tests PASSED.');
}
