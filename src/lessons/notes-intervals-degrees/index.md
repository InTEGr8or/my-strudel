---
title: "Notes, intervals, and scale degrees"
key: "C"
type: "lesson"
lessonType: "foundations"
difficulty: "beginner"
order: 0
description: "The words first: note, pitch, octave, tonic, scale, degree, interval. Then many short things to play on the MIDI keyboard."
layout: layout.njk
tags: lessons
templateEngineOverride: njk
---

<style>
#lesson-content { max-width: 780px; margin: 0 auto 1.5rem; line-height: 1.7; font-size: 1.05rem; }
#lesson-content h2 { margin-top: 2.1rem; color: var(--accent); }
#lesson-content h3 { margin-top: 1.4rem; }
#lesson-content p { color: var(--text); opacity: 0.92; }
#lesson-content .word { font-weight: 800; color: var(--accent); }
#lesson-content .num-row { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.8rem 0 1rem; }
#lesson-content .num { min-width: 2.4rem; height: 2.4rem; padding: 0 0.45rem; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: var(--panel-bg); border: 2px solid var(--border); font-weight: 800; color: var(--accent); cursor: pointer; user-select: none; touch-action: manipulation; }
#lesson-content .num:hover, #lesson-content .num.playing { border-color: var(--accent); background: var(--accent); color: #fff; }
#lesson-content .num small { display: block; font-size: 0.65rem; font-weight: 700; opacity: 0.7; margin-left: 0.25rem; }
#lesson-content .def { background: var(--panel-bg); border-left: 4px solid var(--accent); padding: 0.7rem 1rem; border-radius: 0 10px 10px 0; margin: 0.8rem 0 1.1rem; }
#lesson-content table { width: 100%; border-collapse: collapse; margin: 0.8rem 0 1.2rem; font-size: 0.95rem; }
#lesson-content th, #lesson-content td { border-bottom: 1px solid var(--border); padding: 0.35rem 0.45rem; text-align: left; }
#freq-lab { background: var(--panel-bg); border: 2px solid var(--border); border-radius: 14px; padding: 1rem 1.1rem; margin: 1rem 0 1.4rem; }
#freq-lab .freq-row { display: flex; flex-wrap: wrap; align-items: center; gap: 0.7rem; }
#freq-hz { font-size: 1.6rem; font-weight: 800; color: var(--accent); min-width: 5.5rem; }
#freq-note { font-size: 1.25rem; font-weight: 800; }
#freq-slider { width: min(100%, 420px); }
#trainer-panel { display: flex; justify-content: center; align-items: center; gap: 1rem; padding: 0.5rem 0; flex-wrap: wrap; }
.score-item { text-align: center; font-size: 0.9rem; color: var(--text); opacity: 0.8; display: flex; flex-direction: column; }
.score-item strong { font-size: 1.2rem; color: var(--accent); }
#tune-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.6rem; margin: 1rem 0 0.5rem; }
.tune-card { text-align: left; background: var(--panel-bg); border: 2px solid var(--border); border-radius: 12px; padding: 0.55rem 0.7rem; cursor: pointer; font-family: inherit; color: var(--text); }
.tune-card:hover { border-color: var(--accent); }
.tune-card.active { border-color: var(--accent); background: var(--accent); color: #fff; }
.tune-card .tune-n { font-size: 0.7rem; font-weight: 800; opacity: 0.7; }
.tune-card .tune-title { font-weight: 800; font-size: 0.92rem; }
</style>

<div id="lesson-content">

<h2>A practice box, not a typing class</h2>

<p>On a computer we <strong>type</strong>. On a piano we <strong>play</strong>. We <strong>press keys</strong>. A line of keys one after another is a <strong>sequence</strong> (a little melody). Two or more keys at the same time make a <strong>chord</strong>.</p>

<p>The big staff under this lesson is our <strong>practice box</strong>. It is like a REPL: each card below is a tiny program. Tap a card, then play those notes on the MIDI keyboard. Wait mode waits for the right key. Same idea many times on purpose, so your fingers and your words get used to each other.</p>

<p>We can only drive <strong>one live staff</strong> at a time (the one at the bottom). The cards are the many examples. Tap or hold a letter chip to hear it.</p>

<h2>The words, one at a time</h2>

<h3>Note</h3>

<div class="def">A <span class="word">note</span> is one musical atom: one sound we can name and write.</div>

<p>The atom on the piano is a <strong>key</strong>. Press middle <strong>C</strong>. That is one note.</p>

<div class="num-row">
  <span class="num" data-play="C4" role="button" tabindex="0">C</span>
</div>

<h3>Pitch</h3>

<div class="def"><span class="word">Pitch</span> is how high or low a note sounds.</div>

<p>Left on the piano is lower. Right is higher. On a guitar, a thicker string is usually lower. A thinner string is higher.</p>

<h3>Letter names</h3>

<p>We recycle seven letters, then start over:</p>

<div class="num-row">
  <span class="num" data-play="C4" role="button" tabindex="0">C</span>
  <span class="num" data-play="D4" role="button" tabindex="0">D</span>
  <span class="num" data-play="E4" role="button" tabindex="0">E</span>
  <span class="num" data-play="F4" role="button" tabindex="0">F</span>
  <span class="num" data-play="G4" role="button" tabindex="0">G</span>
  <span class="num" data-play="A4" role="button" tabindex="0">A</span>
  <span class="num" data-play="B4" role="button" tabindex="0">B</span>
</div>

<p>After B comes C again — the next <strong>octave</strong>.</p>

<h3>Octave</h3>

<div class="def">An <span class="word">octave</span> is the same letter, one “same-but-higher” (or lower) away. Count 1 on the first C and 8 on the next C. <em>Octo</em> means eight.</div>

<p>A good guitar picture: play a string open, then press at the <strong>12th fret</strong>. Same letter, one octave higher. On the piano, C to the next C is the same jump.</p>

<p>We write the octave with a number: <strong>C4</strong> is middle C, <strong>C5</strong> is the C above it.</p>

<div class="num-row">
  <span class="num" data-play="C4" role="button" tabindex="0">C4</span>
  <span class="num" data-play="C5" role="button" tabindex="0">C5</span>
</div>

<h3>Sharp and flat</h3>

<p>The black keys have two names.</p>

<div class="def">A <span class="word">sharp</span> (♯) is one key to the <strong>right</strong> (a little higher). A <span class="word">flat</span> (♭) is one key to the <strong>left</strong> (a little lower). The same black key can be F♯ or G♭.</div>

<div class="num-row">
  <span class="num" data-play="F4" role="button" tabindex="0">F</span>
  <span class="num" data-play="F#4" role="button" tabindex="0">F♯</span>
  <span class="num" data-play="G4" role="button" tabindex="0">G</span>
</div>

<h3>Semitone and whole step</h3>

<div class="def">A <span class="word">semitone</span> (half step) is the distance to the very next key, black or white. A <span class="word">whole step</span> is two semitones (skip one key).</div>

<p>C to C♯ is a semitone. C to D is a whole step.</p>

<div class="num-row">
  <span class="num" data-play="C4" role="button" tabindex="0">C</span>
  <span class="num" data-play="C#4" role="button" tabindex="0">C♯</span>
  <span class="num" data-play="D4" role="button" tabindex="0">D</span>
</div>

<h3>Tonic (home)</h3>

<div class="def">The <span class="word">tonic</span> is the home note of a piece or a scale. It is also called degree <strong>1</strong>, and sometimes the <strong>root</strong> when we build a chord.</div>

<p>In this lesson home is <strong>C</strong>, unless we say otherwise.</p>

<h2>A little sound lab (440 to 880)</h2>

<p><strong>A4</strong> is often tuned to <strong>440</strong> vibrations per second. The A one octave higher is <strong>880</strong> — twice as many. You do not need that number to play. It is here so you can <em>hear</em> one octave as a smooth slide.</p>

<p>The small Donner keyboard only goes up to <strong>C5</strong> (~523). The slider can go past that, up to A5, so you can hear a full A-to-A octave. Turn the tone on, then slide.</p>

<div id="freq-lab">
  <div class="freq-row">
    <button type="button" id="freq-toggle">Tone off</button>
    <span id="freq-hz">440</span>
    <span>Hz</span>
    <span id="freq-note">A4</span>
    <span id="freq-cents" style="opacity:0.7;font-size:0.85rem"></span>
  </div>
  <input id="freq-slider" type="range" min="440" max="880" value="440" step="1">
  <div style="display:flex;justify-content:space-between;font-size:0.8rem;opacity:0.7;max-width:420px">
    <span>A4 440</span><span>C5</span><span>E5</span><span>A5 880</span>
  </div>
</div>

<h2>Scale</h2>

<div class="def">A <span class="word">scale</span> is an ordered set of notes we treat as “the allowed steps” from a tonic. Think of it as a list, or a type.</div>

<p><strong>C major</strong> is this list (white keys from C to C):</p>

<div class="num-row">
  <span class="num" data-play="C4" role="button" tabindex="0">1<small>C</small></span>
  <span class="num" data-play="D4" role="button" tabindex="0">2<small>D</small></span>
  <span class="num" data-play="E4" role="button" tabindex="0">3<small>E</small></span>
  <span class="num" data-play="F4" role="button" tabindex="0">4<small>F</small></span>
  <span class="num" data-play="G4" role="button" tabindex="0">5<small>G</small></span>
  <span class="num" data-play="A4" role="button" tabindex="0">6<small>A</small></span>
  <span class="num" data-play="B4" role="button" tabindex="0">7<small>B</small></span>
  <span class="num" data-play="C5" role="button" tabindex="0">1<small>C</small></span>
</div>

<p>Major scales all use the same step pattern: <strong>whole, whole, half, whole, whole, whole, half</strong>.</p>

<p><strong>A natural minor</strong> (A to A on the white keys) is a different list with the same letters, but <strong>A</strong> is home:</p>

<div class="num-row">
  <span class="num" data-play="A3" role="button" tabindex="0">1<small>A</small></span>
  <span class="num" data-play="B3" role="button" tabindex="0">2<small>B</small></span>
  <span class="num" data-play="C4" role="button" tabindex="0">3<small>C</small></span>
  <span class="num" data-play="D4" role="button" tabindex="0">4<small>D</small></span>
  <span class="num" data-play="E4" role="button" tabindex="0">5<small>E</small></span>
  <span class="num" data-play="F4" role="button" tabindex="0">6<small>F</small></span>
  <span class="num" data-play="G4" role="button" tabindex="0">7<small>G</small></span>
</div>

<p>Same piano keys. Different home. That is why “major” and “minor” sound different.</p>

<h2>Scale degree</h2>

<div class="def">A <span class="word">scale degree</span> is an index into a scale. We count from the tonic: 1, 2, 3, 4, 5, 6, 7. Each number is a degree, not a whole scale.</div>

<table>
  <thead><tr><th>Degree</th><th>In C major</th><th>In A minor</th></tr></thead>
  <tbody>
    <tr><td>1 (tonic)</td><td>C</td><td>A</td></tr>
    <tr><td>2</td><td>D</td><td>B</td></tr>
    <tr><td>3</td><td>E</td><td>C</td></tr>
    <tr><td>4</td><td>F</td><td>D</td></tr>
    <tr><td>5</td><td>G</td><td>E</td></tr>
    <tr><td>6</td><td>A</td><td>F</td></tr>
    <tr><td>7</td><td>B</td><td>G</td></tr>
  </tbody>
</table>

<p>The sequence <code>[1, 4, 1, 5]</code> is a <strong>program of degrees</strong>. It is not “a scale.” It is not a list of intervals. It is “play home, the fourth, home, the fifth.”</p>

<p>Numbers are nicer than letters when you move the song: same program, new tonic.</p>

<h2>Interval</h2>

<div class="def">An <span class="word">interval</span> is the distance between <strong>any two</strong> pitches. You do not need a scale to name an interval. You only need two notes.</div>

<p>Three useful measurements:</p>
<ol>
  <li><strong>From the tonic.</strong> Degree 5 is a fifth above home. People say “the fifth” for both the degree and that interval.</li>
  <li><strong>Along a melody</strong> (one after the other). That is a <strong>melodic interval</strong>. In <code>1 → 4 → 1</code>, each arrow is a fourth.</li>
  <li><strong>Together</strong> (a chord). That is a <strong>harmonic interval</strong>.</li>
</ol>

<p>Direction matters. <strong>C up to A</strong> is a <strong>sixth</strong>. <strong>C down to A</strong> is a <strong>third</strong> downward. Same letter A, two different intervals. The <strong>degree</strong> of A in C major is still <strong>6</strong>.</p>

<table>
  <thead><tr><th>From C (up)</th><th>Semitones</th><th>Usual name</th></tr></thead>
  <tbody>
    <tr><td>C</td><td>0</td><td>unison</td></tr>
    <tr><td>D</td><td>2</td><td>major second</td></tr>
    <tr><td>E</td><td>4</td><td>major third</td></tr>
    <tr><td>F</td><td>5</td><td>perfect fourth</td></tr>
    <tr><td>F♯</td><td><strong>6</strong></td><td>tritone (augmented fourth)</td></tr>
    <tr><td>G</td><td>7</td><td>perfect fifth</td></tr>
    <tr><td>A</td><td>9</td><td>major sixth</td></tr>
    <tr><td>B</td><td>11</td><td>major seventh</td></tr>
    <tr><td>C</td><td>12</td><td>octave</td></tr>
  </tbody>
</table>

<p>C to F♯ is <strong>not 4.5</strong>. It sits between 4 and 5 on the piano, but musicians say <strong>tritone</strong> or <strong>augmented fourth</strong>. Six semitones. F♯ is <strong>not</strong> a degree of C major; it is a chromatic (in-between) note.</p>

<p><strong>Degree is more specific than interval.</strong> A degree needs a tonic and a scale. An interval only needs two pitches.</p>

<h2>How we will practice</h2>
<ol>
  <li>Read the word.</li>
  <li>Tap a card. The staff at the bottom becomes that tiny program.</li>
  <li>Play it on the MIDI keyboard. Same cards come back more than once on purpose.</li>
</ol>

{% set nav = collections.all | lessonNav(page) %}
{% if nav.prev or nav.next %}
<div style="display:flex;justify-content:space-between;margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--border);">
  <div>
    {% if nav.prev %}
    <a href="{{ nav.prev.url }}" style="color:var(--accent);text-decoration:none;font-size:1rem;">← {{ nav.prev.data.title }}</a>
    {% endif %}
  </div>
  <div style="text-align:right">
    {% if nav.next %}
    <a href="{{ nav.next.url }}" style="color:var(--accent);text-decoration:none;font-size:1rem;">{{ nav.next.data.title }} →</a>
    {% endif %}
  </div>
</div>
{% endif %}
</div>

<div id="trainer-panel">
    <div class="score-item">Correct<br><strong id="score-correct">0</strong></div>
    <div class="score-item">Wrong<br><strong id="score-wrong">0</strong></div>
    <button id="play-btn" type="button" onclick="togglePlayTrainer()" style="font-size:0.9rem;padding:0.3rem 0.9rem;border-radius:8px;border:2px solid var(--accent);background:var(--accent);color:#fff;cursor:pointer;font-weight:bold">
        <span id="play-btn-icon">▶</span> <span id="play-btn-label">Play</span>
    </button>
    <button id="wait-btn" type="button" onclick="toggleWaitTrainer()" style="font-size:0.9rem;padding:0.3rem 0.9rem;border-radius:8px;border:2px solid var(--border);background:var(--panel-bg);color:var(--text);cursor:pointer;font-weight:bold">Wait</button>
    <button type="button" onclick="refreshTrainer()" style="font-size:0.9rem;padding:0.3rem 0.8rem;border-radius:8px;border:2px solid var(--border);background:var(--panel-bg);cursor:pointer">↻</button>
</div>

<p id="active-tune-title" style="text-align:center;font-weight:800;margin:0.3rem 0 0.6rem"></p>
<div id="tune-list"></div>

<script>
(function () {
    var TUNES = {% lessonTunes 'notes-intervals-degrees' %};
    var trainer = null;
    var active = 0;

    function syncWait(on) {
        var btn = document.getElementById('wait-btn');
        if (!btn) return;
        btn.style.background = on ? 'var(--accent)' : 'var(--panel-bg)';
        btn.style.color = on ? '#fff' : 'var(--text)';
        btn.style.borderColor = on ? 'var(--accent)' : 'var(--border)';
    }
    function syncPlay(playing) {
        var icon = document.getElementById('play-btn-icon');
        var label = document.getElementById('play-btn-label');
        if (icon) icon.textContent = playing ? '⏸' : '▶';
        if (label) label.textContent = playing ? 'Pause' : 'Play';
    }

    window.toggleWaitTrainer = function () {
        var next = !(trainer && trainer.getWait && trainer.getWait());
        if (trainer && trainer.setWait) trainer.setWait(next);
        syncWait(next);
    };
    window.togglePlayTrainer = function () {
        if (!trainer || !trainer.togglePlay) return;
        syncPlay(trainer.togglePlay());
    };
    window.refreshTrainer = function () {
        if (trainer) trainer.start();
        syncPlay(false);
    };

    function loadTune(i) {
        if (!trainer || !TUNES[i]) return;
        active = i;
        var t = TUNES[i];
        var chart = document.querySelector('note-chart');
        if (chart) {
            if (t.timeSignature) chart.timeSignature = t.timeSignature;
            if (t.keySignature) chart.keySignature = t.keySignature;
            if (t.tempo) chart.tempo = t.tempo;
        }
        trainer.setNotes(t.notes || [], t.rests || []);
        if (trainer.setWait) trainer.setWait(true);
        syncWait(true);
        trainer.start();
        var title = document.getElementById('active-tune-title');
        if (title) title.textContent = t.title;
        if (window.setAbcSource) window.setAbcSource(t.abc || '');
        document.querySelectorAll('.tune-card').forEach(function (el, idx) {
            el.classList.toggle('active', idx === i);
        });
    }

    function renderList() {
        var list = document.getElementById('tune-list');
        if (!list) return;
        list.innerHTML = '';
        TUNES.forEach(function (t, i) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'tune-card';
            btn.innerHTML = '<div class="tune-n">Try ' + t.id + '</div><div class="tune-title"></div>';
            btn.querySelector('.tune-title').textContent = t.title;
            btn.addEventListener('click', function () { loadTune(i); });
            list.appendChild(btn);
        });
    }

    function initTrainer() {
        var chart = document.querySelector('note-chart');
        if (!window.__midiObservers || !window.createTrainer || !chart || !chart._ctx) {
            setTimeout(initTrainer, 20);
            return;
        }
        trainer = window.createTrainer({
            chartEl: chart,
            mode: 'tape-head',
            scoreCorrectEl: document.getElementById('score-correct'),
            scoreWrongEl: document.getElementById('score-wrong'),
        });
        window.__midiObservers.push(function (midiNote, isNoteOn, isNoteOff) {
            trainer.onMidi(midiNote, isNoteOn, isNoteOff);
        });
        renderList();
        loadTune(0);
    }

    (function freqLab() {
        var slider = document.getElementById('freq-slider');
        var toggle = document.getElementById('freq-toggle');
        var hzEl = document.getElementById('freq-hz');
        var noteEl = document.getElementById('freq-note');
        var centsEl = document.getElementById('freq-cents');
        if (!slider || !toggle) return;
        var ctx = null;
        var osc = null;
        var gain = null;
        var names = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

        function label(hz) {
            var midi = 69 + 12 * Math.log(hz / 440) / Math.LN2;
            var rounded = Math.round(midi);
            var pc = ((rounded % 12) + 12) % 12;
            var oct = Math.floor(rounded / 12) - 1;
            var cents = Math.round((midi - rounded) * 100);
            hzEl.textContent = String(hz);
            noteEl.textContent = names[pc] + oct;
            centsEl.textContent = cents === 0 ? 'in tune' : (cents > 0 ? '+' : '') + cents + ' cents';
        }

        function setFreq(hz) {
            label(hz);
            if (osc) osc.frequency.setTargetAtTime(hz, ctx.currentTime, 0.01);
        }

        toggle.addEventListener('click', function () {
            if (osc) {
                osc.stop();
                osc.disconnect();
                gain.disconnect();
                osc = null;
                toggle.textContent = 'Tone off';
                return;
            }
            ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
            if (ctx.state === 'suspended') ctx.resume();
            osc = ctx.createOscillator();
            gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = parseInt(slider.value, 10);
            gain.gain.value = 0.08;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            toggle.textContent = 'Tone on';
        });
        slider.addEventListener('input', function () {
            setFreq(parseInt(slider.value, 10));
        });
        label(parseInt(slider.value, 10));
    })();

    (function playableChips() {
        var STEPS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
        function chipMidi(el) {
            var raw = (el.getAttribute('data-play') || '').trim();
            var m = raw.match(/^([A-G])([#b]?)(\d)$/i);
            if (!m) return null;
            var letter = m[1].toUpperCase();
            var acc = m[2] === '#' ? 1 : (m[2] === 'b' ? -1 : 0);
            var oct = parseInt(m[3], 10);
            return (oct + 1) * 12 + STEPS[letter] + acc;
        }
        function startChip(el) {
            var midi = chipMidi(el);
            if (midi == null) return;
            el.classList.add('playing');
            if (typeof playMidiNote === 'function') playMidiNote(midi, 100);
            if (typeof keyOn === 'function' && typeof midiToNoteName === 'function') {
                keyOn(midiToNoteName(midi));
            }
        }
        function stopChip(el) {
            var midi = chipMidi(el);
            el.classList.remove('playing');
            if (typeof keyOff === 'function' && typeof midiToNoteName === 'function' && midi != null) {
                keyOff(midiToNoteName(midi));
            }
        }
        document.querySelectorAll('#lesson-content .num[data-play]').forEach(function (el) {
            el.addEventListener('pointerdown', function (ev) {
                ev.preventDefault();
                startChip(el);
            });
            el.addEventListener('pointerup', function () { stopChip(el); });
            el.addEventListener('pointerleave', function () { stopChip(el); });
            el.addEventListener('pointercancel', function () { stopChip(el); });
            el.addEventListener('keydown', function (ev) {
                if (ev.key === ' ' || ev.key === 'Enter') {
                    ev.preventDefault();
                    startChip(el);
                }
            });
            el.addEventListener('keyup', function (ev) {
                if (ev.key === ' ' || ev.key === 'Enter') stopChip(el);
            });
        });
    })();

    setTimeout(initTrainer, 0);
})();
</script>
