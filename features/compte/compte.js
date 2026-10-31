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
    "Le compte sert à enregistrer vos séances et vos cycles et à les partager. Les jeux restent accessibles à tous."
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

/* ---------- partage d'une séance ou d'un cycle (par personne) ---------- */
let PARTAGE_OUVERT = null;
const partageListe = r =>
  String(r.partage || "")
    .split(/[,;\s]+/)
    .filter(Boolean);
function partageBloc(r) {
  if (!compteOn() || !r) return "";
  if (!compteMien(r))
    return `<div class="box noprint" style="border-left:6px solid #8A55B5;padding:8px 14px">Partagé avec vous par <b>${esc(r.ownerNom || r.owner)}</b> ${r.owner && r.ownerNom ? `<span style="color:#6B7280">(${esc(r.owner)})</span>` : ""} · lecture seule : « Utiliser comme modèle » crée votre propre copie.</div>`;
  const L = partageListe(r);
  const ouvert = PARTAGE_OUVERT === r.id;
  return `<div class="box noprint" style="padding:8px 14px"><a class="chip" data-partage="toggle" data-id="${esc(r.id)}" style="cursor:pointer">👥 Partager${L.length ? " (" + L.length + ")" : ""}</a> <span style="color:#6B7280;font-size:13px">${L.length ? "Partagé avec : " + esc(L.join(", ")) : "Privé : vous seul la voyez."}</span>${
    ouvert
      ? `<div style="margin-top:8px"><label class="sml">Adresses Google des personnes (une par ligne)<textarea id="partageTxt" rows="4" placeholder="prenom.nom@gmail.com">${esc(L.join("\n"))}</textarea></label><div class="tools" style="margin-top:8px"><a class="btn" data-partage="save" data-id="${esc(r.id)}" style="background:#2E7D4F;color:#fff;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer;display:inline-block">Enregistrer le partage</a><span id="partageMsg" style="font-weight:700"></span></div><p style="color:#6B7280;font-size:13px;margin:6px 0 0">Ces personnes pourront la lire (pas la modifier) après s'être connectées avec cette adresse. La séance doit d'abord être enregistrée dans la bibliothèque.</p></div>`
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
    const liste = ($("#partageTxt").value || "").split(/[\s,;]+/).filter(Boolean);
    m.style.color = "#26364D";
    m.textContent = "Enregistrement…";
    comptePost("seance_partage", { id, partage: liste })
      .then(j => {
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
