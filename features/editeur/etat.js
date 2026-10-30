/* Éditeur de schémas — état, couleurs, annuler/rétablir */
const ED = {
  els: [],
  sel: null,
  hist: [],
  redo: [],
  next: 1,
  opt: { face: true, mur: true, tapis: true, legende: "", vue: "VUE DE FACE" },
  drag: null,
};
const HOLDC = [
  "#F28B82",
  "#F6B26B",
  "#F7D858",
  "#7FCB8F",
  "#6EC1E4",
  "#A894E6",
  "#F49AC1",
  "#5FCDBF",
];
const HOLDN = ["rouge", "orange", "jaune", "vert", "bleu clair", "violet", "rose", "turquoise"];
const EBLUE = "#2F6FDB",
  ERED = "#E0485A",
  EINK = "#334155",
  EGREY = "#94A3B8",
  EAMB = "#E0A030",
  EGREEN = "#2E9E6B";
const darken = (c, k = 0.72) => {
  c = c.replace("#", "");
  const r = [0, 2, 4].map(i => Math.round(parseInt(c.substr(i, 2), 16) * k));
  return "#" + r.map(v => v.toString(16).padStart(2, "0")).join("");
};
const CN = n =>
  ({
    ink: EINK,
    blue: EBLUE,
    red: ERED,
    green: EGREEN,
    amber: EAMB,
    grey: EGREY,
    brown: "#B45309",
  })[n] ||
  n ||
  EINK;
const isLine = e => ["arrow", "rope", "line", "elastic"].includes(e.t);
const EY = y => +(36 - y).toFixed(3);
function edLoad() {
  try {
    const s = JSON.parse(localStorage.getItem("edSchema") || "null");
    if (s && Array.isArray(s.els)) {
      s.els = s.els.filter(x => x && x.t && typeof x.id === "number");
      ED.els = s.els;
      ED.opt = Object.assign(ED.opt, s.opt || {});
      ED.next = Math.max(1, ...ED.els.map(e => e.id + 1));
    }
  } catch (e) {}
}
function edSave() {
  try {
    localStorage.setItem("edSchema", JSON.stringify({ els: ED.els, opt: ED.opt }));
  } catch (e) {}
}
function edSnap() {
  ED.hist.push(JSON.stringify({ els: ED.els, opt: ED.opt }));
  if (ED.hist.length > 60) ED.hist.shift();
  ED.redo = [];
}
function edUndo() {
  if (!ED.hist.length) return;
  ED.redo.push(JSON.stringify({ els: ED.els, opt: ED.opt }));
  const s = JSON.parse(ED.hist.pop());
  ED.els = s.els;
  ED.opt = s.opt;
  ED.sel = null;
  edRender(true);
}
function edRedo() {
  if (!ED.redo.length) return;
  ED.hist.push(JSON.stringify({ els: ED.els, opt: ED.opt }));
  const s = JSON.parse(ED.redo.pop());
  ED.els = s.els;
  ED.opt = s.opt;
  ED.sel = null;
  edRender(true);
}
function edAdd(el) {
  edSnap();
  el.id = ED.next++;
  ED.els.push(el);
  ED.sel = el.id;
  edRender(true);
}
