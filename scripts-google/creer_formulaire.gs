/**
 * Crée le formulaire « Proposer un jeu d'escalade » et le relie à votre feuille Google.
 * Mode d'emploi : ouvrez votre Google Sheet > Extensions > Apps Script > collez ce code > Exécuter « creerFormulaire ».
 */
function creerFormulaire() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var form = FormApp.create("Proposer un jeu d'escalade");
  form.setDescription(
    "Remplissez les champs comme dans les fiches existantes. Une fois relue, votre fiche sera publiée sur le site."
  );
  form.setCollectEmail(false);

  function texte(titre, aide, obligatoire, long) {
    var it = long ? form.addParagraphTextItem() : form.addTextItem();
    it.setTitle(titre).setRequired(obligatoire);
    if (aide) it.setHelpText(aide);
  }

  texte("Titre", "Nom courant du jeu. Si deux noms existent : « Nom 1 / Nom 2 ».", true, false);
  form
    .addListItem()
    .setTitle("Famille")
    .setChoiceValues(["Exploration", "Coopération", "Défis", "Animation"])
    .setRequired(true)
    .setHelpText(
      "Exploration : découvrir le mur. Coopération : réussir ensemble. Défis : duels et courses. Animation : jeux d'anniversaire."
    );
  texte("Résumé", "Une phrase : le but du jeu.", true, false);
  texte(
    "Principe",
    "3 à 6 phrases courtes. Dire qui joue, ce qu'on fait, comment on gagne et quand ça s'arrête.",
    true,
    true
  );
  texte("Participants", "Ex. : 2 équipes de 3 à 6, binômes, groupe entier.", true, false);
  texte("Matériel", "« Aucun » si rien.", true, false);
  texte("Espace", "Ex. : pan de mur, traversée basse.", false, false);
  texte("Durée", "Ex. : 10 min.", true, false);
  texte("Objectif", "Ce que le jeu fait travailler, en quelques mots.", false, false);
  texte("Plus facile", "2 à 3 idées, une par ligne (la puce « • » est ajoutée automatiquement).", true, true);
  texte("Plus difficile", "2 à 3 idées, une par ligne (la puce « • » est ajoutée automatiquement).", true, true);
  texte("Conseil", "Sécurité ou astuce d'animation, 1 à 2 phrases.", false, true);
  texte(
    "Voir aussi",
    "Codes de jeux proches, séparés par des virgules (ex. E4, D11).",
    false,
    false
  );
  texte("Effectif court", "Pour la vignette. Ex. : 2 équipes égales.", false, false);
  form
    .addListItem()
    .setTitle("Intensité")
    .setChoiceValues(["Calme", "Modérée", "Intense"])
    .setRequired(false);
  form
    .addCheckboxItem()
    .setTitle("Objectifs (tags)")
    .setChoiceValues(["Échauffement", "Équilibre", "Coopération", "Vitesse", "Observation"])
    .setRequired(false);
  form
    .addListItem()
    .setTitle("Format anniversaire")
    .setChoiceValues(["Non", "Oui"])
    .setRequired(false)
    .setHelpText(
      "Oui si le jeu convient à un anniversaire (6 à 12 enfants de 6 à 11 ans, débutants)."
    );
  texte("Auteur", "Votre prénom.", true, false);
  texte(
    "Schéma (lien)",
    "Facultatif : lien vers une image du schéma (Google Drive, partagée « Tous les utilisateurs disposant du lien »).",
    false,
    false
  );
  texte("Compléments", "Facultatif : listes ou tableaux utiles au jeu.", false, true);

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  Logger.log("Formulaire à partager : " + form.getPublishedUrl());
  Logger.log("Formulaire à modifier : " + form.getEditUrl());
}
