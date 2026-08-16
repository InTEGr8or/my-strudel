(function (root) {
  /**
   * Horizontal/vertical staff geometry.
   * Left: 50px margin, brace, clef at the original offset, then a
   * key-signature column to the RIGHT of the clef. Time, color guide,
   * and notes shift right by that column width.
   */
  function computeStaffLayout(scale) {
    var s = scale || 1;
    var LEFT_MARGIN = 50 * s;
    var KEY_COL_W = 28 * s;
    var BRACE_W = 12 * s;
    var CLEF_W = 42 * s;
    var TIME_W = 32 * s;
    var COLOR_W = 50 * s;
    var TOP_PAD = 120 * s;
    var BOT_PAD = (80 + 75) * s;
    var SVG_W = 1200 * s;

    var STAFF_L = LEFT_MARGIN;
    // Original clef sat at 15px from the staff's left edge.
    var clefX = STAFF_L + 15 * s;
    var keyColLeft = clefX + CLEF_W;
    var keyX = keyColLeft + KEY_COL_W / 2;
    var keyColRight = keyColLeft + KEY_COL_W;
    var timeX = keyColRight + 8 * s;
    var COLOR_X = timeX + TIME_W;
    var LEFT_PAD = COLOR_X + COLOR_W + 10 * s;
    var STAFF_R = SVG_W - 20 * s;

    return {
      scale: s,
      LEFT_MARGIN: LEFT_MARGIN,
      KEY_COL_W: KEY_COL_W,
      BRACE_W: BRACE_W,
      TOP_PAD: TOP_PAD,
      BOT_PAD: BOT_PAD,
      BOT_EXTRA: 75 * s,
      SVG_W: SVG_W,
      STAFF_L: STAFF_L,
      STAFF_R: STAFF_R,
      keyX: keyX,
      keyColLeft: keyColLeft,
      keyColRight: keyColRight,
      clefX: clefX,
      timeX: timeX,
      COLOR_X: COLOR_X,
      COLOR_W: COLOR_W,
      LEFT_PAD: LEFT_PAD,
    };
  }

  const STAFF_NI = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  const STAFF_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const BASS_BOTTOM = 2 * 7 + 4; // G2
  const TREBLE_TOP = 5 * 7 + 3; // F5
  const MIDDLE_C = 4 * 7 + 0; // C4

  function staffIndex(note, oct) {
    return oct * 7 + (STAFF_NI[note] || 0);
  }

  function indexToPitch(idx) {
    const oct = Math.floor(idx / 7);
    const note = STAFF_LETTERS[((idx % 7) + 7) % 7];
    return { note: note, oct: oct };
  }

  /**
   * Staff-line indices that need ledger lines for this pitch.
   * B2 is on the bass staff (no ledger). C4 gets the middle-C line.
   * Below G2: E2, C2, A1, …  Above F5: A5, C6, E6, …
   */
  function ledgerStaffIndices(note, oct) {
    const ni = staffIndex(note, oct);
    const lines = [];
    if (ni === MIDDLE_C) return [MIDDLE_C];
    if (ni < BASS_BOTTOM) {
      for (let line = BASS_BOTTOM - 2; line >= ni; line -= 2) lines.push(line);
    } else if (ni > TREBLE_TOP) {
      for (let line = TREBLE_TOP + 2; line <= ni; line += 2) lines.push(line);
    }
    return lines;
  }

  /**
   * Bar length in quarter-note beats (same unit as startBeat).
   * 4/4 → 4, 3/4 → 3, 2/2 → 4, 6/8 → 3, 5/4 → 5.
   */
  function quarterBeatsPerBar(ts) {
    if (!ts || !ts.top) return 4;
    var bottom = ts.bottom || 4;
    if (bottom <= 0) return ts.top;
    return ts.top * (4 / bottom);
  }

  /**
   * First unmatched note at the current onset with this MIDI pitch.
   * Used so three near-simultaneous note-ons can each claim a chord member.
   */
  function matchMidiAtOnset(notes, playedSet, missedSet, midiNote, waitBeat, posToMidi) {
    if (!notes || typeof posToMidi !== 'function' || typeof midiNote !== 'number') return -1;
    var best = -1;
    for (var i = 0; i < notes.length; i++) {
      if (playedSet && playedSet.has(i)) continue;
      if (missedSet && missedSet.has(i)) continue;
      if (waitBeat != null && Math.abs(notes[i].startBeat - waitBeat) > 0.05) continue;
      if (posToMidi(notes[i]) !== midiNote) continue;
      if (best === -1 || notes[i].startBeat < notes[best].startBeat) best = i;
    }
    return best;
  }

  var SCALE_MIDI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var SHARP_PC = [
    ['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0], ['F', 0],
    ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['B', 0],
  ];
  var FLAT_PC = [
    ['C', 0], ['D', -1], ['D', 0], ['E', -1], ['E', 0], ['F', 0],
    ['G', -1], ['G', 0], ['A', -1], ['A', 0], ['B', -1], ['B', 0],
  ];

  function midiOfNote(n) {
    if (!n) return null;
    if (typeof n.midi === 'number') return n.midi;
    var step = SCALE_MIDI[n.note];
    if (step === undefined) return null;
    return (n.oct + 1) * 12 + step + (n.alter || 0);
  }

  function keyPrefersFlats(keySig) {
    return !!(keySig && keySig.some(function (k) { return k.acc === 'flat'; }));
  }

  function keyPrefersSharps(keySig) {
    return !!(keySig && keySig.some(function (k) { return k.acc === 'sharp'; }));
  }

  function spellMidiForKey(midi, keySig) {
    var table = keyPrefersFlats(keySig) ? FLAT_PC : SHARP_PC;
    var oct = Math.floor(midi / 12) - 1;
    var pair = table[((midi % 12) + 12) % 12];
    return { note: pair[0], oct: oct, alter: pair[1] };
  }

  function spellNoteForKey(n, keySig) {
    if (!n) return n;
    if (n.accidental === 'natural') {
      return { note: n.note, oct: n.oct, alter: 0, accidental: 'natural' };
    }
    var midi = midiOfNote(n);
    if (midi == null || (!keyPrefersFlats(keySig) && !keyPrefersSharps(keySig))) {
      return n;
    }
    var spelled = spellMidiForKey(midi, keySig);
    return {
      note: spelled.note,
      oct: spelled.oct,
      alter: spelled.alter,
      accidental: spelled.alter === 1 ? 'sharp' : (spelled.alter === -1 ? 'flat' : null),
      midi: midi,
    };
  }

  function staffNoteLabel(n, keySig) {
    if (!n || !n.note) return '';
    var s = spellNoteForKey(n, keySig);
    var glyph = '';
    if (s.accidental === 'natural') glyph = '♮';
    else if (s.accidental === 'double-sharp' || s.alter === 2) glyph = '𝄪';
    else if (s.accidental === 'double-flat' || s.alter === -2) glyph = '𝄫';
    else if (s.accidental === 'sharp' || s.alter === 1) glyph = '♯';
    else if (s.accidental === 'flat' || s.alter === -1) glyph = '♭';
    return s.note.toUpperCase() + glyph + String(s.oct);
  }

  function nextUnplayedStartBeat(notes, playedSet, missedSet) {
    if (!notes || notes.length === 0) return null;
    var next = Infinity;
    for (var i = 0; i < notes.length; i++) {
      if (playedSet && playedSet.has(i)) continue;
      if (missedSet && missedSet.has(i)) continue;
      if (notes[i].startBeat < next) next = notes[i].startBeat;
    }
    return next === Infinity ? null : next;
  }

  /**
   * Pitch span of a note list. totalSpan is the whole piece;
   * maxColumnSpan is the widest simultaneous attack (same startBeat).
   * A 32-key board can play the piece in one octave offset when
   * totalSpan <= high-low and every column fits that window.
   */
  function analyzeNoteRange(notes) {
    var min = Infinity;
    var max = -Infinity;
    var maxSpan = 0;
    var byBeat = {};
    if (!notes) notes = [];
    for (var i = 0; i < notes.length; i++) {
      var midi = notes[i] && notes[i].midi;
      if (typeof midi !== 'number') continue;
      if (midi < min) min = midi;
      if (midi > max) max = midi;
      var key = Math.round(notes[i].startBeat * 100);
      if (!byBeat[key]) byBeat[key] = { min: midi, max: midi };
      else {
        if (midi < byBeat[key].min) byBeat[key].min = midi;
        if (midi > byBeat[key].max) byBeat[key].max = midi;
      }
    }
    var keys = Object.keys(byBeat);
    for (var k = 0; k < keys.length; k++) {
      var col = byBeat[keys[k]];
      var span = col.max - col.min;
      if (span > maxSpan) maxSpan = span;
    }
    var empty = min === Infinity;
    return {
      minMidi: empty ? null : min,
      maxMidi: empty ? null : max,
      totalSpan: empty ? 0 : max - min,
      maxColumnSpan: maxSpan,
    };
  }

  function fitsKeyboard(notes, low, high) {
    var range = analyzeNoteRange(notes);
    if (range.minMidi == null) return true;
    var window = high - low;
    return range.totalSpan <= window && range.maxColumnSpan <= window;
  }

  function fitsKeyboardAbsolute(notes, low, high) {
    var range = analyzeNoteRange(notes);
    if (range.minMidi == null) return true;
    return range.minMidi >= low && range.maxMidi <= high;
  }

  function noteStaff(n) {
    if (n && n.voice !== undefined && n.voice !== null) {
      return n.voice === 0 ? 'treble' : 'bass';
    }
    return n && n.oct >= 4 ? 'treble' : 'bass';
  }

  root.computeStaffLayout = computeStaffLayout;
  root.staffIndex = staffIndex;
  root.indexToPitch = indexToPitch;
  root.ledgerStaffIndices = ledgerStaffIndices;
  root.noteStaff = noteStaff;
  root.quarterBeatsPerBar = quarterBeatsPerBar;
  root.nextUnplayedStartBeat = nextUnplayedStartBeat;
  root.analyzeNoteRange = analyzeNoteRange;
  root.fitsKeyboard = fitsKeyboard;
  root.fitsKeyboardAbsolute = fitsKeyboardAbsolute;
  root.matchMidiAtOnset = matchMidiAtOnset;
  root.staffNoteLabel = staffNoteLabel;
  root.spellNoteForKey = spellNoteForKey;
  root.spellMidiForKey = spellMidiForKey;
  root.BASS_BOTTOM = BASS_BOTTOM;
  root.TREBLE_TOP = TREBLE_TOP;
  root.MIDDLE_C = MIDDLE_C;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      computeStaffLayout: computeStaffLayout,
      staffIndex: staffIndex,
      indexToPitch: indexToPitch,
      ledgerStaffIndices: ledgerStaffIndices,
      noteStaff: noteStaff,
      quarterBeatsPerBar: quarterBeatsPerBar,
      nextUnplayedStartBeat: nextUnplayedStartBeat,
      analyzeNoteRange: analyzeNoteRange,
      fitsKeyboard: fitsKeyboard,
      fitsKeyboardAbsolute: fitsKeyboardAbsolute,
      matchMidiAtOnset: matchMidiAtOnset,
      staffNoteLabel: staffNoteLabel,
      spellNoteForKey: spellNoteForKey,
      spellMidiForKey: spellMidiForKey,
      BASS_BOTTOM: BASS_BOTTOM,
      TREBLE_TOP: TREBLE_TOP,
      MIDDLE_C: MIDDLE_C,
    };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
