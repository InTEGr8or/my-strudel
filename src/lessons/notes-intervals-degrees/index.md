---
title: "Notes, intervals, and scale degrees"
key: "C"
type: "lesson"
lessonType: "foundations"
difficulty: "beginner"
order: 0
description: "Play each idea as you read it: note, pitch, octave, tonic, scale, major, minor, degree, interval."
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
#lesson-content .def { background: var(--panel-bg); border-left: 4px solid var(--accent); padding: 0.7rem 1rem; border-radius: 0 10px 10px 0; margin: 0.8rem 0 1.1rem; }
#lesson-content table { width: 100%; border-collapse: collapse; margin: 0.8rem 0 1.2rem; font-size: 0.95rem; }
#lesson-content th, #lesson-content td { border-bottom: 1px solid var(--border); padding: 0.35rem 0.45rem; text-align: left; }
#freq-lab { background: var(--panel-bg); border: 2px solid var(--border); border-radius: 14px; padding: 1rem 1.1rem; margin: 1rem 0 1.4rem; }
#freq-lab .freq-row { display: flex; flex-wrap: wrap; align-items: center; gap: 0.7rem; }
#freq-hz { font-size: 1.6rem; font-weight: 800; color: var(--accent); min-width: 5.5rem; }
#freq-note { font-size: 1.25rem; font-weight: 800; }
#freq-slider { width: 100%; display: block; }
#freq-lab .freq-marks { display: flex; justify-content: space-between; font-size: 0.8rem; opacity: 0.7; }
#freq-lab .freq-wave-box { margin-top: 0.75rem; width: 100%; }
#freq-lab .freq-wave-box canvas {
    display: block; width: 100%; height: 140px;
    background: #071208; border-radius: 6px; border: 2px solid #1a3d1a;
}
#freq-lab .freq-wave-legend { font-size: 0.8rem; opacity: 0.85; margin-top: 0.35rem; line-height: 1.45; }
#freq-lab .setting-switch { width: auto; min-width: 7.5rem; margin: 0; }
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

<h2>Play this C</h2>

<p>On the piano we <strong>play</strong>. We <strong>press keys</strong>. Notes one after another make a <strong>sequence</strong> (a little tune). Two or more keys at the same time make a <strong>chord</strong>.</p>

<p>Each staff on this page is a little practice box. Play what you see, then keep reading. Near the end there are longer sequences: those wait on a note until you play the right key.</p>

<p>This is a <strong>C</strong>. Press the C key on your keyboard, or tap it on the small piano under the staff. The <strong>Now</strong> line is where the note is waiting. A wrong key shows the name you want.</p>

<staff-player notes="C4" advance="#the-words"></staff-player>

<h2 id="the-words">The words, one at a time</h2>

<h3>Note</h3>

<div class="def">A <span class="word">note</span> is one sound we can name and write. It is the smallest piece we will talk about.</div>

<p>You just played one note. On the piano, one note is one <strong>key</strong>.</p>

<h3>Pitch</h3>

<div class="def"><span class="word">Pitch</span> is how high or low a note sounds.</div>

<p>Left on the piano is lower. Right is higher. On a guitar, a thicker string is usually lower. A thinner string is higher.</p>

<h3>Letter names</h3>

<p>Music uses seven letters, then starts over. They are the same letters you already know, and they <strong>do start at A</strong>. Play them in order:</p>

<staff-player notes="A3,B3,C4,D4,E4,F4,G4"></staff-player>

<p>After G comes A again — the next <strong>octave</strong>.</p>

<h3>Why do piano books often start at C?</h3>

<p>We do <strong>not</strong> have to start at C. The letter list still begins at A. About a thousand years ago in Europe, people named the notes A through G, starting at A, just like the alphabet.</p>

