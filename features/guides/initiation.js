/* Guide « Initiation à l'escalade de bloc » : séance d'une heure pour débutants.
   Deux onglets : le guide complet (page imprimable) et la fiche de séance (modèle du site,
   que l'on peut imprimer, télécharger en Word, adapter dans une fenêtre ou lancer en mode terrain). */
const INI = { tab: "guide" };
/* parties : [id, n°, titre, minutage, objectif, fond, texte] (couleurs de la fiche de séance) */
const INI_PARTS = [
  [
    "accueil",
    1,
    "Accueil et découverte de l'escalade de bloc",
    "0 → 5 min",
    "Poser le cadre, comprendre ce qu'est le bloc et connaître les règles de sécurité du pan.",
    "#FDF3D3",
    "#7A5F0E",
  ],
  [
    "chute",
    2,
    "Apprentissage de la chute",
    "5 → 15 min",
    "Intégrer un réflexe de réception fiable avant de toucher au mur, pour que la peur de tomber ne bride jamais l'apprentissage technique par la suite.",
    "#FBE9DC",
    "#9A4A1A",
  ],
  [
    "echauf",
    3,
    "Échauffement spécifique à l'escalade",
    "15 → 22 min",
    "Préparer les articulations les plus sollicitées par la grimpe (doigts, poignets, épaules) avant tout effort de préhension.",
    "#E6F2E6",
    "#2E6F3E",
  ],
  [
    "theorie",
    4,
    "La théorie du mouvement",
    "22 → 37 min",
    "Donner au débutant les clés de lecture de son propre corps sur le mur, pour comprendre pourquoi un mouvement fonctionne, ou pas.",
    "#E3EEF8",
    "#2B5A9E",
  ],
  [
    "pratique",
    5,
    "Application pratique guidée",
    "37 → 55 min",
    "Mettre en mouvement ce qui vient d'être expliqué : une consigne ciblée à la fois, sur des blocs très faciles.",
    "#ECE7F8",
    "#5B4BA8",
  ],
  [
    "debrief",
    6,
    "Debrief",
    "55 → 60 min",
    "Consolider les apprentissages de la séance et donner un cap pour la suite.",
    "#FFF6E5",
    "#8A4B00",
  ],
];
const INI_GLOSS = [
  [
    "Bloc",
    "Une voie courte d'escalade sans corde, généralement de quelques mouvements à une dizaine.",
  ],
  ["Crash pad / tapis", "Tapis de réception épais posé au sol sous les zones de grimpe."],
  ["Dévers", "Pan incliné vers l'arrière (plus dur, sollicite davantage les bras)."],
  ["Dalle", "Pan incliné vers l'avant (plus facile pour les appuis pieds)."],
  ["Réglette", "Prise fine, tenue du bout des doigts."],
  ["Bac", "Grosse prise large et profonde, facile à tenir."],
  ["Pince", "Prise tenue en pinçant entre le pouce et les autres doigts."],
  ["Mono", "Prise ne permettant de placer qu'un seul doigt."],
  [
    "Drapeau",
    "Jambe tendue sur le côté ou en arrière, utilisée comme contrepoids sans toucher le mur.",
  ],
  ["Parade", "Accompagnement au sol d'un partenaire pour sécuriser et guider une chute."],
];

/* ---------- schémas (SVG simples, avec texte alternatif) ---------- */
const INI_C = "#26364D",
  INI_FAR = "#9FB0C4",
  INI_OR = "#E8662F";
const iniLine = (pts, far) =>
  `<polyline points="${pts.map(p => p.join(",")).join(" ")}" fill="none" stroke="${far ? INI_FAR : INI_C}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`;
/* bonhomme : tête, épaule, bassin, bras [[coude, main, loin?]], jambes [[genou, pied, loin?]] */
function iniStick(o) {
  let s = "";
  (o.legs || []).filter(l => l[2]).forEach(l => (s += iniLine([o.hip, l[0], l[1]], true)));
  (o.arms || []).filter(l => l[2]).forEach(l => (s += iniLine([o.sh, l[0], l[1]], true)));
  (o.legs || []).filter(l => !l[2]).forEach(l => (s += iniLine([o.hip, l[0], l[1]])));
  s += iniLine([o.sh, o.hip]);
  (o.arms || []).filter(l => !l[2]).forEach(l => (s += iniLine([o.sh, l[0], l[1]])));
  s += `<circle cx="${o.head[0]}" cy="${o.head[1]}" r="9" fill="#fff" stroke="${INI_C}" stroke-width="3.4"/>`;
  (o.dots || []).forEach(
    d =>
      (s += `<circle cx="${d[0]}" cy="${d[1]}" r="4.6" fill="${INI_OR}" stroke="#fff" stroke-width="1.2"/>`)
  );
  return s;
}
const iniHold = (x, y, hot) =>
  `<circle cx="${x}" cy="${y}" r="${hot ? 4.6 : 3.4}" fill="${hot ? INI_OR : "#fff"}" stroke="${hot ? "#fff" : "#8A93A3"}" stroke-width="1.6"/>`;
