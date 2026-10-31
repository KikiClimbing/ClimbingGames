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

// 4) Comptes Google (facultatif). Laissez GOOGLE_CLIENT_ID vide pour garder l'ancien fonctionnement (sans comptes).
//    GOOGLE_CLIENT_ID : l'identifiant client OAuth créé dans la console Google Cloud (voir docs/maintenance.md, § Comptes).
//    ADMIN_EMAILS : votre adresse Google (plusieurs : séparées par des virgules). Ces comptes voient tout.
//    SECRET_SESSION : une longue suite de caractères au hasard (jamais dans config.js).
const GOOGLE_CLIENT_ID = "";
const ADMIN_EMAILS = "";
const SECRET_SESSION = "changez-moi-par-une-longue-suite-au-hasard";
const DUREE_SESSION_JOURS = 30;

const NOM_FEUILLE = ""; // vide : la feuille qui contient les colonnes « Titre » et « Principe » est trouvée toute seule

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const action = d.action || "jeu";
    if (action.indexOf("admin_") === 0) {
      if (d.admin !== MOT_DE_PASSE_ADMIN)
        return rep({ ok: false, error: "mot de passe administrateur incorrect" });
      if (action === "admin_liste") return adminListe(d.tous);
      if (action === "admin_enregistrer") return adminEnregistrer(d);
      if (action === "admin_refuser") return adminRefuser(d);
      if (action === "admin_schema") return adminSchema(d);
      if (action === "admin_schemas") return adminSchemasListe();
      if (action === "admin_schema_fichier") return adminSchemaFichier(d);
      return rep({ ok: false, error: "action inconnue" });
    }
    if (action === "auth") return connexionGoogle(d);
    if (GOOGLE_CLIENT_ID && /^(seance|equipe)/.test(action)) {
      const u = lireSession(d.session);
      if (!u) return rep({ ok: false, error: "connexion requise : reconnectez-vous", code: "auth" });
      if (action === "seances_liste") return listeSeances(u);
      if (action === "seance") return enregistrerSeance(d.seance || {}, u);
      if (action === "seance_suppr") return supprimerSeance(d.id, u);
      if (action === "seance_partage") return partagerSeance(d.id, d.partage, u);
      if (action === "equipes_liste") return listeEquipes(u);
      if (action === "equipe_enregistrer") return enregistrerEquipe(d.equipe || {}, u);
      if (action === "equipe_suppr") return supprimerEquipe(d.id, u);
      if (action === "equipe_quitter") return quitterEquipe(d.id, u);
      return rep({ ok: false, error: "action inconnue" });
    }
    if (d.key !== CLE_SITE)
      return rep({
        ok: false,
        error: "mot de passe du site incorrect (GAME_ADD_KEY de config.js ≠ CLE_SITE du script)",
      });
    if (action === "seance") return enregistrerSeance(d.seance || {}, null);
    if (action === "seance_suppr") return supprimerSeance(d.id, null);
    if (action === "schema") return envoyerSchema(d);
    if (action === "schemas_liste") return adminSchemasListe();
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
  colonneAssurer(sh, "Remplace le jeu", jeu);
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
// ajoute la colonne si elle manque (seulement quand le jeu proposé la renseigne)
function colonneAssurer(sh, nom, jeu) {
  if (!jeu[nom]) return;
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  if (head.indexOf(nom) < 0) sh.getRange(1, head.length + 1).setValue(nom);
}
function estPublie(v) {
  return /^(oui|yes|true|1|x|✓)$/i.test(String(v || "").trim());
}
// Jeux en attente = lignes dont « Publié » n'est ni OUI ni REFUSÉ ; avec tous = true : tous les jeux
function adminListe(tous) {
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
      if (!titre) return;
      if (!tous && (estPublie(pub) || /^refus/i.test(pub))) return;
      const o = {};
      head.forEach((h, k) => (o[h] = r[k]));
      jeux.push({ ligne: i + 2, valeurs: o, publie: estPublie(pub) });
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
  if (d.retirer) sh.getRange(l, head.indexOf("Publié") + 1).setValue("");
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

/* ---------- comptes Google ---------- */
function b64u(octets) {
  return Utilities.base64EncodeWebSafe(octets).replace(/=+$/, "");
}
function signer(txt) {
  return b64u(Utilities.computeHmacSha256Signature(txt, SECRET_SESSION));
}
function emailsAdmin() {
  return String(ADMIN_EMAILS || "")
    .toLowerCase()
    .split(/[,;\s]+/)
    .filter(Boolean);
}
function creerSession(email, nom) {
  const corps = b64u(
    Utilities.newBlob(
      JSON.stringify({ e: email, n: nom, x: Date.now() + DUREE_SESSION_JOURS * 86400000 })
    ).getBytes()
  );
  return corps + "." + signer(corps);
}
function lireSession(tok) {
  const p = String(tok || "").split(".");
  if (p.length !== 2 || signer(p[0]) !== p[1]) return null;
  try {
    const o = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(p[0])).getDataAsString());
    if (!o.e || o.x < Date.now()) return null;
    return { email: o.e, nom: o.n || o.e, admin: emailsAdmin().indexOf(o.e) >= 0 };
  } catch (e) {
    return null;
  }
}
// échange le jeton Google (connexion « Se connecter avec Google ») contre une session du site
function connexionGoogle(d) {
  if (!GOOGLE_CLIENT_ID) return rep({ ok: false, error: "comptes non activés (GOOGLE_CLIENT_ID vide)" });
  const r = UrlFetchApp.fetch(
    "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(String(d.credential || "")),
    { muteHttpExceptions: true }
  );
  if (r.getResponseCode() !== 200) return rep({ ok: false, error: "connexion Google refusée" });
  const t = JSON.parse(r.getContentText());
  if (t.aud !== GOOGLE_CLIENT_ID || String(t.email_verified) !== "true" || !t.email)
    return rep({ ok: false, error: "jeton Google invalide" });
  const email = String(t.email).toLowerCase(),
    nom = String(t.name || email).slice(0, 80);
  return rep({
    ok: true,
    session: creerSession(email, nom),
    user: { email: email, nom: nom, admin: emailsAdmin().indexOf(email) >= 0 },
  });
}

