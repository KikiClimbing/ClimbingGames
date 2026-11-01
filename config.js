// Réglages du site : collez vos adresses entre les guillemets, puis enregistrez.
// Ce fichier est indépendant d'index.html : vous pouvez remplacer index.html sans perdre ces réglages.
window.SITE_CONFIG = {
  // Adresse CSV publiée de la feuille Google (Fichier > Partager > Publier sur le Web > CSV)
  SHEET_CSV_URL: "",
  // Lien du formulaire Google « Proposer un jeu »
  FORM_URL: "",
  // Lien du formulaire Google « Retour terrain sur un jeu »
  RETOUR_FORM_URL: "",
  // Adresse CSV publiée de l'onglet des retours terrain
  RETOURS_CSV_URL: "",
  // Lien du modèle « Fiche de séance » (Google Docs)
  TEMPLATE_SEANCE_URL: "",
  // Lien du modèle « Cycle de formation » (Google Docs)
  TEMPLATE_CYCLE_URL: "",
  // Lien du dossier Drive partagé (bibliothèque de séances)
  LIBRARY_URL: "",
  // CSV publié de l'onglet « Séances » (bibliothèque de séances créées avec l'outil)
  SEANCES_CSV_URL: "",
  // Adresse « /exec » de l'application web Apps Script (serveur_site.gs) : sert à TOUT envoyer (jeux, séances, schémas, administration)
  GAME_ADD_URL: "",
  // Mot de passe du site, à inventer : identique à CLE_SITE dans le script (visible publiquement, ce n'est pas un secret)
  GAME_ADD_KEY: "",
  // Obsolètes : laisser vides (anciens scripts d'envoi de schémas vers Drive)
  SCHEMA_UPLOAD_URL: "",
  SCHEMA_UPLOAD_KEY: "",
};
