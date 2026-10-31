/* Comptes : connexion avec Google (séances et cycles seulement ; les jeux restent publics).
   Actif seulement si GOOGLE_CLIENT_ID et GAME_ADD_URL sont renseignés dans config.js. */
const AUTH = { session: "", user: null };
const COMPTE_LS = "compteSession";
const compteOn = () => !!(CONFIG.GOOGLE_CLIENT_ID && CONFIG.GAME_ADD_URL);
try {
  const s = JSON.parse(localStorage.getItem(COMPTE_LS) || "null");
  if (s && s.session && s.user) {
    AUTH.session = s.session;
    AUTH.user = s.user;
  }
} catch (e) {}
/* suffixe des clés du navigateur : une personne ne voit pas les copies locales d'une autre */
const compteSuffixe = () => (compteOn() && AUTH.user ? ":" + AUTH.user.email : "");
/* séance ou cycle à moi ? (sans comptes : toujours) */
const compteMien = r =>
  !compteOn() || !AUTH.user || AUTH.user.admin || !r.owner || r.owner === AUTH.user.email;
function compteExpiree() {
  AUTH.session = "";
  AUTH.user = null;
  try {
    localStorage.removeItem(COMPTE_LS);
  } catch (e) {}
}
/* envoi au serveur avec la session ; renvoie la réponse (exception si refusée) */
async function comptePost(action, extra) {
  const r = await fetch(CONFIG.GAME_ADD_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, session: AUTH.session, ...extra }),
  });
  const j = await r.json();
  if (!j.ok) {
    if (j.code === "auth") {
      compteExpiree();
      throw new Error("session expirée : reconnectez-vous");
    }
    throw new Error(j.error || "refusé");
  }
  return j;
}
/* envoi d'une action « séance » : avec compte (session) ou, sans comptes, avec la clé du site */
async function serveurSeance(action, extra) {
  if (compteOn()) return comptePost(action, extra);
  const r = await fetch(CONFIG.GAME_ADD_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ key: CONFIG.GAME_ADD_KEY || "", action, ...extra }),
  });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || "refusé");
  return j;
}
/* true si l'utilisateur doit d'abord se connecter (et le renvoie vers la page de connexion) */
function compteRequis() {
  if (!compteOn() || AUTH.user) return false;
  toast("Connectez-vous avec Google pour enregistrer.");
  go("compte");
  return true;
}
function gsiCharger() {
  return new Promise((ok, ko) => {
    if (window.google && google.accounts && google.accounts.id) return ok();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => ok();
    s.onerror = () => ko(new Error("Google indisponible"));
    document.head.appendChild(s);
  });
}
async function compteBoutonGoogle() {
  const zone = $("#gsiBtn");
  if (!zone || AUTH.user) return;
  try {
    await gsiCharger();
    google.accounts.id.initialize({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      callback: async resp => {
        const m = $("#compteMsg");
        if (m) m.textContent = "Connexion…";
        try {
          const r = await fetch(CONFIG.GAME_ADD_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ action: "auth", credential: resp.credential }),
          });
          const j = await r.json();
          if (!j.ok) throw new Error(j.error || "refusé");
          localStorage.setItem(COMPTE_LS, JSON.stringify({ session: j.session, user: j.user }));
          location.reload();
        } catch (e) {
          if (m) m.textContent = "Échec de la connexion : " + e.message;
        }
      },
    });
    google.accounts.id.renderButton(zone, {
      theme: "outline",
      size: "large",
      text: "signin_with",
      locale: "fr",
    });
  } catch (e) {
    zone.textContent = "Impossible de charger la connexion Google (" + e.message + ").";
  }
}
function compteView() {
  const head = gsec(
    "Mon compte",
    "Le compte sert à enregistrer vos séances et vos cycles et à les partager. Les jeux restent accessibles à tous.",
    "Connectez-vous avec votre compte Google : aucun mot de passe à créer. Vos séances sont privées tant que vous ne les partagez pas."
  );
  if (!compteOn())
    return head + `<div class="box">Les comptes ne sont pas activés sur ce site.</div>`;
  if (AUTH.user)
    return (
      head +
      `<div class="box"><b>${esc(AUTH.user.nom)}</b><div style="color:#6B7280">${esc(AUTH.user.email)}${AUTH.user.admin ? " · administrateur" : ""}</div><p style="margin:10px 0">Vos séances et vos cycles sont enregistrés sur votre compte : vous seul les voyez, sauf si vous les partagez (bouton « Partager » sur une séance ou un cycle).</p><a class="btn" data-compte="logout" style="background:#fff;color:#B2263A;border:1px solid #E8B4BC;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Se déconnecter</a></div>`
    );
  return (
    head +
    `<div class="box" style="max-width:520px"><p style="margin-top:0">Connectez-vous avec votre compte Google pour enregistrer et retrouver vos séances et vos cycles, ou pour voir ceux qu'on a partagés avec vous.</p><div id="gsiBtn" style="min-height:44px"></div><p id="compteMsg" style="font-weight:700;color:#B2263A;margin:8px 0 0"></p><p style="color:#6B7280;font-size:13px;margin-bottom:0">Seuls votre nom et votre adresse e-mail Google sont conservés (aucun mot de passe).</p></div>`
  );
}
/* invitation à se connecter, à placer là où un compte est nécessaire */
const compteInvite = (t = "pour voir et enregistrer vos séances et vos cycles") =>
  `<div class="box" style="border-left:6px solid #3A8FB0"><b>Connexion requise</b> ${esc(t)}.<div style="margin-top:10px"><a class="btn" data-go="compte" style="background:#26364D;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Se connecter avec Google</a></div></div>`;
