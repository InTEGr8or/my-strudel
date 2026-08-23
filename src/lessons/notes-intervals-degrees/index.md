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
hidePageStaff: true
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
#lesson-content .piano-diagram {
    display: block;
    height: calc(72px * var(--ui-scale, 1));
    width: auto;
    margin: 0.5rem 0 0.9rem;
}
</style>

<div id="lesson-content">

<h2>Play this C</h2>

<p>On the piano we <strong>play</strong>. We <strong>press keys</strong>. That is how music starts: one sound, then another, until it feels like a tune.</p>

<p>The easiest key to find on the piano is <strong>D</strong>. It is the only white key with a black key on each side, and those two black keys do not have other black keys next to them.</p>

{% pianoDiagram 'piano-d-key.svg' %}

<p>D also sits in the middle of the letter list: A B C <strong>D</strong> E F G. From A up to D is whole, half, whole. From D up to G is the same: whole, half, whole. Same number of half steps and whole steps above it and below it. The <strong>C</strong> key is the white key just before that D.</p>

{% pianoDiagram 'piano-a-to-g.svg' %}

<p>The picture with the two sets of five lines is the <strong>grand staff</strong>. It is just a way to write the sounds. Play the note that sits on the <strong>Now</strong> line. When you play it, the next note moves to that line.</p>

<p>If you press the wrong key, the correct key is surrounded by light blue (cyan).</p>

<p>Pressing the correct key moves the next note to the Now line. Play this C eight times.</p>

<staff-player notes="C4,C4,C4,C4,C4,C4,C4,C4" advance="#music-parts"></staff-player>

<h2 id="music-parts">The names of the parts of music</h2>

<h3>Note</h3>

<div class="def">A <span class="word">note</span> is one sound we can name and write. It is the smallest part of music we will talk about.</div>

<p>You just played one note, several times. On the piano, each <strong>key</strong> plays only one note.</p>

<h3>Pitch</h3>

<div class="def"><span class="word">Pitch</span> is how high or low a note sounds.</div>

<p>Left on the piano is lower. Right is higher. On a guitar, a thicker string is usually lower. A thinner string is higher.</p>

<h3>Letter names</h3>

<p>Music uses seven letters, then starts over. They are the same letters you already know, and they <strong>do start at A</strong>.</p>

<p>Some singers use another set of names called <span class="word">solfège</span> (do, re, mi, fa, sol, la, ti, do). In the list people learn first, <strong>do is C</strong>, not A. That is one reason piano books often start at C. We will use the letters.</p>

<p>Seven letters is not the whole piano. From one letter up to the same letter again, there are <strong>12 keys</strong>. Seven are white (A through G). Five are black. Look at the keyboard: there is <strong>no black key between B and C</strong>, and none between <strong>E and F</strong>. Those neighbors sit close. The other letter neighbors have a black key between them.</p>

<p>Play the seven letters in order, twice:</p>

<staff-player notes="A3,B3,C4,D4,E4,F4,G4,A3,B3,C4,D4,E4,F4,G4"></staff-player>

<h3 id="octave">Octave</h3>

<div class="def">An <span class="word">octave</span> is the same letter, one “same-but-higher” (or lower) away. After G the letters start over at A. Count 1 on the first C and 8 on the next C. <em>Octo</em> means eight.</div>

<p>We write the octave with a number: <strong>C4</strong> is middle C, <strong>C5</strong> is the C above it.</p>

<p><strong>A4</strong> is often tuned to <strong>440</strong> vibrations per second. The A one octave higher is <strong>880</strong> — twice as many. You do not need that number to play. Slide it so you can <em>hear</em> one octave.</p>

<p>The small Donner keyboard only goes up to <strong>C5</strong> (~523). The slider can go past that, up to A5, so you can hear a full A-to-A octave. Tap <strong>Tone</strong> for a short sound. Double-tap, or press and slide, to keep it on while you move the slider.</p>

