// SERVEUR DU SITE — un seul script Apps Script pour tout ce que le site envoie à Google.
// À coller dans le projet Apps Script de votre Google Sheet (Extensions > Apps Script), à la place de
// l'ancien « ajouter_jeu ». Puis : Déployer > Gérer les déploiements > ✎ > Version : Nouvelle version.
//
// Ce que fait ce script :
//   - reçoit les jeux proposés depuis « Ma séance » (ligne ajoutée, non publiée) ;
//   - enregistre / supprime les séances (onglet « Séances », créé tout seul) ;
//   - envoie les schémas dessinés sur le site directement dans votre dépôt GitHub (dossier schemas/) ;
//   - permet de relire, corriger, valider ou refuser les jeux en attente depuis le site (mot de passe admin).
//
// ⚠ Ce script est privé : ne le partagez pas (il contient votre mot de passe et votre jeton GitHub).

// 1) Le « mot de passe du site » : le même que GAME_ADD_KEY dans config.js. Il sert seulement à éviter
//    qu'un inconnu envoie n'importe quoi. Il est visible dans config.js : ce n'est PAS un secret.
const CLE_SITE = "changez-moi";

// 2) Le mot de passe administrateur : celui que vous taperez dans le site pour valider les jeux.
//    Il ne doit JAMAIS être dans config.js.
const MOT_DE_PASSE_ADMIN = "changez-moi-aussi";

// 3) GitHub (pour les schémas). Créez un jeton : GitHub > Settings > Developer settings >
//    Personal access tokens > Fine-grained tokens > votre dépôt uniquement >
//    Permissions > Contents : « Read and write ».
const GITHUB_JETON = "";
const GITHUB_DEPOT = "votre-compte/votre-depot"; // ex. "christophe/jeux-escalade"
const GITHUB_BRANCHE = "main";
const URL_DU_SITE = "https://votre-compte.github.io/votre-depot/"; // avec la barre / à la fin

const NOM_FEUILLE = ""; // vide : la feuille qui contient les colonnes « Titre » et « Principe » est trouvée toute seule

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const action = d.action || "jeu";
    if (action.indexOf("admin_") === 0) {
      if (d.admin !== MOT_DE_PASSE_ADMIN)
        return rep({ ok: false, error: "mot de passe administrateur incorrect" });
      if (action === "admin_liste") return adminListe();
      if (action === "admin_enregistrer") return adminEnregistrer(d);
      if (action === "admin_refuser") return adminRefuser(d);
      return rep({ ok: false, error: "action inconnue" });
    }
    if (d.key !== CLE_SITE)
      return rep({
        ok: false,
        error: "mot de passe du site incorrect (GAME_ADD_KEY de config.js ≠ CLE_SITE du script)",
      });
    if (action === "seance") return enregistrerSeance(d.seance || {});
    if (action === "seance_suppr") return supprimerSeance(d.id);
    if (action === "schema") return envoyerSchema(d);
    return ajouterJeu(d.jeu || {});
  } catch (err) {
    return rep({ ok: false, error: String(err) });
  }
}

