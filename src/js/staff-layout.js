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
      BASS_BOTTOM: BASS_BOTTOM,
      TREBLE_TOP: TREBLE_TOP,
      MIDDLE_C: MIDDLE_C,
    };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
