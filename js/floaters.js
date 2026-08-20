/**
 * Floating emoji ornaments around the stage.
 * Exposes window.MagicFloaters
 */
(function (global) {
  "use strict";

  function MagicFloaters(container) {
    this.container = container;
  }

  MagicFloaters.prototype.mount = function (icons) {
    if (!this.container || !icons || !icons.length) return;
    this.container.innerHTML = "";
    this.container.classList.remove("is-hidden");

    const count = Math.min(14, Math.max(icons.length * 2, 8));
    for (let i = 0; i < count; i += 1) {
      const el = document.createElement("span");
      el.className = "floater";
      el.textContent = icons[i % icons.length];
      el.style.left = Math.random() * 92 + 2 + "%";
      el.style.top = Math.random() * 88 + 4 + "%";
      el.style.fontSize = 1.1 + Math.random() * 1.4 + "rem";
      el.style.animationDuration = 6 + Math.random() * 8 + "s";
      el.style.animationDelay = -Math.random() * 8 + "s";
      el.style.setProperty("--dx", (Math.random() * 40 - 20) + "px");
      el.style.setProperty("--rot", (Math.random() * 40 - 20) + "deg");
      this.container.appendChild(el);
    }
  };

  global.MagicFloaters = MagicFloaters;
})(window);
