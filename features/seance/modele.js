/* Ma séance — données enregistrées, durées, modèle de calcul */
const C1 = "#3A8FB0",
  C2 = "#E8662F",
  NAVYC = "#1E2630";
/* couleurs des groupes (2 par défaut, 4 au maximum) */
const GCOL = [C1, C2, "#4E9A5B", "#8A55B5"],
  GMAX = 4;
const SECU_DEFAUT =
  "On ne court pas sur les tapis, tapis dégagés quand on grimpe, pas de saut depuis le haut, on se déplace loin des murs.";
let SE = null;
let SEUID = 1;
const seNew = () => ({
  ech: { on: true, nom: "", d: [10, 10], txt: "", per: false, gtxt: [], items: [] },
  subs: [{ id: SEUID++, titre: "", gs: null, d: [15, 15], items: [] }],
});
function seLoad() {
  try {
    SE = JSON.parse(localStorage.getItem(seKey()) || "null");
  } catch (e) {
    SE = null;
  }
  if (!SE || !Array.isArray(SE.subs)) {
    SE = seNew();
    if (SEL && SEL.length && DISC !== "prepa") {
      const one = (a, f) => a.reduce((t, x) => t + (+x[f] || 0), 0);
      const g = s => DATA.find(x => key(x) === s.k);
      const ech = SEL.filter(s => s.ph === "ech" && g(s)),
        c1 = SEL.filter(s => (s.ph || "c1") === "c1" && g(s)),
        c2 = SEL.filter(s => s.ph === "c2" && g(s));
      const m2 = s => (s.min2 === undefined ? s.min : s.min2);
      if (ech.length) {
        SE.ech.txt = ech
          .map(
            s =>
              "• " +
              g(s).Titre +
              (g(s).Code ? " (" + g(s).Code + ")" : "") +
              " — " +
              (g(s)["Résumé"] || "")
          )
          .join("\n");
        SE.ech.d = [one(ech, "min"), ech.reduce((t, s) => t + (+m2(s) || 0), 0)];
      }
      const mk = (arr, t) => ({
        id: SEUID++,
        titre: t,
        gs: null,
        d: [one(arr, "min"), arr.reduce((a, s) => a + (+m2(s) || 0), 0)],
        items: arr.map(s => ({ id: SEUID++, t: "lib", k: s.k, crit: "" })),
      });
      SE.subs = [];
      if (c1.length) SE.subs.push(mk(c1, SMETA.bloc1 || ""));
      if (c2.length) SE.subs.push(mk(c2, SMETA.bloc2 || ""));
      if (!SE.subs.length) SE.subs = seNew().subs;
    }
  }
  let mx = 0;
  if (!SE.ech) SE.ech = seNew().ech;
  if (!Array.isArray(SE.ech.items)) SE.ech.items = [];
  SE.subs.forEach(s => {
    mx = Math.max(mx, s.id || 0);
    s.items.forEach(i => (mx = Math.max(mx, i.id || 0)));
  });
  SE.ech.items.forEach(i => (mx = Math.max(mx, i.id || 0)));
  SEUID = mx + 1;
  SE.subs.forEach(s => {
    if (!s.id) s.id = SEUID++;
    s.items.forEach(i => {
      if (!i.id) i.id = SEUID++;
    });
  });
  SE.ech.items.forEach(i => {
    if (!i.id) i.id = SEUID++;
  });
}
const seSave = () => {
  if (SEPOP) {
    SEPOP.dirty = true;
    return;
  }
  try {
    localStorage.setItem(seKey(), JSON.stringify(SE));
  } catch (e) {}
};
const selCount = () => (SE ? SE.subs.reduce((a, s) => a + s.items.length, 0) : 0);
const seHas = c =>
  SE.subs.some(s => s.items.some(i => i.t === "lib" && i.k === c)) ||
  (SE.ech.items || []).some(i => i.t === "lib" && i.k === c);
