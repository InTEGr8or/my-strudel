(function () {
  if (window.createTrainer) return;

  var U = window.TRAINER_UTILS;

  window.createTrainer = function (config) {
    var chart = config.chartEl;
    var scoreCorrectEl = config.scoreCorrectEl;
    var scoreWrongEl = config.scoreWrongEl;
    var rangeEl = config.rangeEl || null;
    var WINDOW_SIZE = config.windowSize || 8;
    var MODE = config.mode || 'step';

    var state = {
      correct: 0,
      wrong: 0,
      windowNotes: [],
      busy: false,
      ghostEls: [],
      noteCount: 0,
      patternSize: 1,
      patternPos: 0,
      noteArray: null,
      noteArrayPos: 0,
      randomGenerator: true,
      destroyed: false,
      activeMidiNotes: new Set(),
      fillWindow: null,
      updateScore: null,
      removeGhosts: null,
      renderHeldAtHead: null,
      onExerciseComplete: config.onExerciseComplete || null,
      _exerciseDone: false,
    };

    function getRange() {
      if (!rangeEl) return chart._positions;
      var all = chart._positions;
      var val = rangeEl.value;
      if (val === 'treble') return all.slice(12);
      if (val === 'bass') return all.slice(0, 9);
      return all;
    }

    function pickRandomNote() {
      var pool = getRange();
      return pool[Math.floor(Math.random() * pool.length)];
    }

    function generateNext() {
      if (state.noteArray && state.noteArray.length > 0) {
        var note = state.noteArray[state.noteArrayPos % state.noteArray.length];
        state.noteArrayPos++;
        return note;
      }
      if (!state.randomGenerator) {
        return pickRandomNote();
      }
      var pool = getRange();
      if (state.windowNotes.length === 0) return pickRandomNote();
      var prev = state.windowNotes[state.windowNotes.length - 1];
      var prevIdx = U.SCALE.indexOf(prev.note);
      if (prevIdx === -1) return pickRandomNote();
      for (var attempt = 0; attempt < 15; attempt++) {
        var r = Math.random();
        var step;
        if (r < 0.05) step = 0;
        else if (r < 0.35) step = -1;
        else if (r < 0.65) step = 1;
        else if (r < 0.78) step = -2;
        else if (r < 0.90) step = 2;
        else step = Math.random() < 0.5 ? -3 : 3;
        var newIdx = prevIdx + step;
        var newOct = prev.oct;
        while (newIdx < 0) { newIdx += 7; newOct--; }
        while (newIdx >= 7) { newIdx -= 7; newOct++; }
        var candidate = { note: U.SCALE[newIdx], oct: newOct };
        var midi = U.posToMidi(candidate);
        var rangeMin = U.posToMidi(pool[0]);
        var rangeMax = U.posToMidi(pool[pool.length - 1]);
        if (midi >= rangeMin && midi <= rangeMax) {
          return candidate;
        }
      }
      return pickRandomNote();
    }

    function fillWindow() {
      while (state.windowNotes.length < WINDOW_SIZE) {
        state.windowNotes.push(generateNext());
      }
    }

    function updateScore() {
      if (scoreCorrectEl) scoreCorrectEl.textContent = state.correct;
      if (scoreWrongEl) scoreWrongEl.textContent = state.wrong;
    }

    function removeGhosts() {
      var layer = chart.querySelector('#head-ghosts');
      if (layer) layer.innerHTML = '';
      state.ghostEls.forEach(function (el) { if (el.parentNode) el.remove(); });
      state.ghostEls = [];
    }

    function renderHeldAtHead(customX, nameForMidi) {
      removeGhosts();
      if (state.destroyed) return;
      if (state.activeMidiNotes.size === 0) return;
      var ctx = chart._ctx;
      if (!ctx) return;
      var staffW = ctx.STAFF_R - ctx.LEFT_PAD - 60;
      var spacing = staffW / (WINDOW_SIZE + 1);
      var cx = customX !== undefined ? customX : (ctx.LEFT_PAD + 30 + spacing * (state.patternPos + 1));
      state.activeMidiNotes.forEach(function (midi) {
        var name = typeof nameForMidi === 'function' ? nameForMidi(midi) : U.midiToNatural(midi);
        var el = chart.renderNoteHead(name, 'ghost', cx, false);
        if (el) state.ghostEls.push(el);
      });
    }

    state.fillWindow = fillWindow;
    state.updateScore = updateScore;
    state.removeGhosts = removeGhosts;
    state.renderHeldAtHead = renderHeldAtHead;

    var stepTrainer = null;
    var tapeTrainer = null;

    if (MODE === 'step' && typeof window.createStepTrainer === 'function') {
      stepTrainer = window.createStepTrainer(chart, WINDOW_SIZE, state);
    }
    if (MODE === 'tape-head' && typeof window.createTapeTrainer === 'function') {
      tapeTrainer = window.createTapeTrainer(chart, WINDOW_SIZE, state);
    }

    var trainer = stepTrainer || tapeTrainer;

    return {
      onMidi: function (midiNote, isNoteOn, isNoteOff) {
        if (trainer) trainer.onMidi(midiNote, isNoteOn, isNoteOff);
      },
      start: function () {
        if (trainer) trainer.start();
      },
      setPatternSize: function (size) {
        state.patternSize = size;
        if (trainer && trainer.setPatternSize) {
          trainer.setPatternSize(size);
        } else {
          this.start();
        }
      },
      setNotes: function (notes, rests) {
        state.rests = rests || [];
        if (trainer && trainer.setNotes) {
          trainer.setNotes(notes, rests);
        } else {
          state.noteArray = notes;
          state.randomGenerator = !notes || notes.length === 0;
          state.noteArrayPos = 0;
        }
      },
      getNotes: function () {
        return trainer ? trainer.getNotes() : state.windowNotes;
      },
      getPatternPos: function () {
        return trainer ? trainer.getPatternPos() : state.patternPos;
      },
      getPatternSize: function () {
        return trainer ? trainer.getPatternSize() : state.patternSize;
      },
      play: function () { if (trainer && trainer.play) trainer.play(); },
      pause: function () { if (trainer && trainer.pause) trainer.pause(); },
      togglePlay: function () {
        return trainer && trainer.togglePlay ? trainer.togglePlay() : false;
      },
      isPaused: function () {
        return trainer && trainer.isPaused ? trainer.isPaused() : true;
      },
      setBpm: function (bpm) {
        if (tapeTrainer) tapeTrainer.setBpm(bpm);
      },
      getBpm: function () {
        return tapeTrainer ? tapeTrainer.getBpm() : 80;
      },
      setWait: function (on) {
        if (tapeTrainer && tapeTrainer.setWait) tapeTrainer.setWait(on);
      },
      getWait: function () {
        return tapeTrainer && tapeTrainer.getWait ? tapeTrainer.getWait() : false;
      },
      destroy: function () {
        state.destroyed = true;
        if (trainer && trainer.destroy) trainer.destroy();
        chart.removeHeadLine();
      },
      getStats: function () {
        return trainer ? trainer.getStats() : { correct: 0, wrong: 0 };
      },
    };
  };
})();
