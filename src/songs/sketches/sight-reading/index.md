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
#trainer-status.wrong { color: #dc3545; }
#trainer-status.correct { color: #28a745; }
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

    const VISIBLE = 7;
    const SCALE = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const SCALE_MIDI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

    let correct = 0, wrong = 0;
    let window = [];
    let currentIdx = 0;
    let busy = false;

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

    // Musical pattern generator: diatonic stepwise melody
    function generateNext() {
        const pool = getRange();
        if (window.length === 0) return pickRandomNote();

        const prev = window[window.length - 1];
        const prevIdx = SCALE.indexOf(prev.note);
        if (prevIdx === -1) return pickRandomNote();

        // try up to 10 times to find a valid note in range
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
                // slightly favour changing direction to avoid staircasing
                return candidate;
            }
        }
        return pickRandomNote();
    }

    function fillWindow() {
        while (window.length < VISIBLE + 5) {
            window.push(generateNext());
        }
    }

    function renderWindow() {
        chart.clearNoteHeads();
        const ctx = chart._ctx;
        if (!ctx) return;
        const staffW = ctx.STAFF_R - ctx.LEFT_PAD - 60;
        const spacing = staffW / (VISIBLE + 1);
        const offset = 30;

        for (let i = 0; i < VISIBLE && i < window.length; i++) {
            const pos = window[i];
            const cx = ctx.LEFT_PAD + offset + spacing * (i + 1);
            let type;
            if (i < currentIdx) type = 'correct';
            else if (i === currentIdx) type = 'target';
            else type = 'pending';
            chart.renderNoteHead(noteName(pos), type, cx);
        }
    }

    function startExercise() {
        busy = false;
        correct = 0;
        wrong = 0;
        window = [];
        currentIdx = 0;
        fillWindow();
        renderWindow();
        statusEl.textContent = 'Play the highlighted note!';
        statusEl.className = '';
        updateScore();
    }

    function advance() {
        currentIdx++;
        if (currentIdx >= VISIBLE) {
            // slide window forward
            window.splice(0, Math.floor(VISIBLE / 2));
            currentIdx -= Math.floor(VISIBLE / 2);
            fillWindow();
        }
        renderWindow();
        statusEl.textContent = '';
        statusEl.className = '';
    }

    function updateScore() {
        scoreEl.textContent = correct;
        wrongEl.textContent = wrong;
    }

    function handleCorrect() {
        if (busy) return;
        busy = true;
        correct++;
        statusEl.textContent = '✓';
        statusEl.className = 'correct';
        updateScore();
        setTimeout(function () {
            busy = false;
            advance();
        }, 300);
    }

    function handleWrong() {
        if (busy) return;
        busy = true;
        wrong++;
        const pos = window[currentIdx];
        chart.renderNoteHead(noteName(pos), 'ghost');
        statusEl.textContent = '✗ Try again';
        statusEl.className = 'wrong';
        updateScore();
        setTimeout(function () {
            busy = false;
            renderWindow();
            statusEl.textContent = '';
            statusEl.className = '';
        }, 800);
    }

    function init() {
        if (!window.__midiObservers || !chart || !chart._positions || !chart._ctx) {
            setTimeout(init, 20);
            return;
        }
        window.__midiObservers.push(function (midiNote, isNoteOn, isNoteOff) {
            if (!isNoteOn || currentIdx >= window.length || busy) return;
            const target = window[currentIdx];
            if (midiNote === posToMidi(target)) {
                handleCorrect();
            } else {
                handleWrong();
            }
        });
        startExercise();
    }

    rangeEl.addEventListener('change', startExercise);

    setTimeout(init, 0);
})();
</script>
