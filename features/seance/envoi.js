/* Ma séance — envoi de la fiche terminée à l'équipe ou à une personne (e-mail ou WhatsApp) */
let ENVOI = null;
function envoiTexte(meta, se, id) {
  return withSeance(meta, se, () => {
    const M = seModel(),
      S = SMETA;
    const n = t => String(t || "").trim().toLowerCase();
    /* nom du jeu (bibliothèque) + code ; si le nom saisi dans la fiche diffère à la fois du jeu et du titre de la section, on garde les deux */
    const nom = (x, tsec) => {
      const jeu = x.v.titre || x.name,
        code = x.v.code ? " (" + x.v.code + ")" : "";
      const perso = x.name && n(x.name) !== n(jeu) && n(x.name) !== n(tsec);
      return (perso ? x.name + " — " : "") + jeu + code;
    };
    const L = [];
    L.push("Séance : " + (S.titre || "sans titre"));
    if (S.dates) L.push("Date : " + S.dates);
    if (S.theme) L.push("Thème : " + S.theme);
    if (S.objectif) L.push("Objectif : " + S.objectif);
    if (S.educ) L.push("Éducateur : " + S.educ);
    L.push("");
    const bloc = (L2, titre0) =>
      L2.forEach(s => {
        const j = s.views.map(x => nom(x, s.titre)).join(", ");
        if (s.titre || j) L.push("• " + (s.titre || titre0) + (j ? " : " + j : ""));
      });
    if (M.ech.on && M.echSubs.some(x => x.titre || x.views.length)) {
      L.push("Échauffement :");
      bloc(M.echSubs, "Échauffement");
    }
    L.push("Corps de séance :");
    bloc(M.subs, "Situation");
    if (id && typeof compteOn === "function" && compteOn())
      L.push("", "Fiche complète : " + location.origin + location.pathname + "#/sb/" + encodeURIComponent(id));
    return L.join("\n");
  });
}
function envoiOuvrir(meta, se, id) {
  ENVOI = { meta, se, id };
  const eq = typeof EQUIPES !== "undefined" ? EQUIPES : [];
  const titre = (meta && meta.titre) || "séance";
  modal(
    "📨 Envoyer la séance",
    `<div style="display:grid;gap:8px">
    ${eq.length ? `<div class="sml">Équipes<div class="gchk">${eq.map(q => `<label class="fl"><input type="checkbox" data-envq="${esc(q.id)}"> ${esc(q.nom)} <span style="color:#6B7280">(${(q.membres || []).length})</span></label>`).join("")}</div></div>` : ""}
    <label class="sml">Personnes (adresses e-mail, une par ligne)<textarea id="envP" rows="3" placeholder="prenom.nom@gmail.com"></textarea></label>
    <label class="sml">Numéro WhatsApp d'une personne (facultatif, avec l'indicatif — ex. 33612345678)<input id="envN" inputmode="tel" placeholder="33612345678"></label>
    <label class="sml">Message<textarea id="envM" rows="12">${esc("Bonjour,\nvoici la séance « " + titre + " ».\n\n" + envoiTexte(meta, se, id))}</textarea></label>
    ${id ? "<p class=\"hint\" style=\"margin:0\">Pour que le lien s'ouvre chez les destinataires, partage aussi la séance (bouton « 👥 Partager »).</p>" : "<p class=\"hint\" style=\"margin:0\">Cette séance n'est pas enregistrée : le message contient le résumé, sans lien.</p>"}
    <div class="tools"><a class="btn" data-env="mail" style="background:#2B5A9E;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer">✉ E-mail</a><a class="btn" data-env="wa" style="background:#2E7D4F;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer">WhatsApp</a><a class="chip" data-env="copy" style="cursor:pointer">⧉ Copier le message</a></div>
    <p class="hint" style="margin:0">WhatsApp ne permet pas d'écrire directement à un groupe : sans numéro, tu choisis le contact ou le groupe dans WhatsApp.</p></div>`,
    640
  );
}
registerClick(e => {
  const b = e.target.closest("[data-env]");
  if (b) {
    const msg = ($("#envM") || {}).value || "";
    const k = b.dataset.env;
    if (k === "copy") {
      (navigator.clipboard ? navigator.clipboard.writeText(msg) : Promise.reject()).then(
        () => toast("✓ Message copié."),
        () => toast("Copie impossible : sélectionne le texte à la main.")
      );
    } else if (k === "wa") {
      const n = (($("#envN") || {}).value || "").replace(/\D/g, "");
      window.open("https://wa.me/" + n + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    } else if (k === "mail") {
      const eq = typeof EQUIPES !== "undefined" ? EQUIPES : [];
      const ids = [...document.querySelectorAll("[data-envq]:checked")].map(c => c.dataset.envq);
      const adr = new Set(
        (($("#envP") || {}).value || "").split(/[\s,;]+/).filter(x => x.includes("@"))
      );
      eq.filter(q => ids.includes(q.id)).forEach(q =>
        (Array.isArray(q.membres) ? q.membres : String(q.membres || "").split(/[\s,;]+/))
          .filter(x => String(x).includes("@"))
          .forEach(x => adr.add(x))
      );
      const sujet = "Séance : " + ((ENVOI && ENVOI.meta && ENVOI.meta.titre) || "");
      if (!adr.size) {
        toast("Ajoute au moins une équipe ou une adresse.");
        return true;
      }
      const l = [...adr].join(",");
      if (msg.length > 1800) navigator.clipboard && navigator.clipboard.writeText(msg);
      const corps = msg.length > 1800 ? "(message long : colle-le ici, il est dans ton presse-papiers)" : msg;
      location.href = "mailto:?bcc=" + encodeURIComponent(l) + "&subject=" + encodeURIComponent(sujet) + "&body=" + encodeURIComponent(corps);
    }
    return true;
  }
  const o = e.target.closest("[data-envo]");
  if (o) {
    envoiOuvrir(SMETA, SE, SE.id || "");
    return true;
  }
  const f = e.target.closest("[data-sb=envoi]");
  if (f && typeof SBCUR !== "undefined" && SBCUR) {
    envoiOuvrir(SBCUR.meta, SBCUR.se, SBID);
    return true;
  }
});
