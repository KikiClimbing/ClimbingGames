// Reçoit les schémas dessinés sur le site et les range dans un dossier Drive.
// 1) Choisissez un mot de passe ci-dessous (le même ira dans config.js : SCHEMA_UPLOAD_KEY).
// 2) Collez l'identifiant du dossier Drive voulu (la fin de son adresse), ou laissez vide : un dossier sera créé.
const MOT_DE_PASSE = "changez-moi";
const DOSSIER_ID = "";

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.key !== MOT_DE_PASSE) return rep({ ok: false, error: "mot de passe incorrect" });
    if (!d.data || d.data.length > 8000000)
      return rep({ ok: false, error: "image absente ou trop lourde" });
    const nom =
      String(d.name || "schema.png")
        .replace(/[^\w\- .àâäçéèêëîïôöùûüÀÉÈ]/g, "")
        .slice(0, 80) || "schema.png";
    const blob = Utilities.newBlob(Utilities.base64Decode(d.data), "image/png", nom);
    const f = dossier().createFile(blob);
    f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return rep({ ok: true, url: f.getUrl() });
  } catch (err) {
    return rep({ ok: false, error: String(err) });
  }
}
function dossier() {
  if (DOSSIER_ID) return DriveApp.getFolderById(DOSSIER_ID);
  const it = DriveApp.getFoldersByName("Schémas jeux escalade");
  return it.hasNext() ? it.next() : DriveApp.createFolder("Schémas jeux escalade");
}
function rep(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(
    ContentService.MimeType.JSON
  );
}
