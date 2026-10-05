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

  /* ---- Apparition au défilement ---- */
  var targets = document.querySelectorAll(
    ".card, .plus__list li, .price-card, .section__head, .award, .finance__note, .contact__dossier"
  );
  targets.forEach(function (el) { el.classList.add("reveal"); });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- The vehicle on each road divider previews the next section ---- */
  var routeVehicles = {
    formations: [
      { icon: "car", label: "Voiture" },
      { icon: "moto", label: "Moto" },
      { icon: "scooter", label: "Cyclo" },
      { icon: "microcar", label: "Voiturette" },
      { icon: "trailer", label: "Remorque" }
    ],
    plus: [{ icon: "car", label: "Voiture" }],
    financement: [{ icon: "car", label: "Voiture" }],
    contact: [{ icon: "car", label: "Voiture" }],
    "permis-b": [{ icon: "car", label: "Voiture" }],
    aac: [{ icon: "car", label: "Conduite accompagnée" }],
    moto: [{ icon: "moto", label: "Moto" }],
    am: [{ icon: "scooter", label: "Cyclo" }, { icon: "microcar", label: "Voiturette" }],
    remorque: [{ icon: "trailer", label: "Remorque" }],
    complementaires: [{ icon: "moto", label: "Passerelles" }],
    prestations: [{ icon: "car", label: "Prestations" }]
  };
  var sections = document.querySelectorAll("main > section");
  var dividers = [];
  sections.forEach(function (section, index) {
    if (index === 0) { return; }
    var divider = document.createElement("div");
    divider.className = "road-divider";
    divider.setAttribute("aria-hidden", "true");
    var vehicleGroup = document.createElement("span");
    vehicleGroup.className = "road-divider__vehicles";
    var vehicles = routeVehicles[section.id] || [{ icon: "car", label: "Voiture" }];
    if (vehicles.length > 2) { divider.classList.add("road-divider--fleet"); }
    vehicles.forEach(function (vehicle) {
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