const iniArrow = (x1, y1, x2, y2) => {
  const a = Math.atan2(y2 - y1, x2 - x1),
    h = 7;
  return `<g stroke="${INI_OR}" fill="${INI_OR}" stroke-width="2.4" stroke-linecap="round"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><polygon stroke="none" points="${x2},${y2} ${x2 - h * Math.cos(a - 0.5)},${y2 - h * Math.sin(a - 0.5)} ${x2 - h * Math.cos(a + 0.5)},${y2 - h * Math.sin(a + 0.5)}"/></g>`;
};
const iniTxt = (x, y, t, anchor = "middle") =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="11.5" font-weight="700" fill="#26364D">${t}</text>`;
const iniWall = x => `<rect x="${x}" y="14" width="9" height="170" rx="3" fill="#C9D3E0"/>`;
const iniFig = (titre, desc, w, inner, cap) =>
  `<figure class="ini-fig"><svg viewBox="0 0 ${w} 200" role="img" aria-label="${esc(titre + " : " + desc)}"><title>${esc(titre)}</title><desc>${esc(desc)}</desc>${inner}</svg>${cap ? `<figcaption>${cap}</figcaption>` : ""}</figure>`;
const INI_SVG = {
  chute: () =>
    iniFig(
      "Position de réception",
      "Un grimpeur reçoit sa chute sur un tapis : genoux fléchis, pieds à plat, bras devant le corps, dos arrondi.",
      230,
      `<rect x="30" y="170" width="170" height="14" rx="3" fill="#C9D3E0" stroke="#8A93A3"/>${iniStick(
        {
          head: [118, 66],
          sh: [112, 86],
          hip: [104, 124],
          legs: [
            [
              [86, 148],
              [90, 170],
            ],
            [
              [124, 148],
              [118, 170],
            ],
          ],
          arms: [
            [
              [130, 100],
              [146, 94],
            ],
            [[128, 106], [144, 114], 1, [112, 86]],
          ],
          dots: [
            [90, 170],
            [118, 170],
          ],
        }
      )}${iniArrow(160, 40, 140, 70)}${iniTxt(115, 197, "Genoux fléchis, bras devant")}`
    ),
  polygone: () =>
    iniFig(
      "Polygone de sustentation",
      "Un grimpeur de face tient une prise de la main droite et pose les deux pieds. Le triangle formé par ces trois appuis est le polygone de sustentation ; son centre de gravité reste au-dessus.",
      230,
      `<rect x="20" y="12" width="190" height="176" rx="10" fill="#E6ECF4"/>${iniHold(46, 40)}${iniHold(186, 46)}${iniHold(44, 120)}${iniHold(180, 120)}<polygon points="82,172 124,172 150,78" fill="${INI_OR}" opacity=".22" stroke="${INI_OR}" stroke-width="1.6" stroke-dasharray="5 4"/>${iniStick(
        {
          head: [104, 44],
          sh: [104, 64],
          hip: [104, 112],
          legs: [
            [
              [92, 144],
              [82, 172],
            ],
            [
              [116, 144],
              [124, 172],
            ],
          ],
          arms: [
            [
              [130, 62],
              [150, 78],
            ],
            [[84, 52], [66, 44], 1],
          ],
          dots: [
            [82, 172],
            [124, 172],
            [150, 78],
          ],
        }
      )}<line x1="104" y1="112" x2="104" y2="176" stroke="${INI_C}" stroke-width="1.6" stroke-dasharray="2 4"/>`,
      "Le polygone est la zone ombrée entre les trois appuis."
    ),
  cdg: () =>
    iniFig(
      "Centre de gravité aligné ou non",
      "À gauche, le bassin est au-dessus des pieds : le corps est équilibré. À droite, le bassin est loin des pieds : le corps bascule et les bras doivent compenser.",
      470,
      `<g><rect x="14" y="12" width="210" height="176" rx="10" fill="#E6ECF4"/>${iniStick({
        head: [96, 40],
        sh: [96, 60],
        hip: [94, 108],
        legs: [
          [
            [84, 140],
            [78, 172],
          ],
          [
            [106, 140],
            [112, 172],
          ],
        ],
        arms: [
          [
            [116, 52],
            [140, 66],
          ],
        ],
        dots: [
          [78, 172],
          [112, 172],
          [140, 66],
        ],
      })}<polygon points="78,172 112,172 140,66" fill="${INI_OR}" opacity=".2"/><line x1="94" y1="108" x2="94" y2="178" stroke="${INI_C}" stroke-width="1.6" stroke-dasharray="2 4"/>${iniTxt(119, 197, "Bassin au-dessus des pieds")}</g><g transform="translate(236 0)"><rect x="14" y="12" width="210" height="176" rx="10" fill="#E6ECF4"/>${iniStick(
        {
          head: [128, 40],
          sh: [124, 60],
          hip: [118, 108],
          legs: [
            [
              [96, 138],
              [66, 172],
            ],
            [
              [108, 140],
              [88, 172],
            ],
          ],
          arms: [
            [
              [146, 50],
              [168, 40],
            ],
          ],
          dots: [
            [66, 172],
            [88, 172],
            [168, 40],
          ],
        }
      )}<polygon points="66,172 88,172 168,40" fill="${INI_OR}" opacity=".2"/><line x1="118" y1="108" x2="118" y2="178" stroke="${INI_C}" stroke-width="1.6" stroke-dasharray="2 4"/>${iniArrow(150, 150, 118, 150)}${iniTxt(119, 197, "Bassin loin des pieds")}</g>`
    ),
  transfert: () =>
    iniFig(
      "Transfert de poids",
      "Deux positions de profil devant un mur. À gauche, jambe pliée, bassin bas. À droite, la jambe d'appui s'est tendue, le bassin est monté et les bras sont restés tendus.",
      470,
      `<g>${iniWall(190)}${iniHold(194, 40)}${iniHold(194, 150, 1)}${iniStick({
        head: [128, 70],
        sh: [138, 90],
        hip: [152, 128],
        legs: [
          [
            [132, 142],
            [190, 150],
          ],
          [[160, 150], [180, 168], 1],
        ],
        arms: [
          [
            [164, 66],
            [194, 40],
          ],
        ],
        dots: [[194, 40]],
      })}${iniTxt(100, 197, "1. Jambe pliée")}</g><g transform="translate(236 0)">${iniWall(190)}${iniHold(194, 20)}${iniHold(194, 150, 1)}${iniStick(
        {
          head: [136, 40],
          sh: [148, 60],
          hip: [166, 96],
          legs: [
            [
              [184, 124],
              [190, 150],
            ],
            [[176, 128], [186, 150], 1],
          ],
          arms: [
            [
              [168, 40],
              [194, 20],
            ],
          ],
          dots: [[194, 20]],
        }
      )}${iniArrow(118, 140, 118, 90)}${iniTxt(100, 197, "2. Pousser avec la jambe")}</g>`
    ),
  bras: () =>
    iniFig(
      "Bras tendus, corps près du mur",
      "À gauche, bras tendus et hanches proches du mur : le squelette porte le poids. À droite, bras pliés et hanches éloignées : les muscles des bras portent le poids et fatiguent vite.",
      470,
      `<g>${iniWall(190)}${iniHold(194, 40, 1)}${iniHold(194, 170, 1)}${iniStick({
        head: [132, 76],
        sh: [140, 96],
        hip: [168, 130],
        legs: [
          [
            [184, 150],
            [192, 170],
          ],
        ],
        arms: [
          [
            [168, 66],
            [194, 40],
          ],
        ],
        dots: [],
      })}${iniTxt(100, 197, "Bras tendus : économe")}</g><g transform="translate(236 0)">${iniWall(190)}${iniHold(194, 40, 1)}${iniHold(194, 170, 1)}${iniStick(
        {
          head: [168, 56],
          sh: [164, 78],
          hip: [140, 128],
          legs: [
            [
              [160, 152],
              [192, 170],
            ],
          ],
          arms: [
            [
              [148, 56],
              [194, 40],
            ],
          ],
          dots: [],
        }
      )}${iniTxt(100, 197, "Bras pliés : fatigant")}</g>`
    ),
  drapeau: () =>
    iniFig(
      "Le drapeau",
      "Un grimpeur de profil tient une prise en haut et un appui pour le pied en bas ; l'autre jambe est tendue en arrière, sans toucher le mur, comme contrepoids.",
      230,
      `${iniWall(170)}${iniHold(174, 40, 1)}${iniHold(174, 150, 1)}${iniStick({
        head: [138, 52],
        sh: [146, 72],
        hip: [150, 114],
        legs: [
          [
            [166, 132],
            [174, 150],
          ],
          [[118, 130], [78, 144], 1],
        ],
        arms: [
          [
            [168, 56],
            [174, 40],
          ],
        ],
      })}${iniArrow(96, 100, 74, 116)}${iniTxt(115, 197, "Jambe libre en contrepoids")}`
    ),
};

/* ---------- contenu du guide ---------- */
const iniP = t => `<p>${t}</p>`;
const iniUl = a => `<ul>${a.map(x => `<li>${x}</li>`).join("")}</ul>`;
const iniOl = a => `<ol>${a.map(x => `<li>${x}</li>`).join("")}</ol>`;
const iniH3 = t => `<h3>${t}</h3>`;
const iniCall = (k, t) =>
  k === "vig"
    ? `<aside class="ini-call vig"><b><span aria-hidden="true">⚠</span> Point de vigilance :</b> ${t}</aside>`
    : `<aside class="ini-call ped"><b><span aria-hidden="true">💡</span> ${k === "ex" ? "Exercice pédagogique simple" : k === "note" ? "Note pédagogique" : "Point pédagogique"} :</b> ${t}</aside>`;
const iniTable = (head, rows, firstTh) =>
  `<div class="ini-tw"><table><thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => (i === 0 && firstTh ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join("")}</tr>`).join("")}</tbody></table></div>`;
