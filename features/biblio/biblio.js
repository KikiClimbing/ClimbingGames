/* Bibliothèque de séances : dossier Google Drive affiché dans le site */
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
function driveHTML() {
  const id = folderId(CONFIG.LIBRARY_URL);
  if (!id)
    return "<div class=\"box\">Le dossier de la bibliothèque n'est pas encore configuré. L'administrateur du site doit renseigner <b>LIBRARY_URL</b> dans le fichier <i>config.js</i>.</div>";
  return `<div class="tools"><div class="seg"><button data-bm="list" class="${BMODE === "list" ? "on" : ""}">Liste</button><button data-bm="grid" class="${BMODE === "grid" ? "on" : ""}">Vignettes</button></div><a class="chip" target="_blank" rel="noopener" href="${esc(CONFIG.LIBRARY_URL)}">Ouvrir dans Google Drive ↗</a></div>
  <div class="box" style="padding:6px"><iframe title="Dossier Google Drive" src="https://drive.google.com/embeddedfolderview?id=${esc(id)}#${BMODE}" style="width:100%;height:68vh;min-height:420px;border:0;border-radius:8px;background:#fff"></iframe></div>
  <p style="color:#6B7280;font-size:14px">Rien ne s'affiche, ou une page de connexion apparaît ? Connectez-vous à Google dans ce navigateur avec le compte qui a reçu l'accès, ou utilisez le bouton « Ouvrir dans Google Drive ». Vous pouvez y déposer d'autres formats (PDF, Word…). Les droits de partage de chaque document s'appliquent.</p>`;
}
function biblioView() {
  const tab = BTAB || (CONFIG.SEANCES_CSV_URL || sbLocal().length ? "outil" : "drive");
  const head = gsec(
    "Bibliothèque de séances",
    "Les séances créées avec l'outil, et le dossier Google Drive où déposer vos documents (PDF, Word…)."
  );
  const tabs = `<div class="tools"><div class="seg"><button data-bt="outil" class="${tab === "outil" ? "on" : ""}">Séances créées avec l'outil</button><button data-bt="drive" class="${tab === "drive" ? "on" : ""}">Dossier Google Drive</button></div></div>`;
  return head + tabs + (tab === "outil" ? seancesListeHTML() : driveHTML());
}
registerNav({
  sec: "MES SÉANCES",
  secOrder: 30,
  order: 4,
  html: () => navBtn("biblio", "Bibliothèque de séances", '<span class="ic">▤</span>'),
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
