/* =====================================================================
   Auto-école La Tour de Mare — interactions
   ===================================================================== */
(function () {
  "use strict";

  /* ---- Menu : ouverture mobile, en-tête compact, lien actif ---- */
  var header = document.querySelector(".site-header");
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");

  if (toggle && nav) {
    function setMenu(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    }

    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });

    // Referme le menu après un clic sur un lien, avec Échap, ou en cliquant à côté
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !header.contains(e.target)) { setMenu(false); }
    });
    window.matchMedia("(min-width: 981px)").addEventListener("change", function (mq) {
      if (mq.matches) { setMenu(false); }
    });
  }

  // En-tête réduit dès que l'on quitte le haut de la page
  if (header) {
    var compactTick = false;
    function updateHeader() {
      header.classList.toggle("is-compact", window.scrollY > 40);
      compactTick = false;
    }
    window.addEventListener("scroll", function () {
      if (!compactTick) { compactTick = true; window.requestAnimationFrame(updateHeader); }
    }, { passive: true });
    updateHeader();
  }

  // Accueil : le lien du menu suit la section affichée à l'écran
  var spyLinks = document.querySelectorAll(".nav__link[data-spy]");
  if (spyLinks.length) {
    var spySections = [];
    spyLinks.forEach(function (link) {
      var id = link.getAttribute("data-spy");
      var section = id === "top" ? document.querySelector(".hero") : document.getElementById(id);
      if (section) { spySections.push({ id: id, el: section }); }
    });
    var spyCurrent = null, spyTick = false;
    function updateSpy() {
      spyTick = false;
      // La dernière section dont le haut a passé le tiers supérieur de l'écran l'emporte
      var line = window.innerHeight * 0.35, current = "top";
      spySections.forEach(function (s) { if (s.el.getBoundingClientRect().top <= line) { current = s.id; } });
      if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 2) { current = spySections[spySections.length - 1].id; }
      if (current === spyCurrent) { return; }
      spyCurrent = current;
      spyLinks.forEach(function (link) {
        var on = link.getAttribute("data-spy") === current;
        link.classList.toggle("is-active", on);
        if (on) { link.setAttribute("aria-current", "location"); } else { link.removeAttribute("aria-current"); }
      });
    }
    window.addEventListener("scroll", function () {
      if (!spyTick) { spyTick = true; window.requestAnimationFrame(updateSpy); }
    }, { passive: true });
    window.addEventListener("resize", updateSpy);
    updateSpy();
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
    if (!title.closest(".hero")) { title.parentElement.classList.add("anim-play"); }
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
      var head = title.parentElement;
      if (head.querySelector(".anim-follow")) {
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

  /* ---- Formulaire de contact (envoi via /api/contact → Resend) ---- */
  var contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    var statusEl = contactForm.querySelector(".contact-form__status");
    var submitBtn = contactForm.querySelector('button[type="submit"]');
    var submitLabel = submitBtn.textContent;
    var messageEl = contactForm.querySelector('[name="message"]');

    function setStatus(text, ok) {
      statusEl.textContent = text;
      statusEl.className = "contact-form__status " + (ok ? "is-ok" : "is-error");
    }

    function currentType() {
      var checked = contactForm.querySelector('[name="type"]:checked');
      return checked ? checked.value : "renseignement";
    }

    // Affiche les champs utiles et ajuste les champs obligatoires selon les choix
    function updateFields() {
      var type = currentType();
      var formation = contactForm.querySelector('[name="formation"]').value;

      contactForm.querySelectorAll("[data-show-for]").forEach(function (el) {
        var show = el.getAttribute("data-show-for").split(" ").indexOf(type) !== -1;
        el.hidden = !show;
        el.querySelectorAll("input, select, textarea").forEach(function (input) { input.disabled = !show; });
      });
      contactForm.querySelectorAll("[data-show-for-formation]").forEach(function (el) {
        var show = el.getAttribute("data-show-for-formation").split("|").indexOf(formation) !== -1;
        el.hidden = !show;
        el.querySelectorAll("input").forEach(function (input) { input.disabled = !show; });
      });
      contactForm.querySelectorAll("input[data-required-for], select[data-required-for], textarea[data-required-for]").forEach(function (input) {
        input.required = input.getAttribute("data-required-for").split(" ").indexOf(type) !== -1;
      });
      contactForm.querySelectorAll("abbr[data-required-for]").forEach(function (mark) {
        mark.hidden = mark.getAttribute("data-required-for").split(" ").indexOf(type) === -1;
      });
      var placeholder = messageEl.getAttribute("data-placeholder-" + type);
      if (placeholder) { messageEl.placeholder = placeholder; }
      contactForm.querySelectorAll("select").forEach(function (select) {
        select.classList.toggle("is-placeholder", !select.value);
      });
    }

    contactForm.addEventListener("change", updateFields);
    updateFields();

    // Retour d'un envoi sans JavaScript (redirection de la fonction)
    var result = new URLSearchParams(window.location.search).get("contact");
    if (result === "ok") { setStatus("Merci, votre demande a bien été envoyée. Nous revenons vers vous rapidement.", true); }
    else if (result === "erreur") { setStatus("L'envoi a échoué. Vérifiez le formulaire ou appelez-nous au 04 94 52 91 13.", false); }

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var invalid = [];
      contactForm.querySelectorAll("[required]").forEach(function (input) {
        if (input.disabled) { return; }
        var wrap = input.closest(".field, .contact-form__consent");
        var bad = input.type === "checkbox" ? !input.checked : !input.checkValidity() || !input.value.trim();
        if (wrap) { wrap.classList.toggle("is-invalid", bad); }
        if (bad) { invalid.push(input); }
      });
      if (invalid.length) {
        setStatus("Merci de compléter les champs en rouge.", false);
        invalid[0].focus();
        return;
      }

      var data = {};
      new FormData(contactForm).forEach(function (value, key) { data[key] = value; });
      data.consent = contactForm.querySelector('[name="consent"]').checked;

      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi en cours…";
      statusEl.textContent = "";

      fetch(contactForm.getAttribute("action"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (resp) {
          return resp.json().catch(function () { return {}; }).then(function (json) {
            if (!resp.ok || !json.ok) { throw new Error(json.error || "L'envoi a échoué. Réessayez ou appelez-nous au 04 94 52 91 13."); }
          });
        })
        .then(function () {
          var type = currentType();
          contactForm.reset();
          updateFields();
          setStatus(type === "rappel"
            ? "Merci, nous vous rappelons sur le créneau choisi."
            : "Merci, votre demande a bien été envoyée. Nous revenons vers vous rapidement.", true);
        })
        .catch(function (err) {
          setStatus(err.message, false);
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = submitLabel;
        });
    });

    contactForm.addEventListener("input", function (e) {
      var wrap = e.target.closest(".is-invalid");
      if (wrap) { wrap.classList.remove("is-invalid"); }
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
