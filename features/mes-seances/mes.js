/* Page « Séances & cycles » : modèles et liens */
function mesView() {
  const card = (t, txt, url, label, copy) =>
    `<div class="xc"><h4>${t}</h4><p style="margin-bottom:12px">${txt}</p>${url ? `<a class="btn" style="display:inline-block;background:#26364D;color:#fff;border-radius:8px;padding:8px 16px;font-weight:700;text-decoration:none" target="_blank" rel="noopener" href="${esc(copy ? copyLink(url) : url)}">${label}</a>` : `<span style="color:#9a6b00;font-size:13px">Lien à renseigner par l'administrateur du site.</span>`}</div>`;
  return (
    gsec(
      "Séances &amp; cycles",
      "Créez vos fiches de séance et vos cycles de formation dans Google Docs, puis partagez-les avec les personnes de votre choix."
    ) +
    '<div class="g2">' +
    card(
      "Créer une fiche de séance",
      "Une copie du modèle s'ouvre dans votre Google Drive : thème, déroulé, exercices avec variantes, critères de réussite, matériel, sécurité.",
      CONFIG.TEMPLATE_SEANCE_URL,
      "Créer une séance",
      true
    ) +
    card(
      "Créer un cycle de formation",
      "Un tableau pour planifier un cycle : séances, thèmes, objectifs, jeux utilisés (par leur code) et bilan.",
      CONFIG.TEMPLATE_CYCLE_URL,
      "Créer un cycle",
      true
    ) +
    `<div class="xc"><h4>Bibliothèque partagée</h4><p style="margin-bottom:12px">Le dossier où les éducateurs qui le souhaitent déposent leurs séances. Accès réservé aux personnes invitées.</p><a class="btn" style="display:inline-block;background:#26364D;color:#fff;border-radius:8px;padding:8px 16px;font-weight:700;text-decoration:none;cursor:pointer" data-go="biblio">Ouvrir la bibliothèque</a></div></div>` +
    `<div class="box" style="margin-top:16px"><b>Comment partager une séance</b><ol><li>Ouvrez votre séance dans Google Docs.</li><li>Cliquez sur <b>Partager</b>, en haut à droite.</li><li>Saisissez les adresses e-mail des personnes concernées, et choisissez <b>Lecteur</b> ou <b>Éditeur</b>.</li><li>Pour la mettre dans la bibliothèque, glissez-la dans le dossier partagé.</li></ol>Vous seul décidez qui voit votre séance : rien n'est public tant que vous ne l'avez pas décidé.</div>
  <div class="box"><b>Astuce</b> : dans le déroulé, notez le code des jeux du site (E4, D11, G1…) pour les retrouver en un clic.</div>`
  );
}
registerNav({
  sec: "MES SÉANCES",
  secOrder: 30,
  order: 1,
  html: () => navBtn("mes", "Séances &amp; cycles", '<span class="ic">✎</span>'),
});
registerView({ match: v => v === "mes", html: () => mesView() });
