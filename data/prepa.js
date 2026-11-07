/* Fiches de Prépa physique intégrées (exemples en attendant l'import dans la feuille Google).
   Une fiche de la feuille qui porte le même code les remplace. */
Object.assign(AX.FAMDESC, {
  Renforcement:
    "Exercices de renforcement complémentaire : équilibrer les muscles que l'escalade sollicite peu (épaules, dos, avant-bras, tronc) et limiter les risques de blessure.",
  Mobilité:
    "Étirements et ouverture articulaire (épaules, bassin, poignets, doigts) pour garder de l'amplitude et récupérer.",
  Étirements:
    "Routine d'étirements du sol vers le debout : postures détaillées pas à pas, avec 5 variantes par exercice (formes différentes, niveau facile, niveau avancé).",
  Cardio:
    "Course ou vélo à intensité modérée pour garder une base cardiovasculaire sans fatiguer avant la prochaine séance de grimpe.",
});
/* ajoute les fiches intégrées qui ne sont pas déjà dans la liste donnée (même code) */
/* le schéma est fabriqué à la demande (l'éditeur est chargé après ce fichier) */
/* codes dont le schéma dessiné a été corrigé et validé : seuls ceux-là (et les photos) sont affichés */
const PREPA_VALIDES = [];
/* en attendant les photos : true = on affiche aussi les schémas dessinés (non modifiables par les visiteurs) */
const PREPA_DESSINS_VISIBLES = true;
PREPA_EMBED.forEach(g => {
  if (typeof PREPA_PHOTO !== "undefined" && PREPA_PHOTO[g.Code]) {
    /* photo réelle (posture exacte) : remplace le schéma dessiné */
    const u = PREPA_PHOTO[g.Code];
    Object.defineProperty(g, "Schéma (lien)", { enumerable: true, get: () => u });
  } else if (PREPA_SCH[g.Code] && (PREPA_DESSINS_VISIBLES || PREPA_VALIDES.includes(g.Code)))
    Object.defineProperty(g, "Schéma (lien)", {
      enumerable: true,
      get: () => (typeof edSvgUrl === "function" ? edSvgUrl(PREPA_SCH[g.Code]) : ""),
    });
});
const avecPrepa = L => L.concat(PREPA_EMBED.filter(p => !L.some(g => g.Code === p.Code)));
