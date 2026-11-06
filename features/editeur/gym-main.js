/* Main détaillée (prépa physique) : avant-bras, poignet, paume, 4 doigts à 3 phalanges et pouce.
   Deux vues :
   - « profil » : vue de côté, les doigts se plient dans le plan du dessin (crochet, demi-crochet, tenue ouverte, poing…),
                  flexion/extension du poignet ;
   - « dos »    : vue de dessus de la main à plat, écartement des doigts et inclinaison du poignet (radiale/ulnaire).
   Angles en degrés ; fg[i] = [articulation du métacarpe, 1re, 2e articulation du doigt] (pouce : trapèze-métacarpe, métacarpe, bout).
   Doigts : 0 index, 1 majeur, 2 annulaire, 3 auriculaire, 4 pouce. */
const MAIN_DOIGTS = ["Index", "Majeur", "Annulaire", "Auriculaire", "Pouce"];
const MAIN_L = [
  [2.3, 1.45, 1.15],
  [2.5, 1.6, 1.2],
  [2.3, 1.5, 1.15],
  [1.85, 1.15, 1.05],
  [2.0, 1.6, 1.3],
];
const MAIN_PRESETS = {
  plat: ["Main ouverte à plat", [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]],
  relevees: ["Doigts relevés (extension)", [[-30, 0, 0], [-30, 0, 0], [-30, 0, 0], [-30, 0, 0], [0, -10, -10]]],
  ouverte: ["Tenue ouverte (doigts peu fléchis)", [[10, 40, 15], [10, 40, 15], [10, 40, 15], [10, 40, 15], [10, 10, 10]]],
  demi: ["Demi-crochet", [[15, 90, 10], [15, 90, 10], [15, 90, 10], [15, 90, 10], [10, 15, 10]]],
  crochet: ["Crochet fermé (pouce par-dessus)", [[15, 105, -5], [15, 105, -5], [15, 105, -5], [15, 105, -5], [30, 40, 30]]],
  poing: ["Poing fermé", [[85, 100, 65], [85, 100, 65], [85, 100, 65], [85, 100, 65], [20, 35, 30]]],
  pince: ["Pince pouce-index", [[30, 45, 25], [70, 80, 45], [75, 85, 50], [80, 90, 55], [25, 35, 25]]],
  griffe: ["Doigts en crochet (phalanges fléchies)", [[0, 90, 70], [0, 90, 70], [0, 90, 70], [0, 90, 70], [10, 20, 20]]],
};
function mainFix(e) {
  if (!e.fg) e.fg = JSON.parse(JSON.stringify(MAIN_PRESETS.plat[1]));
  if (!e.sp) e.sp = [8, 0, -8, -16, 28];
  if (e.wr === undefined) e.wr = 0;
  if (e.dev === undefined) e.dev = 0;
  if (!e.view) e.view = "profil";
  return e;
}
function mainPreset(e, k) {
  const P = MAIN_PRESETS[k];
  if (!P) return e;
  e.fg = JSON.parse(JSON.stringify(P[1]));
  return e;
}
/* géométrie locale (y vers le haut, poignet en 0,0, avant-bras vers la gauche) : points des doigts, paume */
function mainGeo(e) {
  mainFix(e);
  const rad = a => (a * Math.PI) / 180,
    prof = e.view !== "dos",
    base = prof ? -rad(e.wr || 0) : rad(e.dev || 0),
    pal = 3.6,
    ph = [Math.cos(base) * pal, Math.sin(base) * pal],
    nx = -Math.sin(base),
    ny = Math.cos(base);
  const fing = [];
  for (let i = 0; i < 5; i++) {
    const f = e.fg[i],
      L = MAIN_L[i];
    let org, ang;
    if (prof) {
      org = i === 4 ? [ph[0] * 0.2, -0.5] : [ph[0], ph[1] - i * 0.1];
      ang = i === 4 ? base - rad(15) : base;
    } else {
      const off = [1.2, 0.4, -0.4, -1.2][i];
      org = i === 4 ? [ph[0] * 0.12 + nx * 1.7, ph[1] * 0.12 + ny * 1.7] : [ph[0] + nx * off, ph[1] + ny * off];
      ang = base + rad(i === 4 ? 7 + (e.sp[4] || 0) : e.sp[i] || 0);
    }
    const pts = [org],
      angs = [];
    let cum = 0;
    for (let k = 0; k < 3; k++) {
      let l = L[k];
      if (i === 4 && k === 0) l = 1.3; /* métacarpien du pouce : court, dans la paume */
      if (prof) ang -= rad(f[k] || 0);
      else {
        cum += f[k] || 0;
        l *= Math.max(0.18, Math.cos(rad(Math.min(cum, 85))));
      }
      angs.push(ang);
      const p0 = pts[k];
      pts.push([p0[0] + Math.cos(ang) * l, p0[1] + Math.sin(ang) * l]);
    }
    fing.push({ pts, angs, org });
  }
  return { prof, base, ph, nx, ny, fing };
}
/* passage entre coordonnées locales de la main et coordonnées du dessin */
function mainWorld(e, l) {
  const s = e.s || 1.6,
    side = e.side === -1 ? -1 : 1,
    r = ((e.rot || 0) * Math.PI) / 180,
    x = l[0] * side * s,
    y = l[1] * s;
  return [e.x + x * Math.cos(r) - y * Math.sin(r), e.y + x * Math.sin(r) + y * Math.cos(r)];
}
function mainLocal(e, p) {
  const s = e.s || 1.6,
    side = e.side === -1 ? -1 : 1,
    r = -((e.rot || 0) * Math.PI) / 180,
    dx = p[0] - e.x,
    dy = p[1] - e.y;
  return [((dx * Math.cos(r) - dy * Math.sin(r)) / s) * side, (dx * Math.sin(r) + dy * Math.cos(r)) / s];
}
/* points à glisser : poignet, puis articulations de chaque doigt */
function mainHandles(e) {
  const g = mainGeo(e),
    h = [{ k: "w", p: mainWorld(e, g.ph) }];
  const fs = e.fs === undefined ? 5 : e.fs;
  g.fing.forEach((f, i) => {
    if (i !== (fs === 5 ? 0 : fs)) return;
    for (let k = 0; k < 3; k++) if (g.prof || k === 2) h.push({ k: "m" + i + k, p: mainWorld(e, f.pts[k + 1]) });
  });
  return h.map(o => ({ k: o.k, x: o.p[0], y: o.p[1] }));
}
function mainDrag(e, h, p) {
  const l = mainLocal(e, p),
    g = mainGeo(e),
    clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  if (h === "w") {
    const a = (Math.atan2(l[1], l[0]) * 180) / Math.PI;
    if (g.prof) e.wr = Math.round(clamp(-a, -90, 90));
    else e.dev = Math.round(clamp(a, -40, 40));
    return;
  }
  const i = +h[1],
    k = +h[2],
    f = g.fing[i],
    o = f.pts[k],
    a = Math.atan2(l[1] - o[1], l[0] - o[0]);
  if (g.prof) {
    const prev = k ? f.angs[k - 1] : i === 4 ? g.base - (15 * Math.PI) / 180 : g.base;
    const v = Math.round(clamp(((prev - a) * 180) / Math.PI, -40, 110));
    if ((e.fs === undefined ? 5 : e.fs) === 5) for (let j = 0; j < 4; j++) e.fg[j][k] = v;
    else e.fg[i][k] = v;
  } else {
    const prev = i === 4 ? g.base + ((7 + (e.sp[4] || 0)) * Math.PI) / 180 : g.base;
    let d = ((a - g.base) * 180) / Math.PI;
    d = ((((d + 180) % 360) + 360) % 360) - 180;
    e.sp[i] = Math.round(clamp(i === 4 ? d - 7 : d, -40, 50));
  }
}
function mainSVG(e) {
  mainFix(e);
  const col = CN(e.c || "blue"),
    far = darken(col, 0.82),
    side = e.side === -1 ? -1 : 1,
    s = e.s || 1.6;
  const G = mainGeo(e),
    P = v => `${(+v[0]).toFixed(3)} ${(+v[1]).toFixed(3)}`;
  /* trait épais avec liseré blanc ; coordonnées locales, y vers le haut (le groupe est retourné) */
  const seg = (a, b, c, w, halo = true) => {
    const d = `M${P(a)}L${P(b)}`;
    return (halo ? `<path d="${d}" stroke="#fff" stroke-width="${w + 0.34}" stroke-linecap="round" fill="none"/>` : "") + `<path d="${d}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
  };
  const dot = (p, c) => `<circle cx="${p[0].toFixed(3)}" cy="${p[1].toFixed(3)}" r=".2" fill="#fff" stroke="${c}" stroke-width=".1"/>`;
  let o = "";
  const fw = [1.05, 0.8];
  o += `<path d="M-7 ${fw[0]}L0 ${fw[1]}L0 ${-fw[1]}L-7 ${-fw[0]}Z" fill="${col}" stroke="#fff" stroke-width=".3" stroke-linejoin="round"/>`;
  const ph = G.ph;
  if (G.prof) o += seg([0, 0], ph, col, 1.5);
  else {
    const q = [
      [G.nx * 1.55, G.ny * 1.55],
      [ph[0] + G.nx * 1.6, ph[1] + G.ny * 1.6],
      [ph[0] - G.nx * 1.6, ph[1] - G.ny * 1.6],
      [-G.nx * 1.1, -G.ny * 1.1],
    ];
    o += `<path d="M${q.map(P).join("L")}Z" fill="${col}" stroke="#fff" stroke-width=".3" stroke-linejoin="round"/>`;
  }
  o += dot([0, 0], "#fff");
  const W = [0.78, 0.7, 0.62];
  /* doigts du plus éloigné (auriculaire) à l'index ; le pouce en dernier (plus proche de l'observateur) */
  [3, 2, 1, 0, 4].forEach(i => {
    const pts = G.fing[i].pts,
      c = i === 4 ? col : i % 2 ? far : col,
      halo = !G.prof || i === 0 || i === 4;
    if (i === 4) {
      /* pouce : métacarpien (épais, dans la paume) puis 2 phalanges */
      o += seg(pts[0], pts[1], col, 1.15);
      o += seg(pts[1], pts[2], c, 0.86) + seg(pts[2], pts[3], c, 0.72);
      o += dot(pts[1], c) + dot(pts[2], c);
    } else {
      for (let k = 0; k < 3; k++) o += seg(pts[k], pts[k + 1], c, W[k], halo);
      if (halo) for (let k = 0; k < 3; k++) o += dot(pts[k], c);
    }
  });
  const lab = e.lab ? `<text x="0" y="${fw[0] + 1.2}" transform="scale(${side} -1)" font-size="1" text-anchor="middle" fill="${EINK}" font-family="Calibri,Carlito,Arial,sans-serif">${esc(e.lab)}</text>` : "";
  return `<g transform="translate(${e.x} ${EY(e.y)}) rotate(${-(e.rot || 0)}) scale(${side * s} ${-s})"><rect x="-7" y="-3" width="15" height="7" fill="transparent"/>${o}${lab}</g>`;
}
function mainPanelHTML(e) {
  mainFix(e);
  const COL = [
    ["blue", EBLUE, "bleu"],
    ["red", ERED, "rouge"],
    ["green", EGREEN, "vert"],
    ["amber", EAMB, "ambre"],
    ["ink", EINK, "noir"],
    ["grey", EGREY, "gris"],
  ];
  const sw = COL.map(
    ([v, c, l]) =>
      `<button class="swt ${(e.c || "blue") === v ? "on" : ""}" data-sw="c:${v}" title="${l}" style="background:${c}"></button>`
  ).join("");
  const rg = (l, k, mn, mx, st, v) =>
    `<label class="fl2">${l}<input type="range" min="${mn}" max="${mx}" step="${st}" value="${v}" data-rg="${k}"></label>`;
  const prof = e.view !== "dos";
  const fing = MAIN_DOIGTS.map(
    (n, i) =>
      `<details style="margin:4px 0"><summary style="cursor:pointer;font-weight:600">${n}</summary>` +
      (i === 4
        ? ["Base du pouce (métacarpien)", "1re phalange", "2e phalange (bout)"]
        : ["Articulation de la main (métacarpe)", "1re articulation du doigt", "2e articulation (bout)"])
        .map(
          (l, k) =>
            `<label class="fl2">${l}<input type="range" min="-40" max="110" step="1" value="${e.fg[i][k]}" data-mf="${i}:${k}"></label>`
        )
        .join("") +
      (prof ? "" : `<label class="fl2">Écartement<input type="range" min="-40" max="50" step="1" value="${e.sp[i]}" data-ms="${i}"></label>`) +
      `</details>`
  ).join("");
  return (
    `<div class="sws">${sw}</div>` +
    `<label class="fl2">Vue<select data-mview><option value="profil" ${prof ? "selected" : ""}>De côté (doigts qui se plient)</option><option value="dos" ${prof ? "" : "selected"}>De dessus (écartement, poignet)</option></select></label>` +
    `<label class="fl2">Position des doigts<select data-mpre><option value="">Choisir…</option>${Object.entries(MAIN_PRESETS)
      .map(([k, v]) => `<option value="${k}">${v[0]}</option>`)
      .join("")}</select></label>` +
    rg("Taille", "s", 0.6, 3.2, 0.05, e.s) +
    rg("Rotation de l'ensemble", "rot", -180, 180, 5, e.rot || 0) +
    (prof
      ? rg("Poignet (− extension / + flexion)", "wr", -90, 90, 1, e.wr || 0)
      : rg("Poignet (− ulnaire / + radiale)", "dev", -40, 40, 1, e.dev || 0)) +
    `<div class="rowb"><button class="chip" data-mside title="Main gauche / droite">↔ Retourner</button></div>` +
    `<div style="margin-top:6px"><b style="font-size:13px">Doigts à glisser sur le dessin</b><div class="rowb" style="flex-wrap:wrap;margin:4px 0">${[["5", "Les 4 doigts"], ...MAIN_DOIGTS.map((n, i) => [String(i), n])]
      .map(([v, n]) => `<button class="chip ${String(e.fs === undefined ? 5 : e.fs) === v ? "on" : ""}" data-mfs="${v}" style="${String(e.fs === undefined ? 5 : e.fs) === v ? "background:#26364D;color:#fff" : ""}">${n}</button>`)
      .join("")}</div></div>` +
    `<div style="margin-top:6px"><b style="font-size:13px">Doigt par doigt (curseurs)</b>${fing}</div>` +
    `<label class="fl2">Étiquette<input data-mlab value="${esc(e.lab || "")}" placeholder="Ex. : demi-crochet" maxlength="30"></label>` +
    `<p class="hint">Choisissez les doigts à régler, puis glissez leurs points sur la main (le point du poignet incline la main). 0° = doigt droit ; plus l'angle est grand, plus l'articulation se plie. Les angles négatifs étendent (hyperextension).</p>`
  );
}
function mainPanelBind(p, e) {
  const bd = (sel, fn, ev = "oninput") =>
    p.querySelectorAll(sel).forEach(i => {
      i.onpointerdown = () => edSnap();
      i[ev] = () => fn(i);
    });
  bd("[data-mf]", i => {
    const [a, b] = i.dataset.mf.split(":").map(Number);
    e.fg[a][b] = +i.value;
    edRender();
  });
  bd("[data-ms]", i => {
    e.sp[+i.dataset.ms] = +i.value;
    edRender();
  });
  p.querySelectorAll("[data-mfs]").forEach(b => {
    b.onclick = () => {
      e.fs = +b.dataset.mfs;
      edRender(true);
    };
  });
  const v = p.querySelector("[data-mview]");
  if (v)
    v.onchange = () => {
      edSnap();
      e.view = v.value;
      edRender(true);
    };
  const pr = p.querySelector("[data-mpre]");
  if (pr)
    pr.onchange = () => {
      if (!pr.value) return;
      edSnap();
      mainPreset(e, pr.value);
      edRender(true);
    };
  const sd = p.querySelector("[data-mside]");
  if (sd)
    sd.onclick = () => {
      edSnap();
      e.side = e.side === -1 ? 1 : -1;
      edRender(true);
    };
  const lb = p.querySelector("[data-mlab]");
  if (lb)
    lb.oninput = () => {
      e.lab = lb.value;
      edRender();
    };
}
Object.assign(EDP, { main: c => mainFix({ t: "main", x: 50, y: 18, s: 2.2, c: c || "blue", view: "profil" }) });