<p><strong>Hertz</strong> means “how many full waves in one second.” The screen below is a <strong>tenth of a second</strong> wide, so 440 Hz draws 44 waves here (440 in a whole second) and 880 Hz draws 88.</p>

<freq-lab></freq-lab>

<p>Now play C4, then C5. Same letter, one octave. Do it four times.</p>

<staff-player notes="C4,C5,C4,C5,C4,C5,C4,C5"></staff-player>

<h3 id="octave-d">Octave in D</h3>

<p>There is an octave for every note. C to C is one. D to the next D is the same jump, just starting on D. Play D, then the D above it, four times.</p>

<staff-player notes="D3,D4,D3,D4,D3,D4,D3,D4"></staff-player>

<h3 id="sharp-flat">Sharp and flat</h3>

<p>The black keys have two names.</p>

<div class="def">A <span class="word">sharp</span> (♯) is one key to the <strong>right</strong> (a little higher). A <span class="word">flat</span> (♭) is one key to the <strong>left</strong> (a little lower). The same black key can be F♯ or G♭.</div>

<p>Play F, the black key F♯, then G. That is two half steps in a row. Do it in two places, a few times:</p>

<staff-player notes="F3,F#3,G3,F#3,F3,F#3,G3,F4,F#4,G4,F#4,F4,F#4,G4"></staff-player>

<p>Now play <strong>every</strong> half step from A up to the next A, then back down, twice. We go all the way to A (not only to G) so the G♯ is not left out — that is all 12 keys in the octave.</p>

<staff-player notes="A3,A#3,B3,C4,C#4,D4,D#4,E4,F4,F#4,G4,G#4,A4,G#4,G4,F#4,F4,E4,D#4,D4,C#4,C4,B3,A#3,A3,A#3,B3,C4,C#4,D4,D#4,E4,F4,F#4,G4,G#4,A4,G#4,G4,F#4,F4,E4,D#4,D4,C#4,C4,B3,A#3,A3"></staff-player>

<h3 id="semitone">Semitone and whole step</h3>

<div class="def">A <span class="word">semitone</span> (half step) is the distance to the very next key, black or white. A <span class="word">whole step</span> is two semitones (skip one key). An octave is 12 semitones.</div>

<p><strong>B to C</strong> is already a semitone. <strong>E to F</strong> is already a semitone. That is why those pairs have no black key. In solfège those close pairs are <strong>ti–do</strong> and <strong>mi–fa</strong>. The in-between notes (the black keys) get a slightly changed syllable. We will keep using letters, with ♯ and ♭.</p>

<p>Play B then C, in two octaves, a few times. That half step has no black key:</p>

<staff-player notes="B2,C3,B2,C3,B2,C3,B3,C4,B3,C4,B3,C4"></staff-player>

<p>Play E then F, in two octaves, a few times:</p>

<staff-player notes="E3,F3,E3,F3,E3,F3,E4,F4,E4,F4,E4,F4"></staff-player>

<p>A whole step is always two half steps. <strong>B to C is a half step.</strong> E to F is a half step. C to D is a whole step because it is two half steps: C to C♯, then C♯ to D.</p>

<p>C to C♯ is a semitone. C to D skips that black key, so it is a whole step. Walk C, C♯, D up and down a few times:</p>

<staff-player notes="C4,C#4,D4,C#4,C4,C#4,D4,C#4,C4,C#4,D4"></staff-player>

<h3 id="tonic">Tonic (home)</h3>

<div class="def">The <span class="word">tonic</span> is the home note of a piece or a scale. It is also called degree <strong>1</strong>, and sometimes the <strong>root</strong> when we build a chord.</div>

<p>Home is a letter, not one key. A C in a lower octave and a C in a higher octave are both still the tonic if home is C. On this small keyboard that is a left-hand C (C3), middle C (C4), and a right-hand C (C5).</p>

