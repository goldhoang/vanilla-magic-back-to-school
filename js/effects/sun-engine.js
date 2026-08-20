/**
 * Radiating sunshine rays from a corner / top.
 * Exposes window.SunEngine
 */
(function (global) {
  "use strict";

  function SunEngine(canvas, options) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.opt = options || {};
    this.running = false;
    this._raf = 0;
    this.t = 0;
    this._onResize = this.resize.bind(this);
  }

  SunEngine.prototype.resize = function () {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  SunEngine.prototype._frame = function () {
    if (!this.running) return;
    const ctx = this.ctx;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    this.t += 0.008;

    const cx = w * (typeof this.opt.x === "number" ? this.opt.x : 0.82);
    const cy = h * (typeof this.opt.y === "number" ? this.opt.y : 0.12);
    const intensity = typeof this.opt.intensity === "number" ? this.opt.intensity : 1;
    const rays = typeof this.opt.rays === "number" ? this.opt.rays : 16;
    for (let i = 0; i < rays; i += 1) {
      const a0 = (Math.PI * 2 * i) / rays + this.t;
      const a1 = a0 + 0.08;
      const len = Math.max(w, h) * 0.95;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a0) * len, cy + Math.sin(a0) * len);
      ctx.lineTo(cx + Math.cos(a1) * len, cy + Math.sin(a1) * len);
      ctx.closePath();
      ctx.fillStyle = "rgba(255, 210, 90, " + (0.045 + (i % 2) * 0.025) * intensity + ")";
      ctx.fill();
    }

    const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 160 * intensity);
    glow.addColorStop(0, "rgba(255, 240, 160, " + 0.55 * intensity + ")");
    glow.addColorStop(0.4, "rgba(255, 190, 80, " + 0.2 * intensity + ")");
    glow.addColorStop(1, "rgba(255, 190, 80, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 160 * intensity, 0, Math.PI * 2);
    ctx.fill();

    this._raf = requestAnimationFrame(this._frame.bind(this));
  };

  SunEngine.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    window.addEventListener("resize", this._onResize);
    this.resize();
    this._frame();
  };

  SunEngine.prototype.stop = function () {
    this.running = false;
    cancelAnimationFrame(this._raf);
    window.removeEventListener("resize", this._onResize);
  };

  global.SunEngine = SunEngine;
})(window);
