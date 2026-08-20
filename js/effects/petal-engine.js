/**
 * Falling petals / leaves (procedural shapes).
 * Exposes window.PetalEngine
 */
(function (global) {
  "use strict";

  const COLORS = ["#ff8fab", "#ffc2d4", "#ffb703", "#fb8500", "#90be6d", "#f72585", "#ffd6a5"];

  function PetalEngine(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.petals = [];
    this.running = false;
    this._raf = 0;
    this._onResize = this.resize.bind(this);
  }

  PetalEngine.prototype.resize = function () {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.floor(w / 22) + 22;
    this.petals = [];
    for (let i = 0; i < count; i += 1) {
      this.petals.push(this._make(w, h, true));
    }
  };

  PetalEngine.prototype._make = function (w, h, anywhere) {
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -20 - Math.random() * 40,
      w: Math.random() * 10 + 6,
      h: Math.random() * 6 + 4,
      vy: Math.random() * 1.1 + 0.5,
      vx: Math.random() * 0.9 - 0.45,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.08,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      sway: Math.random() * 0.03 + 0.01,
    };
  };

  PetalEngine.prototype._frame = function () {
    if (!this.running) return;
    const ctx = this.ctx;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < this.petals.length; i += 1) {
      const p = this.petals[i];
      p.x += p.vx + Math.sin(p.y * p.sway) * 0.8;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > h + 30) Object.assign(p, this._make(w, h, false));

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    this._raf = requestAnimationFrame(this._frame.bind(this));
  };

  PetalEngine.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    window.addEventListener("resize", this._onResize);
    this.resize();
    this._frame();
  };

  PetalEngine.prototype.stop = function () {
    this.running = false;
    cancelAnimationFrame(this._raf);
    window.removeEventListener("resize", this._onResize);
    this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
  };

  global.PetalEngine = PetalEngine;
})(window);