/* ---------- séances et cycles ---------- */
const COLONNES_SEANCES = ["id", "Horodateur", "Titre", "Thème", "Éducateurs", "Dates", "Exercices", "Données", "Publié", "Propriétaire", "Nom", "Partage"];
function feuilleSeances() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName("Séances");
  if (!sh) {
    sh = ss.insertSheet("Séances");
    sh.appendRow(COLONNES_SEANCES);
    sh.setFrozenRows(1);
  }
  // colonnes ajoutées plus tard (comptes) : créées si elles manquent
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  COLONNES_SEANCES.forEach(c => {
    if (head.indexOf(c) < 0) {
      sh.getRange(1, head.length + 1).setValue(c);
      head.push(c);
    }
  });
  return sh;
}
function enteteSeances(sh) {
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
}
function ligneSeance(sh, id) {
  const n = sh.getLastRow();
  const ids = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues().map(r => String(r[0])) : [];
  const i = ids.indexOf(String(id));
  return i >= 0 ? i + 2 : 0;
}
function proprietaireDe(valeur) {
  return String(valeur || "").trim().toLowerCase() || emailsAdmin()[0] || "";
}
function listePartage(txt) {
  return String(txt || "")
    .toLowerCase()
    .split(/[,;\s]+/)
    .filter(Boolean);
}
// séances visibles par l'utilisateur : les siennes, celles partagées avec lui ; l'administrateur voit tout
function listeSeances(u) {
  const mesEq = equipesLues()
    .filter(q => q.owner === u.email || q.membres.indexOf(u.email) >= 0)
    .map(q => "team:" + q.id);
  const sh = feuilleSeances();
  const head = enteteSeances(sh);
  const n = sh.getLastRow();
  const out = [];
  if (n > 1) {
    const vals = sh.getRange(2, 1, n - 1, head.length).getValues();
    const ip = head.indexOf("Propriétaire"),
      is = head.indexOf("Partage");
    vals.forEach(r => {
      if (!r[0]) return;
      const proprio = proprietaireDe(r[ip]);
      const part = listePartage(r[is]);
      if (u.admin || proprio === u.email || part.indexOf(u.email) >= 0 || part.some(t => mesEq.indexOf(t) >= 0)) {
        const o = {};
        head.forEach((h, k) => (o[h] = h === "Horodateur" && r[k] instanceof Date ? r[k].toISOString() : String(r[k])));
        o["Propriétaire"] = proprio;
        out.push(o);
      }
    });
  }
  return rep({ ok: true, seances: out });
}
function enregistrerSeance(s, u) {
  if (!s.id || !s.data) return rep({ ok: false, error: "séance incomplète" });
  const sh = feuilleSeances();
  const head = enteteSeances(sh);
  const l = ligneSeance(sh, s.id);
  const ip = head.indexOf("Propriétaire");
  if (l && u && !u.admin && proprietaireDe(sh.getRange(l, ip + 1).getValue()) !== u.email)
    return rep({ ok: false, error: "cette séance appartient à un autre compte : faites-en une copie" });
  const val = {
    id: s.id,
    Horodateur: new Date().toISOString(),
    Titre: String(s.titre || "").slice(0, 300),
    "Thème": String(s.theme || "").slice(0, 300),
    "Éducateurs": String(s.educ || "").slice(0, 300),
    Dates: String(s.dates || "").slice(0, 300),
    Exercices: s.nb || "",
    "Données": String(s.data).slice(0, 49000),
    "Publié": "OUI",
  };
  if (u && !l) {
    val["Propriétaire"] = u.email;
    val["Nom"] = u.nom;
    val["Partage"] = "";
  }
  if (l) {
    head.forEach((h, k) => {
      if (val[h] !== undefined) sh.getRange(l, k + 1).setValue(val[h]);
    });
  } else sh.appendRow(head.map(h => (val[h] !== undefined ? val[h] : "")));
  return rep({ ok: true });
}
function supprimerSeance(id, u) {
  const sh = feuilleSeances();
  const l = ligneSeance(sh, id);
  if (!l) return rep({ ok: true });
  const ip = enteteSeances(sh).indexOf("Propriétaire");
  if (u && !u.admin && proprietaireDe(sh.getRange(l, ip + 1).getValue()) !== u.email)
    return rep({ ok: false, error: "seul le propriétaire peut supprimer" });
  sh.deleteRow(l);
  return rep({ ok: true });
}
// partage : liste d'adresses Google (par personne). Réservé au propriétaire et à l'administrateur.
function partagerSeance(id, liste, u) {
  const sh = feuilleSeances();
  const l = ligneSeance(sh, id);
  if (!l) return rep({ ok: false, error: "séance introuvable" });
  const head = enteteSeances(sh);
  if (!u.admin && proprietaireDe(sh.getRange(l, head.indexOf("Propriétaire") + 1).getValue()) !== u.email)
    return rep({ ok: false, error: "seul le propriétaire peut partager" });
  const ok = [];
  const eq = equipesLues();
  (Array.isArray(liste) ? liste : []).forEach(x => {
    const e = String(x).trim().toLowerCase();
    if (ok.indexOf(e) >= 0 || ok.length >= 200) return;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) ok.push(e);
    else if (/^team:[a-z0-9]+$/.test(e)) {
      // on ne partage qu'avec une équipe dont on fait partie
      const q = eq.find(z => "team:" + z.id === e);
      if (q && (u.admin || q.owner === u.email || q.membres.indexOf(u.email) >= 0)) ok.push(e);
    }
  });
  sh.getRange(l, head.indexOf("Partage") + 1).setValue(ok.join(", "));
  return rep({ ok: true, partage: ok });
}

