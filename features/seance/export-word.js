/* Export Word de la fiche de séance (bibliothèque docx chargée à la demande) */
/* ===== Export Word (reprend le modèle de fiche de séance) ===== */
function loadDocx() {
  return new Promise((ok, ko) => {
    if (window.docx) return ok();
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/docx@9.7.1/dist/index.iife.js";
    s.onload = () => (window.docx ? ok() : ko());
    s.onerror = ko;
    document.head.appendChild(s);
  });
}
function buildSeanceDoc(logo) {
  const D = window.docx;
  const {
    Document,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    AlignmentType,
    WidthType,
    ShadingType,
    BorderStyle,
    VerticalAlign,
    PageOrientation,
    TableLayoutType,
  } = D;
  const FONT = "Calibri",
    CW = 15838,
    BLUE = "3A8FB0",
    ORG = "E8662F",
    NAVY = "1E2630",
    V = VerticalAlign.CENTER;
  const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    NOB = { top: NONE, bottom: NONE, left: NONE, right: NONE };
  const bd = (c, s = 6) => ({ style: BorderStyle.SINGLE, size: s, color: c }),
    sh = f => ({ type: ShadingType.CLEAR, fill: f, color: "auto" });
  const R = (t, o = {}) =>
    new TextRun({
      text: String(t).replace(/'/g, "’"),
      font: FONT,
      size: o.size || 18,
      bold: o.b,
      italics: o.i,
      color: o.c || "2B2F36",
    });
  const ph = (t, s = 18) => R(t, { i: true, c: "8A93A3", size: s });
  const P = (ch, o = {}) =>
    new Paragraph({
      children: Array.isArray(ch) ? ch : [ch],
      alignment: o.al,
      spacing: { before: 0, after: o.af || 0, line: 252 },
    });
  const cell = (ch, o = {}) =>
    new TableCell({
      children: ch,
      width: { size: o.w, type: WidthType.DXA },
      columnSpan: o.span,
      shading: o.f ? sh(o.f) : undefined,
      verticalAlign: o.va,
      margins: o.m || { top: 60, bottom: 60, left: 120, right: 120 },
      borders: o.b || NOB,
    });
  const tbl = (rows, w) =>
    new Table({
      rows,
      width: { size: w.reduce((a, b) => a + b, 0), type: WidthType.DXA },
      columnWidths: w,
      layout: TableLayoutType.FIXED,
      borders: {
        top: NONE,
        bottom: NONE,
        left: NONE,
        right: NONE,
        insideHorizontal: NONE,
        insideVertical: NONE,
      },
    });
  const row = (c, h) => new TableRow({ children: c, cantSplit: true, tableHeader: h });
  const sp = () =>
    new Paragraph({
      spacing: { before: 0, after: 0, line: 100, lineRule: D.LineRuleType.EXACT },
      children: [new TextRun({ text: "", size: 2 })],
    });
  const M = seModel(),
    S = SMETA,
    two = M.two;
  const out = [];
  const txt = (t, p) => (t ? R(t, { c: "FFFFFF" }) : R(p, { i: true, c: "C9D1DE" }));
  const gris = t => R(t, { c: "C9D1DE" });
  const colonnes = [];
  if (logo)
    colonnes.push({
      w: 2000,
      body: [
        new Paragraph({
          children: [
            new D.ImageRun({
              type: logo.type,
              data: logo.data,
              transformation: { width: logo.w, height: logo.h },
            }),
          ],
        }),
      ],
    });
  const l1 = [];
  if (S.titre) l1.push(R(S.titre, { b: true, c: "FFFFFF", size: 26 }));
  if (S.periode) l1.push(R((S.titre ? "  " : "") + S.periode, { c: "C9D1DE", size: 22 }));
  const lignesMain = [];
  if (l1.length) lignesMain.push(P(l1));
  if (S.theme) lignesMain.push(P([R("Thème : ", { b: true, c: "FFFFFF" }), gris(S.theme)]));
  if (S.educ) lignesMain.push(P([R("Éducateurs : ", { b: true, c: "FFFFFF" }), gris(S.educ)]));
  const reste = CW - (logo ? 2000 : 0) - 2500 - (S.objectif ? 4000 : 0) - (S.dates ? 1900 : 0);
  if (lignesMain.length) colonnes.push({ w: reste, body: lignesMain, main: true });
  if (S.objectif)
    colonnes.push({
      w: 4000,
      body: [P([R("Objectif général : ", { b: true, c: "FFFFFF" }), gris(S.objectif)])],
    });
  if (S.dates)
    colonnes.push({
      w: 1900,
      body: [P([R("Dates : ", { c: "FFFFFF" }), gris(S.dates)], { al: AlignmentType.CENTER })],
    });
  colonnes.push({
    w: 2500,
    body: [
      P([
        R("■ ", { c: BLUE, b: true }),
        R((S.g1 || "Groupe 1") + " – " + M.tot1 + " min", { c: "FFFFFF", size: 17 }),
      ]),
      ...(two
        ? [
            P([
              R("■ ", { c: ORG, b: true }),
              R((S.g2 || "Groupe 2") + " – " + M.tot2 + " min", { c: "FFFFFF", size: 17 }),
            ]),
          ]
        : []),
    ],
  });
  /* si la colonne principale est absente, son espace est rendu à la dernière colonne */
  if (!lignesMain.length) colonnes[colonnes.length - 1].w += reste;
  const W = colonnes.map(c => c.w);
  out.push(
    tbl(
      [
        row(
          colonnes.map((c, i) =>
            cell(c.body, {
              w: c.w,
              f: NAVY,
              va: V,
              m: i === 0 ? { top: 110, bottom: 110, left: 200, right: 140 } : undefined,
            })
          )
        ),
      ],
      W
    )
  );
  out.push(sp());
  const tg = (d1, d2, g = "both") => {
    const a = [];
    if (g !== "2") a.push({ t: d1 + "'", c: BLUE });
    if (two && g !== "1") a.push({ t: d2 + "'", c: ORG });
    return a;
  };
  const band = (tags, title, fill, tcol) => {
    const m = { top: 30, bottom: 30, left: 40, right: 40 };
    const ws = [...tags.map(() => 700), CW - 700 * tags.length];
    const cs = tags.map((x, i) =>
      cell([P([R(x.t, { b: true, c: "FFFFFF" })], { al: AlignmentType.CENTER })], {
        w: 700,
        f: x.c,
        va: V,
        m,
      })
    );
    cs.push(
      cell([P([R(title, { b: true, c: tcol, size: 17 })])], {
        w: ws[ws.length - 1],
        f: fill,
        va: V,
        m: { top: 30, bottom: 30, left: 140, right: 100 },
      })
    );
    return [tbl([row(cs)], ws), sp()];
  };
  out.push(...band(tg(S.acc1 || 0, S.acc2 || 0), "ACCUEIL", "FDF3D3", "8A6D12"));
  if (M.ech.on) {
    out.push(
      ...band(
        tg(M.ech.d1 || 0, M.ech.d2 || 0),
        "ÉCHAUFFEMENT" + (M.ech.nom ? " — " + M.ech.nom : ""),
        "E6F2E6",
        "2E6F3E"
      )
    );
    const L = String(M.ech.txt || "")
      .split("\n")
      .map(l => l.replace(/^\s*[•\-–▸]\s*/, "").trim())
      .filter(Boolean);
    (L.length ? L : [null]).forEach(l =>
      out.push(
        P(
          [
            R("▸ ", { c: BLUE, b: true, size: 18 }),
            l ? R(l, { size: 18 }) : ph("[Décrire le déroulé : qui fait quoi, combien de temps]"),
          ],
          { af: 30 }
        )
      )
    );
    out.push(sp());
  }
  out.push(...band(tg(M.c1, M.c2), "CORPS DE SÉANCE", "E3EEF8", "2B5A9E"));
  const T = [7600, 2700, 2700, CW - 13000];
  const hd = (t, c, f, w) =>
    cell([P([R(t, { b: true, c, size: 16 })])], {
      w,
      f,
      m: { top: 50, bottom: 50, left: 140, right: 100 },
      b: { bottom: bd("D5DAE5") },
    });
  const lines = t =>
    String(t || "")
      .split(/\n/)
      .map(l => l.replace(/^\s*[•\-–]\s*/, "").trim())
      .filter(Boolean);
  if (M.subs.length) {
    const rows = [
      row(
        [
          hd("EXERCICE / DÉFI / JEU", "E3EEF8", "2B5A9E", T[0]),
          hd("PLUS DIFFICILE (+)", "B2543A", "FBE6E4", T[1]),
          hd("PLUS FACILE (–)", "2E6F3E", "E6F2E8", T[2]),
          hd("CRITÈRES DE RÉUSSITE", "B2263A", "FBE6E4", T[3]),
        ],
        true
      ),
    ];
    let n = 0;
    const bm = (t, c, sg) => {
      const L = lines(t);
      return L.length
        ? L.map(l => P([R(sg + " ", { c, b: true }), R(l, { size: 17 })], { af: 20 }))
        : [P([ph("—")])];
    };
    M.subs.forEach((s, k) => {
      const runs = [];
      tg(s.d1 || 0, s.d2 || 0, s.g).forEach(x => {
        runs.push(
          new TextRun({
            text: "\u00A0" + x.t + "\u00A0",
            font: FONT,
            size: 17,
            bold: true,
            color: x.c,
            shading: { type: ShadingType.CLEAR, fill: "FFFFFF", color: "auto" },
            border: { style: BorderStyle.SINGLE, size: 4, color: x.c, space: 0 },
          }),
          R("  ")
        );
      });
      rows.push(
        row([
          cell(
            [
              P([
                ...runs,
                R(s.titre || "Sous-section " + (k + 1), { b: true, c: "5B4BA8", size: 17 }),
                ...(two && s.g !== "both"
                  ? [
                      R("  · " + (s.g === "1" ? S.g1 : S.g2) + " seulement", {
                        c: "5B4BA8",
                        size: 16,
                      }),
                    ]
                  : []),
              ]),
            ],
            { w: T[0], f: "ECE7F8", m: { top: 40, bottom: 40, left: 140, right: 100 } }
          ),
          cell([P([R("")])], { w: T[1], f: "FDF3F2" }),
          cell([P([R("")])], { w: T[2], f: "F1F8F2" }),
          cell([P([R("")])], { w: T[3], f: "FDF3F2" }),
        ])
      );
      s.views.forEach(x => {
        const v = x.v;
        if (!x.same) n++;
        const main = x.same
          ? [
              ...x.steps.map(l =>
                P([R("▸ ", { c: BLUE, b: true }), R(l, { size: 17 })], { af: 20 })
              ),
            ]
          : [
              P(
                [
                  R("▸ ", { c: BLUE, b: true }),
                  ...(v.url
                    ? [
                        new D.ExternalHyperlink({
                          link: v.url,
                          children: [R(n + ". " + x.name, { b: true, c: "2B5A9E" })],
                        }),
                      ]
                    : [R(n + ". " + x.name, { b: true })]),
                  ...(v.code ? [R("  (" + v.code + ")", { c: "6B7280", size: 16 })] : []),
                ],
                { af: 30 }
              ),
              ...String(v.desc || "")
                .split("\n")
                .filter(Boolean)
                .map(l => P([R(l, { size: 17 })], { af: 30 })),
            ];
        if (v.meta || (x.same && v.code))
          main.push(
            P([
              ...(x.same && v.code
                ? [
                    new D.ExternalHyperlink({
                      link: v.url,
                      children: [R("Fiche " + v.code + " ↗", { c: "2B5A9E", size: 16 })],
                    }),
                    R(" · ", { i: true, c: "6B7280", size: 16 }),
                  ]
                : []),
              R(v.meta || "", { i: true, c: "6B7280", size: 16 }),
            ])
          );
        const cr = lines(v.crit);
        rows.push(
          row([
            cell(main, { w: T[0], b: { bottom: bd("D5DAE5") } }),
            cell(bm(v.plus, ORG, "+"), { w: T[1], f: "FDF3F2", b: { bottom: bd("D5DAE5") } }),
            cell(bm(v.moins, "2E6F3E", "–"), { w: T[2], f: "F1F8F2", b: { bottom: bd("D5DAE5") } }),
            cell(
              cr.length
                ? cr.map(l =>
                    P([R("✓ ", { c: "2E6F3E", b: true }), R(l, { size: 17 })], { af: 30 })
                  )
                : [
                    P([R("✓ ", { c: "2E6F3E", b: true }), ph("[critère observable]")], { af: 60 }),
                    P([R("✓ ", { c: "2E6F3E", b: true }), ph("[critère observable]")]),
                  ],
              {
                w: T[3],
                f: "FDF3F2",
                m: { top: 60, bottom: 60, left: 120, right: 100 },
                va: VerticalAlign.TOP,
              }
            ),
          ])
        );
      });
    });
    out.push(tbl(rows, T));
    out.push(sp());
  }
  const F = [4600, 3800, 3300, CW - 11700];
  const fc = (t, body, w) =>
    cell([P([R(t, { b: true, c: "2B2F36", size: 16 })], { af: 30 }), ...body], {
      w,
      f: "F2F3F5",
      b: { left: bd("FFFFFF", 8) },
      m: { top: 70, bottom: 80, left: 140, right: 120 },
      va: VerticalAlign.TOP,
    });
  const ml = (t, p) =>
    t
      ? String(t)
          .split("\n")
          .map(l => P([R(l, { size: 17 })]))
      : [P([ph(p)])];
  out.push(
    tbl(
      [
        row([
          fc("OBJECTIF COLLECTIF", ml(S.objCol, "[ce que le groupe doit réussir]"), F[0]),
          fc(
            "MATÉRIEL",
            M.mats.length
              ? M.mats.map(m =>
                  P(
                    [
                      R("☐ " + capf(m.t), { size: 17 }),
                      R("  " + m.c.join(", "), { c: "8A93A3", size: 15 }),
                    ],
                    { af: 10 }
                  )
                )
              : [P([R("Aucun matériel particulier.", { size: 17 })])],
            F[1]
          ),
          fc("SÉCURITÉ", ml(S.secu, "[rappels : hauteur, tapis, pas de saut…]"), F[2]),
          fc(
            "RETOUR AU CALME",
            [
              P([
                R((S.g1 || "Groupe 1") + " : ", { b: true, c: BLUE }),
                S.rc1 ? R(S.rc1) : ph("[étirements, bilan…]"),
              ]),
              ...(two
                ? [
                    P([
                      R((S.g2 || "Groupe 2") + " : ", { b: true, c: ORG }),
                      S.rc2 ? R(S.rc2) : ph("[étirements, bilan…]"),
                    ]),
                  ]
                : []),
            ],
            F[3]
          ),
        ]),
      ],
      F
    )
  );
  return new Document({
    creator: "Base de données des jeux d'escalade",
    title: S.titre || "Ma séance",
    styles: { default: { document: { run: { font: FONT, size: 18 } } } },
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
/* lit un logo (adresse de données) : octets, type et taille d'affichage (hauteur 50 px) */
function logoInfo(dataUrl) {
  return new Promise(ok => {
    if (!dataUrl) return ok(null);
    const img = new Image();
    img.onload = () => {
      const h = 50,
        w = Math.max(10, Math.round((img.naturalWidth / img.naturalHeight) * h));
      const bin = atob(dataUrl.split(",")[1]),
        data = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i);
      ok({ data, type: /image\/png/.test(dataUrl) ? "png" : "jpg", w: Math.min(w, 160), h });
    };
    img.onerror = () => ok(null);
    img.src = dataUrl;
  });
}
/* rec : séance de la bibliothèque {meta, se} ; sinon la séance en cours */
async function seanceWord(rec) {
  const m = $("#sMsg");
  const msg = t => {
    if (m) m.textContent = t;
  };
  try {
    msg("Création du fichier…");
    await loadDocx();
    const meta = rec ? rec.meta : SMETA;
    const logo = await logoInfo(meta.logo);
    const doc = rec
      ? withSeance(rec.meta, rec.se, () => buildSeanceDoc(logo))
      : buildSeanceDoc(logo);
    const blob = await window.docx.Packer.toBlob(doc);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download =
      ((meta.titre || "Ma-seance").replace(/[^\wàâäçéèêëîïôöùûüÀÉÈ\- ]/g, "").trim() ||
        "Ma-seance") + ".docx";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
    msg(
      "Fichier Word téléchargé. Déposez-le dans votre Drive : clic droit › Ouvrir avec Google Docs."
    );
  } catch (e) {
    msg(
      "Création impossible (connexion internet nécessaire). Utilisez « Copier le texte » ou « Imprimer / PDF »."
    );
  }
}
