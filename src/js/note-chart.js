const STAFF_NI = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };

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
        const layout = (typeof globalThis !== 'undefined' && globalThis.computeStaffLayout)
            ? globalThis.computeStaffLayout(scale)
            : {
                SVG_W: 1200 * scale, COLOR_X: 85 * scale, COLOR_W: 50 * scale,
                LEFT_PAD: 145 * scale, STAFF_L: 50 * scale, STAFF_R: 1180 * scale,
                TOP_PAD: 120 * scale, BOT_PAD: 155 * scale,
                keyX: 76 * scale, clefX: 94 * scale, timeX: 136 * scale,
            };
        const SPACING = 18 * scale;
        const BAND_H = SPACING;
        const SVG_W = layout.SVG_W;
        const COLOR_X = layout.COLOR_X;
        const COLOR_W = layout.COLOR_W;
        const LEFT_PAD = layout.LEFT_PAD;
        const STAFF_L = layout.STAFF_L;
        const STAFF_R = layout.STAFF_R;
        const TOP_PAD = layout.TOP_PAD;
        const BOT_PAD = layout.BOT_PAD;

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
            return (28 - (oct * 7 + (STAFF_NI[note] || 0))) * halfStep;
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
        const shift = TOP_PAD - rMin;
        const SVG_H = (rMax - rMin) + TOP_PAD + BOT_PAD;
        const getY = (note, oct) => getRawY(note, oct) + shift;

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

        const bBot = getY('G', 2);
        const bTop = getY('A', 3);
        const tBot = getY('E', 4);
        const tTop = getY('F', 5);
        const tCenter = (tBot + tTop) / 2;
        const bassClefY = getY('F', 3);
        const braceMid = (bTop + tBot) / 2;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}" style="display:block;overflow:hidden;max-width:100%">`;
        svg += `<rect width="100%" height="100%" fill="${activeBg}"/>`;

        // Staff lines — behind everything, full width from left edge to right
        svg += `<g id="staff-lines">`;
        for (const l of bassLines) {
            const y = getY(l.note, l.oct);
            svg += `<line x1="${STAFF_L}" y1="${y}" x2="${STAFF_R}" y2="${y}" stroke="${staffColor}" stroke-width="${1.5 * scale}"/>`;
        }
        for (const l of trebleLines) {
            const y = getY(l.note, l.oct);
            svg += `<line x1="${STAFF_L}" y1="${y}" x2="${STAFF_R}" y2="${y}" stroke="${staffColor}" stroke-width="${1.5 * scale}"/>`;
        }
        svg += `</g>`;

        // Staff annotations (brace, clefs, key signature, time signature)
        svg += `<g id="staff-annotations">`;
        const braceTop = tTop - SPACING * 0.5;
        const braceBot = bBot + SPACING * 0.5;
        const braceX = STAFF_L;
        const braceOffset = 10 * scale;
        svg += `<path d="M ${braceX},${braceTop} C ${braceX + braceOffset},${braceTop},${braceX + braceOffset},${braceMid},${braceX},${braceMid}" fill="none" stroke="${staffColor}" stroke-width="${2 * scale}" stroke-linecap="round"/>`;
        svg += `<path d="M ${braceX},${braceBot} C ${braceX + braceOffset},${braceBot},${braceX + braceOffset},${braceMid},${braceX},${braceMid}" fill="none" stroke="${staffColor}" stroke-width="${2 * scale}" stroke-linecap="round"/>`;
        svg += `<line x1="${braceX}" y1="${braceMid - 3 * scale}" x2="${braceX}" y2="${braceMid + 3 * scale}" stroke="${staffColor}" stroke-width="${2.5 * scale}" stroke-linecap="round"/>`;

        // Key signature — own column left of the clefs
        const ks = this._keySignature || [];
        if (ks.length > 0) {
            const accX = layout.keyX;
            for (const k of ks) {
                const ky = getY(k.note, k.oct);
                svg += `<text class="key-accidental" x="${accX}" y="${ky}" font-size="${22 * scale}" dy="0.3em" text-anchor="middle" font-family="serif" fill="${staffColor}">${k.acc === 'sharp' ? '♯' : '♭'}</text>`;
            }
        }

        svg += `<text class="clef-treble" x="${layout.clefX}" y="${tCenter}" font-size="${80 * scale}" dy="0.35em" font-family="serif" fill="${staffColor}">𝄞</text>`;
        svg += `<text class="clef-bass" x="${layout.clefX}" y="${bassClefY + 5 * scale}" font-size="${70 * scale}" dy="0.35em" font-family="serif" fill="${staffColor}">𝄢</text>`;

        // Time signature
        const ts = this._timeSignature || null;
        if (ts) {
            const tsX = layout.timeX;
            const tMid = (tBot + tTop) / 2;
            const bMid = (bBot + bTop) / 2;
            svg += `<text class="time-sig" x="${tsX}" y="${tMid - SPACING * 0.4}" font-size="${44 * scale}" text-anchor="middle" font-family="serif" font-weight="bold" fill="${staffColor}">${ts.top}</text>`;
            svg += `<text class="time-sig" x="${tsX}" y="${tMid + SPACING * 1.2}" font-size="${44 * scale}" text-anchor="middle" font-family="serif" font-weight="bold" fill="${staffColor}">${ts.bottom}</text>`;
            svg += `<text class="time-sig" x="${tsX}" y="${bMid - SPACING * 0.4}" font-size="${44 * scale}" text-anchor="middle" font-family="serif" font-weight="bold" fill="${staffColor}">${ts.top}</text>`;
            svg += `<text class="time-sig" x="${tsX}" y="${bMid + SPACING * 1.2}" font-size="${44 * scale}" text-anchor="middle" font-family="serif" font-weight="bold" fill="${staffColor}">${ts.bottom}</text>`;
        }
        svg += `</g>`;

        // Color guide bands
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
            const bandX = isLine ? COLOR_X : COLOR_X + leftW + gap;
            const bandW = isLine ? leftW : rightW;
            let bandY = y - BAND_H / 2;
            let bandH = BAND_H;
            if (p.note === 'G') {
                bandY += 0.125 * BAND_H;
                bandH = BAND_H * 0.75;
            } else if (p.note === 'A') {
                bandH = BAND_H * 0.75;
            }
            svg += `<rect x="${bandX}" y="${bandY}" width="${bandW}" height="${bandH}" fill="rgba(${octaveColors[band]}, ${alpha})" data-note="${p.note}" data-oct="${p.oct}"/>`;
            svg += `<text x="${bandX + bandW / 2}" y="${y}" font-size="${10 * scale}" text-anchor="middle" dominant-baseline="central" font-weight="300" fill="${staffColor}" opacity="0.7">${p.note}</text>`;
        }
        svg += `</g>`;

        // Staff content container (player overlays: note heads, bar lines, head line)
        svg += `<g id="staff-content">`;
        svg += `</g>`;
        svg += `<g id="head-ghosts"></g>`;

        svg += `</svg>`;
        this.innerHTML = svg;

        this._ctx = { getY, LEFT_PAD, STAFF_R, STAFF_L, scale, staffColor, SPACING, SVG_H, layout };
    }

    get timeSignature() { return this._timeSignature; }
    set timeSignature(ts) {
        this._timeSignature = ts;
        this._rerenderAnnotations();
    }

    get keySignature() { return this._keySignature; }
    set keySignature(ks) {
        this._keySignature = ks;
        this._rerenderAnnotations();
    }

    get tempo() { return this._tempo || 80; }
    set tempo(val) {
        this._tempo = val;
        this._rerenderAnnotations();
    }

    _rerenderAnnotations() {
        const ann = this.querySelector('#staff-annotations');
        if (!ann || !this._ctx) return;
        const { getY, scale, staffColor, SPACING, STAFF_L, layout } = this._ctx;
        const bBot = getY('G', 2);
        const bTop = getY('A', 3);
        const tBot = getY('E', 4);
        const tTop = getY('F', 5);
        const tCenter = (tBot + tTop) / 2;
        const bassClefY = getY('F', 3);
        const braceMid = (bTop + tBot) / 2;
        const braceX = STAFF_L;
        const keyX = layout ? layout.keyX : 40 * scale;
        const clefX = layout ? layout.clefX : 15 * scale;
        const timeX = layout ? layout.timeX : 75 * scale;

        let html = '';
        const braceTop = tTop - SPACING * 0.5;
        const braceBot = bBot + SPACING * 0.5;
        const braceOffset = 10 * scale;
        html += `<path d="M ${braceX},${braceTop} C ${braceX + braceOffset},${braceTop},${braceX + braceOffset},${braceMid},${braceX},${braceMid}" fill="none" stroke="${staffColor}" stroke-width="${2 * scale}" stroke-linecap="round"/>`;
        html += `<path d="M ${braceX},${braceBot} C ${braceX + braceOffset},${braceBot},${braceX + braceOffset},${braceMid},${braceX},${braceMid}" fill="none" stroke="${staffColor}" stroke-width="${2 * scale}" stroke-linecap="round"/>`;
        html += `<line x1="${braceX}" y1="${braceMid - 3 * scale}" x2="${braceX}" y2="${braceMid + 3 * scale}" stroke="${staffColor}" stroke-width="${2.5 * scale}" stroke-linecap="round"/>`;

        const ks = this._keySignature || [];
        if (ks.length > 0) {
            for (const k of ks) {
                const ky = getY(k.note, k.oct);
                html += `<text class="key-accidental" x="${keyX}" y="${ky}" font-size="${22 * scale}" dy="0.3em" text-anchor="middle" font-family="serif" fill="${staffColor}">${k.acc === 'sharp' ? '♯' : '♭'}</text>`;
            }
        }

        html += `<text class="clef-treble" x="${clefX}" y="${tCenter}" font-size="${80 * scale}" dy="0.35em" font-family="serif" fill="${staffColor}">𝄞</text>`;
        html += `<text class="clef-bass" x="${clefX}" y="${bassClefY + 5 * scale}" font-size="${70 * scale}" dy="0.35em" font-family="serif" fill="${staffColor}">𝄢</text>`;

        const tempoVal = this._tempo || 80;
        const tempoY = tTop - SPACING * 1.8;
        html += `<text x="${clefX}" y="${tempoY}" font-size="${18 * scale}" font-family="sans-serif" font-weight="bold" fill="${staffColor}">♩ = ${tempoVal}</text>`;

        const ts = this._timeSignature || null;
        if (ts) {
            const tMid = (tBot + tTop) / 2;
            const bMid = (bBot + bTop) / 2;
            html += `<text class="time-sig" x="${timeX}" y="${tMid - SPACING * 0.4}" font-size="${44 * scale}" text-anchor="middle" font-family="serif" font-weight="bold" fill="${staffColor}">${ts.top}</text>`;
            html += `<text class="time-sig" x="${timeX}" y="${tMid + SPACING * 1.2}" font-size="${44 * scale}" text-anchor="middle" font-family="serif" font-weight="bold" fill="${staffColor}">${ts.bottom}</text>`;
            html += `<text class="time-sig" x="${timeX}" y="${bMid - SPACING * 0.4}" font-size="${44 * scale}" text-anchor="middle" font-family="serif" font-weight="bold" fill="${staffColor}">${ts.top}</text>`;
            html += `<text class="time-sig" x="${timeX}" y="${bMid + SPACING * 1.2}" font-size="${44 * scale}" text-anchor="middle" font-family="serif" font-weight="bold" fill="${staffColor}">${ts.bottom}</text>`;
        }
        ann.innerHTML = html;
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

    renderNoteHead(noteName, type, cx, showLabel, duration, opts) {
        const match = noteName.match(/^([a-g])([sfnx]?)(\d+)$/);
        if (!match) return;
        const note = match[1].toUpperCase();
        const accMark = match[2] || '';
        const oct = parseInt(match[3], 10);
        const ctx = this._ctx;
        if (!ctx) return;
        const { getY, LEFT_PAD, STAFF_R, scale, staffColor, SPACING } = ctx;

        const centerX = cx !== undefined ? cx : (LEFT_PAD + STAFF_R) / 2;
        const y = getY(note, oct);
        const headW = type === 'ghost' ? SPACING * 1.65 : SPACING * 1.2;
        const headH = type === 'ghost' ? SPACING * 1.05 : SPACING * 0.75;
        const stemLen = SPACING * 3.5;

        const groupId = type === 'ghost' ? 'head-ghosts' : 'note-heads';
        let g = this.querySelector('#' + groupId);
        if (!g) {
            g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('id', groupId);
            const sc = this.querySelector('#staff-content') || this.querySelector('svg');
            sc.appendChild(g);
        }
        const svgNs = 'http://www.w3.org/2000/svg';
        const el = document.createElementNS(svgNs, 'g');
        if (type === 'ghost') el.setAttribute('data-ghost', '1');
        el.style.transition = 'transform 150ms ease-out';

        // ledger lines: only outside the staves (plus middle C). B2 is on the bass staff.
        let ledgerYs = [];
        const ledgerFn = (typeof globalThis !== 'undefined' && globalThis.ledgerStaffIndices) || null;
        const toPitch = (typeof globalThis !== 'undefined' && globalThis.indexToPitch) || null;
        if (ledgerFn && toPitch) {
            const idxs = ledgerFn(note, oct);
            for (let li = 0; li < idxs.length; li++) {
                const p = toPitch(idxs[li]);
                ledgerYs.push(getY(p.note, p.oct));
            }
        } else if (oct === 4 && note === 'C') {
            ledgerYs.push(y);
        }

        for (const ly of ledgerYs) {
            const line = document.createElementNS(svgNs, 'line');
            line.setAttribute('x1', centerX - SPACING * 1.2);
            line.setAttribute('y1', ly);
            line.setAttribute('x2', centerX + SPACING * 1.2);
            line.setAttribute('y2', ly);
            line.setAttribute('stroke', staffColor);
            line.setAttribute('stroke-width', 1 * scale);
            el.appendChild(line);
        }

        // note head duration classification (beats: 6=dotted whole, 4=whole, 3=dotted half, …)
        const classify = (typeof globalThis !== 'undefined' && globalThis.classifyDuration) || null;
        const classified = classify
            ? classify(duration)
            : { name: 'quarter', dotted: false, hollow: false, stem: true, flags: 0 };
        const isDotted = classified.dotted;
        const isHollow = classified.hollow;
        const hideFlags = type === 'ghost' || (opts && opts.hideFlags);
        const flagCount = hideFlags ? 0 : (classified.flags || 0);
        const hasStem = type !== 'ghost' && classified.stem;

        // note head
        const head = document.createElementNS(svgNs, 'ellipse');
        head.setAttribute('cx', centerX);
        head.setAttribute('cy', y);
        head.setAttribute('rx', headW / 2);
        head.setAttribute('ry', headH / 2);
        head.setAttribute('transform', `rotate(-15, ${centerX}, ${y})`);

        const accentColor = this._cssVar('--accent') || '#005cc5';

        if (type === 'target') {
            head.setAttribute('fill', isHollow ? 'none' : accentColor);
            head.setAttribute('stroke', accentColor);
            head.setAttribute('stroke-width', 2 * scale);
        } else if (type === 'correct') {
            head.setAttribute('fill', isHollow ? 'none' : '#28a745');
            head.setAttribute('stroke', '#28a745');
            head.setAttribute('stroke-width', 2 * scale);
        } else if (type === 'missed') {
            head.setAttribute('fill', isHollow ? 'none' : '#f1c40f');
            head.setAttribute('stroke', '#f1c40f');
            head.setAttribute('stroke-width', 2 * scale);
        } else if (type === 'ghost') {
            head.setAttribute('fill', 'none');
            head.setAttribute('stroke', accentColor);
            head.setAttribute('stroke-width', 2 * scale);
            head.setAttribute('stroke-dasharray', `${4 * scale} ${3 * scale}`);
        } else if (type === 'pending') {
            head.setAttribute('fill', isHollow ? 'none' : staffColor);
            head.setAttribute('stroke', staffColor);
            head.setAttribute('stroke-width', isHollow ? 2 * scale : 1 * scale);
        } else {
            head.setAttribute('fill', isHollow ? 'none' : staffColor);
            head.setAttribute('stroke', staffColor);
            head.setAttribute('stroke-width', isHollow ? 2 * scale : 1 * scale);
        }
        el.appendChild(head);

        if (accMark === 's' || accMark === 'f' || accMark === 'b' || accMark === 'n' || accMark === 'x') {
            const acc = document.createElementNS(svgNs, 'text');
            acc.textContent = accMark === 's' ? '♯' : (accMark === 'n' ? '♮' : (accMark === 'x' ? '𝄪' : '♭'));
            acc.setAttribute('x', centerX - headW * 0.95);
            acc.setAttribute('y', y);
            acc.setAttribute('font-size', 18 * scale);
            acc.setAttribute('text-anchor', 'end');
            acc.setAttribute('dominant-baseline', 'central');
            acc.setAttribute('font-family', 'serif');
            acc.setAttribute('fill', type === 'target' ? accentColor : (type === 'correct' ? '#28a745' : staffColor));
            acc.setAttribute('class', 'note-accidental');
            el.appendChild(acc);
        }

        if (opts && opts.staccato) {
            const stac = document.createElementNS(svgNs, 'circle');
            stac.setAttribute('cx', centerX);
            stac.setAttribute('cy', y + headH * 1.15);
            stac.setAttribute('r', 2.2 * scale);
            stac.setAttribute('fill', type === 'target' ? accentColor : (type === 'correct' ? '#28a745' : staffColor));
            stac.setAttribute('class', 'note-staccato');
            el.appendChild(stac);
        }

        if (isDotted) {
            const dotCircle = document.createElementNS(svgNs, 'circle');
            dotCircle.setAttribute('cx', centerX + headW * 0.85);
            dotCircle.setAttribute('cy', y - 2 * scale);
            dotCircle.setAttribute('r', 2.5 * scale);
            dotCircle.setAttribute('fill', type === 'target' ? accentColor : (type === 'correct' ? '#28a745' : staffColor));
            el.appendChild(dotCircle);
        }

        if (hasStem) {
            // stem & flags
            let stemColor = staffColor;
            if (type === 'target') stemColor = accentColor;
            else if (type === 'correct') stemColor = '#28a745';
            else if (type === 'missed') stemColor = '#e67e22';
            const stemX = centerX + headW / 2;
            const stemY1 = y;
            const stemY2 = y - stemLen;

            const stem = document.createElementNS(svgNs, 'line');
            stem.setAttribute('x1', stemX);
            stem.setAttribute('y1', stemY1);
            stem.setAttribute('x2', stemX);
            stem.setAttribute('y2', stemY2);
            stem.setAttribute('stroke', stemColor);
            stem.setAttribute('stroke-width', 1.5 * scale);
            if (type === 'ghost') {
                stem.setAttribute('stroke-dasharray', `${3 * scale} ${2 * scale}`);
            }
            el.appendChild(stem);

            for (let f = 0; f < flagCount; f++) {
                const fy = stemY2 + f * 7 * scale;
                const flag = document.createElementNS(svgNs, 'path');
                const w = 11 * scale;
                const h = 16 * scale;
                flag.setAttribute('d', `M ${stemX},${fy} C ${stemX + w},${fy + 3 * scale} ${stemX + w},${fy + h * 0.65} ${stemX + 1 * scale},${fy + h} L ${stemX},${fy + h - 4 * scale} Z`);
                flag.setAttribute('fill', stemColor);
                flag.setAttribute('stroke', 'none');
                flag.setAttribute('class', 'note-flag');
                el.appendChild(flag);
            }
        }

        if (showLabel) {
            let labels = this.querySelector('#note-labels');
            if (!labels) {
                labels = document.createElementNS(svgNs, 'g');
                labels.setAttribute('id', 'note-labels');
                const sc = this.querySelector('#staff-content') || this.querySelector('svg');
                sc.appendChild(labels);
            }
            const label = document.createElementNS(svgNs, 'text');
            label.textContent = `${match[1].toUpperCase()}${match[2] ? '#' : ''}${match[3]}`;
            label.setAttribute('x', centerX);
            label.setAttribute('y', y);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('dominant-baseline', 'central');
            label.setAttribute('class', 'target-note-label');
            label.setAttribute('fill', '#00e5ff');
            label.style.fill = '#00e5ff';
            if (type === 'correct') {
                label.setAttribute('font-size', `${28 * scale}`);
                label.setAttribute('font-weight', 'bold');
            } else {
                label.setAttribute('font-size', `${24 * scale}`);
                label.setAttribute('font-weight', '300');
                label.setAttribute('opacity', '0.5');
            }
            label.style.animation = 'note-label-fade 500ms ease-out 250ms forwards';
            label.addEventListener('animationend', function () { label.remove(); });
            labels.appendChild(label);
        }

        g.appendChild(el);
        return el;
    }

    clearNoteHeads() {
        const g = this.querySelector('#note-heads');
        if (g) g.innerHTML = '';
        const b = this.querySelector('#bar-lines');
        if (b) b.innerHTML = '';
        const r = this.querySelector('#rests');
        if (r) r.innerHTML = '';
    }

    renderRest(cx, duration, clef) {
        const ctx = this._ctx;
        if (!ctx) return;
        const { getY, staffColor, scale, SPACING } = ctx;
        const svgNs = 'http://www.w3.org/2000/svg';
        let g = this.querySelector('#rests');
        if (!g) {
            g = document.createElementNS(svgNs, 'g');
            g.setAttribute('id', 'rests');
            const sc = this.querySelector('#staff-content') || this.querySelector('svg');
            sc.appendChild(g);
        }

        const isBass = clef === 'bass';
        const yCenter = isBass ? getY('D', 3) : getY('B', 4);
        const classify = (typeof globalThis !== 'undefined' && globalThis.classifyDuration) || null;
        const classified = classify
            ? classify(duration)
            : { name: 'quarter', dotted: false };
        const dur = classified.beats !== undefined ? classified.beats : (duration !== undefined ? duration : 1);
        const restKind = classified.name || '';

        if (restKind === 'dotted-whole' || restKind === 'whole' || restKind === 'breve' || dur >= 3.5) {
            // Whole rest: rectangle hanging below 4th line
            const rect = document.createElementNS(svgNs, 'rect');
            rect.setAttribute('x', cx - SPACING * 0.4);
            rect.setAttribute('y', yCenter - SPACING * 0.5);
            rect.setAttribute('width', SPACING * 0.8);
            rect.setAttribute('height', SPACING * 0.45);
            rect.setAttribute('fill', staffColor);
            rect.setAttribute('opacity', '0.75');
            rect.setAttribute('data-rest-kind', restKind || 'whole');
            g.appendChild(rect);
        } else if (dur >= 1.75) {
            // Half rest: rectangle sitting on 3rd line
            const rect = document.createElementNS(svgNs, 'rect');
            rect.setAttribute('x', cx - SPACING * 0.4);
            rect.setAttribute('y', yCenter - SPACING * 0.45);
            rect.setAttribute('width', SPACING * 0.8);
            rect.setAttribute('height', SPACING * 0.45);
            rect.setAttribute('fill', staffColor);
            rect.setAttribute('opacity', '0.75');
            rect.setAttribute('data-rest-kind', restKind || 'half');
            g.appendChild(rect);
        } else if (dur >= 0.875) {
            // Quarter rest vector path
            const path = document.createElementNS(svgNs, 'path');
            const d = `M ${cx - 3*scale} ${yCenter - 12*scale} L ${cx + 4*scale} ${yCenter - 4*scale} L ${cx - 4*scale} ${yCenter + 4*scale} Q ${cx + 6*scale} ${yCenter + 6*scale} ${cx + 2*scale} ${yCenter + 12*scale}`;
            path.setAttribute('d', d);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', staffColor);
            path.setAttribute('stroke-width', 2.5 * scale);
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('opacity', '0.75');
            g.appendChild(path);
        } else {
            // 8th / 16th rest vector path (bulb + stem)
            const grp = document.createElementNS(svgNs, 'g');
            grp.setAttribute('opacity', '0.75');
            const circle = document.createElementNS(svgNs, 'circle');
            circle.setAttribute('cx', cx - 2 * scale);
            circle.setAttribute('cy', yCenter - 3 * scale);
            circle.setAttribute('r', 2.5 * scale);
            circle.setAttribute('fill', staffColor);
            const line = document.createElementNS(svgNs, 'line');
            line.setAttribute('x1', cx + 1 * scale);
            line.setAttribute('y1', yCenter - 5 * scale);
            line.setAttribute('x2', cx - 4 * scale);
            line.setAttribute('y2', yCenter + 9 * scale);
            line.setAttribute('stroke', staffColor);
            line.setAttribute('stroke-width', 2 * scale);
            grp.appendChild(circle);
            grp.appendChild(line);
            g.appendChild(grp);
        }

        if (classified.dotted) {
            const dotCircle = document.createElementNS(svgNs, 'circle');
            dotCircle.setAttribute('cx', cx + SPACING * 0.85);
            dotCircle.setAttribute('cy', yCenter - 2 * scale);
            dotCircle.setAttribute('r', 2.5 * scale);
            dotCircle.setAttribute('fill', staffColor);
            dotCircle.setAttribute('class', 'rest-dot');
            g.appendChild(dotCircle);
        }
    }

    renderBeams(segments) {
        const ctx = this._ctx;
        if (!ctx || !segments || segments.length === 0) return;
        const { scale, staffColor } = ctx;
        const svgNs = 'http://www.w3.org/2000/svg';
        let g = this.querySelector('#note-heads');
        if (!g) return;
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            if (!seg || seg.x1 === undefined) continue;
            const thickness = 4 * scale;
            const gap = 5 * scale;
            const levels = seg.levels || 1;
            for (let lv = 0; lv < levels; lv++) {
                const y = seg.y + lv * (thickness + gap);
                const beam = document.createElementNS(svgNs, 'rect');
                beam.setAttribute('x', seg.x1);
                beam.setAttribute('y', y);
                beam.setAttribute('width', Math.max(1, seg.x2 - seg.x1));
                beam.setAttribute('height', thickness);
                beam.setAttribute('fill', staffColor);
                beam.setAttribute('class', 'note-beam');
                g.appendChild(beam);
            }
        }
    }

    renderTuplets(segments) {
        const ctx = this._ctx;
        if (!ctx || !segments || segments.length === 0) return;
        const { scale, staffColor } = ctx;
        const svgNs = 'http://www.w3.org/2000/svg';
        let g = this.querySelector('#note-heads');
        if (!g) return;
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            if (!seg || seg.x2 <= seg.x1) continue;
            const y = seg.y;
            const tick = 6 * scale;
            const mid = (seg.x1 + seg.x2) / 2;
            const gap = 8 * scale;
            const path = document.createElementNS(svgNs, 'path');
            path.setAttribute('d', `M ${seg.x1},${y + tick} L ${seg.x1},${y} L ${mid - gap},${y} M ${mid + gap},${y} L ${seg.x2},${y} L ${seg.x2},${y + tick}`);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', staffColor);
            path.setAttribute('stroke-width', 1.25 * scale);
            path.setAttribute('class', 'tuplet-bracket');
            g.appendChild(path);
            const label = document.createElementNS(svgNs, 'text');
            label.textContent = seg.label || '3';
            label.setAttribute('x', mid);
            label.setAttribute('y', y);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('dominant-baseline', 'central');
            label.setAttribute('font-size', 13 * scale);
            label.setAttribute('font-family', 'serif');
            label.setAttribute('font-style', 'italic');
            label.setAttribute('fill', staffColor);
            label.setAttribute('class', 'tuplet-label');
            g.appendChild(label);
        }
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
        barline.setAttribute('stroke-width', 2 * scale);
        barline.style.transition = 'transform 150ms ease-out';
        let g = this.querySelector('#bar-lines');
        if (!g) {
            g = document.createElementNS(svgNs, 'g');
            g.setAttribute('id', 'bar-lines');
            const sc = this.querySelector('#staff-content') || this.querySelector('svg');
            sc.appendChild(g);
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

    renderChordReference(notes) {
        const ctx = this._ctx;
        if (!ctx || !notes || notes.length === 0) return;
        const { getY, LEFT_PAD, scale, SPACING } = ctx;
        const svgNs = 'http://www.w3.org/2000/svg';
        let g = this.querySelector('#chord-reference');
        if (g) g.innerHTML = '';
        if (!g) {
            g = document.createElementNS(svgNs, 'g');
            g.setAttribute('id', 'chord-reference');
            const sc = this.querySelector('#staff-content') || this.querySelector('svg');
            sc.appendChild(g);
        }
        const headW = SPACING * 1.2;
        const headH = SPACING * 0.75;
        const cx = LEFT_PAD + 30;
        const yTop = getY(notes[notes.length - 1].note, notes[notes.length - 1].oct);
        const yBot = getY(notes[0].note, notes[0].oct);
        const accent = this._cssVar('--accent') || '#005cc5';
        const bracket = document.createElementNS(svgNs, 'line');
        bracket.setAttribute('x1', cx - 15 * scale);
        bracket.setAttribute('y1', yTop - SPACING * 0.6);
        bracket.setAttribute('x2', cx - 15 * scale);
        bracket.setAttribute('y2', yBot + SPACING * 0.6);
        bracket.setAttribute('stroke', accent);
        bracket.setAttribute('stroke-width', 2 * scale);
        bracket.setAttribute('opacity', '0.4');
        g.appendChild(bracket);
        const chordColors = ['#e74c3c', '#2ecc71', '#3498db', '#f39c12'];
        for (let i = notes.length - 1; i >= 0; i--) {
            const n = notes[i];
            const y = getY(n.note, n.oct);
            const color = chordColors[i % chordColors.length];
            const head = document.createElementNS(svgNs, 'ellipse');
            head.setAttribute('cx', cx);
            head.setAttribute('cy', y);
            head.setAttribute('rx', headW / 2);
            head.setAttribute('ry', headH / 2);
            head.setAttribute('transform', `rotate(-15, ${cx}, ${y})`);
            head.setAttribute('fill', color);
            head.setAttribute('stroke', color);
            head.setAttribute('stroke-width', 1.5 * scale);
            head.setAttribute('opacity', '0.8');
            g.appendChild(head);
            const stem = document.createElementNS(svgNs, 'line');
            stem.setAttribute('x1', cx + headW / 2);
            stem.setAttribute('y1', y);
            stem.setAttribute('x2', cx + headW / 2);
            stem.setAttribute('y2', y - SPACING * 3.5);
            stem.setAttribute('stroke', color);
            stem.setAttribute('stroke-width', 1.5 * scale);
            stem.setAttribute('opacity', '0.4');
            g.appendChild(stem);
            const lbl = document.createElementNS(svgNs, 'text');
            lbl.textContent = n.note + n.oct;
            lbl.setAttribute('x', cx + headW / 2 + 6 * scale);
            lbl.setAttribute('y', y);
            lbl.setAttribute('text-anchor', 'start');
            lbl.setAttribute('dominant-baseline', 'central');
            lbl.setAttribute('font-size', `${10 * scale}`);
            lbl.setAttribute('fill', color);
            lbl.setAttribute('opacity', '0.9');
            g.appendChild(lbl);
        }
    }

    renderHeadLine() {
        const ctx = this._ctx;
        if (!ctx) return;
        const { getY, LEFT_PAD, STAFF_R, scale, staffColor } = ctx;
        const svgNs = 'http://www.w3.org/2000/svg';
        let g = this.querySelector('#head-line');
        if (g) return;
        g = document.createElementNS(svgNs, 'g');
        g.setAttribute('id', 'head-line');
        this._headX = LEFT_PAD + (STAFF_R - LEFT_PAD) * 0.03;
        const y1 = getY('G', 2);
        const y2 = getY('F', 5);
        const highlight = this._cssVar('--highlight') || '#ffcc00';
        const r = parseInt(highlight.slice(1, 3), 16);
        const gv = parseInt(highlight.slice(3, 5), 16);
        const b = parseInt(highlight.slice(5, 7), 16);
        const line = document.createElementNS(svgNs, 'line');
        line.setAttribute('x1', this._headX);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', this._headX);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', `rgba(${r}, ${gv}, ${b}, 0.3)`);
        line.setAttribute('stroke-width', 5 * scale);
        line.setAttribute('stroke-linecap', 'round');
        g.appendChild(line);
        const label = document.createElementNS(svgNs, 'text');
        label.textContent = 'Now';
        label.setAttribute('x', this._headX);
        label.setAttribute('y', y2 - 30 * scale);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('dominant-baseline', 'baseline');
        label.setAttribute('font-size', `${14 * scale}px`);
        label.setAttribute('font-style', 'italic');
        label.setAttribute('opacity', '0.4');
        label.setAttribute('fill', staffColor);
        g.appendChild(label);
        const sc = this.querySelector('#staff-content') || this.querySelector('svg');
        sc.appendChild(g);
    }

    removeHeadLine() {
        const g = this.querySelector('#head-line');
        if (g) g.remove();
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