const INI_BODY = {
  accueil: () =>
    iniH3("Qu'est-ce que l'escalade de bloc ?") +
    iniP(
      "Le bloc, c'est grimper sans corde ni baudrier, sur des structures basses (murs de 3 à 4,5 m maximum en salle), au-dessus de tapis de réception épais. On grimpe des voies courtes et intenses, appelées des « blocs », identifiées par une couleur ou un numéro de prise. Contrairement à l'escalade à corde, la sécurité ne repose pas sur un système d'assurage, mais sur trois piliers : le tapis, la parade éventuelle d'un partenaire, et surtout la maîtrise de sa propre chute. C'est justement ce qu'on va apprendre en tout premier, avant même de toucher au mur."
    ) +
    iniH3("Bloc et escalade à corde : les grandes différences") +
    iniTable(
      ["", "Escalade de bloc", "Escalade à corde"],
      [
        ["Hauteur", "Basse (max. 3-4,5 m en salle)", "Élevée (10 m et plus)"],
        ["Sécurité", "Tapis + réception maîtrisée", "Corde + assurage par un partenaire"],
        ["Effort", "Court et intense, très technique", "Long, plus orienté endurance"],
        ["Essais", "On retente souvent le même bloc", "En général une tentative par voie"],
      ],
      true
    ) +
    iniH3("La cotation") +
    iniP(
      "Dans une salle de bloc, les voies destinées aux débutants sont le plus souvent classées par couleur plutôt que par une cotation chiffrée précise (comme le système « V » utilisé en compétition) : c'est plus lisible pour démarrer. On explique simplement au groupe le code couleur de la salle du jour avant de commencer à grimper."
    ) +
    iniH3("Les règles de sécurité du pan (à rappeler à chaque séance)") +
    iniUl([
      "Un seul grimpeur à la fois sur un bloc : on attend que la personne devant ait fini et se soit dégagée de la zone de réception.",
      "On ne grimpe jamais au-dessus ni en dessous de quelqu'un d'autre.",
      "On redescend en contrôlant ses appuis plutôt qu'en sautant du sommet, sauf consigne explicite de chute volontaire.",
      "On dégage systématiquement la zone de réception dès qu'on a fini son passage.",
      "On signale tout de suite un tapis mal placé ou un espace de réception insuffisant.",
    ]),
  chute: () =>
    iniH3("Pourquoi apprendre à tomber avant de grimper") +
    iniP(
      "Contrairement à l'escalade à corde où la chute est un non-événement (on est retenu par la corde), en bloc chaque geste se termine potentiellement par une réception au sol. Un débutant qui n'a pas appris à tomber correctement va, sans s'en rendre compte, se crisper et s'accrocher trop fort par peur de tomber, ce qui produit exactement les mauvaises habitudes de mouvement qu'on cherche à éviter. Apprendre à tomber en premier, c'est donner au corps la permission de bouger librement ensuite."
    ) +
    iniH3("La position de réception") +
    iniUl([
      "Genoux fléchis en permanence (jamais tendus) pour absorber le choc, comme un ressort.",
      "Réception sur les deux pieds si possible, à plat.",
      "Les bras restent devant le corps ou sur les côtés, jamais tendus en arrière pour « freiner » la chute (risque de fracture du poignet).",
      "Si le déséquilibre continue après la réception, on se laisse rouler sur le côté, dos rond, jamais en appui sur les mains ou les coudes.",
      "On regarde autant que possible où on va atterrir, pour anticiper.",
    ]) +
    INI_SVG.chute() +
    iniH3("Progression pédagogique (à enchaîner du plus simple au plus engagé)") +
    iniOl([
      "Depuis une position accroupie au sol, sans hauteur : sauter et se réceptionner genoux pliés, jusqu'à ce que le geste soit fluide et automatique.",
      "Depuis debout : petit saut vertical, réception genoux pliés.",
      "Depuis une prise basse (environ 30 à 40 cm) : lâcher et se réceptionner.",
      "Depuis une prise à hauteur de bassin : lâcher prise volontairement, chute « annoncée » à voix haute.",
      "Depuis une prise plus haute (hauteur d'épaule ou de tête) : lâcher sans hésiter, dans l'axe du tapis.",
    ]) +
    iniCall(
      "vig",
      "Vérifier systématiquement que la zone de réception est dégagée et le tapis bien positionné avant chaque essai. Ne jamais sauter en arrière ou de travers : toujours dans l'axe du tapis. Ne jamais chercher à « rattraper » une chute avec les mains posées au sol derrière soi."
    ),
  echauf: () =>
    iniH3("Pourquoi un échauffement spécifique") +
    iniP(
      "La grimpe sollicite énormément la préhension (doigts, poignets) et les épaules dans des positions inhabituelles (bras au-dessus de la tête, en rotation externe). Un échauffement classique de course à pied ou de sport collectif ne suffit pas : il faut cibler ces zones précisément avant de charger les doigts sur des prises."
    ) +
    iniH3("Déroulé de l'échauffement") +
    iniUl([
      "<b>Doigts et poignets :</b> ouverture-fermeture des mains, rotations de poignets, étirement doux des fléchisseurs (paumes jointes façon prière, puis dos des mains l'un contre l'autre).",
      "<b>Épaules :</b> cercles d'épaules, rotation des bras, ouverture de la cage thoracique, pour compenser la position « fermée » adoptée en grimpant.",
      "<b>Activation cardio légère :</b> quelques mouvements dynamiques (montées de genoux, pas chassés) pour élever un peu la température corporelle.",
      "<b>Prise de contact avec le mur :</b> 2 à 3 minutes de traversée très facile, en bas du mur, sans enjeu de performance, pour réveiller le toucher du bout des doigts.",
    ]) +
    iniCall(
      "vig",
      "Pas d'étirement statique poussé à froid sur les doigts : risque sur les poulies des fléchisseurs. On privilégie la mobilisation dynamique avant l'effort ; les étirements plus profonds se font après la séance, pas avant."
    ),
  theorie: () =>
    iniH3("4.1 — Le polygone de sustentation") +
    iniP(
      "Le polygone de sustentation, c'est la zone délimitée par tous les points d'appui du corps à un instant donné. Plus on a de points de contact (deux pieds et une main, par exemple), plus cette zone est grande, et plus l'équilibre est facile à maintenir. Chaque fois qu'on lâche une prise pour en attraper une autre, on réduit temporairement son polygone de sustentation : c'est le moment le plus instable du mouvement."
    ) +
    INI_SVG.polygone() +
    iniCall(
      "ped",
      "Avant de bouger une main ou un pied, on peut faire poser au grimpeur la question : « est-ce que mon centre de gravité reste bien au-dessus de mes appuis restants une fois ce point-là lâché ? »"
    ) +
    iniH3("4.2 — Le centre de gravité et son alignement") +
    iniP(
      "Le centre de gravité, grossièrement situé au niveau du bassin, doit rester autant que possible aligné à la verticale au-dessus du polygone de sustentation. Quand il en sort, le corps se déséquilibre et les bras doivent compenser en tirant plus fort, ce qui fatigue très vite."
    ) +
    INI_SVG.cdg() +
    iniCall(
      "ped",
      "Demander au débutant de sentir où se trouve son bassin par rapport à ses pieds, plutôt que de se concentrer uniquement sur ce que font ses mains."
    ) +
    iniH3("4.3 — Le placement des pieds") +
    iniP(
      "Ce sont les jambes qui portent le poids du corps, bien plus puissantes que les bras : la précision du poser de pied est donc la compétence technique la plus rentable pour un débutant."
    ) +
    iniH3("Les points clés du placement du pied") +
    iniUl([
      "Regarder son pied avant de le poser : pas de pose « à l'aveugle ».",
      "Poser la pointe du pied (zone la plus précise de la chaussure), pas tout le pied à plat.",
      "Poser une fois : ne pas replacer plusieurs fois le pied sur la même prise, ça use la précision et l'équilibre.",
      "Garder la cheville souple ; le talon peut légèrement descendre pour « coller » la chaussure à la prise.",
    ]) +
    iniH3("4.4 — Le placement des mains et la préhension") +
    iniP(
      "Contrairement à une idée reçue, les mains ne servent pas, à ce stade débutant, à « tirer » fort, mais surtout à maintenir l'équilibre pendant que les jambes font le travail de propulsion. On distingue quelques familles de prises simples à reconnaître : les prises « bac » (larges, faciles à tenir), les prises « plates » (surface plane, tenue en appui), les « réglettes » (fines, tenues du bout des doigts) et les « pinces » (tenues en pinçant entre le pouce et les autres doigts)."
    ) +
    iniCall(
      "ped",
      "Pour un débutant, insister sur la tenue « ouverte » (doigts peu fléchis) plutôt que la tenue « en crochet » fermée, bien moins traumatisante pour les doigts sur le long terme."
    ) +
    iniH3("4.5 — Le transfert de poids : grimper avec les jambes") +
    iniP(
      "Le réflexe naturel d'un débutant est de « tirer » avec les bras pour monter, comme à la corde lisse. C'est l'erreur la plus fatigante et la moins efficace. Le bon réflexe : pousser sur la jambe d'appui, comme pour se lever d'une chaise, pour faire monter le bassin ; les bras se contentent de garder l'équilibre et de suivre le mouvement."
    ) +
    INI_SVG.transfert() +
    iniCall(
      "ex",
      "Faire monter-descendre le débutant sur un mur très facile en lui demandant de garder les bras presque tendus tout du long. S'il n'y arrive pas, c'est le signe qu'il « tire » trop avec les bras plutôt que de pousser avec les jambes."
    ) +
    iniH3("4.6 — Économiser son énergie : bras tendus, corps près du mur") +
    iniP(
      "Un bras tendu, articulation « verrouillée », ne demande quasiment aucun effort musculaire pour supporter le poids du corps, contrairement à un bras plié, qui sollicite en permanence biceps et avant-bras. Un grimpeur débutant efficace cherche donc à garder les bras tendus le plus longtemps possible entre deux mouvements, et à rapprocher ses hanches du mur pour réduire le bras de levier exercé sur les bras."
    ) +
    INI_SVG.bras() +
    iniH3("4.7 — Bonus si le temps le permet : le drapeau") +
    iniP(
      "Quand il manque un appui pour les pieds d'un côté, on peut utiliser une jambe comme contrepoids en la tendant sur le côté ou en arrière du corps, sans qu'elle touche le mur : c'est ce qu'on appelle « faire un drapeau ». Ce mouvement permet de garder le centre de gravité aligné sans avoir besoin d'un appui pied supplémentaire."
    ) +
    INI_SVG.drapeau() +
    iniCall(
      "note",
      "N'introduire le drapeau qu'en fin de partie théorique, une fois les bases (placement des pieds, transfert de poids) bien comprises : sinon cela surcharge le débutant d'informations en une seule séance."
    ),
  pratique: () =>
    iniH3("Principe général") +
    iniP(
      "Chaque exercice porte sur une seule consigne à la fois, pour ne pas noyer le débutant sous plusieurs informations simultanées. On fait grimper le même bloc facile plusieurs fois, en changeant de consigne à chaque passage plutôt que d'enchaîner des blocs différents."
    ) +
    iniH3("Exercices progressifs") +
    iniTable(
      ["Exercice", "Consigne", "Ce qu'il fait travailler"],
      [
        [
          "1 — Silence sur les pieds",
          "Grimper en essayant de poser les pieds sans bruit, sans « clac » sur la prise.",
          "Précision du poser de pied, regard avant la pose (§4.3).",
        ],
        [
          "2 — Bras tendus",
          "Marquer un temps d'arrêt bras tendus avant chaque nouveau mouvement de main.",
          "Économie d'énergie, transfert de poids sur les jambes (§4.5-4.6).",
        ],
        [
          "3 — Un membre à la fois",
          "Interdiction de bouger deux membres en même temps : toujours 3 points d'appui fixes.",
          "Polygone de sustentation, équilibre (§4.1-4.2).",
        ],
        [
          "4 — Descente contrôlée",
          "Redescendre en contrôlant les appuis plutôt que de sauter, sauf consigne contraire.",
          "Transfert des acquis de la partie 2 en situation réelle.",
        ],
      ],
      true
    ) +
    iniCall(
      "ped",
      "<b>Variante bonus (sécurité renforcée) :</b> sur un mur très facile et peu haut, avancer les mains dans le dos ou juste posées sans agripper, seuls les pieds travaillent. Sensation forte de l'équilibre porté par les jambes seules, à réserver à un mur bas, tapis complet, encadrement proche."
    ),
  debrief: () =>
    iniH3("Déroulé") +
    iniUl([
      "Tour de parole rapide : qu'est-ce qui a été le plus surprenant ? le plus difficile ?",
      "Rappel des trois points clés de la séance : chute maîtrisée, bras tendus, pieds précis.",
      "Annonce de la suite du parcours (prochaine séance, couleur de bloc à essayer seul d'ici là).",
    ]),
};

