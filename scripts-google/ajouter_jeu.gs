// Reçoit un jeu écrit sur le site (« Ma séance » > jeu libre > Ajouter à la bibliothèque)
// et l'ajoute comme une nouvelle ligne dans la feuille des fiches, SANS le publier :
// vous le relisez, vous complétez la colonne « Code », puis vous écrivez OUI dans « Publié ».
// À coller dans le projet Apps Script de votre Google Sheet (Extensions > Apps Script).
const MOT_DE_PASSE = "changez-moi";
const NOM_FEUILLE = ""; // laissez vide : la feuille qui contient les colonnes « Titre » et « Principe » est trouvée toute seule

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.key !== MOT_DE_PASSE) return rep({ ok: false, error: "mot de passe incorrect" });
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
