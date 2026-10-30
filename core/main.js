/* Démarrage : clics, menu mobile, premier affichage */
document.addEventListener("click", e => {
  for (const fn of CLICKS) {
    if (fn(e)) return;
  }
});
registerClick(e => {
  const j = e.target.closest("[data-jeu]");
  if (j) {
    go("jeu/" + encodeURIComponent(j.dataset.jeu));
    return true;
  }
  const g = e.target.closest("[data-go]");
  if (g) {
    go(g.dataset.go);
    return true;
  }
  if (e.target.id === "shade") {
    $("#shade").classList.remove("open");
    $("#side").classList.remove("open");
  }
});
$("#burger").addEventListener("click", () => {
  $("#side").classList.add("open");
  $("#shade").classList.add("open");
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && MODAL) closeFiche();
});
if (CONFIG.GAME_ADD_URL) {
  /* formulaire intégré au site */
  $("#propose").href = "#/proposer";
  $("#propose").removeAttribute("target");
} else if (CONFIG.FORM_URL) $("#propose").href = CONFIG.FORM_URL;
else $("#propose").style.display = "none";
route();
Promise.all(LOADERS.map(f => f())).then(() => {
  buildNav();
  render();
  syncModal();
});