registerNav({
  sec: "MON COMPTE",
  secOrder: 8,
  order: 1,
  html: () =>
    compteOn()
      ? navBtn(
          "compte",
          AUTH.user ? esc(AUTH.user.nom) : "Se connecter",
          '<span class="ic">👤</span>'
        )
      : "",
});
registerView({
  match: v => v === "compte",
  html: () => compteView(),
  bind: () => compteBoutonGoogle(),
});
registerClick(e => {
  const b = e.target.closest("[data-compte]");
  if (!b) return;
  if (b.dataset.compte === "logout") {
    compteExpiree();
    location.hash = "#/compte";
    location.reload();
  }
  return true;
});

/* ---------- équipes ---------- */
let EQUIPES = [];
async function loadEquipes() {
  EQUIPES = [];
  if (!compteOn() || !AUTH.session) return;
  try {
    EQUIPES = (await comptePost("equipes_liste")).equipes;
  } catch (e) {
    EQUIPES = [];
  }
}
registerLoader(loadEquipes);
const equipeNom = id => (EQUIPES.find(q => q.id === id) || {}).nom || "équipe";
function equipesView() {
  const head = gsec(
    "Mes équipes",
    "Une équipe est un groupe de personnes (adresses Google). Partager une séance avec l'équipe la rend lisible par tous ses membres.",
    "<b>Comment faire ?</b><br>Créez une équipe, ajoutez les adresses Google de ses membres (une par ligne). Ensuite, dans une séance ou un cycle, choisissez « Partager » puis cette équipe."
  );
  if (!AUTH.user) return head + compteInvite("pour gérer vos équipes");
  const mes = EQUIPES.filter(q => q.owner === AUTH.user.email);
  const autres = EQUIPES.filter(q => q.owner !== AUTH.user.email);
  const carte = q =>
    `<div class="box"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b style="flex:1">👥 ${esc(q.nom)}</b><span style="color:#6B7280;font-size:13px">${q.membres.length} membre${q.membres.length > 1 ? "s" : ""}</span></div>
    <label class="sml" style="margin-top:8px">Nom de l'équipe<input data-eqf="nom" data-id="${esc(q.id)}" value="${esc(q.nom)}"></label>
    <label class="sml" style="margin-top:8px">Membres (adresses Google, une par ligne)<textarea rows="4" data-eqf="membres" data-id="${esc(q.id)}">${esc(q.membres.join("\n"))}</textarea></label>
    <div class="tools" style="margin-top:8px"><a class="btn" data-eq="save" data-id="${esc(q.id)}" style="background:#2E7D4F;color:#fff;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer;display:inline-block">Enregistrer</a><a class="btn" data-eq="del" data-id="${esc(q.id)}" style="background:#fff;color:#B2263A;border:1px solid #E8B4BC;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer;display:inline-block">🗑 Supprimer l'équipe</a></div></div>`;
  const autre = q =>
    `<div class="box" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b style="flex:1">👥 ${esc(q.nom)}</b><span style="color:#6B7280;font-size:13px">responsable : ${esc(q.ownerNom || q.owner)} · ${q.membres.length + 1} personnes</span><a class="chip" data-eq="quit" data-id="${esc(q.id)}" style="cursor:pointer">Quitter</a></div>`;
  return `${head}<div class="box" style="background:#F7F9FD"><b>Créer une équipe</b><label class="sml" style="margin-top:8px">Nom<input id="eqNouveau" placeholder="Ex. Équipe Bloc Party"></label><div class="tools" style="margin-top:8px"><a class="btn" data-eq="new" style="background:#26364D;color:#fff;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer;display:inline-block">+ Créer</a><span id="eqMsg" style="font-weight:700;color:#B2263A"></span></div></div>
  ${mes.length ? `<p class="count">Équipes dont vous êtes responsable</p>${mes.map(carte).join("")}` : ""}
  ${autres.length ? `<p class="count">Équipes dont vous êtes membre</p>${autres.map(autre).join("")}` : ""}
  ${!EQUIPES.length ? '<div class="empty">Aucune équipe pour le moment.</div>' : ""}`;
}
registerNav({
  sec: "MON COMPTE",
  secOrder: 8,
  order: 2,
  html: () =>
    compteOn() && AUTH.user
      ? navBtn(
          "equipes",
          `Mes équipes<span class="n">${EQUIPES.length || ""}</span>`,
          '<span class="ic">👥</span>'
        )
      : "",
});
registerView({ match: v => v === "equipes", html: () => equipesView() });
registerClick(e => {
  const b = e.target.closest("[data-eq]");
  if (!b) return;
  const id = b.dataset.id,
    a = b.dataset.eq;
  const rafraichir = async msg => {
    await loadEquipes();
    buildNav();
    render();
    if (msg) toast(msg);
  };
  const echec = err => toast("Échec : " + err.message);
  if (a === "new") {
    const nom = ($("#eqNouveau").value || "").trim();
    if (!nom) {
      $("#eqMsg").textContent = "Donnez un nom à l'équipe.";
      return true;
    }
    comptePost("equipe_enregistrer", { equipe: { nom, membres: [] } })
      .then(() => rafraichir("✓ Équipe créée : ajoutez ses membres."))
      .catch(echec);
  } else if (a === "save") {
    const nom = document.querySelector(`[data-eqf=nom][data-id="${id}"]`).value;
    const membres = document
      .querySelector(`[data-eqf=membres][data-id="${id}"]`)
      .value.split(/[\s,;]+/)
      .filter(Boolean);
    comptePost("equipe_enregistrer", { equipe: { id, nom, membres } })
      .then(() => rafraichir("✓ Équipe enregistrée."))
      .catch(echec);
  } else if (a === "del") {
    if (
      !confirm(
        "Supprimer cette équipe ? Les séances partagées avec elle ne seront plus visibles de ses membres."
      )
    )
      return true;
    comptePost("equipe_suppr", { id })
      .then(() => rafraichir("Équipe supprimée."))
      .catch(echec);
  } else if (a === "quit") {
    if (!confirm("Quitter cette équipe ?")) return true;
    comptePost("equipe_quitter", { id })
      .then(() => rafraichir("Vous avez quitté l'équipe."))
      .catch(echec);
  }
  return true;
});
/* ---------- partage d'une séance ou d'un cycle (par personne ou par équipe) ---------- */
let PARTAGE_OUVERT = null;
const partageListe = r =>
  String(r.partage || "")
    .split(/[,;\s]+/)
    .filter(Boolean);
