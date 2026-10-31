/* Administration des comptes : utilisateurs, équipes, séances et cycles, réglages (e-mails).
   Onglets ajoutés à la page Administration quand les comptes Google sont activés. */
const ADM_TABS_COMPTES = ["users", "equipes", "seances", "reglages"];
const ADC = { users: null, equipes: null, seances: null, reglages: null, q: "", msg: "" };
const admcDate = t => {
  const d = new Date(t);
  return t && !isNaN(d) ? d.toLocaleDateString("fr-FR") : "—";
};
function admOngletsComptes() {
  if (!compteOn()) return "";
  const b = (t, l) =>
    `<button data-adm="tab" data-t="${t}" class="${ADM.tab === t ? "on" : ""}">${l}</button>`;
  return (
    b("users", "Utilisateurs") +
    b("equipes", "Équipes") +
    b("seances", "Séances et cycles") +
    b("reglages", "Réglages")
  );
}
async function admcCharger() {
  const t = ADM.tab;
  ADC.msg = "Chargement…";
  try {
    if (t === "users") ADC.users = (await admPost("admin_utilisateurs")).utilisateurs;
    else if (t === "equipes") ADC.equipes = (await comptePost("equipes_liste")).equipes;
    else if (t === "seances") ADC.seances = (await admPost("admin_seances")).seances;
    else if (t === "reglages") ADC.reglages = await admPost("admin_reglages", {});
    ADC.msg = "";
  } catch (e) {
    ADC.msg = "Échec : " + e.message;
  }
  render();
}
const admComptesCharger = () => {
  ADC.q = "";
  admcCharger();
};
const admcBtn = (a, extra, txt, bg = "#26364D", col = "#fff") =>
  `<a class="btn" data-admc="${a}" ${extra} style="background:${bg};color:${col};border-radius:8px;padding:6px 12px;font-weight:700;cursor:pointer;display:inline-block;font-size:13px;margin:2px">${txt}</a>`;
