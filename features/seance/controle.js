/* Créer une séance — contrôle automatique : durée prévue, enchaînement d'exercices intenses, éléments manquants */
function seControleInner() {
  const M = seModel(),
    S = SMETA;
  const w = [],
    ok = [];
  /* durée */
  M.G.forEach(g => {
    const p = +S.groups[g.i].prevu || 0,
      t = M.tot[g.i];
    if (!p) return;
    const d = t - p;
    if (d === 0) ok.push(`${esc(g.nom)} : ${t} min, comme prévu (retour au calme de ${RC_MIN} min inclus)`);
    else
      w.push(
        `${esc(g.nom)} : <b>${t} min</b> pour ${p} min prévues, retour au calme de ${RC_MIN} min inclus (${d > 0 ? "+" : ""}${d} min) — ${d > 0 ? "trop long" : "il reste du temps"}`
      );
  });
  /* intensité : 3 exercices « intenses » d'affilée dans un même sous-ensemble de groupes */
  const suite = [];
  M.subs.forEach(s => s.views.forEach(x => suite.push({ x, i: x.v.fam && x.v.fam["Intensité"] })));
  for (let k = 0; k + 2 < suite.length; k++)
    if (suite[k].i === "Intense" && suite[k + 1].i === "Intense" && suite[k + 2].i === "Intense") {
      w.push(
        `3 exercices intenses à la suite : ${[0, 1, 2].map(j => esc(suite[k + j].x.name)).join(", ")} — pensez à insérer un temps calme`
      );
      break;
    }
  /* éléments manquants */
  if (!M.ech.on) w.push("Pas d'échauffement dans la séance");
  else if (!M.echViews.length) w.push("Échauffement sans jeu ni exercice");
  if (!M.nGames) w.push("Aucun exercice dans le corps de séance");
  if (!S.secu || !S.secu.trim()) w.push("Rappels de sécurité non renseignés");
  if (M.G.every(g => !g.rc || !g.rc.trim())) w.push("Retour au calme non décrit");
  if (!S.objectif && !S.objCol) w.push("Aucun objectif (général ou collectif) renseigné");
  if (!w.length && !ok.length) ok.push("Rien à signaler");
  return (
    w.map(t => `<div style="color:#8A4B00;margin:3px 0">⚠ ${t}</div>`).join("") +
    ok.map(t => `<div style="color:#2E7D4F;margin:3px 0">✓ ${t}</div>`).join("") +
    `<div style="margin-top:8px;font-size:13px">${compHTML(compCodes(M), "dans cette séance")}</div>`
  );
}
function seControleHTML() {
  const M = seModel();
  const prevu = M.G.map(
    g =>
      `<label class="sml" style="border-left:4px solid ${g.c};padding-left:8px">Durée prévue — ${esc(g.nom)} (min)<input type="number" min="0" max="240" data-gm="prevu" data-n="1" data-gi="${g.i}" value="${+SMETA.groups[g.i].prevu || ""}" placeholder="ex. 60"></label>`
  ).join("");
  return `<div class="box noprint" style="border-left:6px solid #E8A33D"><b>Contrôle de la séance</b><div class="smg" style="margin:6px 0">${prevu}</div><div id="seControle" style="font-size:14px">${seControleInner()}</div></div>`;
}

/* version courte, sur une ligne, pour la barre fixe du haut */
function seControleCourt() {
  const M = seModel(),
    S = SMETA,
    dur = [],
    out = [];
  const tag = (t, ok) => `<span style="white-space:nowrap;color:${ok ? "#2E7D4F" : "#8A4B00"};font-weight:700">${ok ? "✓" : "⚠"} ${t}</span>`;
  M.G.forEach(g => {
    const p = +S.groups[g.i].prevu || 0,
      t = M.tot[g.i];
    dur.push(tag(esc(g.nom) + " " + t + (p ? "/" + p : "") + " min", !p || t === p));
  });
  const suite = [];
  M.subs.forEach(s => s.views.forEach(x => suite.push(x.v.fam && x.v.fam["Intensité"])));
  for (let k = 0; k + 2 < suite.length; k++)
    if (suite[k] === "Intense" && suite[k + 1] === "Intense" && suite[k + 2] === "Intense") {
      out.push(tag("3 exercices intenses d'affilée", false));
      break;
    }
  if (!M.ech.on) out.push(tag("pas d'échauffement", false));
  else if (!M.echViews.length) out.push(tag("échauffement vide", false));
  if (!M.nGames) out.push(tag("corps de séance vide", false));
  if (!S.secu || !S.secu.trim()) out.push(tag("sécurité vide", false));
  if (M.G.every(g => !g.rc || !g.rc.trim())) out.push(tag("retour au calme non décrit", false));
  if (!S.objectif && !S.objCol) out.push(tag("pas d'objectif", false));
  const sep = '<span style="color:#C5CBD8"> · </span>';
  return '<b style="color:#26364D">Durée totale :</b> ' + dur.join(sep) + (out.length ? '<span style="color:#9AA3B5"> │ </span>' : "") + out.join('<span style="color:#C5CBD8"> · </span>');
}
function seCtlMaj() {
  const e = $("#sCtl");
  if (e) e.innerHTML = seControleCourt();
}
