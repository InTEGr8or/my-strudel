---
title: "Diatonic Triads in C Major"
key: "C"
type: "lesson"
lessonType: "chord"
difficulty: "intermediate"
order: 7
description: "Learn all seven triads built from the C major scale."
layout: layout.njk
tags: lessons
---

<style>
#lesson-content { max-width: 720px; margin: 0 auto 2rem; line-height: 1.7; font-size: 1rem; }
#lesson-content h2 { margin-top: 2rem; color: var(--accent); }
#lesson-content h3 { margin-top: 1.5rem; color: var(--accent); opacity: 0.85; }
#lesson-content p { color: var(--text); opacity: 0.9; }
#lesson-content .triad-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.6rem; margin: 1.5rem 0; }
#lesson-content .triad-card { padding: 0.6rem; border-radius: 8px; background: var(--panel-bg); border: 1px solid var(--border); text-align: center; }
#lesson-content .triad-card .t-name { font-size: 1rem; font-weight: bold; }
#lesson-content .triad-card .t-notes { font-size: 0.8rem; color: var(--text); opacity: 0.7; margin-top: 0.2rem; }
#lesson-content .triad-card .t-roman { font-size: 1.2rem; font-weight: bold; color: var(--accent); margin-bottom: 0.3rem; }
#lesson-content .triad-card.major { border-color: #2ecc71; }
#lesson-content .triad-card.major .t-roman { color: #2ecc71; }
#lesson-content .triad-card.minor { border-color: #e74c3c; }
#lesson-content .triad-card.minor .t-roman { color: #e74c3c; }
#lesson-content .triad-card.diminished { border-color: #9b59b6; }
#lesson-content .triad-card.diminished .t-roman { color: #9b59b6; }
#lesson-content .chord-preview { margin: 1rem 0; padding: 1rem; background: var(--panel-bg); border: 1px solid var(--border); border-radius: 12px; text-align: center; }
#lesson-content .chord-preview p { margin: 0; font-size: 0.9rem; }
#lesson-content .chord-preview strong { color: var(--accent); }
#lesson-content .prog-example { font-family: monospace; font-size: 1.1rem; color: var(--accent); text-align: center; padding: 0.5rem; margin: 0.5rem 0; }
#trainer-panel { display: flex; justify-content: center; align-items: center; gap: 2rem; padding: 0.5rem 0; flex-wrap: wrap; }
.score-item { text-align: center; font-size: 0.9rem; color: var(--text); opacity: 0.8; display: flex; flex-direction: column; }
.score-item strong { font-size: 1.2rem; color: var(--accent); }

</style>

<div id="lesson-content">

## Diatonic Triads in C Major

**Diatonic** means "within the key." Every note of the C major scale can be the root of a triad built entirely from the notes of that scale. These seven triads form the harmonic foundation of C major.

### The Seven Triads

<div class="triad-grid">
  <div class="triad-card major">
    <div class="t-roman">I</div>
    <div class="t-name">C Major</div>
    <div class="t-notes">C–E–G</div>
  </div>
  <div class="triad-card minor">
    <div class="t-roman">ii</div>
    <div class="t-name">D Minor</div>
    <div class="t-notes">D–F–A</div>
  </div>
  <div class="triad-card minor">
    <div class="t-roman">iii</div>
    <div class="t-name">E Minor</div>
    <div class="t-notes">E–G–B</div>
  </div>
  <div class="triad-card major">
    <div class="t-roman">IV</div>
    <div class="t-name">F Major</div>
    <div class="t-notes">F–A–C</div>
  </div>
  <div class="triad-card major">
    <div class="t-roman">V</div>
    <div class="t-name">G Major</div>
    <div class="t-notes">G–B–D</div>
  </div>
  <div class="triad-card minor">
    <div class="t-roman">vi</div>
    <div class="t-name">A Minor</div>
    <div class="t-notes">A–C–E</div>
  </div>
  <div class="triad-card diminished">
    <div class="t-roman">vii°</div>
    <div class="t-name">B Diminished</div>
    <div class="t-notes">B–D–F</div>
  </div>
</div>

### The Pattern

The diatonic triads follow a consistent pattern in every major key:

**Major, Minor, Minor, Major, Major, Minor, Diminished**

In Roman numeral notation: **I ii iii IV V vi vii°**

The uppercase numerals (I, IV, V) are major chords. The lowercase numerals (ii, iii, vi) are minor chords. The lowercase with ° (vii°) is diminished.

### Common Chord Progressions

The most common chord progressions in Western music use these diatonic triads:

<div class="prog-example">I–IV–V–I : C F G C</div>
<div class="prog-example">I–V–vi–IV : C G Am F</div>
<div class="prog-example">ii–V–I : Dm G C</div>
<div class="prog-example">vi–IV–I–V : Am F C G</div>

### Practice

The exercises below walk through the diatonic triads and common progressions. Play each chord as an arpeggio — notice how each triad has a distinct character, even though they all come from the same scale.

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

<div class="chord-preview">
  <p><strong>Diatonic Triads</strong> — All seven chords in the key of C major</p>
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
    var LESSON_NOTES = {% lessonNotes 'diatonic-triads' %};
    var trainer = null;
    var CHORD_NOTES = [{note:'C',oct:4},{note:'E',oct:4},{note:'G',oct:4}];

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
        chart.renderChordReference(CHORD_NOTES);
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
