---
title: Sight Reading Trainer
type: trainer
description: Practice reading notes on the grand staff with your MIDI keyboard. Notes highlight green on correct, ghost on wrong.
---

<style>
#play-btn, #stop-btn { display: none; }
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
#trainer-status {
    text-align: center;
    min-height: 1.8rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--accent);
}
#trainer-status.wrong { color: #dc3545; }
#trainer-status.correct { color: #28a745; }
#trainer-status.done { color: var(--highlight); }
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
    <select id="trainer-range">
        <option value="full">Grand Staff (G2–F5)</option>
        <option value="treble">Treble Clef (E4–F5)</option>
        <option value="bass">Bass Clef (G2–A3)</option>
    </select>
</div>

<script>
(function () {
    document.querySelector('.editor-container').style.display = 'none';

    const chart = document.querySelector('note-chart');
    const statusEl = document.getElementById('trainer-status');
    const scoreEl = document.getElementById('score-correct');
    const wrongEl = document.getElementById('score-wrong');
    const rangeEl = document.getElementById('trainer-range');

    const SEQ_LEN = 6;
    const NATURAL_MIDI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    let correct = 0, wrong = 0;
    let sequence = [];
    let currentIdx = 0;
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

    function generateSequence() {
        const seq = [];
        for (let i = 0; i < SEQ_LEN; i++) {
            seq.push(pickRandomNote());
        }
        return seq;
    }

    function renderSequence() {
        chart.clearNoteHeads();
        const ctx = chart._ctx;
        if (!ctx) return;
        const staffW = ctx.STAFF_R - ctx.LEFT_PAD;
        const spacing = staffW / (SEQ_LEN + 1);

        sequence.forEach((pos, i) => {
            const cx = ctx.LEFT_PAD + spacing * (i + 1);
            let type;
            if (i < currentIdx) {
                type = 'correct';
            } else if (i === currentIdx) {
                type = 'target';
            } else {
                type = 'pending';
            }
            chart.renderNoteHead(noteName(pos), type, cx);
        });
    }

    function startSequence() {
        busy = false;
        sequence = generateSequence();
        currentIdx = 0;
        renderSequence();
        statusEl.textContent = 'Play the highlighted note';
        statusEl.className = '';
    }

    function advanceSequence() {
        currentIdx++;
        if (currentIdx >= sequence.length) {
            statusEl.textContent = '✓ Sequence complete! New one coming...';
            statusEl.className = 'done';
            renderSequence();
            setTimeout(startSequence, 1500);
        } else {
            renderSequence();
            statusEl.textContent = '';
            statusEl.className = '';
        }
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
        renderSequence();
        setTimeout(function () {
            busy = false;
            advanceSequence();
        }, 400);
    }

    function handleWrong() {
        if (busy) return;
        busy = true;
        wrong++;
        chart.renderNoteHead(noteName(sequence[currentIdx]), 'ghost');
        statusEl.textContent = '✗ Try again';
        statusEl.className = 'wrong';
        updateScore();
        setTimeout(function () {
            busy = false;
            renderSequence();
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
            if (!isNoteOn || currentIdx >= sequence.length || busy) return;
            const target = sequence[currentIdx];
            const targetMidi = naturalToMidi(target.note, target.oct);
            if (midiNote === targetMidi) {
                handleCorrect();
            } else {
                handleWrong();
            }
        });
        startSequence();
    }

    rangeEl.addEventListener('change', function () {
        startSequence();
    });

    setTimeout(init, 0);
})();
</script>
