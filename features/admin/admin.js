/* Administration : relire, corriger, valider ou refuser les jeux proposés (protégé par mot de passe) */
const ADM = {
  schemas: null,
  pick: null,
  sf: "libres",
  tab: "jeux",
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
function admPrefixe(fam) {
  const m = {};
  DATA.filter(g => g.Famille === fam).forEach(g => {
    const x = String(g.Code || "").match(/^([A-Za-z]+)\d+$/);
    if (x) m[x[1]] = (m[x[1]] || 0) + 1;
  });
  return Object.keys(m).sort((a, b) => m[b] - m[a])[0] || (fam || "X").charAt(0).toUpperCase();
}
/* `extra` : autres noms déjà pris (ex. fichiers du dossier schemas/) */
function admCodeSuggere(fam, extra) {
  const pre = admPrefixe(fam).toLowerCase();
  const pris = new Set(
    [
      ...DATA.map(g => g.Code),
      ...(ADM.list || []).map(g => g.valeurs.Code),
      ...(ADM.schemas || []).map(s => s.nom.replace(/\.\w+$/, "")),
      ...(extra || []),
    ]
      .filter(Boolean)
      .map(x => String(x).toLowerCase())
  );
  let n = 0;
  pris.forEach(c => {
    const k = c.startsWith(pre) ? c.slice(pre.length) : "";
    if (/^\d+$/.test(k)) n = Math.max(n, +k);
  });
  while (pris.has(pre + ++n));
  return admPrefixe(fam) + n;
}
/* code d'un jeu sans code : on reprend le nom de son schéma s'il suit déjà la règle (ex. E13.png) */
function admCodeDuJeu(v) {
  const b = String(v["Schéma (lien)"] || "")
    .split("?")[0]
    .split("/")
    .pop()
    .replace(/\.\w+$/, "");
  const pre = admPrefixe(v.Famille);
  const autres = [
    ...DATA.map(g => g.Code),
    ...(ADM.list || []).filter(g => g.valeurs !== v).map(g => g.valeurs.Code),
  ].map(x => String(x || "").toLowerCase());
  if (new RegExp("^" + pre + "\\d+$", "i").test(b) && !autres.includes(b.toLowerCase())) return b;
  return admCodeSuggere(v.Famille);
}
/* changement de famille : le code (donc le nom du schéma) suit la nouvelle famille */
function admFamChange(v, publie) {
  if (isEmb(v) || publie) return;
  const pre = admPrefixe(v.Famille);
  if (!new RegExp("^" + pre + "\\d+$").test(v.Code || "")) v.Code = admCodeSuggere(v.Famille);
}
async function admCharger() {
  ADM.busy = true;
  ADM.msg = "Chargement…";
  render();
  try {
    const j = await admPost("admin_liste", { tous: ADM.tous });
    ADM.list = j.jeux.map(g => ({ ...g, orig: g.valeurs.Titre, codeAvant: g.valeurs.Code || "" }));
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
/* ---------- bibliothèque de schémas (dossier schemas/ du dépôt) ---------- */
const admBase = u =>
  String(u || "")
    .split("?")[0]
    .split("/")
    .pop()
    .toLowerCase();
/* nom de fichier → codes des jeux qui l'utilisent */
function admUtilises() {
  const m = new Map();
  const add = (u, qui) => {
    const b = admBase(u);
    if (b) m.set(b, (m.get(b) || []).concat(qui));
  };
  DATA.forEach(g => {
    if (isEmb(g)) add(g.Code + ".webp", g.Code);
    add(g["Schéma (lien)"] || g["Schéma"], g.Code || g.Titre);
  });
  (ADM.list || []).forEach(g => add(g.valeurs["Schéma (lien)"], g.valeurs.Code || g.valeurs.Titre));
  return m;
}
async function admChargerSchemas() {
  try {
    ADM.schemas = (await admPost("admin_schemas")).schemas;
  } catch (e) {
    ADM.schemas = [];
    ADM.msg = "Schémas : " + e.message;
  }
  render();
}
function admSchemasTries() {
  const u = admUtilises();
  return (ADM.schemas || [])
    .map(s => ({ ...s, qui: [...new Set(u.get(s.nom.toLowerCase()) || [])] }))
    .sort((a, b) => (a.qui.length > 0) - (b.qui.length > 0) || a.nom.localeCompare(b.nom));
}
function schemasHTML() {
  if (!ADM.schemas) {
    admChargerSchemas();
    return `<div class="box">Chargement des schémas…</div>`;
  }
  const tous = admSchemasTries(),
    libres = tous.filter(s => !s.qui.length);
  const L = ADM.sf === "libres" ? libres : tous;
  const carte = s =>
    `<div class="box" style="margin:0;padding:8px"><img loading="lazy" src="${esc(s.url)}" alt="" style="width:100%;aspect-ratio:3/1.1;object-fit:contain;background:#fff;border:1px solid #E3E8F2;border-radius:6px"><div style="font-size:13px;font-weight:700;margin-top:6px;word-break:break-all">${esc(s.nom)}</div><div style="font-size:12px;color:${s.qui.length ? "#2E7D4F" : "#B2543A"}">${s.qui.length ? "● utilisé : " + esc(s.qui.join(", ")) : "● non associé à un jeu"}</div>${s.source ? `<a class="chip" data-adm="schedit" data-n="${esc(s.nom)}" style="cursor:pointer;margin-top:6px;display:inline-block">✏ Modifier</a>` : `<div style="font-size:11px;color:#6B7280;margin-top:4px">pas de dessin source</div>`}</div>`;
  return `<div class="tools"><div class="seg"><button data-adm="sf" data-m="libres" class="${ADM.sf === "libres" ? "on" : ""}">Non associés (${libres.length})</button><button data-adm="sf" data-m="tous" class="${ADM.sf === "tous" ? "on" : ""}">Tous (${tous.length})</button></div><a class="chip" data-adm="schreload" style="cursor:pointer">↻ Actualiser</a></div>
  <p style="color:#6B7280;font-size:14px">Les schémas envoyés depuis « Dessiner un schéma » arrivent ici. Pour en associer un à un jeu : onglet « Gérer les jeux », ouvrez le jeu puis « Choisir un schéma existant ». « Utilisé » compare avec les jeux publiés et les jeux chargés dans l'onglet « Gérer les jeux ».</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px">${L.map(carte).join("") || '<div class="empty">Aucun schéma.</div>'}</div>`;
}
/* sélecteur de schéma dans la fiche d'un jeu */
function schemaPicker(g) {
  if (ADM.pick !== g.ligne) return "";
  if (!ADM.schemas) {
    admChargerSchemas();
    return `<div class="box">Chargement des schémas…</div>`;
  }
  const L = admSchemasTries();
  return `<div class="box" style="background:#F7F9FD"><b>Choisir un schéma</b> <span style="color:#6B7280;font-size:13px">(les non associés d'abord)</span> <a class="chip" data-adm="pickoff" style="cursor:pointer;float:right">Fermer</a><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:10px;max-height:340px;overflow:auto">${L.map(s => `<a data-adm="pickset" data-l="${g.ligne}" data-u="${esc(s.url)}" style="cursor:pointer;display:block;border:1px solid ${s.qui.length ? "#E3E8F2" : "#EE9F83"};border-radius:8px;padding:5px;background:#fff"><img loading="lazy" src="${esc(s.url)}" alt="" style="width:100%;aspect-ratio:3/1.4;object-fit:contain"><div style="font-size:11px;word-break:break-all">${esc(s.nom)}</div><div style="font-size:11px;color:${s.qui.length ? "#6B7280" : "#B2543A"}">${s.qui.length ? "utilisé : " + esc(s.qui.join(", ")) : "non associé"}</div></a>`).join("")}</div></div>`;
}
/* aperçu du schéma du jeu pour valider en connaissance de cause */
function schemaApercu(v) {
  const src = isEmb(v)
    ? "schemas/" + v.Code + ".webp"
    : driveImg(v["Schéma (lien)"] || v["Schéma"]);
  return src
    ? `<div style="margin-top:10px"><b style="font-size:12px;color:#6B7280">SCHÉMA</b><img src="${esc(src)}" alt="Schéma" style="display:block;max-width:100%;max-height:340px;margin-top:4px;border:1px solid #D5DAE5;border-radius:8px;background:#fff" onerror="this.outerHTML='<p style=&quot;color:#B2263A;margin:6px 0&quot;>Le schéma ne se charge pas : vérifiez le lien dans « Schéma (lien) ».</p>'"></div>`
    : `<p style="color:#6B7280;margin:10px 0 0">Aucun schéma pour ce jeu.</p>`;
}
function admView() {
  const head = gsec(
    "Administration",
    "Gestion des jeux et documentation technique. Réservé à l'administrateur."
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
      if (!v.Code && ouvert) v.Code = admCodeDuJeu(v);
      const champs = ADM.cols
        .filter(c => !ADM_MASQUES.includes(c))
        .map(c =>
          c === "Code"
            ? `<label class="sml">Code (automatique)<input data-af="Code" data-l="${g.ligne}" value="${esc(v.Code)}" readonly style="background:#F1F3F8;color:#6B7280;cursor:not-allowed" title="Le code est attribué automatiquement selon la famille ; il ne se modifie pas à la main."></label>`
            : c === "Famille" && !isEmb(v)
              ? `<label class="sml">Famille<select data-af="Famille" data-l="${g.ligne}">${[...new Set([...Object.keys(FAMS), v.Famille].filter(Boolean))].map(f => `<option ${f === v.Famille ? "selected" : ""}>${esc(f)}</option>`).join("")}</select></label>`
              : ADM_LONGS.includes(c)
                ? `<label class="sml" style="grid-column:1/-1">${esc(c)}<textarea rows="${c === "Principe" ? 5 : 3}" data-af="${esc(c)}" data-l="${g.ligne}">${esc(v[c])}</textarea></label>`
                : `<label class="sml">${esc(c)}<input data-af="${esc(c)}" data-l="${g.ligne}" value="${esc(v[c])}"></label>`
        )
        .join("");
      return `<div class="box"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b style="flex:1">${esc(v.Code ? v.Code + " · " : "")}${esc(v.Titre)}${g.publie ? ' <span style="color:#2E7D4F;font-size:12px">● publié</span>' : ' <span style="color:#B2543A;font-size:12px">● en attente</span>'}</b><span style="color:#6B7280;font-size:13px">${esc(v.Famille || "")} · ${esc(v.Auteur || "")} · ${esc(v.Horodateur || "")}</span><a class="chip" data-adm="open" data-l="${g.ligne}" style="cursor:pointer">${ouvert ? "Fermer" : "Relire / modifier"}</a></div>
      ${ouvert ? `${schemaApercu(v)}${schemaPicker(g)}<div class="smg" style="margin-top:10px">${champs}</div><div class="tools" style="margin-top:10px">${g.publie ? "" : `<a class="btn" data-adm="pub" data-l="${g.ligne}" style="background:#2E7D4F;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">✓ Valider et publier</a>`}${isEmb(v) ? "" : `<a class="btn" data-adm="pick" data-l="${g.ligne}" style="background:#EEF1F8;color:#26364D;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">🖼 Choisir un schéma existant</a>`}${v.Code && !isEmb(v) ? `<a class="btn" data-adm="schema" data-l="${g.ligne}" style="background:#EEF1F8;color:#26364D;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">✏ Dessiner / modifier le schéma</a>` : ""}<a class="btn" data-adm="save" data-l="${g.ligne}" style="background:#EEF1F8;color:#26364D;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">${g.publie ? "Enregistrer les modifications" : "Enregistrer sans publier"}</a>${g.publie ? `<a class="btn" data-adm="unpub" data-l="${g.ligne}" style="background:#fff;color:#B2543A;border:1px solid #E8B4BC;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Retirer du site</a>` : `<a class="btn" data-adm="no" data-l="${g.ligne}" style="background:#fff;color:#B2263A;border:1px solid #E8B4BC;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Refuser</a>`}</div>` : ""}</div>`;
    })
    .join("");
  const onglets = `<div class="tools"><div class="seg"><button data-adm="tab" data-t="jeux" class="${ADM.tab === "jeux" ? "on" : ""}">Gérer les jeux</button><button data-adm="tab" data-t="schemas" class="${ADM.tab === "schemas" ? "on" : ""}">Schémas</button><button data-adm="tab" data-t="doc" class="${ADM.tab === "doc" ? "on" : ""}">Documentation</button></div><span class="grow" style="flex:1"></span><a class="chip" data-adm="logout" style="cursor:pointer">Se déconnecter</a></div>`;
  if (ADM.tab === "doc") return head + onglets + docHTML();
  if (ADM.tab === "schemas") return head + onglets + msg + schemasHTML();
  return (
    head +
    onglets +
    `<div class="tools"><div class="seg"><button data-adm="mode" data-m="0" class="${ADM.tous ? "" : "on"}">En attente</button><button data-adm="mode" data-m="1" class="${ADM.tous ? "on" : ""}">Tous les jeux</button></div><input class="search" id="admq" type="search" placeholder="Rechercher (code, titre, auteur)…" value="${esc(ADM.q)}" style="max-width:300px"><a class="chip" data-adm="reload" style="cursor:pointer">↻ Actualiser</a></div>${msg}<p class="count">${visibles.length} jeu${visibles.length > 1 ? "x" : ""}${ADM.tous ? "" : " en attente"}</p>${cartes || '<div class="empty">Aucun jeu.</div>'}<p style="color:#6B7280;font-size:14px">Un jeu validé apparaît dans le catalogue après la mise à jour de la feuille publiée (quelques minutes). Une puce « • » est ajoutée automatiquement devant chaque ligne de « Plus facile » et « Plus difficile ».</p>`
  );
}
registerView({
  match: v => ["admin", "attente", "doc"].includes(v),
  html: () => admView(),
  bind: () => {
    document.querySelectorAll("[data-af]").forEach(i =>
      i.addEventListener("input", () => {
        const g = ADM.list.find(x => x.ligne === +i.dataset.l);
        if (g) {
          g.valeurs[i.dataset.af] = i.value;
          if (i.dataset.af === "Famille") {
            const avant = g.valeurs.Code;
            admFamChange(g.valeurs, g.publie);
            if (g.valeurs.Code !== avant) toast("Code du jeu : " + g.valeurs.Code);
            render();
          }
        }
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
  html: () => navBtn("admin", "Administration", '<span class="ic">⚙</span>'),
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
    ADM.tab = "jeux";
    DOCMD = null;
    try {
      sessionStorage.removeItem("admPw");
    } catch (x) {}
    render();
  } else if (a === "schema" && g) {
    const lien = String(g.valeurs["Schéma (lien)"] || "");
    edOuvrirPourJeu({
      code: g.valeurs.Code,
      nom: /\/schemas\//.test(lien)
        ? lien
            .split("?")[0]
            .split("/")
            .pop()
            .replace(/\.\w+$/, "")
        : "",
      fam: g.valeurs.Famille,
      titre: g.valeurs.Titre,
      ligne: g.ligne,
      orig: g.orig,
    });
  } else if (a === "schedit") {
    const base = b.dataset.n.replace(/\.\w+$/, "");
    edOuvrirPourJeu({ code: base, nom: base, titre: "", fichier: true });
  } else if (a === "sf") {
    ADM.sf = b.dataset.m;
    render();
  } else if (a === "schreload") {
    ADM.schemas = null;
    render();
  } else if (a === "pick") {
    ADM.pick = l;
    render();
  } else if (a === "pickoff") {
    ADM.pick = null;
    render();
  } else if (a === "pickset" && g) {
    g.valeurs["Schéma (lien)"] = b.dataset.u;
    ADM.pick = null;
    toast("Schéma choisi : pensez à « Enregistrer » le jeu.");
    render();
  } else if (a === "tab") {
    ADM.tab = b.dataset.t;
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
