/* Séances enregistrées dans l'application : base de données (onglet « Séances » de la feuille Google) */
let SEANCES = []; /* séances publiées, lues dans la feuille */
const LS_SB = "seancesEnregistrees" + compteSuffixe();
const sbLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_SB) || "[]");
  } catch (e) {
    return [];
  }
};
function toast(t) {
  let el = $("#toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    document.body.appendChild(el);
  }
  el.textContent = t;
  el.classList.add("on");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove("on"), 4500);
}
async function loadSeances() {
  if (compteOn()) {
    /* avec comptes : seules les séances de l'utilisateur et celles partagées avec lui, par le serveur */
    SEANCES = [];
    if (!AUTH.session) return;
    try {
      SEANCES = (await comptePost("seances_liste")).seances.filter(x => x.id);
    } catch (e) {
      SEANCES = [];
    }
    return;
  }
  if (!CONFIG.SEANCES_CSV_URL) return;
  try {
    const r = await fetch(CONFIG.SEANCES_CSV_URL, { cache: "no-store" });
    if (!r.ok) throw 0;
    SEANCES = parseCSV(await r.text())
      .filter(x => x.id && x["Données"])
      .filter(x => !x["Publié"] || pubOK(x));
  } catch (e) {
    SEANCES = [];
  }
}
registerLoader(loadSeances);
const LS_DEL = "seancesSupprimees" + compteSuffixe();
const sbSupprimees = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_DEL) || "[]");
  } catch (e) {
    return [];
  }
};
const sbMemo = (cle, liste) => {
  try {
    localStorage.setItem(cle, JSON.stringify(liste));
  } catch (e) {}
};
/* toutes les séances connues : celles de la feuille + celles enregistrées depuis ce navigateur (la plus récente gagne) */
function sbTous() {
  const m = new Map();
  const garde = r => {
    const o = m.get(r.id);
    if (!o || String(r.ts) >= String(o.ts)) m.set(r.id, r);
  };
  sbLocal().forEach(garde);
  SEANCES.forEach(x =>
    garde({
      id: x.id,
      titre: x["Titre"],
      theme: x["Thème"],
      educ: x["Éducateurs"],
      dates: x["Dates"],
      nb: x["Exercices"],
      ts: x["Horodateur"],
      data: x["Données"] || SB_DATA[x.id] || "",
      objectif: x["Objectif"] || "",
      owner: x["Propriétaire"] || "",
      ownerNom: x["Nom"] || "",
      partage: x["Partage"] || "",
    })
  );
  const del = new Set(sbSupprimees());
  /* propriétaire et partage : toujours ceux du serveur, même si la copie locale est plus récente */
  m.forEach(r => {
    const x = SEANCES.find(s => s.id === r.id);
    if (x) {
      r.owner = x["Propriétaire"] || "";
      r.ownerNom = x["Nom"] || "";
      r.partage = x["Partage"] || "";
    }
  });
  return [...m.values()]
    .filter(r => !del.has(r.id))
    .sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
}
/* les séances seulement : les cycles de formation (identifiant « cy… ») sont dans « Créer un cycle » */
const sbAll = () => sbTous().filter(r => !String(r.id).startsWith("cy"));
/* contenu complet des séances reçues « à la demande » (la liste du serveur est légère) */
const SB_DATA = {},
  SB_EN_COURS = {};
