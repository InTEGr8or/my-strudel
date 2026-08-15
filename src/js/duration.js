(function (root) {
  /**
   * Classify a duration in quarter-note beats for staff rendering.
   * Dotted values are named explicitly so tests can assert them.
   */
  const DURATION_CATALOG = [
    { name: 'breve', beats: 8, dotted: false, hollow: true, stem: false, flags: 0 },
    { name: 'dotted-whole', beats: 6, dotted: true, hollow: true, stem: false, flags: 0 },
    { name: 'whole', beats: 4, dotted: false, hollow: true, stem: false, flags: 0 },
    { name: 'dotted-half', beats: 3, dotted: true, hollow: true, stem: true, flags: 0 },
    { name: 'half', beats: 2, dotted: false, hollow: true, stem: true, flags: 0 },
    { name: 'dotted-quarter', beats: 1.5, dotted: true, hollow: false, stem: true, flags: 0 },
    { name: 'quarter', beats: 1, dotted: false, hollow: false, stem: true, flags: 0 },
    { name: 'triplet-quarter', beats: 2 / 3, dotted: false, hollow: false, stem: true, flags: 0 },
    { name: 'dotted-eighth', beats: 0.75, dotted: true, hollow: false, stem: true, flags: 1 },
    { name: 'eighth', beats: 0.5, dotted: false, hollow: false, stem: true, flags: 1 },
    { name: 'triplet-eighth', beats: 1 / 3, dotted: false, hollow: false, stem: true, flags: 1 },
    { name: 'dotted-sixteenth', beats: 0.375, dotted: true, hollow: false, stem: true, flags: 2 },
    { name: 'sixteenth', beats: 0.25, dotted: false, hollow: false, stem: true, flags: 2 },
    { name: 'triplet-sixteenth', beats: 1 / 6, dotted: false, hollow: false, stem: true, flags: 2 },
    { name: 'thirty-second', beats: 0.125, dotted: false, hollow: false, stem: true, flags: 3 },
  ];

  function classifyDuration(dur) {
    const d = dur === undefined || dur === null ? 1 : Number(dur);
    if (!Number.isFinite(d) || d <= 0) {
      return Object.assign({ beats: 1 }, DURATION_CATALOG.find((c) => c.name === 'quarter'));
    }
    let best = DURATION_CATALOG[0];
    let bestErr = Infinity;
    for (let i = 0; i < DURATION_CATALOG.length; i++) {
      const c = DURATION_CATALOG[i];
      const err = Math.abs(d - c.beats);
      const closer = err < bestErr - 1e-9;
      const sameButPreferPlain = Math.abs(err - bestErr) < 1e-9 && c.dotted === false && best.dotted === true;
      if (closer || sameButPreferPlain) {
        best = c;
        bestErr = err;
      }
    }
    return Object.assign({ beats: d }, best);
  }

  root.classifyDuration = classifyDuration;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { classifyDuration };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