/* ---------- équipes (partage d'une séance avec plusieurs personnes à la fois) ---------- */
const COLONNES_EQUIPES = ["id", "Nom", "Propriétaire", "Nom propriétaire", "Membres", "Créée"];
function feuilleEquipes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName("Équipes");
  if (!sh) {
    sh = ss.insertSheet("Équipes");
    sh.appendRow(COLONNES_EQUIPES);
    sh.setFrozenRows(1);
  }
  return sh;
}
function equipesLues() {
  const sh = feuilleEquipes();
  const n = sh.getLastRow();
  if (n < 2) return [];
  return sh
    .getRange(2, 1, n - 1, COLONNES_EQUIPES.length)
    .getValues()
    .filter(r => r[0])
    .map(r => ({
      id: String(r[0]),
      nom: String(r[1]),
      owner: String(r[2]).toLowerCase(),
      ownerNom: String(r[3]),
      membres: listePartage(r[4]),
    }));
}
function formeEquipe(q, u) {
  return { id: q.id, nom: q.nom, owner: q.owner, ownerNom: q.ownerNom, membres: q.membres, mien: q.owner === u.email || u.admin };
}
function listeEquipes(u) {
  const L = equipesLues().filter(q => u.admin || q.owner === u.email || q.membres.indexOf(u.email) >= 0);
  return rep({ ok: true, equipes: L.map(q => formeEquipe(q, u)) });
}
function ligneEquipe(sh, id) {
  const n = sh.getLastRow();
  const ids = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues().map(r => String(r[0])) : [];
  const i = ids.indexOf(String(id));
  return i >= 0 ? i + 2 : 0;
}
function adressesValides(liste) {
  const ok = [];
  (Array.isArray(liste) ? liste : []).forEach(x => {
    const e = String(x).trim().toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && ok.indexOf(e) < 0 && ok.length < 500) ok.push(e);
  });
  return ok;
}
function enregistrerEquipe(q, u) {
  const nom = String(q.nom || "").trim().slice(0, 80);
  if (!nom) return rep({ ok: false, error: "nom de l'équipe manquant" });
  const membres = adressesValides(q.membres).filter(m => m !== u.email);
  const sh = feuilleEquipes();
  let id = String(q.id || "");
  const l = id ? ligneEquipe(sh, id) : 0;
  if (l) {
    const proprio = String(sh.getRange(l, 3).getValue()).toLowerCase();
    if (!u.admin && proprio !== u.email) return rep({ ok: false, error: "seul le responsable peut modifier l'équipe" });
    sh.getRange(l, 2).setValue(nom);
    sh.getRange(l, 5).setValue(membres.join(", "));
  } else {
    id = "e" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
    sh.appendRow([id, nom, u.email, u.nom, membres.join(", "), new Date().toISOString()]);
  }
  return rep({ ok: true, id: id });
}
function supprimerEquipe(id, u) {
  const sh = feuilleEquipes();
  const l = ligneEquipe(sh, id);
  if (!l) return rep({ ok: true });
  if (!u.admin && String(sh.getRange(l, 3).getValue()).toLowerCase() !== u.email)
    return rep({ ok: false, error: "seul le responsable peut supprimer l'équipe" });
  sh.deleteRow(l);
  return rep({ ok: true });
}
function quitterEquipe(id, u) {
  const sh = feuilleEquipes();
  const l = ligneEquipe(sh, id);
  if (!l) return rep({ ok: true });
  const reste = listePartage(sh.getRange(l, 5).getValue()).filter(m => m !== u.email);
  sh.getRange(l, 5).setValue(reste.join(", "));
  return rep({ ok: true });
}

