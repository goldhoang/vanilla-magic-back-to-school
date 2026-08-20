/**
 * Flying birds / phoenix silhouettes drifting across the sky in loose flocks.
 * Options: count, speed, glyph (emoji, e.g. "🕊️" | "🐦" | "🦅"), colorTrail (phoenix-like glow),
 *          band ({from,to} vertical range 0–1), direction ("ltr" | "rtl" | "mixed")
 * Exposes window.BirdsEngine
 */
(function (global) {
  "use strict";

  function BirdsEngine(canvas, options) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.opt = options || {};
    this.running = false;
    this._raf = 0;
    this.birds = [];
    this._onResize = this.resize.bind(this);
  }

  BirdsEngine.prototype.resize = function () {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._spawn();
  };

  BirdsEngine.prototype._spawn = function () {
    const o = this.opt;
    const w = this.canvas.clientWidth;
    const count = typeof o.count === "number" ? o.count : 6;
    const bandFrom = (o.band && o.band.from) || 0.08;
    const bandTo = (o.band && o.band.to) || 0.38;
    const dirCfg = o.direction || "ltr";
    this.birds = [];
    for (let i = 0; i < count; i += 1) {
      const dir = dirCfg === "mixed" ? (Math.random() > 0.5 ? 1 : -1) : dirCfg === "rtl" ? -1 : 1;
      this.birds.push({
        x: Math.random() * w,
        y: (bandFrom + Math.random() * (bandTo - bandFrom)) * this.canvas.clientHeight,
        speed: (0.35 + Math.random() * 0.5) * (typeof o.speed === "number" ? o.speed : 1) * dir,
        size: 10 + Math.random() * 10,
        flap: Math.random() * Math.PI * 2,
        flapSpeed: 0.12 + Math.random() * 0.08,
        bob: Math.random() * 8,
      });
    }
  };

  function drawBird(ctx, x, y, size, wing, glowColor) {
    ctx.save();
    ctx.translate(x, y);
    if (glowColor) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = size * 1.6;
    }
    ctx.strokeStyle = glowColor || "rgba(30, 24, 20, 0.82)";
    ctx.lineWidth = Math.max(1.4, size * 0.14);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-size, wing * size * 0.55);
    ctx.quadraticCurveTo(-size * 0.35, -wing * size * 0.25, 0, 0);
    ctx.quadraticCurveTo(size * 0.35, -wing * size * 0.25, size, wing * size * 0.55);
    ctx.stroke();
    ctx.restore();
  }

  BirdsEngine.prototype._frame = function () {
    if (!this.running) return;
    const ctx = this.ctx;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const glow = this.opt.glow ? this.opt.glowColor || "rgba(255,140,60,0.65)" : null;

    for (let i = 0; i < this.birds.length; i += 1) {
      const b = this.birds[i];
      b.x += b.speed;
      b.flap += b.flapSpeed;
      const wing = Math.sin(b.flap);
      const y = b.y + Math.sin(b.flap * 0.5) * b.bob * 0.3;
      if (b.speed >= 0 && b.x > w + 30) b.x = -30;
      if (b.speed < 0 && b.x < -30) b.x = w + 30;
      drawBird(ctx, b.x, y, b.size, wing, glow);
    }

    this._raf = requestAnimationFrame(this._frame.bind(this));
  };

  BirdsEngine.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    window.addEventListener("resize", this._onResize);
    this.resize();
    this._frame();
  };

  BirdsEngine.prototype.stop = function () {
    this.running = false;
    cancelAnimationFrame(this._raf);
    window.removeEventListener("resize", this._onResize);
    this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
  };

  global.BirdsEngine = BirdsEngine;
})(window);
