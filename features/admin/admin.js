/* Administration : relire, corriger, valider ou refuser les jeux proposés (protégé par mot de passe) */
const ADM = {
  pw: "",
  list: null,
  cols: [],
  open: new Set(),
  msg: "",
  busy: false,
  tous: false,
  q: "",
};
try {
  ADM.pw = sessionStorage.getItem("admPw") || "";
} catch (e) {}
const ADM_LONGS = [
  "Principe",
  "Plus facile",
  "Plus difficile",
  "Conseil",
  "Compléments",
  "Objectif",
];
const ADM_MASQUES = ["Horodateur", "Publié"];
async function admPost(action, extra) {
  if (!CONFIG.GAME_ADD_URL) throw new Error("GAME_ADD_URL absent de config.js");
  const r = await fetch(CONFIG.GAME_ADD_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, admin: ADM.pw, ...extra }),
  });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || "refusé");
  return j;
}
/* code proposé : lettre(s) de la famille + numéro suivant (ex. E12) */
function admCodeSuggere(fam) {
  const m = {};
  let max = 0;
  DATA.filter(g => g.Famille === fam).forEach(g => {
    const x = String(g.Code || "").match(/^([A-Za-z]+)(\d+)$/);
    if (x) {
      m[x[1]] = (m[x[1]] || 0) + 1;
      max = Math.max(max, +x[2]);
    }
  });
  const pre = Object.keys(m).sort((a, b) => m[b] - m[a])[0] || (fam || "X").charAt(0).toUpperCase();
  const pris = new Set(DATA.map(g => g.Code));
  let n = DATA.filter(g => String(g.Code || "").startsWith(pre)).reduce(
    (a, g) => Math.max(a, +String(g.Code).slice(pre.length) || 0),
    0
  );
  while (pris.has(pre + ++n));
  return pre + n;
}
async function admCharger() {
  ADM.busy = true;
  ADM.msg = "Chargement…";
  render();
  try {
    const j = await admPost("admin_liste", { tous: ADM.tous });
    ADM.list = j.jeux.map(g => ({ ...g, orig: g.valeurs.Titre }));
    ADM.cols = j.colonnes;
    ADM.msg = "";
    try {
      sessionStorage.setItem("admPw", ADM.pw);
    } catch (e) {}
  } catch (e) {
    ADM.list = null;
    ADM.msg = "Échec : " + e.message;
    if (/administrateur/.test(e.message)) ADM.pw = "";
  }
  ADM.busy = false;
  render();
}
function admView() {
  const head = gsec(
    "Administration des jeux",
    "Relisez, corrigez, publiez ou retirez les jeux, sans ouvrir la feuille Google. Réservé à l'administrateur."
  );
  const msg = ADM.msg ? `<p style="font-weight:700;color:#B2263A">${esc(ADM.msg)}</p>` : "";
  if (!CONFIG.GAME_ADD_URL)
    return (
      head +
      `<div class="box">Renseignez <b>GAME_ADD_URL</b> dans config.js pour activer cette page.</div>`
    );
  if (!ADM.pw || !ADM.list)
    return (
      head +
      `<div class="box" style="max-width:420px"><label class="sml">Mot de passe administrateur<input type="password" id="admPw" autocomplete="current-password"></label><div style="margin-top:10px"><a class="btn" data-adm="login" style="background:#26364D;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Se connecter</a></div>${msg}</div>`
    );
  const q = norm(ADM.q);
  const visibles = ADM.list.filter(
    g =>
      !q ||
      norm(
        [g.valeurs.Titre, g.valeurs.Code, g.valeurs.Famille, g.valeurs.Auteur].join(" ")
      ).includes(q)
  );
  const cartes = visibles
    .map(g => {
      const v = g.valeurs,
        ouvert = ADM.open.has(g.ligne);
      if (!v.Code && ouvert) v.Code = admCodeSuggere(v.Famille);
      const champs = ADM.cols
        .filter(c => !ADM_MASQUES.includes(c))
        .map(c =>
          ADM_LONGS.includes(c)
            ? `<label class="sml" style="grid-column:1/-1">${esc(c)}<textarea rows="${c === "Principe" ? 5 : 3}" data-af="${esc(c)}" data-l="${g.ligne}">${esc(v[c])}</textarea></label>`
            : `<label class="sml">${esc(c)}<input data-af="${esc(c)}" data-l="${g.ligne}" value="${esc(v[c])}"></label>`
        )
        .join("");
      return `<div class="box"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b style="flex:1">${esc(v.Code ? v.Code + " · " : "")}${esc(v.Titre)}${g.publie ? ' <span style="color:#2E7D4F;font-size:12px">● publié</span>' : ' <span style="color:#B2543A;font-size:12px">● en attente</span>'}</b><span style="color:#6B7280;font-size:13px">${esc(v.Famille || "")} · ${esc(v.Auteur || "")} · ${esc(v.Horodateur || "")}</span><a class="chip" data-adm="open" data-l="${g.ligne}" style="cursor:pointer">${ouvert ? "Fermer" : "Relire / modifier"}</a></div>
      ${ouvert ? `<div class="smg" style="margin-top:10px">${champs}</div><div class="tools" style="margin-top:10px">${g.publie ? "" : `<a class="btn" data-adm="pub" data-l="${g.ligne}" style="background:#2E7D4F;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">✓ Valider et publier</a>`}<a class="btn" data-adm="save" data-l="${g.ligne}" style="background:#EEF1F8;color:#26364D;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">${g.publie ? "Enregistrer les modifications" : "Enregistrer sans publier"}</a>${g.publie ? `<a class="btn" data-adm="unpub" data-l="${g.ligne}" style="background:#fff;color:#B2543A;border:1px solid #E8B4BC;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Retirer du site</a>` : `<a class="btn" data-adm="no" data-l="${g.ligne}" style="background:#fff;color:#B2263A;border:1px solid #E8B4BC;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Refuser</a>`}</div>` : ""}</div>`;
    })
    .join("");
  return (
    head +
    `<div class="tools"><div class="seg"><button data-adm="mode" data-m="0" class="${ADM.tous ? "" : "on"}">En attente</button><button data-adm="mode" data-m="1" class="${ADM.tous ? "on" : ""}">Tous les jeux</button></div><input class="search" id="admq" type="search" placeholder="Rechercher (code, titre, auteur)…" value="${esc(ADM.q)}" style="max-width:300px"><a class="chip" data-adm="reload" style="cursor:pointer">↻ Actualiser</a><a class="chip" data-adm="logout" style="cursor:pointer">Se déconnecter</a></div>${msg}<p class="count">${visibles.length} jeu${visibles.length > 1 ? "x" : ""}${ADM.tous ? "" : " en attente"}</p>${cartes || '<div class="empty">Aucun jeu.</div>'}<p style="color:#6B7280;font-size:14px">Un jeu validé apparaît dans le catalogue après la mise à jour de la feuille publiée (quelques minutes). Une puce « • » est ajoutée automatiquement devant chaque ligne de « Plus facile » et « Plus difficile ».</p>`
  );
}
registerView({
  match: v => v === "attente",
  html: () => admView(),
  bind: () => {
    document.querySelectorAll("[data-af]").forEach(i =>
      i.addEventListener("input", () => {
        const g = ADM.list.find(x => x.ligne === +i.dataset.l);
        if (g) g.valeurs[i.dataset.af] = i.value;
      })
    );
    const aq = $("#admq");
    if (aq)
      aq.addEventListener("input", () => {
        ADM.q = aq.value;
        render();
        const n = $("#admq");
        n.focus();
        n.setSelectionRange(n.value.length, n.value.length);
      });
    const pw = $("#admPw");
    if (pw)
      pw.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          ADM.pw = pw.value;
          admCharger();
        }
      });
  },
});
registerNav({
  sec: "ADMINISTRATION",
  secOrder: 50,
  order: 1,
  html: () => navBtn("attente", "Gérer les jeux", '<span class="ic">✓</span>'),
});
registerClick(e => {
  const b = e.target.closest("[data-adm]");
  if (!b) return;
  const a = b.dataset.adm,
    l = +b.dataset.l;
  const g = ADM.list && ADM.list.find(x => x.ligne === l);
  if (a === "login") {
    ADM.pw = ($("#admPw") || {}).value || "";
    admCharger();
  } else if (a === "logout") {
    ADM.pw = "";
    ADM.list = null;
    try {
      sessionStorage.removeItem("admPw");
    } catch (x) {}
    render();
  } else if (a === "reload") admCharger();
  else if (a === "mode") {
    ADM.tous = b.dataset.m === "1";
    ADM.open.clear();
    admCharger();
  } else if (a === "open") {
    ADM.open.has(l) ? ADM.open.delete(l) : ADM.open.add(l);
    render();
  } else if (g && (a === "pub" || a === "save" || a === "no" || a === "unpub")) {
    if (ADM.busy) return true;
    if (
      a === "unpub" &&
      !confirm("Retirer « " + g.valeurs.Titre + " » du site ? Il repassera en attente.")
    )
      return true;
    if (a === "no" && !confirm("Refuser « " + g.valeurs.Titre + " » ? Il ne sera pas publié."))
      return true;
    if (a === "pub" && !g.valeurs.Code && !confirm("Ce jeu n'a pas de code. Publier quand même ?"))
      return true;
    ADM.busy = true;
    const orig = g.orig;
    const req =
      a === "no"
        ? admPost("admin_refuser", { ligne: l, titreAvant: orig })
        : admPost("admin_enregistrer", {
            ligne: l,
            titreAvant: orig,
            valeurs: g.valeurs,
            publier: a === "pub",
            retirer: a === "unpub",
          });
    req
      .then(async () => {
        toast(
          a === "pub"
            ? "✓ Jeu publié."
            : a === "no"
              ? "Jeu refusé."
              : a === "unpub"
                ? "Jeu retiré du site."
                : "✓ Modifications enregistrées."
        );
        ADM.busy = false;
        ADM.open.delete(l);
        await admCharger();
      })
      .catch(x => {
        ADM.busy = false;
        toast("Échec : " + x.message);
      });
  }
  return true;
});
