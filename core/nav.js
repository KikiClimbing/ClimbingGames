/* Menu de gauche, construit à partir des entrées déclarées par les fonctionnalités */
function navBtn(v, label, extra = "") {
  return `<button class="nav ${VIEW === v ? "on" : ""}" data-go="${esc(v)}">${extra}${label}</button>`;
}
/* bouton « Proposer un jeu » : formulaire du site, sinon formulaire Google, sinon rien */
function proposeHTML() {
  if (CONFIG.GAME_ADD_URL)
    return `<a class="propose" id="propose" href="#/proposer">+ Proposer un jeu</a>`;
  if (CONFIG.FORM_URL)
    return `<a class="propose" id="propose" href="${esc(CONFIG.FORM_URL)}" target="_blank" rel="noopener">+ Proposer un jeu</a>`;
  return "";
}
/* petite bulle d'aide « ? » : texte au survol, au focus ou au clic (écrans tactiles) */
function aide(txt) {
  return `<span class="aide" tabindex="0" role="button" aria-label="Aide">?<span class="tip">${txt}</span></span>`;
}
registerClick(e => {
  const a = e.target.closest(".aide");
  document.querySelectorAll(".aide.open").forEach(x => x !== a && x.classList.remove("open"));
  if (a) {
    a.classList.toggle("open");
    return true;
  }
});
function buildNav() {
  const items = NAVITEMS.slice().sort(
    (a, b) => a.secOrder - b.secOrder || (a.order || 0) - (b.order || 0)
  );
  let h = "",
    last = null;
  items.forEach(it => {
    const b = it.html();
    if (!b) return;
    if (it.sec && it.sec !== last) {
      if (it.sec === "PARCOURIR") h += proposeHTML();
      h += `<div class="sec">${it.sec}</div>`;
    }
    last = it.sec;
    h += b;
  });
  $("#navbox").innerHTML = h;
}
