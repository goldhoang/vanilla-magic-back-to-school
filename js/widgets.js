(function (global) {
  "use strict";

  function mountCards(root, cards, onFlip) {
    const grid = root.querySelector("[data-cards]");
    if (!grid || !cards || !cards.length) return;
    grid.innerHTML = "";
    cards.forEach(function (card, index) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "flip-card";
      btn.setAttribute("aria-label", "Flip card " + (index + 1));
      btn.innerHTML =
        '<span class="flip-card__inner">' +
        '<span class="flip-card__face flip-card__face--front">' +
        (card.front || "✨") +
        "</span>" +
        '<span class="flip-card__face flip-card__face--back">' +
        (card.back || "") +
        "</span>" +
        "</span>";
      btn.addEventListener("click", function () {
        btn.classList.toggle("is-flipped");
        if (typeof onFlip === "function") onFlip();
      });
      grid.appendChild(btn);
    });
  }
 
  global.MagicWidgets = {
    mountCards: mountCards,
  };
})(window);
