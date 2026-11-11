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
/* séance enregistrée appartenant à l'utilisateur ? (alors l'envoi peut aussi ouvrir les droits) */
function envoiRec(id) {
  /* même source que la fiche : propriétaire (owner) et partage tels que le serveur les donne */
  return typeof sbAll === "function" ? sbAll().find(x => x.id === id) : null;
}
function envoiMien(id) {
  const r = envoiRec(id);
  return !!(r && typeof compteOn === "function" && compteOn() && typeof compteMien === "function" && compteMien(r));
}
const envoiMembres = q => (Array.isArray(q.membres) ? q.membres : String(q.membres || "").split(/[\s,;]+/)).map(String).filter(x => x.includes("@"));
function envoiOuvrir(meta, se, id) {
  ENVOI = { meta, se, id };
  const eq = typeof EQUIPES !== "undefined" ? EQUIPES : [];
  const titre = (meta && meta.titre) || "séance";
  const droits = !!(id && envoiMien(id));
  const L = droits ? partageListe(envoiRec(id)) : [];
  const pers = L.filter(x => !x.startsWith("team:")),
    eqs = L.filter(x => x.startsWith("team:")).map(x => x.slice(5));
  const sty = c => `background:${c};color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block`;
  modal(
    droits ? "🔗 Partager la séance" : "🔗 Envoyer la séance",
    `<div style="display:grid;gap:8px">
    ${droits ? '<p class="hint" style="margin:0">Les personnes cochées ou listées pourront <b>lire</b> la séance (pas la modifier) après connexion avec leur adresse Google. Retire une adresse pour retirer son accès.</p>' : id ? "<p class=\"hint\" style=\"margin:0\">Cette séance n'est pas à toi : tu peux seulement envoyer un message. Le lien ne s'ouvrira que pour ceux qui ont déjà accès.</p>" : "<p class=\"hint\" style=\"margin:0\">Séance non enregistrée : le message n'aura pas de lien. Enregistre-la dans la bibliothèque pour pouvoir la partager.</p>"}
    ${eq.length ? `<div class="sml">Équipes<div class="gchk">${eq.map(q => `<label class="fl"><input type="checkbox" data-envq="${esc(q.id)}" ${eqs.includes(q.id) ? "checked" : ""}> ${esc(q.nom)} <span style="color:#6B7280">(${envoiMembres(q).length})</span></label>`).join("")}</div></div>` : ""}
    <label class="sml">Personnes (adresses Google, une par ligne)<textarea id="envP" rows="3" placeholder="prenom.nom@gmail.com">${esc(pers.join("\n"))}</textarea></label>
    <label class="sml">Message de notification<textarea id="envM" rows="10">${esc("Bonjour,\nvoici la séance « " + titre + " ».\n\n" + envoiTexte(meta, se, id))}</textarea></label>
    ${droits ? '<label class="fl" style="margin:0;display:flex;gap:8px;align-items:center"><input type="checkbox" id="envNouv" checked style="width:auto;flex:none"> Prévenir seulement les nouvelles personnes (pas celles qui ont déjà accès)</label>' : ""}
    <div class="tools">${droits ? `<a class="btn" data-env="save" style="${sty("#26364D")}">Partager (sans message)</a>` : ""}<a class="btn" data-env="mail" style="${sty("#2B5A9E")}">${droits ? "Partager + " : ""}✉ E-mail</a><a class="btn" data-env="wa" style="${sty("#2E7D4F")}">${droits ? "Partager + " : ""}WhatsApp</a><a class="chip" data-env="copy" style="cursor:pointer;align-self:center">Copier le message</a></div>
    <div id="envMsg" style="font-weight:700;min-height:20px"></div>
    <p class="hint" style="margin:0">WhatsApp s'ouvre avec le message : tu y choisis le contact ou le groupe.</p></div>`,
    640
  );
}
function envoiLire() {
  const eq = typeof EQUIPES !== "undefined" ? EQUIPES : [];
  const ids = [...document.querySelectorAll("[data-envq]:checked")].map(c => c.dataset.envq);
  const pers = (($("#envP") || {}).value || "").split(/[\s,;]+/).filter(x => x.includes("@"));
  const deEquipes = new Set();
  eq.filter(q => ids.includes(q.id)).forEach(q => envoiMembres(q).forEach(x => deEquipes.add(x)));
  return { ids, pers, tous: [...new Set([...pers, ...deEquipes])] };
}
/* enregistre le partage (équipes cochées + personnes listées) ; renvoie la liste des adresses nouvellement ajoutées */
function envoiPartager() {
  const r = envoiRec(ENVOI.id),
    avant = partageListe(r),
    { ids, pers } = envoiLire();
  const liste = [...ids.map(i => "team:" + i), ...pers];
  const nouv = liste.filter(x => !avant.includes(x));
  const m = () => $("#envMsg"),
    bt = [...document.querySelectorAll("[data-env]")];
  if (m()) {
    m().style.color = "#26364D";
    m().innerHTML = '<span class="spin">⏳</span> Enregistrement du partage…';
  }
  bt.forEach(x => (x.style.opacity = ".55"));
  bt.forEach(x => (x.style.pointerEvents = "none"));
  const fin = () => bt.forEach(x => ((x.style.opacity = ""), (x.style.pointerEvents = "")));
  comptePost("seance_partage", { id: ENVOI.id, partage: liste, prevenir: false })
    .then(() => {
      fin();
      if (m()) {
        m().style.color = "#2E7D4F";
        m().textContent = "✓ Partage enregistré.";
      }
      return loadSeances().then(render);
    })
    .catch(err => {
      fin();
      if (m()) {
        m().style.color = "#B2263A";
        m().textContent = "Partage non enregistré : " + err.message;
      }
    });
  return nouv;
}
function envoiDestinataires(nouv, droits) {
  const eq = typeof EQUIPES !== "undefined" ? EQUIPES : [];
  const { tous } = envoiLire();
  if (!droits || !($("#envNouv") || {}).checked) return tous;
  const adr = new Set(nouv.filter(x => x.includes("@")));
  eq.filter(q => nouv.includes("team:" + q.id)).forEach(q => envoiMembres(q).forEach(x => adr.add(x)));
  return [...adr];
}
registerClick(e => {
  const b = e.target.closest("[data-env]");
  if (b) {
    const msg = ($("#envM") || {}).value || "";
    const k = b.dataset.env;
    const droits = !!(ENVOI && ENVOI.id && envoiMien(ENVOI.id));
    if (k === "copy") {
      (navigator.clipboard ? navigator.clipboard.writeText(msg) : Promise.reject()).then(
        () => toast("✓ Message copié."),
        () => toast("Copie impossible : sélectionne le texte à la main.")
      );
    } else if (k === "save") {
      if (droits) envoiPartager();
    } else if (k === "wa") {
      window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank", "noopener");
      if (droits) envoiPartager();
    } else if (k === "mail") {
      const lu = envoiLire();
      const nouv = droits ? envoiPartager() : [];
      const dest = droits ? envoiDestinataires(nouv, true) : lu.tous;
      if (!lu.tous.length) {
        toast("Ajoute au moins une équipe ou une adresse.");
        return true;
      }
      if (!dest.length) {
        toast("Partage enregistré. Personne de nouveau à prévenir : décoche « seulement les nouvelles personnes » pour écrire à tout le monde.");
        return true;
      }
      const sujet = "Séance : " + ((ENVOI && ENVOI.meta && ENVOI.meta.titre) || "");
      if (msg.length > 1800) navigator.clipboard && navigator.clipboard.writeText(msg);
      const corps = msg.length > 1800 ? "(message long : colle-le ici, il est dans ton presse-papiers)" : msg;
      location.href = "mailto:?bcc=" + encodeURIComponent(dest.join(",")) + "&subject=" + encodeURIComponent(sujet) + "&body=" + encodeURIComponent(corps);
    }
    return true;
  }
  const f = e.target.closest("[data-sb=envoi]");
  if (f && typeof SBCUR !== "undefined" && SBCUR) {
    envoiOuvrir(SBCUR.meta, SBCUR.se, SBID);
    return true;
  }
  const o = e.target.closest("[data-envo]");
  if (o) {
    envoiOuvrir(SMETA, SE, SE.id || "");
    return true;
  }
});
