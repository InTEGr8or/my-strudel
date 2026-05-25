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
    <select id="trainer-range">
        <option value="full">Grand Staff (G2–F5)</option>
        <option value="treble">Treble Clef (E4–F5)</option>
        <option value="bass">Bass Clef (G2–A3)</option>
    </select>
    <select id="trainer-song" style="max-width:180px">
        <option value="">Random</option>
        <option value="mary">Mary Had a Little Lamb</option>
        <option value="hotcross">Hot Cross Buns</option>
        <option value="twinkle">Twinkle Twinkle</option>
        <option value="ode">Ode to Joy</option>
        <option value="jingle">Jingle Bells</option>
        <option value="minuet">Minuet in G (Bach)</option>
    </select>
    <div class="score-item" style="font-size:0.9rem;flex-direction:row;gap:0.3rem">
        <span style="opacity:0.7">Pattern:</span>
        <button class="pat-btn" data-pattern="1" onclick="setPatternSize(1)" style="font-size:0.8rem;padding:0.15rem 0.5rem;border-radius:6px;border:1px solid var(--border);background:var(--panel-bg);color:var(--text);cursor:pointer;font-weight:bold">1</button>
        <button class="pat-btn" data-pattern="2" onclick="setPatternSize(2)" style="font-size:0.8rem;padding:0.15rem 0.5rem;border-radius:6px;border:1px solid var(--border);background:var(--panel-bg);color:var(--text);cursor:pointer">2</button>
        <button class="pat-btn" data-pattern="3" onclick="setPatternSize(3)" style="font-size:0.8rem;padding:0.15rem 0.5rem;border-radius:6px;border:1px solid var(--border);background:var(--panel-bg);color:var(--text);cursor:pointer">3</button>
    </div>
    <label class="score-item" style="font-size:0.8rem;flex-direction:row;gap:0.3rem;cursor:pointer;user-select:none">
        <input type="checkbox" id="play-wrong-toggle" checked onchange="togglePlayWrong(this.checked)">
        <span style="opacity:0.7">Play wrong notes</span>
    </label>
    <div class="score-item">
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.9rem;">
            <input type="checkbox" id="metronome-toggle" onchange="toggleMetronome(this.checked)">
            <label for="metronome-toggle">♫</label>
            <span id="metro-dot" style="display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--accent);opacity:0;transition:opacity 0.05s"></span>
            <input type="range" id="metro-bpm" min="40" max="200" value="80" style="width:70px;height:4px" oninput="updateBpm(this.value)">
            <span id="bpm-label" style="font-size:0.8rem;opacity:0.7">80</span>
        </div>
    </div>
</div>

