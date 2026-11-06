/* Compétences travaillées : chaque jeu porte ses compétences dans la colonne « Compétences » (cases à cocher,
   plusieurs possibles). COMP_INIT donne le classement de départ des jeux de base tant que la colonne est vide. */
const COMPETENCES = [
  ["Lecture du mur", "Repérer les prises, anticiper un trajet, choisir son itinéraire."],
  ["Équilibre et placement des pieds", "Poser précisément les pieds, transférer le poids, tenir une position."],
  ["Bassin et amplitude", "Placer le bassin, utiliser l'allonge, varier les gestes."],
  ["Vitesse et réactivité", "Réagir vite à une consigne, un signal, une couleur ; grimper et se déplacer vite."],
  ["Endurance et volume", "Enchaîner beaucoup de montées ou de blocs, tenir l'effort dans la durée."],
  ["Force", "Tirer, pousser, tenir sur les bras et les jambes (à compléter avec de nouveaux jeux)."],
];
const COMP_NOMS = COMPETENCES.map(c => c[0]);
const COMP_INIT = {
  E1: ["Lecture du mur"], E2: ["Lecture du mur"], E3: ["Lecture du mur", "Vitesse et réactivité"],
  E4: ["Équilibre et placement des pieds", "Bassin et amplitude"],
  E6: ["Lecture du mur"], E7: ["Lecture du mur", "Équilibre et placement des pieds"],
  E8: ["Équilibre et placement des pieds", "Force"], E9: ["Vitesse et réactivité"],
  C1: ["Vitesse et réactivité"], C4: ["Lecture du mur"], C7: ["Équilibre et placement des pieds"],
  C10: ["Endurance et volume"], C11: ["Endurance et volume"],
  C12: ["Équilibre et placement des pieds", "Bassin et amplitude"],
  D1: ["Lecture du mur"], D2: ["Vitesse et réactivité"], D3: ["Vitesse et réactivité"],
  D4: ["Vitesse et réactivité"], D5: ["Vitesse et réactivité"], D6: ["Vitesse et réactivité"],
  D7: ["Lecture du mur", "Équilibre et placement des pieds"], D8: ["Vitesse et réactivité"],
  D9: ["Endurance et volume", "Force"],
  D10: ["Lecture du mur", "Équilibre et placement des pieds", "Bassin et amplitude"],
  D11: ["Équilibre et placement des pieds", "Bassin et amplitude", "Vitesse et réactivité"],
  G1: ["Vitesse et réactivité"], G2: ["Lecture du mur"],
  G4: ["Équilibre et placement des pieds", "Bassin et amplitude"],
};
/* compétences d'un jeu (liste de noms) : colonne « Compétences », sinon classement de départ */
const compDe = g => {
  const v = String(g["Compétences"] || "")
    .split(",")
    .map(s => s.trim())
    .filter(s => COMP_NOMS.includes(s));
  return v.length ? v : (g.Code && COMP_INIT[g.Code]) || [];
};
/* AX.COMP = [nom, description, codes des jeux] calculé sur les jeux actuels */
Object.defineProperty(AX, "COMP", {
  configurable: true,
  get: () =>
    COMPETENCES.map(([t, d]) => [
      t,
      d,
      DATA.filter(g => g.Code && compDe(g).includes(t)).map(g => g.Code),
    ]),
});
