/* Fiches de Prépa physique intégrées (exemples en attendant l'import dans la feuille Google).
   Une fiche de la feuille qui porte le même code les remplace. */
Object.assign(AX.FAMDESC, {
  Renforcement:
    "Exercices de renforcement complémentaire : équilibrer les muscles que l'escalade sollicite peu (épaules, dos, avant-bras, tronc) et limiter les risques de blessure.",
  Mobilité:
    "Étirements et ouverture articulaire (épaules, bassin, poignets, doigts) pour garder de l'amplitude et récupérer.",
  Cardio:
    "Course ou vélo à intensité modérée pour garder une base cardiovasculaire sans fatiguer avant la prochaine séance de grimpe.",
});
const PREPA_EMBED = [
  {
    Code: "R1",
    Titre: "Rotation externe, coude collé au corps",
    Famille: "Renforcement",
    Résumé: "Renforcer la coiffe des rotateurs en ouvrant l'avant-bras contre un élastique",
    Principe:
      "Position de départ : Debout, de profil par rapport au point d'ancrage de l'élastique. Le coude du bras qui travaille est plié à 90° et reste collé contre le flanc pendant tout l'exercice (on peut coincer une serviette roulée entre le coude et les côtes pour le vérifier). L'avant-bras part vers le nombril, paume tournée vers le ventre.\n\nExécution : Ouvrir l'avant-bras vers l'extérieur en pivotant depuis l'épaule, sans décoller le coude du corps. Le mouvement est lent (2 s à l'aller, 2 s au retour), du nombril jusqu'à environ 45° vers l'extérieur. L'épaule ne monte pas vers l'oreille et le buste ne pivote pas pour aider.",
    Participants: "Seul, un bras après l'autre",
    Matériel: "Un élastique de résistance légère à moyenne ; une serviette roulée (facultatif)",
    Espace: "Un point d'ancrage solide pour l'élastique",
    Durée: "≈ 5 min",
    Dosage: "3 séries de 15 répétitions par bras, repos 45 s",
    "Muscles ciblés":
      "Infra-épineux et petit rond (rotateurs externes de l'épaule) ; deltoïde postérieur (stabilisateur postérieur de l'épaule)",
    Objectif:
      "Renforcer les rotateurs externes de l'épaule pour équilibrer le travail intensif des rotateurs internes en escalade",
    "Plus facile": "• Élastique le plus fin, charge très légère au départ",
    "Plus difficile":
      "• Augmenter la résistance de l'élastique toutes les 2 à 3 semaines\n• Ajouter une série une fois les 3 × 15 maîtrisées sans fatigue excessive",
    Conseil:
      "Toute douleur = arrêt immédiat de l'exercice. Ne pas hausser les épaules vers les oreilles. La coiffe des rotateurs est un petit groupe musculaire : commencer très léger.",
    "Voir aussi": "R2",
    "Effectif court": "Seul",
    Intensité: "Modérée",
    "Objectifs (tags)": "Épaules",
    Auteur: "30 fiches jours sans escalade (fiche 1)",
    Publié: "oui",
  },
  {
    Code: "R2",
    Titre: "Rowing horizontal à l'élastique",
    Famille: "Renforcement",
    Résumé: "Rapprocher les omoplates en tirant un élastique vers le bas des côtes",
    Principe:
      "Position de départ : Debout face au point d'ancrage, élastique fixé à hauteur de poitrine, une extrémité dans chaque main, bras tendus devant soi. Reculer jusqu'à mettre l'élastique légèrement en tension. Pieds largeur de bassin, genoux souples, gainage léger.\n\nExécution : Tirer les mains vers le bas des côtes en gardant les coudes proches du corps tout au long du tirage. L'initiation vient des omoplates que l'on ramène vers l'arrière et vers le bas, pas des bras. Pause 1 s en fin de tirage, puis retour lent et contrôlé sans se laisser emporter par l'élastique. Les épaules ne montent jamais vers les oreilles.",
    Participants: "Seul",
    Matériel: "Un élastique de résistance légère à moyenne",
    Espace: "Un point d'ancrage solide à hauteur de poitrine",
    Durée: "≈ 5 min",
    Dosage: "3 séries de 15 répétitions, repos 45 s",
    "Muscles ciblés":
      "Rhomboïdes et trapèze moyen-inférieur (rapprochent et stabilisent les omoplates) ; dentelé antérieur (stabilisateur de l'omoplate)",
    Objectif:
      "Renforcer les rétracteurs de l'omoplate pour améliorer la posture et stabiliser la ceinture scapulaire",
    "Plus facile": "• Élastique léger",
    "Plus difficile":
      "• Passer d'un élastique léger à moyen\n• Augmenter le temps de pause en fin de tirage",
    Conseil:
      "Éviter de compenser en haussant les trapèzes supérieurs. Respirer normalement, ne jamais bloquer sa respiration. Contrôler le retour : ne pas se laisser tirer par l'élastique.",
    "Voir aussi": "R1",
    "Effectif court": "Seul",
    Intensité: "Modérée",
    "Objectifs (tags)": "Dos",
    Auteur: "30 fiches jours sans escalade (fiche 2)",
    Publié: "oui",
  },
];
/* ajoute les fiches intégrées qui ne sont pas déjà dans la liste donnée (même code) */
const avecPrepa = L => L.concat(PREPA_EMBED.filter(p => !L.some(g => g.Code === p.Code)));
