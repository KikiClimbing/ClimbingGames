/* Page « Utiliser hors connexion » : explications, état et téléchargement des schémas (salle sans réseau). */
const HL = { n: 0, total: 0, enCours: false, msg: "" };
/* schémas à garder : "seance" = ceux de la séance en cours, "favoris", "tout" = tous les jeux */
function hlCodes(src) {
  if (src === "seance")
    return [...new Set((SE.subs || []).flatMap(s => s.items.filter(i => i.t === "lib").map(i => i.k)))];
  if (src === "favoris") return favListe();
  return DATA.filter(g => g.Code).map(key);
}
function hlSchemas(src = "tout") {
  const cs = new Set(hlCodes(src));
  return [
    ...new Set(
      DATA.filter(g => cs.has(key(g)))
        .map(crepsImg)
        .filter(u => u && !/^data:/.test(u))
    ),
  ];
}
async function hlCompter() {
  try {
    const c = await caches.open("execution");
    const L = await c.keys();
    HL.n = L.filter(r => /\/schemas\//.test(r.url)).length;
  } catch (e) {
    HL.n = 0;
  }
}
async function hlTelecharger(src = "tout") {
  const L = hlSchemas(src);
  HL.enCours = true;
  HL.total = L.length;
  HL.msg = "";
  let fait = 0;
  render();
  for (let i = 0; i < L.length; i += 6) {
    await Promise.all(
      L.slice(i, i + 6).map(u =>
        fetch(u)
          .catch(() => null)
          .then(() => (fait += 1))
      )
    );
    const m = $("#hlProg");
    if (m) m.textContent = fait + " / " + L.length + " schémas…";
  }
  HL.enCours = false;
  await hlCompter();
  HL.msg = "✓ " + L.length + " schéma" + (L.length > 1 ? "s" : "") + " gardé" + (L.length > 1 ? "s" : "") + " : ils s'afficheront sans réseau.";
  render();
}
function hlView() {
  const actif = typeof offActif === "function" && offActif();
  const bt = (src, txt, n) =>
    `<a class="btn" data-hl="${src}" role="button" tabindex="0" style="background:${src === "seance" ? "#26364D;color:#fff" : "#EEF1F8;color:#26364D"};border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block;${HL.enCours || !n ? "opacity:.5;pointer-events:none" : ""}">${txt} (${n})</a>`;
  return `${gsec("Utiliser hors connexion", "Pour la salle ou le gymnase sans réseau.", "<b>Comment faire ?</b><br>1. Ouvrez le site une fois avec du réseau.<br>2. Préparez votre séance, puis cliquez « Garder les schémas de ma séance ».<br>3. Ouvrez vos séances à préparer (elles sont gardées automatiquement).")}
  <div class="box"><b>État</b><p style="margin:6px 0">${actif ? '<span style="color:#2E7D4F;font-weight:700">✓ Actif</span> : le site se charge même sans réseau.' : '<span style="color:#B2543A;font-weight:700">Pas encore actif</span> : rechargez la page une fois avec du réseau (ou ce navigateur ne le permet pas).'}</p>
  <p style="margin:6px 0">${HL.n} schéma${HL.n > 1 ? "s" : ""} gardé${HL.n > 1 ? "s" : ""} sur cet appareil.</p></div>
  <div class="box"><b>Comment ça marche</b>
  <ul><li><b>Automatique</b> : le site, les fiches de jeux (texte), les guides et le mode terrain sont gardés dès la première visite. Les schémas sont gardés au fur et à mesure que vous les affichez.</li>
  <li><b>Pour être sûr·e d'avoir les schémas en salle</b> : ne téléchargez que ceux dont vous avez besoin. Le plus simple est de composer la séance, puis de les garder d'un clic.</li>
  <li><b>Pas besoin de tout télécharger</b> : une bibliothèque de plusieurs centaines de schémas n'a pas à tenir sur l'appareil. « Tout » reste possible, mais plutôt en wifi.</li></ul>
  <div class="tools">${bt("seance", "⬇ Garder les schémas de ma séance", hlSchemas("seance").length)}${bt("favoris", "⬇ Garder ceux de mes favoris", hlSchemas("favoris").length)}${bt("tout", "⬇ Tout garder", hlSchemas("tout").length)}<span id="hlProg" style="font-weight:700">${HL.enCours ? "…" : ""}</span><span style="color:#2E7D4F;font-weight:700">${esc(HL.msg)}</span></div></div>
  <div class="box"><b>Ce qui marche sans réseau</b><ul><li>Les fiches de jeux, les favoris déjà chargés, les guides.</li><li>Les séances et cycles déjà ouverts, et le mode terrain (chronomètre, étapes, critères).</li><li>Le bilan s'écrit sans réseau ; il s'enregistre dans la bibliothèque quand le réseau revient (bouton « Mettre à jour la séance »).</li></ul><b>Ce qui demande du réseau</b><ul><li>Enregistrer ou partager une séance, envoyer un retour ou un jeu, se connecter.</li></ul></div>`;
}
registerNav({
  sec: "GUIDES",
  secOrder: 40,
  order: 9,
  html: () => navBtn("horsligne", "Utiliser hors connexion", '<span class="ic">📴</span>'),
});
registerView({
  match: v => v === "horsligne",
  html: () => hlView(),
  bind: () => {
    const avant = HL.n;
    hlCompter().then(() => HL.n !== avant && render());
  },
});
registerClick(e => {
  const b = e.target.closest("[data-hl]");
  if (!b) return;
  hlTelecharger(b.dataset.hl);
  return true;
});
