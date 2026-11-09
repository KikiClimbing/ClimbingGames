/* Chargement de la feuille Google publiée (CSV) */
/* codes de la feuille qui en cachent un autre : deux lignes de la feuille avec le même code, ou un code pris
   par un jeu intégré au site (prépa, jeux supplémentaires) sous un autre titre. Le jeu de la feuille l'emporte, l'autre disparaît. */
let CODES_DOUBLONS = [];
function codesEnDouble(rows) {
  const L = [],
    vus = {};
  rows.forEach(g => {
    const c = String(g.Code || "").trim();
    if (!c) return;
    if (vus[c]) L.push({ code: c, a: vus[c].Titre, b: g.Titre, ou: "feuille" });
    else vus[c] = g;
  });
  const integres = (typeof PREPA_EMBED !== "undefined" ? PREPA_EMBED : []).concat(
    typeof JEUX_EXTRA !== "undefined" ? JEUX_EXTRA : []
  );
  integres.forEach(e => {
    const g = vus[e.Code];
    if (g && norm(g.Titre) !== norm(e.Titre)) L.push({ code: e.Code, a: e.Titre, b: g.Titre, ou: "site" });
  });
  return L;
}
const doublonsTexte = () =>
  CODES_DOUBLONS.map(
    d =>
      "Code " + d.code + " en double : « " + d.a + " » et « " + d.b + " » (" + (d.ou === "site" ? "jeu du site" : "deux lignes de la feuille") + "). Change le code de l'un des deux dans la feuille, sinon un seul des deux s'affiche."
  ).join("\n");
function doublonsBanniere() {
  const w = $("#warn");
  if (!w || !CODES_DOUBLONS.length || typeof compteAdmin !== "function" || !compteAdmin()) return;
  w.style.display = "block";
  w.style.whiteSpace = "pre-line";
  w.textContent = doublonsTexte();
}
async function loadSheet() {
  if (!CONFIG.SHEET_CSV_URL) return;
  try {
    const r = await fetch(CONFIG.SHEET_CSV_URL, { cache: "no-store" });
    if (!r.ok) throw 0;
    const rows = parseCSV(await r.text())
      .filter(pubOK)
      .filter(g => g.Titre);
    if (rows.length) {
      CODES_DOUBLONS = codesEnDouble(rows);
      DATA = avecPrepa(rows);
      doublonsBanniere();
    }
  } catch (e) {
    const w = $("#warn");
    if (w) {
      w.style.display = "block";
      w.textContent =
        "La feuille Google n'a pas pu être chargée : affichage de la dernière version enregistrée dans le site.";
    }
  }
}
registerLoader(loadSheet);