<p>Play those three C’s up and down, three times:</p>

<staff-player notes="C3,C4,C5,C4,C3,C4,C5,C4,C3,C4,C5,C4,C3"></staff-player>

<h2>Scale</h2>

<div class="def">A <span class="word">scale</span> is an ordered <strong>list</strong> of notes we treat as the allowed steps from a home note (the tonic). It is a collection in a fixed order, like a staircase.</div>

<h3>Major and minor</h3>

<div class="def"><span class="word">Major</span> and <span class="word">minor</span> are two common flavors of a scale (and of some intervals). Major often sounds brighter or happier. Minor often sounds darker or sadder. The big difference is the <strong>third</strong> step: in major it is 4 semitones above home (C to E); in minor it is 3 (A to C, or C to E♭).</div>

<p>Play C then E (a major third), four times. Listen for the brighter jump:</p>

<staff-player notes="C4,E4,C4,E4,C4,E4,C4,E4"></staff-player>

<p>Now play A then C (a minor third), four times. Listen for the softer jump:</p>

<staff-player notes="A3,C4,A3,C4,A3,C4,A3,C4"></staff-player>

<p>Every major scale uses the same step pattern. Natural minor uses a different one. W means whole step (two half steps). H means half step. The extra column writes that as <strong>2</strong> or <strong>1</strong> half steps, so you can count on the keys.</p>

<table>
  <thead><tr><th>Scale</th><th>Steps</th><th>Half-steps</th></tr></thead>
  <tbody>
    <tr><td>Major (any home)</td><td>W W H W W W H</td><td>2 2 1 2 2 2 1</td></tr>
    <tr><td>Natural minor (any home)</td><td>W H W W H W W</td><td>2 1 2 2 1 2 2</td></tr>
  </tbody>
</table>

<p><strong>C major</strong> on the keys:</p>
<table>
  <thead><tr><th>C</th><th></th><th>D</th><th></th><th>E</th><th></th><th>F</th><th></th><th>G</th><th></th><th>A</th><th></th><th>B</th><th></th><th>C</th></tr></thead>
  <tbody>
    <tr><td></td><td>W</td><td></td><td>W</td><td></td><td>H</td><td></td><td>W</td><td></td><td>W</td><td></td><td>W</td><td></td><td>H</td><td></td></tr>
    <tr><td></td><td>2</td><td></td><td>2</td><td></td><td>1</td><td></td><td>2</td><td></td><td>2</td><td></td><td>2</td><td></td><td>1</td><td></td></tr>
  </tbody>
</table>

<p>Play C major up and down, twice:</p>
<staff-player notes="C4,D4,E4,F4,G4,A4,B4,C5,B4,A4,G4,F4,E4,D4,C4,D4,E4,F4,G4,A4,B4,C5,B4,A4,G4,F4,E4,D4,C4"></staff-player>

<p><strong>A natural minor</strong> is the white-key list from A to A. Same letters as C major, but <strong>A</strong> is home. The third is only 3 semitones (W then H):</p>
<table>
  <thead><tr><th>A</th><th></th><th>B</th><th></th><th>C</th><th></th><th>D</th><th></th><th>E</th><th></th><th>F</th><th></th><th>G</th><th></th><th>A</th></tr></thead>
  <tbody>
    <tr><td></td><td>W</td><td></td><td>H</td><td></td><td>W</td><td></td><td>W</td><td></td><td>H</td><td></td><td>W</td><td></td><td>W</td><td></td></tr>
    <tr><td></td><td>2</td><td></td><td>1</td><td></td><td>2</td><td></td><td>2</td><td></td><td>1</td><td></td><td>2</td><td></td><td>2</td><td></td></tr>
  </tbody>
</table>

<p>Play A minor up and down, twice:</p>
<staff-player notes="A3,B3,C4,D4,E4,F4,G4,A4,G4,F4,E4,D4,C4,B3,A3,B3,C4,D4,E4,F4,G4,A4,G4,F4,E4,D4,C4,B3,A3"></staff-player>