function partageBloc(r) {
  if (!compteOn() || !r) return "";
  if (!compteMien(r))
    return `<div class="box noprint" style="border-left:6px solid #8A55B5;padding:8px 14px">Partagé avec vous par <b>${esc(r.ownerNom || r.owner)}</b> ${r.owner && r.ownerNom ? `<span style="color:#6B7280">(${esc(r.owner)})</span>` : ""} · lecture seule : « Utiliser comme modèle » crée votre propre copie.</div>`;
  const L = partageListe(r),
    pers = L.filter(x => !x.startsWith("team:")),
    eqs = L.filter(x => x.startsWith("team:")).map(x => x.slice(5));
  const ouvert = PARTAGE_OUVERT === r.id;
  const resume = [...eqs.map(i => "👥 " + equipeNom(i)), ...pers];
  return `<div class="box noprint" style="padding:8px 14px"><a class="chip" data-partage="toggle" data-id="${esc(r.id)}" style="cursor:pointer">👥 Partager${L.length ? " (" + L.length + ")" : ""}</a> <span style="color:#6B7280;font-size:13px">${L.length ? "Partagé avec : " + esc(resume.join(", ")) : "Privé : vous seul la voyez."}</span>${
    ouvert
      ? `<div style="margin-top:8px">${
          EQUIPES.length
            ? `<div class="sml">Équipes<div class="gchk">${EQUIPES.map(q => `<label class="fl"><input type="checkbox" data-pteam="${esc(q.id)}" ${eqs.includes(q.id) ? "checked" : ""}> ${esc(q.nom)}</label>`).join("")}</div></div>`
            : `<p style="color:#6B7280;font-size:13px;margin:0 0 6px">Pas encore d'équipe : créez-en dans « Mes équipes » pour partager avec plusieurs personnes d'un coup.</p>`
        }<label class="sml" style="margin-top:8px">Personnes (adresses Google, une par ligne)<textarea id="partageTxt" rows="4" placeholder="prenom.nom@gmail.com">${esc(pers.join("\n"))}</textarea></label><div class="tools" style="margin-top:8px"><a class="btn" data-partage="save" data-id="${esc(r.id)}" style="background:#2E7D4F;color:#fff;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer;display:inline-block">Enregistrer le partage</a><span id="partageMsg" style="font-weight:700"></span></div><p style="color:#6B7280;font-size:13px;margin:6px 0 0">Ils pourront la lire (pas la modifier) après s'être connectés avec leur adresse Google. Elle doit d'abord être enregistrée dans la bibliothèque.</p></div>`
      : ""
  }</div>`;
}
registerClick(e => {
  const b = e.target.closest("[data-partage]");
  if (!b) return;
  const id = b.dataset.id;
  if (b.dataset.partage === "toggle") {
    PARTAGE_OUVERT = PARTAGE_OUVERT === id ? null : id;
    render();
  } else if (b.dataset.partage === "save") {
    const m = $("#partageMsg");
    const liste = [
      ...[...document.querySelectorAll("[data-pteam]:checked")].map(c => "team:" + c.dataset.pteam),
      ...($("#partageTxt").value || "").split(/[\s,;]+/).filter(Boolean),
    ];
    m.style.color = "#26364D";
    m.textContent = "Enregistrement…";
    comptePost("seance_partage", { id, partage: liste })
      .then(() => {
        toast("✓ Partage enregistré.");
        return loadSeances().then(render);
      })
      .catch(err => {
        m.style.color = "#B2263A";
        m.textContent = "Échec : " + err.message;
      });
  }
  return true;
});
