/* État global de l'application */
let DATA = EMBED.slice(),
  S = {
    q: "",
    int: null,
    mode: (() => {
      try {
        return localStorage.getItem("modeJeux") || "list";
      } catch (e) {
        return "list";
      }
    })(),
  },
  VIEW = "home",
  MODAL = null;
