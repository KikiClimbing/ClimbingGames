/* Administration des comptes : utilisateurs, équipes, séances, cycles, réglages (e-mails).
   Onglets ajoutés à la page Administration quand les comptes Google sont activés. */
const ADM_TABS_COMPTES = ["users", "equipes", "seances", "cycles", "reglages"];
const ADC = { users: null, equipes: null, seances: null, reglages: null, q: "", msg: "", tri: {} };
const admcDate = t => {
  const d = new Date(t);
  return t && !isNaN(d) ? d.toLocaleDateString("fr-FR") : "—";
};
/* bouton de l'administration (variantes : "", on, ok, no ; sm = petit) */
const admcBtn = (a, extra, txt, variante = "sm") =>
  `<a class="abtn ${variante}" data-admc="${a}" ${extra}>${txt}</a>`;
function admOngletsComptes() {
  if (!compteOn()) return "";
  return [
    ["users", "Utilisateurs"],
    ["equipes", "Équipes"],
    ["seances", "Séances"],
    ["cycles", "Cycles"],
    ["reglages", "Réglages"],
  ]
    .map(
      ([t, l]) =>
        `<button class="abtn ${ADM.tab === t ? "on" : ""}" data-adm="tab" data-t="${t}">${l}</button>`
    )
    .join("");
}
async function admcCharger() {
  const t = ADM.tab;
  ADC.msg = "Chargement…";
  try {
    if (t === "users") ADC.users = (await admPost("admin_utilisateurs")).utilisateurs;
    else if (t === "equipes") ADC.equipes = (await comptePost("equipes_liste")).equipes;
    else if (t === "seances" || t === "cycles")
      ADC.seances = (await admPost("admin_seances")).seances;
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
/* tri d'un tableau : cols = { clé: valeur => … } ; l'état est mémorisé par onglet */
function admTri(L, cols) {
  const s = ADC.tri[ADM.tab];
  if (!s || !cols[s.k]) return L;
  const f = cols[s.k];
  return L.slice().sort((a, b) => {
    const x = f(a),
      y = f(b);
    const r =
      typeof x === "number" && typeof y === "number"
        ? x - y
        : String(x).localeCompare(String(y), "fr", { numeric: true });
    return s.dir * r;
  });
}
const admTh = (k, lib) => {
  const s = ADC.tri[ADM.tab];
  return `<th class="tri" data-admc="tri" data-k="${k}" title="Trier">${lib}${s && s.k === k ? (s.dir > 0 ? " ▲" : " ▼") : ' <span style="opacity:.35">↕</span>'}</th>`;
};
/* fenêtre générique de l'administration */
function admModal(titre, corps) {
  admModalFermer();
  const p = document.createElement("div");
  p.id = "apop";
  p.innerHTML = `<div class="popbox" style="max-width:720px"><div class="poptools"><b style="flex:1">${titre}</b><a class="chip" data-admc="mfermer">✕ Fermer</a></div>${corps}</div>`;
  document.body.appendChild(p);
}
function admModalFermer() {
  const p = $("#apop");
  if (p) p.remove();
}
document.addEventListener("keydown", e => e.key === "Escape" && admModalFermer());
function admEquipeModal(id) {
  const x = (ADC.equipes || []).find(e => e.id === id);
  if (!x) return;
  admModal(
    esc(x.nom),
    `<div class="xc"><label class="sml">Nom<input data-ae="nom" data-id="${esc(x.id)}" value="${esc(x.nom)}"></label><label class="sml">Responsable (adresse)<input data-ae="owner" data-id="${esc(x.id)}" value="${esc(x.owner)}"></label><label class="sml">Membres (une adresse par ligne ou séparées par des virgules)<textarea data-ae="membres" data-id="${esc(x.id)}" rows="6">${esc(x.membres.join("\n"))}</textarea></label><p style="color:#6B7280;font-size:13px;margin:6px 0">Les personnes ajoutées reçoivent une invitation par e-mail si l'envoi est activé (onglet Réglages).</p><div>${admcBtn("eqsave", `data-id="${esc(x.id)}"`, "Enregistrer", "ok")}${admcBtn("eqdel", `data-id="${esc(x.id)}"`, "Supprimer l'équipe", "no")}</div></div>`
  );
}
function admComptesHTML() {
  const msg = ADC.msg ? `<p style="font-weight:700;color:#B2263A">${esc(ADC.msg)}</p>` : "";
  const t = ADM.tab;
  const q = norm(ADC.q);
  const search = ph =>
    `<div class="tools"><input class="search" id="admcq" type="search" placeholder="${ph}" value="${esc(ADC.q)}" style="max-width:380px"><a class="abtn sm" data-admc="reload">↻ Actualiser</a></div>`;
  if (t === "users") {
    if (!ADC.users) return msg;
    const L = admTri(
      ADC.users.filter(u => !q || norm(u.email + " " + u.nom).includes(q)),
      {
        nom: u => u.nom || u.email,
        seances: u => u.seances,
        cycles: u => u.cycles,
        equipes: u => u.equipes,
        derniere: u => u.derniere || "",
        etat: u => (u.bloque ? 1 : 0),
      }
    );
    const rows = L.map(
      u =>
        `<tr><td><b>${esc(u.nom || "—")}</b><div style="font-size:12px;color:#6B7280">${esc(u.email)}${u.admin ? " · admin" : ""}</div></td><td>${u.seances}</td><td>${u.cycles}</td><td>${u.equipes}</td><td>${admcDate(u.derniere)}</td><td>${u.bloque ? '<b style="color:#B2263A">désactivé</b>' : "actif"}</td><td style="white-space:nowrap">${u.admin ? "" : admcBtn("comme", `data-e="${esc(u.email)}"`, "👁 Voir comme") + admcBtn(u.bloque ? "debloquer" : "bloquer", `data-e="${esc(u.email)}"`, u.bloque ? "Réactiver" : "Désactiver") + admcBtn("suppr", `data-e="${esc(u.email)}"`, "🗑", "sm no")}</td></tr>`
    ).join("");
    return `${msg}${search("Rechercher un utilisateur…")}<p class="count">${L.length} utilisateur${L.length > 1 ? "s" : ""}</p>
    <div style="overflow-x:auto"><table class="adt"><thead><tr>${admTh("nom", "UTILISATEUR")}${admTh("seances", "SÉANCES")}${admTh("cycles", "CYCLES")}${admTh("equipes", "ÉQUIPES")}${admTh("derniere", "DERNIÈRE CONNEXION")}${admTh("etat", "ÉTAT")}<th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="box" style="margin-top:12px"><b>Voir comme une adresse précise</b> <input id="admcComme" type="email" placeholder="adresse@gmail.com" style="margin:0 6px;padding:6px 8px"> ${admcBtn("comme", 'data-e=""', "👁 Voir comme")}<div style="color:#6B7280;font-size:13px;margin-top:6px">Lecture seule : vous voyez les séances, cycles et équipes que cette personne voit, sans rien pouvoir modifier.</div></div>`;
  }
  if (t === "equipes") {
    if (!ADC.equipes) return msg;
    const L = admTri(
      ADC.equipes.filter(
        x => !q || norm(x.nom + " " + x.owner + " " + x.membres.join(" ")).includes(q)
      ),
      { nom: x => x.nom, owner: x => x.owner, membres: x => x.membres.length }
    );
    const rows = L.map(
      x =>
        `<tr class="cl" data-admc="eqopen" data-id="${esc(x.id)}"><td><b>${esc(x.nom)}</b></td><td>${esc(x.owner)}</td><td>${x.membres.length}</td></tr>`
    ).join("");
    return `${msg}${search("Rechercher une équipe, un membre…")}<p class="count">${L.length} équipe${L.length > 1 ? "s" : ""} · cliquez sur une ligne pour voir et modifier</p>${L.length ? `<div style="overflow-x:auto"><table class="adt"><thead><tr>${admTh("nom", "ÉQUIPE")}${admTh("owner", "RESPONSABLE")}${admTh("membres", "MEMBRES")}</tr></thead><tbody>${rows}</tbody></table></div>` : '<div class="empty">Aucune équipe.</div>'}`;
  }
  if (t === "seances" || t === "cycles") {
    if (!ADC.seances) return msg;
    const cy = t === "cycles";
    const L = admTri(
      ADC.seances.filter(
        x =>
          x.id.startsWith("cy") === cy &&
          (!q || norm(x.titre + " " + x.proprietaire + " " + x.nom).includes(q))
      ),
      {
        titre: x => x.titre,
        proprietaire: x => x.proprietaire,
        date: x => x.date || "",
        partage: x => (x.partage ? 1 : 0),
      }
    );
    const rows = L.slice(0, 300)
      .map(
        x =>
          `<tr><td data-sbpop="${esc(x.id)}" style="cursor:pointer" title="Aperçu"><b style="border-bottom:1px dotted #3A8FB0">${esc(x.titre || "Sans titre")}</b></td><td>${admcDate(x.date)}</td><td>${x.partage ? "oui" : "—"}</td><td><input data-as="${esc(x.id)}" value="${esc(x.proprietaire)}"></td><td style="white-space:nowrap">${admcBtn("sproprio", `data-id="${esc(x.id)}"`, "Changer le propriétaire")}${admcBtn("sdel", `data-id="${esc(x.id)}"`, "🗑", "sm no")}</td></tr>`
      )
      .join("");
    return `${msg}${search("Rechercher (titre, propriétaire)…")}<p class="count">${L.length} ${cy ? "cycle" : "séance"}${L.length > 1 ? "s" : ""}${L.length > 300 ? " (300 premiers affichés : affinez la recherche)" : ""} · cliquez sur un titre pour l'aperçu</p><div style="overflow-x:auto"><table class="adt"><thead><tr>${admTh("titre", "TITRE")}${admTh("date", "DATE")}${admTh("partage", "PARTAGÉ")}${admTh("proprietaire", "PROPRIÉTAIRE")}<th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  if (!ADC.reglages) return msg;
  const r = ADC.reglages;
  return `${msg}<div class="box" style="max-width:640px"><b>E-mails d'invitation</b><p style="margin:6px 0">Quand quelqu'un est ajouté à une équipe, il reçoit un e-mail envoyé depuis votre compte Google (adresse de réponse : celle de la personne qui l'a ajouté).</p><p style="margin:6px 0">État : <b style="color:${r.emails ? "#2E7D4F" : "#B2263A"}">${r.emails ? "envoi activé" : "envoi désactivé"}</b>${r.quotaMails !== null && r.quotaMails !== undefined ? ` · il reste ${r.quotaMails} e-mails aujourd'hui` : ""}</p>${admcBtn("emails", `data-v="${r.emails ? "0" : "1"}"`, r.emails ? "Désactiver l'envoi d'e-mails" : "Activer l'envoi d'e-mails", r.emails ? "no" : "ok")}<p style="color:#6B7280;font-size:13px;margin-bottom:0">Limites : 20 invitations par enregistrement et 50 par jour et par personne (hors administrateur), puis le quota de votre compte Google (environ 100 par jour pour un compte gratuit).</p></div>`;
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
  if (e.target.id === "apop") {
    admModalFermer();
    return true;
  }
  const b = e.target.closest("[data-admc]");
  if (!b) return;
  const a = b.dataset.admc,
    id = b.dataset.id,
    em = b.dataset.e;
  const fait = async (f, ok) => {
    try {
      const j = await f();
      admModalFermer();
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
  else if (a === "mfermer") admModalFermer();
  else if (a === "tri") {
    const s = ADC.tri[ADM.tab];
    ADC.tri[ADM.tab] = { k: b.dataset.k, dir: s && s.k === b.dataset.k ? -s.dir : 1 };
    render();
  } else if (a === "eqopen") admEquipeModal(id);
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
      "Supprimer aussi toutes ses séances et tous ses cycles ?\n\nOK = les supprimer définitivement\nAnnuler = les conserver (à réaffecter dans les onglets Séances et Cycles)"
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
