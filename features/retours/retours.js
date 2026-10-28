/* Retours de terrain sur les jeux (formulaire + feuille publiée) */
let RETOURS = [];
async function loadRetours() {
  if (!CONFIG.RETOURS_CSV_URL) return;
  try {
    const r = await fetch(CONFIG.RETOURS_CSV_URL, { cache: "no-store" });
    if (!r.ok) throw 0;
    RETOURS = parseCSV(await r.text()).filter(
      x => (x["Code du jeu"] || x.Code) && /^(oui|yes|true|1|x|✓)$/i.test(x["Publié"] || "")
    );
  } catch (e) {
    RETOURS = [];
  }
}
function retoursHTML(g) {
  const L = RETOURS.filter(
    x =>
      (x["Code du jeu"] || x.Code || "").trim().toUpperCase() === String(g.Code || "").toUpperCase()
  );
  const form = CONFIG.RETOUR_FORM_URL
    ? `<p style="margin-top:12px"><a target="_blank" rel="noopener" class="lk" href="${esc(CONFIG.RETOUR_FORM_URL)}">Donner mon retour sur ce jeu ↗</a></p>`
    : "";
  if (!L.length && !form) return "";
  const notes = L.map(x => parseFloat(x["Note"] || x["Ça a marché ?"] || "")).filter(
    n => !isNaN(n)
  );
  const moy = notes.length ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1) : "";
  return `<div style="margin-top:16px"><b style="font-size:11px;letter-spacing:1px;color:var(--muted)">RETOURS DU TERRAIN${L.length ? " (" + L.length + (moy ? " · note moyenne " + moy + "/5" : "") + ")" : ""}</b>${L.map(x => `<div class="box" style="margin:8px 0;padding:10px 14px;font-size:14.5px"><b>${esc(x.Auteur || "Un éducateur")}</b>${x.Public ? " · " + esc(x.Public) : ""}<br>${x["Ce qui a bien marché"] ? "👍 " + esc(x["Ce qui a bien marché"]) + "<br>" : ""}${x["À changer"] || x["Ce qu'il faut changer"] ? "✎ " + esc(x["À changer"] || x["Ce qu'il faut changer"]) : ""}</div>`).join("")}${form}</div>`;
}
registerLoader(loadRetours);