function sbCharger(id) {
  const r = sbTous().find(x => x.id === id);
  if (r && r.data) return Promise.resolve(r.data);
  if (!compteOn()) return Promise.reject(new Error("introuvable"));
  if (!SB_EN_COURS[id])
    SB_EN_COURS[id] = comptePost("seance_lire", { id })
      .then(j => {
        SB_DATA[id] = j.data;
        delete SB_EN_COURS[id];
        return j.data;
      })
      .catch(e => {
        delete SB_EN_COURS[id];
        throw e;
      });
  return SB_EN_COURS[id];
}
function sbParse(rec) {
  try {
    const d = JSON.parse(rec.data);
    if (d && d.meta && d.meta.logo === undefined) d.meta.logo = "";
    return d && d.meta && d.se ? d : null;
  } catch (e) {
    return null;
  }
}
const nbExercices = () => SE.subs.reduce((a, s) => a + s.items.length, 0);
/* enregistre la séance en cours dans la base (nouvel enregistrement, ou mise à jour si déjà enregistrée) */
async function enregistrerSeance() {
  if (compteRequis()) return;
  seDefaults();
  if (!SE.id) SE.id = "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const meta = { ...SMETA };
  let data = JSON.stringify({ meta, se: SE });
  if (data.length > 45000) {
    delete meta.logo;
    data = JSON.stringify({ meta, se: SE });
  }
  if (data.length > 45000) {
    toast("Séance trop volumineuse pour être enregistrée.");
    return;
  }
  const rec = {
    id: SE.id,
    titre: SMETA.titre || "Séance sans titre",
    objectif: SMETA.objectif || "",
    theme: SMETA.theme || "",
    educ: SMETA.educ || "",
    dates: SMETA.dates || "",
    nb: nbExercices(),
    ts: new Date().toISOString(),
    data,
  };
  seSave();
  delete SB_DATA[rec.id];
  sbMemo(
    LS_DEL,
    sbSupprimees().filter(x => x !== rec.id)
  );
  const garde = sbLocal().filter(x => x.id !== rec.id);
  garde.push(rec);
  try {
    localStorage.setItem(LS_SB, JSON.stringify(garde));
  } catch (e) {}
  if (!CONFIG.GAME_ADD_URL) {
    toast(
      "Séance gardée dans ce navigateur seulement : la base partagée n'est pas encore configurée (GAME_ADD_URL)."
    );
    return;
  }
  toast("Enregistrement en cours…");
  try {
    await serveurSeance("seance", { seance: rec });
    if (compteOn()) await loadSeances();
    toast("✓ Séance enregistrée dans la bibliothèque de séances.");
  } catch (e) {
    toast("Échec de l'enregistrement (" + e.message + "). La séance reste dans ce navigateur.");
  }
}
/* reprend une séance de la bibliothèque comme point de départ d'une nouvelle séance (copie) */
function sbAdopter(d, id) {
  SMETA = JSON.parse(JSON.stringify(d.meta));
  SE = JSON.parse(JSON.stringify(d.se));
  if (id) SE.id = id;
  else delete SE.id;
  let mx = 0;
  SE.subs.forEach(s => {
    mx = Math.max(mx, s.id || 0);
    s.items.forEach(i => (mx = Math.max(mx, i.id || 0)));
  });
  SEUID = mx + 1;
  saveMeta();
  seSave();
}
/* ---------- liste ---------- */
function seancesListeHTML() {
  if (compteOn() && !AUTH.user) return compteInvite();
  if (!compteOn() && !CONFIG.SEANCES_CSV_URL && !sbLocal().length)
    return `<div class="box">La base de séances n'est pas encore configurée. L'administrateur du site doit renseigner <b>SEANCES_CSV_URL</b> et <b>GAME_ADD_URL</b> dans <i>config.js</i>. En attendant, les séances enregistrées depuis ce navigateur apparaissent ici.</div>`;
  const q = norm(SBQ);
  const L = sbAll()
    .map(r => {
      const d = sbParse(r),
        m = (d && d.meta) || {};
      return {
        id: r.id,
        titre: m.titre || r.titre || "Séance sans titre",
        educ: m.educ || r.educ || "",
        dates: m.dates || r.dates || "",
        theme: m.theme || r.theme || "",
        obj: m.objectif || r.objectif || "",
        mien: compteMien(r),
        par: compteMien(r) ? "" : r.ownerNom || r.owner,
      };
    })
    .filter(r => !q || norm([r.titre, r.theme, r.educ, r.dates, r.obj].join(" ")).includes(q));
  const cel = t => `<td title="${esc(t)}">${esc(t)}</td>`;
  const rows = L.map(
    r =>
      `<tr class="r" data-go="sb/${esc(r.id)}">${cel(r.titre).replace("<td", '<td style="font-weight:700"')}${cel(r.educ)}${cel(r.dates)}${cel(r.theme)}${cel(r.obj)}${compteOn() ? cel(r.mien ? "Moi" : r.par) : ""}<td style="text-align:right">${r.mien ? `<a class="chip" data-sbdel="${esc(r.id)}" title="Supprimer cette séance" style="cursor:pointer">🗑</a>` : ""}</td></tr>`
  ).join("");
  return `<div class="tools"><input class="search" id="sbq" type="search" placeholder="Rechercher une séance, un thème, un éducateur…" value="${esc(SBQ)}" style="max-width:420px"></div>
  <p class="count" id="sbcnt">${L.length} séance${L.length > 1 ? "s" : ""}</p>
  ${L.length ? `<div style="overflow-x:auto"><table class="lst sbl"><thead><tr><th>CYCLE ET SÉANCE</th><th>AUTEUR</th><th>DATE</th><th>THÈME</th><th>OBJECTIF GÉNÉRAL</th>${compteOn() ? "<th>PAR</th>" : ""}<th></th></tr></thead><tbody>${rows}</tbody></table></div>` : '<div class="empty">Aucune séance enregistrée pour le moment. Dans « Créer une séance », cliquez sur « Enregistrer dans la bibliothèque de séances ».</div>'}
  <p style="color:#6B7280;font-size:14px">Cliquez sur une ligne pour ouvrir la séance. Les modifications publiées dans la feuille Google peuvent mettre quelques minutes à apparaître.</p>`;
}
let SBQ = "";
async function sbSupprimer(id) {
  const r = sbAll().find(x => x.id === id);
  const d = r && sbParse(r);
  const nom = (d && d.meta.titre) || (r && r.titre) || "cette séance";
  if (!confirm("Supprimer définitivement la séance « " + nom + " » ?")) return false;
  sbMemo(LS_DEL, [...sbSupprimees(), id]);
  sbMemo(
    LS_SB,
    sbLocal().filter(x => x.id !== id)
  );
  if (SE && SE.id === id) {
    delete SE.id;
    seSave();
  }
  render();
  if (CONFIG.GAME_ADD_URL) {
    try {
      await serveurSeance("seance_suppr", { id });
      toast("Séance supprimée.");
    } catch (e) {
      toast("Supprimée ici, mais pas dans la feuille Google (" + e.message + ").");
    }
  } else toast("Séance supprimée.");
  return true;
}
/* ---------- une séance ---------- */
let SBCUR = null,
  SBID = "";
