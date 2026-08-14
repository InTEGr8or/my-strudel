(function () {
  if (window.createTapeTrainer) return;
  var U = window.TRAINER_UTILS;

  window.createTapeTrainer = function (chart, WINDOW_SIZE, shared) {
    var notes = [];
    var totalDuration = 0;
    var bpm = 80;
    var currentBeat = 0;
    var startTimestamp = 0;
    var paused = true;
    var rafId = null;
    var playedSet = null;
    var missedSet = null;
    var TOLERANCE_BEATS = 0.35;
    var WINDOW_BEATS = 4;
    var noteLabelsEl = null;

    function getSpacing() {
      var ctx = chart._ctx;
      if (!ctx) return 50;
      return (ctx.STAFF_R - ctx.LEFT_PAD - 60) / WINDOW_BEATS;
    }

    function getHeadX() {
      if (chart._headX !== undefined) return chart._headX;
      var ctx = chart._ctx;
      return ctx ? ctx.LEFT_PAD + (ctx.STAFF_R - ctx.LEFT_PAD) * 0.03 : 0;
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
      if (!noteLabelsEl) {
        var svgNs = 'http://www.w3.org/2000/svg';
        noteLabelsEl = document.createElementNS(svgNs, 'g');
        noteLabelsEl.setAttribute('id', 'note-labels');
        var container = chart.querySelector('#staff-content') || chart.querySelector('svg');
        container.appendChild(noteLabelsEl);
      }
      var match = noteName.match(/^([a-g])(s?)(\d+)$/);
      if (!match) return;
      var ctx = chart._ctx;
      if (!ctx) return;
      var svgNs = 'http://www.w3.org/2000/svg';
      var label = document.createElementNS(svgNs, 'text');
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
      noteLabelsEl.appendChild(label);
    }

    function loadNotes() {
      if (shared.notes && shared.notes.length > 0) {
        notes = shared.notes.slice();
      } else if (shared.windowNotes && shared.windowNotes.length > 0) {
        notes = shared.windowNotes.map(function (n, i) {
          return { note: n.note, oct: n.oct, startBeat: i, duration: 1 };
        });
      } else {
        notes = [];
      }
      notes.sort(function (a, b) { return a.startBeat - b.startBeat; });
      if (notes.length > 0) {
        var last = notes[notes.length - 1];
        totalDuration = last.startBeat + (last.duration || 1);
      } else {
        totalDuration = 0;
      }
    }

    function renderAllNotes() {
      chart.clearNoteHeads();
      var ctx = chart._ctx;
      if (!ctx) return;
      var spacing = getSpacing();
      var headX = getHeadX();
      var noteHalfW = ctx.SPACING * 0.6;

      var ts = chart.timeSignature;
      var barInterval = ts && ts.top ? ts.top : 4;
      for (var barBeat = barInterval; barBeat <= totalDuration + barInterval; barBeat += barInterval) {
        chart.renderBarLine(headX + barBeat * spacing - noteHalfW);
      }

      for (var i = 0; i < notes.length; i++) {
        var n = notes[i];
        var x = headX + n.startBeat * spacing;
        var name = n.note.toLowerCase() + n.oct;
        chart.renderNoteHead(name, 'pending', x, false);
      }

      setGroupTransform(0);
    }

    function checkMissed() {
      for (var i = 0; i < notes.length; i++) {
        if (playedSet.has(i) || missedSet.has(i)) continue;
        if (currentBeat > notes[i].startBeat + TOLERANCE_BEATS) {
          missedSet.add(i);
          var heads = getHeads();
          if (heads && heads.children[i]) {
            setNoteType(heads.children[i], 'missed');
          }
        }
      }
    }

    function findMatch(midiNote) {
      var bestIdx = -1;
      var bestDist = Infinity;
      for (var i = 0; i < notes.length; i++) {
        if (playedSet.has(i) || missedSet.has(i)) continue;
        var n = notes[i];
        if (midiNote !== U.posToMidi({ note: n.note, oct: n.oct })) continue;
        var beatDist = Math.abs(currentBeat - n.startBeat);
        if (beatDist <= TOLERANCE_BEATS && beatDist < bestDist) {
          bestDist = beatDist;
          bestIdx = i;
        }
      }
      return bestIdx;
    }

    function handleCorrect(idx) {
      if (shared.busy) return;
      shared.busy = true;
      playedSet.add(idx);
      shared.correct++;
      shared.updateScore();
      var heads = getHeads();
      if (heads && heads.children[idx]) {
        setNoteType(heads.children[idx], 'correct');
      }
      var n = notes[idx];
      if (n) addLabel(n.note.toLowerCase() + n.oct);
      shared.removeGhosts();
      setTimeout(function () {
        shared.busy = false;
      }, 125);
    }

    function handleWrong() {
      if (shared.busy) return;
      shared.busy = true;
      shared.wrong++;
      shared.updateScore();
      shared.renderHeldAtHead(getHeadX());
      shared.busy = false;
    }

    function onMidi(midiNote, isNoteOn, isNoteOff) {
      if (shared.destroyed) return;
      if (isNoteOn) {
        if (paused) paused = false;
        shared.activeMidiNotes.add(midiNote);
        if (notes.length === 0 || shared.busy) {
          shared.renderHeldAtHead(getHeadX());
          return;
        }
        var matchIdx = findMatch(midiNote);
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
      }
    }

    function tick(timestamp) {
      if (shared.destroyed) return;
      if (paused) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      if (startTimestamp === 0) startTimestamp = timestamp;
      var elapsed = (timestamp - startTimestamp) / 1000;
      currentBeat = elapsed * (bpm / 60);

      var spacing = getSpacing();
      setGroupTransform(-currentBeat * spacing);

      checkMissed();

      if (currentBeat <= totalDuration + 1) {
        rafId = requestAnimationFrame(tick);
      }
    }

    function start() {
      playedSet = new Set();
      missedSet = new Set();
      currentBeat = 0;
      startTimestamp = 0;
      paused = true;

      loadNotes();

      noteLabelsEl = chart.querySelector('#note-labels');
      chart.renderHeadLine();
      renderAllNotes();
      shared.updateScore();

      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      rafId = requestAnimationFrame(tick);
    }

    function destroy() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      noteLabelsEl = null;
      chart.removeHeadLine();
    }

    function findNextUnplayed() {
      var best = -1;
      var bestDist = Infinity;
      for (var i = 0; i < notes.length; i++) {
        if (playedSet.has(i) || missedSet.has(i)) continue;
        var dist = Math.abs(currentBeat - notes[i].startBeat);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      return best;
    }

    return {
      onMidi: onMidi,
      start: start,
      destroy: destroy,
      setBpm: function (val) { bpm = val; },
      getBpm: function () { return bpm; },
      setNotes: function (newNotes) {
        shared.notes = newNotes;
      },
      getNotes: function () { return notes; },
      getPatternPos: findNextUnplayed,
      posToMidi: U.posToMidi,
    };
  };
})();
