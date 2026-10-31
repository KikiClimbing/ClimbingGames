/* Séances et cycles : bibliothèque, dossier Google Drive et modèles Google Docs */
function copyLink(u) {
  const m = String(u || "").match(/\/d\/([\w-]{15,})/);
  return m ? "https://docs.google.com/document/d/" + m[1] + "/copy" : u;
}
function folderId(u) {
  const m =
    String(u || "").match(/folders\/([\w-]{10,})/) || String(u || "").match(/[?&]id=([\w-]{10,})/);
  return m ? m[1] : "";
}
let BMODE = "list";
let BTAB = (() => {
  try {
    return localStorage.getItem("biblioTab") || "";
  } catch (e) {
    return "";
  }
})();
function modelesHTML() {
  const card = (t, txt, url, label) =>
    `<div class="xc"><h4>${t}</h4><p style="margin-bottom:12px">${txt}</p>${url ? `<a class="btn" style="display:inline-block;background:#26364D;color:#fff;border-radius:8px;padding:8px 16px;font-weight:700;text-decoration:none" target="_blank" rel="noopener" href="${esc(copyLink(url))}">${label}</a>` : `<span style="color:#9a6b00;font-size:13px">Lien à renseigner par l'administrateur (config.js).</span>`}</div>`;
  return `<div class="box"><b>Vous préférez travailler dans Google Docs ?</b> Pour créer une séance ou un cycle <u>en ligne sur ce site</u>, utilisez « Créer une séance » et « Créer un cycle » dans le menu. Les modèles ci-dessous sont des documents vierges : le bouton en fait <b>une copie dans votre Google Drive</b>, que vous remplissez à la main.</div>
  <div class="g2">${card("Modèle de fiche de séance", "Thème, déroulé, exercices avec variantes, critères de réussite, matériel, sécurité.", CONFIG.TEMPLATE_SEANCE_URL, "Copier le modèle de séance")}${card("Modèle de cycle de formation", "Un tableau pour planifier un cycle : séances, thèmes, objectifs, jeux utilisés (par leur code) et bilan.", CONFIG.TEMPLATE_CYCLE_URL, "Copier le modèle de cycle")}</div>
  <div class="box"><b>Partager un document Google Docs</b><ol><li>Ouvrez-le dans Google Docs.</li><li>Cliquez sur <b>Partager</b>, en haut à droite.</li><li>Saisissez les adresses e-mail, et choisissez <b>Lecteur</b> ou <b>Éditeur</b>.</li><li>Pour le mettre dans la bibliothèque, glissez-le dans le dossier partagé ci-dessous.</li></ol></div>`;
}
function driveHTML() {
  const id = folderId(CONFIG.LIBRARY_URL);
  if (!id)
    return "<div class=\"box\">Le dossier de la bibliothèque n'est pas encore configuré. L'administrateur du site doit renseigner <b>LIBRARY_URL</b> dans le fichier <i>config.js</i>.</div>";
  return `<div class="tools"><div class="seg"><button data-bm="list" class="${BMODE === "list" ? "on" : ""}">Liste</button><button data-bm="grid" class="${BMODE === "grid" ? "on" : ""}">Vignettes</button></div><a class="chip" target="_blank" rel="noopener" href="${esc(CONFIG.LIBRARY_URL)}">Ouvrir dans Google Drive ↗</a></div>
  <div class="box" style="padding:6px"><iframe title="Dossier Google Drive" src="https://drive.google.com/embeddedfolderview?id=${esc(id)}#${BMODE}" style="width:100%;height:68vh;min-height:420px;border:0;border-radius:8px;background:#fff"></iframe></div>
  <p style="color:#6B7280;font-size:14px">Rien ne s'affiche, ou une page de connexion apparaît ? Connectez-vous à Google dans ce navigateur avec le compte qui a reçu l'accès, ou utilisez le bouton « Ouvrir dans Google Drive ». Vous pouvez y déposer d'autres formats (PDF, Word…). Les droits de partage de chaque document s'appliquent.</p>`;
}
function biblioView() {
  const tab =
    BTAB || (compteOn() || CONFIG.SEANCES_CSV_URL || sbLocal().length ? "outil" : "drive");
  const head = gsec(
    "Séances et cycles",
    "Vos séances et cycles enregistrés, ceux qu'on a partagés avec vous, et le dossier Google Drive.",
    "<b>Comment faire ?</b><br>Cliquez sur une ligne pour ouvrir une séance ou un cycle. Vous pouvez l'imprimer, la télécharger en Word, la partager (personnes ou équipes) ou la copier pour la modifier.<br>L'onglet « Drive et modèles » donne le dossier partagé et les modèles Google Docs."
  );
  const tabs = `<div class="tools"><div class="seg"><button data-bt="outil" class="${tab === "outil" ? "on" : ""}">Séances créées avec l'outil</button><button data-bt="cycles" class="${tab === "cycles" ? "on" : ""}">Cycles de formation</button><button data-bt="drive" class="${tab === "drive" ? "on" : ""}">Drive et modèles</button></div></div>`;
  return (
    head +
    tabs +
    (tab === "outil"
      ? seancesListeHTML()
      : tab === "cycles"
        ? cyListeHTML()
        : modelesHTML() + driveHTML())
  );
}
registerNav({
  sec: "MES SÉANCES",
  secOrder: 30,
  order: 4,
  html: () => navBtn("biblio", "Séances et cycles", '<span class="ic">▤</span>'),
});
registerView({
  match: v => v === "biblio",
  html: () => biblioView(),
  bind: () => {
    const q = $("#sbq");
    if (q)
      q.addEventListener("input", () => {
        SBQ = q.value;
        render();
        const n = $("#sbq");
        n.focus();
        n.setSelectionRange(n.value.length, n.value.length);
      });
  },
});
registerClick(e => {
  const bt = e.target.closest("[data-bt]");
  if (bt) {
    BTAB = bt.dataset.bt;
    try {
      localStorage.setItem("biblioTab", BTAB);
    } catch (x) {}
    render();
    return true;
  }
  const bm = e.target.closest("[data-bm]");
  if (bm) {
    BMODE = bm.dataset.bm;
    render();
    return true;
  }
});
