/* Créer une séance — recherche d'exercices avec filtres (famille, objectif, intensité, durée, matériel) */
const GLF = { fam: "", obj: "", comp: "", int: "", dur: "", nomat: false, sansexp: false };
/* durée maximale annoncée dans la fiche (« 5 à 10 min » → 10) */
const glDuree = g => {
  const n = (String(g["Durée"] || "").match(/\d+/g) || []).map(Number);
  return n.length ? Math.max(...n) : 0;
};
function glListe() {
  return DATA.filter(
    g =>
      discDe(g) === DISC &&
      (!GLF.fam || g.Famille === GLF.fam) &&
      (!GLF.obj ||
        (g["Objectifs (tags)"] || "")
          .split(",")
          .map(s => s.trim())
          .includes(GLF.obj)) &&
      (!GLF.comp || compDe(g).includes(GLF.comp)) &&
      (!GLF.int || g["Intensité"] === GLF.int) &&
      (!GLF.dur || (glDuree(g) && glDuree(g) <= +GLF.dur)) &&
      (!GLF.nomat || noMat(g)) &&
      (!GLF.sansexp || isAnniv(g))
  );
}
const glOptionsHTML = () =>
  glListe()
    .map(
      g =>
        `<option value="${esc((g.Code ? g.Code + " · " : "") + g.Titre)}" label="${esc([g["Durée"], g["Intensité"]].filter(Boolean).join(" · "))}"></option>`
    )
    .join("");
function glFiltresHTML() {
  const sel = (k, lab, opts) =>
    `<select data-glf="${k}" style="padding:5px 8px;border:1px solid #d5dae5;border-radius:8px"><option value="">${lab}</option>${opts.map(([v, t]) => `<option value="${esc(v)}" ${GLF[k] === v ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>`;
  const n = glListe().length;
  return `<div class="tools noprint" style="margin:8px 0;flex-wrap:wrap"><b style="font-size:13px">Filtrer la recherche d'exercices :</b>${sel(
    "fam",
    "Toutes familles",
    famsDisc().map(f => [f, f])
  )}${sel(
    "obj",
    "Tous objectifs",
    objsDisc().map(o => [o, o])
  )}${DISC === "prepa" ? "" : sel(
    "comp",
    "Toutes compétences",
    COMP_NOMS.map(o => [o, o])
  )}${DISC === "prepa" ? "" : sel(
    "int",
    "Toute intensité",
    ["Calme", "Modérée", "Intense"].map(i => [i, i])
  )}${sel("dur", "Toute durée", [
    ["10", "≤ 10 min"],
    ["15", "≤ 15 min"],
    ["20", "≤ 20 min"],
  ])}<label class="fl"><input type="checkbox" data-glf="nomat" ${GLF.nomat ? "checked" : ""}> sans matériel</label><label class="fl"><input type="checkbox" data-glf="sansexp" ${GLF.sansexp ? "checked" : ""}> sans expérience</label><span id="glCnt" style="color:#6B7280;font-size:13px">${n} jeu${n > 1 ? "x" : ""}</span></div>`;
}
function glBind() {
  document.querySelectorAll("[data-glf]").forEach(i =>
    i.addEventListener("change", () => {
      GLF[i.dataset.glf] = i.type === "checkbox" ? i.checked : i.value;
      const dl = $("#gl");
      if (dl) dl.innerHTML = glOptionsHTML();
      const c = $("#glCnt"),
        n = glListe().length;
      if (c) c.textContent = n + " jeu" + (n > 1 ? "x" : "");
    })
  );
}
