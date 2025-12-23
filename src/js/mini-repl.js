
import { silence } from 'https://unpkg.com/@strudel/core?module';
import { getDrawContext } from 'https://unpkg.com/@strudel/draw?module';
import { transpiler } from 'https://unpkg.com/@strudel/transpiler?module';
import { getAudioContext, webaudioOutput, initAudioOnFirstClick } from 'https://unpkg.com/@strudel/webaudio?module';
import { StrudelMirror } from 'https://unpkg.com/@strudel/codemirror?module';

const audioReady = initAudioOnFirstClick();

class MiniRepl extends HTMLElement {
    constructor() {
        super();
        this.started = false;
    }

    async connectedCallback() {
        const code = this.getAttribute('code') || '';
        const title = this.getAttribute('title') || 'Untitled';

        this.innerHTML = `
            <div class="mini-repl-container">
                <div class="mini-repl-header">
                    <div class="controls">
                        <button class="play-btn" title="Play">▶</button>
                        <button class="stop-btn" title="Stop">■</button>
                        <span class="song-title">${title}</span>
                    </div>
                    <a href="${this.getAttribute('url')}" class="open-link">Open ↗</a>
                </div>
                <div class="editor-target"></div>
            </div>
        `;

        const playBtn = this.querySelector('.play-btn');
        const stopBtn = this.querySelector('.stop-btn');
        const container = this.querySelector('.editor-target');

        this.editor = new StrudelMirror({
            defaultOutput: webaudioOutput,
            getTime: () => getAudioContext().currentTime,
            transpiler,
            root: container,
            initialCode: code,
            pattern: silence,
            onUpdateState: (state) => {
                this.started = state.started;
                playBtn.textContent = state.started ? '‖' : '▶';
                playBtn.classList.toggle('active', state.started);
            }
        });

        playBtn.onclick = async () => {
            await audioReady;
            this.editor.evaluate();
        };

        stopBtn.onclick = () => {
            this.editor.stop();
        };
    }
}

customElements.define('mini-repl', MiniRepl);