function seAdd(c, subId) {
  const g = DATA.find(x => key(x) === c);
  if (!g || seHas(c)) return;
  if (subId === "ech") {
    SE.ech.items = SE.ech.items || [];
    SE.ech.items.push({ id: SEUID++, t: "lib", k: c });
    seSave();
    return;
  }
  let s = SE.subs.find(x => x.id === subId) || SE.subs[SE.subs.length - 1];
  if (!s) {
    s = { id: SEUID++, titre: "", gs: null, d: [15, 15], items: [] };
    SE.subs.push(s);
  }
  s.items.push({ id: SEUID++, t: "lib", k: c, crit: "" });
  seSave();
  const e = $("#selcount");
  if (e) e.textContent = selCount();
}
function seFind(id) {
  const e = (SE.ech.items || []).findIndex(x => x.id === id);
  if (e >= 0) return { s: SE.ech, i: e };
  for (const s of SE.subs) {
    const i = s.items.findIndex(x => x.id === id);
    if (i >= 0) return { s, i };
  }
  return null;
}
const inSel = seHas,
  addSel = seAdd;
/* adresse d'un jeu dans l'application (pour les liens des PDF et des fichiers Word) */
const gameUrl = c => location.href.split("#")[0] + "#/jeu/" + encodeURIComponent(c);
/* logo de la salle : le dernier logo téléversé sert par défaut à chaque nouvelle séance */
const defaultLogo = () => {
  try {
    return localStorage.getItem("logoSalle") || "";
  } catch (e) {
    return "";
  }
};
/* exécute fn avec une autre séance (bibliothèque de séances) à la place de la séance en cours */
function withSeance(meta, se, fn) {
  const a = SMETA,
    b = SE;
  SMETA = meta;
  SE = se;
  try {
    return fn();
  } finally {
    SMETA = a;
    SE = b;
  }
}
/* complète ou met à jour les données (anciennes séances à 2 groupes fixes → groupes libres) */
const fit = (a, n, def) => {
  const r = Array.isArray(a) ? a.slice(0, n) : [];
  while (r.length < n) r.push(r.length ? r[r.length - 1] : def);
  return r.map(x => (+x >= 0 ? +x : def));
};
function seDefaults() {
  const S = SMETA;
  if (S.logo === undefined) S.logo = defaultLogo();
  const d = {
    titre: "",
    periode: "",
    theme: "",
    educ: "",
    objectif: "",
    dates: "",
    objCol: "",
    secu: "",
  };
  /* sécurité préremplie à la création d'une séance d'escalade (modifiable) */
  const neuve = S.secuInit === undefined && !S.secu;
  Object.keys(d).forEach(k => {
    if (S[k] === undefined) S[k] = d[k];
  });
  if (neuve && DISC !== "prepa" && S.disc !== "prepa") S.secu = SECU_DEFAUT;
  S.secuInit = 1;
  if (!Array.isArray(S.groups) || !S.groups.length) {
    const g = (nom, acc, rc) => ({
      nom,
      acc: acc === undefined ? 5 : acc,
      rc: rc || "",
    });
    const prepa = DISC === "prepa";
    /* retour au calme proposé par défaut : « Bilan » pour les enfants, « Étirements » pour les ados */
    const rcDef = (nom, i) => (prepa ? "" : /ado/i.test(nom) ? "Étirements" : /enfant/i.test(nom) || i === 0 ? "Bilan" : "");
    const n1 = S.g1 === undefined ? (prepa ? "Groupe" : "Enfants (8–10 ans)") : S.g1;
    S.groups = [g(n1, S.acc1, S.rc1 === undefined ? rcDef(n1, 0) : S.rc1)];
    if (S.deux !== false && !prepa) {
      const n2 = S.g2 === undefined ? "Ados (11–14 ans)" : S.g2;
      S.groups.push(g(n2, S.acc2, S.rc2 === undefined ? rcDef(n2, 1) : S.rc2));
    }
    ["g1", "g2", "acc1", "acc2", "rc1", "rc2", "deux"].forEach(k => delete S[k]);
  }
  S.groups = S.groups.slice(0, GMAX);
  const n = S.groups.length;
  const E = SE.ech;
  if (E.d1 !== undefined || E.d2 !== undefined) {
    E.d = [E.d1 === undefined ? 10 : E.d1, E.d2 === undefined ? 10 : E.d2];
    delete E.d1;
    delete E.d2;
  }
  E.d = fit(E.d, n, 10);
  E.gtxt = Array.isArray(E.gtxt) ? E.gtxt.slice(0, n) : [];
  while (E.gtxt.length < n) E.gtxt.push("");
  E.per = !!E.per && n > 1;
  SE.subs.forEach(s => {
    if (s.d1 !== undefined || s.d2 !== undefined) {
      s.d = [s.d1 === undefined ? 15 : s.d1, s.d2 === undefined ? 15 : s.d2];
      delete s.d1;
      delete s.d2;
    }
    if (s.g !== undefined) {
      s.gs = s.g === "1" ? [0] : s.g === "2" ? [Math.min(1, n - 1)] : null;
      delete s.g;
    }
    s.d = fit(s.d, n, 15);
    if (Array.isArray(s.gs)) {
      s.gs = s.gs.filter(i => i >= 0 && i < n);
      if (!s.gs.length || s.gs.length === n) s.gs = null;
    } else s.gs = null;
  });
}
/* retire un groupe de toute la séance */
function seDropGroup(i) {
  SMETA.groups.splice(i, 1);
  SE.ech.d.splice(i, 1);
  SE.ech.gtxt.splice(i, 1);
  SE.subs.forEach(s => {
    s.d.splice(i, 1);
    if (s.gs) s.gs = s.gs.filter(x => x !== i).map(x => (x > i ? x - 1 : x));
  });
}
const stepsOf = (v, it) => {
  let L = String(v.desc || "")
    .split(/\n/)
    .map(l => l.replace(/^\s*[•\-–▸]\s*/, "").trim())
    .filter(Boolean);
  if (L.length === 1 && !v.free)
    L = L[0]
      .split(/(?<=[.!?])\s+(?=[A-ZÉÈÀÂÎÔÛ«"“])/)
      .map(l => l.trim())
      .filter(Boolean);
  return L;
};
const lines = t =>
  String(t || "")
    .split(/\n/)
    .map(l => l.replace(/^\s*[•\-–]\s*/, "").trim())
    .filter(Boolean);
const capf = t => t.charAt(0).toUpperCase() + t.slice(1);

/* changement de discipline : on recharge le brouillon de séance de la discipline choisie */
function seSwitch() {
  SMETA = { titre: "", public: "" };
  try {
    SMETA = Object.assign(SMETA, JSON.parse(localStorage.getItem(seMetaKey()) || "{}"));
  } catch (e) {}
  SE = null;
  seLoad();
}

/* modifications non enregistrées ? (le bouton d'enregistrement se grise tant qu'il n'y a rien à sauvegarder) */
function seSig() {
  const s = { ...SE },
    m = { ...SMETA };
  delete s.saveSig;
  delete m.logo;
  return JSON.stringify([s, m]);
}
function seSale() {
  if (SEPOP) return !!SEPOP.dirty;
  if (SE.saveSig) return SE.saveSig !== seSig();
  return nbExercices() > 0 || !!(SMETA.titre || "").trim();
}
function seBoutonSauve() {
  const b = $("#sSave");
  if (!b) return;
  const sale = seSale();
  b.classList.toggle("off", !sale);
  b.style.opacity = sale ? "" : ".45";
  b.style.cursor = sale ? "pointer" : "default";
  b.title = sale ? "" : "Rien à enregistrer : aucune modification depuis le dernier enregistrement";
  const m = $("#sSaved");
  if (m) m.style.display = sale ? "none" : "";
}