/* ---------- schémas → GitHub ---------- */
// écrit (ou remplace) un fichier du dépôt ; contenu en base64 ; renvoie null si OK, sinon le message d'erreur
function githubEcrire(chemin, base64, message) {
  if (!GITHUB_JETON) return "GITHUB_JETON absent dans le script";
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
  const corps = { message: message, content: base64, branch: GITHUB_BRANCHE };
  if (ex.getResponseCode() === 200) corps.sha = JSON.parse(ex.getContentText()).sha;
  const r = UrlFetchApp.fetch(api, {
    method: "put",
    headers: entetes,
    contentType: "application/json",
    payload: JSON.stringify(corps),
    muteHttpExceptions: true,
  });
  const c = r.getResponseCode();
  return c === 200 || c === 201 ? null : "GitHub a refusé (" + c + ") : " + r.getContentText().slice(0, 160);
}
function nomFichier(n, defaut) {
  return (
    String(n || "")
      .replace(/\.(png|json)$/i, "")
      .replace(/[^\w\-]/g, "")
      .slice(0, 60) || defaut
  );
}
function envoyerSchema(d) {
  if (!d.data || d.data.length > 8000000)
    return rep({ ok: false, error: "image absente ou trop lourde" });
  const nom = nomFichier(d.name, "schema");
  let err = githubEcrire("schemas/" + nom + ".png", d.data, "Schéma " + nom);
  if (!err && d.source)
    err = githubEcrire(
      "schemas/" + nom + ".json",
      Utilities.base64Encode(Utilities.newBlob(String(d.source).slice(0, 200000)).getBytes()),
      "Source du schéma " + nom
    );
  return err ? rep({ ok: false, error: err }) : rep({ ok: true, url: URL_DU_SITE + "schemas/" + nom + ".png" });
}
// Liste des images du dossier schemas/ du dépôt (pour la bibliothèque de schémas)
function adminSchemasListe() {
  if (!GITHUB_JETON) return rep({ ok: false, error: "GITHUB_JETON absent dans le script" });
  const r = UrlFetchApp.fetch(
    "https://api.github.com/repos/" + GITHUB_DEPOT + "/contents/schemas?ref=" + GITHUB_BRANCHE,
    {
      headers: {
        Authorization: "Bearer " + GITHUB_JETON,
        Accept: "application/vnd.github+json",
        "User-Agent": "site-jeux-escalade",
      },
      muteHttpExceptions: true,
    }
  );
  if (r.getResponseCode() !== 200)
    return rep({ ok: false, error: "GitHub a répondu " + r.getResponseCode() });
  const tout = JSON.parse(r.getContentText());
  const sources = {};
  tout.forEach(f => {
    if (/\.json$/i.test(f.name)) sources[f.name.replace(/\.json$/i, "")] = true;
  });
  const fichiers = tout
    .filter(f => f.type === "file" && /\.(png|webp|jpe?g|svg)$/i.test(f.name))
    .map(f => ({ nom: f.name, url: URL_DU_SITE + "schemas/" + f.name, source: sources[f.name.replace(/\.\w+$/, "")] === true }));
  return rep({ ok: true, schemas: fichiers });
}
// Depuis la page Administration : image + dessin source (JSON) d'un jeu, puis « Schéma (lien) » mis à jour
function adminSchema(d) {
  const sh = feuilleJeux();
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  const col = head.indexOf("Schéma (lien)");
  if (col < 0) return rep({ ok: false, error: "colonne « Schéma (lien) » introuvable" });
  const l = Number(d.ligne);
  if (!(l >= 2 && l <= sh.getLastRow())) return rep({ ok: false, error: "ligne introuvable" });
  const titreActuel = String(sh.getRange(l, head.indexOf("Titre") + 1).getValue()).trim();
  if (titreActuel !== String(d.titreAvant || "").trim())
    return rep({ ok: false, error: "la feuille a changé : rechargez la liste" });
  if (!d.data || d.data.length > 8000000)
    return rep({ ok: false, error: "image absente ou trop lourde" });
  const nom = nomFichier(d.code, "");
  if (!nom) return rep({ ok: false, error: "code du jeu manquant" });
  let err = githubEcrire("schemas/" + nom + ".png", d.data, "Schéma " + nom);
  if (!err && d.source)
    err = githubEcrire(
      "schemas/" + nom + ".json",
      Utilities.base64Encode(Utilities.newBlob(String(d.source).slice(0, 200000)).getBytes()),
      "Source du schéma " + nom
    );
  if (err) return rep({ ok: false, error: err });
  const url = URL_DU_SITE + "schemas/" + nom + ".png?v=" + Date.now();
  sh.getRange(l, col + 1).setValue(url);
  return rep({ ok: true, url: url });
}

