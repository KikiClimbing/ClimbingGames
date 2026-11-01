/* Fenêtre (popup) générale : modal(titre, corpsHTML) ouvre, modalFermer() ferme.
   Le contenu garde le style des fenêtres existantes (#apop). Échap ou clic à côté pour fermer. */
let MODAL_FIN = null;
function modalFermer() {
  const p = document.getElementById("mpop");
  if (p) p.remove();
  const f = MODAL_FIN;
  MODAL_FIN = null;
  if (f) f();
}
/* opts : { fond: false → un clic à côté ne ferme pas ; fin: fonction appelée à la fermeture } */
function modal(titre, corps, largeur = 640, opts = {}) {
  modalFermer();
  MODAL_FIN = opts.fin || null;
  const p = document.createElement("div");
  p.id = "mpop";
  p.innerHTML = `<div class="popbox" style="max-width:${largeur}px"><div class="poptools"><b style="flex:1">${titre}</b><a class="chip" data-modal="fermer">✕ Fermer</a></div><div id="mpopbody">${corps}</div></div>`;
  p.addEventListener("mousedown", e => {
    p._bg = e.target === p;
  });
  p.addEventListener("click", e => {
    if (
      (e.target === p && p._bg && opts.fond !== false) ||
      e.target.closest('[data-modal="fermer"]')
    )
      modalFermer();
  });
  document.body.appendChild(p);
  return p;
}
document.addEventListener("keydown", e => e.key === "Escape" && modalFermer());
