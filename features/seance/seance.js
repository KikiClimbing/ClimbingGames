/* Ma séance — déclaration de la page et du menu */
seLoad();
registerNav({
  sec: "MES SÉANCES",
  secOrder: 30,
  order: 3,
  html: () =>
    navBtn(
      "seance",
      `Ma séance<span class="n" id="selcount">${selCount() || ""}</span>`,
      '<span class="ic">☰</span>'
    ),
});
registerView({ match: v => v === "seance", html: () => seanceView(), bind: () => seanceBind() });
registerClick(e => {
  const ad = e.target.closest("[data-add]");
  if (ad) {
    const c = ad.dataset.add;
    if (inSel(c)) {
      go("seance");
    } else {
      addSel(c);
      ad.textContent = "✓ Ajouté — voir ma séance";
      ad.dataset.done = "1";
    }
    return true;
  }
});
