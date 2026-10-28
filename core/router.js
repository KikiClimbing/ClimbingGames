/* Navigation par l'adresse (#/page) */
function go(v) {
  location.hash = "#/" + v;
}
function route() {
  const h = decodeURIComponent((location.hash || "").replace(/^#\/?/, ""));
  if (h.startsWith("jeu/")) {
    MODAL = h.slice(4);
    if (!$("#main").innerHTML) show("home");
  } else {
    MODAL = null;
    show(h || "home");
  }
  syncModal();
}
function show(v) {
  VIEW = v;
  S.q = S.q;
  buildNav();
  render();
  $("#side").classList.remove("open");
  $("#shade").classList.remove("open");
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);
