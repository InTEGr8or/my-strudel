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
    var waitMode = false;

    function getSpacing() {
      var ctx = chart._ctx;
      if (!ctx) return 50;
      return (ctx.STAFF_R - ctx.LEFT_PAD - 60) / WINDOW_BEATS;
    }

    function ghostStaffName(midi) {
      var beat = waitMode && window.nextUnplayedStartBeat
        ? window.nextUnplayedStartBeat(notes, playedSet || new Set(), missedSet || new Set())
        : currentBeat;
      if (beat != null && notes && notes.length) {
        for (var i = 0; i < notes.length; i++) {
          var n = notes[i];
          if (Math.abs(n.startBeat - beat) > 0.08) continue;
          if (U.posToMidi({ note: n.note, oct: n.oct, midi: n.midi, alter: n.alter }) !== midi) continue;
          var acc = '';
          if (n.accidental === 'sharp' || n.accidental === 'double-sharp') acc = n.accidental === 'double-sharp' ? 'x' : 's';
          else if (n.accidental === 'flat' || n.accidental === 'double-flat') acc = 'f';
          else if (n.accidental === 'natural') acc = 'n';
          return n.note.toLowerCase() + acc + n.oct;
        }
      }
      if (window.spellMidiForKey && chart.keySignature) {
        var spelled = window.spellMidiForKey(midi, chart.keySignature);
        var g = '';
        if (spelled.alter === 1) g = 's';
        else if (spelled.alter === -1) g = 'f';
        return spelled.note.toLowerCase() + g + spelled.oct;
      }
      return U.midiToNatural(midi);
    }

    function syncHeadGhosts() {
      shared.renderHeldAtHead(getHeadX(), ghostStaffName);
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

    function addLabelForNote(n) {
      if (!n) return;
      if (!noteLabelsEl || !noteLabelsEl.parentNode) {
        var svgNs = 'http://www.w3.org/2000/svg';
        noteLabelsEl = document.createElementNS(svgNs, 'g');
        noteLabelsEl.setAttribute('id', 'note-labels');
        var svg = chart.querySelector('svg');
        svg.appendChild(noteLabelsEl);
      }
      var ctx = chart._ctx;
      if (!ctx) return;
      var svgNs2 = 'http://www.w3.org/2000/svg';
      var label = document.createElementNS(svgNs2, 'text');
      var ks = chart.keySignature;
      var spelled = window.spellNoteForKey ? window.spellNoteForKey(n, ks) : n;
      label.textContent = window.staffNoteLabel ? window.staffNoteLabel(n, ks) : (n.note + n.oct);
      label.setAttribute('x', getHeadX());
      label.setAttribute('y', ctx.getY(spelled.note, spelled.oct));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'central');
      label.setAttribute('font-size', (28 * ctx.scale) + 'px');
      label.setAttribute('font-weight', 'bold');
      label.setAttribute('fill', '#00e5ff');
      label.style.fill = '#00e5ff';
      label.setAttribute('stroke', 'rgba(0,0,0,0.55)');
      label.setAttribute('stroke-width', 3 * ctx.scale);
      label.setAttribute('paint-order', 'stroke');
      label.setAttribute('class', 'target-note-label');
      label.style.animation = 'note-label-fade 500ms ease-out 250ms forwards';
      label.addEventListener('animationend', function () { label.remove(); });
      noteLabelsEl.appendChild(label);
    }

    function showColumnTargets(beat) {
      if (!noteLabelsEl || !noteLabelsEl.parentNode) {
        var svgNs = 'http://www.w3.org/2000/svg';
        noteLabelsEl = document.createElementNS(svgNs, 'g');
        noteLabelsEl.setAttribute('id', 'note-labels');
        var svg = chart.querySelector('svg');
        if (svg) svg.appendChild(noteLabelsEl);
      }
      if (noteLabelsEl) noteLabelsEl.innerHTML = '';
      if (beat == null) return;
      for (var i = 0; i < notes.length; i++) {
        if (playedSet && playedSet.has(i)) continue;
        if (missedSet && missedSet.has(i)) continue;
        if (Math.abs(notes[i].startBeat - beat) <= 0.08) addLabelForNote(notes[i]);
      }
    }

    function columnBeat() {
      if (waitMode && window.nextUnplayedStartBeat) {
        return window.nextUnplayedStartBeat(notes, playedSet || new Set(), missedSet || new Set());
      }
      return currentBeat;
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
      } else if (window.generateBabyStep) {
        var step = window.nextBabyStep ? window.nextBabyStep() : null;
        notes = window.generateBabyStep(step ? step.id : 'singles-five-finger') || [];
        shared.notes = notes;
      } else {
        notes = [];
        var letters = ['C', 'D', 'E', 'F', 'G', 'G', 'F', 'E', 'D', 'C'];
        for (var rep = 0; rep < 2; rep++) {
          for (var li = 0; li < letters.length; li++) {
            notes.push({
              note: letters[li],
              oct: 4,
              startBeat: rep * letters.length + li,
              duration: 1,
            });
          }
        }
        shared.notes = notes;
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
      // startBeat is in quarter-note beats; 2/2 and 6/8 are not `ts.top` quarters.
      var ts = chart.timeSignature;
      var barInterval = (window.quarterBeatsPerBar && window.quarterBeatsPerBar(ts))
        || (ts && ts.top ? ts.top * (4 / (ts.bottom || 4)) : 4);
      // Sit the bar fully left of a notehead that starts on that beat.
      var noteHalfW = ctx.SPACING * 0.6;
      var barOffset = noteHalfW + ctx.SPACING * 0.35;
      for (var barBeat = barInterval; barBeat <= totalDuration + 0.001; barBeat += barInterval) {
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
      if (waitMode) return;
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

    function pitchOf(n) {
      return U.posToMidi({ note: n.note, oct: n.oct, midi: n.midi, alter: n.alter });
    }

    function findMatch(midiNote) {
      if (waitMode && window.matchMidiAtOnset) {
        var waitBeat = window.nextUnplayedStartBeat
          ? window.nextUnplayedStartBeat(notes, playedSet, missedSet)
          : currentBeat;
        return window.matchMidiAtOnset(notes, playedSet, missedSet, midiNote, waitBeat, pitchOf);
      }
      var bestIdx = -1;
      var bestDist = Infinity;
      for (var i = 0; i < notes.length; i++) {
        if (playedSet.has(i) || missedSet.has(i)) continue;
        if (pitchOf(notes[i]) !== midiNote) continue;
        var beatDist = Math.abs(currentBeat - notes[i].startBeat);
        if (beatDist <= TOLERANCE_BEATS && beatDist < bestDist) {
          bestDist = beatDist;
          bestIdx = i;
        }
      }
      return bestIdx;
    }

    function maybeAdvanceWait() {
      if (!waitMode) return;
      var next = window.nextUnplayedStartBeat
        ? window.nextUnplayedStartBeat(notes, playedSet, missedSet)
        : null;
      if (next == null) return;
      currentBeat = next;
      startTimestamp = 0;
    }

    function maybeFinishExercise() {
      if (!notes.length || !playedSet || !missedSet) return;
      if (playedSet.size + missedSet.size < notes.length) return;
      if (shared._exerciseDone) return;
      shared._exerciseDone = true;
      if (typeof shared.onExerciseComplete === 'function') {
        shared.onExerciseComplete({
          allCorrect: missedSet.size === 0 && playedSet.size === notes.length,
        });
      }
    }

    function handleCorrect(idx) {
      if (playedSet.has(idx)) return;
      playedSet.add(idx);
      shared.correct++;
      shared.updateScore();
      var heads = getHeads();
      if (heads && heads.children[idx]) {
        setNoteType(heads.children[idx], 'correct');
      }
      maybeAdvanceWait();
      maybeFinishExercise();
    }

    function handleWrong() {
      shared.wrong++;
      shared.updateScore();
    }

    function onMidi(midiNote, isNoteOn, isNoteOff) {
      if (shared.destroyed) return;
      if (isNoteOn) {
        if (paused && !waitMode) paused = false;
        var alreadyHeld = shared.activeMidiNotes.has(midiNote);
        shared.activeMidiNotes.add(midiNote);
        if (notes.length > 0) {
          var targetBeat = columnBeat();
          var matchIdx = findMatch(midiNote);
          if (matchIdx !== -1) {
            handleCorrect(matchIdx);
            if (notes[matchIdx]) targetBeat = notes[matchIdx].startBeat;
          } else if (!alreadyHeld) {
            handleWrong();
          }
          showColumnTargets(targetBeat);
        }
        syncHeadGhosts();
      } else if (isNoteOff) {
        shared.activeMidiNotes.delete(midiNote);
        syncHeadGhosts();
      }
    }

    function autoPlayNotesPassHead() {
      if (waitMode || paused || notes.length === 0) return;
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
          showColumnTargets(n.startBeat);
        }
      }
    }

    function tick(timestamp) {
      if (shared.destroyed) return;
      if (waitMode) {
        startTimestamp = 0;
        setGroupTransform(-currentBeat * getSpacing());
        rafId = requestAnimationFrame(tick);
        return;
      }
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
      shared._exerciseDone = false;
      currentBeat = 0;
      startTimestamp = 0;
      paused = true;

      loadNotes();
      if (waitMode && window.nextUnplayedStartBeat) {
        var firstWait = window.nextUnplayedStartBeat(notes, playedSet, missedSet);
        if (firstWait != null) currentBeat = firstWait;
      }

      noteLabelsEl = chart.querySelector('#note-labels');
      chart.renderHeadLine();
      renderAllNotes();
      syncHeadGhosts();
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
      setWait: function (on) {
        waitMode = !!on;
        startTimestamp = 0;
        if (waitMode) {
          var next = window.nextUnplayedStartBeat
            ? window.nextUnplayedStartBeat(notes, playedSet || new Set(), missedSet || new Set())
            : currentBeat;
          if (next != null) currentBeat = next;
        }
      },
      getWait: function () { return waitMode; },
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
