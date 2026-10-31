/* Ma séance — formulaire de construction de la séance */
/* ---------- éditeur ---------- */
function seanceView() {
  seDefaults();
  const M = seModel(),
    S = SMETA,
    two = M.two;
  const gl = i => esc(M.G[i].nom);
  const head = `<h2 class="pt">Créer une séance ${aide("<b>Comment faire ?</b><br>1. Remplissez les informations générales (titre, date, thème…).<br>2. Ajoutez des exercices : un jeu du site (bouton « Ajouter à ma séance » sur sa fiche) ou un exercice libre.<br>3. Enregistrez dans la bibliothèque, ou exportez en Word, PDF ou texte.<br>Votre brouillon reste dans ce navigateur.")}</h2><p class="lead">Construisez votre séance comme dans votre modèle : accueil, échauffement, puis un corps de séance découpé en autant de sous-sections que vous voulez, pour tous les groupes ou seulement certains (deux groupes par défaut, quatre au maximum). Les exercices viennent de la bibliothèque de jeux ou s'écrivent librement. Tout est enregistré dans ce navigateur ; exportez en Word, en PDF ou en texte.</p>`;
  const inp = (k, l, p, span) =>
    `<label class="sml" style="${span ? "grid-column:1/-1" : ""}">${l}<input data-sm="${k}" value="${esc(S[k])}" placeholder="${esc(p)}"></label>`;
  const colf = (cls, c) => `border-left:4px solid ${c};padding-left:8px`;
  const num = (attr, l, val, c) =>
    `<label class="sml" style="${colf(0, c)}">${l}<input type="number" min="0" max="180" ${attr} value="${val}"></label>`;
  const txa = (k, l, p) =>
    `<label class="sml">${l}<textarea rows="2" data-sm="${k}" placeholder="${esc(p)}">${esc(S[k])}</textarea></label>`;
  const E = SE.ech;
  const subHTML = (s, k) => {
    const sv = M.subs[k];
    const gsel = two
      ? `<div class="sml" style="grid-column:1/-1">Pour<div class="gchk">${M.G.map(g => `<label class="fl"><input type="checkbox" data-gs="1" data-sub="${s.id}" data-gi="${g.i}" ${sv.idx.includes(g.i) ? "checked" : ""}><span style="color:${g.c};font-weight:700">■</span> ${esc(g.nom)}</label>`).join("")}</div></div>`
      : "";
    const items = sv.items
      .map((it, j) => {
        const v = itemView(it);
        if (!v) return "";
        const mv = `<span class="noprint" style="white-space:nowrap"><button class="chip" data-sa="iup" data-id="${it.id}">↑</button> <button class="chip" data-sa="idn" data-id="${it.id}">↓</button> <button class="chip" data-sa="irm" data-id="${it.id}">✕</button></span>`;
        const vw = sv.views.find(x => x.it.id === it.id);
        const nmf = `<label class="sml">Nom dans la fiche <span style="font-weight:400">(par défaut : ${esc(vw ? vw.def : v.titre)})</span><input data-si="nom" data-id="${it.id}" value="${esc(it.nom || "")}" placeholder="${esc(vw ? vw.def : v.titre)}"></label>`;
        if (it.t === "lib")
          return `<div class="sit"><div class="sith"><b style="color:${famOf(v.fam).d}">${esc(v.code || "★")} · ${esc(v.titre)}</b>${mv}</div>${nmf}<label class="sml" style="margin-top:8px">Critères de réussite (un par ligne)<textarea rows="2" data-si="crit" data-id="${it.id}" placeholder="Ex. Le pied est posé sans bruit">${esc(it.crit || "")}</textarea></label></div>`;
        const f = (k2, l, p, rows) =>
          `<label class="sml" style="${rows ? "grid-column:1/-1" : ""}">${l}${rows ? `<textarea rows="${rows}" data-si="${k2}" data-id="${it.id}" placeholder="${esc(p)}">${esc(it[k2] || "")}</textarea>` : `<input data-si="${k2}" data-id="${it.id}" value="${esc(it[k2] || "")}" placeholder="${esc(p)}">`}</label>`;
        return `<div class="sit free"><div class="sith"><b>✎ Exercice libre</b>${mv}</div><div class="smg">${f("titre", "Nom de l'exercice", "Ex. Le pied muet")}${nmf}${f("part", "Participants", "Ex. binômes")}${f("mat", "Matériel", "Aucun")}${f("desc", "Consigne / déroulé", "Qui joue, ce qu'on fait, comment on gagne…", 3)}${f("plus", "Plus difficile (+) — un par ligne", "• …", 2)}${f("moins", "Plus facile (–) — un par ligne", "• …", 2)}${f("crit", "Critères de réussite — un par ligne", "Ex. Le pied est posé sans bruit", 2)}</div><div style="margin-top:6px"><a class="chip" data-sa="tolib" data-id="${it.id}" style="cursor:pointer">＋ Ajouter cet exercice à la bibliothèque</a></div></div>`;
      })
      .join("");
    return `<div class="ssub"><div class="smg" style="align-items:end"><label class="sml" style="grid-column:span 2">Titre de la sous-section<input data-ss="titre" data-sub="${s.id}" value="${esc(s.titre)}" placeholder="Ex. Poser les pieds"></label>${gsel}<div class="durs">${sv.idx.map(i => num(`data-gd="sub" data-n="1" data-sub="${s.id}" data-gi="${i}"`, "Durée" + (two ? " — " + gl(i) : "") + " (min)", s.d[i], M.G[i].c)).join("")}</div>
     <span class="noprint" style="white-space:nowrap;padding-bottom:8px"><button class="chip" data-sa="sup" data-sub="${s.id}">↑</button> <button class="chip" data-sa="sdn" data-sub="${s.id}">↓</button> <button class="chip" data-sa="srm" data-sub="${s.id}">✕ Supprimer</button></span></div>
     ${items || '<p class="hint" style="margin:8px 0">Aucun exercice dans cette sous-section.</p>'}
     <div class="sadd"><input list="gl" data-lib="${s.id}" placeholder="Chercher un exercice de la bibliothèque (code ou nom)…"><button class="chip" data-sa="addlib" data-sub="${s.id}">＋ Ajouter</button><button class="chip" data-sa="addfree" data-sub="${s.id}">＋ Exercice libre</button></div></div>`;
  };
  const dl = `<datalist id="gl">${DATA.map(g => `<option value="${esc((g.Code ? g.Code + " · " : "") + g.Titre)}"></option>`).join("")}</datalist>`;
  const bar = `<div class="tools noprint" style="margin-bottom:14px"><a class="chip" id="sClear" style="cursor:pointer;color:#B2263A;border-color:#E8B4BC">🗑 Effacer le contenu de la page</a><label class="chip" style="cursor:pointer">🖼 ${S.logo ? "Changer le logo" : "Ajouter le logo de la salle"}<input type="file" id="sLogo" accept="image/*" hidden></label>${S.logo ? `<img src="${esc(S.logo)}" alt="Logo" style="height:30px;border-radius:4px;border:1px solid #D5DAE5"><a class="chip" id="sLogoOff" style="cursor:pointer">Retirer le logo de cette fiche</a>` : ""}<span class="grow" style="flex:1"></span><a class="chip" id="sSave" style="cursor:pointer;background:#26364D;color:#fff;border-color:#26364D">${SE.id ? "☁ Mettre à jour la séance enregistrée" : "☁ Enregistrer dans la bibliothèque de séances"}</a>${SE.id ? `<a class="chip" id="sSaveCopy" style="cursor:pointer">Enregistrer comme nouvelle séance</a>` : ""}</div>${SE.id ? `<p class="hint noprint" style="margin:-6px 0 12px">✎ Vous modifiez une séance de la bibliothèque : « Mettre à jour » remplace la version enregistrée.</p>` : ""}`;
  return (
    head +
    bar +
    `<div class="box noprint"><b>Informations de la séance</b>
   <div class="smg">${inp("titre", "Cycle et séance", "Ex. Cycle 1 — Séance 4")}${inp("periode", "Période", "Ex. octobre")}${inp("theme", "Thème", "Ex. Pose de pieds & transfert de poids")}${inp("educ", "Éducateurs", "Prénoms")}${inp("objectif", "Objectif général", "Ce que la séance doit permettre d'apprendre", 1)}${inp("dates", "Dates", "Ex. 7 & 10 octobre")}</div>
   <div class="grps">${M.G.map(g => `<div class="grp"><label class="sml" style="${colf(0, g.c)}">Groupe ${g.i + 1}<input data-gm="nom" data-gi="${g.i}" value="${esc(S.groups[g.i].nom)}" placeholder="Groupe ${g.i + 1}"></label>${num(`data-gm="acc" data-n="1" data-gi="${g.i}"`, "Accueil (min)", g.acc, g.c)}${two ? `<a class="chip" data-grm="${g.i}" title="Retirer ce groupe" style="cursor:pointer">✕</a>` : ""}</div>`).join("")}${M.G.length < GMAX ? `<a class="chip" id="gAdd" style="cursor:pointer;align-self:flex-start">＋ Ajouter un groupe</a>` : ""}</div></div>
  <div class="box noprint" style="border-left:6px solid #7FCB8F"><label class="fl" style="margin:0 0 8px"><input type="checkbox" id="seEchOn" ${E.on ? "checked" : ""}> <b>Échauffement</b></label>
   ${
     E.on
       ? `<div class="smg"><label class="sml" style="grid-column:span 2">Nom de l'échauffement<input data-se="nom" value="${esc(E.nom)}" placeholder="Ex. Jeux de déplacement"></label><div class="durs">${M.G.map(g => num(`data-gd="ech" data-n="1" data-gi="${g.i}"`, "Durée" + (two ? " — " + gl(g.i) : "") + " (min)", E.d[g.i], g.c)).join("")}</div>
   ${two ? `<label class="fl" style="grid-column:1/-1"><input type="checkbox" id="seEchPer" ${E.per ? "checked" : ""}> Échauffement différent selon les groupes</label>` : ""}
   ${E.per ? M.G.map(g => `<label class="sml" style="grid-column:1/-1;${colf(0, g.c)}">Déroulé — ${esc(g.nom)} (une ligne par étape)<textarea rows="3" data-gt="1" data-gi="${g.i}" placeholder="Qui fait quoi, combien de temps.">${esc(E.gtxt[g.i])}</textarea></label>`).join("") : `<label class="sml" style="grid-column:1/-1">Déroulé (texte libre, une ligne par étape)<textarea rows="3" data-se="txt" placeholder="Qui fait quoi, combien de temps. Un jeu du site peut servir : ex. G1 · Jacadi, C2 · Le loup glacé">${esc(E.txt)}</textarea></label>`}</div>`
       : ""
   }</div>
  <div class="box noprint" style="border-left:6px solid #6EA8DC"><b>Corps de séance</b> <span style="color:#6B7280;font-size:13px">— total : ${M.G.map(g => `<b style="color:${g.c}">${M.c[g.i]} min</b>`).join(" · ")}</span>
   <div style="margin-top:8px">${SE.subs.map(subHTML).join("")}</div><div style="margin-top:10px"><a class="chip" data-sa="addsub" style="cursor:pointer;background:#26364D;color:#fff">＋ Ajouter une sous-section</a></div>${dl}</div>
  <div class="box noprint"><b>Bas de fiche</b><div class="smg" style="margin-top:8px">${txa("objCol", "Objectif collectif", "Ce que le groupe doit réussir")}${txa("secu", "Sécurité", "Hauteur, tapis, pas de saut…")}${M.G.map(g => `<label class="sml" style="${colf(0, g.c)}">Retour au calme${two ? " — " + esc(g.nom) : ""}<textarea rows="2" data-gm="rc" data-gi="${g.i}" placeholder="Étirements, bilan…">${esc(g.rc)}</textarea></label>`).join("")}</div></div>
  <h3 class="noprint" style="margin:18px 0 8px;color:#26364D">Aperçu de la fiche</h3><div id="sheet" style="border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.12)">${sheetHTML()}</div>
  <div class="tools noprint" style="margin-top:14px"><a class="btn" id="sPrint" style="background:#26364D;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Imprimer / PDF</a><a class="btn" id="sWord" style="background:#2B5A9E;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Télécharger en Word</a><a class="btn" id="sCopy" style="background:#EEF1F8;color:#26364D;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Copier le texte</a><span id="sMsg" style="color:#2E7D4F;font-weight:700"></span></div>`
  );
}
function seanceText() {
  const M = seModel(),
    S = SMETA;
  let t = (S.titre || "Ma séance") + (S.periode ? " (" + S.periode + ")" : "") + "\n";
  if (S.theme) t += "Thème : " + S.theme + "\n";
  if (S.educ) t += "Éducateurs : " + S.educ + "\n";
  if (S.objectif) t += "Objectif : " + S.objectif + "\n";
  if (S.dates) t += "Dates : " + S.dates + "\n";
  const d = (a, idx = M.all) => idx.map(i => a[i] || 0).join("/");
  t += `\nGroupes : ${M.G.map(g => g.nom).join(" / ")}\nAccueil [${d(M.G.map(g => g.acc))} min]\n`;
  if (M.ech.on) {
    t += `\nÉCHAUFFEMENT${M.ech.nom ? " — " + M.ech.nom : ""} [${d(M.ech.d)} min]\n`;
    if (M.ech.per)
      M.G.forEach(g => {
        if (M.ech.gtxt[g.i]) t += g.nom + " :\n" + M.ech.gtxt[g.i] + "\n";
      });
    else if (M.ech.txt) t += M.ech.txt + "\n";
  }
  t += `\nCORPS DE SÉANCE [${d(M.c)} min]\n`;
  M.subs.forEach((s, k) => {
    t += `\n${s.titre || "Sous-section " + (k + 1)}${s.idx.length < M.G.length ? " · " + nomsGroupes(M, s.idx) + " seulement" : ""} [${d(s.d, s.idx)} min]\n`;
    s.views.forEach(x => {
      t += `- ${x.name}${x.v.code ? " (" + x.v.code + ")" : ""} — ${x.v.resume}\n`;
    });
  });
  t += `\nDurée totale : ${d(M.tot)} min\n`;
  if (M.mats.length) t += "Matériel : " + M.mats.map(m => capf(m.t)).join(", ") + "\n";
  return t;
}
