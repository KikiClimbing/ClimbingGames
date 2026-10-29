// Réglages du site : collez vos adresses entre les guillemets, puis enregistrez.
// Ce fichier est indépendant d'index.html : vous pouvez remplacer index.html sans perdre ces réglages.
window.SITE_CONFIG = {
  // Adresse CSV publiée de la feuille Google (Fichier > Partager > Publier sur le Web > CSV)
  SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQU8IKWzcnRRfsM5uF912AZcTaEY2ifiTBhM8m0dvzn61eOv4NO1ITMw8EbMTJp-UHoKFW3BXccVH_T/pub?gid=184470260&single=true&output=csv",
  // Lien du formulaire Google « Proposer un jeu »
  FORM_URL: "https://docs.google.com/forms/d/e/1FAIpQLSeokGQtbVpxUZbj3x1WuiJpjp2HQ_xCuHugtjK_CQ35gpcQmg/viewform",
   // Lien du formulaire Google « Retour terrain sur un jeu »
  RETOUR_FORM_URL: "https://docs.google.com/forms/d/e/1FAIpQLSfZ1VoBuK9Z4B7UZs3UaV8b6YXSK9r0Xb2s9NfXuc0sGYYqgA/viewform",
  // Adresse CSV publiée de l'onglet des retours terrain
  RETOURS_CSV_URL: "https://docs.google.com/forms/d/1qIJ0b1RUGx2FrTII8Fj23eOcZSPpPgc29hSXVzccQ0k/edit",
  // Lien du modèle « Fiche de séance » (Google Docs)
  TEMPLATE_SEANCE_URL: "https://docs.google.com/document/d/1WYO8XRIGlURyQb3O30aNZdbvGOwT5fCT/edit",
  // Lien du modèle « Cycle de formation » (Google Docs)
  TEMPLATE_CYCLE_URL: "https://docs.google.com/document/d/1OvSgeQXyU3YDCAdxFFYZohFId479vbyN/edit",
  // Lien du dossier Drive partagé (bibliothèque de séances)
  LIBRARY_URL: "https://drive.google.com/drive/folders/1o2a7sFKQOjJM0rBjcsw-zf8PsFbUFqVV",
  // adresse CSV publiée de l'onglet « Séances » (lecture des séances enregistrées)
  SEANCES_CSV_URL: "https://script.google.com/macros/s/AKfycbxm_soCoRI5FjiHX9_zdyeh4RlhdQD7WBqeB0xNro61_iPlVzZJlKFbLz0Pi3YaPvxv/exec", 
  // Ajout automatique d'un jeu libre à la bibliothèque (script ajouter_jeu.gs) : adresse de l'application web et mot de passe
  GAME_ADD_URL: "https://script.google.com/macros/s/AKfycbxm_soCoRI5FjiHX9_zdyeh4RlhdQD7WBqeB0xNro61_iPlVzZJlKFbLz0Pi3YaPvxv/exec",
  GAME_ADD_KEY: "kiki0673",
  // Envoi des schémas dans le Drive : adresse de l'application web (script recevoir_schemas.gs) et mot de passe choisi
  SCHEMA_UPLOAD_URL: "https://script.google.com/macros/s/AKfycbwMqIdCGTGX4fIyNpbbYqOEuYRf-XlJO4HhtY_8hxzfs4rXlnscAsGs2dU_3mOVEYsK/exec",
  SCHEMA_UPLOAD_KEY: "kiki0673"
};