<script>
(function () {
    let chart;
    const statusEl = document.getElementById('trainer-status');
    const scoreEl = document.getElementById('score-correct');
    const wrongEl = document.getElementById('score-wrong');
    const rangeEl = document.getElementById('trainer-range');
    const songEl = document.getElementById('trainer-song');

    const WINDOW_SIZE = 8;

    const SCALE = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const SCALE_MIDI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const MIDI_NAMES = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];

    const SONGS = {
        mary: { label: 'Mary Had a Little Lamb', notes: [
            {note:'E',oct:4},{note:'D',oct:4},{note:'C',oct:4},{note:'D',oct:4},
            {note:'E',oct:4},{note:'E',oct:4},{note:'E',oct:4},
            {note:'D',oct:4},{note:'D',oct:4},{note:'D',oct:4},
            {note:'E',oct:4},{note:'G',oct:4},{note:'G',oct:4},
            {note:'E',oct:4},{note:'D',oct:4},{note:'C',oct:4},{note:'D',oct:4},
            {note:'E',oct:4},{note:'E',oct:4},{note:'E',oct:4},{note:'E',oct:4},
            {note:'D',oct:4},{note:'D',oct:4},{note:'E',oct:4},{note:'D',oct:4},{note:'C',oct:4},
        ]},
        hotcross: { label: 'Hot Cross Buns', notes: [
            {note:'E',oct:4},{note:'D',oct:4},{note:'C',oct:4},
            {note:'E',oct:4},{note:'D',oct:4},{note:'C',oct:4},
            {note:'C',oct:4},{note:'C',oct:4},{note:'D',oct:4},{note:'D',oct:4},
            {note:'E',oct:4},{note:'D',oct:4},{note:'C',oct:4},
        ]},
        twinkle: { label: 'Twinkle Twinkle', notes: [
            {note:'C',oct:4},{note:'C',oct:4},{note:'G',oct:4},{note:'G',oct:4},
            {note:'A',oct:4},{note:'A',oct:4},{note:'G',oct:4},
            {note:'F',oct:4},{note:'F',oct:4},{note:'E',oct:4},{note:'E',oct:4},
            {note:'D',oct:4},{note:'D',oct:4},{note:'C',oct:4},
        ]},
        ode: { label: 'Ode to Joy', notes: [
            {note:'E',oct:4},{note:'E',oct:4},{note:'F',oct:4},{note:'G',oct:4},
            {note:'G',oct:4},{note:'F',oct:4},{note:'E',oct:4},{note:'D',oct:4},
            {note:'C',oct:4},{note:'C',oct:4},{note:'D',oct:4},{note:'E',oct:4},
            {note:'E',oct:4},{note:'D',oct:4},{note:'D',oct:4},
        ]},
        jingle: { label: 'Jingle Bells', notes: [
            {note:'E',oct:4},{note:'E',oct:4},{note:'E',oct:4},
            {note:'E',oct:4},{note:'E',oct:4},{note:'E',oct:4},
            {note:'E',oct:4},{note:'G',oct:4},{note:'C',oct:4},{note:'D',oct:4},{note:'E',oct:4},
            {note:'F',oct:4},{note:'F',oct:4},{note:'F',oct:4},{note:'F',oct:4},
            {note:'F',oct:4},{note:'E',oct:4},{note:'E',oct:4},{note:'E',oct:4},{note:'E',oct:4},
            {note:'E',oct:4},{note:'D',oct:4},{note:'D',oct:4},{note:'E',oct:4},{note:'D',oct:4},{note:'G',oct:4},
        ]},
        minuet: { label: 'Minuet in G (Bach)', notes: [
            {note:'G',oct:4},{note:'A',oct:4},{note:'B',oct:4},{note:'C',oct:5},
            {note:'D',oct:5},{note:'C',oct:5},{note:'B',oct:4},{note:'A',oct:4},
            {note:'G',oct:4},{note:'F',oct:4},{note:'E',oct:4},{note:'D',oct:4},
            {note:'E',oct:4},{note:'F',oct:4},{note:'G',oct:4},{note:'G',oct:4},
            {note:'A',oct:4},{note:'G',oct:4},{note:'F',oct:4},{note:'E',oct:4},
            {note:'D',oct:4},{note:'C',oct:4},{note:'D',oct:4},{note:'E',oct:4},
            {note:'D',oct:4},{note:'C',oct:4},
        ]},
    };

    let correct = 0, wrong = 0;
    let windowNotes = [];
    let busy = false;
    let ghostEl = null;
    let noteCount = 0;
    let patternSize = 1;
    let patternPos = 0;
    let songPos = 0;

    // metronome
    let metroInterval = null;
    let metroBpm = 80;
    let metroBeat = 0;
    let metroAudioCtx = null;

    function metroClick(accent) {
        const dot = document.getElementById('metro-dot');
        if (dot) { dot.style.opacity = '1'; setTimeout(() => { dot.style.opacity = '0'; }, 100); }
        try {
            const ctx = metroAudioCtx || (metroAudioCtx = new (window.AudioContext || window.webkitAudioContext)());
            if (ctx.state === 'suspended') ctx.resume();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = accent ? 1200 : 800;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.04);
        } catch (_) {}
    }

    window.toggleMetronome = function (on) {
        if (on) {
            metroBeat = 0;
            if (metroInterval) clearInterval(metroInterval);
            metroInterval = setInterval(function () {
                metroClick(metroBeat % 4 === 0);
                metroBeat++;
            }, 60000 / metroBpm);
        } else {
            if (metroInterval) { clearInterval(metroInterval); metroInterval = null; }
        }
    };

    window.updateBpm = function (val) {
        metroBpm = parseInt(val);
        var label = document.getElementById('bpm-label');
        if (label) label.textContent = metroBpm;
        if (metroInterval) {
            clearInterval(metroInterval);
            metroBeat = 0;
            metroInterval = setInterval(function () {
                metroClick(metroBeat % 4 === 0);
                metroBeat++;
            }, 60000 / metroBpm);
        }
    };

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
        const songId = songEl.value;
        while (windowNotes.length < WINDOW_SIZE) {
            if (songId) {
                const song = SONGS[songId];
                if (song && song.notes.length > 0) {
                    windowNotes.push(song.notes[songPos % song.notes.length]);
                    songPos++;
                } else {
                    windowNotes.push(generateNext());
                }
            } else {
                windowNotes.push(generateNext());
            }
        }
    }

    function renderWindow() {
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

    function startExercise() {
        busy = false;
        correct = 0;
        wrong = 0;
        windowNotes = [];
        noteCount = 0;
        patternPos = 0;
        songPos = 0;
        removeGhost();
        fillWindow();
        renderWindow();
        statusEl.textContent = 'Play the highlighted note!';
        updateScore();
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
        patternPos++;

        const ctx = chart._ctx;
        const staffW = ctx.STAFF_R - ctx.LEFT_PAD - 60;
        const spacing = staffW / (WINDOW_SIZE + 1);
        const cx = ctx.LEFT_PAD + 30 + spacing * patternPos;
        chart.renderNoteHead(noteName(windowNotes[patternPos - 1]), 'correct', cx, true);
        statusEl.textContent = patternSize > 1 && patternPos < patternSize ? '✓' : '✓✓';

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

        statusEl.textContent = '✗';
    }

    function init() {
        chart = document.querySelector('note-chart');
        if (!window.__midiObservers || !chart || !chart._positions || !chart._ctx) {
            setTimeout(init, 20);
            return;
        }
        window.__midiObservers.push(function (midiNote, isNoteOn, isNoteOff) {
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
        });
        startExercise();
    }

    window.setPatternSize = function (size) {
        patternSize = size;
        document.querySelectorAll('.pat-btn').forEach(function (btn) {
            btn.style.fontWeight = btn.dataset.pattern == size ? 'bold' : 'normal';
        });
        startExercise();
    };

    window.togglePlayWrong = function (on) {
        localStorage.setItem('play-wrong-notes', on ? 'true' : 'false');
        window.__playMidiFilter = on ? null : function (midiNote) {
            if (windowNotes.length === 0) return true;
            const target = windowNotes[patternPos];
            return target && midiNote === posToMidi(target);
        };
    };

    var pwSaved = localStorage.getItem('play-wrong-notes');
    if (pwSaved === 'false') {
        document.getElementById('play-wrong-toggle').checked = false;
        window.__playMidiFilter = function (midiNote) {
            if (windowNotes.length === 0) return true;
            const target = windowNotes[patternPos];
            return target && midiNote === posToMidi(target);
        };
    }

    rangeEl.addEventListener('change', startExercise);
    songEl.addEventListener('change', startExercise);

    setTimeout(init, 0);
})();
</script>
