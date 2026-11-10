/* Ma séance — déclaration de la page et du menu */
seLoad();
registerNav({
  sec: "MES SÉANCES",
  secOrder: 30,
  order: 1,
  html: () =>
    navBtn(
      "seance",
      `Créer une séance<span class="n" id="selcount">${selCount() || ""}</span>`,
      '<span class="ic">☰</span>'
    ),
});
registerView({ match: v => v === "seance", html: () => seanceView(), bind: () => seanceBind() });
/* « Ajouter à ma séance » : choix de la séance (en cours, enregistrée ou nouvelle) et de la sous-section */
function ajoutChoisir(code) {
  const g = DATA.find(x => key(x) === code);
  if (!g) return;
  const mes = (typeof sbAll === "function" ? sbAll() : [])
    .filter(r => !String(r.id).startsWith("mod-") && (typeof compteMien !== "function" || compteMien(r)))
    .filter(r => ((sbParse(r) || {}).meta || {}).disc ? (sbParse(r).meta.disc === DISC) : DISC === "escalade")
    .slice(0, 60);
  const echauf = /chauffement/i.test(String(g["Objectifs (tags)"] || ""));
  const dest = (id, lib) => {
    return `<select id="ajSub" style="width:100%;padding:7px">${lib}</select>`;
  };
  const optsDraft = () =>
    seEchSubs()
      .map((s, k) => `<option value="${s.id}" ${echauf && k === 0 ? "selected" : ""}>Échauffement — ${esc(s.titre || "bloc " + (k + 1))}</option>`)
      .concat(SE.subs.map((s, k) => `<option value="${s.id}" ${!echauf && k === SE.subs.length - 1 ? "selected" : ""}>Corps — ${esc(s.titre || "sous-section " + (k + 1))}</option>`))
      .join("");
  modal(
    "Ajouter « " + esc(g.Titre) + " » à…",
    `<label class="fl" style="display:block;margin:8px 0"><input type="radio" name="ajC" value="draft" checked> <b>Ma séance en cours</b> ${SMETA.titre ? "(" + esc(SMETA.titre) + ")" : "(brouillon de « Créer une séance »)"}</label>
    <div id="ajDraft" style="margin:0 0 10px 22px"><span class="sml">Dans quelle sous-section ?</span>${dest(0, optsDraft())}</div>
    ${mes.length ? `<label class="fl" style="display:block;margin:8px 0"><input type="radio" name="ajC" value="rec"> <b>Une séance enregistrée</b></label><div id="ajRec" style="margin:0 0 10px 22px;display:none"><select id="ajRecSel" style="width:100%;padding:7px">${mes.map(r => `<option value="${esc(r.id)}">${esc(r.titre || "sans titre")}${r.theme ? " — " + esc(r.theme) : ""}</option>`).join("")}</select><span class="hint">Elle s'ouvre en modification : le jeu est ajouté à la fin du corps de séance (à toi de le déplacer).</span></div>` : ""}
    <label class="fl" style="display:block;margin:8px 0"><input type="radio" name="ajC" value="new"> <b>Une nouvelle séance</b></label>
    <div id="ajNew" style="margin:0 0 10px 22px;display:none"><span class="hint">Le brouillon actuel de « Créer une séance » sera remplacé${selCount() ? " (il contient " + selCount() + " exercice(s) : enregistre-le d'abord si besoin)" : ""}.</span></div>
    <div class="tools" style="margin-top:12px"><a class="btn" id="ajOk" style="background:#2E7D4F;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Ajouter</a></div>`,
    520
  );
  const maj = () => {
    const v = (document.querySelector('[name=ajC]:checked') || {}).value;
    $("#ajDraft").style.display = v === "draft" ? "" : "none";
    if ($("#ajRec")) $("#ajRec").style.display = v === "rec" ? "" : "none";
    $("#ajNew").style.display = v === "new" ? "" : "none";
  };
  document.querySelectorAll("[name=ajC]").forEach(r => r.addEventListener("change", maj));
  $("#ajOk").addEventListener("click", async () => {
    const v = (document.querySelector("[name=ajC]:checked") || {}).value;
    if (v === "draft") {
      const sid = +$("#ajSub").value;
      if (!inSel(code)) addSel(code, sid);
      modalFermer("mpop", true);
      go("seance");
    } else if (v === "new") {
      if (selCount() && !confirm("Remplacer le brouillon actuel par une nouvelle séance ?")) return;
      try {
        localStorage.removeItem(seKey());
        localStorage.removeItem(seMetaKey());
      } catch (e) {}
      SMETA = { titre: "", public: "" };
      SE = null;
      seLoad();
      addSel(code);
      modalFermer("mpop", true);
      go("seance");
    } else {
      const id = $("#ajRecSel").value;
      try {
        await sbCharger(id);
        const rec = sbTous().find(r => r.id === id),
          d = rec && sbParse(rec);
        if (!d) throw new Error("illisible");
        modalFermer("mpop", true);
        sepopOuvrir(d, id);
        if (!seHas(code)) {
          const last = SE.subs[SE.subs.length - 1];
          seAdd(code, last && last.id);
          SEPOP.dirty = true;
          sepopRedraw();
        }
      } catch (e) {
        toast("Impossible d'ouvrir cette séance : " + e.message);
      }
    }
  });
}
registerClick(e => {
  const ad = e.target.closest("[data-add]");
  if (ad) {
    ajoutChoisir(ad.dataset.add);
    return true;
  }
});
