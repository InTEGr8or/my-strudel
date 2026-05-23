---
title: Sight Reading Trainer
type: trainer
description: Practice reading notes on the grand staff with your MIDI keyboard. Notes highlight green on correct, ghost on wrong.
---

<style>
#trainer-panel {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    padding: 0.5rem 0;
    flex-wrap: wrap;
}
#trainer-panel select {
    background: var(--header-bg);
    color: var(--text);
    border: 2px solid var(--border);
    padding: 0.4rem 0.8rem;
    border-radius: 10px;
    font-family: inherit;
    font-size: 1rem;
}
.score-item {
    text-align: center;
    font-size: 0.9rem;
    color: var(--text);
    opacity: 0.8;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
}
.score-item strong {
    display: block;
    font-size: 1.5rem;
    color: var(--accent);
    opacity: 1;
}
.score-item.wrong strong { color: #dc3545; }
#trainer-status {
    text-align: center;
    min-height: 1.8rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--accent);
}
</style>

<div id="trainer-status">Play the highlighted note to begin!</div>
<div id="trainer-panel">
    <div class="score-item">
        Score
        <strong id="score-correct">0</strong>
    </div>
    <div class="score-item wrong">
        Wrong
        <strong id="score-wrong">0</strong>
    </div>
    <div class="score-item">
        Notes at once
        <select id="trainer-chord">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
        </select>
    </div>
    <select id="trainer-range">
        <option value="full">Grand Staff (G2–F5)</option>
        <option value="treble">Treble Clef (E4–F5)</option>
        <option value="bass">Bass Clef (G2–A3)</option>
    </select>
</div>

<script>
(function () {
    const chart = document.querySelector('note-chart');
    const statusEl = document.getElementById('trainer-status');
    const scoreEl = document.getElementById('score-correct');
    const wrongEl = document.getElementById('score-wrong');
    const rangeEl = document.getElementById('trainer-range');
    const chordEl = document.getElementById('trainer-chord');

    const SCALE = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const SCALE_MIDI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const MIDI_NAMES = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];

    let correct = 0, wrong = 0;
    let windowNotes = [];
    let busy = false;
    let ghostEl = null;

    function midiToNatural(midi) {
        const oct = Math.floor(midi / 12) - 1;
        return MIDI_NAMES[midi % 12] + oct;
    }

    function naturalToMidi(note, oct) {
        return (oct + 1) * 12 + SCALE_MIDI[note];
    }

    function getRange() {
        const all = chart._positions;
        const val = rangeEl.value;
        if (val === 'treble') return all.slice(12);
        if (val === 'bass') return all.slice(0, 9);
        return all;
    }

    function noteName(pos) {
        return pos.note.toLowerCase() + pos.oct;
    }

    function posToMidi(pos) {
        return naturalToMidi(pos.note, pos.oct);
    }

    function pickRandomNote() {
        const pool = getRange();
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function generateNext() {
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
        const chordSize = parseInt(chordEl.value, 10);
        while (windowNotes.length < chordSize + 3) {
            windowNotes.push(generateNext());
        }
    }

    function renderWindow() {
        chart.clearNoteHeads();
        const ctx = chart._ctx;
        if (!ctx) return;
        const chordSize = parseInt(chordEl.value, 10);
        const staffW = ctx.STAFF_R - ctx.LEFT_PAD - 60;
        const spacing = staffW / (chordSize + 1);
        const offset = 30;

        for (let i = 0; i < chordSize && i < windowNotes.length; i++) {
            const pos = windowNotes[i];
            const cx = ctx.LEFT_PAD + offset + spacing * (i + 1);
            const type = i === 0 ? 'target' : 'pending';
            chart.renderNoteHead(noteName(pos), type, cx);
        }
    }

    function startExercise() {
        busy = false;
        correct = 0;
        wrong = 0;
        windowNotes = [];
        removeGhost();
        fillWindow();
        renderWindow();
        statusEl.textContent = 'Play the highlighted note!';
        updateScore();
    }

    function shiftWindow() {
        windowNotes.shift();
        fillWindow();
        renderWindow();
        statusEl.textContent = '';
    }

    function updateScore() {
        scoreEl.textContent = correct;
        wrongEl.textContent = wrong;
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

        // flash green briefly, then shift
        const ctx = chart._ctx;
        const staffW = ctx.STAFF_R - ctx.LEFT_PAD - 60;
        const spacing = staffW / (parseInt(chordEl.value, 10) + 1);
        const cx = ctx.LEFT_PAD + 30 + spacing;
        chart.renderNoteHead(noteName(windowNotes[0]), 'correct', cx);

        statusEl.textContent = '✓';
        setTimeout(function () {
            busy = false;
            shiftWindow();
        }, 200);
    }

    function handleWrong(midiPlayed) {
        if (busy) return;
        busy = true;
        wrong++;
        updateScore();

        // show ghost at the wrong note's staff position
        const name = midiToNatural(midiPlayed);
        const naturalName = name.replace('s', '');
        const ctx = chart._ctx;
        const staffW = ctx.STAFF_R - ctx.LEFT_PAD - 60;
        const spacing = staffW / (parseInt(chordEl.value, 10) + 1);
        const cx = ctx.LEFT_PAD + 30 + spacing;

        chart.clearNoteHeads();
        renderWindow();
        chart.renderNoteHead(naturalName, 'ghost', cx);

        statusEl.textContent = '✗';
    }

    function init() {
        if (!window.__midiObservers || !chart || !chart._positions || !chart._ctx) {
            setTimeout(init, 20);
            return;
        }
        window.__midiObservers.push(function (midiNote, isNoteOn, isNoteOff) {
            if (isNoteOn) {
                if (windowNotes.length === 0 || busy) return;
                const target = windowNotes[0];
                if (midiNote === posToMidi(target)) {
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
        });
        startExercise();
    }

    rangeEl.addEventListener('change', startExercise);
    chordEl.addEventListener('change', startExercise);

    setTimeout(init, 0);
})();
</script>
