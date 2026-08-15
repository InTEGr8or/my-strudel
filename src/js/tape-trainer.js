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
    var WINDOW_BEATS = 8;
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
      ['#note-heads', '#bar-lines', '#rests'].forEach(function (id) {
        var el = chart.querySelector(id);
        if (el) {
          el.style.transition = 'none';
          el.style.transform = 'translateX(' + dx + 'px)';
        }
      });
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
        notes = [];
        var rangeVal = shared.rangeEl ? shared.rangeEl.value : 'full';
        shared.windowNotes.forEach(function (n, i) {
          notes.push({ note: n.note, oct: n.oct, startBeat: i, duration: 1 });
          if (rangeVal === 'full' && (i % 3 === 0)) {
            var isTreble = n.oct >= 4;
            var bassPool = [{ note: 'C', oct: 3 }, { note: 'E', oct: 3 }, { note: 'G', oct: 3 }, { note: 'C', oct: 2 }, { note: 'F', oct: 2 }, { note: 'G', oct: 2 }];
            var treblePool = [{ note: 'C', oct: 4 }, { note: 'E', oct: 4 }, { note: 'G', oct: 4 }, { note: 'C', oct: 5 }, { note: 'E', oct: 5 }];
            var pool = isTreble ? bassPool : treblePool;
            var second = pool[i % pool.length];
            notes.push({ note: second.note, oct: second.oct, startBeat: i, duration: 1 });
          }
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
      var barOffset = spacing * 0.45;

      var ts = chart.timeSignature;
      var barInterval = ts && ts.top ? ts.top : 4;
      for (var barBeat = 0; barBeat <= totalDuration + barInterval; barBeat += barInterval) {
        chart.renderBarLine(headX + barBeat * spacing - barOffset);
      }

      function staffOf(ev) {
        if (window.noteStaff) return window.noteStaff(ev);
        if (ev.voice !== undefined && ev.voice !== null) return ev.voice === 0 ? 'treble' : 'bass';
        return ev.oct >= 4 ? 'treble' : 'bass';
      }

      function noteNameOf(n) {
        var acc = '';
        if (n.accidental === 'sharp') acc = 's';
        else if (n.accidental === 'double-sharp') acc = 'x';
        else if (n.accidental === 'flat' || n.accidental === 'double-flat') acc = 'f';
        else if (n.accidental === 'natural') acc = 'n';
        return n.note.toLowerCase() + acc + n.oct;
      }

      if (shared.rests && shared.rests.length > 0) {
        for (var r = 0; r < shared.rests.length; r++) {
          var rest = shared.rests[r];
          var restStaff = staffOf(rest);
          var covered = notes.some(function (n) {
            return Math.abs(n.startBeat - rest.startBeat) < 0.05 && staffOf(n) === restStaff;
          });
          if (covered) continue;
          var rx = headX + rest.startBeat * spacing;
          chart.renderRest(rx, rest.duration, restStaff);
        }
      }

      var classify = window.classifyDuration;
      var beamedIds = {};
      var beamSegs = [];
      if (classify) {
        var flagged = notes.map(function (n, idx) {
          return { n: n, idx: idx, flags: classify(n.duration).flags || 0, staff: staffOf(n) };
        }).filter(function (x) { return x.flags > 0; });
        flagged.sort(function (a, b) {
          return a.n.startBeat - b.n.startBeat || a.staff.localeCompare(b.staff);
        });
        var group = [];
        function flushGroup() {
          if (group.length < 2) return;
          var onsets = [];
          group.forEach(function (g) {
            if (onsets.indexOf(g.n.startBeat) === -1) onsets.push(g.n.startBeat);
          });
          if (onsets.length < 2) return;
          group.forEach(function (g) { beamedIds[g.idx] = true; });
          var first = group[0].n;
          var last = group[group.length - 1].n;
          var x1 = headX + first.startBeat * spacing + ctx.SPACING * 0.6;
          var x2 = headX + last.startBeat * spacing + ctx.SPACING * 0.6;
          var topY = Infinity;
          group.forEach(function (g) {
            var gy = ctx.getY(g.n.note, g.n.oct) - ctx.SPACING * 3.5;
            if (gy < topY) topY = gy;
          });
          var maxFlags = 1;
          group.forEach(function (g) { if (g.flags > maxFlags) maxFlags = g.flags; });
          beamSegs.push({ x1: x1, x2: x2, y: topY, levels: maxFlags });
        }
        flagged.forEach(function (item) {
          if (group.length === 0) {
            group = [item];
            return;
          }
          var prev = group[group.length - 1];
          var contiguous = Math.abs(item.n.startBeat - (prev.n.startBeat + (prev.n.duration || 0))) < 0.08
            || Math.abs(item.n.startBeat - prev.n.startBeat) < 0.001;
          if (contiguous && item.staff === prev.staff) {
            group.push(item);
          } else {
            flushGroup();
            group = [item];
          }
        });
        flushGroup();
      }

      for (var i = 0; i < notes.length; i++) {
        var n = notes[i];
        var x = headX + n.startBeat * spacing;
        chart.renderNoteHead(noteNameOf(n), 'pending', x, false, n.duration, {
          hideFlags: !!beamedIds[i],
          staccato: !!n.staccato,
        });
      }
      if (beamSegs.length && chart.renderBeams) chart.renderBeams(beamSegs);

      var tupletSegs = [];
      var tGroup = [];
      function tupletOnsets(group) {
        var seen = [];
        group.forEach(function (tn) {
          if (seen.indexOf(tn.startBeat) === -1) seen.push(tn.startBeat);
        });
        return seen;
      }
      function flushTuplet() {
        if (tupletOnsets(tGroup).length < 2) { tGroup = []; return; }
        var first = tGroup[0];
        var last = tGroup[tGroup.length - 1];
        var x1 = headX + first.startBeat * spacing;
        var x2 = headX + last.startBeat * spacing;
        var topY = Infinity;
        tGroup.forEach(function (tn) {
          var ty = ctx.getY(tn.note, tn.oct) - ctx.SPACING * 3.8;
          if (ty < topY) topY = ty;
        });
        tupletSegs.push({
          x1: x1,
          x2: x2,
          y: topY,
          label: String((first.tuplet && first.tuplet.actual) || 3),
        });
        tGroup = [];
      }
      notes.slice().sort(function (a, b) { return a.startBeat - b.startBeat || staffOf(a).localeCompare(staffOf(b)); })
        .forEach(function (tn) {
          if (!tn.tuplet || tn.tuplet.actual !== 3) {
            flushTuplet();
            return;
          }
          if (tGroup.length === 0) {
            tGroup = [tn];
            return;
          }
          var prevT = tGroup[tGroup.length - 1];
          var contig = Math.abs(tn.startBeat - (prevT.startBeat + (prevT.duration || 0))) < 0.1
            || Math.abs(tn.startBeat - prevT.startBeat) < 0.001;
          if (contig && staffOf(tn) === staffOf(prevT)) {
            tGroup.push(tn);
            if (tupletOnsets(tGroup).length >= ((tn.tuplet && tn.tuplet.actual) || 3)) flushTuplet();
          } else {
            flushTuplet();
            tGroup = [tn];
          }
        });
      flushTuplet();
      if (tupletSegs.length && chart.renderTuplets) chart.renderTuplets(tupletSegs);

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

    function autoPlayNotesPassHead() {
      if (paused || notes.length === 0) return;
      for (var i = 0; i < notes.length; i++) {
        if (playedSet.has(i) || missedSet.has(i)) continue;
        var n = notes[i];
        if (currentBeat >= n.startBeat) {
          playedSet.add(i);
          var midi = U.posToMidi({ note: n.note, oct: n.oct });
          if (typeof window.playMidiNote === 'function') {
            window.playMidiNote(midi, 100);
          }
          var heads = getHeads();
          if (heads && heads.children[i]) {
            setNoteType(heads.children[i], 'correct');
          }
          addLabel(n.note.toLowerCase() + n.oct);
        }
      }
    }

    function tick(timestamp) {
      if (shared.destroyed) return;
      if (paused) {
        if (startTimestamp !== 0) startTimestamp = 0;
        rafId = requestAnimationFrame(tick);
        return;
      }
      if (startTimestamp === 0) startTimestamp = timestamp - (currentBeat / (bpm / 60)) * 1000;
      var elapsed = (timestamp - startTimestamp) / 1000;
      currentBeat = elapsed * (bpm / 60);

      var spacing = getSpacing();
      setGroupTransform(-currentBeat * spacing);

      autoPlayNotesPassHead();

      if (currentBeat <= totalDuration + 1) {
        rafId = requestAnimationFrame(tick);
      }
    }

    function play() {
      paused = false;
    }

    function pause() {
      paused = true;
    }

    function togglePlay() {
      paused = !paused;
      return !paused;
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
      play: play,
      pause: pause,
      togglePlay: togglePlay,
      isPaused: function () { return paused; },
      setBpm: function (val) { bpm = val; },
      getBpm: function () { return bpm; },
      setNotes: function (notesArr, restsArr) {
        shared.notes = notesArr;
        shared.rests = restsArr || [];
        loadNotes();
        renderAllNotes();
      },
      getNotes: function () { return notes; },
      getPatternPos: findNextUnplayed,
      getPatternSize: function () { return 1; },
      posToMidi: U.posToMidi,
      getStats: function () { return { correct: shared.correct, wrong: shared.wrong }; },
    };
  };
})();
