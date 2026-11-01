/* Ma séance — modèle de fiche « CREPS » (2ᵉ option, à côté de la fiche habituelle).
   Mêmes données que la fiche habituelle (SE / SMETA) ; colonnes : Situation · Objectif de la situation · But à atteindre ·
   Consignes et règles du jeu · Critères de réussite · Comportements attendus · Variantes · Organisation, puis une page de schémas.
   Les champs propres à ce modèle sont stockés dans les exercices (it.cp_obj, cp_but, cp_cons, cp_comp, cp_orga) et dans
   l'échauffement (SE.ech.cp_*) ; s'ils sont vides, on reprend la fiche du jeu (résumé, principe, matériel, variantes…). */
const CREPS_COLS = [
  ["SITUATION", "", "#26364D", "#F4F6FA", 9],
  [
    "OBJECTIF de la situation",
    "Ce que l'éducateur veut que ses pratiquants soient capables de faire / quelle transformation visée ?",
    "#2B5A9E",
    "#E7EFFA",
    12,
  ],
  ["BUT à atteindre pour les pratiquants", "", "#3A8FB0", "#E6F3F8", 10],
  ["CONSIGNES et RÈGLES DU JEU", "À donner aux pratiquants", "#4E9A5B", "#E9F4EB", 18],
  ["CRITÈRES de réussite", "Les élèves savent qu'ils ont réussi quand…", "#B2263A", "#FBE9EC", 12],
  [
    "COMPORTEMENTS ATTENDUS",
    "Quels comportements j'attends de mes pratiquants pour qu'ils soient en réussite ? (critères techniques / tactiques de réalisation)",
    "#8A55B5",
    "#F1EAF7",
    15,
  ],
  ["VARIANTES", "Plus difficile si réussite · plus facile si échec", "#E8662F", "#FDEFE7", 13],
  ["ORGANISATION", "Matériel, espace, durée…", "#5B6B82", "#EDF0F4", 11],
];
const isCreps = () => SMETA && SMETA.modele === "creps";
/* schémas : « page » = sur une page à part (défaut) ; « sous » = sous chaque situation */
const schemaSous = () => SMETA && SMETA.schemaMode === "sous";
/* fiche du jeu de la bibliothèque (ou null pour un exercice libre) */
const crepsJeu = it => (it.t === "lib" ? DATA.find(x => key(x) === it.k) : null);
/* lignes de la table : échauffement puis chaque exercice = une situation */
function crepsLignes(M) {
  const rows = [];
  const E = SE.ech;
  if (M.ech.on) {
    const cons = M.ech.per
      ? M.G.map(g => (M.ech.gtxt[g.i] ? g.nom + " :\n" + M.ech.gtxt[g.i] : ""))
          .filter(Boolean)
          .join("\n")
      : M.ech.txt;
    rows.push({
      nom: "Échauffement / mise en train" + (M.ech.nom ? " — " + M.ech.nom : ""),
      fx: "ech",
      src: E,
      obj: E.cp_obj || "",
      but: E.cp_but || "",
      cons: E.cp_cons || cons || "",
      crit: E.cp_crit || "",
      comp: E.cp_comp || "",
      plus: E.cp_plus || "",
      moins: E.cp_moins || "",
      orga: E.cp_orga || "",
      dur: tgs(M, M.ech.d, M.all),
    });
  }
  let n = 0;
  M.subs.forEach((s, k) =>
    s.views.forEach(x => {
      n++;
      const v = x.v,
        it = x.it,
        g = crepsJeu(it);
      rows.push({
        nom: "Situation " + n,
        titre: x.name + (v.code ? " (" + v.code + ")" : ""),
        sub: s.titre || "",
        fx: "it",
        src: it,
        obj: it.cp_obj || (g && g.Objectif) || "",
        but: it.cp_but || (g && g.But) || v.resume || "",
        cons: it.cp_cons || v.desc || "",
        crit: v.crit || "",
        comp: it.cp_comp || (g && g["Comportements attendus"]) || "",
        plus: v.plus || "",
        moins: v.moins || "",
        orga: it.cp_orga || (g && g.Organisation) || v.meta || "",
        dur: tgs(M, s.d, s.idx),
        g,
        url: v.url,
      });
    })
  );
  return rows;
}
const crepsImg = g =>
  !g
    ? ""
    : isEmb(g)
      ? "schemas/" + g.Code + ".webp"
      : driveImg(g["Schéma (lien)"] || g["Schéma"]) || "";
