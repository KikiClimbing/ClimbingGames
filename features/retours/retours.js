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
  const form = CONFIG.GAME_ADD_URL
    ? `<p style="margin-top:12px"><a class="lk" data-retour="${esc(g.Code || "")}" style="cursor:pointer">Donner mon retour sur ce jeu ✎</a></p>`
    : CONFIG.RETOUR_FORM_URL
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

/* formulaire de retour en popup : envoyé directement à l'onglet « Retours » (pas de Google Forms) */
function retourPopup(code) {
  const g = DATA.find(x => x.Code === code);
  const pseudo = (typeof AUTH !== "undefined" && AUTH.user && AUTH.user.nom) || "";
  modal(
    "Mon retour sur " + esc(g ? g.Titre : code),
    `<div class="box"><label class="sml">Mon prénom ou pseudo<input id="rtAuteur" value="${esc(pseudo)}" maxlength="60"></label>
    <label class="sml">Public (âge, niveau)<input id="rtPublic" maxlength="80" placeholder="Ex. 8-10 ans, débutants"></label>
    <label class="sml">Ça a marché ?<select id="rtNote"><option value="">—</option><option value="5">5 · Très bien</option><option value="4">4 · Bien</option><option value="3">3 · Moyen</option><option value="2">2 · Peu</option><option value="1">1 · Pas du tout</option></select></label>
    <label class="sml">Ce qui a bien marché<textarea id="rtBien" rows="3" maxlength="1500"></textarea></label>
    <label class="sml">Ce qu'il faut changer<textarea id="rtChanger" rows="3" maxlength="1500"></textarea></label>
    <div class="tools" style="margin-top:10px"><a class="btn" id="rtEnvoi" style="background:#2E7D4F;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Envoyer mon retour</a><span id="rtMsg" style="font-weight:700"></span></div>
    <p class="hint" style="margin:6px 0 0">Votre retour est relu avant d'apparaître sur la fiche.</p></div>`
  );
  $("#rtEnvoi").addEventListener("click", async () => {
    const m = $("#rtMsg");
    const r = {
      code,
      auteur: $("#rtAuteur").value.trim(),
      public: $("#rtPublic").value.trim(),
      note: $("#rtNote").value,
      bien: $("#rtBien").value.trim(),
      changer: $("#rtChanger").value.trim(),
    };
    if (!r.bien && !r.changer) {
      m.style.color = "#B2263A";
      m.textContent = "Écrivez au moins un commentaire.";
      return;
    }
    m.style.color = "#6B7280";
    m.textContent = "Envoi…";
    try {
      const j = await (
        await fetch(CONFIG.GAME_ADD_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ key: CONFIG.GAME_ADD_KEY || "", action: "retour", retour: r }),
        })
      ).json();
      if (!j.ok) throw new Error(j.error || "refusé");
      modalFermer();
      toast("✓ Merci ! Votre retour sera publié après relecture.");
    } catch (e) {
      m.style.color = "#B2263A";
      m.textContent = "Échec : " + e.message;
    }
  });
}
registerClick(e => {
  const b = e.target.closest("[data-retour]");
  if (!b) return;
  retourPopup(b.dataset.retour);
  return true;
});
