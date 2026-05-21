class NoteChart extends HTMLElement {
    constructor() {
        super();
        this._notes = this._generateNotes();
    }

    connectedCallback() {
        this.render();
    }

    _cssVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    _generateNotes() {
        const notes = [];
        notes.push({ note: 'A', octave: 0 });
        notes.push({ note: 'B', octave: 0 });
        for (let oct = 1; oct <= 7; oct++) {
            for (const n of ['C', 'D', 'E', 'F', 'G', 'A', 'B']) {
                notes.push({ note: n, octave: oct });
            }
        }
        notes.push({ note: 'C', octave: 8 });
        return notes;
    }

    _octaveBand(noteObj) {
        if (noteObj.note === 'A' || noteObj.note === 'B') {
            return noteObj.octave;
        }
        return noteObj.octave - 1;
    }

    _getY(note, oct) {
        const noteIdx = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
        const c4Idx = 4 * 7 + 0;
        const thisIdx = oct * 7 + (noteIdx[note] || 0);
        return 185 + (c4Idx - thisIdx) * 6;
    }

    render() {
        const SPACING = 12;
        const NOTE_W = 24;
        const LEFT_PAD = 70;
        const SVG_H = 350;

        const noteAlpha = parseFloat(this._cssVar('--note-alpha')) || 0.2;
        const noteDAlpha = parseFloat(this._cssVar('--note-d-alpha')) || 0.4;
        const octaveColors = [];
        for (let i = 0; i <= 8; i++) {
            octaveColors.push(this._cssVar(`--octave-${i}`) || '128, 128, 128');
        }

        const total = this._notes.length;
        const staffW = total * NOTE_W;
        const svgW = LEFT_PAD + staffW + 20;
        const staffRight = LEFT_PAD + staffW;

        const activeBg = this._cssVar('--abc-bg') || 'transparent';
        const staffColor = this._cssVar('--abc-text') || '#666';

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${SVG_H}" viewBox="0 0 ${svgW} ${SVG_H}">`;
        svg += `<rect width="100%" height="100%" fill="${activeBg}"/>`;

        for (let i = 0; i < total; i++) {
            const n = this._notes[i];
            const band = this._octaveBand(n);
            const alpha = n.note === 'D' ? noteDAlpha : noteAlpha;
            const x = LEFT_PAD + i * NOTE_W;
            svg += `<rect x="${x}" y="0" width="${NOTE_W}" height="${SVG_H}" fill="rgba(${octaveColors[band]}, ${alpha})" />`;
        }

        const bassLines = [
            { note: 'G', oct: 2 },
            { note: 'B', oct: 2 },
            { note: 'D', oct: 3 },
            { note: 'F', oct: 3 },
            { note: 'A', oct: 3 },
        ];
        const trebleLines = [
            { note: 'E', oct: 4 },
            { note: 'G', oct: 4 },
            { note: 'B', oct: 4 },
            { note: 'D', oct: 5 },
            { note: 'F', oct: 5 },
        ];

        for (const l of bassLines) {
            const y = this._getY(l.note, l.oct);
            svg += `<line x1="${LEFT_PAD}" y1="${y}" x2="${staffRight}" y2="${y}" stroke="${staffColor}" stroke-width="1.5"/>`;
        }
        for (const l of trebleLines) {
            const y = this._getY(l.note, l.oct);
            svg += `<line x1="${LEFT_PAD}" y1="${y}" x2="${staffRight}" y2="${y}" stroke="${staffColor}" stroke-width="1.5"/>`;
        }

        const c4Y = this._getY('C', 4);
        svg += `<line x1="${LEFT_PAD}" y1="${c4Y}" x2="${LEFT_PAD + 35}" y2="${c4Y}" stroke="${staffColor}" stroke-width="1.5"/>`;

        const lowLedgers = [
            { note: 'E', oct: 2 },
            { note: 'C', oct: 2 },
            { note: 'A', oct: 1 },
            { note: 'F', oct: 1 },
            { note: 'D', oct: 1 },
            { note: 'B', oct: 0 },
        ];
        for (const l of lowLedgers) {
            const y = this._getY(l.note, l.oct);
            svg += `<line x1="${LEFT_PAD}" y1="${y}" x2="${LEFT_PAD + 30}" y2="${y}" stroke="${staffColor}" stroke-width="1.5"/>`;
        }

        const highLedgers = [
            { note: 'A', oct: 5 },
            { note: 'C', oct: 6 },
            { note: 'E', oct: 6 },
            { note: 'G', oct: 6 },
            { note: 'B', oct: 6 },
            { note: 'D', oct: 7 },
            { note: 'F', oct: 7 },
            { note: 'A', oct: 7 },
            { note: 'C', oct: 8 },
        ];
        for (const l of highLedgers) {
            const y = this._getY(l.note, l.oct);
            svg += `<line x1="${staffRight - 30}" y1="${y}" x2="${staffRight}" y2="${y}" stroke="${staffColor}" stroke-width="1.5"/>`;
        }

        const trebleBot = this._getY('E', 4);
        const trebleTop = this._getY('F', 5);
        const bassBot = this._getY('G', 2);
        const bassTop = this._getY('A', 3);

        svg += `<text x="12" y="${(trebleBot + trebleTop) / 2 + 22}" font-size="65" font-family="serif" fill="${staffColor}">𝄞</text>`;
        svg += `<text x="12" y="${(bassBot + bassTop) / 2 + 8}" font-size="55" font-family="serif" fill="${staffColor}">𝄢</text>`;

        const braceY = (bassTop + trebleBot) / 2;
        svg += `<text x="42" y="${braceY + 8}" font-size="60" font-family="serif" fill="${staffColor}">{</text>`;

        const barX = LEFT_PAD + 75;
        svg += `<line x1="${barX}" y1="${bassTop}" x2="${barX}" y2="${trebleBot}" stroke="${staffColor}" stroke-width="1" stroke-dasharray="3,3"/>`;

        svg += `</svg>`;
        this.innerHTML = svg;
    }

    highlightOctave(index) {
        const noteAlpha = parseFloat(this._cssVar('--note-alpha')) || 0.2;
        const band = index;
        this.querySelectorAll('rect').forEach((r, i) => {
            if (i > 0) {
                const n = this._notes[i - 1];
                if (n && this._octaveBand(n) === band) {
                    r.setAttribute('fill-opacity', noteAlpha * 3);
                }
            }
        });
    }

    highlightNote(noteFull) {
    }
}

customElements.define('note-chart', NoteChart);
