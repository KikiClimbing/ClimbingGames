/* Mode hors connexion : enregistrement du service worker (sw.js), bandeau « hors connexion » et petite
   mémoire des données Google déjà consultées (liste des séances, séances ouvertes) dans le cache du navigateur. */
const OFF_NOM = "donnees-hors-ligne";
const offUrl = k => location.origin + "/__hors-ligne/" + encodeURIComponent(k);
async function offPut(k, v) {
  try {
    const c = await caches.open(OFF_NOM);
    await c.put(offUrl(k), new Response(JSON.stringify(v)));
  } catch (e) {}
}
async function offGet(k) {
  try {
    const c = await caches.open(OFF_NOM);
    const r = await c.match(offUrl(k));
    return r ? await r.json() : null;
  } catch (e) {
    return null;
  }
}
/* à la déconnexion : on n'en garde rien dans ce navigateur */
function offVider() {
  try {
    caches.delete(OFF_NOM);
  } catch (e) {}
}
function offBandeau() {
  let b = document.getElementById("hors");
  if (!navigator.onLine) {
    if (!b) {
      b = document.createElement("div");
      b.id = "hors";
      b.textContent =
        "📴 Hors connexion : les jeux, les schémas et les séances déjà consultés restent disponibles. L'enregistrement attendra le retour du réseau.";
      document.body.appendChild(b);
    }
  } else if (b) b.remove();
}
window.addEventListener("online", offBandeau);
window.addEventListener("offline", offBandeau);
offBandeau();
const offActif = () => "serviceWorker" in navigator && !!navigator.serviceWorker.controller;
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol))
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
