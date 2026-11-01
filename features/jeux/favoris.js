/* Jeux favoris : une étoile sur chaque jeu, un filtre « Mes favoris ».
   Enregistrés dans ce navigateur, séparément pour chaque compte Google (clé suffixée par l'adresse). */
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
  try {
    localStorage.setItem(favCle(), JSON.stringify(L));
  } catch (e) {}
  return i < 0;
}
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
