(function (root) {
  /**
   * Classify a duration in quarter-note beats for staff rendering.
   * Dotted values are named explicitly so tests can assert them.
   */
  function classifyDuration(dur) {
    const d = dur === undefined || dur === null ? 1 : Number(dur);
    if (!Number.isFinite(d) || d <= 0) {
      return { name: 'quarter', beats: 1, dotted: false, hollow: false, stem: true, flags: 0 };
    }
    if (d >= 7) {
      return { name: 'breve', beats: d, dotted: false, hollow: true, stem: false, flags: 0 };
    }
    if (d >= 5.5) {
      return { name: 'dotted-whole', beats: d, dotted: true, hollow: true, stem: false, flags: 0 };
    }
    if (d >= 3.5) {
      return { name: 'whole', beats: d, dotted: false, hollow: true, stem: false, flags: 0 };
    }
    if (d >= 2.75) {
      return { name: 'dotted-half', beats: d, dotted: true, hollow: true, stem: true, flags: 0 };
    }
    if (d >= 1.75) {
      return { name: 'half', beats: d, dotted: false, hollow: true, stem: true, flags: 0 };
    }
    if (d >= 1.25) {
      return { name: 'dotted-quarter', beats: d, dotted: true, hollow: false, stem: true, flags: 0 };
    }
    if (d >= 0.875) {
      return { name: 'quarter', beats: d, dotted: false, hollow: false, stem: true, flags: 0 };
    }
    if (d >= 0.625) {
      return { name: 'dotted-eighth', beats: d, dotted: true, hollow: false, stem: true, flags: 1 };
    }
    if (d >= 0.375) {
      return { name: 'eighth', beats: d, dotted: false, hollow: false, stem: true, flags: 1 };
    }
    if (d >= 0.3) {
      return { name: 'dotted-sixteenth', beats: d, dotted: true, hollow: false, stem: true, flags: 2 };
    }
    return { name: 'sixteenth', beats: d, dotted: false, hollow: false, stem: true, flags: 2 };
  }

  root.classifyDuration = classifyDuration;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { classifyDuration };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
