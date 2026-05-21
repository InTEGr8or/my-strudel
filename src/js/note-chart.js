class NoteChart extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    _cssVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    _octaveBand(note, oct) {
        if (note === 'A' || note === 'B') return oct;
        return oct - 1;
    }

    render() {
        const SPACING = 18;
        const BAND_H = SPACING;
        const SVG_W = 640;
        const LEFT_PAD = 80;
        const STAFF_R = SVG_W - 20;
        const C4_Y = 200;

        const noteAlpha = parseFloat(this._cssVar('--note-alpha')) || 0.2;
        const noteDAlpha = parseFloat(this._cssVar('--note-d-alpha')) || 0.4;
        const octaveColors = [];
        for (let i = 0; i <= 8; i++) {
            octaveColors.push(this._cssVar(`--octave-${i}`) || '128, 128, 128');
        }
        const activeBg = this._cssVar('--abc-bg') || 'transparent';
        const staffColor = this._cssVar('--abc-text') || '#666';

        const getY = (note, oct) => {
            const ni = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
            const idx = oct * 7 + (ni[note] || 0);
            const c4 = 4 * 7 + 0;
            return C4_Y + (c4 - idx) * (SPACING / 2);
        };

        const positions = [
            { note: 'G', oct: 2 },
            { note: 'A', oct: 2 },
            { note: 'B', oct: 2 },
            { note: 'C', oct: 3 },
            { note: 'D', oct: 3 },
            { note: 'E', oct: 3 },
            { note: 'F', oct: 3 },
            { note: 'G', oct: 3 },
            { note: 'A', oct: 3 },
            { note: 'B', oct: 3 },
            { note: 'C', oct: 4 },
            { note: 'D', oct: 4 },
            { note: 'E', oct: 4 },
            { note: 'F', oct: 4 },
            { note: 'G', oct: 4 },
            { note: 'A', oct: 4 },
            { note: 'B', oct: 4 },
            { note: 'C', oct: 5 },
            { note: 'D', oct: 5 },
            { note: 'E', oct: 5 },
            { note: 'F', oct: 5 },
        ];

        const minY = getY('F', 5);
        const maxY = getY('G', 2);
        const SVG_H = maxY + 40;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}">`;
        svg += `<rect width="100%" height="100%" fill="${activeBg}"/>`;

        for (const p of positions) {
            const y = getY(p.note, p.oct);
            const band = this._octaveBand(p.note, p.oct);
            const alpha = p.note === 'D' ? noteDAlpha : noteAlpha;
            svg += `<rect x="${LEFT_PAD}" y="${y - BAND_H/2}" width="${STAFF_R - LEFT_PAD}" height="${BAND_H}" fill="rgba(${octaveColors[band]}, ${alpha})"/>`;
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
            const y = getY(l.note, l.oct);
            svg += `<line x1="${LEFT_PAD}" y1="${y}" x2="${STAFF_R}" y2="${y}" stroke="${staffColor}" stroke-width="1.5"/>`;
        }
        for (const l of trebleLines) {
            const y = getY(l.note, l.oct);
            svg += `<line x1="${LEFT_PAD}" y1="${y}" x2="${STAFF_R}" y2="${y}" stroke="${staffColor}" stroke-width="1.5"/>`;
        }

        const c4Y = getY('C', 4);
        svg += `<line x1="${LEFT_PAD}" y1="${c4Y}" x2="${LEFT_PAD + 40}" y2="${c4Y}" stroke="${staffColor}" stroke-width="1.5"/>`;

        const bBot = getY('G', 2);
        const bTop = getY('A', 3);
        const tBot = getY('E', 4);
        const tTop = getY('F', 5);

        svg += `<text x="10" y="${(tBot + tTop)/2 + 30}" font-size="80" font-family="serif" fill="${staffColor}">𝄞</text>`;
        svg += `<text x="10" y="${(bBot + bTop)/2 + 20}" font-size="70" font-family="serif" fill="${staffColor}">𝄢</text>`;

        const braceMid = (bTop + tBot) / 2;
        svg += `<text x="48" y="${braceMid + 16}" font-size="70" font-family="serif" fill="${staffColor}">{</text>`;

        const barX = LEFT_PAD + 80;
        svg += `<line x1="${barX}" y1="${bTop}" x2="${barX}" y2="${tBot}" stroke="${staffColor}" stroke-width="1" stroke-dasharray="3,3"/>`;

        svg += `</svg>`;
        this.innerHTML = svg;
    }

    highlightOctave(index) {
        const noteAlpha = parseFloat(this._cssVar('--note-alpha')) || 0.2;
        this.querySelectorAll('rect').forEach((r, i) => {
            if (i > 0) {
                const pIdx = i - 1;
                const pos = this._positions[pIdx];
                if (pos && this._octaveBand(pos.note, pos.oct) === index) {
                    r.setAttribute('fill-opacity', noteAlpha * 3);
                }
            }
        });
    }
}

customElements.define('note-chart', NoteChart);
