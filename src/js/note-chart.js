class NoteChart extends HTMLElement {
    connectedCallback() {
        const saved = localStorage.getItem('show-color-guide');
        if (saved === 'false') {
            this.dataset.showColors = 'false';
        }
        this.render();
    }

    setShowColors(show) {
        this.dataset.showColors = show ? 'true' : 'false';
        localStorage.setItem('show-color-guide', show ? 'true' : 'false');
    }

    _cssVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    _octaveBand(note, oct) {
        if (note === 'A' || note === 'B') return oct;
        return oct - 1;
    }

    render() {
        const scale = parseFloat(this._cssVar('--ui-scale')) || 1;
        const SPACING = 18 * scale;
        const BAND_H = SPACING;
        const SVG_W = 1200 * scale;
        const COLOR_X = 55 * scale;
        const COLOR_W = 50 * scale;
        const LEFT_PAD = COLOR_X + COLOR_W + 10 * scale;
        const STAFF_R = SVG_W - 20 * scale;
        const PAD = 30 * scale;

        const noteAlpha = parseFloat(this._cssVar('--note-alpha')) || 0.2;
        const noteDAlpha = parseFloat(this._cssVar('--note-d-alpha')) || 0.4;
        const octaveColors = [];
        for (let i = 0; i <= 8; i++) {
            octaveColors.push(this._cssVar(`--octave-${i}`) || '128, 128, 128');
        }
        const activeBg = this._cssVar('--abc-bg') || 'transparent';
        const staffColor = this._cssVar('--abc-text') || '#666';

        const halfStep = SPACING / 2;

        const getRawY = (note, oct) => {
            const ni = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
            return (28 - (oct * 7 + (ni[note] || 0))) * halfStep;
        };

        this._positions = [
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

        let rMin = Infinity, rMax = -Infinity;
        for (const p of this._positions) {
            const y = getRawY(p.note, p.oct);
            if (y < rMin) rMin = y;
            if (y > rMax) rMax = y;
        }
        const shift = PAD - rMin;
        const SVG_H = (rMax - rMin) + 2 * PAD;
        const getY = (note, oct) => getRawY(note, oct) + shift;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}" style="overflow:visible">`;
        svg += `<rect width="100%" height="100%" fill="${activeBg}"/>`;
        svg += `<g id="staff-bands">`;

        const leftW = COLOR_W / 2 - 2 * scale;
        const rightW = COLOR_W / 2 - 2 * scale;
        const gap = 4 * scale;

        for (let i = 0; i < this._positions.length; i++) {
            const p = this._positions[i];
            const y = getY(p.note, p.oct);
            const band = this._octaveBand(p.note, p.oct);
            const alpha = p.note === 'D' ? noteDAlpha : noteAlpha;
            const isLine = i % 2 === 0;

            let bandX, bandW;
            if (isLine) {
                bandX = COLOR_X;
                bandW = leftW;
            } else {
                bandX = COLOR_X + leftW + gap;
                bandW = rightW;
            }

            let bandY = y - BAND_H / 2;
            let bandH = BAND_H;
            if (p.note === 'G') {
                bandY += 0.125 * BAND_H;
                bandH = BAND_H * 0.75;
            } else if (p.note === 'A') {
                bandH = BAND_H * 0.75;
            }

            svg += `<rect x="${bandX}" y="${bandY}" width="${bandW}" height="${bandH}" fill="rgba(${octaveColors[band]}, ${alpha})" data-note="${p.note}" data-oct="${p.oct}"/>`;

            const textX = bandX + bandW / 2;
            svg += `<text x="${textX}" y="${y}" font-size="${10 * scale}" text-anchor="middle" dominant-baseline="central" font-weight="300" fill="${staffColor}" opacity="0.7">${p.note}</text>`;
        }

        svg += `</g>`;

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
            svg += `<line x1="${LEFT_PAD}" y1="${y}" x2="${STAFF_R}" y2="${y}" stroke="${staffColor}" stroke-width="${1.5 * scale}"/>`;
        }
        for (const l of trebleLines) {
            const y = getY(l.note, l.oct);
            svg += `<line x1="${LEFT_PAD}" y1="${y}" x2="${STAFF_R}" y2="${y}" stroke="${staffColor}" stroke-width="${1.5 * scale}"/>`;
        }

        const bBot = getY('G', 2);
        const bTop = getY('A', 3);
        const tBot = getY('E', 4);
        const tTop = getY('F', 5);

        const tCenter = (tBot + tTop) / 2;
        const bassClefY = getY('F', 3);
        const braceMid = (bTop + tBot) / 2;

        svg += `<text x="-73" y="${braceMid - 25 * scale}" font-size="${210 * scale}" dy="0.35em" font-family="serif" font-weight="300" fill="${staffColor}">{</text>`;
        svg += `<text x="15" y="${tCenter}" font-size="${80 * scale}" dy="0.35em" font-family="serif" fill="${staffColor}">𝄞</text>`;
        svg += `<text x="15" y="${bassClefY}" font-size="${70 * scale}" dy="0.35em" font-family="serif" fill="${staffColor}">𝄢</text>`;

        svg += `</svg>`;
        this.innerHTML = svg;

        this._ctx = { getY, LEFT_PAD, STAFF_R, scale, staffColor, SPACING, SVG_H };
    }

    _noteY(note, oct) {
        const ni = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
        const halfStep = this._ctx.SPACING / 2;
        const raw = (28 - (oct * 7 + (ni[note] || 0))) * halfStep;
        const getY = this._ctx.getY;
        if (getY) return getY(note, oct);
        return raw;
    }

    clearNoteHeads() {
        const g = this.querySelector('#note-heads');
        if (g) g.innerHTML = '';
    }

    renderNoteHead(noteName, type, cx) {
        const match = noteName.match(/^([a-g])(s?)(\d+)$/);
        if (!match) return;
        const note = match[1].toUpperCase();
        const oct = parseInt(match[3], 10);
        const ctx = this._ctx;
        if (!ctx) return;
        const { getY, LEFT_PAD, STAFF_R, scale, staffColor, SPACING } = ctx;

        const centerX = cx !== undefined ? cx : (LEFT_PAD + STAFF_R) / 2;
        const y = getY(note, oct);
        const headW = SPACING * 1.2;
        const headH = SPACING * 0.75;
        const stemLen = SPACING * 3.5;

        let g = this.querySelector('#note-heads');
        if (!g) {
            g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('id', 'note-heads');
            this.querySelector('svg').appendChild(g);
        }
        const svgNs = 'http://www.w3.org/2000/svg';
        const el = document.createElementNS(svgNs, 'g');
        el.style.transition = 'transform 150ms ease-out';

        // ledger lines for notes outside the visible G2–F5 range
        const ni = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
        const isBelow = oct < 2 || (oct === 2 && (ni[note] || 0) < 4);
        const isAbove = oct > 5 || (oct === 5 && (ni[note] || 0) > 3);
        const isMiddleC = oct === 4 && note === 'C';
        if (isBelow || isAbove || isMiddleC) {
            const line = document.createElementNS(svgNs, 'line');
            line.setAttribute('x1', centerX - SPACING * 1.2);
            line.setAttribute('y1', y);
            line.setAttribute('x2', centerX + SPACING * 1.2);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', staffColor);
            line.setAttribute('stroke-width', 1 * scale);
            el.appendChild(line);
        }

        // note head
        const head = document.createElementNS(svgNs, 'ellipse');
        head.setAttribute('cx', centerX);
        head.setAttribute('cy', y);
        head.setAttribute('rx', headW / 2);
        head.setAttribute('ry', headH / 2);
        head.setAttribute('transform', `rotate(-15, ${centerX}, ${y})`);

        const accentColor = this._cssVar('--accent') || '#005cc5';

        if (type === 'target') {
            head.setAttribute('fill', accentColor);
            head.setAttribute('stroke', accentColor);
            head.setAttribute('stroke-width', 2 * scale);
        } else if (type === 'correct') {
            head.setAttribute('fill', '#28a745');
            head.setAttribute('stroke', '#28a745');
            head.setAttribute('stroke-width', 1.5 * scale);
        } else if (type === 'ghost') {
            head.setAttribute('fill', 'none');
            head.setAttribute('stroke', staffColor);
            head.setAttribute('stroke-width', 1.5 * scale);
            head.setAttribute('stroke-dasharray', `${3 * scale} ${2 * scale}`);
        } else if (type === 'pending') {
            head.setAttribute('fill', staffColor);
            head.setAttribute('stroke', staffColor);
            head.setAttribute('stroke-width', 1 * scale);
            head.setAttribute('opacity', '0.35');
        } else {
            head.setAttribute('fill', staffColor);
            head.setAttribute('stroke', staffColor);
            head.setAttribute('stroke-width', 1 * scale);
        }
        el.appendChild(head);

        // stem
        let stemColor = staffColor;
        if (type === 'target') stemColor = accentColor;
        else if (type === 'correct') stemColor = '#28a745';
        const stem = document.createElementNS(svgNs, 'line');
        stem.setAttribute('x1', centerX + headW / 2);
        stem.setAttribute('y1', y);
        stem.setAttribute('x2', centerX + headW / 2);
        stem.setAttribute('y2', y - stemLen);
        stem.setAttribute('stroke', stemColor);
        stem.setAttribute('stroke-width', 1.5 * scale);
        if (type === 'ghost') {
            stem.setAttribute('stroke-dasharray', `${3 * scale} ${2 * scale}`);
        }
        if (type === 'pending') {
            stem.setAttribute('opacity', '0.35');
        }
        el.appendChild(stem);

        g.appendChild(el);
        return el;
    }

    renderBarLine(x) {
        const ctx = this._ctx;
        if (!ctx) return;
        const { getY, staffColor, scale } = ctx;
        const svgNs = 'http://www.w3.org/2000/svg';
        const barline = document.createElementNS(svgNs, 'line');
        const y1 = getY('G', 2);
        const y2 = getY('F', 5);
        barline.setAttribute('x1', x);
        barline.setAttribute('y1', y1);
        barline.setAttribute('x2', x);
        barline.setAttribute('y2', y2);
        barline.setAttribute('stroke', staffColor);
        barline.setAttribute('stroke-width', 1.5 * scale);
        barline.style.transition = 'transform 150ms ease-out';
        let g = this.querySelector('#note-heads');
        if (!g) {
            g = document.createElementNS(svgNs, 'g');
            g.setAttribute('id', 'note-heads');
            this.querySelector('svg').appendChild(g);
        }
        g.appendChild(barline);
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

    highlightStaffNote(noteName, on) {
        const match = noteName.match(/^([a-g])(s?)(\d+)$/);
        if (!match) return;
        const note = match[1].toUpperCase();
        const oct = parseInt(match[3], 10);
        const bandEl = this.querySelector(`rect[data-note="${note}"][data-oct="${oct}"]`);
        if (bandEl) {
            if (on) {
                bandEl.setAttribute('fill-opacity', '0.9');
            } else {
                bandEl.removeAttribute('fill-opacity');
            }
        }
    }
}

customElements.define('note-chart', NoteChart);
