/* =====================================================================
   Auto-école La Tour de Mare — interactions
   ===================================================================== */
(function () {
  "use strict";

  /* ---- Menu mobile ---- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });

    // Referme le menu après un clic sur un lien
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Ouvrir le menu");
      });
    });
  }

  /* ---- Année courante dans le pied de page ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---- Diaporama de présentation ---- */
  var track = document.getElementById("deckTrack");
  if (track) {
    var deck = track.closest(".deck");
    var slides = track.querySelectorAll(".deck__slide");
    var prev = deck.querySelector('[data-deck="prev"]');
    var next = deck.querySelector('[data-deck="next"]');
    var indexEl = document.getElementById("deckIndex");
    var dotsWrap = deck.querySelector(".deck__dots");
    var current = 0;

    var dots = Array.prototype.map.call(slides, function (slide, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "deck__dot";
      dot.setAttribute("aria-label", "Diapositive " + (i + 1));
      dot.addEventListener("click", function () { goTo(i); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function goTo(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: i * track.clientWidth });
    }

    function update() {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      current = i;
      indexEl.textContent = i + 1;
      prev.disabled = i === 0;
      next.disabled = i === slides.length - 1;
      dots.forEach(function (dot, d) {
        dot.setAttribute("aria-current", d === i ? "true" : "false");
      });
    }

    prev.addEventListener("click", function () { goTo(current - 1); });
    next.addEventListener("click", function () { goTo(current + 1); });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(current - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goTo(current + 1); }
      else if (e.key === "Home") { e.preventDefault(); goTo(0); }
      else if (e.key === "End") { e.preventDefault(); goTo(slides.length - 1); }
    });

    var ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) { return; }
      ticking = true;
      window.requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });
    window.addEventListener("resize", function () { goTo(current); });
    update();
  }

  /* ---- Apparition au défilement ---- */
  var targets = document.querySelectorAll(
    ".card, .plus__list li, .price-card, .section__head, .award, .finance__note, .contact__dossier"
  );
  targets.forEach(function (el) { el.classList.add("reveal"); });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- The full lesson fleet connects every section ---- */
  var routeVehicles = [
    { icon: "car", label: "Voiture" },
    { icon: "moto", label: "Moto" },
    { icon: "scooter", label: "Cyclo" },
    { icon: "microcar", label: "Voiturette" },
    { icon: "trailer", label: "Remorque" }
  ];
  var sections = document.querySelectorAll("main > section");
  var dividers = [];
  sections.forEach(function (section, index) {
    if (index === 0) { return; }
    var divider = document.createElement("div");
    divider.className = "road-divider road-divider--fleet";
    divider.setAttribute("aria-hidden", "true");
    var vehicleGroup = document.createElement("span");
    vehicleGroup.className = "road-divider__vehicles";
    routeVehicles.forEach(function (vehicle) {
      var item = document.createElement("span");
      item.className = "road-divider__item";
      var icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      icon.setAttribute("viewBox", "0 0 64 40");
      icon.setAttribute("focusable", "false");
      var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", "assets/img/vehicle-icons.svg#" + vehicle.icon);
      icon.appendChild(use);
      var label = document.createElement("span");
      label.textContent = vehicle.label;
      item.appendChild(icon);
      item.appendChild(label);
      vehicleGroup.appendChild(item);
    });
    divider.appendChild(vehicleGroup);
    section.parentNode.insertBefore(divider, section);
    dividers.push(divider);
  });

  if (!reduce && "IntersectionObserver" in window) {
    var roadObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-driving");
          roadObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    dividers.forEach(function (divider) { roadObserver.observe(divider); });
  }

  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
