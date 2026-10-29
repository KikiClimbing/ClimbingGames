// Reçoit un jeu écrit sur le site (« Ma séance » > jeu libre > Ajouter à la bibliothèque)
// et l'ajoute comme une nouvelle ligne dans la feuille des fiches, SANS le publier :
// vous le relisez, vous complétez la colonne « Code », puis vous écrivez OUI dans « Publié ».
// Reçoit aussi les séances créées avec « Ma séance » (action "seance") et les range dans l'onglet « Séances »
// (créé automatiquement). Pour les afficher dans le site : Fichier > Partager > Publier sur le Web > onglet
// « Séances » > format CSV, puis copiez l'adresse dans config.js (SEANCES_CSV_URL).
// À coller dans le projet Apps Script de votre Google Sheet (Extensions > Apps Script).
const MOT_DE_PASSE = "changez-moi";
const NOM_FEUILLE = ""; // laissez vide : la feuille qui contient les colonnes « Titre » et « Principe » est trouvée toute seule

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.key !== MOT_DE_PASSE) return rep({ ok: false, error: "mot de passe incorrect" });
    if (d.action === "seance") return enregistrerSeance(d.seance || {});
    const jeu = d.jeu || {};
    if (!jeu.Titre || !jeu.Principe) return rep({ ok: false, error: "titre ou principe manquant" });
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = NOM_FEUILLE ? ss.getSheetByName(NOM_FEUILLE) : null;
    if (!sh)
      sh = ss.getSheets().find(s => {
        const h = s.getRange(1, 1, 1, Math.max(1, s.getLastColumn())).getValues()[0];
        return h.indexOf("Titre") >= 0 && h.indexOf("Principe") >= 0;
      });
    if (!sh) return rep({ ok: false, error: "feuille des fiches introuvable" });
    const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const ligne = head.map(h =>
      h === "Horodateur"
        ? new Date()
        : h === "Publié"
          ? ""
          : jeu[h] !== undefined
            ? String(jeu[h]).slice(0, 5000)
            : ""
    );
    sh.appendRow(ligne);
    return rep({ ok: true });
  } catch (err) {
    return rep({ ok: false, error: String(err) });
  }
}
function rep(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(
    ContentService.MimeType.JSON
  );
}

// Onglet « Séances » : une ligne par séance, mise à jour si l'identifiant existe déjà.
function enregistrerSeance(s) {
  if (!s.id || !s.data) return rep({ ok: false, error: "séance incomplète" });
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ent = ["id", "Horodateur", "Titre", "Thème", "Éducateurs", "Dates", "Exercices", "Données", "Publié"];
  let sh = ss.getSheetByName("Séances");
  if (!sh) {
    sh = ss.insertSheet("Séances");
    sh.appendRow(ent);
    sh.setFrozenRows(1);
  }
  const ligne = [
    s.id,
    new Date().toISOString(),
    String(s.titre || "").slice(0, 300),
    String(s.theme || "").slice(0, 300),
    String(s.educ || "").slice(0, 300),
    String(s.dates || "").slice(0, 300),
    s.nb || "",
    String(s.data).slice(0, 49000),
    "OUI",
  ];
  const n = sh.getLastRow();
  const ids = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues().map(r => String(r[0])) : [];
  const i = ids.indexOf(String(s.id));
  if (i >= 0) sh.getRange(i + 2, 1, 1, ligne.length).setValues([ligne]);
  else sh.appendRow(ligne);
  return rep({ ok: true });
}