<p>If you play only the <strong>white keys from A to A</strong>, the tune has a softer, sadder color. That list is called <strong>A minor</strong>. If you play only the <strong>white keys from C to C</strong>, the tune has a brighter color. That list is called <strong>C major</strong>.</p>

<p>Piano lessons often start at C because <strong>C major uses only white keys</strong> and sounds like many children’s songs. It is a handy door, not the start of the alphabet. Later we will start lists on other letters too.</p>

<h3>Octave</h3>

<div class="def">An <span class="word">octave</span> is the same letter, one “same-but-higher” (or lower) away. Count 1 on the first C and 8 on the next C. <em>Octo</em> means eight.</div>

<p>A good guitar picture: play a string open, then press at the <strong>12th fret</strong>. Same letter, one octave higher. On the piano, C to the next C is the same jump.</p>

<p>We write the octave with a number: <strong>C4</strong> is middle C, <strong>C5</strong> is the C above it. Play both:</p>

<staff-player notes="C4,C5"></staff-player>

<h3>Sharp and flat</h3>

<p>The black keys have two names.</p>

<div class="def">A <span class="word">sharp</span> (♯) is one key to the <strong>right</strong> (a little higher). A <span class="word">flat</span> (♭) is one key to the <strong>left</strong> (a little lower). The same black key can be F♯ or G♭.</div>

<p>Play F, the black key F♯, then G:</p>

<staff-player notes="F4,F#4,G4"></staff-player>

<h3>Semitone and whole step</h3>

<div class="def">A <span class="word">semitone</span> (half step) is the distance to the very next key, black or white. A <span class="word">whole step</span> is two semitones (skip one key).</div>

<p>C to C♯ is a semitone. C to D is a whole step. Play all three:</p>

<staff-player notes="C4,C#4,D4"></staff-player>

<h3>Tonic (home)</h3>

<div class="def">The <span class="word">tonic</span> is the home note of a piece or a scale. It is also called degree <strong>1</strong>, and sometimes the <strong>root</strong> when we build a chord.</div>

<p>In this lesson home is <strong>C</strong>, unless we say otherwise.</p>

<h2>A little sound lab (440 to 880)</h2>

<p><strong>A4</strong> is often tuned to <strong>440</strong> vibrations per second. The A one octave higher is <strong>880</strong> — twice as many. You do not need that number to play. It is here so you can <em>hear</em> one octave as a smooth slide.</p>

<p>The small Donner keyboard only goes up to <strong>C5</strong> (~523). The slider can go past that, up to A5, so you can hear a full A-to-A octave. Tap <strong>Tone</strong> for a short sound. Double-tap, or press and slide, to keep it on while you move the slider.</p>

<p><strong>Hertz</strong> means “how many full waves in one second.” The screen below is a <strong>tenth of a second</strong> wide, so 440 Hz draws 44 waves here (440 in a whole second) and 880 Hz draws 88.</p>

<div id="freq-lab">
  <div class="freq-row">
    <button type="button" id="freq-toggle" class="setting-switch" role="switch" aria-checked="false" title="Tap for a short tone. Double-tap or press and slide to hold.">
      <span class="setting-switch-label">Tone</span>
      <span class="setting-switch-track" aria-hidden="true"><span class="setting-switch-knob"></span></span>
    </button>
    <span id="freq-hz">440</span>
    <span>Hz</span>
    <span id="freq-note">A4</span>
    <span id="freq-cents" style="opacity:0.7;font-size:0.85rem"></span>
  </div>
  <input id="freq-slider" type="range" min="440" max="880" value="440" step="1">
  <div class="freq-marks">
    <span>A4 440</span><span>C5</span><span>E5</span><span>A5 880</span>
  </div>
  <div class="freq-wave-box">
    <canvas id="freq-scope" width="780" height="140" aria-label="One second of the slider frequency"></canvas>
    <div class="freq-wave-legend" id="freq-wave-legend">This screen is 0.1 seconds wide.</div>
  </div>
</div>

<h2>Scale</h2>