/* ---------- jeux ---------- */
function feuilleJeux() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = NOM_FEUILLE ? ss.getSheetByName(NOM_FEUILLE) : null;
  if (!sh)
    sh = ss.getSheets().find(s => {
      const h = s.getRange(1, 1, 1, Math.max(1, s.getLastColumn())).getValues()[0];
      return h.indexOf("Titre") >= 0 && h.indexOf("Principe") >= 0;
    });
  return sh;
}
// met une « • » devant chaque ligne (on ne l'écrit plus à la main)
function puces(t) {
  return String(t || "")
    .split(/\n/)
    .map(l => l.replace(/^\s*[•\-–▸]\s*/, "").trim())
    .filter(Boolean)
    .map(l => "• " + l)
    .join("\n");
}
const AVEC_PUCES = ["Plus facile", "Plus difficile", "Critères de réussite"];
function ajouterJeu(jeu) {
  if (!jeu.Titre || !jeu.Principe) return rep({ ok: false, error: "titre ou principe manquant" });
  const sh = feuilleJeux();
  if (!sh) return rep({ ok: false, error: "feuille des fiches introuvable" });
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const ligne = head.map(h =>
    h === "Horodateur"
      ? new Date()
      : h === "Publié"
        ? ""
        : jeu[h] !== undefined
          ? AVEC_PUCES.indexOf(h) >= 0
            ? puces(jeu[h]).slice(0, 5000)
            : String(jeu[h]).slice(0, 5000)
          : ""
  );
  sh.appendRow(ligne);
  return rep({ ok: true });
}
function estPublie(v) {
  return /^(oui|yes|true|1|x|✓)$/i.test(String(v || "").trim());
}
// Jeux en attente = lignes dont « Publié » n'est ni OUI ni REFUSÉ
function adminListe() {
  const sh = feuilleJeux();
  if (!sh) return rep({ ok: false, error: "feuille des fiches introuvable" });
  const n = sh.getLastRow();
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  const jeux = [];
  if (n > 1) {
    const vals = sh.getRange(2, 1, n - 1, head.length).getDisplayValues();
    vals.forEach((r, i) => {
      const pub = String(r[head.indexOf("Publié")] || "").trim();
      const titre = String(r[head.indexOf("Titre")] || "").trim();
      if (!titre || estPublie(pub) || /^refus/i.test(pub)) return;
      const o = {};
      head.forEach((h, k) => (o[h] = r[k]));
      jeux.push({ ligne: i + 2, valeurs: o });
    });
  }
  return rep({ ok: true, colonnes: head, jeux: jeux });
}
function adminEnregistrer(d) {
  const sh = feuilleJeux();
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  const l = Number(d.ligne);
  if (!(l >= 2 && l <= sh.getLastRow())) return rep({ ok: false, error: "ligne introuvable" });
  const titreActuel = String(sh.getRange(l, head.indexOf("Titre") + 1).getValue()).trim();
  if (titreActuel !== String(d.titreAvant || "").trim())
    return rep({ ok: false, error: "la feuille a changé : rechargez la liste" });
  const v = d.valeurs || {};
  head.forEach((h, k) => {
    if (h === "Horodateur" || h === "Publié" || v[h] === undefined) return;
    let x = String(v[h]).slice(0, 5000);
    if (AVEC_PUCES.indexOf(h) >= 0) x = puces(x);
    sh.getRange(l, k + 1).setValue(x);
  });
  if (d.publier) sh.getRange(l, head.indexOf("Publié") + 1).setValue("OUI");
  return rep({ ok: true });
}
function adminRefuser(d) {
  const sh = feuilleJeux();
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  const l = Number(d.ligne);
  if (!(l >= 2 && l <= sh.getLastRow())) return rep({ ok: false, error: "ligne introuvable" });
  const titreActuel = String(sh.getRange(l, head.indexOf("Titre") + 1).getValue()).trim();
  if (titreActuel !== String(d.titreAvant || "").trim())
    return rep({ ok: false, error: "la feuille a changé : rechargez la liste" });
  sh.getRange(l, head.indexOf("Publié") + 1).setValue("REFUSÉ");
  return rep({ ok: true });
}

/* ---------- séances ---------- */
function feuilleSeances() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ent = ["id", "Horodateur", "Titre", "Thème", "Éducateurs", "Dates", "Exercices", "Données", "Publié"];
  let sh = ss.getSheetByName("Séances");
  if (!sh) {
    sh = ss.insertSheet("Séances");
    sh.appendRow(ent);
    sh.setFrozenRows(1);
  }
  return sh;
}
function ligneSeance(sh, id) {
  const n = sh.getLastRow();
  const ids = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues().map(r => String(r[0])) : [];
  const i = ids.indexOf(String(id));
  return i >= 0 ? i + 2 : 0;
}
function enregistrerSeance(s) {
  if (!s.id || !s.data) return rep({ ok: false, error: "séance incomplète" });
  const sh = feuilleSeances();
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
  const l = ligneSeance(sh, s.id);
  if (l) sh.getRange(l, 1, 1, ligne.length).setValues([ligne]);
  else sh.appendRow(ligne);
  return rep({ ok: true });
}
function supprimerSeance(id) {
  const sh = feuilleSeances();
  const l = ligneSeance(sh, id);
  if (l) sh.deleteRow(l);
  return rep({ ok: true });
}

/* ---------- schémas → GitHub ---------- */
function envoyerSchema(d) {
  if (!GITHUB_JETON) return rep({ ok: false, error: "GITHUB_JETON absent dans le script" });
  if (!d.data || d.data.length > 8000000)
    return rep({ ok: false, error: "image absente ou trop lourde" });
  const nom =
    String(d.name || "schema.png")
      .replace(/[^\w\- .]/g, "")
      .replace(/\.png$/i, "")
      .slice(0, 60) || "schema";
  const chemin = "schemas/" + nom + ".png";
  const api = "https://api.github.com/repos/" + GITHUB_DEPOT + "/contents/" + chemin;
  const entetes = {
    Authorization: "Bearer " + GITHUB_JETON,
    Accept: "application/vnd.github+json",
    "User-Agent": "site-jeux-escalade",
  };
  const ex = UrlFetchApp.fetch(api + "?ref=" + GITHUB_BRANCHE, {
    headers: entetes,
    muteHttpExceptions: true,
  });
  const corps = { message: "Schéma " + nom, content: d.data, branch: GITHUB_BRANCHE };
  if (ex.getResponseCode() === 200) corps.sha = JSON.parse(ex.getContentText()).sha;
  const r = UrlFetchApp.fetch(api, {
    method: "put",
    headers: entetes,
    contentType: "application/json",
    payload: JSON.stringify(corps),
    muteHttpExceptions: true,
  });
  const c = r.getResponseCode();
  if (c !== 200 && c !== 201)
    return rep({ ok: false, error: "GitHub a refusé (" + c + ") : " + r.getContentText().slice(0, 160) });
  return rep({ ok: true, url: URL_DU_SITE + chemin });
}

function rep(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(
    ContentService.MimeType.JSON
  );
}
