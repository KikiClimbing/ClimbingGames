/* Mon cycle de formation : tableau de planification, séances prises dans la bibliothèque, enregistrement, impression, Word.
   Stockage : même onglet « Séances » de la feuille que les séances, avec un identifiant qui commence par « cy ». */
const CY_LS = "monCycle";
let CY = null,
  CYUID = 1,
  CYPICK = false,
  CYQ = "";
const cyNew = () => ({
  titre: "",
  groupe: "",
  periode: "",
  lieu: "",
  educ: "",
  objectif: "",
  lignes: [],
  bilan: "",
});
function cyLoad() {
  try {
    CY = JSON.parse(localStorage.getItem(CY_LS) || "null");
  } catch (e) {
    CY = null;
  }
  if (!CY || !Array.isArray(CY.lignes)) CY = cyNew();
  CYUID = CY.lignes.reduce((a, l) => Math.max(a, l.id || 0), 0) + 1;
  CY.lignes.forEach(l => {
    if (!l.id) l.id = CYUID++;
  });
}
const cySave = () => {
  try {
    localStorage.setItem(CY_LS, JSON.stringify(CY));
  } catch (e) {}
};
cyLoad();
/* codes des jeux de la bibliothèque utilisés dans une séance enregistrée */
function cyJeuxDe(d) {
  const codes = [];
  ((d && d.se && d.se.subs) || []).forEach(s =>
    s.items.forEach(i => {
      if (i.t !== "lib") return;
      const g = DATA.find(x => key(x) === i.k);
      const c = g ? g.Code || g.Titre : i.k;
      if (!codes.includes(c)) codes.push(c);
    })
  );
  return codes.join(", ");
}
function cyLigneDe(rec) {
  const d = sbParse(rec),
    m = (d && d.meta) || {};
  return {
    id: CYUID++,
    sid: rec.id,
    titre: m.titre || rec.titre || "Séance",
    dates: m.dates || rec.dates || "",
    theme: m.theme || rec.theme || "",
    objectif: m.objectif || "",
    jeux: cyJeuxDe(d),
    notes: "",
  };
}
const cyCodeCouleur = c => {
  const g = DATA.find(x => x.Code === c);
  return ((g && FAMS[g.Famille]) || { d: "#5B6577" }).d;
};
/* feuille imprimable (aussi utilisée comme aperçu) */
function cycleSheetHTML(cy) {
  const ph = t => `<i style="color:#8A93A3">${t}</i>`;
  const v = (x, p) => (x ? esc(x) : ph(p));
  const meta = [
    cy.groupe ? `<b>Public :</b> ${esc(cy.groupe)}` : "",
    cy.lieu ? `<b>Lieu :</b> ${esc(cy.lieu)}` : "",
    cy.educ ? `<b>Éducateurs :</b> ${esc(cy.educ)}` : "",
  ]
    .filter(Boolean)
    .join(" &nbsp;·&nbsp; ");
  const jeux = s =>
    String(s || "")
      .split(/[,;]\s*/)
      .filter(Boolean)
      .map(
        c =>
          `<span style="display:inline-block;background:${cyCodeCouleur(c)};color:#fff;font-weight:700;padding:1px 7px;border-radius:9px;margin:1px 2px 1px 0;font-size:11px">${esc(c)}</span>`
      )
      .join("");
  const th = t =>
    `<th style="background:${C1};color:#fff;text-align:left;padding:6px 8px;font-size:11px;letter-spacing:.5px">${t}</th>`;
  const rows = cy.lignes
    .map(
      (l, i) =>
        `<tr style="background:${i % 2 ? "#F4F7FB" : "#fff"}"><td style="padding:6px 8px;font-weight:700;text-align:center;color:${C2}">${i + 1}</td><td style="padding:6px 8px;font-weight:700">${v(l.titre, "—")}</td><td style="padding:6px 8px">${esc(l.dates)}</td><td style="padding:6px 8px">${esc(l.theme)}</td><td style="padding:6px 8px;white-space:pre-wrap">${esc(l.objectif)}</td><td style="padding:6px 8px">${jeux(l.jeux)}</td><td style="padding:6px 8px;white-space:pre-wrap">${esc(l.notes)}</td></tr>`
    )
    .join("");
  return `<div id="sheet" style="background:#fff;font-size:12.5px;line-height:1.4;color:#2B2F36">
  <div style="background:${NAVYC};color:#fff;padding:12px 18px"><div><b style="font-size:20px">${esc(cy.titre) || ph("Titre du cycle")}</b>${cy.periode ? ` <span style="color:#C9D1DE;font-size:14px">&nbsp;${esc(cy.periode)}</span>` : ""}</div>${meta ? `<div style="color:#C9D1DE;margin-top:4px">${meta}</div>` : ""}</div>
  ${cy.objectif ? `<div style="background:#E4EEFB;border-left:6px solid ${C1};padding:8px 14px;margin-top:8px"><b>Objectif général :</b> <span style="white-space:pre-wrap">${esc(cy.objectif)}</span></div>` : ""}
  <table style="width:100%;border-collapse:collapse;margin-top:8px"><thead><tr>${th("N°")}${th("SÉANCE")}${th("DATE(S)")}${th("THÈME")}${th("OBJECTIF")}${th("JEUX (CODES)")}${th("REMARQUES")}</tr></thead><tbody>${rows || `<tr><td colspan="7" style="padding:12px;text-align:center">${ph("Aucune séance pour le moment")}</td></tr>`}</tbody></table>
  <div style="border-top:4px solid ${C2};background:#FDEBE3;padding:8px 14px;margin-top:10px"><b style="color:#B2543A;letter-spacing:1px;font-size:11px">BILAN DU CYCLE</b><div style="white-space:pre-wrap;min-height:40px">${cy.bilan ? esc(cy.bilan) : ph("À compléter à la fin du cycle")}</div></div></div>`;
}
function cyBtn(a, t, bg, col = "#fff", extra = "") {
  return `<a class="btn" data-cya="${a}" style="background:${bg};color:${col};border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block;${extra}">${t}</a>`;
}
function cyPicker() {
  const q = norm(CYQ);
  const dans = new Set(CY.lignes.map(l => l.sid));
  const L = sbAll().filter(
    r => !q || norm([r.titre, r.theme, r.dates, r.objectif].join(" ")).includes(q)
  );
  return `<div class="box" style="background:#F7F9FD"><b>Séances de la bibliothèque</b> <a class="chip" data-cya="pickoff" style="cursor:pointer;float:right">Fermer</a>
  <input class="search" id="cyq" type="search" placeholder="Rechercher une séance…" value="${esc(CYQ)}" style="max-width:360px;display:block;margin:8px 0">
  <div style="max-height:280px;overflow:auto">${
    L.map(r => {
      return `<div style="display:flex;gap:10px;align-items:center;padding:6px 4px;border-top:1px solid #E3E8F2"><div style="flex:1"><b>${esc(r.titre || "Séance")}</b><div style="font-size:13px;color:#6B7280">${esc([r.dates, r.theme].filter(Boolean).join(" · "))}</div></div>${dans.has(r.id) ? '<span style="color:#2E7D4F;font-size:13px">✓ déjà dans le cycle</span>' : `<a class="chip" data-cya="pick" data-id="${esc(r.id)}" style="cursor:pointer">+ Ajouter</a>`}</div>`;
    }).join("") ||
    '<div style="color:#6B7280">Aucune séance enregistrée. Créez-en dans « Ma séance » puis « Enregistrer dans la bibliothèque ».</div>'
  }</div></div>`;
}
function cycleView() {
  const head = gsec(
    "Mon cycle de formation",
    "Planifiez un cycle : ajoutez les séances de la bibliothèque, complétez le tableau, enregistrez et exportez."
  );
  const inp = (k, lab, ph = "") =>
    `<label class="sml">${lab}<input data-cy="${k}" value="${esc(CY[k])}" placeholder="${esc(ph)}"></label>`;
  const nl = CY.lignes.length;
  const ligne = (l, i) =>
    `<div class="cyl"><div class="cyn">${i + 1}</div><div class="cyg">
    <label class="sml">Séance<input data-cyl="${l.id}:titre" value="${esc(l.titre)}"></label>
    <label class="sml">Date(s)<input data-cyl="${l.id}:dates" value="${esc(l.dates)}"></label>
    <label class="sml">Thème<input data-cyl="${l.id}:theme" value="${esc(l.theme)}"></label>
    <label class="sml">Jeux (codes)<input data-cyl="${l.id}:jeux" value="${esc(l.jeux)}" placeholder="E4, D11"></label>
    <label class="sml" style="grid-column:1/-1">Objectif<textarea rows="2" data-cyl="${l.id}:objectif">${esc(l.objectif)}</textarea></label>
    <label class="sml" style="grid-column:1/-1">Remarques / bilan de la séance<textarea rows="2" data-cyl="${l.id}:notes">${esc(l.notes)}</textarea></label></div>
    <div class="cyb">${i > 0 ? `<a class="chip" data-cya="up" data-id="${l.id}" title="Monter">↑</a>` : ""}${i < nl - 1 ? `<a class="chip" data-cya="down" data-id="${l.id}" title="Descendre">↓</a>` : ""}${l.sid ? `<a class="chip" data-cya="sync" data-id="${l.id}" title="Recharger depuis la séance de la bibliothèque">↻</a>` : ""}<a class="chip" data-cya="del" data-id="${l.id}" title="Retirer" style="color:#B2263A">✕</a></div></div>`;
  return `${head}<div class="tools noprint">${cyBtn("save", "Enregistrer dans la bibliothèque", "#2E7D4F")}${cyBtn("print", "Imprimer / PDF", "#26364D")}${cyBtn("word", "Télécharger en Word", "#2B5A9E")}${cyBtn("new", "Nouveau cycle", "#EEF1F8", "#26364D")}<span id="cyMsg" style="font-weight:700;color:#2E7D4F"></span></div>
  <div class="box noprint"><div class="smg">${inp("titre", "Titre du cycle", "Ex. Cycle 1 — Découverte")}${inp("periode", "Période", "Ex. sept. – déc. 2026")}${inp("groupe", "Public", "Ex. enfants 8-11 ans")}${inp("lieu", "Lieu", "Ex. Bloc Party, Mougins")}${inp("educ", "Éducateurs")}
  <label class="sml" style="grid-column:1/-1">Objectif général<textarea rows="2" data-cy="objectif">${esc(CY.objectif)}</textarea></label></div></div>
  <div class="box noprint"><b>Séances du cycle</b> <span style="color:#6B7280;font-size:13px">(${nl})</span>
  <div class="tools" style="margin:8px 0">${cyBtn("picker", "+ Ajouter une séance de la bibliothèque", "#3A8FB0")}${cyBtn("blank", "+ Ligne vide", "#EEF1F8", "#26364D")}</div>
  ${CYPICK ? cyPicker() : ""}${CY.lignes.map(ligne).join("") || '<div class="empty">Aucune séance. Ajoutez-en depuis la bibliothèque, ou créez une ligne vide.</div>'}
  <label class="sml" style="margin-top:10px">Bilan du cycle<textarea rows="3" data-cy="bilan">${esc(CY.bilan)}</textarea></label></div>
  <p class="noprint" style="color:#6B7280;font-size:13px;margin:12px 0 4px">APERÇU (c'est ce qui sera imprimé ou exporté)</p>
  ${cycleSheetHTML(CY)}`;
}
function cyPreview() {
  const s = $("#sheet");
  if (s) s.outerHTML = cycleSheetHTML(CY);
}
const cyMsg = t => {
  const m = $("#cyMsg");
  if (m) m.textContent = t;
};
async function cyEnregistrer() {
  if (compteRequis()) return;
  if (!CY.titre.trim()) {
    cyMsg("Donnez un titre au cycle.");
    return;
  }
  if (!CY.id) CY.id = "cy" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const data = JSON.stringify({ cycle: CY });
  if (data.length > 45000) {
    cyMsg("Cycle trop volumineux pour être enregistré.");
    return;
  }
  const rec = {
    id: CY.id,
    titre: CY.titre,
    theme: CY.groupe,
    educ: CY.educ,
    dates: CY.periode,
    nb: CY.lignes.length,
    objectif: CY.objectif || "",
    ts: new Date().toISOString(),
    data,
  };
  delete SB_DATA[rec.id];
  cySave();
  sbMemo(
    LS_DEL,
    sbSupprimees().filter(x => x !== rec.id)
  );
  const garde = sbLocal().filter(x => x.id !== rec.id);
  garde.push(rec);
  try {
    localStorage.setItem(LS_SB, JSON.stringify(garde));
  } catch (e) {}
  if (!CONFIG.GAME_ADD_URL) {
    cyMsg("Gardé dans ce navigateur seulement (GAME_ADD_URL non configuré).");
    return;
  }
  cyMsg("Enregistrement en cours…");
  try {
    await serveurSeance("seance", { seance: rec });
    if (compteOn()) await loadSeances();
    cyMsg("✓ Cycle enregistré dans la bibliothèque.");
  } catch (e) {
    cyMsg("Échec (" + e.message + "). Le cycle reste dans ce navigateur.");
  }
}
/* cycles enregistrés (mêmes enregistrements que les séances, identifiant « cy… ») */
function cyAll() {
  return sbTous()
    .filter(r => String(r.id).startsWith("cy"))
    .map(r => ({ rec: r }));
}
/* contenu complet d'un cycle (absent tant qu'il n'a pas été chargé) */
function cyData(rec) {
  try {
    return JSON.parse(rec.data).cycle || null;
  } catch (e) {
    return null;
  }
}
function cyListeHTML() {
  if (compteOn() && !AUTH.user) return compteInvite("pour voir et enregistrer vos cycles");
  const L = cyAll();
  const cel = t => `<td title="${esc(t)}">${esc(t)}</td>`;
  const rows = L.map(
    ({ rec }) =>
      `<tr class="r" data-go="cy/${esc(rec.id)}">${cel(rec.titre).replace("<td", '<td style="font-weight:700"')}${cel(rec.theme)}${cel(rec.dates)}${cel((+rec.nb || 0) + " séance" + (+rec.nb > 1 ? "s" : ""))}${compteOn() ? cel(compteMien(rec) ? "Moi" : rec.ownerNom || rec.owner) : ""}<td style="text-align:right">${compteMien(rec) ? `<a class="chip" data-cydel="${esc(rec.id)}" title="Supprimer ce cycle" style="cursor:pointer">🗑</a>` : ""}</td></tr>`
  ).join("");
  return `<p class="count">${L.length} cycle${L.length > 1 ? "s" : ""}</p>${L.length ? `<div style="overflow-x:auto"><table class="lst sbl"><thead><tr><th>CYCLE</th><th>PUBLIC</th><th>PÉRIODE</th><th>SÉANCES</th>${compteOn() ? "<th>PAR</th>" : ""}<th></th></tr></thead><tbody>${rows}</tbody></table></div>` : '<div class="empty">Aucun cycle enregistré. Créez-en un dans « Mon cycle ».</div>'}`;
}
async function cySupprimer(id) {
  const x = cyAll().find(c => c.rec.id === id);
  if (!confirm("Supprimer définitivement le cycle « " + ((x && x.rec.titre) || "") + " » ?"))
    return false;
  sbMemo(LS_DEL, [...sbSupprimees(), id]);
  sbMemo(
    LS_SB,
    sbLocal().filter(r => r.id !== id)
  );
  if (CY && CY.id === id) delete CY.id;
  cySave();
  if (CONFIG.GAME_ADD_URL) {
    try {
      await serveurSeance("seance_suppr", { id });
      toast("Cycle supprimé.");
    } catch (e) {
      toast("Supprimé ici, mais pas dans la feuille Google (" + e.message + ").");
    }
  } else toast("Cycle supprimé.");
  return true;
}
/* ---------- Word ---------- */
function buildCycleDoc(cy) {
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
  } = D;
  const FONT = "Calibri",
    BLUE = "3A8FB0",
    ORG = "E8662F",
    NAVY = "1E2630";
  const R = (t, o = {}) =>
    new TextRun({
      text: String(t).replace(/'/g, "’"),
      font: FONT,
      size: o.size || 18,
      bold: o.b,
      italics: o.i,
      color: o.c || "2B2F36",
    });
  const P = (ch, af = 0) =>
    new Paragraph({ children: Array.isArray(ch) ? ch : [ch], spacing: { before: 0, after: af } });
  const lines = (t, o) => {
    const a = String(t || "").split("\n");
    return a.map(x => P(R(x, o)));
  };
  const bd = c => ({ style: BorderStyle.SINGLE, size: 4, color: c });
  const B = { top: bd("D5DAE5"), bottom: bd("D5DAE5"), left: bd("D5DAE5"), right: bd("D5DAE5") };
  const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const cell = (ch, w, f, o = {}) =>
    new TableCell({
      children: ch,
      width: { size: w, type: WidthType.DXA },
      columnSpan: o.span,
      shading: f ? { type: ShadingType.CLEAR, fill: f, color: "auto" } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      borders: o.nb ? { top: NONE, bottom: NONE, left: NONE, right: NONE } : B,
    });
  const W = [500, 2900, 1500, 2300, 3600, 1800, 3238];
  const tot = W.reduce((a, b) => a + b, 0);
  const tbl = rows =>
    new Table({
      rows,
      width: { size: tot, type: WidthType.DXA },
      columnWidths: W,
      layout: TableLayoutType.FIXED,
    });
  const out = [];
  const meta = [
    cy.groupe && "Public : " + cy.groupe,
    cy.lieu && "Lieu : " + cy.lieu,
    cy.educ && "Éducateurs : " + cy.educ,
  ].filter(Boolean);
  out.push(
    tbl([
      new TableRow({
        children: [
          cell(
            [
              P([
                R(cy.titre || "Cycle de formation", { b: true, c: "FFFFFF", size: 30 }),
                R(cy.periode ? "   " + cy.periode : "", { c: "C9D1DE", size: 22 }),
              ]),
              ...(meta.length ? [P(R(meta.join("   ·   "), { c: "C9D1DE", size: 19 }))] : []),
            ],
            tot,
            NAVY,
            { span: 7, nb: true }
          ),
        ],
      }),
    ])
  );
  if (cy.objectif)
    out.push(
      P(R(""), 60),
      tbl([
        new TableRow({
          children: [
            cell([P([R("Objectif général : ", { b: true }), R(cy.objectif)])], tot, "E4EEFB", {
              span: 7,
              nb: true,
            }),
          ],
        }),
      ])
    );
  out.push(P(R(""), 60));
  const H = ["N°", "SÉANCE", "DATE(S)", "THÈME", "OBJECTIF", "JEUX (CODES)", "REMARQUES"];
  const rows = [
    new TableRow({
      tableHeader: true,
      children: H.map((h, i) => cell([P(R(h, { b: true, c: "FFFFFF", size: 17 }))], W[i], BLUE)),
    }),
    ...cy.lignes.map(
      (l, i) =>
        new TableRow({
          cantSplit: true,
          children: [
            cell([P(R(String(i + 1), { b: true, c: ORG }))], W[0], i % 2 ? "F4F7FB" : undefined),
            cell([P(R(l.titre || "", { b: true }))], W[1], i % 2 ? "F4F7FB" : undefined),
            cell(lines(l.dates), W[2], i % 2 ? "F4F7FB" : undefined),
            cell(lines(l.theme), W[3], i % 2 ? "F4F7FB" : undefined),
            cell(lines(l.objectif), W[4], i % 2 ? "F4F7FB" : undefined),
            cell(lines(l.jeux, { b: true, c: "2B5A9E" }), W[5], i % 2 ? "F4F7FB" : undefined),
            cell(lines(l.notes), W[6], i % 2 ? "F4F7FB" : undefined),
          ],
        })
    ),
  ];
  out.push(tbl(rows), P(R(""), 80));
  out.push(
    tbl([
      new TableRow({
        children: [
          cell(
            [
              P(R("BILAN DU CYCLE", { b: true, c: "B2543A", size: 17 })),
              ...(cy.bilan ? lines(cy.bilan) : [P(R(" "))]),
            ],
            tot,
            "FDEBE3",
            { span: 7 }
          ),
        ],
      }),
    ])
  );
  return new Document({
    creator: "Base de données des jeux d'escalade",
    title: cy.titre || "Cycle de formation",
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
async function cycleWord(cy, msg) {
  try {
    msg("Création du fichier…");
    await loadDocx();
    const blob = await window.docx.Packer.toBlob(buildCycleDoc(cy));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download =
      ((cy.titre || "Cycle").replace(/[^\wàâäçéèêëîïôöùûüÀÉÈ\- ]/g, "").trim() || "Cycle") +
      ".docx";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
    msg("Fichier Word téléchargé.");
  } catch (e) {
    msg("Création impossible (connexion internet nécessaire). Utilisez « Imprimer / PDF ».");
  }
}
/* ---------- pages ---------- */
registerNav({
  sec: "MES SÉANCES",
  secOrder: 30,
  order: 3.5,
  html: () =>
    navBtn(
      "cycle",
      `Mon cycle<span class="n">${CY.lignes.length || ""}</span>`,
      '<span class="ic">⟳</span>'
    ),
});
registerView({
  match: v => v === "cycle",
  html: () => cycleView(),
  bind: () => {
    document.querySelectorAll("[data-cy]").forEach(i =>
      i.addEventListener("input", () => {
        CY[i.dataset.cy] = i.value;
        cySave();
        cyPreview();
      })
    );
    document.querySelectorAll("[data-cyl]").forEach(i =>
      i.addEventListener("input", () => {
        const [id, k] = i.dataset.cyl.split(":");
        const l = CY.lignes.find(x => x.id === +id);
        if (l) l[k] = i.value;
        cySave();
        cyPreview();
      })
    );
    const q = $("#cyq");
    if (q)
      q.addEventListener("input", () => {
        CYQ = q.value;
        render();
        const n = $("#cyq");
        n.focus();
        n.setSelectionRange(n.value.length, n.value.length);
      });
  },
});
/* un cycle enregistré, en lecture */
let CYVU = null;
registerView({
  match: v => v.startsWith("cy/"),
  html: v => {
    const id = decodeURIComponent(v.slice(3));
    const x = cyAll().find(c => c.rec.id === id);
    const back = `<div class="tools noprint"><a class="chip" data-go="biblio" style="cursor:pointer" data-bt="cycles">← Bibliothèque</a></div>`;
    if (x && !x.rec.data && !SB_ECHEC[id]) {
      sbCharger(id)
        .then(() => VIEW.startsWith("cy/") && render())
        .catch(() => {
          SB_ECHEC[id] = 1;
          VIEW.startsWith("cy/") && render();
        });
      return back + `<div class="box">Chargement du cycle…</div>`;
    }
    const cy = x && cyData(x.rec);
    if (!cy) {
      CYVU = null;
      return back + `<div class="box">Ce cycle est introuvable ou illisible.</div>`;
    }
    x.cy = cy;
    CYVU = { id, cy };
    const mien = compteMien(x.rec);
    return `${back}<div class="tools noprint">${cyBtn("vprint", "Imprimer / PDF", "#26364D")}${cyBtn("vword", "Télécharger en Word", "#2B5A9E")}${cyBtn("vedit", mien ? "✎ Modifier ce cycle" : "Utiliser comme modèle (copie)", "#2E7D4F")}${mien ? cyBtn("vdel", "🗑 Supprimer", "#fff", "#B2263A", "border:1px solid #E8B4BC;") : ""}<span id="cyMsg" style="font-weight:700;color:#2E7D4F"></span></div>${partageBloc(x.rec)}${cycleSheetHTML(x.cy)}`;
  },
});
registerClick(e => {
  const d = e.target.closest("[data-cydel]");
  if (d) {
    cySupprimer(d.dataset.cydel).then(ok => ok && render());
    return true;
  }
  const b = e.target.closest("[data-cya]");
  if (!b) return;
  const a = b.dataset.cya,
    id = +b.dataset.id;
  const i = CY.lignes.findIndex(l => l.id === id);
  if (a === "vprint") imprimerSeance();
  else if (a === "vword") cycleWord(CYVU.cy, cyMsg);
  else if (a === "vdel") cySupprimer(CYVU.id).then(ok => ok && go("biblio"));
  else if (a === "vedit") {
    if (
      !confirm(
        "Ouvrir ce cycle dans « Mon cycle » ? Le contenu actuel de « Mon cycle » sera remplacé."
      )
    )
      return true;
    CY = JSON.parse(JSON.stringify(CYVU.cy));
    if (compteMien((cyAll().find(c => c.rec.id === CYVU.id) || {}).rec || {})) CY.id = CYVU.id;
    else delete CY.id;
    CYUID = CY.lignes.reduce((m, l) => Math.max(m, l.id || 0), 0) + 1;
    cySave();
    go("cycle");
  } else if (a === "print") imprimerSeance();
  else if (a === "word") cycleWord(CY, cyMsg);
  else if (a === "save") cyEnregistrer();
  else if (a === "new") {
    if (CY.lignes.length || CY.titre) {
      if (!confirm("Effacer le cycle en cours et recommencer ?")) return true;
    }
    CY = cyNew();
    CYPICK = false;
    cySave();
    render();
  } else if (a === "picker") {
    CYPICK = !CYPICK;
    render();
  } else if (a === "pickoff") {
    CYPICK = false;
    render();
  } else if (a === "pick") {
    sbCharger(b.dataset.id)
      .then(() => {
        const r = sbAll().find(x => x.id === b.dataset.id);
        if (r) CY.lignes.push(cyLigneDe(r));
        cySave();
        render();
      })
      .catch(err => toast("Séance illisible : " + err.message));
  } else if (a === "blank") {
    CY.lignes.push({
      id: CYUID++,
      sid: "",
      titre: "",
      dates: "",
      theme: "",
      objectif: "",
      jeux: "",
      notes: "",
    });
    cySave();
    render();
  } else if (a === "del" && i >= 0) {
    CY.lignes.splice(i, 1);
    cySave();
    render();
  } else if ((a === "up" && i > 0) || (a === "down" && i >= 0 && i < CY.lignes.length - 1)) {
    const j = a === "up" ? i - 1 : i + 1;
    [CY.lignes[i], CY.lignes[j]] = [CY.lignes[j], CY.lignes[i]];
    cySave();
    render();
  } else if (a === "sync" && i >= 0) {
    const sid = CY.lignes[i].sid,
      lid = CY.lignes[i].id;
    sbCharger(sid)
      .then(() => {
        const r = sbAll().find(x => x.id === sid);
        const j = CY.lignes.findIndex(l => l.id === lid);
        if (r && j >= 0) {
          CY.lignes[j] = { ...cyLigneDe(r), id: lid, notes: CY.lignes[j].notes };
          cySave();
          render();
        }
      })
      .catch(() => toast("Séance introuvable dans la bibliothèque."));
  }
  return true;
});
