---
title: Sight Reading Trainer
type: trainer
description: Practice reading notes on the grand staff with your MIDI keyboard. Notes highlight green on correct, ghost on wrong.
---

<style>
note-chart {
    display: block;
    width: 100%;
    overflow: hidden;
    max-width: 100%;
}

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


.combobox {
    position: relative;
    max-width: 180px;
}
.combobox input {
    width: 100%;
    box-sizing: border-box;
    background: var(--header-bg);
    color: var(--text);
    border: 2px solid var(--border);
    padding: 0.4rem 2rem 0.4rem 0.8rem;
    border-radius: 10px;
    font-family: inherit;
    font-size: 1rem;
    cursor: pointer;
}
.combobox input:not(:read-only) {
    cursor: text;
}
.combobox-toggle {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text);
    cursor: pointer;
    font-size: 0.7rem;
    padding: 0;
    opacity: 0.6;
}
.combobox-list {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    width: 240px;
    max-height: 200px;
    overflow-y: auto;
    background: var(--panel-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    z-index: 200;
    padding: 4px 0;
    margin: 4px 0 0 0;
    list-style: none;
}
.combobox-list.open {
    display: block;
}
.combobox-list li {
    padding: 0.4rem 0.8rem;
    cursor: pointer;
    color: var(--text);
    font-size: 0.9rem;
}
.combobox-list li:hover,
.combobox-list li.highlighted {
    background: color-mix(in srgb, var(--accent) 20%, transparent);
}
.combobox-list li.selected {
    font-weight: bold;
}
.combobox-list li.selected::after {
    content: ' ✓';
    color: var(--accent);
}
.combobox-clear {
    display: none;
    position: absolute;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text);
    cursor: pointer;
    font-size: 1rem;
    padding: 0;
    opacity: 0.4;
    line-height: 1;
}
.combobox-clear.visible {
    display: block;
}
</style>


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
    <div class="combobox" id="song-combobox">
        <input type="text" id="trainer-song" value="{{ sightReadingSongs[0].title | default: '' }}" title="{{ sightReadingSongs[0].id | default: 'random' }}" placeholder="Random" readonly>
        <button class="combobox-clear{% if sightReadingSongs.size > 0 %} visible{% endif %}" id="song-clear">&times;</button>
        <button class="combobox-toggle" id="song-toggle">&#9660;</button>
        <ul class="combobox-list" id="song-list"><li data-value="">Random</li>{% for song in sightReadingSongs %}<li data-value="{{ song.title }}"{% if forloop.first %} class="selected"{% endif %}>{{ song.title }}</li>{% endfor %}</ul>
    </div>
    <div class="score-item" style="font-size:0.9rem;flex-direction:row;gap:0.3rem">
        <span style="opacity:0.7">Pattern:</span>
        <button class="pat-btn" data-pattern="1" onclick="setPatternSize(1)" style="font-size:0.8rem;padding:0.15rem 0.5rem;border-radius:6px;border:1px solid var(--border);background:var(--panel-bg);color:var(--text);cursor:pointer;font-weight:bold">1</button>
        <button class="pat-btn" data-pattern="2" onclick="setPatternSize(2)" style="font-size:0.8rem;padding:0.15rem 0.5rem;border-radius:6px;border:1px solid var(--border);background:var(--panel-bg);color:var(--text);cursor:pointer">2</button>
        <button class="pat-btn" data-pattern="3" onclick="setPatternSize(3)" style="font-size:0.8rem;padding:0.15rem 0.5rem;border-radius:6px;border:1px solid var(--border);background:var(--panel-bg);color:var(--text);cursor:pointer">3</button>
    </div>
</div>

<h2 id="song-title-heading" style="text-align:center;margin:0.4rem 0;font-size:1.3rem;color:var(--text);font-weight:600;cursor:help" title="{{ sightReadingSongs[0].id | default: 'random' }}">{{ sightReadingSongs[0].title | default: 'Random Sight Reading' }}</h2>