/* image de la situation : le schéma dessiné pour elle (it.sch) sinon celui du jeu */
const crepsImgRow = r => (r.src && r.src.sch && edSvgUrl(r.src.sch)) || crepsImg(r.g);
function crepsHTML() {
  const M = seModel(),
    S = SMETA,
    L = crepsLignes(M);
  const ph = t => `<i style="color:#8A93A3">${t}</i>`;
  const bloc = (t, sg, c) =>
    lines(t)
      .map(
        l =>
          `<div style="margin-bottom:2px">${sg ? `<b style="color:${c}">${sg}</b> ` : ""}${esc(l)}</div>`
      )
      .join("") || ph("—");
  const cl = "color:#C9D1DE";
  const info = [
    S.periode ? `<span style="${cl}">${esc(S.periode)}</span>` : "",
    S.dates ? `<b>Dates :</b> <span style="${cl}">${esc(S.dates)}</span>` : "",
    S.educ ? `<b>Éducateurs :</b> <span style="${cl}">${esc(S.educ)}</span>` : "",
    S.objectif ? `<b>Objectif général :</b> <span style="${cl}">${esc(S.objectif)}</span>` : "",
  ].filter(Boolean);
  let h = `<div class="sheet creps" style="font-size:12px;color:#2B2F36;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact">
  <div style="background:${NAVYC};color:#fff;padding:12px 16px;display:flex;gap:14px;align-items:center">${S.logo ? `<img src="${esc(S.logo)}" alt="Logo" style="max-height:54px;max-width:150px">` : ""}<div style="flex:1"><div style="font-size:11px;letter-spacing:1px;color:#C9D1DE">FICHE DE PRÉPARATION D'UNE SÉANCE</div><div><b style="font-size:19px">${S.titre ? esc(S.titre) : ph("Titre de la séance")}</b></div><div><b>Thème général :</b> <span style="${cl}">${S.theme ? esc(S.theme) : "—"}</span></div></div><div style="flex:1;font-size:12px">${info.join("<br>")}</div><div style="font-size:12px">${M.G.map(g => `<span style="color:${g.c}">■</span> ${esc(g.nom)} – ${M.tot[g.i]} min`).join("<br>")}</div></div>
  <table style="width:100%;border-collapse:collapse;table-layout:fixed"><thead><tr>${CREPS_COLS.map(c => `<th style="width:${c[4]}%;background:${c[2]};color:#fff;padding:6px 6px;font-size:11px;text-align:center;border:1px solid #fff;vertical-align:middle">${c[0]}${c[1] ? `<div style="font-weight:400;font-size:9px;margin-top:2px;line-height:1.2">${esc(c[1])}</div>` : ""}</th>`).join("")}</tr></thead><tbody>`;
  L.forEach(r => {
    const td = (i, body) =>
      `<td style="background:${CREPS_COLS[i][3]};padding:6px 7px;vertical-align:top;border:1px solid #fff;word-wrap:break-word">${body}</td>`;
    const durs = r.dur
      .map(
        x =>
          `<span style="display:inline-block;background:${x.c};color:#fff;font-weight:700;padding:0 6px;margin:0 3px 3px 0">${x.t}</span>`
      )
      .join("");
    h += `<tr style="page-break-inside:avoid">${td(
      0,
      `<b>${esc(r.nom)}</b>${r.titre ? `<div style="margin-top:3px">${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline dotted">${esc(r.titre)}</a>` : esc(r.titre)}</div>` : ""}${r.sub ? `<div style="color:#6B7280;font-size:10px;font-style:italic">${esc(r.sub)}</div>` : ""}`
    )}${td(1, bloc(r.obj))}${td(2, bloc(r.but))}${td(3, bloc(r.cons, "▸", C1))}${td(4, bloc(r.crit, "✓", "#2E6F3E"))}${td(5, bloc(r.comp, "•", "#8A55B5"))}${td(6, `${r.plus ? `<div style="margin-bottom:4px"><b style="color:${C2}">+ Plus difficile</b>${bloc(r.plus, "", "")}</div>` : ""}${r.moins ? `<div><b style="color:#2E6F3E">– Plus facile</b>${bloc(r.moins, "", "")}</div>` : ""}${r.plus || r.moins ? "" : ph("—")}`)}${td(7, `<div>${durs}</div>${bloc(r.orga, "", "")}`)}</tr>`;
    if (schemaSous() && crepsImgRow(r)) {
      const img = crepsImgRow(r);
      h += `<tr style="page-break-inside:avoid"><td colspan="8" style="border:1px solid #D5DAE5;padding:0"><div style="display:flex;align-items:stretch;min-height:120px"><div style="background:#F4F6FA;font-size:10px;color:#5B6B82;font-weight:700;padding:6px 8px;writing-mode:vertical-rl;transform:rotate(180deg);text-align:center">SCHÉMA</div><div style="display:flex;align-items:center;justify-content:center;padding:6px;width:34%;min-width:230px"><img src="${esc(img)}" alt="Schéma" onerror="this.closest('tr').remove()" style="max-width:100%;max-height:200px;object-fit:contain"></div><div style="flex:1;border-left:1px dashed #D5DAE5"></div></div></td></tr>`;
    }
  });
  h += `</tbody></table>`;
  /* page des schémas : seulement les situations qui ont une image (sauf si les schémas sont sous chaque situation) */
  const avecImg = L.filter(r => crepsImgRow(r));
  if (!schemaSous() && avecImg.length)
    h += `<div style="page-break-before:always;break-before:page;margin-top:14px"><div style="background:${NAVYC};color:#fff;text-align:center;font-weight:700;padding:6px">Schémas</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1px solid #D5DAE5">${avecImg
      .map(
        r =>
          `<div class="sch" style="border:1px solid #D5DAE5"><div style="background:#F4F6FA;font-size:11px;padding:3px 8px">${esc(r.nom)}${r.titre ? " — " + esc(r.titre) : ""}</div><div style="min-height:190px;display:flex;align-items:center;justify-content:center"><img src="${esc(crepsImgRow(r))}" alt="Schéma" onerror="this.closest('.sch').remove()" style="max-width:100%;max-height:230px;object-fit:contain"></div></div>`
      )
      .join("")}</div></div>`;
  return h + bilanFicheHTML();
}
/* ---- formulaire : sélecteur de modèle + champs propres au modèle CREPS ---- */
function crepsChoixHTML() {
  const b = (m, l) =>
    `<button data-sa="modele" data-m="${m}" class="${(SMETA.modele === "creps" ? "creps" : "std") === m ? "on" : ""}">${l}</button>`;
  return `<div class="tools" style="margin:8px 0 4px"><span style="font-weight:700">Modèle de fiche :</span><div class="seg">${b("std", "Fiche habituelle")}${b("creps", "Fiche CREPS")}</div><span style="color:#6B7280;font-size:13px">Même séance, autre présentation (tableau à 8 colonnes).</span></div>${
    isCreps()
      ? `<div class="tools" style="margin:0 0 4px"><span style="font-weight:700">Schémas :</span><div class="seg"><button data-sa="schemode" data-m="page" class="${schemaSous() ? "" : "on"}">Sur une page à part</button><button data-sa="schemode" data-m="sous" class="${schemaSous() ? "on" : ""}">Sous chaque situation</button></div></div>`
      : ""
  }`;
}
/* champs propres au modèle CREPS d'une situation (r : ligne de crepsLignes) — placés dans le cadre de l'exercice lui-même */
function crepsChampsHTML(r) {
  const g = r.g;
  const f = (k, lab, ph, def) => {
    const val = r.src[k] || "";
    const attr = r.fx === "ech" ? `data-se="${k}"` : `data-si="${k}" data-id="${r.src.id}"`;
    return `<label class="sml">${lab}<textarea rows="2" ${attr} placeholder="${esc(def || ph)}">${esc(val)}</textarea></label>`;
  };
  const sch =
    r.fx === "ech"
      ? ""
      : `<div class="tools" style="margin:8px 0 0"><button class="chip" data-sa="edsch" data-id="${r.src.id}">✏ Dessiner un schéma pour cette situation</button>${
          r.src.sch && edSvgUrl(r.src.sch)
            ? `<img src="${edSvgUrl(r.src.sch)}" alt="" style="height:46px;border:1px solid #D5DAE5;border-radius:4px;background:#fff"><button class="chip" data-sa="edschrm" data-id="${r.src.id}">Effacer le schéma dessiné</button>`
            : g && crepsImg(g)
              ? '<span class="hint">(le schéma du jeu sera utilisé)</span>'
              : ""
        }</div>`;
  return `<div class="cpbox" style="margin-top:10px;border:1px dashed #8A55B5;border-radius:8px;padding:8px 10px;background:#FAF7FD"><b style="color:#8A55B5;font-size:13px">Compléments fiche CREPS</b> <span class="hint" style="font-size:12px">— les champs vides reprennent la fiche du jeu (texte grisé)</span><div class="smg" style="margin-top:6px">
    ${f(r, "cp_obj", "Objectif de la situation", "Quelle transformation visée ?", (g && g.Objectif) || "")}
    ${f(r, "cp_but", "But à atteindre pour les pratiquants", "Ce que les pratiquants doivent réussir", r.src.id && r.but)}
    ${f(r, "cp_cons", "Consignes et règles du jeu", "À donner aux pratiquants", r.cons)}
    ${f(r, "cp_comp", "Comportements attendus", "Critères techniques / tactiques de réalisation")}
    ${f(r, "cp_orga", "Organisation", "Matériel, espace, durée…", r.orga)}
    </div>${sch}</div>`;
}
/* dans le cadre d'un exercice (L : crepsLignes de la séance, calculé une fois par affichage) */
function crepsItemHTML(it, L) {
  if (!isCreps()) return "";
  const r = L.find(x => x.src === it);
  return r ? crepsChampsHTML(r) : "";
}
/* dans le cadre de l'échauffement */
function crepsEchHTML() {
  if (!isCreps() || !SE.ech.on) return "";
  const r = crepsLignes(seModel()).find(x => x.fx === "ech");
  return r ? crepsChampsHTML(r) : "";
}
/* ---- Word ---- */
function buildCrepsDoc(logo) {
  const D = window.docx;
  const {
    Document,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    ShadingType,
    BorderStyle,
    PageOrientation,
    TableLayoutType,
    AlignmentType,
  } = D;
  const FONT = "Calibri";
  const M = seModel(),
    S = SMETA,
    L = crepsLignes(M);
  const R = (t, o = {}) =>
    new TextRun({
      text: String(t).replace(/'/g, "’"),
      font: FONT,
      size: o.size || 17,
      bold: o.b,
      italics: o.i,
      color: o.c || "2B2F36",
    });
  const P = (ch, o = {}) =>
    new Paragraph({
      children: Array.isArray(ch) ? ch : [ch],
      alignment: o.al,
      spacing: { before: 0, after: o.af || 20, line: 240 },
    });
  const bd = c => ({ style: BorderStyle.SINGLE, size: 6, color: c });
  const B = c => ({ top: bd(c), bottom: bd(c), left: bd(c), right: bd(c) });
  const cell = (ch, w, fill, o = {}) =>
    new TableCell({
      children: ch.length ? ch : [P(R(""))],
      width: { size: w, type: WidthType.DXA },
      columnSpan: o.span,
      shading: { type: ShadingType.CLEAR, fill: fill || "FFFFFF", color: "auto" },
      margins: { top: 60, bottom: 60, left: 90, right: 90 },
      borders: B("FFFFFF"),
    });
  const W = [1300, 1900, 1500, 2900, 1900, 2300, 2200, 1838];
  const CW = W.reduce((a, b) => a + b, 0);
  const tbl = (rows, w) =>
    new Table({
      rows,
      width: { size: w.reduce((a, b) => a + b, 0), type: WidthType.DXA },
      columnWidths: w,
      layout: TableLayoutType.FIXED,
    });
  const hex = c => c.replace("#", "");
  const out = [];
  /* bandeau d'en-tête */
  const info = [
    S.periode,
    S.dates && "Dates : " + S.dates,
    S.educ && "Éducateurs : " + S.educ,
    S.objectif && "Objectif général : " + S.objectif,
  ].filter(Boolean);
  const head = [
    P(R("FICHE DE PRÉPARATION D'UNE SÉANCE", { c: "C9D1DE", size: 16 })),
    P(R(S.titre || "Titre de la séance", { b: true, c: "FFFFFF", size: 28 })),
    P([R("Thème général : ", { b: true, c: "FFFFFF" }), R(S.theme || "—", { c: "C9D1DE" })]),
  ];
  const mid = info.length ? info.map(t => P(R(t, { c: "FFFFFF" }))) : [P(R(""))];
  const right = M.G.map(g =>
    P([R("■ ", { c: hex(g.c), b: true }), R(g.nom + " – " + M.tot[g.i] + " min", { c: "FFFFFF" })])
  );
  const entete = tbl(
    [
      new TableRow({
        children: [
          cell(head, 6400, "1E2630"),
          cell(mid, 6000, "1E2630"),
          cell(right, 3438, "1E2630"),
        ],
      }),
    ],
    [6400, 6000, 3438]
  );
  out.push(entete);
  out.push(
    new Paragraph({
      spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: "", size: 4 })],
    })
  );
  /* tableau principal */
  const rows = [
    new TableRow({
      tableHeader: true,
      children: CREPS_COLS.map((c, i) =>
        cell(
          [
            P(R(c[0], { b: true, c: "FFFFFF", size: 16 }), { al: AlignmentType.CENTER }),
            ...(c[1] ? [P(R(c[1], { c: "FFFFFF", size: 13 }), { al: AlignmentType.CENTER })] : []),
          ],
          W[i],
          hex(c[2])
        )
      ),
    }),
  ];
  const lg = (t, sg, col) => {
    const a = lines(t);
    return a.length
      ? a.map(l => P([...(sg ? [R(sg + " ", { b: true, c: col })] : []), R(l)]))
      : [P(R("—", { i: true, c: "8A93A3" }))];
  };
  const hasImg = r => {
    const u = crepsImgRow(r);
    return !!(u && CREPS_IMGS[u]);
  };
  const imgCell = (r, w, maxW, maxH, fill = "FFFFFF", span) => {
    const url = crepsImgRow(r),
      run = url && crepsImgRun(D, url, maxW, maxH);
    return cell(
      run ? [new Paragraph({ children: [run], alignment: AlignmentType.CENTER })] : [],
      w,
      fill,
      { span }
    );
  };
  const titreSch = r =>
    (r.nom.startsWith("Échauffement") ? "Échauffement" : r.nom) + (r.titre ? " — " + r.titre : "");
  L.forEach(r => {
    const var_ = [];
    if (r.plus) var_.push(P(R("+ Plus difficile", { b: true, c: "E8662F" })), ...lg(r.plus));
    if (r.moins) var_.push(P(R("– Plus facile", { b: true, c: "2E6F3E" })), ...lg(r.moins));
    const dur = [P(r.dur.map((x, i) => R((i ? "  " : "") + x.t, { b: true, c: hex(x.c) })))];
    rows.push(
      new TableRow({
        cantSplit: true,
        children: [
          cell(
            [
              P(R(r.nom, { b: true })),
              ...(r.titre ? [P(R(r.titre))] : []),
              ...(r.sub ? [P(R(r.sub, { i: true, c: "6B7280", size: 15 }))] : []),
            ],
            W[0],
            hex(CREPS_COLS[0][3])
          ),
          cell(lg(r.obj), W[1], hex(CREPS_COLS[1][3])),
          cell(lg(r.but), W[2], hex(CREPS_COLS[2][3])),
          cell(lg(r.cons, "▸", "3A8FB0"), W[3], hex(CREPS_COLS[3][3])),
          cell(lg(r.crit, "✓", "2E6F3E"), W[4], hex(CREPS_COLS[4][3])),
          cell(lg(r.comp, "•", "8A55B5"), W[5], hex(CREPS_COLS[5][3])),
          cell(
            var_.length ? var_ : [P(R("—", { i: true, c: "8A93A3" }))],
            W[6],
            hex(CREPS_COLS[6][3])
          ),
          cell([...dur, ...lg(r.orga)], W[7], hex(CREPS_COLS[7][3])),
        ],
      })
    );
    if (schemaSous() && hasImg(r))
      rows.push(
        new TableRow({
          cantSplit: true,
          children: [
            cell([], W[0], "F4F6FA"),
            imgCell(r, W[1] + W[2] + W[3], 330, 170, "FFFFFF", 3),
            cell([], W[4] + W[5] + W[6] + W[7], "FFFFFF", { span: 4 }),
          ],
        })
      );
  });
  out.push(tbl(rows, W));
  /* page des schémas : seulement les situations dont l'image a pu être chargée */
  const avecImg = L.filter(hasImg);
  if (!schemaSous() && avecImg.length) {
    out.push(
      new Paragraph({
        pageBreakBefore: true,
        spacing: { before: 0, after: 80 },
        children: [R("Schémas", { b: true, size: 24 })],
        alignment: AlignmentType.CENTER,
      })
    );
    const W3 = [5279, 5279, 5280];
    const sr = [];
    for (let i = 0; i < avecImg.length; i += 3) {
      const grp = avecImg.slice(i, i + 3);
      sr.push(
        new TableRow({
          children: [0, 1, 2].map(j =>
            cell(grp[j] ? [P(R(titreSch(grp[j]), { size: 16 }))] : [], W3[j], "F4F6FA")
          ),
        })
      );
      sr.push(
        new TableRow({
          cantSplit: true,
          children: [0, 1, 2].map(j =>
            grp[j] ? imgCell(grp[j], W3[j], 330, 220) : cell([], W3[j], "FFFFFF")
          ),
        })
      );
    }
    out.push(tbl(sr, W3));
  }
  return new Document({
    creator: "Base de données des jeux d'escalade",
    title: S.titre || "Fiche de séance",
    styles: { default: { document: { run: { font: FONT, size: 17 } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE },
            margin: { top: 500, bottom: 500, left: 500, right: 500 },
          },
        },
        children: out,
      },
    ],
  });
}

/* ---- images de schémas pour le Word : téléchargées puis converties en PNG (Word ne lit pas le WebP) ---- */
const CREPS_IMGS = {};
async function crepsImgPng(url) {
  let bmp;
  if (/^data:image\/svg/.test(url)) {
    /* schéma dessiné : le SVG est converti via une image (createImageBitmap ne lit pas le SVG) */
    bmp = await new Promise((ok, ko) => {
      const im = new Image();
      im.onload = () => ok({ im, width: 1600, height: 576 });
      im.onerror = () => ko(new Error("illisible"));
      im.src = url;
    });
    const c = document.createElement("canvas");
    c.width = 1200;
    c.height = 432;
    const x = c.getContext("2d");
    x.fillStyle = "#fff";
    x.fillRect(0, 0, c.width, c.height);
    x.drawImage(bmp.im, 0, 0, c.width, c.height);
    const blob = await new Promise(ok => c.toBlob(ok, "image/png"));
    return { data: new Uint8Array(await blob.arrayBuffer()), w: c.width, h: c.height };
  }
  const r = await fetch(url);
  if (!r.ok) throw new Error("introuvable");
  bmp = await createImageBitmap(await r.blob());
  const k = Math.min(1, 900 / bmp.width);
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  const x = c.getContext("2d");
  x.fillStyle = "#fff";
  x.fillRect(0, 0, c.width, c.height);
  x.drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise(ok => c.toBlob(ok, "image/png"));
  return { data: new Uint8Array(await blob.arrayBuffer()), w: c.width, h: c.height };
}
/* prépare les images de la séance (rec : séance de la bibliothèque, sinon la séance en cours) ; renvoie le nombre d'images indisponibles */
async function crepsPreload(rec) {
  const L = rec
    ? withSeance(rec.meta, rec.se, () => crepsLignes(seModel()))
    : crepsLignes(seModel());
  const urls = [...new Set(L.map(r => crepsImgRow(r)).filter(Boolean))];
  let manque = 0;
  await Promise.all(
    urls.map(async u => {
      if (CREPS_IMGS[u]) return;
      try {
        CREPS_IMGS[u] = await Promise.race([
          crepsImgPng(u),
          new Promise((_, ko) => setTimeout(() => ko(new Error("délai")), 8000)),
        ]);
      } catch (e) {
        manque++;
      }
    })
  );
  return manque;
}
/* image réduite pour tenir dans (maxW × maxH) pixels, ou null si elle n'a pas pu être chargée */
function crepsImgRun(D, url, maxW, maxH) {
  const im = CREPS_IMGS[url];
  if (!im) return null;
  const k = Math.min(maxW / im.w, maxH / im.h, 1);
  return new D.ImageRun({
    type: "png",
    data: im.data,
    transformation: { width: Math.round(im.w * k), height: Math.round(im.h * k) },
  });
}
