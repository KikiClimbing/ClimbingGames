/* Éditeur de schémas — poses supplémentaires du personnage de Prépa physique et objets (table, boîte, rouleau…).
   Chargé après gym.js. V(base, modifications) crée une variante d'une pose existante. */
const V = (b, o) => Object.assign({}, JSON.parse(JSON.stringify(GYMPOSES[b])), o);
const D = GYMPOSES.debout,
  F0 = GYMPOSES.face;
Object.assign(GYMPOSES, {
  /* ---- debout ---- */
  coude90_s: V("debout", {
    l: "Coude à 90°, avant-bras devant (de profil)",
    hands: [
      [3.5, 11.6],
      [-0.4, 8.4],
    ],
    ep: [
      [0, -1],
      [-1, 0],
    ],
  }),
  armee_bas: V("face", {
    l: "Bras à l'horizontale, avant-bras vers le bas (de face)",
    g: "Debout",
    hands: [
      [5.8, 11.4],
      [-3.6, 8.2],
    ],
    ep: [
      [1, 1],
      [-1, 0],
    ],
  }),
  armee_haut: V("face", {
    l: "Position armée : avant-bras vertical (de face)",
    g: "Debout",
    hands: [
      [5.8, 18.2],
      [-3.6, 8.2],
    ],
    ep: [
      [1, -1],
      [-1, 0],
    ],
  }),
  face_hanches: V("face", {
    l: "Mains sur les hanches (de face)",
    g: "Debout",
    hands: [
      [3.4, 9.6],
      [-3.4, 9.6],
    ],
    ep: [
      [1, 0],
      [-1, 0],
    ],
  }),
  pallof: V("face", {
    l: "Mains au centre de la poitrine (de face)",
    g: "Debout",
    hands: [
      [0.7, 13.2],
      [-0.7, 13.2],
    ],
    ep: [
      [1, -1],
      [-1, -1],
    ],
  }),
  priere: V("face", {
    l: "Mains jointes devant la poitrine (de face)",
    g: "Debout",
    hands: [
      [0.5, 13.4],
      [-0.5, 13.4],
    ],
    ep: [
      [1, -0.6],
      [-1, -0.6],
    ],
  }),
  priere_inv: V("face", {
    l: "Mains jointes devant le ventre (de face)",
    g: "Debout",
    hands: [
      [0.5, 10.6],
      [-0.5, 10.6],
    ],
    ep: [
      [1, 0],
      [-1, 0],
    ],
  }),
  v_face: V("face", {
    l: "Bras en V au-dessus de la tête (de face)",
    g: "Debout",
    hands: [
      [5.2, 20.9],
      [-5.2, 20.9],
    ],
    ep: [
      [1, 0],
      [-1, 0],
    ],
  }),
  w_face: V("face", {
    l: "Bras en W, coudes bas (de face)",
    g: "Debout",
    hands: [
      [4.8, 17.4],
      [-4.8, 17.4],
    ],
    ep: [
      [1, -1],
      [-1, -1],
    ],
  }),
  baton_haut: V("face", {
    l: "Bâton au-dessus de la tête (de face)",
    g: "Debout",
    hands: [
      [5.2, 20.6],
      [-5.2, 20.6],
    ],
    ep: [
      [1, 0],
      [-1, 0],
    ],
  }),
  croissant: V("face", {
    l: "Croissant debout : bras en l'air, buste incliné (de face)",
    g: "Debout",
    lean: 16,
    hands: [
      [5.2, 21.2],
      [1.4, 21.4],
    ],
    ep: [
      [1, 0],
      [1, 0],
    ],
  }),
  cou_lateral: V("face", {
    l: "Tête inclinée de côté, main sur la tête (de face)",
    g: "Debout",
    hq: -35,
    hands: [
      [-1.2, 19.4],
      [-3.6, 8.2],
    ],
    ep: [
      [1, 1],
      [-1, 0],
    ],
  }),
  etir_croise: V("face", {
    l: "Étirement croisé du bras (de face)",
    g: "Debout",
    hands: [
      [-3.4, 14.8],
      [-0.6, 14.6],
    ],
    ep: [
      [0, -1],
      [-1, -1],
    ],
  }),
  curl_bas: V("debout", {
    l: "Bras le long du corps, paumes vers l'avant (de profil)",
    hands: [
      [1, 8.2],
      [0.4, 8.2],
    ],
  }),
  curl_haut: V("debout", {
    l: "Avant-bras fléchis, coudes au corps (de profil)",
    hands: [
      [2.9, 14.2],
      [2.4, 13.8],
    ],
    ep: [
      [-1, -1],
      [-1, -1],
    ],
  }),
  press_bas: V("debout", {
    l: "Haltères à hauteur d'épaule (de profil)",
    hands: [
      [1.6, 15.6],
      [1.0, 15.2],
    ],
    ep: [
      [-1, -0.6],
      [-1, -0.6],
    ],
  }),
  face_pull: V("debout", {
    l: "Mains vers le visage, coudes hauts (de profil)",
    hands: [
      [3.4, 16.8],
      [2.8, 16.2],
    ],
    ep: [
      [0, 1],
      [0, 1],
    ],
  }),
  tri_haut: V("debout", {
    l: "Bras tendus au-dessus de la tête (de profil)",
    hands: [
      [0.6, 21],
      [0, 21.1],
    ],
  }),
  tri_bas: V("debout", {
    l: "Coudes pliés derrière la tête (de profil)",
    hands: [
      [-2.2, 17.8],
      [-2.6, 17.4],
    ],
    ep: [
      [-1, 1],
      [-1, 1],
    ],
  }),
  charn_y: V("charniere", {
    l: "Penché, bras en Y",
    hands: [
      [7.4, 15.6],
      [7, 15.1],
    ],
    ep: [
      [0, -1],
      [0, -1],
    ],
  }),
  charn_t: V("charniere", {
    l: "Penché, bras en T",
    hands: [
      [8.2, 12.2],
      [7.8, 11.8],
    ],
    ep: [
      [0, -1],
      [0, -1],
    ],
  }),
  charn_mur: V("charniere", {
    l: "Penché, mains contre un mur",
    hands: [
      [8.6, 12.4],
      [8.6, 12.2],
    ],
    ep: [
      [0, -1],
      [0, -1],
    ],
  }),
  charn_bas: V("charniere", {
    l: "Penché en avant, bras pendants",
    hip: [-3.6, 9.4],
    lean: 70,
    hands: [
      [2.0, 5.2],
      [1.6, 5.2],
    ],
  }),
  charn_baton: V("charniere", {
    l: "Penché, bâton le long du dos",
    hands: [
      [-1.2, 11.2],
      [-1.6, 10.8],
    ],
    ep: [
      [-1, 0],
      [-1, 0],
    ],
  }),
  pince: V("charniere", {
    l: "Flexion avant, mains vers le sol",
    hip: [-0.8, 9.2],
    lean: 150,
    hq: 165,
    hands: [
      [3.0, 1.0],
      [2.6, 0.8],
    ],
    feet: [
      [0.3, 0],
      [-0.3, 0],
    ],
    kp: [
      [1, 0],
      [1, 0],
    ],
    ep: [
      [1, 0],
      [1, 0],
    ],
  }),
  valise: V("debout", {
    l: "Charge dans une main, debout droit",
    hands: [
      [0.8, 8.4],
      [-0.4, 8.4],
    ],
  }),
  elev_mollets: V("debout", {
    l: "Sur la pointe des pieds",
    hands: [
      [3.2, 9.6],
      [-3.2, 9.6],
    ],
    feet: [
      [0.3, 1.3],
      [-0.3, 1.3],
    ],
    hip: [0, 10.4],
  }),
  squat_prof: V("squat", {
    l: "Accroupi profond",
    hip: [-2.4, 3.2],
    lean: 36,
    hands: [
      [3.2, 4.6],
      [3.0, 4.4],
    ],
    feet: [
      [1, 0],
      [0.6, 0],
    ],
    ep: [
      [0, -1],
      [0, -1],
    ],
  }),
  fente_basse: V("fente", {
    l: "Fente basse, genou arrière au sol",
    hip: [0.8, 5.2],
    hands: [
      [1.8, 5.8],
      [-0.2, 5.8],
    ],
    feet: [
      [4.4, 0],
      [-4.2, 0.4],
    ],
    kp: [
      [1, 0.2],
      [0, -1],
    ],
  }),
  fente_rot: V("fente", {
    l: "Fente basse, buste ouvert",
    hip: [0.8, 5.2],
    feet: [
      [4.4, 0],
      [-4.2, 0.4],
    ],
    kp: [
      [1, 0.2],
      [0, -1],
    ],
    hands: [
      [3.6, 18.4],
      [-2.6, 13.4],
    ],
    ep: [
      [1, 0],
      [-1, -1],
    ],
  }),
  fente_ouv: V("fente", {
    l: "Fente basse, mains au sol",
    hip: [1.2, 4.6],
    lean: 40,
    hands: [
      [4.8, 0.4],
      [3.8, 0.4],
    ],
    feet: [
      [5, 0],
      [-4.8, 0.4],
    ],
    kp: [
      [1, 0.2],
      [0, -1],
    ],
    ep: [
      [0, -1],
      [0, -1],
    ],
  }),
  psoas: V("fente", {
    l: "Fente arrière, genou au sol, buste droit",
    hip: [0.8, 5],
    hands: [
      [1.6, 6.6],
      [-0.2, 6.6],
    ],
    feet: [
      [4.4, 0],
      [-4.2, 0.4],
    ],
    kp: [
      [1, 0.2],
      [0, -1],
    ],
  }),
  psoas_banc: V("fente", {
    l: "Fente arrière, pied arrière sur un banc",
    hip: [0.8, 7.4],
    hands: [
      [1.6, 9],
      [-0.2, 9],
    ],
    feet: [
      [4.6, 0],
      [-5.4, 4.6],
    ],
    kp: [
      [1, 0.2],
      [0, -1],
    ],
  }),
  quad: V("debout", {
    l: "Debout, talon vers la fesse",
    hands: [
      [0.4, 8.4],
      [-1.8, 8.6],
    ],
    feet: [
      [0.3, 0],
      [-1.6, 8.4],
    ],
    kp: [
      [1, 0],
      [1, -1],
    ],
  }),
  mollet_mur: V("fente", {
    l: "Appui au mur, jambe arrière tendue",
    hip: [1, 8.4],
    lean: 18,
    hands: [
      [8.4, 12.8],
      [8.4, 12.4],
    ],
    feet: [
      [4.2, 0],
      [-3.8, 0],
    ],
    kp: [
      [1, 0.3],
      [1, 0],
    ],
    ep: [
      [0, -1],
      [0, -1],
    ],
  }),
  cheville_mur: V("fente", {
    l: "Genou vers le mur, talon au sol",
    hip: [3, 8.4],
    lean: 8,
    hands: [
      [5.2, 9.4],
      [4.6, 9],
    ],
    feet: [
      [4.4, 0],
      [-1.8, 0],
    ],
    kp: [
      [1, 0.4],
      [1, 0],
    ],
  }),
  balle_pied: V("debout", {
    l: "Un pied sur une balle",
    hands: [
      [3.2, 9.6],
      [-3.2, 9.6],
    ],
    feet: [
      [0.3, 1.7],
      [-0.3, 0],
    ],
  }),
  /* ---- assis ---- */
  assis_table: V("assis", {
    l: "Assis à une table, avant-bras posé",
    hands: [
      [7, 10.6],
      [6.2, 10.6],
    ],
    ep: [
      [-1, -0.2],
      [-1, -0.2],
    ],
  }),
  assis_pied: V("assis", {
    l: "Assis, un pied levé",
    feet: [
      [4.6, 3.4],
      [2.8, 0],
    ],
    hands: [
      [3.4, 4.2],
      [2.8, 6.4],
    ],
  }),
  assis_torsion: V("assis", {
    l: "Assis, buste tourné",
    hands: [
      [3.6, 7.2],
      [-2.8, 9.6],
    ],
    ep: [
      [0, -1],
      [-1, 0],
    ],
  }),
  lotus: V("face", {
    l: "Assis en tailleur / lotus (genoux réglables)",
    g: "Assis",
    hip: [0, 1.2],
    lean: 0,
    hands: [
      [4.4, 1.3],
      [-4.4, 1.3],
    ],
    feet: [
      [-1.6, 1.5],
      [1.6, 1.5],
    ],
    kt: [
      [4.3, 0.7],
      [-4.3, 0.7],
    ],
    ep: [
      [1, 0.3],
      [-1, 0.3],
    ],
  }),
  papillon: V("face", {
    l: "Assis, plantes des pieds jointes (papillon)",
    g: "Assis",
    hip: [0, 1.4],
    lean: 0,
    hands: [
      [1.8, 0.8],
      [-1.8, 0.8],
    ],
    feet: [
      [0.9, 0.4],
      [-0.9, 0.4],
    ],
    kp: [
      [1, 0],
      [-1, 0],
    ],
    ep: [
      [1, 0.5],
      [-1, 0.5],
    ],
  }),
  ecart: V("face", {
    l: "Assis, jambes écartées (écart facial)",
    g: "Assis",
    hip: [0, 1.4],
    lean: 0,
    hands: [
      [1.8, 0.4],
      [-1.8, 0.4],
    ],
    feet: [
      [10.4, 0.8],
      [-10.4, 0.8],
    ],
    kp: [
      [1, 1],
      [-1, 1],
    ],
    ep: [
      [1, 0],
      [-1, 0],
    ],
  }),
  fente_lat: V("face", {
    l: "Fente latérale (de face)",
    g: "Debout",
    hip: [3.2, 6.4],
    lean: 0,
    hands: [
      [5.2, 8.6],
      [0.8, 8.6],
    ],
    feet: [
      [6.2, 0],
      [-5.6, 0],
    ],
    kp: [
      [1, 0.3],
      [-1, 0],
    ],
    ep: [
      [1, 0],
      [-1, 0],
    ],
  }),
  /* ---- au sol ---- */
  dos_jambe: V("dos_genoux", {
    l: "Allongé, une jambe levée tenue à deux mains",
    lean: 62,
    hq: 80,
    feet: [
      [1.2, 10.2],
      [-9, 0.6],
    ],
    hands: [
      [1.6, 7.6],
      [1.2, 7.2],
    ],
    kp: [
      [0, 1],
      [0, 1],
    ],
    ep: [
      [1, 0],
      [1, 0],
    ],
  }),
  genou_poitrine: V("dos_genoux", {
    l: "Allongé, un genou ramené vers la poitrine",
    lean: 75,
    hq: 85,
    feet: [
      [3.6, 1.4],
      [-8.8, 0.6],
    ],
    hands: [
      [3.4, 5.6],
      [3, 5.2],
    ],
    kp: [
      [-0.3, 1],
      [0, 1],
    ],
    ep: [
      [0, 1],
      [0, 1],
    ],
  }),
  figure4: V("dos_genoux", {
    l: "Allongé, cheville sur le genou opposé (figure 4)",
    feet: [
      [-3.8, 0],
      [-2.2, 5.2],
    ],
    kp: [
      [0, 1],
      [-1, 0.6],
    ],
    hands: [
      [-1.4, 4.4],
      [-1.8, 3.8],
    ],
  }),
  dos_tendu: V("dos_genoux", {
    l: "Allongé sur le dos, jambes tendues",
    feet: [
      [-9, 0.5],
      [-9.2, 0.5],
    ],
  }),
  jambes_mur: V("dos_genoux", {
    l: "Allongé, jambes tendues contre le mur",
    hip: [2.4, 1.4],
    feet: [
      [-0.2, 10.4],
      [-0.4, 10.2],
    ],
    hands: [
      [3.8, 0.5],
      [4.4, 0.5],
    ],
    kp: [
      [0, 1],
      [0, 1],
    ],
  }),
  dos_ventre: V("dos_genoux", {
    l: "Allongé sur le dos, mains sur le ventre",
    hands: [
      [2.2, 2.8],
      [1.2, 2.6],
    ],
    ep: [
      [0, 1],
      [0, 1],
    ],
  }),
  rouleau: V("dos_genoux", {
    l: "Allongé sur le dos, mains derrière la tête",
    lean: 96,
    hands: [
      [7.8, 3.4],
      [7.2, 3.0],
    ],
    ep: [
      [0, 1],
      [0, 1],
    ],
  }),
  open_book: V("dos_genoux", {
    l: "Allongé, un bras ouvert",
    hands: [
      [4.6, 7.6],
      [7.6, 0.6],
    ],
    ep: [
      [0, 1],
      [0, 1],
    ],
  }),
  sleeper: V("dos_genoux", {
    l: "Sur le côté, bras à 90°",
    hip: [0, 1.6],
    feet: [
      [-3.8, 0.4],
      [-3.4, 1.4],
    ],
    hands: [
      [8.4, 3.8],
      [5.4, 4.8],
    ],
    ep: [
      [0, 1],
      [0, 1],
    ],
  }),
  hollow: V("dos_genoux", {
    l: "Gainage dos : épaules et jambes décollées",
    lean: 66,
    hq: 66,
    hands: [
      [11.6, 4.6],
      [11.2, 4.2],
    ],
    feet: [
      [-8.6, 3.8],
      [-8.9, 3.5],
    ],
    ep: [
      [0, 1],
      [0, 1],
    ],
  }),
  deadbug: V("dos_genoux", {
    l: "Dead bug : bras tendus, genoux à 90°",
    hands: [
      [5.8, 8.2],
      [5.4, 8],
    ],
    feet: [
      [-4.6, 6.2],
      [-4.8, 6],
    ],
    kp: [
      [0, 1],
      [0, 1],
    ],
    ep: [
      [0, 1],
      [0, 1],
    ],
  }),
  deadbug2: V("dos_genoux", {
    l: "Dead bug : bras et jambe opposés étendus",
    hands: [
      [11.6, 1.2],
      [5.4, 8],
    ],
    feet: [
      [-4.6, 6.2],
      [-9, 2.2],
    ],
    kp: [
      [0, 1],
      [0, 1],
    ],
    ep: [
      [0, 1],
      [0, 1],
    ],
  }),
  pont_uni: V("pont", {
    l: "Pont fessier, une jambe tendue",
    feet: [
      [-3.4, 0],
      [-6.6, 11.2],
    ],
    kp: [
      [0, 1],
      [0, 1],
    ],
  }),
  superman: V("ventre", {
    l: "Superman : bras et jambes décollés",
    lean: 80,
    hq: 70,
    hands: [
      [11.6, 3.6],
      [11.2, 3.2],
    ],
    feet: [
      [-8.8, 2.8],
      [-9, 2.4],
    ],
  }),
  ventre_lat: V("ventre", {
    l: "À plat ventre, bras décollés sur les côtés",
    hands: [
      [5.2, 3.8],
      [4.8, 3.4],
    ],
    feet: [
      [-8.9, 0.4],
      [-9, 0.4],
    ],
  }),
  ventre_w: V("ventre", {
    l: "À plat ventre, bras en W",
    hands: [
      [7.8, 3.8],
      [7.4, 3.4],
    ],
    ep: [
      [-1, 1],
      [-1, 1],
    ],
    feet: [
      [-8.9, 0.4],
      [-9, 0.4],
    ],
  }),
  pompe_bas: V("pompe", {
    l: "Pompe, poitrine proche du sol",
    hip: [0, 2.9],
    lean: 83,
    hq: 83,
    hands: [
      [5.2, 0.3],
      [5, 0.3],
    ],
    feet: [
      [-8.6, 0.3],
      [-8.7, 0.3],
    ],
    ep: [
      [-1, 0.4],
      [-1, 0.4],
    ],
  }),
  pompe_genoux: V("pompe", {
    l: "Pompe sur les genoux",
    hip: [0, 4],
    lean: 63,
    hq: 63,
    hands: [
      [5.3, 0.3],
      [5.1, 0.3],
    ],
    feet: [
      [-7.2, 2.6],
      [-7, 2.8],
    ],
    kp: [
      [0, -1],
      [0, -1],
    ],
  }),
  pompe_epaule: V("pompe", {
    l: "Planche, une main à l'épaule",
    hands: [
      [4.8, 7.2],
      [5, 0.3],
    ],
  }),
  pompe_rond: V("pompe", {
    l: "Planche, dos arrondi (omoplates écartées)",
    hip: [0, 4.9],
    lean: 62,
    hq: 45,
    hands: [
      [5, 0.5],
      [4.8, 0.5],
    ],
  }),
  lateral: V("planche", {
    l: "Gainage latéral sur l'avant-bras",
    hands: [
      [5.6, 0.3],
      [5.9, 10.2],
    ],
    ep: [
      [0, -1],
      [-1, 0],
    ],
  }),
  bird: V("quatre", {
    l: "Bird dog : bras et jambe opposés étendus",
    hands: [
      [12, 6.3],
      [5.6, 0.2],
    ],
    feet: [
      [-4.6, 0.3],
      [-9.2, 5.4],
    ],
    kp: [
      [0.3, -1],
      [0, 1],
    ],
  }),
  nordic1: V("quatre", {
    l: "À genoux, buste droit",
    hip: [0, 4.6],
    lean: 0,
    hq: 0,
    hands: [
      [1.2, 12.4],
      [0.8, 12.2],
    ],
    feet: [
      [-4.4, 0.3],
      [-4.7, 0.3],
    ],
    ep: [
      [1, -1],
      [1, -1],
    ],
  }),
  nordic2: V("quatre", {
    l: "À genoux, chute contrôlée vers l'avant",
    hip: [0, 4.6],
    lean: 72,
    hq: 72,
    hands: [
      [10.2, 3],
      [9.8, 2.6],
    ],
    feet: [
      [-4.4, 0.3],
      [-4.7, 0.3],
    ],
  }),
  chat: V("quatre", {
    l: "Dos rond (chat)",
    hip: [0, 5.4],
    lean: 74,
    hq: 40,
  }),
  vache: V("quatre", {
    l: "Dos creux (vache)",
    hip: [0, 4.6],
    lean: 92,
    hq: 115,
  }),
  pigeon: V("quatre", {
    l: "Pigeon : jambe avant repliée, jambe arrière tendue",
    hip: [0, 2.4],
    lean: 62,
    hq: 62,
    hands: [
      [6.4, 0.4],
      [6, 0.4],
    ],
    feet: [
      [-1, 0.4],
      [-9, 0.4],
    ],
    kp: [
      [1, 0.2],
      [0, 1],
    ],
  }),
  grenouille: V("quatre", {
    l: "Grenouille : genoux écartés, bassin en arrière",
    hip: [-3.4, 3.8],
    lean: 78,
    hq: 78,
    hands: [
      [8.4, 0.4],
      [8, 0.4],
    ],
    feet: [
      [-6.6, 0.4],
      [-6.9, 0.4],
    ],
    kp: [
      [0.3, -1],
      [0.3, -1],
    ],
  }),
  enfant: V("quatre", {
    l: "Posture de l'enfant",
    hip: [-3.2, 2.4],
    lean: 78,
    hq: 95,
    hands: [
      [8.6, 0.4],
      [9, 0.5],
    ],
    feet: [
      [-3.8, 0.4],
      [-4.1, 0.4],
    ],
    kp: [
      [1, -0.3],
      [1, -0.3],
    ],
  }),
  chien: V("quatre", {
    l: "Chien tête en bas",
    hip: [2, 8.8],
    lean: 120,
    hq: 150,
    hands: [
      [6.9, 0.3],
      [6.6, 0.3],
    ],
    feet: [
      [-1.8, 0.3],
      [-2, 0.3],
    ],
    kp: [
      [0.3, 1],
      [0.3, 1],
    ],
    ep: [
      [0, 1],
      [0, 1],
    ],
  }),
  russe: V("assis", {
    l: "Assis penché en arrière, pieds décollés",
    g: "Assis",
    hip: [0, 2.2],
    lean: -35,
    hq: -35,
    hands: [
      [3.8, 6.4],
      [3.4, 6],
    ],
    feet: [
      [8, 3.8],
      [7.6, 3.4],
    ],
    kp: [
      [0, -1],
      [0, -1],
    ],
    ep: [
      [0, -1],
      [0, -1],
    ],
  }),
  /* ---- suspension ---- */
  susp: V("bras_haut", {
    l: "Suspendu à une barre, bras tendus",
    g: "Suspension",
    hip: [0, 10.1],
    hands: [
      [2.2, 22],
      [1.8, 22],
    ],
    feet: [
      [0.3, 1.1],
      [-0.2, 1.1],
    ],
    ep: [
      [0, 0],
      [0, 0],
    ],
  }),
  /* ---- cardio ---- */
  course: V("debout", {
    l: "Course à pied",
    g: "Cardio",
    lean: 8,
    hip: [0, 9.4],
    hands: [
      [3.4, 11.6],
      [-3.8, 10.4],
    ],
    feet: [
      [3, 3.2],
      [-3.8, 0],
    ],
    kp: [
      [1, 0],
      [0, -1],
    ],
    ep: [
      [0, -1],
      [0, -1],
    ],
  }),
  velo: V("assis", {
    l: "À vélo",
    g: "Cardio",
    hip: [-1.4, 8.2],
    lean: 38,
    hq: 45,
    hands: [
      [5.6, 11.2],
      [5.4, 11],
    ],
    feet: [
      [1.6, 1.8],
      [-1.4, 3.6],
    ],
    kp: [
      [1, 0.2],
      [1, 0.2],
    ],
    ep: [
      [0, -1],
      [0, -1],
    ],
  }),
});
Object.assign(GYMPOSES, {
  susp_active: V("susp", {
    l: "Suspendu, épaules actives (tirées vers le bas)",
    hip: [0, 11.3],
    feet: [
      [0.3, 2.3],
      [-0.2, 2.3],
    ],
    ep: [
      [-1, 0],
      [-1, 0],
    ],
  }),
  susp_prot: V("susp", {
    l: "Suspendu, dos arrondi (omoplates écartées)",
    lean: -8,
    hq: -4,
    hip: [-0.6, 10.1],
    feet: [
      [1.4, 1],
      [1, 0.8],
    ],
  }),
  susp_flechi: V("susp", {
    l: "Suspendu, bras fléchis, menton au-dessus de la barre",
    hip: [0, 14.6],
    hands: [
      [1.8, 22],
      [1.4, 22],
    ],
    feet: [
      [0.3, 5.5],
      [-0.2, 5.5],
    ],
    ep: [
      [-1, -0.4],
      [-1, -0.4],
    ],
  }),
});
/* ---- objets supplémentaires ---- */
Object.assign(GYMNOMS, {
  box: "Boîte, marche ou banc bas",
  table: "Table",
  bowl: "Bac de riz",
  roller: "Rouleau de massage",
  wallbg: "Mur (fond)",
  bike: "Vélo",
});
GYMOBJ.push("box", "table", "bowl", "roller", "wallbg", "bike");
const _gymObjSVG = gymObjSVG;
gymObjSVG = function (e) {
  const s = e.s || 1,
    tf = `transform="translate(${e.x} ${EY(e.y)}) rotate(${-(e.rot || 0)}) scale(${s})"`;
  const R = (x, y, w, h, fill, st, rx = 0.2) =>
    `<rect x="${x}" y="${-(y + h)}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${st}" stroke-width=".22"/>`;
  switch (e.t) {
    case "box":
      return `<g ${tf}>${R(-4, 0, 8, e.h || 4.4, "#C99A5B", "#8A6330", 0.3)}</g>`;
    case "table":
      return `<g ${tf}>${R(-5, 9.6, 10, 0.7, "#C99A5B", "#8A6330", 0.3)}${R(-4.3, 0, 0.6, 9.6, "#A97B3F", "#8A6330")}${R(3.7, 0, 0.6, 9.6, "#A97B3F", "#8A6330")}</g>`;
    case "bowl":
      return `<g ${tf}><path d="M-2.6 0Q0 -3.2 2.6 0Z" fill="#F2E8D0" stroke="#B9A57A" stroke-width=".25"/><path d="M-2.4 -0.2H2.4" stroke="#B9A57A" stroke-width=".2"/></g>`;
    case "roller":
      return `<g ${tf}><circle cx="0" cy="0" r="1.7" fill="#9CC5DD" stroke="#5B8BA8" stroke-width=".25"/><circle cx="0" cy="0" r=".6" fill="#fff" stroke="#5B8BA8" stroke-width=".18"/></g>`;
    case "wallbg":
      return `<g ${tf}>${R(-11, 0, 22, 27, "#EEF2F8", "#EEF2F8", 0)}</g>`;
    case "bike":
      return `<g ${tf}><g transform="scale(1 -1)"><circle cx="-6.4" cy="3.3" r="3.3" fill="none" stroke="#475569" stroke-width=".4"/><circle cx="6.4" cy="3.3" r="3.3" fill="none" stroke="#475569" stroke-width=".4"/><path d="M-6.4 3.3L-1.6 3.3L-3.6 9.2L2.4 9.2L6.4 3.3M-1.6 3.3L2.4 9.2M-3.6 9.2L-3.9 10.2M2.4 9.2L4.6 10.6M4.6 10.6H6.4" fill="none" stroke="#64748B" stroke-width=".5" stroke-linejoin="round"/><path d="M-4.6 10.2H-2.8" stroke="#334155" stroke-width=".6"/></g></g>`;
  }
  return _gymObjSVG(e);
};
Object.assign(EDP, {
  box: () => ({ t: "box", x: 50, y: 6, s: 1, h: 4.4, c: "grey", rot: 0 }),
  table: () => ({ t: "table", x: 50, y: 6, s: 1, c: "grey", rot: 0 }),
  bowl: () => ({ t: "bowl", x: 50, y: 12, s: 1, c: "grey", rot: 0 }),
  roller: () => ({ t: "roller", x: 50, y: 8, s: 1, c: "grey", rot: 0 }),
  wallbg: () => ({ t: "wallbg", x: 50, y: 6, s: 1, c: "grey", rot: 0 }),
  bike: () => ({ t: "bike", x: 50, y: 6, s: 1, c: "grey", rot: 0 }),
});
