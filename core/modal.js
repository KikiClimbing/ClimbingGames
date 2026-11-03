/* Fenêtre (popup) générale : modal(titre, corpsHTML, largeur, opts) ouvre, modalFermer(id) ferme.
   opts : { id: "mpop" (défaut) ou "epop" (fenêtre de modification d'une séance, sous les autres),
            fond: false → un clic à côté ne ferme pas ; fin: fonction appelée à la fermeture ;
            avant: fonction appelée avant la fermeture, qui renvoie false pour l'empêcher }
   Échap ferme la fenêtre du dessus. */
const MODALS = {};
function modalFermer(id = "mpop", force) {
  const p = document.getElementById(id);
  if (!p) return;
  const m = MODALS[id] || {};
  if (!force && m.avant && m.avant() === false) return;
  p.remove();
  delete MODALS[id];
  if (m.fin) m.fin();
}
function modal(titre, corps, largeur = 640, opts = {}) {
  const id = opts.id || "mpop";
  modalFermer(id, true);
  MODALS[id] = { fin: opts.fin || null, avant: opts.avant || null };
  const p = document.createElement("div");
  p.id = id;
  p.innerHTML = `<div class="popbox" style="max-width:${largeur}px"><div class="poptools"><b style="flex:1">${titre}</b><a class="chip" data-modal="fermer" data-mid="${id}">✕ Fermer</a></div><div id="${id}body">${corps}</div></div>`;
  p.addEventListener("mousedown", e => {
    p._bg = e.target === p;
  });
  p.addEventListener("click", e => {
    if (
      (e.target === p && p._bg && opts.fond !== false) ||
      e.target.closest(`[data-modal="fermer"][data-mid="${id}"]`)
    )
      modalFermer(id);
  });
  document.body.appendChild(p);
  return p;
}
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (document.getElementById("mpop")) modalFermer("mpop");
  else if (document.getElementById("epop")) modalFermer("epop");
});