const SB_ECHEC = {};
function seanceFicheView(id) {
  const rec = sbAll().find(r => r.id === id);
  const d = rec && sbParse(rec);
  const back = `<div class="tools noprint"><a class="chip" data-go="biblio" style="cursor:pointer">← Séances et cycles</a></div>`;
  if (rec && !rec.data && !SB_ECHEC[id]) {
    sbCharger(id)
      .then(() => VIEW.startsWith("sb/") && render())
      .catch(() => {
        SB_ECHEC[id] = 1;
        VIEW.startsWith("sb/") && render();
      });
    return back + `<div class="box">Chargement de la séance…</div>`;
  }
  if (!d) {
    SBCUR = null;
    return back + `<div class="box">Cette séance est introuvable ou illisible.</div>`;
  }
  SBCUR = d;
  SBID = id;
  const mien = compteMien(rec);
  const sheet = withSeance(d.meta, d.se, () => sheetHTML());
  return `${back}<div class="tools noprint"><a class="btn" data-sb="print" style="background:#26364D;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Imprimer / PDF</a><a class="btn" data-sb="word" style="background:#2B5A9E;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Télécharger en Word</a>${mien ? '<a class="btn" data-sb="edit" style="background:#2E7D4F;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">✎ Modifier cette séance</a>' : ""}<a class="btn" data-sb="copy" style="background:#EEF1F8;color:#26364D;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Utiliser comme modèle (copie)</a>${mien ? '<a class="btn" data-sb="del" style="background:#fff;color:#B2263A;border:1px solid #E8B4BC;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">🗑 Supprimer</a>' : ""}<span id="sMsg" style="color:#2E7D4F;font-weight:700"></span></div>${partageBloc(rec)}
  <div id="sheet" style="border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.12)">${sheet}</div>`;
}
registerView({
  match: v => v.startsWith("sb/"),
  html: v => seanceFicheView(decodeURIComponent(v.slice(3))),
});
registerClick(e => {
  const del = e.target.closest("[data-sbdel]");
  if (del) {
    sbSupprimer(del.dataset.sbdel);
    return true;
  }
  const b = e.target.closest("[data-sb]");
  if (!b || !SBCUR) return;
  const k = b.dataset.sb;
  if (k === "print") imprimerSeance();
  else if (k === "word") seanceWord(SBCUR);
  else if (k === "del") {
    sbSupprimer(SBID).then(ok => ok && go("biblio"));
  } else if (k === "copy" || k === "edit") {
    const txt =
      k === "edit"
        ? "Ouvrir cette séance dans « Créer une séance » pour la modifier ? Le contenu actuel de « Créer une séance » sera remplacé. Enregistrez ensuite pour mettre à jour la séance de la bibliothèque."
        : "Remplacer le contenu de « Créer une séance » par une copie de cette séance ?";
    if (!confirm(txt)) return true;
    sbAdopter(SBCUR, k === "edit" ? SBID : "");
    go("seance");
  }
  return true;
});