<p><strong>G major</strong> uses the same W W H W W W H (2 2 1 2 2 2 1) pattern, starting on G. One black key (F♯) appears because the pattern needs it:</p>
<p>Play G major up and down, twice:</p>
<staff-player notes="G3,A3,B3,C4,D4,E4,F#4,G4,F#4,E4,D4,C4,B3,A3,G3,A3,B3,C4,D4,E4,F#4,G4,F#4,E4,D4,C4,B3,A3,G3"></staff-player>

<p><strong>C natural minor</strong> is W H W W H W W (2 1 2 2 1 2 2) starting on C (same home as C major, darker third):</p>
<p>Play C minor up and down, twice:</p>
<staff-player notes="C4,D4,Eb4,F4,G4,Ab4,Bb4,C5,Bb4,Ab4,G4,F4,Eb4,D4,C4,D4,Eb4,F4,G4,Ab4,Bb4,C5,Bb4,Ab4,G4,F4,Eb4,D4,C4"></staff-player>

<p>Same piano can hold more than one list. C major and A minor share the white keys. C major and C minor share the home C, not all the letters.</p>

<h3>Why not 12 letters, or 6 and 6?</h3>

<p>The seven letters came first. Written music named a 7-note staircase with a home — A B C D E F G — long before anyone treated the octave as 12 equal steps. When the in-between pitches were needed, they were marked ♯ or ♭ of those seven letters, not given new letters of their own. The 12 equal half-steps came later still. We kept the old names and added the extras onto them. That is why there are 7 everyday names and 5 altered ones, not A through L, and not six letters with a sharp after each.</p>

<p>B♯ and E♯ do exist. In the 12 equal steps, B♯ sounds like C, and E♯ sounds like F: other names for notes we already have, used when a scale must give each degree its own letter. A 6+6 list would make every letter a whole step from the next, and would drop the two half steps (E–F and B–C) that major and minor lean on. The 7-note list was already there; the extra five notes were added later.</p>

<h3>Chords as stacked steps</h3>

<p>A <span class="word">chord</span> is two or more notes at the same time. A three-note chord (a triad) is home, a third, and a fifth. You do <strong>not</strong> play the notes in between. The numbers below are how far it is from one chord note to the next: C to E is <strong>4</strong> half-steps (that is W+W), E to G is <strong>3</strong> (W+H).</p>

<table>
  <thead><tr><th>Chord</th><th>Notes</th><th>Half-steps</th><th>As W and H</th></tr></thead>
  <tbody>
    <tr><td>C major</td><td>C–E–G</td><td>4, then 3</td><td>W+W, then W+H</td></tr>
    <tr><td>C minor</td><td>C–E♭–G</td><td>3, then 4</td><td>W+H, then W+W</td></tr>
    <tr><td>A minor</td><td>A–C–E</td><td>3, then 4</td><td>W+H, then W+W</td></tr>
    <tr><td>G major</td><td>G–B–D</td><td>4, then 3</td><td>W+W, then W+H</td></tr>
  </tbody>
</table>

<p><strong>C major</strong> — C–E–G. Half-steps 4, then 3 (W+W, then W+H). Play it low, then higher, twice. All three keys together each time:</p>
<staff-player notes="C3,E3,G3;C4,E4,G4;C3,E3,G3;C4,E4,G4" chord></staff-player>

<p><strong>C minor</strong> — C–E♭–G. Half-steps 3, then 4 (W+H, then W+W). Same home C, darker third. Low, then higher, twice:</p>
<staff-player notes="C3,Eb3,G3;C4,Eb4,G4;C3,Eb3,G3;C4,Eb4,G4" chord></staff-player>

