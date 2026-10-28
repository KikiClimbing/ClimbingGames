/* Éditeur de schémas — déclaration de la page et du menu */
registerNav({
  sec: "MES SÉANCES",
  secOrder: 30,
  order: 2,
  html: () => navBtn("editeur", "Dessiner un schéma", '<span class="ic">✏</span>'),
});
registerView({
  match: v => v === "editeur",
  html: () => editorHTML(),
  bind: () => {
    try {
      edInit();
    } catch (err) {
      try {
        localStorage.removeItem("edSchema");
      } catch (e) {}
      ED.els = [];
      edInit();
    }
  },
});
