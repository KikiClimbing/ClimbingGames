/* Contenus des guides (séances types, glossaire, compétences…). */
const AX = {
  SECU: [
    [
      "Hauteur maximale",
      "Pour les jeux, on reste en hauteur de bloc, bien en dessous de la hauteur habituelle. Repère conseillé : pieds à moins de 1,5 m, et 1 m pour les jeux yeux bandés ou avec contacts. À valider avec le règlement de votre salle.",
    ],
    [
      "Tapis",
      "Tapis bien jointifs, sans trou ni objet dessus. Les sacs, bouteilles et chaussures restent hors de la zone de réception.",
    ],
    [
      "Désescalade, jamais de saut",
      "On redescend en contrôlant, face au mur. Le saut est interdit, sauf règle explicite à très faible hauteur ; réception sur deux pieds, genoux fléchis.",
    ],
    [
      "Ballons en mousse",
      "Ballons ultra-légers uniquement. On vise le corps, jamais la tête, et on ne tire pas sur un grimpeur en train de se déplacer en hauteur.",
    ],
    [
      "Bandeau",
      "Réservé à la faible hauteur, avec un guide présent en permanence. Un enfant qui n'aime pas avoir les yeux bandés peut simplement fermer les yeux, ou refuser.",
    ],
    [
      "Signal d'arrêt",
      "Un seul signal (sifflet ou mot « stop »), répété avant le premier jeu : tout le monde s'arrête et descend. On l'entraîne à blanc.",
    ],
    [
      "Pareur",
      "Dans les jeux avec contacts ou déplacements rapides, un adulte ou un enfant formé se place sous le grimpeur pour guider la réception et protéger la tête. Il n'attrape pas.",
    ],
    [
      "Comportement et équipement",
      "Interdit de pousser, tirer ou s'accrocher à un autre grimpeur. Cheveux attachés, pas de bijoux, poches vides. Un seul grimpeur par prise sauf règle contraire.",
    ],
  ],
  MATOS: [
    ["Sifflet ou signal d'arrêt", "1", ["Tous les jeux"]],
    ["Tapis supplémentaires", "selon la zone", ["C3", "C8", "C9", "D5", "D9"]],
    ["Foulards", "8 à 12", ["D1", "D3", "D8", "G4"]],
    ["Cerceaux", "4 à 6", ["E7", "C7", "D3", "G4"]],
    ["Bandeaux", "4 à 6", ["E9", "C3"]],
    ["Ballons en mousse ultra-légers", "2 à 3", ["C8", "C9", "D9"]],
    ["Balles", "6", ["E8", "D6"]],
    ["Chasubles de deux couleurs", "12", ["C9"]],
    ["Chronomètre", "1", ["C4", "C11", "D6", "D9", "D11"]],
    ["Scotch ou ruban adhésif", "1 rouleau", ["E2", "D1"]],
    ["Élastiques", "4 à 6", ["E6"]],
    ["Sangles de 1 m", "6", ["C5"]],
    ["Bâtons", "4", ["C7"]],
    ["Dégaines et mousquetons", "6 à 10", ["E5", "D3"]],
    ["Cordelette, plaquettes, corde, sangle", "selon l'installation", ["E5", "D3"]],
    ["Dés ou cartes numérotées", "2 dés", ["G4"]],
    ["Feuille de points, tableau, feutres", "1 jeu", ["C10", "C11", "G3"]],
    ["Béret ou objet à attraper", "1", ["D4"]],
    ["Aimant Géomag", "1", ["D10"]],
  ],
  SEANCES: [
    {
      titre: "Anniversaire · 1 heure",
      pub: "6 à 12 enfants de 6 à 11 ans, débutants",
      mat: "Foulards, cerceaux, feuille et feutres, tapis, sifflet",
      rows: [
        ["0-5'", "Accueil", null, "Règles de sécurité, signal d'arrêt, présentation du mur."],
        [
          "5-15'",
          "Échauffement",
          "G1",
          "Rythme lent puis rapide ; faire redescendre celui qui se trompe.",
        ],
        ["15-27'", "Jeu 1 · dynamique", "D3", "Version foulards et cerceaux, 2 équipes."],
        [
          "27-39'",
          "Jeu 2 · calme",
          "C4",
          "Un grimpeur par équipe ; ses coéquipiers lui montrent les prises du doigt.",
        ],
        [
          "39-52'",
          "Jeu 3 · réflexion",
          "G3",
          "Tableau de morpion, chaque équipe choisit son bloc.",
        ],
        [
          "52-60'",
          "Retour au calme",
          null,
          "Chaque enfant montre sa prise préférée ; photo de groupe.",
        ],
      ],
    },
    {
      titre: "Initiation à l'équilibre · 1 heure",
      pub: "8 à 12 jeunes, 7 à 12 ans, première séance",
      mat: "Scotch, cerceaux, tapis",
      rows: [
        ["0-5'", "Accueil", null, "Consignes, zone de jeu, signal d'arrêt."],
        ["5-15'", "Échauffement", "E1", "Par 2 ou 3, trajet à suivre en parallèle."],
        ["15-25'", "Jeu 1", "E2", "Prises marquées au scotch, choix des prises."],
        ["25-35'", "Jeu 2", "E4", "Par binômes, deux manches en échangeant les rôles."],
        ["35-45'", "Jeu 3", "E7", "Cerceaux, contraintes de prises."],
        ["45-55'", "Retour au calme", "C12", "Statues par petits groupes."],
        ["55-60'", "Bilan", null, "Qu'est-ce qui a aidé à tenir en équilibre ?"],
      ],
    },
    {
      titre: "Esprit d'équipe · 1 heure",
      pub: "12 à 16 jeunes, 9 à 14 ans",
      mat: "Sangles de 1 m, scotch ou foulard, tapis épais, chrono, feuille de points",
      rows: [
        [
          "0-5'",
          "Accueil",
          null,
          "Consignes, formation des équipes (voir page « Former les équipes »).",
        ],
        ["5-15'", "Échauffement", "C2", "Un loup, les autres se délivrent."],
        ["15-25'", "Jeu 1", "C5", "Par 2, puis 3, puis tout le groupe."],
        ["25-35'", "Jeu 2", "D1", "Deux équipes, une prise au centre ; on change de côté."],
        ["35-45'", "Jeu 3", "D5", "Relais, descente maîtrisée obligatoire."],
        ["45-55'", "Jeu 4", "C11", "Répartition des rôles dans chaque équipe."],
        ["55-60'", "Bilan", null, "Un point positif par équipe."],
      ],
    },
  ],
  CYCLE: [
    [
      "Découvrir le mur",
      "Règles de sécurité, premiers déplacements, plaisir de grimper.",
      ["G1", "E1", "E2", "C12"],
      "Insister sur le signal d'arrêt et la descente sans sauter.",
    ],
    [
      "Équilibre et pieds",
      "Poser les pieds avec précision, transférer le poids.",
      ["E3", "E4", "D10", "D11"],
      "Faire verbaliser : où est le poids du corps ?",
    ],
    [
      "Lire le mur",
      "Repérer, mémoriser, choisir ses prises.",
      ["E7", "D7", "G2", "C4"],
      "Commencer par des trajets courts, puis les allonger.",
    ],
    [
      "Confiance et entraide",
      "Guider, être guidé, grimper à plusieurs.",
      ["C2", "C3", "C5", "C6"],
      "Rester à faible hauteur ; changer de binôme à chaque jeu.",
    ],
    [
      "Écoute et réactivité",
      "Réagir vite, rester maître de ses appuis.",
      ["D8", "G1", "D2", "D4"],
      "Alterner jeux dynamiques et jeux calmes.",
    ],
    [
      "Équipe et stratégie",
      "Se répartir les rôles, choisir une tactique.",
      ["C8", "C9", "D1", "G3"],
      "Faire une pause stratégie de 1 minute avant chaque manche.",
    ],
    [
      "Vitesse et endurance",
      "Enchaîner, relayer, tenir le rythme.",
      ["C1", "D5", "D6", "C10"],
      "Veiller à la descente maîtrisée dans les relais.",
    ],
    [
      "Séance bilan",
      "Rejouer les jeux préférés, défis, remise de diplômes.",
      ["G4", "C11", "D9"],
      "Laisser les enfants choisir ; chacun explique ce qu'il a progressé.",
    ],
  ],
  COMP: [
    [
      "Lecture du mur",
      "Repérer les prises, anticiper un trajet, choisir son itinéraire.",
      ["E1", "E2", "E3", "E6", "E7", "C4", "D1", "D7", "D10", "G2"],
    ],
    [
      "Équilibre et placement des pieds",
      "Poser précisément les pieds, transférer le poids, tenir une position.",
      ["E4", "E7", "E8", "C7", "C12", "D7", "D10", "D11", "G4"],
    ],
    [
      "Bassin et amplitude",
      "Placer le bassin, utiliser l'allonge, varier les gestes.",
      ["E4", "C12", "D10", "D11", "G4"],
    ],
    [
      "Écoute et réactivité",
      "Réagir vite à une consigne, un signal, une couleur.",
      ["E3", "E9", "C1", "D2", "D4", "D8", "G1"],
    ],
    [
      "Confiance et entraide",
      "S'appuyer sur un partenaire, guider, se laisser guider.",
      ["E8", "C2", "C3", "C5", "C6", "C9"],
    ],
    [
      "Organisation d'équipe",
      "S'entendre, répartir les rôles, communiquer.",
      ["C4", "C9", "C10", "C11", "D1", "D3", "D6", "G3"],
    ],
    [
      "Vitesse et endurance",
      "Enchaîner des efforts, tenir un rythme, relayer.",
      ["C1", "C10", "C11", "D2", "D3", "D5", "D6", "D8", "D9"],
    ],
    [
      "Mémoire et observation",
      "Observer, mémoriser un trajet ou une consigne, reproduire.",
      ["E1", "E2", "E9", "C4", "D7", "G1", "G2"],
    ],
    [
      "Stratégie",
      "Choisir une tactique, anticiper l'adversaire, décider vite.",
      ["C9", "C11", "D4", "D9", "G3"],
    ],
    [
      "Manipulation du matériel",
      "Utiliser une dégaine, un mousqueton, une sangle, un chrono.",
      ["E5", "D3", "C5"],
    ],
  ],
  GLOSS: [
    ["Amplitude", "Écart maximal entre deux appuis : plus il est grand, plus le geste est ample."],
    ["Appui", "Toute prise ou volume sur lequel on pose un pied ou une main."],
    ["Bloc", "Itinéraire court, à faible hauteur, grimpé sans corde au-dessus de tapis."],
    [
      "Bassin",
      "Le centre du corps : son placement détermine l'équilibre et le transfert de poids.",
    ],
    [
      "Dégaine",
      "Deux mousquetons reliés par une sangle courte, qui sert ici de jeton ou d'objet à transporter.",
    ],
    ["Désescalade", "Redescendre le mur en grimpant, sans sauter."],
    [
      "Embut",
      "Zone de départ ou d'arrivée d'une équipe, derrière laquelle elle attend (jeu du béret).",
    ],
    ["Manche", "Une partie complète du jeu, avant d'inverser les rôles ou les équipes."],
    ["Pan", "Une portion de mur, d'un seul tenant, d'une même inclinaison."],
    ["Pareur", "Personne placée sous le grimpeur pour guider sa réception et protéger sa tête."],
    ["Pied de mur", "La base du mur, au niveau du tapis."],
    ["Plafond", "Partie horizontale ou très inclinée au-dessus de la tête du grimpeur."],
    ["Prise", "Élément coloré fixé au mur, qui sert d'appui pour les mains ou les pieds."],
    ["Prise-cible", "Prise désignée comme but à toucher (pas de géant, chenille)."],
    ["Relais", "Passage de témoin : le suivant ne part que lorsque le précédent a fini."],
    ["Sangle", "Bande de tissu qui sert ici de lien entre deux grimpeurs (cordée) ou d'ancrage."],
    ["Témoin", "Objet que l'on transmet au coéquipier suivant, ou simple touche de la main."],
    ["Traversée", "Déplacement horizontal le long du mur, sans monter."],
    [
      "Via ferrata",
      "Ici : parcours en traversée équipé d'une cordelette le long de laquelle on fait glisser une dégaine.",
    ],
  ],
  EQUIPES: [
    [
      "Les foulards",
      "Chacun tire un foulard dans un sac sans regarder : chaque couleur forme une équipe. Rapide et aléatoire.",
    ],
    ["Les mois", "Naissance de janvier à juin d'un côté, de juillet à décembre de l'autre."],
    [
      "Par taille puis 1-2",
      "Le groupe se range par ordre de taille, puis on compte « 1, 2, 1, 2 » : les deux équipes sont équilibrées en taille.",
    ],
    ["Pair ou impair", "Chacun lance un dé ou tire une carte : pair d'un côté, impair de l'autre."],
    [
      "Les prises",
      "Au signal, chacun touche une prise d'une couleur imposée (deux couleurs) : la couleur choisie donne l'équipe.",
    ],
    [
      "Les listes",
      "L'éducateur répartit en alternant les plus expérimentés et les débutants, sans que cela se voie.",
    ],
  ],
  EQ_RULES: [
    "Équipes à effectifs égaux ; sinon un « joker » joue pour les deux équipes.",
    "Équilibrer le niveau, la taille et l'âge, surtout dans les jeux de vitesse.",
    "Changer les équipes d'une manche à l'autre pour que tous jouent avec tous.",
    "Éviter les capitaines qui choisissent à tour de rôle : le dernier choisi est blessé.",
  ],
  EQ_SIZES: [
    ["Binômes", "E4 · C3 · D11 · D10"],
    ["Équipes de 3", "D6 · C10"],
    ["2 équipes", "C4 · C9 · C11 · D1 · D2 · D3 · D4 · D5 · D7 · D9 · G2 · G3"],
    ["Un loup contre tous", "C2 · E9"],
  ],
  FAMDESC: {
    Exploration:
      "Explorer le mur avec une contrainte de déplacement : prises imposées, matériel à éviter, handicap volontaire. On y travaille la lecture du mur et la précision des appuis.",
    Coopération:
      "Réussir ensemble : guidage, encordement, dépassement, poursuite et efforts collectifs. La communication compte autant que la technique.",
    Défis:
      "Se mesurer en vitesse, en score ou en duel, seul ou par équipes. Idéal pour dynamiser une séance ; penser à équilibrer les équipes.",
    Animation:
      "Jeux menés par l'éducateur : consignes, mémoire, dés, grille. Parfaits pour les anniversaires et les groupes de débutants (6 à 11 ans, 6 à 12 enfants).",
  },
};