<div class="def">A <span class="word">scale</span> is an ordered <strong>list</strong> of notes we treat as the allowed steps from a home note (the tonic). It is a collection in a fixed order, like a staircase.</div>

<h3>Major and minor</h3>

<div class="def"><span class="word">Major</span> and <span class="word">minor</span> are two common flavors of a scale (and of some intervals). Major often sounds brighter or happier. Minor often sounds darker or sadder. The big difference is the <strong>third</strong> step: in major it is 4 semitones above home (C to E); in minor it is 3 (A to C, or C to E♭).</div>

<p>Play C then E (a major third), then A then C (a minor third). Listen for the color change.</p>

<staff-player notes="C4,E4,A3,C4"></staff-player>

<p><strong>C major</strong> is the white-key list from C to C. Play it:</p>

<staff-player notes="C4,D4,E4,F4,G4,A4,B4,C5"></staff-player>

<p>Every major scale uses the same step pattern: <strong>whole, whole, half, whole, whole, whole, half</strong>.</p>

<p><strong>A natural minor</strong> is the white-key list from A to A. Same letters, but <strong>A</strong> is home, and the third is only 3 semitones. Play it:</p>

<staff-player notes="A3,B3,C4,D4,E4,F4,G4"></staff-player>

<p>Same piano keys. Different home. That is why “major” and “minor” sound different.</p>

<h2>Scale degree</h2>

<div class="def">A <span class="word">scale degree</span> is a number that tells you the place of a note in a scale’s list. We count from the tonic: 1, 2, 3, 4, 5, 6, 7. Each number is one degree, not the whole scale.</div>

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

<p>The sequence <code>1, 4, 1, 5</code> is a <strong>list of degrees</strong>. It is not “a scale.” It is not a list of intervals. It means “play home, the fourth, home, the fifth.” In C that is C, F, C, G:</p>

<staff-player notes="C4,F4,C4,G4"></staff-player>

<p>Numbers are handy when you move a song: same list, new home.</p>

<h2>Interval</h2>

<div class="def">An <span class="word">interval</span> is the distance between <strong>any two</strong> pitches. You do not need a scale to name an interval. You only need two notes.</div>

<p>Three useful measurements:</p>
<ol>
  <li><strong>From the tonic.</strong> Degree 5 is a fifth above home. People say “the fifth” for both the degree and that interval.</li>
  <li><strong>Along a melody</strong> (one after the other). That is a <strong>melodic interval</strong>. In <code>1 → 4 → 1</code>, each arrow is a fourth.</li>
  <li><strong>Together</strong> (a chord). That is a <strong>harmonic interval</strong>.</li>
</ol>

<p>Play C and E together — a harmonic third:</p>

<staff-player notes="C4,E4" chord></staff-player>

<p>Direction matters. <strong>C up to A</strong> is a <strong>sixth</strong>. <strong>C down to A</strong> is a <strong>third</strong> downward. Same letter A, two different intervals. The <strong>degree</strong> of A in C major is still <strong>6</strong>.</p>

<p>Up a sixth:</p>
<staff-player notes="C4,A4"></staff-player>
<p>Down a third:</p>
<staff-player notes="C4,A3"></staff-player>

<h3>Perfect, major, minor, augmented</h3>

<p>The number (second, third, fourth…) is how many letter-steps you count, including the start. The extra word tells you the exact size in semitones.</p>

<div class="def">A <span class="word">perfect</span> interval is one that does not come in a major or minor flavor. The settled ones are the unison, fourth, fifth, and octave. C to F is a <strong>perfect fourth</strong> (5 semitones). C to G is a <strong>perfect fifth</strong> (7 semitones). They sound very stable.</div>

<p>Play a perfect fourth, then a perfect fifth:</p>
<staff-player notes="C4,F4"></staff-player>
<staff-player notes="C4,G4"></staff-player>