<div id="trainer-panel" style="padding-top:0">
    <button id="play-btn" style="font-size:0.9rem;padding:0.3rem 0.9rem;border-radius:8px;border:2px solid var(--accent);background:var(--accent);color:#fff;cursor:pointer;font-weight:bold;display:inline-flex;align-items:center;gap:0.3rem" onclick="togglePlayTrainer()">
        <span id="play-btn-icon">▶</span> <span id="play-btn-label">Play</span>
    </button>
    <button id="refresh-btn" style="font-size:0.9rem;padding:0.3rem 0.8rem;border-radius:8px;border:2px solid var(--border);background:var(--panel-bg);color:var(--text);cursor:pointer;transition:transform 0.3s ease" onclick="refreshTrainer()">↻</button>
    <label class="score-item" style="font-size:0.8rem;flex-direction:row;gap:0.3rem;cursor:pointer;user-select:none">
        <input type="checkbox" id="play-wrong-toggle" checked onchange="togglePlayWrong(this.checked)">
        <span style="opacity:0.7">Play wrong notes</span>
    </label>
    <div class="score-item">
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.9rem;">
            <input type="checkbox" id="metronome-toggle" onchange="toggleMetronome(this.checked)">
            <label for="metronome-toggle">♫</label>
            <span id="metro-dot" style="display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--accent);opacity:0;transition:opacity 0.05s"></span>
            <button id="bpm-minus" style="font-size:1rem;padding:0.1rem 0.5rem;border-radius:6px;border:1px solid var(--border);background:var(--panel-bg);color:var(--text);cursor:pointer;font-weight:bold;line-height:1.4">−</button>
            <input type="range" id="metro-bpm" min="20" max="200" value="80" style="width:210px;height:4px" oninput="updateBpm(this.value)">
            <button id="bpm-plus" style="font-size:1rem;padding:0.1rem 0.5rem;border-radius:6px;border:1px solid var(--border);background:var(--panel-bg);color:var(--text);cursor:pointer;font-weight:bold;line-height:1.4">+</button>
            <span id="bpm-label" style="font-size:0.8rem;opacity:0.7;min-width:2em;text-align:center">80</span>
        </div>
    </div>
</div>