function iniGuideHTML() {
  const resume = iniTable(
    ["#", "Partie", "Minutage", "Objectif"],
    INI_PARTS.map(p => [p[1], `<b>${esc(p[2])}</b>`, esc(p[3]), `<i>${esc(p[4])}</i>`])
  );
  return `<div class="ini" id="ini">
  <p class="ini-intro"><b>Public :</b> débutants, tout âge · <b>Durée totale :</b> ≈ 1 heure · dont ≈ 15 min de théorie du mouvement.<br><b>Comment utiliser ce guide :</b> la séance est découpée en 6 parties chronométrées, de l'accueil jusqu'au debrief. La partie 4 concentre la théorie du mouvement (polygone de sustentation, centre de gravité, placement des appuis, transfert de poids) avec des schémas simplifiés à l'appui. Les encadrés « point de vigilance » signalent un enjeu de sécurité ; les encadrés « point pédagogique » proposent un conseil pour faire passer la notion.</p>
  <nav class="ini-som noprint" aria-label="Sommaire du guide"><b>Sommaire</b><ol>${INI_PARTS.map(p => `<li><a href="#/g/initiation" data-ini="go:${p[0]}">${esc(p[2])}</a> <span>${esc(p[3])}</span></li>`).join("")}<li><a href="#/g/initiation" data-ini="go:gloss">Petit glossaire pour débuter</a></li></ol></nav>
  <h2 class="ini-h">Le programme en un coup d'œil</h2>
  <p>La séance suit toujours la même logique : on sécurise (chute) avant de comprendre (théorie), et on comprend avant de mettre en mouvement (pratique guidée).</p>${resume}
  ${INI_PARTS.map(p => `<section class="ini-sec" id="ini-${p[0]}" style="--bg:${p[5]};--fg:${p[6]}" aria-labelledby="ini-t-${p[0]}"><header><h2 id="ini-t-${p[0]}"><span class="ini-n">${p[1]}</span> ${esc(p[2])}</h2><div class="ini-min">Minutage indicatif : ${esc(p[3])}</div></header><p class="ini-obj"><i>${esc(p[4])}</i></p>${INI_BODY[p[0]]()}</section>`).join("")}
  <section class="ini-sec" id="ini-gloss" style="--bg:#EEF1F8;--fg:#26364D" aria-labelledby="ini-t-gloss"><header><h2 id="ini-t-gloss">Petit glossaire pour débuter</h2></header><p class="ini-obj"><i>De quoi comprendre les mots qu'on entend en salle dès la première séance.</i></p>${iniTable(
    ["Terme", "Définition"],
    INI_GLOSS.map(([a, b]) => [`<b>${esc(a)}</b>`, esc(b)]),
    true
  )}</section></div>`;
}