<div class="def">Seconds, thirds, sixths, and sevenths <em>do</em> come in <span class="word">major</span> and <span class="word">minor</span>. Major is the larger of the pair. C to E is a major third (4 semitones). A to C is a minor third (3 semitones).</div>

<div class="def"><span class="word">Augmented</span> means one semitone <strong>bigger</strong> than the usual interval. C to F is a perfect fourth; raise F to F♯ and you have an <strong>augmented fourth</strong> (6 semitones). <span class="word">Diminished</span> means one semitone <strong>smaller</strong>. C to G♭ is a diminished fifth — the same two keys as C to F♯. That 6-semitone distance is also called a <strong>tritone</strong> (three whole tones).</div>

<p>Play C to F♯ (the tritone):</p>
<staff-player notes="C4,F#4"></staff-player>

<p>C to F♯ is <strong>not 4.5</strong>. It sits between 4 and 5 on the white-key list, but musicians keep whole step-numbers and then say perfect, major, minor, or augmented.</p>

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

<p>F♯ is <strong>not</strong> in the C major list. It is an in-between note. You can still name the interval (augmented fourth) because an interval only needs two pitches.</p>

<p><strong>Degree is more specific than interval.</strong> A degree needs a home note and a scale list. An interval only needs two notes.</p>

<h2>Longer sequences</h2>
<p>These cards use the bigger staff and piano below. Tap a card, then play. Wait mode stays on a note until you play the right key. The same ideas come back more than once on purpose.</p>

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
        var chart = window.pageNoteChart ? window.pageNoteChart() : document.querySelector('#note-chart-container note-chart');
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
        var chart = window.pageNoteChart ? window.pageNoteChart() : document.querySelector('#note-chart-container note-chart');
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
        var latched = false;
        var pointerDown = false;
        var startX = 0;
        var startY = 0;
        var slid = false;
        var downAt = 0;
        var pulseTimer = 0;
        var lastTap = 0;
        var phase = 0;
        var waveRaf = 0;
        var lastFrame = 0;
        var scope = document.getElementById('freq-scope');
        var names = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
        var WINDOW_S = 0.1;

        function hzNow() { return parseInt(slider.value, 10); }

        function label(hz) {
            var midi = 69 + 12 * Math.log(hz / 440) / Math.LN2;
            var rounded = Math.round(midi);
            var pc = ((rounded % 12) + 12) % 12;
            var oct = Math.floor(rounded / 12) - 1;
            var cents = Math.round((midi - rounded) * 100);
            hzEl.textContent = String(hz);
            noteEl.textContent = names[pc] + oct;
            centsEl.textContent = cents === 0 ? 'in tune' : (cents > 0 ? '+' : '') + cents + ' cents';
            drawWaves(hz);
        }

        function sizeScope() {
            if (!scope) return;
            var cssW = scope.clientWidth || scope.parentNode.clientWidth || 780;
            var dpr = window.devicePixelRatio || 1;
            var w = Math.max(320, Math.round(cssW * dpr));
            var h = Math.round(140 * dpr);
            if (scope.width !== w || scope.height !== h) {
                scope.width = w;
                scope.height = h;
            }
        }

        function drawWaves(hz) {
            if (!scope || !scope.getContext) return;
            sizeScope();
            var g = scope.getContext('2d');
            var w = scope.width;
            var h = scope.height;
            g.fillStyle = '#071208';
            g.fillRect(0, 0, w, h);

            var steps = Math.max(w * 4, Math.ceil(hz * 8));
            var mid = h / 2;
            var amp = h * 0.36;
            var i;
            g.beginPath();
            g.strokeStyle = '#7CFF9A';
            g.lineWidth = 0.1;
            g.lineJoin = 'round';
            for (i = 0; i <= steps; i++) {
                var t = (i / steps) * WINDOW_S;
                var x = (i / steps) * w;
                var y = mid - amp * Math.sin(2 * Math.PI * hz * t + phase);
                if (i === 0) g.moveTo(x, y);
                else g.lineTo(x, y);
            }
            g.stroke();
        }

        function waveTick(ts) {
            waveRaf = 0;
            if (!osc) {
                drawWaves(hzNow());
                return;
            }
            var dt = lastFrame ? Math.min(0.05, (ts - lastFrame) / 1000) : 0.016;
            lastFrame = ts;
            phase += 2 * Math.PI * hzNow() * dt;
            drawWaves(hzNow());
            waveRaf = requestAnimationFrame(waveTick);
        }

        function startWaveMotion() {
            lastFrame = 0;
            if (!waveRaf) waveRaf = requestAnimationFrame(waveTick);
        }

        function stopWaveMotion() {
            if (waveRaf) cancelAnimationFrame(waveRaf);
            waveRaf = 0;
            drawWaves(hzNow());
        }

        function setLatchUi(on) {
            toggle.setAttribute('aria-checked', on ? 'true' : 'false');
        }

        function startTone() {
            try {
                ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
                if (ctx.state === 'suspended') ctx.resume();
            } catch (_) { return; }
            if (osc) {
                osc.frequency.setTargetAtTime(hzNow(), ctx.currentTime, 0.01);
                return;
            }
            osc = ctx.createOscillator();
            gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = hzNow();
            gain.gain.value = 0.08;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            startWaveMotion();
        }

        function stopTone() {
            if (!osc) return;
            try { osc.stop(); } catch (_) {}
            try { osc.disconnect(); gain.disconnect(); } catch (_) {}
            osc = null;
            gain = null;
            stopWaveMotion();
        }

        function clearPulse() {
            if (pulseTimer) {
                clearTimeout(pulseTimer);
                pulseTimer = 0;
            }
        }

        function setFreq(hz) {
            label(hz);
            if (osc) osc.frequency.setTargetAtTime(hz, ctx.currentTime, 0.01);
        }

        function unlatch() {
            latched = false;
            setLatchUi(false);
            clearPulse();
            stopTone();
        }

        function latchOn() {
            latched = true;
            setLatchUi(true);
            clearPulse();
            startTone();
        }

        toggle.addEventListener('pointerdown', function (ev) {
            ev.preventDefault();
            pointerDown = true;
            slid = false;
            startX = ev.clientX;
            startY = ev.clientY;
            downAt = Date.now();
            try { toggle.setPointerCapture(ev.pointerId); } catch (_) {}
            if (latched) return;
            startTone();
        });

        toggle.addEventListener('pointermove', function (ev) {
            if (!pointerDown || slid) return;
            var dx = ev.clientX - startX;
            var dy = ev.clientY - startY;
            if (Math.sqrt(dx * dx + dy * dy) > 12) {
                slid = true;
                latchOn();
            }
        });

        toggle.addEventListener('pointerup', function () {
            if (!pointerDown) return;
            pointerDown = false;
            var now = Date.now();
            if (slid) return;
            if (latched) {
                unlatch();
                lastTap = 0;
                return;
            }
            if (now - lastTap < 400) {
                lastTap = 0;
                latchOn();
                return;
            }
            lastTap = now;
            var remain = Math.max(0, 500 - (now - downAt));
            clearPulse();
            pulseTimer = setTimeout(function () {
                pulseTimer = 0;
                if (!latched) stopTone();
            }, remain);
        });

        toggle.addEventListener('pointercancel', function () {
            pointerDown = false;
            if (!latched) stopTone();
        });

        toggle.addEventListener('dblclick', function (ev) {
            ev.preventDefault();
            latchOn();
        });

        slider.addEventListener('input', function () {
            setFreq(hzNow());
        });
        window.addEventListener('resize', function () { drawWaves(hzNow()); });
        label(hzNow());
    })();

    setTimeout(initTrainer, 0);
})();
</script>
