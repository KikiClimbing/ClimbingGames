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
    GAME_ADD_URL: "",
    GAME_ADD_KEY: "",
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
const OBJS = ["Échauffement", "Équilibre", "Coopération", "Vitesse", "Observation"];
