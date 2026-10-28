/**
 * Crée le formulaire « Retour terrain sur un jeu » et le relie à votre feuille Google.
 * Mode d'emploi : ouvrez votre Google Sheet > Extensions > Apps Script > collez ce code
 * (dans un nouveau fichier, ou à la suite de l'autre) > Exécuter « creerFormulaireRetour ».
 */
function creerFormulaireRetour() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var form = FormApp.create("Retour terrain sur un jeu");
  form.setDescription("Vous avez fait jouer un jeu de la base ? Dites-nous comment ça s'est passé : ça aide les autres éducateurs.");
  form.setCollectEmail(false);

  form.addTextItem().setTitle("Code du jeu").setRequired(true)
    .setHelpText("Le code figure sur la fiche, par exemple E4, C9 ou D11.");
  form.addScaleItem().setTitle("Note").setBounds(1, 5).setLabels("Pas convaincant", "Très réussi").setRequired(true)
    .setHelpText("Votre impression globale sur le jeu.");
  form.addTextItem().setTitle("Public").setRequired(false)
    .setHelpText("Ex. : 8 enfants de 9 ans, ados débutants.");
  form.addParagraphTextItem().setTitle("Ce qui a bien marché").setRequired(false);
  form.addParagraphTextItem().setTitle("À changer").setRequired(false)
    .setHelpText("Ce qui a coincé, une règle à clarifier, une variante que vous avez trouvée.");
  form.addTextItem().setTitle("Auteur").setRequired(true).setHelpText("Votre prénom.");

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  Logger.log("Formulaire à partager : " + form.getPublishedUrl());
  Logger.log("Formulaire à modifier : " + form.getEditUrl());
}

/** À exécuter si les adresses ne s'affichent pas : retrouve le formulaire et affiche ses liens. */
function afficherAdresses() {
  var it = DriveApp.getFilesByName("Retour terrain sur un jeu");
  while (it.hasNext()) {
    var f = FormApp.openById(it.next().getId());
    console.log("À PARTAGER : " + f.getPublishedUrl());
    console.log("À MODIFIER : " + f.getEditUrl());
  }
}
