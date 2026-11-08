/* Compétences travaillées : chaque jeu porte ses compétences dans la colonne « Compétences » (cases à cocher,
   plusieurs possibles). COMP_INIT donne le classement de départ des jeux de base tant que la colonne est vide. */
const COMPETENCES = [
  ["Lecture du mur", "Repérer les prises, anticiper un trajet, choisir son itinéraire."],
  ["Équilibre et placement des pieds", "Poser précisément les pieds, transférer le poids, tenir une position."],
  ["Bassin et amplitude", "Placer le bassin, utiliser l'allonge, varier les gestes."],
  ["Vitesse et réactivité", "Réagir vite à une consigne, un signal, une couleur ; grimper et se déplacer vite."],
  ["Endurance et volume", "Enchaîner beaucoup de montées ou de blocs, tenir l'effort dans la durée."],
  ["Force", "Tirer, pousser, tenir sur les bras et les jambes (à compléter avec de nouveaux jeux)."],
  ["Coopération et communication", "Agir ensemble, s'entraider, guider ou se faire guider, communiquer dans l'équipe."],
];
const COMP_NOMS = COMPETENCES.map(c => c[0]);
/* anciens « objectifs » (abandonnés) → compétences, pour les jeux qui n'ont pas encore de compétences renseignées */
const OBJ_VERS_COMP = {
  Équilibre: "Équilibre et placement des pieds",
  Vitesse: "Vitesse et réactivité",
  Observation: "Lecture du mur",
  Coopération: "Coopération et communication",
};
const COMP_INIT = {
  E1: ["Lecture du mur", "Équilibre et placement des pieds"],
  E2: ["Lecture du mur", "Équilibre et placement des pieds"],
  E3: ["Lecture du mur", "Vitesse et réactivité"],
  E4: ["Équilibre et placement des pieds", "Bassin et amplitude"],
  E5: ["Équilibre et placement des pieds", "Endurance et volume"],
  E6: ["Lecture du mur", "Bassin et amplitude"],
  E7: ["Lecture du mur", "Équilibre et placement des pieds", "Bassin et amplitude"],
  E8: ["Équilibre et placement des pieds", "Force"],
  E9: ["Équilibre et placement des pieds", "Vitesse et réactivité"],
  C1: ["Vitesse et réactivité"],
  C2: ["Vitesse et réactivité", "Coopération et communication"],
  C3: ["Coopération et communication", "Équilibre et placement des pieds"],
  C4: ["Coopération et communication", "Lecture du mur"],
  C5: ["Coopération et communication", "Équilibre et placement des pieds"],
  C6: ["Coopération et communication", "Bassin et amplitude"],
  C7: ["Équilibre et placement des pieds", "Bassin et amplitude", "Coopération et communication"],
  C8: ["Coopération et communication", "Vitesse et réactivité"],
  C9: ["Coopération et communication", "Vitesse et réactivité"],
  C10: ["Endurance et volume", "Coopération et communication"],
  C11: ["Endurance et volume", "Coopération et communication"],
  C12: ["Équilibre et placement des pieds", "Bassin et amplitude"],
  D1: ["Vitesse et réactivité", "Coopération et communication"],
  D2: ["Vitesse et réactivité"],
  D3: ["Vitesse et réactivité", "Endurance et volume"],
  D4: ["Vitesse et réactivité"],
  D5: ["Vitesse et réactivité", "Coopération et communication"],
  D6: ["Vitesse et réactivité", "Coopération et communication"],
  D7: ["Lecture du mur", "Équilibre et placement des pieds", "Coopération et communication"],
  D8: ["Vitesse et réactivité", "Équilibre et placement des pieds"],
  D9: ["Endurance et volume", "Force", "Vitesse et réactivité"],
  D10: ["Lecture du mur", "Équilibre et placement des pieds", "Bassin et amplitude"],
  D11: ["Équilibre et placement des pieds", "Bassin et amplitude", "Vitesse et réactivité"],
  G1: ["Vitesse et réactivité"],
  G2: ["Lecture du mur"],
  G3: ["Coopération et communication", "Lecture du mur"],
  G4: ["Équilibre et placement des pieds", "Bassin et amplitude"],
};
/* compétences d'un jeu (liste de noms) : colonne « Compétences », sinon classement de départ */
const compDe = g => {
  const v = String(g["Compétences"] || "")
    .split(",")
    .map(s => s.trim())
    .filter(s => COMP_NOMS.includes(s));
  if (v.length) return v;
  if (g.Code && COMP_INIT[g.Code]) return COMP_INIT[g.Code];
  return String(g["Objectifs (tags)"] || "")
    .split(",")
    .map(x => OBJ_VERS_COMP[x.trim()])
    .filter(Boolean);
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