<script>
(function () {
    let trainer = null;
    let SONGS_LIST = [];
    let lastSongTitle = null;
    const songEl = document.getElementById('trainer-song');

    // metronome
    let metroInterval = null;
    let metroBpm = parseInt(localStorage.getItem('tape-bpm')) || 80;
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
        localStorage.setItem('tape-bpm', metroBpm);
        var label = document.getElementById('bpm-label');
        if (label) label.textContent = metroBpm;
        if (trainer && trainer.setBpm) trainer.setBpm(metroBpm);
        if (metroInterval) {
            clearInterval(metroInterval);
            metroBeat = 0;
            metroInterval = setInterval(function () {
                metroClick(metroBeat % 4 === 0);
                metroBeat++;
            }, 60000 / metroBpm);
        }
    };

    function applySong() {
        const title = songEl.value.trim();
        const rangeEl = document.getElementById('trainer-range');
        const range = rangeEl ? rangeEl.value : 'full';
        const heading = document.getElementById('song-title-heading');
        if (title) {
            const song = SONGS_LIST.find(function (s) { return s.title === title; });
            if (song) {
                if (heading) {
                    heading.textContent = song.title;
                    heading.title = song.id || song.title;
                }
                if (songEl) songEl.title = song.id || song.title;
                let notes = (song.notes || []).slice();
                if (range === 'treble') {
                    notes = notes.filter(function (n) { return n.oct >= 4; });
                } else if (range === 'bass') {
                    notes = notes.filter(function (n) { return n.oct <= 3; });
                }
                trainer.setNotes(notes, song.rests);
                const chart = document.querySelector('note-chart');
                if (chart) {
                    if (song.timeSignature) chart.timeSignature = song.timeSignature;
                    if (song.keySignature) chart.keySignature = song.keySignature;
                    chart.tempo = song.tempo || 80;
                }
                if (song.tempo && title !== lastSongTitle) {
                    const slider = document.getElementById('metro-bpm');
                    if (slider) slider.value = song.tempo;
                    if (typeof window.updateBpm === 'function') window.updateBpm(song.tempo);
                }
                lastSongTitle = title;
                return;
            }
        }
        if (heading) {
            heading.textContent = 'Random Sight Reading';
            heading.title = 'random';
        }
        if (songEl) songEl.title = 'random';
        lastSongTitle = '';
        trainer.setNotes(null);
    }

    function loadSongs() {
        const url = "{{ '/songs/sight-reading/songs.json' | htmlBaseUrl }}";
        return fetch(url)
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status + ' loading ' + url);
                return r.json();
            })
            .then(function (songs) {
                SONGS_LIST = songs;
                var list = document.getElementById('song-list');
                if (!list) return;
                list.innerHTML = '';
                var random = document.createElement('li');
                random.textContent = 'Random';
                random.dataset.value = '';
                list.appendChild(random);
                songs.forEach(function (s) {
                    var li = document.createElement('li');
                    var displayTitle = s.title || s.id;
                    li.textContent = displayTitle;
                    li.dataset.value = displayTitle;
                    list.appendChild(li);
                });
                var savedSong = localStorage.getItem('tape-song');
                var initialTitle = '';
                if (savedSong !== null) {
                    if (savedSong === '') {
                        initialTitle = '';
                    } else if (songs.some(function (s) { return (s.title || s.id) === savedSong; })) {
                        initialTitle = savedSong;
                    } else {
                        initialTitle = songs.length > 0 ? (songs[0].title || songs[0].id) : '';
                    }
                } else {
                    initialTitle = songs.length > 0 ? (songs[0].title || songs[0].id) : '';
                }
                setupCombobox(initialTitle);
                applySong();
                if (trainer) trainer.start();
            })
            .catch(function (err) {
                console.error('Error loading songs:', err);
            });
    }

    function setupCombobox(initialValue) {
        var input = songEl;
        var list = document.getElementById('song-list');
        var toggle = document.getElementById('song-toggle');
        var clear = document.getElementById('song-clear');
        var container = document.getElementById('song-combobox');
        var open = false;
        var selectedValue = initialValue || '';

        if (selectedValue) {
            input.value = selectedValue;
            input.placeholder = '';
            if (clear) clear.classList.add('visible');
        } else {
            input.value = '';
            input.placeholder = 'Random';
            if (clear) clear.classList.remove('visible');
        }
        Array.from(list.children).forEach(function (li) {
            li.classList.toggle('selected', li.dataset.value === selectedValue);
        });

        function openList() {
            open = true;
            list.classList.add('open');
            input.removeAttribute('readonly');
            input.value = '';
            input.focus();
            Array.from(list.children).forEach(function (li) { li.style.display = ''; });
            highlightItem(null);
        }

        function closeList() {
            open = false;
            list.classList.remove('open');
            input.setAttribute('readonly', '');
            input.value = selectedValue || '';
            input.placeholder = selectedValue ? '' : 'Random';
        }

        function highlightItem(li) {
            Array.from(list.children).forEach(function (el) { el.classList.remove('highlighted'); });
            if (li) li.classList.add('highlighted');
        }

        function selectItem(value) {
            selectedValue = value;
            if (value) {
                localStorage.setItem('tape-song', value);
            } else {
                localStorage.setItem('tape-song', '');
            }
            Array.from(list.children).forEach(function (li) {
                li.classList.toggle('selected', li.dataset.value === value);
            });
            if (value) {
                input.value = value;
                input.placeholder = '';
                if (clear) clear.classList.add('visible');
            } else {
                input.value = '';
                input.placeholder = 'Random';
                if (clear) clear.classList.remove('visible');
            }
            closeList();
            applySong();
            if (trainer) trainer.start();
        }

        function visibleItems() {
            return Array.from(list.children).filter(function (li) {
                return li.style.display !== 'none';
            });
        }

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            if (open) closeList(); else openList();
        });

        input.addEventListener('focus', function () {
            if (!open) openList();
        });

        input.addEventListener('input', function () {
            if (!open) return;
            var q = input.value.toLowerCase();
            Array.from(list.children).forEach(function (li) {
                if (li.dataset.value === '') {
                    li.style.display = '';
                } else {
                    li.style.display = li.textContent.toLowerCase().indexOf(q) >= 0 ? '' : 'none';
                }
            });
            highlightItem(visibleItems()[0] || null);
        });

        input.addEventListener('keydown', function (e) {
            if (!open) return;
            var items = visibleItems();
            if (e.key === 'Escape') {
                closeList();
            } else if (e.key === 'Enter') {
                var hl = list.querySelector('.highlighted');
                if (hl) selectItem(hl.dataset.value || '');
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                var idx = items.indexOf(list.querySelector('.highlighted'));
                if (e.key === 'ArrowDown') idx = Math.min(idx + 1, items.length - 1);
                else idx = Math.max(idx - 1, 0);
                highlightItem(items[idx]);
                items[idx].scrollIntoView({ block: 'nearest' });
            }
        });

        list.addEventListener('click', function (e) {
            var li = e.target.closest('li');
            if (li) selectItem(li.dataset.value || '');
        });

        clear.addEventListener('click', function (e) {
            e.stopPropagation();
            selectItem('');
        });

        document.addEventListener('click', function (e) {
            if (open && !container.contains(e.target)) closeList();
        });
    }

    function init() {
        var chart = document.querySelector('note-chart');
        if (!window.__midiObservers || !chart || !chart._positions || !chart._ctx) {
            setTimeout(init, 20);
            return;
        }

        var bpmSlider = document.getElementById('metro-bpm');
        var bpmLabel = document.getElementById('bpm-label');
        bpmSlider.value = metroBpm;
        if (bpmLabel) bpmLabel.textContent = metroBpm;

        document.getElementById('bpm-minus').addEventListener('click', function () {
            var v = Math.max(40, metroBpm - 5);
            bpmSlider.value = v;
            updateBpm(v);
        });
        document.getElementById('bpm-plus').addEventListener('click', function () {
            var v = Math.min(200, metroBpm + 5);
            bpmSlider.value = v;
            updateBpm(v);
        });

        trainer = window.createTrainer({
            chartEl: chart,
            mode: 'tape-head',
            scoreCorrectEl: document.getElementById('score-correct'),
            scoreWrongEl: document.getElementById('score-wrong'),
            rangeEl: document.getElementById('trainer-range'),
        });
        trainer.setBpm(metroBpm);
        document.getElementById('trainer-range').addEventListener('change', function () {
            applySong();
            trainer.start();
        });
        window.__midiObservers.push(function (midiNote, isNoteOn, isNoteOff) {
            trainer.onMidi(midiNote, isNoteOn, isNoteOff);
        });
        loadSongs();
    }

    window.togglePlayTrainer = function () {
        if (!trainer) return;
        if (trainer.togglePlay) {
            const playing = trainer.togglePlay();
            const icon = document.getElementById('play-btn-icon');
            const label = document.getElementById('play-btn-label');
            const btn = document.getElementById('play-btn');
            if (icon && label && btn) {
                icon.textContent = playing ? '⏸' : '▶';
                label.textContent = playing ? 'Pause' : 'Play';
                btn.style.background = playing ? 'var(--panel-bg)' : 'var(--accent)';
                btn.style.color = playing ? 'var(--text)' : '#fff';
            }
        }
    };

    window.refreshTrainer = function () {
        if (trainer) trainer.start();
        const icon = document.getElementById('play-btn-icon');
        const label = document.getElementById('play-btn-label');
        const btn = document.getElementById('play-btn');
        if (icon && label && btn) {
            icon.textContent = '▶';
            label.textContent = 'Play';
            btn.style.background = 'var(--accent)';
            btn.style.color = '#fff';
        }
        document.getElementById('refresh-btn').style.transform = 'rotate(360deg)';
        setTimeout(function () {
            var rbtn = document.getElementById('refresh-btn');
            if (rbtn) rbtn.style.transform = '';
        }, 400);
    };

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
