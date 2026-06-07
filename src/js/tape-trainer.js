(function () {
  if (window.createTapeTrainer) return;
  var U = window.TRAINER_UTILS;

  window.createTapeTrainer = function (chart, WINDOW_SIZE, shared) {
    var paused = true;
    var beat = 0;
    var shift = 0;
    var bpm = 80;
    var rafId = null;
    var correctGens = new Set();
    var shiftCount = 0;
    var TOLERANCE_PX = 16;
    var lastTime = 0;
    var noteLabelsEl = null;
    var staffContentEl = null;

    function getSpacing() {
      var ctx = chart._ctx;
      if (!ctx) return 50;
      return (ctx.STAFF_R - ctx.LEFT_PAD - 60) / (WINDOW_SIZE + 1);
    }

    function getHeadX() {
      if (chart._headX !== undefined) return chart._headX;
      var ctx = chart._ctx;
      return ctx ? ctx.LEFT_PAD + (ctx.STAFF_R - ctx.LEFT_PAD) * 0.1 : 0;
    }

    function getExitBeats() {
      var ctx = chart._ctx;
      if (!ctx) return 2;
      var spacing = getSpacing();
      var headX = getHeadX();
      return (headX + spacing - ctx.LEFT_PAD) / spacing;
    }

    function getHeads() {
      return chart.querySelector('#note-heads');
    }

    function setGroupTransform(dx) {
      var heads = getHeads();
      if (heads) {
        heads.style.transition = 'none';
        heads.style.transform = 'translateX(' + dx + 'px)';
      }
    }

    function setNoteType(el, type) {
      if (!el) return;
      var ctx = chart._ctx;
      var staffColor = ctx ? ctx.staffColor : '#666';
      var fill, stroke, sw;
      if (type === 'correct') {
        fill = '#28a745'; stroke = '#28a745'; sw = '1.5';
      } else if (type === 'missed') {
        fill = '#f1c40f'; stroke = '#f1c40f'; sw = '1.5';
      } else {
        fill = staffColor; stroke = staffColor; sw = '1';
      }
      var ellipse = el.querySelector('ellipse');
      if (ellipse) {
        ellipse.setAttribute('fill', fill);
        ellipse.setAttribute('stroke', stroke);
        ellipse.setAttribute('stroke-width', sw);
      }
      var lines = el.querySelectorAll('line');
      lines.forEach(function (l) {
        l.setAttribute('stroke', stroke);
      });
    }

    function addLabel(noteName) {
      var labels = noteLabelsEl;
      if (!labels) {
        labels = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labels.setAttribute('id', 'note-labels');
        (staffContentEl || chart.querySelector('svg')).appendChild(labels);
        noteLabelsEl = labels;
      }
      var match = noteName.match(/^([a-g])(s?)(\d+)$/);
      if (!match) return;
      var ctx = chart._ctx;
      if (!ctx) return;
      var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.textContent = match[1].toUpperCase() + (match[2] ? '#' : '') + match[3];
      label.setAttribute('x', getHeadX());
      label.setAttribute('y', ctx.getY(match[1].toUpperCase(), parseInt(match[3], 10)));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'central');
      label.setAttribute('font-size', (28 * ctx.scale) + 'px');
      label.setAttribute('font-weight', 'bold');
      label.setAttribute('fill', '#28a745');
      label.style.animation = 'note-label-fade 500ms ease-out 250ms forwards';
      label.addEventListener('animationend', function () { label.remove(); });
      labels.appendChild(label);
    }

    function renderWindow() {
      if (shared.destroyed) return;
      chart.clearNoteHeads();
      var ctx = chart._ctx;
      if (!ctx) return;
      var spacing = getSpacing();
      var headX = getHeadX();
      for (var i = 0; i < WINDOW_SIZE && i < shared.windowNotes.length; i++) {
        chart.renderNoteHead(U.noteName(shared.windowNotes[i]), 'pending', headX + spacing * (i + 1), false);
      }
      for (var i = 1; i < WINDOW_SIZE; i++) {
        if ((shared.noteCount + i) % 4 === 0) {
          chart.renderBarLine(headX + spacing * (i + 0.5));
        }
      }
      setGroupTransform(-spacing * (beat + shift));
    }

    function tick(timestamp) {
      if (shared.destroyed) return;
      if (paused) {
        lastTime = timestamp;
        rafId = requestAnimationFrame(tick);
        return;
      }
      var dt = lastTime ? timestamp - lastTime : 0;
      lastTime = timestamp;
      beat += (dt * bpm) / 60000;
      var exitBeats = getExitBeats();
      var _g = 0;
      while (beat >= exitBeats && _g < WINDOW_SIZE) {
        _g++;
        beat -= exitBeats;
        shift += exitBeats;
        shiftCount++;
        if (shared.windowNotes.length > 0) {
          shared.windowNotes.shift();
          shared.noteCount++;
          shared.fillWindow();
          var spacing = getSpacing();
          var headX = getHeadX();
          var heads = getHeads();
          if (heads) {
            var first = heads.querySelector('g');
            if (first) first.remove();
          }
          var ctx = chart._ctx;
          if (ctx) {
            chart.renderNoteHead(U.noteName(shared.windowNotes[WINDOW_SIZE - 1]), 'pending', headX + spacing * WINDOW_SIZE, false);
          }
        }
      }
      var effective = beat + shift - shiftCount;
      setGroupTransform(-getSpacing() * (beat + shift));
      var spacing = getSpacing();
      for (var i = 0; i < shared.windowNotes.length; i++) {
        if ((effective - (i + 1)) * spacing > TOLERANCE_PX) {
          var gen = shared.noteCount + i;
          if (!correctGens.has(gen)) {
            correctGens.add(gen);
            var heads = getHeads();
            if (heads && heads.children[i]) setNoteType(heads.children[i], 'missed');
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    function handleCorrect(targetIdx) {
      if (shared.busy) return;
      shared.busy = true;
      shared.correct++;
      if (targetIdx !== undefined) {
        correctGens.add(shared.noteCount + targetIdx);
      }
      shared.updateScore();
      if (shared.windowNotes.length > 0) {
        var targetNote = shared.windowNotes[targetIdx !== undefined ? targetIdx : 0];
        if (targetNote) {
          var heads = getHeads();
          if (heads) setNoteType(heads.children[targetIdx], 'correct');
          addLabel(U.noteName(targetNote));
        }
      }
      shared.removeGhosts();
      setTimeout(function () {
        shared.busy = false;
      }, 250);
    }

    function handleWrong() {
      if (shared.busy) return;
      shared.busy = true;
      shared.wrong++;
      shared.updateScore();
      shared.renderHeldAtHead(getHeadX());
      shared.busy = false;
    }

    function findMatch(midiNote, exactPos, centerIdx) {
      var bestIdx = -1;
      var bestDist = Infinity;
      var start = Math.max(0, centerIdx - 1);
      var end = Math.min(shared.windowNotes.length - 1, centerIdx + 1);
      var spacing = getSpacing();
      for (var idx = start; idx <= end; idx++) {
        var distPx = Math.abs(exactPos - idx) * spacing;
        if (distPx <= TOLERANCE_PX && midiNote === U.posToMidi(shared.windowNotes[idx])) {
          if (distPx < bestDist) {
            bestDist = distPx;
            bestIdx = idx;
          }
        }
      }
      return bestIdx;
    }

    function onMidi(midiNote, isNoteOn, isNoteOff) {
      if (shared.destroyed) return;
      if (isNoteOn) {
        if (paused) paused = false;
        shared.activeMidiNotes.add(midiNote);
        if (shared.windowNotes.length === 0 || shared.busy) {
          shared.renderHeldAtHead(getHeadX());
          return;
        }
        var exactPos = (beat + shift - shiftCount) - 1;
        var centerIdx = Math.min(Math.max(Math.round(exactPos), 0), shared.windowNotes.length - 1);
        var matchIdx = findMatch(midiNote, exactPos, centerIdx);
        if (matchIdx !== -1) {
          shared.removeGhosts();
          handleCorrect(matchIdx);
        } else {
          handleWrong();
        }
      } else if (isNoteOff) {
        shared.activeMidiNotes.delete(midiNote);
        if (shared.activeMidiNotes.size > 0) {
          shared.removeGhosts();
          shared.renderHeldAtHead(getHeadX());
        } else {
          shared.removeGhosts();
        }
        if (shared.ghostEls.length === 0 && !shared.busy) {
          setGroupTransform(-getSpacing() * (beat + shift));
        }
      }
    }

    function start() {
      beat = 0;
      shift = 0;
      shiftCount = 0;
      paused = true;
      correctGens = new Set();
      lastTime = 0;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      noteLabelsEl = chart.querySelector('#note-labels');
      staffContentEl = chart.querySelector('#staff-content');
      chart.renderHeadLine();
      shared.fillWindow();
      renderWindow();
      shared.updateScore();
      rafId = requestAnimationFrame(tick);
    }

    function destroy() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      noteLabelsEl = null;
      staffContentEl = null;
      chart.removeHeadLine();
    }

    return {
      onMidi: onMidi,
      start: start,
      destroy: destroy,
      setBpm: function (val) { bpm = val; },
      getBpm: function () { return bpm; },
    };
  };
})();
