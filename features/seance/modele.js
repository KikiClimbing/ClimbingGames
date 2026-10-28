/* Ma séance — données enregistrées, durées, modèle de calcul */
const C1 = "#3A8FB0",
  C2 = "#E8662F",
  NAVYC = "#1E2630";
let SE = null;
let SEUID = 1;
const seNew = () => ({
  ech: { on: true, nom: "", d1: 10, d2: 10, txt: "" },
  subs: [{ id: SEUID++, titre: "", g: "both", d1: 15, d2: 15, items: [] }],
});
function seLoad() {
  try {
    SE = JSON.parse(localStorage.getItem("maSeance2") || "null");
  } catch (e) {
    SE = null;
  }
  if (!SE || !Array.isArray(SE.subs)) {
    SE = seNew();
    if (SEL && SEL.length) {
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
        SE.ech.d1 = one(ech, "min");
        SE.ech.d2 = ech.reduce((t, s) => t + (+m2(s) || 0), 0);
      }
      const mk = (arr, t) => ({
        id: SEUID++,
        titre: t,
        g: "both",
        d1: one(arr, "min"),
        d2: arr.reduce((a, s) => a + (+m2(s) || 0), 0),
        items: arr.map(s => ({ id: SEUID++, t: "lib", k: s.k, crit: "" })),
      });
      SE.subs = [];
      if (c1.length) SE.subs.push(mk(c1, SMETA.bloc1 || ""));
      if (c2.length) SE.subs.push(mk(c2, SMETA.bloc2 || ""));
      if (!SE.subs.length) SE.subs = seNew().subs;
    }
  }
  let mx = 0;
  SE.subs.forEach(s => {
    mx = Math.max(mx, s.id || 0);
    s.items.forEach(i => (mx = Math.max(mx, i.id || 0)));
  });
  SEUID = mx + 1;
  SE.subs.forEach(s => {
    if (!s.id) s.id = SEUID++;
    s.items.forEach(i => {
      if (!i.id) i.id = SEUID++;
    });
  });
}
const seSave = () => {
  try {
    localStorage.setItem("maSeance2", JSON.stringify(SE));
  } catch (e) {}
};
const selCount = () => (SE ? SE.subs.reduce((a, s) => a + s.items.length, 0) : 0);
const seHas = c => SE.subs.some(s => s.items.some(i => i.t === "lib" && i.k === c));
function seAdd(c, subId) {
  const g = DATA.find(x => key(x) === c);
  if (!g || seHas(c)) return;
  let s = SE.subs.find(x => x.id === subId) || SE.subs[SE.subs.length - 1];
  if (!s) {
    s = { id: SEUID++, titre: "", g: "both", d1: 15, d2: 15, items: [] };
    SE.subs.push(s);
  }
  s.items.push({ id: SEUID++, t: "lib", k: c, crit: "" });
  seSave();
  const e = $("#selcount");
  if (e) e.textContent = selCount();
}
function seFind(id) {
  for (const s of SE.subs) {
    const i = s.items.findIndex(x => x.id === id);
    if (i >= 0) return { s, i };
  }
  return null;
}
const inSel = seHas,
  addSel = seAdd;
function seDefaults() {
  const d = {
    titre: "",
    periode: "",
    theme: "",
    educ: "",
    objectif: "",
    dates: "",
    deux: true,
    g1: "Enfants (8–10 ans)",
    g2: "Ados (11–14 ans)",
    acc1: 5,
    acc2: 5,
    objCol: "",
    secu: "",
    rc1: "",
    rc2: "",
  };
  Object.keys(d).forEach(k => {
    if (SMETA[k] === undefined) SMETA[k] = d[k];
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
