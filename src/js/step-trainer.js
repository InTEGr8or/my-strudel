(function () {
  if (window.createStepTrainer) return;
  var U = window.TRAINER_UTILS;

  window.createStepTrainer = function (chart, WINDOW_SIZE, shared) {
    function getSpacing() {
      var ctx = chart._ctx;
      if (!ctx) return 50;
      return (ctx.STAFF_R - ctx.LEFT_PAD - 60) / (WINDOW_SIZE + 1);
    }

    function removeGhosts() {
      shared.ghostEls.forEach(function (el) { if (el.parentNode) el.remove(); });
      shared.ghostEls = [];
    }

    function renderHeldAtHead(customX) {
      if (shared.destroyed) return;
      if (shared.activeMidiNotes.size === 0) return;
      var ctx = chart._ctx;
      if (!ctx) return;
      var spacing = getSpacing();
      var cx = customX !== undefined ? customX : (ctx.LEFT_PAD + 30 + spacing * (shared.patternPos + 1));
      shared.activeMidiNotes.forEach(function (midi) {
        var name = U.midiToNatural(midi).replace('s', '');
        var el = chart.renderNoteHead(name, 'ghost', cx, true);
        if (el) shared.ghostEls.push(el);
      });
    }

    function renderWindow() {
      if (shared.destroyed) return;
      chart.clearNoteHeads();
      var ctx = chart._ctx;
      if (!ctx) return;
      var spacing = getSpacing();
      var offset = 30;
      for (var i = 0; i < WINDOW_SIZE && i < shared.windowNotes.length; i++) {
        var pos = shared.windowNotes[i];
        var cx = ctx.LEFT_PAD + offset + spacing * (i + 1);
        var type;
        if (i < shared.patternSize && i === shared.patternPos) {
          type = 'target';
        } else if (i < shared.patternPos) {
          type = 'correct';
        } else {
          type = 'pending';
        }
        chart.renderNoteHead(U.noteName(pos), type, cx);
      }
      for (var k = 1; k < WINDOW_SIZE; k++) {
        if ((shared.noteCount + k) % 4 === 0) {
          var barX = ctx.LEFT_PAD + offset + spacing * (k + 0.5);
          chart.renderBarLine(barX);
        }
      }
    }

    function shiftWindow() {
      var shiftCount = shared.patternSize;
      for (var i = 0; i < shiftCount; i++) {
        if (shared.windowNotes.length > 0) shared.windowNotes.shift();
      }
      shared.noteCount += shiftCount;
      shared.patternPos = 0;
      shared.fillWindow();
      var heads = chart.querySelector('#note-heads');
      var spacing = getSpacing();
      for (var el of heads.children) {
        el.style.transform = 'translateX(' + (-spacing * shiftCount) + 'px)';
      }
      setTimeout(renderWindow, 150);
    }

    function handleCorrect() {
      if (shared.busy) return;
      shared.busy = true;
      shared.correct++;
      shared.updateScore();
      shared.patternPos++;
      var spacing = getSpacing();
      var ctx = chart._ctx;
      var cx = ctx.LEFT_PAD + 30 + spacing * shared.patternPos;
      chart.renderNoteHead(U.noteName(shared.windowNotes[shared.patternPos - 1]), 'correct', cx, true);
      removeGhosts();
      setTimeout(function () {
        if (shared.patternPos >= shared.patternSize) {
          shared.busy = false;
          shiftWindow();
        } else {
          renderWindow();
          shared.busy = false;
        }
      }, 250);
    }

    function handleWrong() {
      if (shared.busy) return;
      shared.busy = true;
      shared.wrong++;
      shared.updateScore();
      chart.clearNoteHeads();
      renderWindow();
      renderHeldAtHead();
      shared.busy = false;
    }

    function onMidi(midiNote, isNoteOn, isNoteOff) {
      if (shared.destroyed) return;
      if (isNoteOn) {
        shared.activeMidiNotes.add(midiNote);
        if (shared.windowNotes.length === 0 || shared.busy || shared.patternPos >= shared.windowNotes.length) {
          renderHeldAtHead();
          return;
        }
        var target = shared.windowNotes[shared.patternPos];
        if (target && midiNote === U.posToMidi(target)) {
          removeGhosts();
          handleCorrect();
        } else {
          handleWrong();
        }
      } else if (isNoteOff) {
        shared.activeMidiNotes.delete(midiNote);
        if (shared.activeMidiNotes.size > 0) {
          removeGhosts();
          renderHeldAtHead();
        } else {
          removeGhosts();
        }
        if (shared.ghostEls.length === 0 && !shared.busy) {
          renderWindow();
        }
      }
    }

    function start() {
      shared.patternPos = 0;
      shared.noteArrayPos = 0;
      shared.windowNotes = [];
      shared.noteCount = 0;
      removeGhosts();
      var tm = chart.querySelector('#tape-missed');
      if (tm) tm.innerHTML = '';
      shared.fillWindow();
      renderWindow();
      shared.updateScore();
    }

    function destroy() {
      shared.destroyed = true;
      removeGhosts();
    }

    return {
      onMidi: onMidi,
      start: start,
      destroy: destroy,
      setPatternSize: function (size) {
        shared.patternSize = size;
        start();
      },
      setNotes: function (notes) {
        shared.noteArray = notes;
        shared.randomGenerator = !notes || notes.length === 0;
        shared.noteArrayPos = 0;
      },
      getNotes: function () { return shared.windowNotes; },
      getPatternPos: function () { return shared.patternPos; },
      getPatternSize: function () { return shared.patternSize; },
      posToMidi: U.posToMidi,
      getStats: function () { return { correct: shared.correct, wrong: shared.wrong }; },
    };
  };
})();