/* ---------- fiche de séance (modèle du site) ---------- */
function iniSeance() {
  let n = 1;
  const it = o => ({
    id: n++,
    t: "free",
    nom: "",
    titre: "",
    desc: "",
    part: "",
    mat: "",
    plus: "",
    moins: "",
    crit: "",
    ...o,
  });
  const sub = (titre, d, items) => ({ id: n++, titre, gs: null, d: [d], items });
  const meta = {
    titre: "Initiation à l'escalade de bloc",
    periode: "1 h",
    theme: "Initiation",
    educ: "",
    objectif:
      "Découvrir le bloc en sécurité : savoir tomber, comprendre l'équilibre et grimper avec les jambes.",
    dates: "",
    objCol:
      "Savoir tomber sans se blesser, comprendre pourquoi un mouvement fonctionne, et grimper des blocs très faciles en gardant les bras tendus et les pieds précis.",
    secu: "Un seul grimpeur à la fois sur un bloc · jamais au-dessus ou en dessous de quelqu'un · dégager la zone de réception après son passage · signaler un tapis mal placé · chute toujours dans l'axe du tapis, jamais en arrière ni de travers · ne jamais rattraper une chute avec les mains au sol.",
    modele: "std",
    logo: "",
    groups: [
      {
        nom: "Débutants (tout âge)",
        acc: 0,
        rc: "Étirements plus profonds des doigts, des poignets et des épaules, après la séance (pas avant). Rappel de la prochaine séance.",
      },
    ],
  };
  const se = {
    ech: { on: false, nom: "", d: [0], txt: "", per: false, gtxt: [""] },
    subs: [
      sub("1. Accueil et découverte du bloc", 5, [
        it({
          titre: "Présentation et règles du pan",
          part: "Tout le groupe",
          mat: "Aucun",
          desc: "Expliquer ce qu'est le bloc : grimper sans corde sur des murs bas (3 à 4,5 m) au-dessus de tapis épais.\nLa sécurité repose sur le tapis, la parade éventuelle d'un partenaire et la maîtrise de sa propre chute.\nExpliquer le code couleur des blocs de la salle du jour (pas de cotation chiffrée au début).\nRappeler les règles de sécurité du pan : un seul grimpeur à la fois, jamais au-dessus ou en dessous d'un autre, zone de réception dégagée, tapis mal placé signalé.",
          crit: "Chacun sait citer deux règles de sécurité du pan\nChacun repère la couleur de bloc du jour",
        }),
      ]),
      sub("2. Apprentissage de la chute", 10, [
        it({
          titre: "Position de réception",
          part: "Tout le groupe",
          mat: "Tapis de réception",
          desc: "Genoux fléchis en permanence, comme un ressort.\nRéception sur les deux pieds, à plat.\nBras devant le corps ou sur les côtés, jamais tendus en arrière.\nSi le déséquilibre continue, se laisser rouler sur le côté, dos rond.\nRegarder où l'on va atterrir.",
          crit: "Genoux fléchis à la réception\nBras devant le corps\nRéception dans l'axe du tapis",
        }),
        it({
          titre: "Progression de la chute",
          part: "Un grimpeur à la fois",
          mat: "Tapis de réception",
          desc: "1. Depuis accroupi au sol : sauter et se réceptionner genoux pliés.\n2. Depuis debout : petit saut vertical.\n3. Depuis une prise basse (30 à 40 cm) : lâcher et se réceptionner.\n4. Depuis une prise à hauteur de bassin : chute « annoncée » à voix haute.\n5. Depuis une prise à hauteur d'épaule ou de tête : lâcher sans hésiter, dans l'axe du tapis.",
          plus: "Passer au niveau suivant, depuis une prise plus haute",
          moins: "Rester au niveau précédent jusqu'à ce que le geste soit automatique",
          crit: "Zone de réception dégagée avant chaque essai\nAucune chute en arrière ou de travers",
        }),
      ]),
      sub("3. Échauffement spécifique", 7, [
        it({
          titre: "Doigts, poignets, épaules, traversée facile",
          part: "Tout le groupe",
          mat: "Aucun",
          desc: "Doigts et poignets : ouverture-fermeture des mains, rotations de poignets, étirement doux des fléchisseurs.\nÉpaules : cercles d'épaules, rotation des bras, ouverture de la cage thoracique.\nActivation cardio légère : montées de genoux, pas chassés.\nContact avec le mur : 2 à 3 minutes de traversée très facile, en bas du mur, sans enjeu.",
          crit: "Pas d'étirement statique poussé à froid sur les doigts",
        }),
      ]),
      sub("4. Théorie du mouvement", 15, [
        it({
          titre: "Polygone de sustentation",
          part: "Tout le groupe, au pied du mur",
          mat: "Aucun",
          desc: "Zone délimitée par tous les points d'appui du corps. Plus il y a de points de contact, plus l'équilibre est facile.\nLâcher une prise réduit le polygone : c'est le moment le plus instable.\nQuestion à poser : « mon centre de gravité reste-t-il au-dessus de mes appuis restants une fois ce point lâché ? »",
        }),
        it({
          titre: "Centre de gravité",
          part: "Tout le groupe",
          mat: "Aucun",
          desc: "Le centre de gravité (au niveau du bassin) doit rester à la verticale du polygone de sustentation.\nQuand il en sort, les bras compensent et fatiguent très vite.\nDemander de sentir où est le bassin par rapport aux pieds.",
        }),
        it({
          titre: "Placement des pieds",
          part: "Tout le groupe",
          mat: "Aucun",
          desc: "Regarder son pied avant de le poser.\nPoser la pointe du pied, pas le pied à plat.\nPoser une seule fois, sans replacer.\nGarder la cheville souple, le talon peut légèrement descendre.",
          crit: "Regard sur le pied avant la pose",
        }),
        it({
          titre: "Mains et préhension",
          part: "Tout le groupe",
          mat: "Aucun",
          desc: "Les mains servent surtout à l'équilibre, pas à tirer fort.\nReconnaître les prises : bac, plate, réglette, pince.\nPréférer la tenue « ouverte » (doigts peu fléchis) à la tenue « en crochet ».",
        }),
        it({
          titre: "Transfert de poids",
          part: "Par deux, un grimpeur et un observateur",
          mat: "Mur très facile",
          desc: "Pousser sur la jambe d'appui, comme pour se lever d'une chaise, pour faire monter le bassin.\nLes bras gardent l'équilibre et suivent.\nExercice : monter-descendre un mur très facile en gardant les bras presque tendus.",
          crit: "Bras presque tendus tout du long\nLe bassin monte avant les mains",
        }),
        it({
          titre: "Bras tendus, corps près du mur",
          part: "Tout le groupe",
          mat: "Aucun",
          desc: "Un bras tendu ne demande presque aucun effort musculaire ; un bras plié sollicite biceps et avant-bras en permanence.\nGarder les bras tendus entre deux mouvements et rapprocher les hanches du mur.",
        }),
        it({
          titre: "Bonus : le drapeau",
          part: "À introduire en dernier, si le temps le permet",
          mat: "Aucun",
          desc: "Jambe tendue sur le côté ou en arrière, sans toucher le mur, comme contrepoids.\nPermet de garder le centre de gravité aligné sans appui pied supplémentaire.\nN'introduire qu'une fois le placement des pieds et le transfert de poids compris.",
        }),
      ]),
      sub("5. Application pratique guidée", 18, [
        it({
          titre: "Silence sur les pieds",
          part: "Un grimpeur à la fois, même bloc facile",
          mat: "Bloc très facile, tapis",
          desc: "Grimper en essayant de poser les pieds sans bruit, sans « clac » sur la prise.",
          plus: "Mains dans le dos ou juste posées sans agripper : seuls les pieds travaillent (mur bas, tapis complet, encadrement proche)",
          crit: "Pieds posés sans bruit\nRegard sur le pied avant la pose",
        }),
        it({
          titre: "Bras tendus",
          part: "Un grimpeur à la fois, même bloc facile",
          mat: "Bloc très facile, tapis",
          desc: "Marquer un temps d'arrêt, bras tendus, avant chaque nouveau mouvement de main.",
          crit: "Un arrêt bras tendus avant chaque mouvement de main",
        }),
        it({
          titre: "Un membre à la fois",
          part: "Un grimpeur à la fois, même bloc facile",
          mat: "Bloc très facile, tapis",
          desc: "Interdiction de bouger deux membres en même temps : toujours 3 points d'appui fixes.",
          crit: "Toujours 3 points d'appui fixes",
        }),
        it({
          titre: "Descente contrôlée",
          part: "Un grimpeur à la fois, même bloc facile",
          mat: "Bloc très facile, tapis",
          desc: "Redescendre en contrôlant les appuis plutôt que de sauter, sauf consigne contraire.",
          crit: "Aucun saut à la descente",
        }),
      ]),
      sub("6. Debrief", 5, [
        it({
          titre: "Tour de parole et suite du parcours",
          part: "Tout le groupe",
          mat: "Aucun",
          desc: "Tour de parole rapide : qu'est-ce qui a été le plus surprenant ? le plus difficile ?\nRappel des trois points clés : chute maîtrisée, bras tendus, pieds précis.\nAnnonce de la suite : prochaine séance, couleur de bloc à essayer seul d'ici là.",
        }),
      ]),
    ],
  };
  return { meta, se };
}
const iniClone = o => JSON.parse(JSON.stringify(o));

