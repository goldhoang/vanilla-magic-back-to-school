/**
 * Rising colorful balloons (procedural).
 * Exposes window.BalloonEngine
 */
(function (global) {
  "use strict";

  const COLORS = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff85a1", "#c77dff", "#ff9f1c"];

  function BalloonEngine(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.items = [];
    this.running = false;
    this._raf = 0;
    this._onResize = this.resize.bind(this);
  }

  BalloonEngine.prototype.resize = function () {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(8, Math.floor(w / 90));
    this.items = [];
    for (let i = 0; i < count; i += 1) {
      this.items.push(this._make(w, h, true));
    }
  };

  BalloonEngine.prototype._make = function (w, h, anywhere) {
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + Math.random() * 80,
      r: Math.random() * 14 + 12,
      vy: -(Math.random() * 0.55 + 0.25),
      vx: Math.random() * 0.5 - 0.25,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      wobble: Math.random() * Math.PI * 2,
    };
  };

  BalloonEngine.prototype._draw = function (ctx, b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.beginPath();
    ctx.ellipse(0, 0, b.r * 0.78, b.r, 0, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.globalAlpha = 0.88;
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.ellipse(-b.r * 0.28, -b.r * 0.35, b.r * 0.18, b.r * 0.28, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    ctx.moveTo(0, b.r);
    ctx.quadraticCurveTo(4, b.r + 18, 0, b.r + 36);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = b.color;
    ctx.moveTo(-3, b.r - 1);
    ctx.lineTo(3, b.r - 1);
    ctx.lineTo(0, b.r + 6);
    ctx.fill();
    ctx.restore();
  };

  BalloonEngine.prototype._frame = function () {
    if (!this.running) return;
    const ctx = this.ctx;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < this.items.length; i += 1) {
      const b = this.items[i];
      b.wobble += 0.02;
      b.x += b.vx + Math.sin(b.wobble) * 0.35;
      b.y += b.vy;
      if (b.y < -60) Object.assign(b, this._make(w, h, false));
      this._draw(ctx, b);
    }

    this._raf = requestAnimationFrame(this._frame.bind(this));
  };

  BalloonEngine.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    window.addEventListener("resize", this._onResize);
    this.resize();
    this._frame();
  };

  BalloonEngine.prototype.stop = function () {
    this.running = false;
    cancelAnimationFrame(this._raf);
    window.removeEventListener("resize", this._onResize);
    this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
  };

  global.BalloonEngine = BalloonEngine;
})(window);
