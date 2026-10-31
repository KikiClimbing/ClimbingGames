/* Proposer un jeu : formulaire dans le site (remplace le formulaire Google ; le jeu arrive « en attente » dans la feuille) */
const PROP_CHAMPS = [
  { k: "Titre", req: 1, aide: "Nom courant du jeu. Si deux noms existent : « Nom 1 / Nom 2 »." },
  { k: "Famille", req: 1, t: "select", opts: () => Object.keys(FAMS) },
  {
    k: "Remplace le jeu",
    t: "select",
    vide: 1,
    opts: () => DATA.filter(g => g.Code).map(g => g.Code + " · " + g.Titre),
    aide: "Facultatif : si cette fiche doit remplacer un jeu existant, choisissez-le.",
  },
  { k: "Résumé", req: 1, aide: "Une phrase : le but du jeu." },
  {
    k: "Principe",
    req: 1,
    t: "area",
    rows: 5,
    aide: "3 à 6 phrases courtes : qui joue, ce qu'on fait, comment on gagne, quand ça s'arrête.",
  },
  { k: "Participants", req: 1, aide: "Ex. : 2 équipes de 3 à 6, binômes, groupe entier." },
  { k: "Matériel", req: 1, aide: "« Aucun » si rien." },
  { k: "Espace", aide: "Ex. : pan de mur, traversée basse." },
  { k: "Durée", req: 1, aide: "Ex. : 10 min." },
  { k: "Objectif", aide: "Ce que le jeu fait travailler, en quelques mots." },
  {
    k: "Plus facile",
    req: 1,
    t: "area",
    aide: "2 à 3 idées, une par ligne (la puce « • » est ajoutée toute seule).",
  },
  {
    k: "Plus difficile",
    req: 1,
    t: "area",
    aide: "2 à 3 idées, une par ligne (la puce « • » est ajoutée toute seule).",
  },
  { k: "Conseil", t: "area", aide: "Sécurité ou astuce d'animation, 1 à 2 phrases." },
  { k: "Voir aussi", aide: "Codes de jeux proches, séparés par des virgules (ex. E4, D11)." },
  { k: "Effectif court", aide: "Pour la vignette. Ex. : 2 équipes égales." },
  { k: "Intensité", t: "select", opts: () => ["Calme", "Modérée", "Intense"], vide: 1 },
  { k: "Objectifs (tags)", t: "tags", opts: () => OBJS },
  {
    k: "Format anniversaire",
    t: "select",
    opts: () => ["Non", "Oui"],
    aide: "Oui si le jeu convient à un anniversaire (6 à 12 enfants de 6 à 11 ans, débutants).",
  },
  { k: "Auteur", req: 1, aide: "Votre prénom." },
  { k: "Compléments", t: "area", aide: "Facultatif : listes ou tableaux utiles au jeu." },
];
const PROP = { v: {}, schemas: null, pick: false, msg: "", ok: false, busy: false };
try {
  PROP.v = JSON.parse(localStorage.getItem("propDraft") || "{}");
} catch (e) {}
const propSave = () => {
  try {
    localStorage.setItem("propDraft", JSON.stringify(PROP.v));
  } catch (e) {}
};
/* appelé par l'éditeur de schémas quand un schéma est envoyé depuis le formulaire */
function propSetSchema(url) {
  PROP.v["Schéma (lien)"] = url;
  propSave();
}
async function propSchemas() {
  try {
    const r = await fetch(CONFIG.GAME_ADD_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "schemas_liste", key: CONFIG.GAME_ADD_KEY || "" }),
    });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error);
    const used = new Set(
      DATA.map(g => (g["Schéma (lien)"] || "").split("?")[0].split("/").pop().toLowerCase())
    );
    PROP.schemas = j.schemas.filter(
      s => !used.has(s.nom.toLowerCase()) && !isEmb({ Code: s.nom.replace(/\.\w+$/, "") })
    );
  } catch (e) {
    PROP.schemas = [];
    PROP.msg = "Liste des schémas indisponible (" + e.message + ").";
  }
  render();
}
function propView() {
  const head = gsec(
    "Proposer un jeu",
    "Remplissez la fiche : elle sera relue puis publiée sur le site."
  );
  if (!CONFIG.GAME_ADD_URL)
    return (
      head +
      `<div class="box">${CONFIG.FORM_URL ? `Le formulaire intégré n'est pas activé. <a target="_blank" rel="noopener" href="${esc(CONFIG.FORM_URL)}">Ouvrir le formulaire Google ↗</a>` : "Le formulaire n'est pas activé : renseignez <b>GAME_ADD_URL</b> dans config.js."}</div>`
    );
  if (PROP.ok)
    return (
      head +
      `<div class="box" style="border-left:6px solid #2E7D4F"><b>Merci !</b> Votre jeu a été envoyé. Il sera relu avant d'apparaître sur le site.<div class="tools" style="margin-top:10px"><a class="btn" data-pr="again" style="background:#26364D;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Proposer un autre jeu</a></div></div>`
    );
  const v = PROP.v;
  if (!v.Auteur && typeof AUTH !== "undefined" && AUTH.user) v.Auteur = AUTH.user.nom;
  const champ = f => {
    const val = v[f.k] || "";
    const lab = `${esc(f.k)}${f.req ? ' <span style="color:#B2263A">*</span>' : ""}${f.aide ? `<span style="font-weight:400;color:#6B7280"> — ${esc(f.aide)}</span>` : ""}`;
    if (f.t === "select")
      return `<label class="sml">${lab}<select data-pf="${esc(f.k)}">${f.vide ? '<option value=""></option>' : ""}${f
        .opts()
        .map(o => `<option ${val === o ? "selected" : ""}>${esc(o)}</option>`)
        .join("")}</select></label>`;
    if (f.t === "tags") {
      const sel = val.split(/,\s*/);
      return `<div class="sml" style="grid-column:1/-1">${lab}<div class="gchk">${f
        .opts()
        .map(
          o =>
            `<label class="fl"><input type="checkbox" data-pt="${esc(f.k)}" value="${esc(o)}" ${sel.includes(o) ? "checked" : ""}> ${esc(o)}</label>`
        )
        .join("")}</div></div>`;
    }
    if (f.t === "area")
      return `<label class="sml" style="grid-column:1/-1">${lab}<textarea rows="${f.rows || 3}" data-pf="${esc(f.k)}">${esc(val)}</textarea></label>`;
    return `<label class="sml">${lab}<input data-pf="${esc(f.k)}" value="${esc(val)}"></label>`;
  };
  const F = FAMS[v.Famille] || FAMS[Object.keys(FAMS)[0]];
  const theme = `--l:${F.l};--m:${F.m};--d:${F.d};--a:${F.a}`;
  const GROUPES = [
    ["L'ESSENTIEL", ["Titre", "Famille", "Remplace le jeu", "Résumé", "Principe"]],
    [
      "ORGANISATION",
      ["Participants", "Matériel", "Espace", "Durée", "Effectif court", "Intensité"],
    ],
    ["OBJECTIFS", ["Objectif", "Objectifs (tags)", "Format anniversaire"]],
  ];
  const par = k => PROP_CHAMPS.find(f => f.k === k);
  const groupe = ([t, ks]) =>
    `<div class="pgrp" style="${theme}"><h3>${t}</h3><div class="smg">${ks.map(k => champ(par(k))).join("")}</div></div>`;
  const ta = k =>
    `<textarea rows="4" data-pf="${k}" style="width:100%;padding:8px;border:1px solid #d5dae5;border-radius:6px;font:inherit;background:#fff">${esc(v[k] || "")}</textarea>`;
  const variantes = `<div class="pgrp" style="${theme}"><h3>VARIANTES</h3><div class="pvar"><div class="pfac"><h4>− PLUS FACILE <span style="color:#B2263A">*</span></h4>${ta("Plus facile")}</div><div class="pdif"><h4>+ PLUS DIFFICILE <span style="color:#B2263A">*</span></h4>${ta("Plus difficile")}</div></div><p style="margin:6px 0 0;color:#6B7280;font-size:13px">2 à 3 idées par colonne, une par ligne : la puce « • » est ajoutée toute seule.</p></div>`;
  const fin = `<div class="pgrp" style="${theme}"><h3>CONSEIL ET COMPLÉMENTS</h3><div class="smg">${["Conseil", "Voir aussi", "Compléments", "Auteur"].map(k => champ(par(k))).join("")}</div></div>`;
  const lien = v["Schéma (lien)"] || "";
  const prev = lien
    ? `<img src="${esc(driveImg(lien))}" alt="Schéma" style="display:block;max-width:100%;max-height:260px;margin-top:8px;border:1px solid #D5DAE5;border-radius:8px;background:#fff" onerror="this.remove()">`
    : "";
  const choix = !PROP.pick
    ? ""
    : !PROP.schemas
      ? `<div class="box">Chargement des schémas…</div>`
      : `<div class="box" style="background:#F7F9FD"><b>Schémas disponibles</b> <span style="color:#6B7280;font-size:13px">(non utilisés par un jeu)</span> <a class="chip" data-pr="pickoff" style="cursor:pointer;float:right">Fermer</a><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:10px;max-height:320px;overflow:auto">${PROP.schemas.map(s => `<a data-pr="pickset" data-u="${esc(s.url)}" style="cursor:pointer;display:block;border:1px solid #EE9F83;border-radius:8px;padding:5px;background:#fff"><img loading="lazy" src="${esc(s.url)}" alt="" style="width:100%;aspect-ratio:3/1.4;object-fit:contain"><div style="font-size:11px;word-break:break-all">${esc(s.nom)}</div></a>`).join("") || '<span style="color:#6B7280">Aucun schéma disponible.</span>'}</div></div>`;
  const msg = PROP.msg ? `<p style="font-weight:700;color:#B2263A">${esc(PROP.msg)}</p>` : "";
  return (
    head +
    `<div class="box">${groupe(GROUPES[0])}${groupe(GROUPES[1])}${groupe(GROUPES[2])}${variantes}${fin}<div class="pgrp" style="${theme}"><h3>SCHÉMA</h3>
    <div class="sml" style="grid-column:1/-1">Schéma <span style="font-weight:400;color:#6B7280"> — facultatif : dessinez-le, ou choisissez-en un déjà envoyé</span>
      <div class="tools" style="margin:6px 0"><a class="btn" data-pr="draw" style="background:#26364D;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">✏ Dessiner un schéma</a><a class="btn" data-pr="pick" style="background:#EEF1F8;color:#26364D;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">🖼 Choisir un schéma existant</a>${lien ? `<a class="chip" data-pr="nolink" style="cursor:pointer">Retirer</a>` : ""}</div>
      <input data-pf="Schéma (lien)" value="${esc(lien)}" placeholder="ou collez ici le lien d'une image">${prev}</div></div>${choix}
    ${msg}<div class="tools" style="margin-top:14px"><a class="btn" data-pr="send" style="background:#2E7D4F;color:#fff;border-radius:8px;padding:10px 20px;font-weight:700;cursor:pointer;display:inline-block">${PROP.busy ? "Envoi…" : "Envoyer ma proposition"}</a><span style="color:#6B7280;font-size:14px">Votre brouillon est gardé dans ce navigateur.</span></div></div>`
  );
}
async function propEnvoyer() {
  const v = PROP.v;
  PROP_CHAMPS.forEach(f => {
    if (f.t === "select" && !f.vide && !v[f.k])
      v[f.k] = f.opts()[0]; /* valeur affichée par défaut */
  });
  const manque = PROP_CHAMPS.filter(f => f.req && !String(v[f.k] || "").trim()).map(f => f.k);
  if (manque.length) {
    PROP.msg = "À compléter : " + manque.join(", ") + ".";
    render();
    return;
  }
  if (v["Remplace le jeu"]) v["Remplace le jeu"] = v["Remplace le jeu"].split(" · ")[0];
  PROP.busy = true;
  PROP.msg = "";
  render();
  try {
    const r = await fetch(CONFIG.GAME_ADD_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ key: CONFIG.GAME_ADD_KEY || "", action: "jeu", jeu: v }),
    });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "refusé");
    PROP.v = {};
    propSave();
    PROP.ok = true;
  } catch (e) {
    PROP.msg = "Échec de l'envoi (" + e.message + "). Votre brouillon est conservé.";
  }
  PROP.busy = false;
  render();
}
registerView({
  match: v => v === "proposer",
  html: () => propView(),
  bind: () => {
    document.querySelectorAll("[data-pf]").forEach(i => {
      i.addEventListener("input", () => {
        PROP.v[i.dataset.pf] = i.value;
        propSave();
      });
      if (["Schéma (lien)", "Famille"].includes(i.dataset.pf)) i.addEventListener("change", render);
    });
    document.querySelectorAll("[data-pt]").forEach(i =>
      i.addEventListener("change", () => {
        PROP.v[i.dataset.pt] = [...document.querySelectorAll("[data-pt]")]
          .filter(x => x.checked)
          .map(x => x.value)
          .join(", ");
        propSave();
      })
    );
  },
});
registerClick(e => {
  const b = e.target.closest("[data-pr]");
  if (!b) return;
  const a = b.dataset.pr;
  if (a === "send") propEnvoyer();
  else if (a === "again") {
    PROP.ok = false;
    render();
  } else if (a === "pick") {
    PROP.pick = true;
    if (!PROP.schemas) propSchemas();
    else render();
  } else if (a === "pickoff") {
    PROP.pick = false;
    render();
  } else if (a === "pickset") {
    PROP.v["Schéma (lien)"] = b.dataset.u;
    propSave();
    PROP.pick = false;
    render();
  } else if (a === "nolink") {
    delete PROP.v["Schéma (lien)"];
    propSave();
    render();
  } else if (a === "draw") {
    ED.ctx = null;
    ED.back = "proposer";
    PROP.schemas = null;
    go("editeur");
  }
  return true;
});
