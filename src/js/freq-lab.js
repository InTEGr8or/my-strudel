(function (root) {
  var WINDOW_S = 0.1;
  var LINE_WIDTH = 0.2;
  var NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

  root.FREQ_LAB_WINDOW_S = WINDOW_S;
  root.FREQ_LAB_LINE_WIDTH = LINE_WIDTH;

  if (typeof customElements === 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = { WINDOW_S: WINDOW_S, LINE_WIDTH: LINE_WIDTH };
    }
    return;
  }

  class FreqLab extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      var min = parseInt(this.getAttribute('min') || '440', 10);
      var max = parseInt(this.getAttribute('max') || '880', 10);
      var value = parseInt(this.getAttribute('value') || String(min), 10);
      if (min > max) {
        var swap = min;
        min = max;
        max = swap;
      }
      if (value < min) value = min;
      if (value > max) value = max;

      this.innerHTML =
        '<div class="freq-row">' +
          '<button type="button" class="freq-toggle setting-switch" role="switch" aria-checked="false" title="Tap for a short tone. Double-tap or press and slide to hold.">' +
            '<span class="setting-switch-label">Tone</span>' +
            '<span class="setting-switch-track" aria-hidden="true"><span class="setting-switch-knob"></span></span>' +
          '</button>' +
          '<span class="freq-hz">' + value + '</span>' +
          '<span>Hz</span>' +
          '<span class="freq-note"></span>' +
          '<span class="freq-cents" style="opacity:0.7;font-size:0.85rem"></span>' +
        '</div>' +
        '<input class="freq-slider" type="range" min="' + min + '" max="' + max + '" value="' + value + '" step="1">' +
        '<div class="freq-marks">' + this._marksHtml(min, max) + '</div>' +
        '<div class="freq-wave-box">' +
          '<canvas class="freq-scope" width="780" height="140" aria-label="A tenth of a second of the slider frequency"></canvas>' +
          '<div class="freq-wave-legend">This screen is 0.1 seconds wide.</div>' +
        '</div>';
      this._bind();
    }

    _marksHtml(min, max) {
      if (min === 440 && max === 880) {
        return '<span>A4 440</span><span>C5</span><span>E5</span><span>A5 880</span>';
      }
      return '<span>' + min + '</span><span>' + max + '</span>';
    }

    _bind() {
      var rootEl = this;
      var slider = this.querySelector('.freq-slider');
      var toggle = this.querySelector('.freq-toggle');
      var hzEl = this.querySelector('.freq-hz');
      var noteEl = this.querySelector('.freq-note');
      var centsEl = this.querySelector('.freq-cents');
      var scope = this.querySelector('.freq-scope');
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

      function hzNow() { return parseInt(slider.value, 10); }

      function label(hz) {
        var midi = 69 + 12 * Math.log(hz / 440) / Math.LN2;
        var rounded = Math.round(midi);
        var pc = ((rounded % 12) + 12) % 12;
        var oct = Math.floor(rounded / 12) - 1;
        var cents = Math.round((midi - rounded) * 100);
        hzEl.textContent = String(hz);
        noteEl.textContent = NOTE_NAMES[pc] + oct;
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
        g.lineWidth = LINE_WIDTH;
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
      rootEl._draw = function () { drawWaves(hzNow()); };
    }
  }

  customElements.define('freq-lab', FreqLab);

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WINDOW_S: WINDOW_S, LINE_WIDTH: LINE_WIDTH };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
