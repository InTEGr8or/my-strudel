(function (root) {
  /**
   * Horizontal/vertical staff geometry.
   * Left: 50px margin, then brace, then a dedicated key-signature column,
   * then clef, time, color guide, then notes.
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
    var keyX = STAFF_L + BRACE_W + KEY_COL_W / 2;
    var keyColRight = STAFF_L + BRACE_W + KEY_COL_W;
    var clefX = keyColRight + 4 * s;
    var timeX = clefX + CLEF_W;
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
      keyColRight: keyColRight,
      clefX: clefX,
      timeX: timeX,
      COLOR_X: COLOR_X,
      COLOR_W: COLOR_W,
      LEFT_PAD: LEFT_PAD,
    };
  }

  root.computeStaffLayout = computeStaffLayout;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { computeStaffLayout };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
