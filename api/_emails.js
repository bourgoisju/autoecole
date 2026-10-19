/* =====================================================================
   Auto-école La Tour de Mare — modèles des e-mails du formulaire
   - notification(d)  : e-mail reçu par l'auto-école pour chaque demande
   - confirmation(d)  : accusé de réception envoyé au visiteur
   Mise en page en tableaux et styles en ligne, compatibles avec les
   messageries (Gmail, Outlook, Apple Mail…). Le préfixe « _ » empêche
   Vercel d'exposer ce fichier comme une route.
   ===================================================================== */
(function (root) {
  "use strict";

  var C = {
    navy: "#0a173f", blue: "#123bd1", blueSoft: "#eaeefb", surface: "#f5f7fd",
    line: "#dfe5f4", ink: "#16213d", muted: "#586079", page: "#eef1f8",
    gold: "#d9a528", goldSoft: "#fff4dc", goldInk: "#6b4e00"
  };
  var FONT = "'Montserrat','Segoe UI',Helvetica,Arial,sans-serif";
  var BODY = "'Open Sans','Segoe UI',Helvetica,Arial,sans-serif";

  var SCHOOL = {
    name: "Auto-école La Tour de Mare",
    phone: "04 94 52 91 13",
    phoneHref: "+33494529113",
    email: "autoecoletourdemare@gmail.com",
    address: "Ensoleillade II — 11 Allée du Serpolet, 83600 Fréjus",
    agrement: "E.12.083.1126.0",
    hours: [
      ["Mardi – vendredi", "10h – 12h · 15h – 19h"],
      ["Samedi", "10h – 12h"],
      ["Dimanche, lundi", "Fermé"]
    ]
  };

  function esc(text) {
    return String(text == null ? "" : text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // « camille DURAND » → « Camille Durand » (affichage seulement)
  function niceName(name) {
    return String(name || "").trim().replace(/\s+/g, " ").toLowerCase().replace(/(^|[\s'-])(\S)/g, function (m, sep, ch) {
      return sep + ch.toUpperCase();
    });
  }

  function firstName(name) {
    return niceName(name).split(" ")[0] || "";
  }

  /* ---------- Briques de mise en page ---------- */

  function button(href, label, primary) {
    var bg = primary ? C.blue : "#ffffff";
    var color = primary ? "#ffffff" : C.blue;
    var border = primary ? C.blue : "#c9d4f2";
    return '<a href="' + esc(href) + '" style="display:inline-block;background:' + bg + ";color:" + color +
      ";border:1.5px solid " + border + ";font-family:" + FONT + ";font-size:14px;font-weight:700;line-height:20px;" +
      'text-decoration:none;padding:12px 22px;border-radius:999px;margin:0 8px 10px 0">' + esc(label) + "</a>";
  }

  function detailsTable(rows) {
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">' +
      rows.map(function (r, i) {
        var border = i === rows.length - 1 ? "" : "border-bottom:1px solid " + C.line + ";";
        return "<tr>" +
          '<td class="lbl" valign="top" style="' + border + "padding:11px 12px 11px 0;width:38%;font-family:" + FONT +
          ";font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:" + C.muted + '">' + esc(r[0]) + "</td>" +
          '<td class="val" valign="top" style="' + border + "padding:11px 0;font-family:" + BODY + ";font-size:15px;line-height:22px;color:" + C.ink +
          ';font-weight:600;word-break:break-word;overflow-wrap:anywhere">' + (r[2] ? r[1] : esc(r[1])) + "</td>" +
          "</tr>";
      }).join("") +
      "</table>";
  }

  function card(title, inner) {
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;background:' + C.surface +
      ";border:1px solid " + C.line + ';border-radius:12px">' +
      '<tr><td class="card-in" style="padding:18px 22px 6px;font-family:' + FONT + ";font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:" + C.blue + '">' + esc(title) + "</td></tr>" +
      '<tr><td class="card-in" style="padding:0 22px 12px">' + inner + "</td></tr>" +
      "</table>";
  }

  function messageBlock(message) {
    return '<div style="font-family:' + BODY + ";font-size:15px;line-height:24px;color:" + C.ink +
      ";white-space:pre-wrap;background:#ffffff;border:1px solid " + C.line + ";border-radius:12px;padding:18px 20px\">" +
      esc(message) + "</div>";
  }

  function pill(label, tone) {
    var t = tone === "gold"
      ? { bg: C.goldSoft, color: C.goldInk, border: "#f1d88f" }
      : { bg: C.blueSoft, color: C.blue, border: "#c9d4f2" };
    return '<span style="display:inline-block;background:' + t.bg + ";color:" + t.color + ";border:1px solid " + t.border +
      ";font-family:" + FONT + ';font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:6px 12px;border-radius:999px">' +
      esc(label) + "</span>";
  }

  function layout(o) {
    var site = o.siteUrl.replace(/\/$/, "");
    return '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only">' +
      '<meta name="supported-color-schemes" content="light"><title>' + esc(o.title) + "</title>" +
      // Ajustements pour les petits écrans (Gmail, Apple Mail, Outlook mobile)
      "<style>@media (max-width:520px){" +
      ".outer{padding:16px 6px!important}.px{padding-left:20px!important;padding-right:20px!important}" +
      ".card-in{padding-left:16px!important;padding-right:16px!important}" +
      ".lbl{display:block!important;width:auto!important;padding:12px 0 0!important;border-bottom:0!important}" +
      ".val{display:block!important;padding:2px 0 12px!important}" +
      "h1{font-size:22px!important;line-height:28px!important}}</style></head>" +
      '<body style="margin:0;padding:0;background:' + C.page + ';-webkit-text-size-adjust:100%">' +
      // Aperçu affiché dans la liste des e-mails
      '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">' + esc(o.preheader) + "&#8199;&#65279;&#847;".repeat(30) + "</div>" +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + C.page + '"><tr><td class="outer" align="center" style="padding:32px 12px">' +
      '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;border-collapse:separate;background:#ffffff;border:1px solid ' + C.line + ';border-radius:18px;overflow:hidden">' +

      // En-tête : logo sur bandeau bleu nuit
      '<tr><td class="px" style="background:' + C.navy + ';padding:22px 32px">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
          '<td valign="middle"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#ffffff;border-radius:10px;padding:7px 10px">' +
            '<a href="' + esc(site) + '/" style="text-decoration:none"><img src="' + esc(site) + '/assets/img/logo.jpg" width="112" alt="' + esc(SCHOOL.name) + '" style="display:block;width:112px;height:auto;border:0"></a>' +
          "</td></tr></table></td>" +
          '<td valign="middle" align="right" style="font-family:' + FONT + ';font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#adbcfa">' + esc(o.headerNote) + "</td>" +
        "</tr></table>" +
      "</td></tr>" +
      // Fin liseré bleu
      '<tr><td style="height:4px;line-height:4px;font-size:0;background:' + C.blue + '">&nbsp;</td></tr>' +

      // Corps
      '<tr><td class="px" style="padding:34px 32px 10px">' + o.body + "</td></tr>" +

      // Pied
      '<tr><td class="px" style="padding:22px 32px 26px;word-break:break-word;border-top:1px solid ' + C.line + ";background:" + C.surface + '">' +
        '<p style="margin:0 0 6px;font-family:' + FONT + ";font-size:14px;font-weight:800;color:" + C.navy + '">' + esc(SCHOOL.name) + "</p>" +
        '<p style="margin:0 0 4px;font-family:' + BODY + ";font-size:13px;line-height:20px;color:" + C.muted + '">' + esc(SCHOOL.address) + "</p>" +
        '<p style="margin:0 0 4px;font-family:' + BODY + ";font-size:13px;line-height:20px;color:" + C.muted + '">' +
          '<a href="tel:' + SCHOOL.phoneHref + '" style="color:' + C.blue + ';text-decoration:none;font-weight:700">' + SCHOOL.phone + "</a>" +
          " &nbsp;·&nbsp; " + '<a href="mailto:' + SCHOOL.email + '" style="color:' + C.blue + ';text-decoration:none">' + SCHOOL.email + "</a></p>" +
        '<p style="margin:0;font-family:' + BODY + ";font-size:12px;line-height:18px;color:#8a92ab\">Agrément n° " + SCHOOL.agrement +
          " &nbsp;·&nbsp; Élue parmi les Meilleures Auto-Écoles de France 2026</p>" +
      "</td></tr>" +

      "</table>" +
      (o.legal ? '<p style="max-width:560px;margin:18px auto 0;font-family:' + BODY + ";font-size:11px;line-height:17px;color:#8a92ab;text-align:center\">" + o.legal + "</p>" : "") +
      "</td></tr></table></body></html>";
  }

  function h1(text) {
    return '<h1 style="margin:14px 0 10px;font-family:' + FONT + ";font-size:26px;line-height:32px;font-weight:800;color:" + C.navy + '">' + text + "</h1>";
  }
  function para(text, extra) {
    return '<p style="margin:0 0 22px;font-family:' + BODY + ";font-size:16px;line-height:25px;color:" + C.ink + ";" + (extra || "") + '">' + text + "</p>";
  }
  function spacer(h) { return '<div style="height:' + h + "px;line-height:" + h + 'px;font-size:0">&nbsp;</div>'; }

  /* ---------- E-mail reçu par l'auto-école ---------- */

  function notification(d) {
    d = Object.assign({}, d, { name: niceName(d.name) });
    var isCall = d.type === "rappel";
    var rows = [["Nom", d.name]];
    if (d.email) { rows.push(["E-mail", '<a href="mailto:' + esc(d.email) + '" style="color:' + C.blue + ';text-decoration:none">' + esc(d.email) + "</a>", true]); }
    if (d.phone) { rows.push(["Téléphone", '<a href="tel:' + esc(d.phone.replace(/[^\d+]/g, "")) + '" style="color:' + C.blue + ';text-decoration:none">' + esc(d.phone) + "</a>", true]); }
    rows.push(["Formation", d.formation]);
    if (d.gearbox) { rows.push(["Boîte", d.gearbox]); }
    if (d.funding) { rows.push(["Financement", d.funding]); }
    if (d.callback) { rows.push(["Créneau de rappel", d.callback]); }

    var body =
      pill(isCall ? "À rappeler" : "Renseignement", isCall ? "gold" : "blue") +
      h1(esc(d.name)) +
      para("Nouvelle demande pour <strong>" + esc(d.formation) + "</strong>, reçue le " + esc(d.receivedAt) + ".", "color:" + C.muted + ";font-size:15px") +

      (isCall
        ? '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;background:' + C.goldSoft + ";border:1px solid #f1d88f;border-radius:12px\">" +
          '<tr><td style="padding:16px 20px;font-family:' + BODY + ";font-size:15px;line-height:23px;color:" + C.goldInk + '">' +
          "📞 &nbsp;<strong>À rappeler au " + esc(d.phone) + "</strong>" + (d.callback ? "<br>Créneau souhaité : " + esc(d.callback) : "") +
          "</td></tr></table>" + spacer(18)
        : "") +

      card("Coordonnées et demande", detailsTable(rows)) +
      (d.message ? spacer(18) + '<p style="margin:0 0 10px;font-family:' + FONT + ";font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:" + C.blue + '">Message</p>' + messageBlock(d.message) : "") +
      spacer(26) +
      (d.email ? button("mailto:" + d.email + "?subject=" + encodeURIComponent("Votre demande — " + SCHOOL.name), "Répondre par e-mail", true) : "") +
      (d.phone ? button("tel:" + d.phone.replace(/[^\d+]/g, ""), "Appeler " + d.phone, !d.email) : "") +
      spacer(8);

    var text = [
      (isCall ? "À RAPPELER" : "RENSEIGNEMENT") + " — " + d.name,
      "Reçue le " + d.receivedAt,
      ""
    ].concat(rows.map(function (r) { return r[0] + " : " + (r[2] ? r[1].replace(/<[^>]+>/g, "") : r[1]); }))
      .concat(d.message ? ["", "Message :", d.message] : [])
      .join("\n");

    return {
      subject: (isCall ? "📞 À rappeler" : "✉️ Renseignement") + " — " + d.name + " · " + d.formation,
      html: layout({
        title: "Nouvelle demande — " + d.name,
        preheader: (isCall ? "À rappeler au " + d.phone + (d.callback ? " · " + d.callback : "") : d.formation + " — " + (d.message || "").slice(0, 90)),
        headerNote: "Nouvelle demande",
        siteUrl: d.siteUrl,
        body: body,
        legal: "Demande envoyée depuis le formulaire de contact du site. Aucune donnée n'est conservée par le site."
      }),
      text: text
    };
  }

  /* ---------- Accusé de réception envoyé au visiteur ---------- */

  function confirmation(d) {
    var isCall = d.type === "rappel";
    var site = d.siteUrl.replace(/\/$/, "");
    var prenom = firstName(d.name);

    var recap = [["Demande", isCall ? "Être rappelé(e)" : "Renseignement"], ["Formation", d.formation]];
    if (d.gearbox) { recap.push(["Boîte", d.gearbox]); }
    if (d.funding) { recap.push(["Financement", d.funding]); }
    if (isCall && d.phone) { recap.push(["Numéro", d.phone]); }
    if (d.callback) { recap.push(["Créneau", d.callback]); }

    var hoursRows = SCHOOL.hours.map(function (h) { return [h[0], h[1]]; });

    var body =
      '<table role="presentation" cellpadding="0" cellspacing="0"><tr>' +
        '<td width="44" height="44" align="center" valign="middle" style="width:44px;height:44px;background:' + C.blueSoft + ";border-radius:50%;font-family:" + FONT + ";font-size:22px;font-weight:800;color:" + C.blue + '">✓</td>' +
        '<td style="padding-left:12px;font-family:' + FONT + ";font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:" + C.blue + '">Demande bien reçue</td>' +
      "</tr></table>" +
      h1("Merci " + esc(prenom) + ", nous avons bien reçu votre demande.") +
      para(isCall
        ? "Un membre de notre équipe vous rappellera au <strong>" + esc(d.phone) + "</strong>" + (d.callback && d.callback !== "Peu importe" ? ", sur le créneau que vous avez choisi : <strong>" + esc(d.callback) + "</strong>" : ", aux horaires d'ouverture du bureau") + "."
        : "Notre équipe étudie votre question et vous répond par e-mail dans les meilleurs délais, aux horaires d'ouverture du bureau.") +

      card("Récapitulatif", detailsTable(recap) +
        (d.message ? '<p style="margin:12px 0 6px;font-family:' + FONT + ";font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:" + C.muted + '">Votre message</p>' +
          '<p style="margin:0 0 6px;font-family:' + BODY + ";font-size:14px;line-height:22px;color:" + C.ink + ';white-space:pre-wrap">' + esc(d.message) + "</p>" : "")) +
      spacer(18) +
      card("Horaires du bureau", detailsTable(hoursRows)) +
      spacer(26) +
      para("Une question urgente ? Appelez-nous directement, nous serons ravis de vous renseigner.", "margin-bottom:16px;font-size:15px;color:" + C.muted) +
      button("tel:" + SCHOOL.phoneHref, "Appeler le " + SCHOOL.phone, true) +
      button(site + "/tarifs.html", "Voir nos tarifs", false) +
      spacer(8) +
      para("À très bientôt sur la route,<br><strong style=\"font-family:" + FONT + ";color:" + C.navy + '">L\'équipe de l\'' + esc(SCHOOL.name) + "</strong>", "margin:18px 0 6px");

    var text = [
      "Merci " + prenom + ", nous avons bien reçu votre demande.",
      "",
      isCall
        ? "Nous vous rappellerons au " + d.phone + (d.callback && d.callback !== "Peu importe" ? " (" + d.callback + ")" : " aux horaires du bureau") + "."
        : "Nous vous répondons par e-mail dans les meilleurs délais, aux horaires du bureau.",
      "",
      "Récapitulatif :"
    ].concat(recap.map(function (r) { return "- " + r[0] + " : " + r[1]; }))
      .concat(d.message ? ["", "Votre message :", d.message] : [])
      .concat(["", "Horaires du bureau :"], SCHOOL.hours.map(function (h) { return "- " + h[0] + " : " + h[1]; }))
      .concat(["", SCHOOL.name, SCHOOL.address, SCHOOL.phone + " · " + SCHOOL.email])
      .join("\n");

    return {
      subject: "Nous avons bien reçu votre demande — " + SCHOOL.name,
      html: layout({
        title: "Votre demande est bien reçue",
        preheader: isCall ? "Nous vous rappelons très vite au " + d.phone + "." : "Nous vous répondons très vite. Voici le récapitulatif de votre demande.",
        headerNote: "Accusé de réception",
        siteUrl: d.siteUrl,
        body: body,
        legal: "Vous recevez cet e-mail car vous avez rempli le formulaire de contact de notre site. Vos informations servent uniquement à répondre à votre demande ; elles ne sont ni conservées ni partagées."
      }),
      text: text
    };
  }

  var api = { notification: notification, confirmation: confirmation };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; } else { root.AEEmails = api; }
})(this);
