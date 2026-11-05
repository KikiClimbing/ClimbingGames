/* Anciennes données « Ma séance » (migration) et informations générales de la séance */
let SEL = [];
try {
  SEL = JSON.parse(localStorage.getItem("maSeance") || "[]");
} catch (e) {
  SEL = [];
}
const saveSel = () => {
  try {
    localStorage.setItem("maSeance", JSON.stringify(SEL));
  } catch (e) {}
};
/* le brouillon de séance est séparé par discipline (escalade / prépa physique) */
const seKey = () => "maSeance2" + (DISC === "prepa" ? "_prepa" : "");
const seMetaKey = () => "maSeanceMeta" + (DISC === "prepa" ? "_prepa" : "");
let SMETA = { titre: "", public: "" };
try {
  SMETA = Object.assign(SMETA, JSON.parse(localStorage.getItem(seMetaKey()) || "{}"));
} catch (e) {}
/* fenêtre de modification d'une séance de la bibliothèque (SMETA/SE sont alors une copie) */
let SEPOP = null;
const saveMeta = () => {
  if (SEPOP) {
    SEPOP.dirty = true;
    return;
  }
  try {
    localStorage.setItem(seMetaKey(), JSON.stringify(SMETA));
  } catch (e) {}
};
