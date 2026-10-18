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

  /* ---- Titres animés mot à mot ---- */
  var motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Découpe chaque nœud texte d'un élément en mots animés, sans toucher aux balises
  function splitWords(root) {
    var count = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) { return; }
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var word = document.createElement("span");
            word.className = "anim-word";
            word.style.setProperty("--i", count++);
            word.textContent = part;
            frag.appendChild(word);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    })(root);
    return count;
  }

  function playTitle(title) {
    title.classList.add("anim-play");
    var head = title.closest(".section__head");
    if (head) { head.classList.add("anim-play"); }
  }

  var animTitles = document.querySelectorAll("[data-anim-title]");
  if (motionOK) {
    var titleObserver = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          playTitle(entry.target);
          titleObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 }) : null;

    animTitles.forEach(function (title) {
      var titleEnd = 120 + splitWords(title) * 65 + 450;
      title.style.setProperty("--mark-delay", titleEnd + "ms");
      title.classList.add("anim-title");
      var head = title.closest(".section__head");
      if (head) {
        head.style.setProperty("--follow-delay", (titleEnd + 150) + "ms");
        head.classList.add("head-anim");
      }

      var hero = title.closest(".hero");
      if (hero) {
        // Accueil : le titre se joue tout de suite, suivi du paragraphe
        hero.style.setProperty("--lead-delay", (titleEnd + 150) + "ms");
        hero.querySelectorAll(".hero__cat").forEach(function (cat, i) { cat.style.setProperty("--c", i); });
        hero.classList.add("hero--anim");
        playTitle(title);

        // Compteur « 30 ans » qui démarre avec le paragraphe
        var counter = hero.querySelector(".hero__count");
        if (counter) {
          var target = parseInt(counter.getAttribute("data-to"), 10);
          counter.textContent = "0";
          setTimeout(function () {
            var start = null, duration = 1200;
            function step(ts) {
              if (start === null) { start = ts; }
              var p = Math.min((ts - start) / duration, 1);
              counter.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
              if (p < 1) { window.requestAnimationFrame(step); }
            }
            window.requestAnimationFrame(step);
          }, titleEnd + 350);
        }
      } else if (titleObserver) {
        titleObserver.observe(title);
      } else {
        playTitle(title);
      }
    });
  }

  /* ---- Apparition au défilement ---- */
  var targets = document.querySelectorAll(
    ".card, .plus__list li, .price-card, .section__head, .award, .finance__note, .contact__dossier"
  );
  // Les en-têtes dont le titre est animé mot à mot ont leur propre entrée
  targets = Array.prototype.filter.call(targets, function (el) { return !el.querySelector("[data-anim-title]"); });
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
