/* =====================================================================
   Auto-école La Tour de Mare — formulaire de contact
   Fonction Vercel : reçoit le formulaire et envoie un e-mail via Resend.
   Aucune donnée n'est stockée.

   Variables d'environnement (Vercel > Settings > Environment Variables) :
   - RESEND_API_KEY  (obligatoire) clé API Resend
   - CONTACT_TO      (facultatif)  destinataire, par défaut autoecoletourdemare@gmail.com
   - CONTACT_FROM    (facultatif)  expéditeur, par défaut onboarding@resend.dev
                                   (à remplacer par une adresse de votre domaine
                                   une fois celui-ci vérifié dans Resend)
   ===================================================================== */

var DEFAULT_TO = "autoecoletourdemare@gmail.com";
var DEFAULT_FROM = "Site La Tour de Mare <onboarding@resend.dev>";

var FORMATIONS = [
  "Permis B — voiture",
  "Conduite accompagnée (AAC)",
  "Permis moto (A1 / A2 / A)",
  "Permis AM (cyclomoteur, voiturette)",
  "Remorque (BE / B96)",
  "Formations rapides",
  "Autre demande"
];

function clean(value, max) {
  return String(value == null ? "" : value).replace(/\r\n?/g, "\n").trim().slice(0, max);
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function reply(req, res, status, payload) {
  // Envoi classique du formulaire (sans JavaScript) : retour sur la page
  var wantsHtml = !/application\/json/.test(req.headers["content-type"] || "");
  if (wantsHtml) {
    res.statusCode = 303;
    res.setHeader("Location", "/index.html?contact=" + (payload.ok ? "ok" : "erreur") + "#contact-form");
    return res.end();
  }
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return reply(req, res, 405, { ok: false, error: "Méthode non autorisée." });
  }

  var body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  // Piège à robots : ce champ est caché aux visiteurs
  if (clean(body.website, 200)) {
    return reply(req, res, 200, { ok: true });
  }

  var name = clean(body.name, 120);
  var email = clean(body.email, 160);
  var phone = clean(body.phone, 30);
  var formation = clean(body.formation, 80);
  var message = clean(body.message, 4000);
  var consent = body.consent === true || body.consent === "on" || body.consent === "true";

  if (FORMATIONS.indexOf(formation) === -1) { formation = ""; }

  if (!name || !message || !consent) {
    return reply(req, res, 400, { ok: false, error: "Merci de remplir les champs obligatoires." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reply(req, res, 400, { ok: false, error: "L'adresse e-mail ne semble pas valide." });
  }
  if (phone && !/^[0-9+().\s-]{6,30}$/.test(phone)) {
    return reply(req, res, 400, { ok: false, error: "Le numéro de téléphone ne semble pas valide." });
  }

  var apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY manquante");
    return reply(req, res, 500, { ok: false, error: "Le formulaire n'est pas encore configuré. Appelez-nous au 04 94 52 91 13." });
  }

  var rows = [
    ["Nom", name],
    ["E-mail", email],
    ["Téléphone", phone || "—"],
    ["Formation", formation || "—"]
  ];
  var html =
    '<div style="font-family:Arial,sans-serif;color:#16213d;max-width:560px">' +
    '<h2 style="color:#0a173f;margin:0 0 16px">Nouveau message depuis le site</h2>' +
    '<table style="border-collapse:collapse;margin-bottom:16px">' +
    rows.map(function (r) {
      return '<tr><td style="padding:4px 16px 4px 0;color:#586079">' + r[0] + '</td><td style="padding:4px 0"><strong>' + escapeHtml(r[1]) + "</strong></td></tr>";
    }).join("") +
    "</table>" +
    '<p style="white-space:pre-wrap;background:#f5f7fd;border:1px solid #d3dcf6;border-radius:8px;padding:14px;margin:0">' + escapeHtml(message) + "</p>" +
    '<p style="color:#586079;font-size:12px;margin-top:16px">Répondez directement à cet e-mail pour écrire à ' + escapeHtml(name) + ".</p>" +
    "</div>";
  var text = rows.map(function (r) { return r[0] + " : " + r[1]; }).join("\n") + "\n\n" + message;

  try {
    var resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || DEFAULT_FROM,
        to: [process.env.CONTACT_TO || DEFAULT_TO],
        reply_to: email,
        subject: "Contact site — " + name + (formation ? " (" + formation + ")" : ""),
        html: html,
        text: text
      })
    });
    if (!resp.ok) {
      console.error("Resend a refusé l'envoi", resp.status, await resp.text());
      return reply(req, res, 502, { ok: false, error: "L'envoi a échoué. Réessayez ou appelez-nous au 04 94 52 91 13." });
    }
  } catch (err) {
    console.error("Erreur réseau Resend", err);
    return reply(req, res, 502, { ok: false, error: "L'envoi a échoué. Réessayez ou appelez-nous au 04 94 52 91 13." });
  }

  return reply(req, res, 200, { ok: true });
};
