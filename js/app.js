(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loadedScripts = Object.create(null);
  let confettiEngine = null;
  let activeEngines = [];

  const EFFECT_SCRIPTS = {
    petals: { src: "js/effects/petal-engine.js", global: "PetalEngine" },
    balloons: { src: "js/effects/balloon-engine.js", global: "BalloonEngine" },
    confetti: { src: "js/effects/confetti-engine.js", global: "ConfettiEngine" },
    sun: { src: "js/effects/sun-engine.js", global: "SunEngine" },
    birds: { src: "js/effects/birds-engine.js", global: "BirdsEngine" },
  };

  function setFavicon(glyph) {
    if (!glyph) return;
    let link = document.getElementById("favicon-icon");
    if (!link) {
      link = document.createElement("link");
      link.id = "favicon-icon";
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/svg+xml";
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<rect width="64" height="64" rx="16" fill="#12121f"/>' +
      '<text x="32" y="44" font-size="34" text-anchor="middle">' +
      glyph +
      "</text></svg>";
    link.href = "data:image/svg+xml," + encodeURIComponent(svg);
  }

  function setStatus(text, isError) {
    const el = document.getElementById("boot-status");
    if (!el) return;
    if (!text) {
      el.classList.add("is-hidden");
      return;
    }
    el.textContent = text;
    el.classList.toggle("is-error", !!isError);
    el.classList.remove("is-hidden");
  }

  function loadScript(src) {
    if (loadedScripts[src]) return loadedScripts[src];
    loadedScripts[src] = new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.dataset.magicSrc = src;
      script.onload = resolve;
      script.onerror = function () { reject(new Error("Failed to load " + src)); };
      document.body.appendChild(script);
    });
    return loadedScripts[src];
  }

  async function ensureGlobals(namesToSrc) {
    const tasks = [];
    Object.keys(namesToSrc).forEach(function (globalName) {
      if (typeof window[globalName] !== "function") {
        tasks.push(loadScript(namesToSrc[globalName]));
      }
    });
    await Promise.all(tasks);
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) throw new Error("HTTP error " + response.status);
    return response.json();
  }

  function mountLayout(layoutId) {
    const container = document.getElementById("app-container");
    const template = document.getElementById(layoutId);
    if (!container || !template) throw new Error("Missing template: " + layoutId);
    container.innerHTML = "";
    container.appendChild(template.content.cloneNode(true));
    return container;
  }

  function applyTheme(config) {
    document.body.dataset.theme = config.theme || "back-to-school";
    const stage = document.getElementById("stage");
    if (stage && config.background) {
      const cleanBg = config.background.replace(/^(\.\.\/|\/)+/, "");
      stage.style.backgroundImage = 'url("' + cleanBg + '")';
      stage.style.setProperty("--bg-image", 'url("' + cleanBg + '")');
    }
  }

  function applyCopy(root, config) {
    const greeting = root.querySelector('[data-bind="greeting"]');
    const message = root.querySelector('[data-bind="message"]');
    const tag = root.querySelector('[data-bind="occasion"]');
    if (greeting) greeting.textContent = config.greetingText || "";
    if (message) message.textContent = config.message || "";
    if (tag) tag.textContent = config.occasion || config.theme || "";
    document.title = (config.greetingText || "Vanilla Magic Pages") + " · Magic Pages";
  }

  function stopActiveEngines() {
    activeEngines.forEach(function (engine) {
      if (engine && typeof engine.stop === "function") engine.stop();
    });
    activeEngines = [];
    if (confettiEngine && typeof confettiEngine.stop === "function") confettiEngine.stop();
    confettiEngine = null;
    const burst = document.getElementById("fx-burst");
    if (burst) {
      const ctx = burst.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, burst.width, burst.height);
    }
  }

  function trackEngine(engine) {
    if (engine) activeEngines.push(engine);
    return engine;
  }

  function startOn(canvas, Factory, options) {
    if (!canvas || typeof Factory !== "function") return false;
    const engine = new Factory(canvas, options);
    if (typeof engine.start === "function") engine.start();
    trackEngine(engine);
    return true;
  }

  function burstConfetti() {
    if (!confettiEngine || typeof confettiEngine.burst !== "function") return;
    confettiEngine.burst(window.innerWidth / 2, window.innerHeight * 0.35, 80);
  }

  async function setupEffects(config) {
    const fx = config.effects || {};
    if (reduceMotion) return;

    await loadScript("js/fx-config.js");
    const MagicFx = window.MagicFx;
    stopActiveEngines();
    MagicFx.clearStack();

    function fxO(key, extra) { return MagicFx.opts(fx[key], extra, key); }

    const needed = {};
    Object.keys(EFFECT_SCRIPTS).forEach(function (key) {
      if (MagicFx.isOn(fx[key])) needed[EFFECT_SCRIPTS[key].global] = EFFECT_SCRIPTS[key].src;
    });
    await ensureGlobals(needed);

    let z = 2;
    function take(Factory, options) {
      if (typeof Factory !== "function") return false;
      const canvas = MagicFx.allocCanvas(z++);
      if (!canvas) return false;
      return startOn(canvas, Factory, options || {});
    }

    if (MagicFx.isOn(fx.sun)) take(window.SunEngine, fxO("sun"));
    if (MagicFx.isOn(fx.petals)) take(window.PetalEngine, fxO("petals"));
    if (MagicFx.isOn(fx.balloons)) take(window.BalloonEngine, fxO("balloons"));
    if (MagicFx.isOn(fx.birds)) take(window.BirdsEngine, fxO("birds"));

    if (typeof window.ConfettiEngine === "function" && MagicFx.isOn(fx.confetti)) {
      const confettiCanvas = MagicFx.allocCanvas(9999);
      if (confettiCanvas) {
        confettiCanvas.style.pointerEvents = "none";
        confettiEngine = new window.ConfettiEngine(confettiCanvas, fxO("confetti", {
          spriteSrc: "assets/images/sprites/confetti-gold.png", burstMode: false
        }));
        confettiEngine.start();
      }
    }
  }

  async function setupFloaters(config) {
    if (reduceMotion || !config.floaters || !config.floaters.length) return;
    await loadScript("js/floaters.js");
    if (typeof window.MagicFloaters !== "function") return;
    new window.MagicFloaters(document.getElementById("floaters")).mount(config.floaters);
  }

  async function setupWidgets(root, config) {
    await loadScript("js/widgets.js");
    if (window.MagicWidgets && config.layout === "layout-cards") {
      window.MagicWidgets.mountCards(root, config.cards || [], burstConfetti);
    }
  }

  function setupAudio(config) {
    const audio = document.getElementById("bgm");
    const toggle = document.getElementById("audio-toggle");
    const audioCfg = config.audio || {};
    if (!audio || !toggle || !audioCfg.src) return;

    audio.src = audioCfg.src;
    audio.loop = audioCfg.loop !== false;
    audio.volume = typeof audioCfg.volume === "number" ? audioCfg.volume : 0.35;

    function setPlaying(isPlaying) {
      toggle.setAttribute("aria-pressed", isPlaying ? "true" : "false");
      toggle.querySelector(".audio-toggle__text").textContent = isPlaying ? "Mute" : "Sound";
    }

    async function play() {
      try {
        await audio.play();
        setPlaying(true);
        return true;
      } catch (err) {
        setPlaying(false);
        return false;
      }
    }

    toggle.addEventListener("click", function () {
      if (audio.paused) play();
      else {
        audio.pause();
        setPlaying(false);
      }
    });

    if (audioCfg.autoplay) {
      play().then(function (started) {
        if (started) return;
        const unlock = function () {
          play();
          window.removeEventListener("pointerdown", unlock);
          window.removeEventListener("keydown", unlock);
        };
        window.addEventListener("pointerdown", unlock);
        window.addEventListener("keydown", unlock);
      });
    }
  }

  async function boot() {
    try {
      setStatus("Loading occasion: back-to-school…");
      const config = await fetchJson("assets/data/presets/back-to-school.json");
      config.occasion = "back-to-school";

      applyTheme(config);
      setFavicon("🎒");
      
      const root = mountLayout(config.layout);
      applyCopy(root, config);

      await Promise.all([
        setupEffects(config),
        setupFloaters(config),
        setupWidgets(root, config)
      ]);
      
      setupAudio(config);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to load preset. Check JSON path.", true);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();