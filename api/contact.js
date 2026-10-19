/* =====================================================================
   Auto-école La Tour de Mare — formulaire de contact
   Fonction Vercel : reçoit le formulaire et envoie deux e-mails via Resend :
   la notification à l'auto-école et un accusé de réception au visiteur.
   Aucune donnée n'est stockée. Modèles des e-mails : api/_emails.js

   Variables d'environnement (Vercel > Settings > Environment Variables) :
   - RESEND_API_KEY  (obligatoire) clé API Resend
   - CONTACT_TO      (facultatif)  destinataire des notifications, par défaut bourgois.ju@gmail.com
   - CONTACT_REPLY_TO (facultatif) adresse de réponse de l'accusé de réception,
                                   par défaut autoecoletourdemare@gmail.com
   - SITE_URL        (facultatif)  adresse du site (logo, liens), par défaut https://autoecole.antonyaddy.com
   - CONTACT_FROM    (facultatif)  expéditeur, par défaut contact@antonyaddy.com
                                   (domaine vérifié dans Resend)
   ===================================================================== */

var emails = require("./_emails");

var DEFAULT_TO = "bourgois.ju@gmail.com";
var DEFAULT_FROM = "Auto-école La Tour de Mare <contact@antonyaddy.com>";
var DEFAULT_REPLY_TO = "autoecoletourdemare@gmail.com";
var DEFAULT_SITE = "https://autoecole.antonyaddy.com";

var TYPES = {
  renseignement: "Demande de renseignement",
  rappel: "Demande de rappel"
};
var FORMATIONS = [
  "Permis B — voiture",
  "Conduite accompagnée (AAC)",
  "Permis moto (A1 / A2 / A)",
  "Permis AM (cyclomoteur, voiturette)",
  "Remorque (BE / B96)",
  "Formations rapides",
  "Je ne sais pas encore"
];
var GEARBOXES = ["Manuelle", "Automatique", "Je ne sais pas"];
var FUNDINGS = [
  "Paiement personnel (en plusieurs fois)",
  "Permis à 1 € par jour",
  "CPF (Compte Personnel de Formation)",
  "Prise en charge professionnelle",
  "Je souhaite être conseillé(e)"
];
var CALLBACKS = ["Mardi – vendredi, 10h – 12h", "Mardi – vendredi, 15h – 19h", "Samedi, 10h – 12h", "Peu importe"];

function pick(value, allowed) {
  return allowed.indexOf(value) === -1 ? "" : value;
}

function clean(value, max) {
  return String(value == null ? "" : value).replace(/\r\n?/g, "\n").trim().slice(0, max);
}

async function sendMail(apiKey, mail) {
  try {
    var resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(mail)
    });
    if (!resp.ok) {
      console.error("Resend a refusé l'envoi à " + mail.to.join(", "), resp.status, await resp.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Erreur réseau Resend", err);
    return false;
  }
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

  var type = Object.prototype.hasOwnProperty.call(TYPES, body.type) ? body.type : "renseignement";
  var name = clean(body.name, 120);
  var email = clean(body.email, 160);
  var phone = clean(body.phone, 30);
  var formation = pick(clean(body.formation, 80), FORMATIONS);
  var gearbox = pick(clean(body.gearbox, 40), GEARBOXES);
  var funding = pick(clean(body.funding, 80), FUNDINGS);
  var callback = pick(clean(body.callback, 60), CALLBACKS);
  var message = clean(body.message, 4000);
  var consent = body.consent === true || body.consent === "on" || body.consent === "true";

  if (!name || !formation || !consent || (type === "renseignement" && !message)) {
    return reply(req, res, 400, { ok: false, error: "Merci de remplir les champs obligatoires." });
  }
  if ((type !== "rappel" || email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reply(req, res, 400, { ok: false, error: "L'adresse e-mail ne semble pas valide." });
  }
  if (type === "rappel" && !phone) {
    return reply(req, res, 400, { ok: false, error: "Merci d'indiquer un numéro de téléphone." });
  }
  if (phone && !/^[0-9+().\s-]{6,30}$/.test(phone)) {
    return reply(req, res, 400, { ok: false, error: "Le numéro de téléphone ne semble pas valide." });
  }

  var apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY manquante");
    return reply(req, res, 500, { ok: false, error: "Le formulaire n'est pas encore configuré. Appelez-nous au 04 94 52 91 13." });
  }

  var data = {
    type: type,
    name: name,
    email: email,
    phone: phone,
    formation: formation,
    gearbox: gearbox,
    funding: funding,
    callback: callback,
    message: message,
    siteUrl: process.env.SITE_URL || DEFAULT_SITE,
    receivedAt: new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris", dateStyle: "full", timeStyle: "short" })
  };
  var from = process.env.CONTACT_FROM || DEFAULT_FROM;

  // 1. Notification à l'auto-école (indispensable)
  var notice = emails.notification(data);
  var noticeMail = {
    from: from,
    to: [process.env.CONTACT_TO || DEFAULT_TO],
    subject: notice.subject,
    html: notice.html,
    text: notice.text
  };
  if (email) { noticeMail.reply_to = email; }

  var sent = await sendMail(apiKey, noticeMail);
  if (!sent) {
    return reply(req, res, 502, { ok: false, error: "L'envoi a échoué. Réessayez ou appelez-nous au 04 94 52 91 13." });
  }

  // 2. Accusé de réception au visiteur (si e-mail fourni ; un échec ne bloque pas la demande)
  if (email) {
    var receipt = emails.confirmation(data);
    await sendMail(apiKey, {
      from: from,
      to: [email],
      reply_to: process.env.CONTACT_REPLY_TO || DEFAULT_REPLY_TO,
      subject: receipt.subject,
      html: receipt.html,
      text: receipt.text
    });
  }

  return reply(req, res, 200, { ok: true });
};
