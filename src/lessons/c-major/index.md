---
title: "C Major Scale"
key: "C"
type: "lesson"
lessonType: "major"
difficulty: "beginner"
order: 1
description: "Learn the notes in the C major scale — the foundation of all Western music."
layout: layout.njk
tags: lessons
---

<style>
#lesson-content { max-width: 720px; margin: 0 auto 2rem; line-height: 1.7; font-size: 1rem; }
#lesson-content h2 { margin-top: 2rem; color: var(--accent); }
#lesson-content p { color: var(--text); opacity: 0.9; }
#lesson-content .scale-diagram { display: flex; justify-content: center; gap: 0.5rem; margin: 1.5rem 0; flex-wrap: wrap; }
#lesson-content .scale-note { width: 3rem; height: 3rem; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--panel-bg); border: 2px solid var(--border); font-size: 1.1rem; font-weight: bold; color: var(--accent); }
#trainer-panel { display: flex; justify-content: center; align-items: center; gap: 2rem; padding: 0.5rem 0; flex-wrap: wrap; }
.score-item { text-align: center; font-size: 0.9rem; color: var(--text); opacity: 0.8; display: flex; flex-direction: column; }
.score-item strong { font-size: 1.2rem; color: var(--accent); }

</style>

<div id="lesson-content">

## The Key of C Major

The C major scale is the most fundamental scale in Western music. It consists of the seven natural notes: **C, D, E, F, G, A, B** — no sharps or flats.

<div class="scale-diagram">
  <span class="scale-note">C</span>
  <span class="scale-note">D</span>
  <span class="scale-note">E</span>
  <span class="scale-note">F</span>
  <span class="scale-note">G</span>
  <span class="scale-note">A</span>
  <span class="scale-note">B</span>
</div>

### The Whole-Step / Half-Step Pattern

All major scales follow the same interval pattern:

**W W H W W W H**

| Step | From | To | Interval |
|------|------|----|----------|
| 1 | C | D | Whole step |
| 2 | D | E | Whole step |
| 3 | E | F | Half step |
| 4 | F | G | Whole step |
| 5 | G | A | Whole step |
| 6 | A | B | Whole step |
| 7 | B | C | Half step |

### On the Piano

On the piano keyboard, C major uses only the white keys. Place your thumb on middle C and play each white key up to the next C.

### Practice

Play the exercises below with your MIDI keyboard. The highlighted note on the staff is what you need to play. Start with the scale ascending and descending, then try the broken thirds, and finally the arpeggio.

{%- assign nav = collections.all | lessonNav: page -%}
{%- if nav.prev or nav.next -%}
<div style="display:flex;justify-content:space-between;margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--border);">
  <div>
    {%- if nav.prev -%}
    <a href="{{ nav.prev.url }}" style="color:var(--accent);text-decoration:none;font-size:1rem;">← {{ nav.prev.data.title }}</a>
    {%- endif -%}
  </div>
  <div style="text-align:right">
    {%- if nav.next -%}
    <a href="{{ nav.next.url }}" style="color:var(--accent);text-decoration:none;font-size:1rem;">{{ nav.next.data.title }} →</a>
    {%- endif -%}
  </div>
</div>
{%- endif -%}
</div>


<div id="trainer-panel">
    <div class="score-item">Correct<br><strong id="score-correct">0</strong></div>
    <div class="score-item">Wrong<br><strong id="score-wrong">0</strong></div>
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
            <input type="range" id="metro-bpm" min="20" max="200" value="80" style="width:70px;height:4px" oninput="updateBpm(this.value)">
            <span id="bpm-label" style="font-size:0.8rem;opacity:0.7">80</span>
        </div>
    </div>
</div>

<script>
(function () {
    var LESSON_NOTES = {% lessonNotes 'c-major' %};
    var trainer = null;

    var metroInterval = null;
    var metroBpm = 80;
    var metroBeat = 0;
    var metroAudioCtx = null;

    function metroClick(accent) {
        var dot = document.getElementById('metro-dot');
        if (dot) { dot.style.opacity = '1'; setTimeout(function () { dot.style.opacity = '0'; }, 100); }
        try {
            var ctx = metroAudioCtx || (metroAudioCtx = new (window.AudioContext || window.webkitAudioContext)());
            if (ctx.state === 'suspended') ctx.resume();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
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

    function init() {
        var chart = document.querySelector('note-chart');
        if (!window.__midiObservers || !chart || !chart._positions || !chart._ctx) {
            setTimeout(init, 20);
            return;
        }
        trainer = window.createTrainer({
            chartEl: chart,

            scoreCorrectEl: document.getElementById('score-correct'),
            scoreWrongEl: document.getElementById('score-wrong'),
        });
        trainer.setNotes(LESSON_NOTES);
        window.__midiObservers.push(function (midiNote, isNoteOn, isNoteOff) {
            trainer.onMidi(midiNote, isNoteOn, isNoteOff);
        });
        trainer.start();
    }

    window.setPatternSize = function (size) {
        if (!trainer) return;
        trainer.setPatternSize(size);
        document.querySelectorAll('.pat-btn').forEach(function (btn) {
            btn.style.fontWeight = btn.dataset.pattern == size ? 'bold' : 'normal';
        });
    };

    window.togglePlayWrong = function (on) {
        localStorage.setItem('play-wrong-notes', on ? 'true' : 'false');
        window.__playMidiFilter = on ? null : function (midiNote) {
            if (!trainer) return true;
            var notes = trainer.getNotes();
            if (notes.length === 0) return true;
            var target = notes[trainer.getPatternPos()];
            return target && midiNote === trainer.posToMidi(target);
        };
    };

    var pwSaved = localStorage.getItem('play-wrong-notes');
    if (pwSaved === 'false') {
        document.getElementById('play-wrong-toggle').checked = false;
        window.__playMidiFilter = function (midiNote) {
            if (!trainer) return true;
            var notes = trainer.getNotes();
            if (notes.length === 0) return true;
            var target = notes[trainer.getPatternPos()];
            return target && midiNote === trainer.posToMidi(target);
        };
    }

    setTimeout(init, 0);
})();
</script>
