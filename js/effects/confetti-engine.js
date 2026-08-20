/**
 * Festive confetti with mixed shapes + optional sprite.
 * Exposes window.ConfettiEngine
 */
(function (global) {
  "use strict";

  const COLORS = [
    "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff85a1",
    "#c77dff", "#ff9f1c", "#00bbf9", "#f15bb5", "#fee440",
  ];

  function ConfettiEngine(canvas, options) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.opt = options || {};
    this.pieces = [];
    this.running = false;
    this.animating = false;
    this._raf = 0;
    this.sprite = null;
    this.burstMode = !!(options && options.burstMode);
    this._onResize = this.resize.bind(this);

    if (options && options.spriteSrc) {
      const img = new Image();
      img.src = options.spriteSrc;
      this.sprite = img;
    }
  }

  ConfettiEngine.prototype._wakeUp = function () {
    if (this.running && !this.animating) {
      this.animating = true;
      this._frame();
    }
  };

  ConfettiEngine.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    window.addEventListener("resize", this._onResize);
    this.resize();

    if (!this.opt.burstMode) {
      this._spawnContinuous();
    }

    this._wakeUp();
  };

  ConfettiEngine.prototype.resize = function () {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._spawn(Math.floor(w / 11) + 55);
  };

  ConfettiEngine.prototype._spawn = function (count) {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.pieces = [];
    for (let i = 0; i < count; i += 1) {
      this.pieces.push(this._piece(w, h, !this.burstMode));
    }
  };

  ConfettiEngine.prototype._piece = function (w, h, anywhere) {
    const shapes = ["rect", "circle", "ribbon"];
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h - h * 0.2 : -20,
      w: Math.random() * 9 + 4,
      h: Math.random() * 7 + 3,
      vx: Math.random() * 1.6 - 0.8,
      vy: Math.random() * 2.2 + 1.2,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.16,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      shape: shapes[(Math.random() * shapes.length) | 0],
      useSprite: Boolean(this.sprite && Math.random() > 0.65),
    };
  };

  ConfettiEngine.prototype.burst = function (x, y, amount) {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const n = amount || 48;
    for (let i = 0; i < n; i += 1) {
      const p = this._piece(w, h, false);
      p.x = x;
      p.y = y;
      p.vx = (Math.random() - 0.5) * 10;
      p.vy = Math.random() * -7 - 2;
      this.pieces.push(p);
    }
    this._wakeUp();
  };

  ConfettiEngine.prototype._frame = function () {
    if (!this.running) {
      this.animating = false;
      return;
    }
    const ctx = this.ctx;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (this.pieces.length === 0) {
      ctx.clearRect(0, 0, w, h);
      this.animating = false;
      return;
    }
    ctx.clearRect(0, 0, w, h);

    for (let i = this.pieces.length - 1; i >= 0; i -= 1) {
      const p = this.pieces[i];
      p.x += p.vx + Math.sin(p.y * 0.02) * 0.4;
      p.y += p.vy;
      p.vy += 0.03;
      p.rot += p.vr;

      if (p.y > h + 30) {
        if (this.burstMode) {
          this.pieces.splice(i, 1);
          continue;
        }
        Object.assign(p, this._piece(w, h, false));
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.useSprite && this.sprite && this.sprite.complete) {
        const size = p.w * 1.8;
        ctx.globalAlpha = 0.92;
        ctx.drawImage(this.sprite, -size / 2, -size / 2, size, size);
      } else {
        ctx.fillStyle = p.color;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "ribbon") {
          ctx.fillRect(-p.w / 2, -1.5, p.w, 3);
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
      }
      ctx.restore();
    }

    this._raf = requestAnimationFrame(this._frame.bind(this));
  };

  ConfettiEngine.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    window.addEventListener("resize", this._onResize);
    this.resize();
    this._frame();
  };

  ConfettiEngine.prototype.stop = function () {
    this.running = false;
    cancelAnimationFrame(this._raf);
    window.removeEventListener("resize", this._onResize);
    this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
  };

  global.ConfettiEngine = ConfettiEngine;
})(window);