/* ---------- séance ouverte en fenêtre (depuis un cycle) ---------- */
let POPID = "";
function popFermer() {
  const p = $("#pop");
  if (p) p.remove();
  document.body.classList.remove("pp");
  POPID = "";
}
async function popOuvrir(id) {
  popFermer();
  POPID = id;
  const p = document.createElement("div");
  p.id = "pop";
  p.innerHTML = `<div class="popbox"><div class="poptools noprint"><b id="popt" style="flex:1">Séance</b><span id="sMsg" style="color:#2E7D4F;font-weight:700"></span><a class="chip" data-pop="print">Imprimer / PDF</a><a class="chip" data-pop="word">Word</a><a class="chip" data-pop="open">Ouvrir la page</a><a class="chip" data-pop="close">✕ Fermer</a></div><div id="popbody"><div class="box">Chargement de la séance…</div></div></div>`;
  document.body.appendChild(p);
  document.body.classList.add("pp");
  try {
    await sbCharger(id);
    if (POPID !== id) return;
    const rec = sbTous().find(r => r.id === id),
      d = rec && sbParse(rec);
    if (!d) throw new Error("illisible");
    SBCUR = d;
    SBID = id;
    $("#popt").textContent = d.meta.titre || rec.titre || "Séance";
    $("#popbody").innerHTML = withSeance(d.meta, d.se, () => sheetHTML()).replace(
      'id="sheet"',
      'id="popsheet"'
    );
  } catch (e) {
    if (POPID === id)
      $("#popbody").innerHTML =
        `<div class="box">Cette séance n'est pas accessible (supprimée, ou non partagée avec vous).</div>`;
  }
}
registerClick(e => {
  const o = e.target.closest("[data-sbpop]");
  if (o) {
    popOuvrir(o.dataset.sbpop);
    return true;
  }
  if (e.target.id === "pop") {
    popFermer();
    return true;
  }
  const b = e.target.closest("[data-pop]");
  if (!b) return;
  const k = b.dataset.pop;
  if (k === "close") popFermer();
  else if (k === "print") window.print();
  else if (k === "word" && SBCUR) seanceWord(SBCUR);
  else if (k === "open") {
    const id = POPID;
    popFermer();
    go("sb/" + id);
  }
  return true;
});
document.addEventListener("keydown", e => e.key === "Escape" && POPID && popFermer());