function iniFicheHTML() {
  const d = iniSeance();
  return `<div class="tools noprint"><a class="btn" data-ini="print-fiche" role="button" tabindex="0" style="background:#26364D;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Imprimer / PDF</a><a class="btn" data-ini="word" role="button" tabindex="0" style="background:#2B5A9E;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Télécharger en Word</a><a class="btn" data-ini="use" role="button" tabindex="0" style="background:#2E7D4F;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">✎ Adapter cette séance</a><a class="btn" data-ini="terrain" role="button" tabindex="0" style="background:#E8A33D;color:#26364D;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">▶ Mode terrain</a><span id="sMsg" style="color:#2E7D4F;font-weight:700"></span></div>
  <div id="sheet" style="border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.12)">${withSeance(d.meta, d.se, () => sheetHTML())}</div>`;
}
function iniView() {
  const t = INI.tab;
  const head = gsec(
    "Initiation à l'escalade de bloc",
    "Guide de séance : comprendre, tomber, grimper. Une heure pour des débutants de tout âge, dont environ 15 minutes de théorie du mouvement."
  );
  const tabs = `<div class="tools noprint"><div class="seg" role="tablist"><button role="tab" aria-selected="${t === "guide"}" data-ini="tab:guide" class="${t === "guide" ? "on" : ""}">Le guide</button><button role="tab" aria-selected="${t === "fiche"}" data-ini="tab:fiche" class="${t === "fiche" ? "on" : ""}">Fiche de séance</button></div>${t === "guide" ? `<a class="btn" data-ini="print" role="button" tabindex="0" style="background:#26364D;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Imprimer / PDF</a>` : ""}</div>`;
  return head + tabs + (t === "guide" ? iniGuideHTML() : iniFicheHTML());
}
function imprimerGuide() {
  document.body.classList.add("pg");
  let fini = false;
  const net = () => {
    if (fini) return;
    fini = true;
    document.body.classList.remove("pg");
    window.removeEventListener("afterprint", net);
  };
  window.addEventListener("afterprint", net);
  setTimeout(net, 60000);
  window.print();
}
registerClick(e => {
  const b = e.target.closest("[data-ini]");
  if (!b) return;
  const [a, v] = b.dataset.ini.split(":");
  if (a === "tab") {
    INI.tab = v;
    render();
  } else if (a === "go") {
    const el = document.getElementById("ini-" + v);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    }
  } else if (a === "print") imprimerGuide();
  else if (a === "print-fiche") imprimerSeance();
  else if (a === "word") seanceWord(iniSeance());
  else if (a === "use") sepopOuvrir(iniSeance(), "", "modele");
  else if (a === "terrain") {
    const d = iniSeance();
    terrainOuvrir(d.meta, d.se, "", false);
  }
  return true;
});
document.addEventListener("keydown", e => {
  if (
    (e.key === "Enter" || e.key === " ") &&
    e.target.matches &&
    e.target.matches("[data-ini][role=button]")
  ) {
    e.preventDefault();
    e.target.click();
  }
});
