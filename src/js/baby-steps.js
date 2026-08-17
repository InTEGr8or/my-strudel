(function (root) {
  var SCALE_MIDI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var STORAGE_KEY = 'baby-steps';

  var STEPS = [
    {
      id: 'singles-five-finger',
      title: 'Five-finger C',
      voices: 1,
      description: 'C D E F G, one note at a time',
    },
    {
      id: 'singles-scale-walk',
      title: 'Walk the C scale',
      voices: 1,
      description: 'C to C and back, still one note at a time',
    },
    {
      id: 'dyads-thirds',
      title: 'Two-note thirds',
      voices: 2,
      description: 'Play both notes in the column together',
    },
    {
      id: 'dyads-i-v',
      title: 'Two-note I and V',
      voices: 2,
      description: 'C–G and neighbors, two keys at once',
    },
    {
      id: 'triads-i-iv-v',
      title: 'Three-note I–IV–V',
      voices: 3,
      description: 'Blocked C, F, and G triads',
    },
  ];

  function midiOf(letter, oct, alter) {
    return (oct + 1) * 12 + SCALE_MIDI[letter] + (alter || 0);
  }

  function makeNote(letter, oct, startBeat, duration) {
    return {
      type: 'note',
      note: letter,
      oct: oct,
      alter: 0,
      midi: midiOf(letter, oct),
      startBeat: startBeat,
      duration: duration || 1,
    };
  }

  function addChord(out, letters, octs, beat, duration) {
    for (var i = 0; i < letters.length; i++) {
      out.push(makeNote(letters[i], octs[i], beat, duration));
    }
  }

  function generateSinglesFiveFinger() {
    var seq = ['C', 'D', 'E', 'F', 'G', 'G', 'F', 'E', 'D', 'C'];
    var notes = [];
    var beat = 0;
    for (var rep = 0; rep < 2; rep++) {
      for (var i = 0; i < seq.length; i++) {
        notes.push(makeNote(seq[i], 4, beat, 1));
        beat += 1;
      }
    }
    return notes;
  }

  function generateSinglesScaleWalk() {
    var up = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    var notes = [];
    var beat = 0;
    function walk() {
      var i;
      for (i = 0; i < up.length; i++) {
        notes.push(makeNote(up[i], 4, beat++, 1));
      }
      notes.push(makeNote('C', 5, beat++, 1));
      notes.push(makeNote('B', 4, beat++, 1));
      for (i = up.length - 2; i >= 0; i--) {
        notes.push(makeNote(up[i], 4, beat++, 1));
      }
    }
    walk();
    walk();
    return notes;
  }

  function generateDyadsThirds() {
    var pairs = [
      [['C', 'E'], [4, 4]],
      [['D', 'F'], [4, 4]],
      [['E', 'G'], [4, 4]],
      [['F', 'A'], [4, 4]],
      [['E', 'G'], [4, 4]],
      [['D', 'F'], [4, 4]],
      [['C', 'E'], [4, 4]],
    ];
    var notes = [];
    var beat = 0;
    for (var rep = 0; rep < 2; rep++) {
      for (var i = 0; i < pairs.length; i++) {
        addChord(notes, pairs[i][0], pairs[i][1], beat, 2);
        beat += 2;
      }
    }
    return notes;
  }

  function generateDyadsIV() {
    var pairs = [
      [['C', 'G'], [4, 4]],
      [['D', 'A'], [4, 4]],
      [['E', 'B'], [4, 4]],
      [['C', 'G'], [4, 4]],
      [['G', 'D'], [3, 4]],
      [['C', 'G'], [4, 4]],
    ];
    var notes = [];
    var beat = 0;
    for (var rep = 0; rep < 2; rep++) {
      for (var i = 0; i < pairs.length; i++) {
        addChord(notes, pairs[i][0], pairs[i][1], beat, 2);
        beat += 2;
      }
    }
    return notes;
  }

  function generateTriads() {
    var chords = [
      [['C', 'E', 'G'], [4, 4, 4]],
      [['C', 'F', 'A'], [4, 4, 4]],
      [['B', 'D', 'G'], [3, 4, 4]],
      [['C', 'E', 'G'], [4, 4, 4]],
    ];
    var notes = [];
    var beat = 0;
    for (var rep = 0; rep < 2; rep++) {
      for (var i = 0; i < chords.length; i++) {
        addChord(notes, chords[i][0], chords[i][1], beat, 2);
        beat += 2;
      }
    }
    return notes;
  }

  var GENERATORS = {
    'singles-five-finger': generateSinglesFiveFinger,
    'singles-scale-walk': generateSinglesScaleWalk,
    'dyads-thirds': generateDyadsThirds,
    'dyads-i-v': generateDyadsIV,
    'triads-i-iv-v': generateTriads,
    'review-triads': generateTriads,
  };

  function getStorage(explicit) {
    if (explicit) return explicit;
    try {
      if (typeof localStorage !== 'undefined') return localStorage;
    } catch (_) {}
    return {
      _data: {},
      getItem: function (k) { return this._data[k] || null; },
      setItem: function (k, v) { this._data[k] = String(v); },
    };
  }

  function loadProgress(storage) {
    var store = getStorage(storage);
    try {
      var raw = store.getItem(STORAGE_KEY);
      var data = raw ? JSON.parse(raw) : {};
      return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    } catch (_) {
      return {};
    }
  }

  function saveProgress(progress, storage) {
    getStorage(storage).setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function isStepComplete(id, storage) {
    var rec = loadProgress(storage)[id];
    return !!(rec && rec.completed);
  }

  function markStepComplete(id, storage) {
    var progress = loadProgress(storage);
    progress[id] = { completed: true, at: new Date().toISOString() };
    saveProgress(progress, storage);
    return progress[id];
  }

  function resetBabySteps(storage) {
    saveProgress({}, storage);
  }

  function nextBabyStep(storage) {
    for (var i = 0; i < STEPS.length; i++) {
      if (!isStepComplete(STEPS[i].id, storage)) return STEPS[i];
    }
    return null;
  }

  function generateBabyStep(id) {
    var gen = GENERATORS[id] || generateSinglesFiveFinger;
    return gen();
  }

  function stepById(id) {
    for (var i = 0; i < STEPS.length; i++) {
      if (STEPS[i].id === id) return STEPS[i];
    }
    return null;
  }

  root.BABY_STEPS = STEPS;
  root.BABY_STEPS_KEY = STORAGE_KEY;
  root.loadBabyStepProgress = loadProgress;
  root.isBabyStepComplete = isStepComplete;
  root.markBabyStepComplete = markStepComplete;
  root.resetBabySteps = resetBabySteps;
  root.nextBabyStep = nextBabyStep;
  root.generateBabyStep = generateBabyStep;
  root.babyStepById = stepById;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      STEPS: STEPS,
      STORAGE_KEY: STORAGE_KEY,
      loadProgress: loadProgress,
      isStepComplete: isStepComplete,
      markStepComplete: markStepComplete,
      resetBabySteps: resetBabySteps,
      nextBabyStep: nextBabyStep,
      generateBabyStep: generateBabyStep,
      stepById: stepById,
    };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
