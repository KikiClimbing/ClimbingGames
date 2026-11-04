/* Modifier ou dupliquer une séance de la bibliothèque dans une fenêtre (sans toucher à « Créer une séance »).
   Pendant que la fenêtre est ouverte, SMETA / SE / SEUID sont remplacés par une copie de la séance ;
   saveMeta() et seSave() n'écrivent plus dans le navigateur (SEPOP.dirty = modifications non enregistrées).
   À la fermeture, les données d'origine sont remises en place. */
const sepopCopie = o => JSON.parse(JSON.stringify(o));
function sepopOuvrir(d, id, copie) {
  if (SEPOP) return;
  SEPOP = { meta: SMETA, se: SE, uid: SEUID, dirty: false };
  SMETA = sepopCopie(d.meta);
  SE = sepopCopie(d.se);
  if (id) SE.id = id;
  else delete SE.id;
  if (copie === true) SMETA.titre = (SMETA.titre || "Séance") + " (copie)";
  let mx = 0;
  SE.subs.forEach(s => {
    mx = Math.max(mx, s.id || 0);
    s.items.forEach(i => (mx = Math.max(mx, i.id || 0)));
  });
  SEUID = mx + 1;
  seDefaults();
  SEPOP.dirty = !!copie;
  document.body.classList.add("pp");
  modal(
    copie
      ? copie === true
        ? "Nouvelle séance (copie)"
        : "Adapter cette séance"
      : "Modifier la séance",
    seanceView(),
    1100,
    {
      id: "epop",
      fond: false,
      avant: () => !SEPOP || !SEPOP.dirty || confirm("Fermer sans enregistrer vos modifications ?"),
      fin: sepopFin,
    }
  );
  seanceBind();
}
function sepopRedraw() {
  const b = $("#epopbody"),
    sc = $("#epop");
  if (!b || !SEPOP) return;
  const y = sc.scrollTop;
  b.innerHTML = seanceView();
  seanceBind();
  sc.scrollTop = y;
}
function sepopFin() {
  const o = SEPOP;
  if (!o) return;
  SEPOP = null;
  SMETA = o.meta;
  SE = o.se;
  SEUID = o.uid;
  if (!$("#pop")) document.body.classList.remove("pp");
  render();
}
