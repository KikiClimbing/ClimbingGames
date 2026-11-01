/* Jeux favoris : une étoile sur chaque jeu, un filtre « Mes favoris ».
   Avec un compte : enregistrés sur le serveur (onglet « Favoris ») et gardés en copie dans ce navigateur ;
   sans compte : dans ce navigateur seulement. */
const favCle = () => "favJeux" + (typeof compteSuffixe === "function" ? compteSuffixe() : "");
function favListe() {
  try {
    return JSON.parse(localStorage.getItem(favCle()) || "[]");
  } catch (e) {
    return [];
  }
}
const isFav = g => favListe().includes(key(g));
function favBascule(k) {
  const L = favListe(),
    i = L.indexOf(k);
  if (i >= 0) L.splice(i, 1);
  else L.push(k);
  favEcrire(L);
  favPousser();
  return i < 0;
}
const favEcrire = L => {
  try {
    localStorage.setItem(favCle(), JSON.stringify(L));
  } catch (e) {}
};
/* envoi au serveur (groupé : une seule requête après une rafale de clics) */
let FAVT = 0;
function favPousser() {
  if (!compteOn() || !AUTH.user || AUTH.reel) return;
  clearTimeout(FAVT);
  FAVT = setTimeout(() => comptePost("favoris_ecrire", { liste: favListe() }).catch(() => {}), 800);
}
/* à la connexion : le serveur fait foi ; s'il n'a encore rien, on lui envoie les favoris de ce navigateur */
registerLoader(async () => {
  if (!compteOn() || !AUTH.user || AUTH.reel) return;
  try {
    const j = await comptePost("favoris_lire");
    if (j.existe) {
      favEcrire(j.liste);
      buildNav();
      if (VIEW === "fav") render();
    } else if (favListe().length) favPousser();
  } catch (e) {}
});
/* petite étoile à poser sur une vignette */
const favEtoile = g =>
  `<span class="favb ${isFav(g) ? "on" : ""}" data-fav="${esc(key(g))}" title="Favori">${isFav(g) ? "★" : "☆"}</span>`;
registerNav({
  sec: "PARCOURIR",
  secOrder: 20,
  order: 0.5,
  html: () =>
    navBtn(
      "fav",
      `Mes favoris<span class="n">${favListe().length || ""}</span>`,
      '<span class="ic">♥</span>'
    ),
});
registerClick(e => {
  const b = e.target.closest("[data-fav]");
  if (!b) return;
  e.stopPropagation();
  const on = favBascule(b.dataset.fav);
  toast(on ? "★ Ajouté aux favoris" : "Retiré des favoris");
  buildNav();
  if (VIEW === "fav") render();
  else {
    document.querySelectorAll(`[data-fav="${CSS.escape(b.dataset.fav)}"]`).forEach(x => {
      x.classList.toggle("on", on);
      if (x.classList.contains("favb")) x.textContent = on ? "★" : "☆";
      else x.textContent = on ? "★ Favori" : "☆ Mettre en favori";
    });
  }
  return true;
});
