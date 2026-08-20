/**
 * FX config helpers — boolean OR rich object options from preset JSON.
 * Exposes window.MagicFx
 */
(function (global) {
  "use strict";

  const ANCHORS = {
    "top-left": { x: 0.14, y: 0.12 },
    "top-center": { x: 0.5, y: 0.1 },
    "top-right": { x: 0.82, y: 0.12 },
    "mid-left": { x: 0.14, y: 0.42 },
    "center": { x: 0.5, y: 0.42 },
    "mid-right": { x: 0.86, y: 0.42 },
    "bottom-left": { x: 0.16, y: 0.78 },
    "bottom-center": { x: 0.5, y: 0.82 },
    "bottom-right": { x: 0.84, y: 0.78 },
  };

  /** Sensible defaults when user only writes true / "enable" */
  const DEFAULTS = {
    sun: { position: "top-right", intensity: 1, rays: 16 },
    birds: { count: 6, speed: 1, direction: "ltr", band: { from: 0.08, to: 0.38 } },
    petals: {},
    balloons: {},
    confetti: { burstMode: false },
  };

  function isOn(value) {
    if (value === true || value === 1) return true;
    if (value === false || value === 0 || value == null) return false;
    if (typeof value === "string") {
      const s = value.toLowerCase().trim();
      return s === "enable" || s === "enabled" || s === "on" || s === "true" || s === "yes";
    }
    if (typeof value === "object") return value.enabled !== false;
    return !!value;
  }

  function resolveAnchor(options) {
    const o = options || {};
    const out = Object.assign({}, o);
    if (typeof o.x === "number" && typeof o.y === "number") return out;
    const key = (o.position || o.anchor || "").toLowerCase();
    if (key && ANCHORS[key]) {
      out.x = ANCHORS[key].x;
      out.y = ANCHORS[key].y;
    }
    return out;
  }

  function opts(value, defaults, fxKey) {
    const catalog = (fxKey && DEFAULTS[fxKey]) || {};
    const base = Object.assign({}, catalog, defaults || {});
    if (value === true || value === 1) return resolveAnchor(base);
    if (typeof value === "string" && isOn(value)) return resolveAnchor(base);
    if (value === false || value == null) return resolveAnchor(base);
    if (typeof value === "object") {
      Object.keys(value).forEach(function (k) {
        if (k === "enabled") return;
        if (value[k] !== undefined) base[k] = value[k];
      });
    }
    return resolveAnchor(base);
  }

  function allocCanvas(zIndex) {
    const stack = document.getElementById("fx-stack") || document.getElementById("stage");
    if (!stack) return null;
    const canvas = document.createElement("canvas");
    canvas.className = "stage__canvas stage__canvas--dyn";
    canvas.setAttribute("aria-hidden", "true");
    if (typeof zIndex === "number") canvas.style.zIndex = String(zIndex);
    stack.appendChild(canvas);
    return canvas;
  }

  function clearStack() {
    const stack = document.getElementById("fx-stack");
    if (!stack) return;
    stack.innerHTML = "";
  }

  /** Strip __meta / _comment keys from preset objects (safe to leave in JSON). */
  function stripMeta(obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
    const out = {};
    Object.keys(obj).forEach(function (k) {
      if (k.charAt(0) === "_" || k.indexOf("__") === 0) return;
      const v = obj[k];
      if (v && typeof v === "object" && !Array.isArray(v)) out[k] = stripMeta(v);
      else out[k] = v;
    });
    return out;
  }

  global.MagicFx = {
    isOn: isOn,
    opts: opts,
    allocCanvas: allocCanvas,
    clearStack: clearStack,
    stripMeta: stripMeta,
    ANCHORS: ANCHORS,
    DEFAULTS: DEFAULTS,
  };
})(window);