// Depuis la bibliothèque de schémas : remplace un fichier existant (image + dessin source)
function adminSchemaFichier(d) {
  if (!d.data || d.data.length > 8000000)
    return rep({ ok: false, error: "image absente ou trop lourde" });
  const nom = nomFichier(d.code, "");
  if (!nom) return rep({ ok: false, error: "nom manquant" });
  let err = githubEcrire("schemas/" + nom + ".png", d.data, "Schéma " + nom);
  if (!err && d.source)
    err = githubEcrire(
      "schemas/" + nom + ".json",
      Utilities.base64Encode(Utilities.newBlob(String(d.source).slice(0, 200000)).getBytes()),
      "Source du schéma " + nom
    );
  return err ? rep({ ok: false, error: err }) : rep({ ok: true, url: URL_DU_SITE + "schemas/" + nom + ".png?v=" + Date.now() });
}
function rep(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/* ---------- test : lancez « testerConnexions » dans l'éditeur (menu des fonctions > Exécuter) ---------- */
// Demande les autorisations si besoin, puis affiche dans le journal ce qui marche ou non.
function testerConnexions() {
  const sh = feuilleJeux();
  Logger.log(sh ? "✓ Feuille des jeux trouvée : « " + sh.getName() + " »" : "✗ Feuille des jeux introuvable");
  if (!GITHUB_JETON) return Logger.log("✗ GITHUB_JETON est vide");
  const r = UrlFetchApp.fetch("https://api.github.com/repos/" + GITHUB_DEPOT, {
    headers: { Authorization: "Bearer " + GITHUB_JETON, "User-Agent": "site-jeux-escalade" },
    muteHttpExceptions: true,
  });
  const c = r.getResponseCode();
  Logger.log(
    c === 200
      ? "✓ GitHub : dépôt " + GITHUB_DEPOT + " accessible"
      : "✗ GitHub a répondu " + c + " : vérifiez GITHUB_DEPOT et le jeton"
  );
  Logger.log(
    GOOGLE_CLIENT_ID
      ? "✓ Comptes Google activés" + (emailsAdmin().length ? " (administrateur : " + emailsAdmin().join(", ") + ")" : " ⚠ ADMIN_EMAILS est vide")
      : "ℹ Comptes Google non activés (GOOGLE_CLIENT_ID vide) : ancien fonctionnement"
  );
  if (GOOGLE_CLIENT_ID && SECRET_SESSION.indexOf("changez-moi") === 0) Logger.log("⚠ Changez SECRET_SESSION");
  Logger.log(
    CLE_SITE === "changez-moi" || MOT_DE_PASSE_ADMIN === "changez-moi-aussi"
      ? "⚠ Pensez à changer CLE_SITE et MOT_DE_PASSE_ADMIN"
      : "✓ Mots de passe personnalisés"
  );
}
