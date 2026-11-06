/* Éditeur de schémas en fenêtre (popup) : on garde la page en dessous, donc rien n'est perdu.
   - edPopup("proposer")   : depuis « Proposer un jeu » ; le lien du schéma envoyé est ajouté à la proposition ;
   - edPopup("item:<id>")  : « Dessiner un schéma pour cette situation » d'un exercice de la séance : le dessin est gardé dans
                             l'exercice (it.sch = { els, opt }) et affiché dans la fiche complète. Le brouillon de l'éditeur
                             (page « Dessiner un schéma ») est mis de côté puis remis à la fermeture. */
function edPopup(back, srcCtx, ctx) {
  ED.ctx = back === "ctx" ? ctx : null;
  ED.back = back;
  ED.popup = true;
  ED.mis = null;
  if (back === "ctx") {
    /* schéma d'un jeu (Administration) : le brouillon de l'éditeur est mis de côté puis remis */
    try {
      ED.mis = localStorage.getItem("edSchema");
      localStorage.setItem("edSchema", JSON.stringify(srcCtx));
    } catch (e) {}
    ED.els = [];
    ED.hist = [];
    ED.redo = [];
  } else if (/^item:/.test(back)) {
    const f = typeof seFind === "function" ? seFind(+back.slice(5)) : null;
    const it = f && f.s.items[f.i];
    try {
      ED.mis = localStorage.getItem("edSchema");
      localStorage.setItem(
        "edSchema",
        JSON.stringify(it && it.sch
          ? it.sch
          : {
              els: [],
              opt: {
                ...ED.opt,
                mode: DISC === "prepa" ? "sol" : ED.opt.mode === "sol" ? "face" : ED.opt.mode,
                vue: DISC === "prepa" ? "" : ED.opt.mode === "sol" ? "VUE DE FACE" : ED.opt.vue,
              },
            })
      );
    } catch (e) {}
    ED.els = [];
    ED.hist = [];
    ED.redo = [];
  }
  modal("✏ Dessiner un schéma", editorHTML(), 1500, { fond: false, fin: edPopupFin });
  edInit();
}
function edPopupFin() {
  ED.popup = false;
  if (/^item:/.test(ED.back || "") || ED.back === "ctx") {
    try {
      if (ED.mis === null) localStorage.removeItem("edSchema");
      else localStorage.setItem("edSchema", ED.mis);
    } catch (e) {}
    ED.els = [];
    edLoad();
    ED.back = null;
    ED.ctx = null;
    ED.refImg = "";
  }
  ED.mis = null;
  if (typeof render === "function") render();
}
function edPopupFermer() {
  modalFermer();
}
function edItemValider() {
  const f = seFind(+ED.back.slice(5));
  if (f) {
    const it = f.s.items[f.i];
    if (ED.els.length) it.sch = JSON.parse(JSON.stringify({ els: ED.els, opt: ED.opt }));
    else delete it.sch;
    seSave();
  }
  modalFermer();
}
/* image (data:URL SVG) d'un schéma dessiné, à partir de sa source { els, opt } ; null si vide */
const ED_SVGS = {};
function edSvgUrl(src) {
  if (!src || !src.els || !src.els.length) return "";
  const k = JSON.stringify(src);
  if (ED_SVGS[k]) return ED_SVGS[k];
  const a = ED.els,
    b = ED.opt;
  try {
    ED.els = src.els;
    ED.opt = Object.assign({}, b, src.opt || {});
    ED_SVGS[k] = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(edSvgText());
  } finally {
    ED.els = a;
    ED.opt = b;
  }
  return ED_SVGS[k];
}
