(function () {
  if (window.createTrainer) return;

  const SCALE = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const SCALE_MIDI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const MIDI_NAMES = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];

  function midiToNatural(midi) {
    const oct = Math.floor(midi / 12) - 1;
    return MIDI_NAMES[midi % 12] + oct;
  }

  function naturalToMidi(note, oct) {
    return (oct + 1) * 12 + SCALE_MIDI[note];
  }

  function noteName(pos) {
    return pos.note.toLowerCase() + pos.oct;
  }

  function posToMidi(pos) {
    return naturalToMidi(pos.note, pos.oct);
  }

  window.createTrainer = function (config) {
    const chart = config.chartEl;
    const statusEl = config.statusEl;
    const scoreCorrectEl = config.scoreCorrectEl;
    const scoreWrongEl = config.scoreWrongEl;
    const rangeEl = config.rangeEl || null;
    const WINDOW_SIZE = config.windowSize || 8;

    let correct = 0;
    let wrong = 0;
    let windowNotes = [];
    let busy = false;
    let ghostEl = null;
    let noteCount = 0;
    let patternSize = 1;
    let patternPos = 0;
    let noteArray = null;
    let noteArrayPos = 0;
    let randomGenerator = true;
    let destroyed = false;

    function getRange() {
      if (!rangeEl) return chart._positions;
      const all = chart._positions;
      const val = rangeEl.value;
      if (val === 'treble') return all.slice(12);
      if (val === 'bass') return all.slice(0, 9);
      return all;
    }

    function pickRandomNote() {
      const pool = getRange();
      return pool[Math.floor(Math.random() * pool.length)];
    }

    function generateNext() {
      if (noteArray && noteArray.length > 0) {
        const note = noteArray[noteArrayPos % noteArray.length];
        noteArrayPos++;
        return note;
      }
      if (!randomGenerator) {
        return pickRandomNote();
      }
      const pool = getRange();
      if (windowNotes.length === 0) return pickRandomNote();
      const prev = windowNotes[windowNotes.length - 1];
      const prevIdx = SCALE.indexOf(prev.note);
      if (prevIdx === -1) return pickRandomNote();
      for (let attempt = 0; attempt < 15; attempt++) {
        const r = Math.random();
        let step;
        if (r < 0.05) step = 0;
        else if (r < 0.35) step = -1;
        else if (r < 0.65) step = 1;
        else if (r < 0.78) step = -2;
        else if (r < 0.90) step = 2;
        else step = Math.random() < 0.5 ? -3 : 3;
        let newIdx = prevIdx + step;
        let newOct = prev.oct;
        while (newIdx < 0) { newIdx += 7; newOct--; }
        while (newIdx >= 7) { newIdx -= 7; newOct++; }
        const candidate = { note: SCALE[newIdx], oct: newOct };
        const midi = posToMidi(candidate);
        const rangeMin = posToMidi(pool[0]);
        const rangeMax = posToMidi(pool[pool.length - 1]);
        if (midi >= rangeMin && midi <= rangeMax) {
          return candidate;
        }
      }
      return pickRandomNote();
    }

    function fillWindow() {
      while (windowNotes.length < WINDOW_SIZE) {
        windowNotes.push(generateNext());
      }
    }

    function renderWindow() {
      if (destroyed) return;
      chart.clearNoteHeads();
      const ctx = chart._ctx;
      if (!ctx) return;
      const staffW = ctx.STAFF_R - ctx.LEFT_PAD - 60;
      const spacing = staffW / (WINDOW_SIZE + 1);
      const offset = 30;
      for (let i = 0; i < WINDOW_SIZE && i < windowNotes.length; i++) {
        const pos = windowNotes[i];
        const cx = ctx.LEFT_PAD + offset + spacing * (i + 1);
        let type;
        if (i < patternSize && i === patternPos) {
          type = 'target';
        } else if (i < patternPos) {
          type = 'correct';
        } else {
          type = 'pending';
        }
        chart.renderNoteHead(noteName(pos), type, cx);
      }
      for (let k = 1; k < WINDOW_SIZE; k++) {
        if ((noteCount + k) % 4 === 0) {
          const barX = ctx.LEFT_PAD + offset + spacing * (k + 0.5);
          chart.renderBarLine(barX);
        }
      }
    }

    function shiftWindow() {
      const shiftCount = patternSize;
      for (let i = 0; i < shiftCount; i++) {
        if (windowNotes.length > 0) windowNotes.shift();
      }
      noteCount += shiftCount;
      patternPos = 0;
      fillWindow();
      const heads = chart.querySelector('#note-heads');
      const ctx = chart._ctx;
      const spacing = (ctx.STAFF_R - ctx.LEFT_PAD - 60) / (WINDOW_SIZE + 1);
      for (const el of heads.children) {
        el.style.transform = `translateX(${-spacing * shiftCount}px)`;
      }
      setTimeout(renderWindow, 150);
      if (statusEl) statusEl.textContent = '';
    }

    function updateScore() {
      if (scoreCorrectEl) scoreCorrectEl.textContent = correct;
      if (scoreWrongEl) scoreWrongEl.textContent = wrong;
    }

    function removeGhost() {
      if (ghostEl) {
        ghostEl.remove();
        ghostEl = null;
      }
    }

    function handleCorrect() {
      if (busy) return;
      busy = true;
      correct++;
      updateScore();
      patternPos++;
      const ctx = chart._ctx;
      const staffW = ctx.STAFF_R - ctx.LEFT_PAD - 60;
      const spacing = staffW / (WINDOW_SIZE + 1);
      const cx = ctx.LEFT_PAD + 30 + spacing * patternPos;
      chart.renderNoteHead(noteName(windowNotes[patternPos - 1]), 'correct', cx, true);
      if (statusEl) {
        statusEl.textContent = patternSize > 1 && patternPos < patternSize ? '✓' : '✓✓';
      }
      setTimeout(function () {
        if (patternPos >= patternSize) {
          busy = false;
          shiftWindow();
        } else {
          renderWindow();
          busy = false;
        }
      }, 250);
    }

    function handleWrong(midiPlayed) {
      if (busy) return;
      busy = true;
      wrong++;
      updateScore();
      const name = midiToNatural(midiPlayed);
      const naturalName = name.replace('s', '');
      const ctx = chart._ctx;
      const staffW = ctx.STAFF_R - ctx.LEFT_PAD - 60;
      const spacing = staffW / (WINDOW_SIZE + 1);
      const cx = ctx.LEFT_PAD + 30 + spacing * (patternPos + 1);
      chart.clearNoteHeads();
      renderWindow();
      ghostEl = chart.renderNoteHead(naturalName, 'ghost', cx, true);
      if (statusEl) statusEl.textContent = '✗';
    }

    function onMidi(midiNote, isNoteOn, isNoteOff) {
      if (destroyed) return;
      if (isNoteOn) {
        if (windowNotes.length === 0 || busy || patternPos >= windowNotes.length) return;
        const target = windowNotes[patternPos];
        if (target && midiNote === posToMidi(target)) {
          handleCorrect();
        } else {
          handleWrong(midiNote);
        }
      } else if (isNoteOff) {
        if (ghostEl) {
          removeGhost();
          busy = false;
          renderWindow();
        }
      }
    }

    function start() {
      patternPos = 0;
      noteArrayPos = 0;
      windowNotes = [];
      removeGhost();
      fillWindow();
      renderWindow();
      if (statusEl) statusEl.textContent = 'Play the highlighted note!';
      updateScore();
    }

    return {
      onMidi: onMidi,
      start: start,
      setPatternSize: function (size) {
        patternSize = size;
        start();
      },
      setNotes: function (notes) {
        noteArray = notes;
        randomGenerator = !notes || notes.length === 0;
        noteArrayPos = 0;
      },
      getNotes: function () {
        return windowNotes;
      },
      getPatternPos: function () {
        return patternPos;
      },
      getPatternSize: function () {
        return patternSize;
      },
      posToMidi: posToMidi,
      destroy: function () {
        destroyed = true;
        ghostEl = null;
      },
      getStats: function () {
        return { correct: correct, wrong: wrong };
      },
    };
  };
})();
