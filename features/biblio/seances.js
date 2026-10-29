/* Séances enregistrées dans l'application : base de données (onglet « Séances » de la feuille Google) */
let SEANCES = []; /* séances publiées, lues dans la feuille */
const LS_SB = "seancesEnregistrees";
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
/* toutes les séances connues : celles de la feuille + celles enregistrées depuis ce navigateur */
function sbAll() {
  const m = new Map();
  sbLocal().forEach(x => m.set(x.id, x));
  SEANCES.forEach(x =>
    m.set(x.id, {
      id: x.id,
      titre: x["Titre"],
      theme: x["Thème"],
      educ: x["Éducateurs"],
      dates: x["Dates"],
      nb: x["Exercices"],
      ts: x["Horodateur"],
      data: x["Données"],
    })
  );
  return [...m.values()].sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
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
    theme: SMETA.theme || "",
    educ: SMETA.educ || "",
    dates: SMETA.dates || "",
    nb: nbExercices(),
    ts: new Date().toISOString(),
    data,
  };
  seSave();
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
    const r = await fetch(CONFIG.GAME_ADD_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ key: CONFIG.GAME_ADD_KEY || "", action: "seance", seance: rec }),
    });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "refusé");
    toast("✓ Séance enregistrée dans la bibliothèque de séances.");
  } catch (e) {
    toast("Échec de l'enregistrement (" + e.message + "). La séance reste dans ce navigateur.");
  }
}
/* reprend une séance de la bibliothèque comme point de départ d'une nouvelle séance (copie) */
function sbAdopter(d) {
  SMETA = JSON.parse(JSON.stringify(d.meta));
  SE = JSON.parse(JSON.stringify(d.se));
  delete SE.id;
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
  if (!CONFIG.SEANCES_CSV_URL && !sbLocal().length)
    return `<div class="box">La base de séances n'est pas encore configurée. L'administrateur du site doit renseigner <b>SEANCES_CSV_URL</b> et <b>GAME_ADD_URL</b> dans <i>config.js</i>. En attendant, les séances enregistrées depuis ce navigateur apparaissent ici.</div>`;
  const q = norm(SBQ);
  const L = sbAll().filter(
    r => !q || norm([r.titre, r.theme, r.educ, r.dates].join(" ")).includes(q)
  );
  const rows = L.map(
    r =>
      `<tr class="r" data-go="sb/${esc(r.id)}"><td><b>${esc(r.titre)}</b><br><span style="color:#6B7280;font-size:13px">${esc(r.theme || "")}</span></td><td>${esc(r.educ || "")}</td><td>${esc(r.dates || "")}</td><td style="text-align:center">${esc(r.nb || "")}</td></tr>`
  ).join("");
  return `<div class="tools"><input class="search" id="sbq" type="search" placeholder="Rechercher une séance, un thème, un éducateur…" value="${esc(SBQ)}" style="max-width:420px"></div>
  <p class="count" id="sbcnt">${L.length} séance${L.length > 1 ? "s" : ""}</p>
  ${L.length ? `<table class="lst sbl"><thead><tr><th>SÉANCE</th><th>ÉDUCATEURS</th><th>DATES</th><th>EXERCICES</th></tr></thead><tbody>${rows}</tbody></table>` : '<div class="empty">Aucune séance enregistrée pour le moment. Dans « Ma séance », cliquez sur « Enregistrer dans la bibliothèque de séances ».</div>'}
  <p style="color:#6B7280;font-size:14px">Les séances s'affichent directement ici, sans passer par un fichier. Les modifications publiées dans la feuille Google peuvent mettre quelques minutes à apparaître.</p>`;
}
let SBQ = "";
/* ---------- une séance ---------- */
let SBCUR = null;
function seanceFicheView(id) {
  const rec = sbAll().find(r => r.id === id);
  const d = rec && sbParse(rec);
  const back = `<div class="tools noprint"><a class="chip" data-go="biblio" style="cursor:pointer">← Bibliothèque de séances</a></div>`;
  if (!d) {
    SBCUR = null;
    return back + `<div class="box">Cette séance est introuvable ou illisible.</div>`;
  }
  SBCUR = d;
  const sheet = withSeance(d.meta, d.se, () => sheetHTML());
  return `${back}<div class="tools noprint"><a class="btn" data-sb="print" style="background:#26364D;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Imprimer / PDF</a><a class="btn" data-sb="word" style="background:#2B5A9E;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Télécharger en Word</a><a class="btn" data-sb="copy" style="background:#EEF1F8;color:#26364D;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Utiliser comme modèle (copie dans « Ma séance »)</a><span id="sMsg" style="color:#2E7D4F;font-weight:700"></span></div>
  <div id="sheet" style="border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.12)">${sheet}</div>`;
}
registerView({
  match: v => v.startsWith("sb/"),
  html: v => seanceFicheView(decodeURIComponent(v.slice(3))),
});
registerClick(e => {
  const b = e.target.closest("[data-sb]");
  if (!b || !SBCUR) return;
  if (b.dataset.sb === "print") imprimerSeance();
  else if (b.dataset.sb === "word") seanceWord(SBCUR);
  else if (b.dataset.sb === "copy") {
    if (!confirm("Remplacer le contenu de « Ma séance » par une copie de cette séance ?"))
      return true;
    sbAdopter(SBCUR);
    go("seance");
  }
  return true;
});