<p><strong>A minor</strong> — A–C–E. Half-steps 3, then 4 (W+H, then W+W). Low, then higher, twice:</p>
<staff-player notes="A2,C3,E3;A3,C4,E4;A2,C3,E3;A3,C4,E4" chord></staff-player>

<p><strong>G major</strong> — G–B–D. Half-steps 4, then 3 (W+W, then W+H). Low, then higher, twice:</p>
<staff-player notes="G2,B2,D3;G3,B3,D4;G2,B2,D3;G3,B3,D4" chord></staff-player>

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

<p>The sequence <code>1, 4, 1, 5</code> is a <strong>list of degrees</strong>. It is not “a scale.” It is not a list of intervals. It means “play home, the fourth, home, the fifth.” In C that is C, F, C, G. Play it four times:</p>

<staff-player notes="C4,F4,C4,G4,C4,F4,C4,G4,C4,F4,C4,G4,C4,F4,C4,G4"></staff-player>

<p>Numbers are handy when you move a song: same list, new home.</p>

<h2>Interval</h2>

<div class="def">An <span class="word">interval</span> is the distance between <strong>any two</strong> pitches. You do not need a scale to name an interval. You only need two notes.</div>

<p>Three useful measurements:</p>
<ol>
  <li><strong>From the tonic.</strong> Degree 5 is a fifth above home. People say “the fifth” for both the degree and that interval.</li>
  <li><strong>Along a melody</strong> (one after the other). That is a <strong>melodic interval</strong>. In <code>1 → 4 → 1</code>, each arrow is a fourth.</li>
  <li><strong>Together</strong> (a chord). That is a <strong>harmonic interval</strong>.</li>
</ol>

<p>Play C and E together — a harmonic third. Four times:</p>

<staff-player notes="C4,E4;C4,E4;C4,E4;C4,E4" chord></staff-player>

<p>Direction matters. <strong>C up to A</strong> is a <strong>sixth</strong>. <strong>C down to A</strong> is a <strong>third</strong> downward. Same letter A, two different intervals. The <strong>degree</strong> of A in C major is still <strong>6</strong>.</p>

<p>Up a sixth, four times:</p>
<staff-player notes="C4,A4,C4,A4,C4,A4,C4,A4"></staff-player>
<p>Down a third, four times:</p>
<staff-player notes="C4,A3,C4,A3,C4,A3,C4,A3"></staff-player>

<h3>Perfect, major, minor, augmented</h3>

<p>The number (second, third, fourth…) is how many letter-steps you count, including the start. The extra word tells you the exact size in semitones.</p>

<div class="def">A <span class="word">perfect</span> interval is one that does not come in a major or minor flavor. The settled ones are the unison, fourth, fifth, and octave. C to F is a <strong>perfect fourth</strong> (5 semitones). C to G is a <strong>perfect fifth</strong> (7 semitones). They sound very stable.</div>

<p>Play a perfect fourth, four times:</p>
<staff-player notes="C4,F4,C4,F4,C4,F4,C4,F4"></staff-player>
<p>Play a perfect fifth, four times:</p>
<staff-player notes="C4,G4,C4,G4,C4,G4,C4,G4"></staff-player>

<div class="def">Seconds, thirds, sixths, and sevenths <em>do</em> come in <span class="word">major</span> and <span class="word">minor</span>. Major is the larger of the pair. C to E is a major third (4 semitones). A to C is a minor third (3 semitones).</div>

<div class="def"><span class="word">Augmented</span> means one semitone <strong>bigger</strong> than the usual interval. C to F is a perfect fourth; raise F to F♯ and you have an <strong>augmented fourth</strong> (6 semitones). <span class="word">Diminished</span> means one semitone <strong>smaller</strong>. C to G♭ is a diminished fifth — the same two keys as C to F♯. That 6-semitone distance is also called a <strong>tritone</strong> (three whole tones).</div>

