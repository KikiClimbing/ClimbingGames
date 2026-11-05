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
/* Schémas dessinés avec l'éditeur « Prépa physique » (sol). Affichés directement, sans fichier image. */
const PREPA_SCH = {"R1":{"els":[{"t":"gym","x":27,"y":6,"c":"blue","s":1.1,"pose":"coude90_face","hip":[0,9.2],"lean":0,"sw":2.4,"hw":1.3,"hands":[[-0.6,11.5],[-3.6,8.2]],"feet":[[1.8,0],[-1.8,0]],"kp":[[1,0],[-1,0]],"ep":[[1,-1],[-1,0]],"id":1},{"t":"anchor","x":6,"y":18.65,"s":1,"c":"grey","rot":0,"id":3},{"t":"elastic","x1":7.5,"y1":18.65,"x2":26.34,"y2":18.65,"c":"red","bend":0,"id":5},{"t":"towel","x":29.53,"y":17.66,"s":1,"c":"grey","rot":0,"id":7},{"t":"gym","x":73,"y":6,"c":"blue","s":1.1,"pose":"coude90_ext","hip":[0,9.2],"lean":0,"sw":2.4,"hw":1.3,"hands":[[6.1,11.5],[-3.6,8.2]],"feet":[[1.8,0],[-1.8,0]],"kp":[[1,0],[-1,0]],"ep":[[1,-1],[-1,0]],"id":2},{"t":"anchor","x":52,"y":18.65,"s":1,"c":"grey","rot":0,"id":4},{"t":"elastic","x1":53.5,"y1":18.65,"x2":79.71,"y2":18.65,"c":"red","bend":0,"id":6},{"t":"towel","x":75.53,"y":17.66,"s":1,"c":"grey","rot":0,"id":8},{"t":"arrow","x1":76.4,"y1":21.049999999999997,"x2":81.8,"y2":21.049999999999997,"c":"red","dash":false,"bend":-0.3,"id":9},{"t":"text","x":27,"y":32.5,"s":"1 · DÉPART","c":"ink","fs":2.1,"id":10},{"t":"text","x":73,"y":32.5,"s":"2 · FIN","c":"ink","fs":2.1,"id":11},{"t":"text","x":27,"y":29.8,"s":"avant-bras vers le ventre","c":"grey","fs":1.4,"id":12},{"t":"text","x":73,"y":29.8,"s":"avant-bras ouvert vers l'extérieur","c":"grey","fs":1.4,"id":13}],"opt":{"face":true,"mur":true,"tapis":true,"legende":"Coude plié à 90° et collé au flanc : seul l'avant-bras tourne (serviette roulée : elle ne doit pas tomber)","vue":"","mode":"sol"}},"R2":{"els":[{"t":"gym","x":22,"y":6,"c":"blue","s":1.1,"pose":"bras_devant","hip":[0,9.2],"lean":0,"sw":0,"hw":0,"hands":[[6.4,14.6],[6.2,14.1]],"feet":[[0.3,0],[-0.3,0]],"kp":[[1,0],[1,0]],"ep":[[0,-1],[0,-1]],"id":1},{"t":"anchor","x":46,"y":22.060000000000002,"s":1,"c":"grey","rot":180,"id":3},{"t":"elastic","x1":44.5,"y1":22.060000000000002,"x2":29.04,"y2":22.06,"c":"red","bend":0,"id":5},{"t":"gym","x":68,"y":6,"c":"blue","s":1.1,"pose":"bras_devant","hip":[0,9.2],"lean":0,"sw":0,"hw":0,"hands":[[2.2,12.6],[1.8,12.2]],"feet":[[0.3,0],[-0.3,0]],"kp":[[1,0],[1,0]],"ep":[[-1,-0.4],[-1,-0.4]],"id":2},{"t":"anchor","x":92,"y":22.060000000000002,"s":1,"c":"grey","rot":180,"id":4},{"t":"elastic","x1":90.5,"y1":22.060000000000002,"x2":70.42,"y2":19.86,"c":"red","bend":0,"id":6},{"t":"arrow","x1":78,"y1":24.04,"x2":71.4,"y2":24.04,"c":"red","dash":false,"bend":0,"id":7},{"t":"text","x":22,"y":32.5,"s":"1 · DÉPART","c":"ink","fs":2.1,"id":8},{"t":"text","x":68,"y":32.5,"s":"2 · TIRER","c":"ink","fs":2.1,"id":9},{"t":"text","x":22,"y":29.8,"s":"bras tendus, élastique légèrement tendu","c":"grey","fs":1.4,"id":10},{"t":"text","x":68,"y":29.8,"s":"coudes derrière le buste","c":"grey","fs":1.4,"id":11}],"opt":{"face":true,"mur":true,"tapis":true,"legende":"Les coudes passent derrière le buste ; épaules basses, loin des oreilles","vue":"","mode":"sol"}}};
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
/* le schéma est fabriqué à la demande (l'éditeur est chargé après ce fichier) */
PREPA_EMBED.forEach(g => {
  if (PREPA_SCH[g.Code])
    Object.defineProperty(g, "Schéma (lien)", {
      enumerable: true,
      get: () => (typeof edSvgUrl === "function" ? edSvgUrl(PREPA_SCH[g.Code]) : ""),
    });
});
const avecPrepa = L => L.concat(PREPA_EMBED.filter(p => !L.some(g => g.Code === p.Code)));
