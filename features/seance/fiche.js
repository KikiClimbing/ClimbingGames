/* Ma séance — vue normalisée d'un exercice et aperçu de la fiche (HTML) */
/* vue normalisée d'un jeu (bibliothèque ou libre) */
function itemView(it) {
  if (it.t === "lib") {
    const g = DATA.find(x => key(x) === it.k);
    if (!g) return null;
    return {
      titre: g.Titre,
      code: g.Code || "",
      desc: g["Principe"] || g["Résumé"] || "",
      meta: [g["Participants"], g["Espace"], g["Matériel"] && "Matériel : " + g["Matériel"]]
        .filter(Boolean)
        .join(" · "),
      plus: g["Plus difficile"],
      moins: g["Plus facile"],
      crit: it.crit,
      mat: g["Matériel"],
      noMat: noMat(g),
      resume: g["Résumé"] || "",
      fam: g,
    };
  }
  return {
    titre: it.titre || "[Nom du jeu]",
    code: "",
    desc: it.desc || "",
    meta: [it.part, it.mat && "Matériel : " + it.mat].filter(Boolean).join(" · "),
    plus: it.plus,
    moins: it.moins,
    crit: it.crit,
    mat: it.mat,
    noMat: /^(aucun|—)/i.test((it.mat || "").trim()),
    resume: it.desc || "",
    free: true,
  };
}
function seModel() {
  seDefaults();
  const two = SMETA.deux !== false;
  const inc = s => ({ 1: s.g !== "2", 2: two && s.g !== "1" });
  const subs = SE.subs.map(s => {
    const g = two ? s.g : "1";
    const i1 = g !== "2",
      i2 = two && g !== "1";
    return {
      ...s,
      g,
      i1,
      i2,
      views: s.items.map(i => ({ it: i, v: itemView(i) })).filter(x => x.v),
    };
  });
  subs.forEach(s => {
    const many = s.views.length > 1;
    s.views.forEach(x => {
      const def = !many && s.titre ? s.titre : x.v.titre;
      x.def = def;
      x.name = (x.it.nom || "").trim() || def;
      x.same = !!s.titre && norm(x.name) === norm(s.titre);
      x.steps = stepsOf(x.v, x.it);
    });
  });
  const mats = {};
  subs.forEach(s =>
    s.views.forEach(({ v }) => {
      if (v.noMat || !v.mat) return;
      String(v.mat)
        .split(/[;,]|\bet\b/i)
        .map(x => x.replace(/\(.*?\)/g, "").trim())
        .filter(t => t && !/^(aucun|option)/i.test(norm(t)))
        .forEach(t => {
          const kk = norm(t);
          (mats[kk] = mats[kk] || { t, c: [] }).c.push(v.code || v.titre);
        });
    })
  );
  const ech = SE.ech,
    e1 = ech.on ? +ech.d1 || 0 : 0,
    e2 = ech.on ? +ech.d2 || 0 : 0;
  const c1 = subs.reduce((a, s) => a + (s.i1 ? +s.d1 || 0 : 0), 0),
    c2 = subs.reduce((a, s) => a + (s.i2 ? +s.d2 || 0 : 0), 0);
  return {
    two,
    subs,
    ech,
    mats: Object.values(mats),
    c1,
    c2,
    tot1: (+SMETA.acc1 || 0) + e1 + c1,
    tot2: (+SMETA.acc2 || 0) + e2 + c2,
    nGames: subs.reduce((a, s) => a + s.views.length, 0),
  };
}
/* étiquettes de durée : [{t:"15'",c:couleur}] */
const tgs = (M, d1, d2, g = "both") => {
  const a = [];
  if (g !== "2") a.push({ t: d1 + "'", c: C1 });
  if (M.two && g !== "1") a.push({ t: d2 + "'", c: C2 });
  return a;
};
function sheetHTML() {
  const M = seModel(),
    S = SMETA,
    two = M.two;
  const ph = t => `<i style="color:#8A93A3">${t}</i>`;
  const v = (x, p) => (x ? esc(x) : ph(p));
  const tagbox = a =>
    `<span style="display:inline-flex;gap:3px">${a.map(x => `<span style="background:${x.c};color:#fff;font-weight:700;padding:2px 9px;min-width:30px;text-align:center">${x.t}</span>`).join("")}</span>`;
  const band = (a, title, bg, col, body) =>
    `<div style="display:flex;align-items:center;gap:10px;background:${bg};padding:3px 8px 3px 0;margin-top:8px;font-size:12px;font-weight:700;color:${col}">${tagbox(a)}<span>${title}</span></div>${body || ""}`;
  let h = `<div class="sheet" style="font-size:13px;color:#2B2F36;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact">
  <div style="background:${NAVYC};color:#fff;display:grid;grid-template-columns:2fr 1.6fr 1.1fr 1.4fr;gap:14px;padding:12px 16px;align-items:center">
   <div><b style="font-size:18px">${v(S.titre, "[Cycle n — Séance n]")}</b> <span style="color:#C9D1DE">${v(S.periode, "[période]")}</span><br><b>Thème :</b> <span style="color:#C9D1DE">${v(S.theme, "[thème de la séance]")}</span><br><b>Éducateurs :</b> <span style="color:#C9D1DE">${v(S.educ, "[prénoms]")}</span></div>
   <div><b>Objectif général :</b> <span style="color:#C9D1DE">${v(S.objectif, "[ce que la séance doit permettre d'apprendre]")}</span></div>
   <div style="text-align:center"><b>Dates :</b> <span style="color:#C9D1DE">${v(S.dates, "[jj mois]")}</span></div>
   <div style="font-size:12px"><span style="color:${C1}">■</span> ${esc(S.g1 || "Groupe 1")} – ${M.tot1} min${two ? `<br><span style="color:${C2}">■</span> ${esc(S.g2 || "Groupe 2")} – ${M.tot2} min` : ""}</div></div>`;
  h += band(tgs(M, S.acc1 || 0, S.acc2 || 0), "ACCUEIL", "#FDF3D3", "#8A6D12");
  if (M.ech.on)
    h += band(
      tgs(M, M.ech.d1 || 0, M.ech.d2 || 0),
      "ÉCHAUFFEMENT" + (M.ech.nom ? " — " + esc(M.ech.nom) : ""),
      "#E6F2E6",
      "#2E6F3E",
      lines(M.ech.txt).length
        ? `<div style="padding:4px 10px;font-size:12px">${String(M.ech.txt)
            .split("\n")
            .map(
              l =>
                `<div><span style="color:${C1};font-weight:700">▸</span> ${esc(l.replace(/^\s*[•\-–▸]\s*/, ""))}</div>`
            )
            .join("")}</div>`
        : `<div style="padding:4px 10px;font-size:12px">${ph("▸ [Décrire le déroulé : qui fait quoi, combien de temps]")}</div>`
    );
  h += band(tgs(M, M.c1, M.c2), "CORPS DE SÉANCE", "#E3EEF8", "#2B5A9E");
  const th = (t, c, f) =>
    `<div style="background:${f};color:${c};font-weight:700;font-size:11px;padding:5px 10px;border-bottom:1px solid #D5DAE5">${t}</div>`;
  const exo = (x, n) => {
    const v = x.v,
      L = lines;
    const nm = esc(x.name);
    const col = (t, c, sg, bg) =>
      `<div style="background:${bg};padding:6px 10px;border-bottom:1px solid #D5DAE5;font-size:12px">${
        L(t)
          .map(
            l => `<div style="margin-bottom:2px"><b style="color:${c}">${sg}</b> ${esc(l)}</div>`
          )
          .join("") || ph("—")
      }</div>`;
    const cr = L(v.crit);
    const first = x.same
      ? `<div style="margin:0 0 3px">${x.steps.map(l => `<div><b style="color:${C1}">▸</b> ${esc(l)}</div>`).join("")}</div>`
      : `<b style="color:${C1}">▸</b> <b>${n}. ${nm}</b>${v.code ? ` <span style="color:#6B7280;font-size:11px">(${esc(v.code)})</span>` : ""}<div style="margin:2px 0;white-space:pre-line">${esc(v.desc)}</div>`;
    return (
      `<div style="padding:6px 10px;border-bottom:1px solid #D5DAE5;font-size:12px">${first}<div style="color:#6B7280;font-size:11px;font-style:italic">${x.same && v.code ? "Fiche " + esc(v.code) + " · " : ""}${esc(v.meta)}</div></div>` +
      col(v.plus, C2, "+", "#FDF3F2") +
      col(v.moins, "#2E6F3E", "–", "#F1F8F2") +
      `<div style="background:#FDF3F2;padding:6px 10px;border-bottom:1px solid #D5DAE5;font-size:12px">${cr.length ? cr.map(l => `<div><b style="color:#2E6F3E">✓</b> ${esc(l)}</div>`).join("") : ph("✓ [critère observable]") + "<br>" + ph("✓ [critère observable]")}</div>`
    );
  };
  if (M.subs.length) {
    let n = 0;
    h += `<div style="display:grid;grid-template-columns:3.2fr 1.2fr 1.2fr 1.3fr;margin-top:8px"><div style="background:#2B5A9E;color:#E3EEF8;font-weight:700;font-size:11px;padding:5px 10px">EXERCICE / DÉFI / JEU</div>${th("PLUS DIFFICILE (+)", "#B2543A", "#FBE6E4")}${th("PLUS FACILE (–)", "#2E6F3E", "#E6F2E8")}${th("CRITÈRES DE RÉUSSITE", "#B2263A", "#FBE6E4")}`;
    M.subs.forEach((s, k) => {
      const who =
        two && s.g !== "both"
          ? ` <span style="font-weight:400">· ${esc(s.g === "1" ? S.g1 : S.g2)} seulement</span>`
          : "";
      h += `<div style="background:#ECE7F8;padding:4px 10px;font-size:12px;font-weight:700;color:#5B4BA8">${tgs(
        M,
        s.d1 || 0,
        s.d2 || 0,
        s.g
      )
        .map(
          x =>
            `<span style="display:inline-block;background:#fff;color:${x.c};border:1px solid ${x.c};padding:0 6px;margin-right:4px;min-width:26px;text-align:center">${x.t}</span>`
        )
        .join(
          ""
        )} &nbsp;${esc(s.titre || "Sous-section " + (k + 1))}${who}</div><div style="background:#FDF3F2"></div><div style="background:#F1F8F2"></div><div style="background:#FDF3F2"></div>`;
      s.views.forEach(x => {
        if (!x.same) n++;
        h += exo(x, n);
      });
    });
    h += `</div>`;
  }
  const fb = (t, b, bg = "#F2F3F5") =>
    `<div style="background:${bg};padding:8px 12px;font-size:12px;border-left:3px solid #fff"><b style="font-size:11px">${t}</b><br>${b}</div>`;
  h += `<div style="display:grid;grid-template-columns:1.6fr 1.3fr 1.1fr 1.4fr;margin-top:12px">${fb("OBJECTIF COLLECTIF", S.objCol ? esc(S.objCol).replace(/\n/g, "<br>") : ph("[ce que le groupe doit réussir]"))}${fb("MATÉRIEL", M.mats.length ? M.mats.map(m => `☐ ${esc(capf(m.t))} <span style="color:#8A93A3;font-size:10px">${m.c.map(esc).join(", ")}</span>`).join("<br>") : "Aucun matériel particulier.")}${fb("SÉCURITÉ", S.secu ? esc(S.secu).replace(/\n/g, "<br>") : ph("[rappels : hauteur, tapis, pas de saut…]"))}${fb("RETOUR AU CALME", `<b style="color:${C1}">${esc(S.g1 || "Groupe 1")} :</b> ${v(S.rc1, "[étirements, bilan…]")}` + (two ? `<br><b style="color:${C2}">${esc(S.g2 || "Groupe 2")} :</b> ${v(S.rc2, "[étirements, bilan…]")}` : ""))}</div></div>`;
  return h;
}
