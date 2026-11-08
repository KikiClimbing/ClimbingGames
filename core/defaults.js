/* Réglages par défaut, familles de jeux, objectifs. Les adresses personnelles se mettent dans config.js (à la racine). */
const CONFIG = Object.assign(
  {
    SHEET_CSV_URL: "",
    FORM_URL: "",
    RETOUR_FORM_URL: "",
    RETOURS_CSV_URL: "",
    TEMPLATE_SEANCE_URL: "",
    TEMPLATE_CYCLE_URL: "",
    LIBRARY_URL: "",
    SEANCES_CSV_URL: "",
    GAME_ADD_URL: "",
    GAME_ADD_KEY: "",
    GOOGLE_CLIENT_ID: "",
    SCHEMA_UPLOAD_URL: "",
    SCHEMA_UPLOAD_KEY: "",
  },
  window.SITE_CONFIG || {}
);
const FAMS = {
  Exploration: { k: "E", l: "#E4EEFB", m: "#BFD6F4", d: "#2B5A9E", a: "#7FA9E3" },
  Coopération: { k: "C", l: "#E6F5EB", m: "#BDE3CB", d: "#2E7D4F", a: "#7CC49A" },
  Défis: { k: "D", l: "#FDEBE3", m: "#F7CDBB", d: "#B2543A", a: "#EE9F83" },
  Animation: { k: "G", l: "#EFE9FA", m: "#D5C9F0", d: "#5F46A8", a: "#A894E6" },
};
/* Prépa physique : trois familles (la couleur et la lettre du code, comme pour les jeux d'escalade) */
Object.assign(FAMS, {
  Renforcement: { k: "R", l: "#E0F1F1", m: "#B6DFDF", d: "#1F7A7A", a: "#6BBFBF" },
  Poutre: { k: "H", l: "#E6E9F7", m: "#C4CBEC", d: "#3B4A9C", a: "#8A97DB" },
  "Mobilité et étirements": { k: "M", l: "#F8E2EE", m: "#EDBAD6", d: "#9C3269", a: "#DE8DB8" },
});
const OBJS = ["Échauffement", "Équilibre", "Coopération", "Vitesse", "Observation"];
/* zones travaillées (prépa physique) : sert d'« objectifs » des exercices */
const MUSCLES = [
  "Épaules",
  "Bras",
  "Dos",
  "Avant-bras",
  "Doigts et poignets",
  "Tronc",
  "Jambes",
  "Hanches et bassin",
  "Corps entier",
];
/* Disciplines : chaque famille appartient à une discipline ; le sélecteur du menu choisit celle qu'on voit */
const DISCIPLINES = {
  escalade: {
    nom: "Escalade",
    titre: "Jeux d'escalade",
    fams: ["Exploration", "Coopération", "Défis", "Animation"],
  },
  prepa: {
    nom: "Prépa physique",
    titre: "Prépa physique",
    fams: ["Renforcement", "Poutre", "Mobilité et étirements"],
  },
};
let DISC = (() => {
  try {
    const d = localStorage.getItem("discipline");
    return DISCIPLINES[d] ? d : "escalade";
  } catch (e) {
    return "escalade";
  }
})();
/* Prépa physique en cours de finalisation : visible seulement par l'administrateur.
   Passer PREPA_PUBLIQUE à true pour l'ouvrir à tout le monde. */
const PREPA_PUBLIQUE = false;
let DISC_MASQ = false;
const prepaOuverte = () => {
  if (PREPA_PUBLIQUE) return true;
  try {
    return (typeof compteAdmin === "function" && compteAdmin()) || !!sessionStorage.getItem("admPw");
  } catch (e) {
    return false;
  }
};
/* si la discipline mémorisée est « prépa » mais que la personne n'y a pas accès : retour à l'escalade (sans effacer son choix) */
function prepaGarde() {
  if (DISC === "prepa" && !prepaOuverte()) {
    DISC = "escalade";
    DISC_MASQ = true;
    if (typeof seSwitch === "function") seSwitch();
  } else if (DISC_MASQ && prepaOuverte()) {
    DISC = "prepa";
    DISC_MASQ = false;
    if (typeof seSwitch === "function") seSwitch();
  }
}
const discDeFamille = f =>
  Object.keys(DISCIPLINES).find(d => DISCIPLINES[d].fams.includes(f)) || "escalade";
const discDe = g => discDeFamille(g.Famille);
const famsDisc = (d = DISC) => DISCIPLINES[d].fams;
const objsDisc = (d = DISC) => (d === "prepa" ? MUSCLES : OBJS);