<p>Play C to F♯ (the tritone), four times:</p>
<staff-player notes="C4,F#4,C4,F#4,C4,F#4,C4,F#4"></staff-player>

<p>C to F♯ is <strong>not 4.5</strong>. It sits between 4 and 5 on the white-key list, but musicians keep whole step-numbers and then say perfect, major, minor, or augmented.</p>

<p>An interval is <strong>not</strong> always a whole step. A whole step is one small interval (C to D). A half step is one smaller interval (C to C♯, or B to C). A fifth is a bigger interval (C to G). Same idea — two notes, a distance — just different sizes.</p>

<p>The last column <strong>is</strong> the interval name. “Count” is how many letters you walk, including the start (C to E is a third: C, D, E). Semitones are how many keys you walk. A <strong>second</strong> (count 2) is not always a whole step: C to C♯ is a minor second (half step); C to D is a major second (whole step).</p>

<table>
  <thead><tr><th>From C up to</th><th>Semitones</th><th>Count</th><th>Interval</th></tr></thead>
  <tbody>
    <tr><td>C</td><td>0</td><td>1</td><td>perfect unison</td></tr>
    <tr><td>C♯</td><td>1</td><td>2</td><td>minor second (half step)</td></tr>
    <tr><td>D</td><td>2</td><td>2</td><td>major second (whole step)</td></tr>
    <tr><td>E♭</td><td>3</td><td>3</td><td>minor third</td></tr>
    <tr><td>E</td><td>4</td><td>3</td><td>major third</td></tr>
    <tr><td>F</td><td>5</td><td>4</td><td>perfect fourth</td></tr>
    <tr><td>F♯</td><td><strong>6</strong></td><td>4</td><td>tritone (augmented fourth)</td></tr>
    <tr><td>G</td><td>7</td><td>5</td><td>perfect fifth</td></tr>
    <tr><td>A♭</td><td>8</td><td>6</td><td>minor sixth</td></tr>
    <tr><td>A</td><td>9</td><td>6</td><td>major sixth</td></tr>
    <tr><td>B♭</td><td>10</td><td>7</td><td>minor seventh</td></tr>
    <tr><td>B</td><td>11</td><td>7</td><td>major seventh</td></tr>
    <tr><td>C</td><td>12</td><td>8</td><td>perfect octave</td></tr>
  </tbody>
</table>

<p>Every size from 0 to 12 is in that list. The old table only showed white keys (and F♯), so 1, 3, 8, and 10 looked like holes. They are not holes. They are the minor intervals.</p>

<p>Hear a half step, four times:</p>
<staff-player notes="C4,C#4,C4,C#4,C4,C#4,C4,C#4"></staff-player>
<p>A whole step, four times:</p>
<staff-player notes="C4,D4,C4,D4,C4,D4,C4,D4"></staff-player>
<p>A fifth, four times — three intervals, only one of them a whole step:</p>
<staff-player notes="C4,G4,C4,G4,C4,G4,C4,G4"></staff-player>

<p>F♯ is <strong>not</strong> in the C major list. It is an in-between note. You can still name the interval (augmented fourth) because an interval only needs two pitches.</p>

<p><strong>Degree is more specific than interval.</strong> A degree needs a home note and a scale list. An interval only needs two notes.</p>

<h2 id="why-c">Why do piano books often start at C?</h2>

<p>We do <strong>not</strong> have to start at C. The letter list still begins at A. About a thousand years ago in Europe, people named the notes A through G, starting at A, just like the alphabet.</p>

<p>If you play only the <strong>white keys from A to A</strong>, the tune has a softer, sadder color. That list is called <strong>A minor</strong>. If you play only the <strong>white keys from C to C</strong>, the tune has a brighter color. That list is called <strong>C major</strong>.</p>

<p>Piano lessons often start at C because <strong>C major uses only white keys</strong> and sounds like many children’s songs. It is a handy door, not the start of the alphabet. Later we will start lists on other letters too.</p>

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