function admComptesHTML() {
  const msg = ADC.msg ? `<p style="font-weight:700;color:#B2263A">${esc(ADC.msg)}</p>` : "";
  const t = ADM.tab;
  const q = norm(ADC.q);
  const search = ph =>
    `<div class="tools"><input class="search" id="admcq" type="search" placeholder="${ph}" value="${esc(ADC.q)}" style="max-width:380px"><a class="chip" data-admc="reload" style="cursor:pointer">↻ Actualiser</a></div>`;
  if (t === "users") {
    if (!ADC.users) return msg || "";
    const L = ADC.users.filter(u => !q || norm(u.email + " " + u.nom).includes(q));
    const rows = L.map(
      u =>
        `<tr><td><b>${esc(u.nom || "—")}</b><div style="font-size:12px;color:#6B7280">${esc(u.email)}${u.admin ? " · admin" : ""}</div></td><td>${u.seances}</td><td>${u.cycles}</td><td>${u.equipes}</td><td>${admcDate(u.derniere)}</td><td>${u.bloque ? '<b style="color:#B2263A">désactivé</b>' : "actif"}</td><td style="white-space:nowrap">${u.admin ? "" : admcBtn("comme", `data-e="${esc(u.email)}"`, "👁 Voir comme", "#3A8FB0") + admcBtn(u.bloque ? "debloquer" : "bloquer", `data-e="${esc(u.email)}"`, u.bloque ? "Réactiver" : "Désactiver", "#EEF1F8", "#26364D") + admcBtn("suppr", `data-e="${esc(u.email)}"`, "🗑", "#fff", "#B2263A")}</td></tr>`
    ).join("");
    return `${msg}${search("Rechercher un utilisateur…")}<p class="count">${L.length} utilisateur${L.length > 1 ? "s" : ""}</p>
    <div style="overflow-x:auto"><table class="lst sbl"><thead><tr><th>UTILISATEUR</th><th>SÉANCES</th><th>CYCLES</th><th>ÉQUIPES</th><th>DERNIÈRE CONNEXION</th><th>ÉTAT</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="box" style="margin-top:12px"><b>Voir comme une adresse précise</b> <input id="admcComme" type="email" placeholder="adresse@gmail.com" style="margin:0 6px;padding:6px 8px"> ${admcBtn("comme", 'data-e=""', "👁 Voir comme", "#3A8FB0")}<div style="color:#6B7280;font-size:13px;margin-top:6px">Lecture seule : vous voyez les séances, cycles et équipes que cette personne voit, sans rien pouvoir modifier. Les personnes apparaissent ici à leur première connexion depuis la v45.</div></div>`;
  }
  if (t === "equipes") {
    if (!ADC.equipes) return msg || "";
    const L = ADC.equipes.filter(
      x => !q || norm(x.nom + " " + x.owner + " " + x.membres.join(" ")).includes(q)
    );
    const cartes = L.map(
      x =>
        `<div class="xc" style="margin-bottom:10px"><label class="sml">Nom<input data-ae="nom" data-id="${esc(x.id)}" value="${esc(x.nom)}"></label><label class="sml">Responsable (adresse)<input data-ae="owner" data-id="${esc(x.id)}" value="${esc(x.owner)}"></label><label class="sml">Membres (une adresse par ligne ou séparées par des virgules)<textarea data-ae="membres" data-id="${esc(x.id)}" rows="3">${esc(x.membres.join("\n"))}</textarea></label><div style="margin-top:6px">${admcBtn("eqsave", `data-id="${esc(x.id)}"`, "Enregistrer", "#2E7D4F")}${admcBtn("eqdel", `data-id="${esc(x.id)}"`, "Supprimer l'équipe", "#fff", "#B2263A")}</div></div>`
    ).join("");
    return `${msg}${search("Rechercher une équipe, un membre…")}<p class="count">${L.length} équipe${L.length > 1 ? "s" : ""}</p>${cartes || '<div class="empty">Aucune équipe.</div>'}<p style="color:#6B7280;font-size:13px">Les personnes ajoutées reçoivent une invitation par e-mail si l'envoi est activé (onglet Réglages).</p>`;
  }
  if (t === "seances") {
    if (!ADC.seances) return msg || "";
    const L = ADC.seances.filter(
      x => !q || norm(x.titre + " " + x.proprietaire + " " + x.nom).includes(q)
    );
    const rows = L.slice(0, 300)
      .map(
        x =>
          `<tr><td><b>${esc(x.titre || "Sans titre")}</b><div style="font-size:12px;color:#6B7280">${x.id.startsWith("cy") ? "cycle" : "séance"} · ${admcDate(x.date)}${x.partage ? " · partagé" : ""}</div></td><td><input data-as="${esc(x.id)}" value="${esc(x.proprietaire)}" style="width:100%;min-width:200px;padding:5px 7px"></td><td style="white-space:nowrap">${admcBtn("sproprio", `data-id="${esc(x.id)}"`, "Changer le propriétaire", "#EEF1F8", "#26364D")}${admcBtn("sdel", `data-id="${esc(x.id)}"`, "🗑", "#fff", "#B2263A")}</td></tr>`
      )
      .join("");
    return `${msg}${search("Rechercher (titre, propriétaire)…")}<p class="count">${L.length} élément${L.length > 1 ? "s" : ""}${L.length > 300 ? " (300 premiers affichés : affinez la recherche)" : ""}</p><div style="overflow-x:auto"><table class="lst sbl"><thead><tr><th>TITRE</th><th>PROPRIÉTAIRE</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  if (!ADC.reglages) return msg || "";
  const r = ADC.reglages;
  return `${msg}<div class="box" style="max-width:640px"><b>E-mails d'invitation</b><p style="margin:6px 0">Quand quelqu'un est ajouté à une équipe, il reçoit un e-mail envoyé depuis votre compte Google (adresse de réponse : celle de la personne qui l'a ajouté).</p><p style="margin:6px 0">État : <b style="color:${r.emails ? "#2E7D4F" : "#B2263A"}">${r.emails ? "envoi activé" : "envoi désactivé"}</b>${r.quotaMails !== null && r.quotaMails !== undefined ? ` · il reste ${r.quotaMails} e-mails aujourd'hui` : ""}</p>${admcBtn("emails", `data-v="${r.emails ? "0" : "1"}"`, r.emails ? "Désactiver l'envoi d'e-mails" : "Activer l'envoi d'e-mails", r.emails ? "#B2263A" : "#2E7D4F")}<p style="color:#6B7280;font-size:13px;margin-bottom:0">Limites : 20 invitations par enregistrement et 50 par jour et par personne (hors administrateur), puis le quota de votre compte Google (environ 100 par jour pour un compte gratuit).</p></div>`;
}
/* appelé par la page Administration après chaque affichage */
function admComptesBind() {
  const q = $("#admcq");
  if (q)
    q.addEventListener("input", () => {
      ADC.q = q.value;
      render();
      const n = $("#admcq");
      n.focus();
      n.setSelectionRange(n.value.length, n.value.length);
    });
}
registerClick(e => {
  const b = e.target.closest("[data-admc]");
  if (!b) return;
  const a = b.dataset.admc,
    id = b.dataset.id,
    em = b.dataset.e;
  const fait = async (f, ok) => {
    try {
      const j = await f();
      toast(
        (ok || "✓ Enregistré.") +
          (typeof compteInfoMails === "function" ? compteInfoMails(j && j.emails) : "")
      );
      await admcCharger();
    } catch (err) {
      toast("Échec : " + err.message);
    }
  };
  if (a === "reload") admcCharger();
  else if (a === "comme") {
    const adr = em || ($("#admcComme") || {}).value || "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adr.trim()))
      toast("Saisissez une adresse e-mail valide.");
    else compteVoirComme(adr);
  } else if (a === "bloquer" || a === "debloquer")
    fait(
      () => admPost("admin_utilisateur", { email: em, op: a }),
      a === "bloquer" ? "Compte désactivé." : "Compte réactivé."
    );
  else if (a === "suppr") {
    if (!confirm("Supprimer l'utilisateur " + em + " de la liste et de ses équipes ?")) return true;
    const sup = confirm(
      "Supprimer aussi toutes ses séances et tous ses cycles ?\n\nOK = les supprimer définitivement\nAnnuler = les conserver (à réaffecter dans l'onglet « Séances et cycles »)"
    );
    fait(
      () =>
        admPost("admin_utilisateur", {
          email: em,
          op: "supprimer",
          seances: sup ? "supprimer" : "garder",
        }),
      "Utilisateur supprimé."
    );
  } else if (a === "eqsave") {
    const f = k => document.querySelector(`[data-ae=${k}][data-id="${id}"]`).value;
    fait(
      () =>
        admPost("admin_equipe", {
          id,
          nom: f("nom"),
          proprietaire: f("owner"),
          membres: f("membres")
            .split(/[\s,;]+/)
            .filter(Boolean),
        }),
      "✓ Équipe enregistrée."
    );
  } else if (a === "eqdel") {
    if (confirm("Supprimer cette équipe ?"))
      fait(() => admPost("admin_equipe", { id, supprimer: true }), "Équipe supprimée.");
  } else if (a === "sproprio") {
    const v = document.querySelector(`[data-as="${id}"]`).value;
    fait(() => admPost("admin_seance_proprio", { id, proprietaire: v }), "✓ Propriétaire modifié.");
  } else if (a === "sdel") {
    if (confirm("Supprimer définitivement cet élément ?"))
      fait(() => comptePost("seance_suppr", { id }), "Supprimé.");
  } else if (a === "emails")
    fait(() => admPost("admin_reglages", { emails: b.dataset.v === "1" }), "✓ Réglage enregistré.");
  return true;
});
