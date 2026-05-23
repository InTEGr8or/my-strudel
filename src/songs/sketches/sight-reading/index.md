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
#trainer-panel button {
    background: var(--accent);
    color: white;
    border: none;
    padding: 0.5rem 1.2rem;
    border-radius: 10px;
    font-family: inherit;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
}
#trainer-panel button:hover {
    filter: brightness(1.2);
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
.score-item.streak strong { color: var(--highlight); }
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

<div id="trainer-status">Press a key to begin!</div>
<div id="trainer-panel">
    <div class="score-item">
        Score
        <strong id="score-correct">0</strong>
    </div>
    <div class="score-item wrong">
        Wrong
        <strong id="score-wrong">0</strong>
    </div>
    <div class="score-item streak">
        Streak
        <strong id="score-streak">0</strong>
    </div>
    <select id="trainer-range">
        <option value="full">Grand Staff (G2–F5)</option>
        <option value="treble">Treble Clef (E4–F5)</option>
        <option value="bass">Bass Clef (G2–A3)</option>
    </select>
    <button id="btn-next">Next Note</button>
</div>

<script>
(function () {
    document.querySelector('.editor-container').style.display = 'none';

    const chart = document.querySelector('note-chart');
    const statusEl = document.getElementById('trainer-status');
    const scoreEl = document.getElementById('score-correct');
    const wrongEl = document.getElementById('score-wrong');
    const streakEl = document.getElementById('score-streak');
    const rangeEl = document.getElementById('trainer-range');
    const nextBtn = document.getElementById('btn-next');

    const NATURAL_MIDI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    let correct = 0, wrong = 0, streak = 0;
    let targetPos = null;
    let targetMidi = null;
    let busy = false;

    function naturalToMidi(note, oct) {
        return (oct + 1) * 12 + NATURAL_MIDI[note];
    }

    function getRange() {
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

    function noteName(pos) {
        return pos.note.toLowerCase() + pos.oct;
    }

    function showTarget(pos) {
        chart.clearNoteHeads();
        chart.renderNoteHead(noteName(pos), 'target');
        targetPos = pos;
        targetMidi = naturalToMidi(pos.note, pos.oct);
        statusEl.textContent = '';
        statusEl.className = '';
    }

    function nextNote() {
        busy = false;
        showTarget(pickRandomNote());
    }

    function updateScore() {
        scoreEl.textContent = correct;
        wrongEl.textContent = wrong;
        streakEl.textContent = streak;
    }

    function handleCorrect() {
        if (busy) return;
        busy = true;
        correct++;
        streak++;
        chart.clearNoteHeads();
        chart.renderNoteHead(noteName(targetPos), 'correct');
        statusEl.textContent = '✓ Correct!';
        statusEl.className = 'correct';
        updateScore();
        setTimeout(nextNote, 600);
    }

    function handleWrong(midiPlayed) {
        if (busy) return;
        busy = true;
        wrong++;
        streak = 0;
        chart.clearNoteHeads();
        chart.renderNoteHead(noteName(targetPos), 'ghost');
        statusEl.textContent = '✗ Try again';
        statusEl.className = 'wrong';
        updateScore();
        setTimeout(nextNote, 1000);
    }

    function init() {
        if (!window.__midiObservers || !chart || !chart._positions) {
            setTimeout(init, 20);
            return;
        }
        window.__midiObservers.push(function (midiNote, isNoteOn, isNoteOff) {
            if (!isNoteOn || targetMidi === null || busy) return;
            if (midiNote === targetMidi) {
                handleCorrect();
            } else {
                handleWrong(midiNote);
            }
        });
        nextNote();
    }

    rangeEl.addEventListener('change', function () {
        nextNote();
    });

    nextBtn.addEventListener('click', function () {
        busy = false;
        nextNote();
    });

    setTimeout(init, 0);
})();
</script>
