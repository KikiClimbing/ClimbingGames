/* Mode hors connexion : mise en cache du site et des schémas consultés.
   ⚠ À chaque nouvelle version du site, changer VERSION (même numéro que « ?v= » de index.html) : c'est ce qui
   fait renouveler le cache. Les données Google (séances…) sont gardées par le site lui-même (core/offline.js). */
const VERSION = "103";
const CACHE = "site-" + VERSION,
  RUN = "execution";

self.addEventListener("install", e => {
  e.waitUntil(
    (async () => {
      const c = await caches.open(CACHE);
      /* on lit index.html pour retrouver tous les fichiers (scripts, styles) de cette version */
      const r = await fetch("index.html", { cache: "reload" });
      const html = await r.clone().text();
      await c.put("index.html", r);
      const urls = [...html.matchAll(/(?:src|href)="([^"#]+\?v=\d+)"/g)].map(m => m[1]);
      await Promise.all(urls.map(u => c.add(new Request(u, { cache: "reload" })).catch(() => {})));
      self.skipWaiting();
    })()
  );
});
self.addEventListener("activate", e => {
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys())
        if (/^site-/.test(k) && k !== CACHE) await caches.delete(k);
      await self.clients.claim();
    })()
  );
});
/* réseau d'abord, copie en cache si on est hors connexion */
async function reseauD(r, nom, secours) {
  try {
    const rep = await fetch(r);
    if (rep && rep.ok) (await caches.open(nom)).put(secours || r, rep.clone());
    return rep;
  } catch (e) {
    const c = (await caches.match(secours || r)) || (secours && (await caches.match(r)));
    if (c) return c;
    throw e;
  }
}
/* cache d'abord, puis réseau (fichiers versionnés « ?v= » : leur contenu ne change jamais) */
async function cacheD(r, nom) {
  const c = await caches.match(r);
  if (c) return c;
  const rep = await fetch(r);
  if (rep && rep.ok) (await caches.open(nom)).put(r, rep.clone());
  return rep;
}
/* cache tout de suite, mis à jour en arrière-plan (images de schémas) */
async function cachePuisMaj(r) {
  const c = await caches.match(r);
  const maj = fetch(r)
    .then(async rep => {
      if (rep && rep.ok) (await caches.open(RUN)).put(r, rep.clone());
      return rep;
    })
    .catch(() => null);
  return c || (await maj) || Response.error();
}
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    if (/\/sw\.js$/.test(u.pathname)) return;
    if (r.mode === "navigate" || /\/(index\.html)?$/.test(u.pathname))
      e.respondWith(reseauD(r, CACHE, "index.html"));
    else if (/\/schemas\/.+\.(webp|png|svg)$/.test(u.pathname)) e.respondWith(cachePuisMaj(r));
    else if (u.searchParams.has("v")) e.respondWith(cacheD(r, CACHE));
    else e.respondWith(reseauD(r, RUN));
  } else if (/(^|\.)docs\.google\.com$|googleusercontent\.com$/.test(u.hostname)) {
    /* feuille publiée (jeux, retours) et images du Drive : dernière version connue si pas de réseau */
    e.respondWith(reseauD(r, RUN));
  }
});
