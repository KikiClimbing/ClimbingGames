/* Éditeur de schémas — mode « Prépa physique » : personnage articulé et objets de salle de sport.
   Le personnage ("gym") est défini par ses articulations principales ; coudes et genoux sont calculés
   (os de longueur constante) et leur sens de pliure se règle dans le panneau. Coordonnées relatives
   à (x, y) = point au sol sous le bassin, en unités de taille (y vers le haut). */
const GYM = { TOR: 5.6, TH: 4.6, SH: 4.6, UA: 3.4, FA: 3.3, HEAD: 1.7, NECK: 2.5 };
/* poses : bassin, inclinaison du buste (° depuis la verticale, + = vers la droite), mains, pieds,
   sens de pliure des genoux (kp) et des coudes (ep), largeur d'épaules (sw) et de hanches (hw) pour la vue de face */
const GYMPOSES = {
  debout: {
    l: "Debout (de profil)",
    g: "Debout",
    hip: [0, 9.2],
    lean: 0,
    hands: [
      [0.6, 8.4],
      [-0.4, 8.4],
    ],
    feet: [
      [0.3, 0],
      [-0.3, 0],
    ],
    kp: [
      [1, 0],
      [1, 0],
    ],
    ep: [
      [-1, 0],
      [-1, 0],
    ],
  },
  face: {
    l: "Debout (de face)",
    g: "Debout",
    hip: [0, 9.2],
    lean: 0,
    sw: 2.4,
    hw: 1.3,
    hands: [
      [3.6, 8.2],
      [-3.6, 8.2],
    ],
    feet: [
      [1.8, 0],
      [-1.8, 0],
    ],
    kp: [
      [1, 0],
      [-1, 0],
    ],
    ep: [
      [1, 0],
      [-1, 0],
    ],
  },
  bras_devant: {
    l: "Bras tendus devant (de profil)",
    g: "Debout",
    hip: [0, 9.2],
    lean: 0,
    hands: [
      [6.4, 14.6],
      [6.2, 14.1],
    ],
    feet: [
      [0.3, 0],
      [-0.3, 0],
    ],
    kp: [
      [1, 0],
      [1, 0],
    ],
    ep: [
      [0, -1],
      [0, -1],
    ],
  },
  bras_haut: {
    l: "Bras en l'air (de profil)",
    g: "Debout",
    hip: [0, 9.2],
    lean: 0,
    hands: [
      [1, 21],
      [0, 21.2],
    ],
    feet: [
      [0.3, 0],
      [-0.3, 0],
    ],
    kp: [
      [1, 0],
      [1, 0],
    ],
    ep: [
      [-1, 0],
      [-1, 0],
    ],
  },
  t_face: {
    l: "Bras écartés en T (de face)",
    g: "Debout",
    hip: [0, 9.2],
    lean: 0,
    sw: 2.4,
    hw: 1.3,
    hands: [
      [9, 14.8],
      [-9, 14.8],
    ],
    feet: [
      [1.8, 0],
      [-1.8, 0],
    ],
    kp: [
      [1, 0],
      [-1, 0],
    ],
    ep: [
      [0, -1],
      [0, -1],
    ],
  },
  coude90_face: {
    l: "Coude à 90°, avant-bras vers l'intérieur (de face)",
    g: "Debout",
    hip: [0, 9.2],
    lean: 0,
    sw: 2.4,
    hw: 1.3,
    hands: [
      [-0.6, 11.5],
      [-3.6, 8.2],
    ],
    feet: [
      [1.8, 0],
      [-1.8, 0],
    ],
    kp: [
      [1, 0],
      [-1, 0],
    ],
    ep: [
      [1, -1],
      [-1, 0],
    ],
  },
  coude90_ext: {
    l: "Coude à 90°, avant-bras vers l'extérieur (de face)",
    g: "Debout",
    hip: [0, 9.2],
    lean: 0,
    sw: 2.4,
    hw: 1.3,
    hands: [
      [6.1, 11.5],
      [-3.6, 8.2],
    ],
    feet: [
      [1.8, 0],
      [-1.8, 0],
    ],
    kp: [
      [1, 0],
      [-1, 0],
    ],
    ep: [
      [1, -1],
      [-1, 0],
    ],
  },
  charniere: {
    l: "Penché, dos plat (charnière de hanche)",
    g: "Debout",
    hip: [-3.2, 9],
    lean: 62,
    hands: [
      [2.2, 5.6],
      [1.8, 5.6],
    ],
    feet: [
      [-0.6, 0],
      [-1, 0],
    ],
    kp: [
      [1, 0],
      [1, 0],
    ],
    ep: [
      [1, 0],
      [1, 0],
    ],
  },
  squat: {
    l: "Squat",
    g: "Debout",
    hip: [-2.6, 5.4],
    lean: 28,
    hands: [
      [5, 9.8],
      [4.7, 9.4],
    ],
    feet: [
      [1, 0],
      [0.6, 0],
    ],
    kp: [
      [1, 0.3],
      [1, 0.3],
    ],
    ep: [
      [0, -1],
      [0, -1],
    ],
  },
  fente: {
    l: "Fente (de profil)",
    g: "Debout",
    hip: [0.5, 6],
    lean: 0,
    hands: [
      [1.6, 6.8],
      [-0.4, 6.8],
    ],
    feet: [
      [4.2, 0],
      [-4.8, 0],
    ],
    kp: [
      [1, 0.2],
      [-0.3, -1],
    ],
    ep: [
      [-1, 0],
      [-1, 0],
    ],
  },
  assis: {
    l: "Assis sur une chaise",
    g: "Assis",
    hip: [-1.2, 5.4],
    lean: 4,
    hands: [
      [2.8, 6.6],
      [2.2, 6.4],
    ],
    feet: [
      [3.4, 0],
      [2.8, 0],
    ],
    kp: [
      [1, 0],
      [1, 0],
    ],
    ep: [
      [-1, 0],
      [-1, 0],
    ],
  },
  dos_genoux: {
    l: "Allongé sur le dos, genoux fléchis",
    g: "Au sol",
    hip: [0, 1.4],
    lean: 90,
    hq: 90,
    hands: [
      [-0.8, 0.5],
      [-1.6, 0.5],
    ],
    feet: [
      [-3.6, 0],
      [-4.2, 0],
    ],
    kp: [
      [0, 1],
      [0, 1],
    ],
    ep: [
      [0, 1],
      [0, 1],
    ],
  },
  pont: {
    l: "Pont fessier (bassin levé)",
    g: "Au sol",
    hip: [0, 5.2],
    lean: 133,
    hq: 90,
    hands: [
      [0.6, 0.4],
      [-0.2, 0.4],
    ],
    feet: [
      [-3.4, 0],
      [-4, 0],
    ],
    kp: [
      [0, 1],
      [0, 1],
    ],
    ep: [
      [0, 1],
      [0, 1],
    ],
  },
  ventre: {
    l: "Allongé sur le ventre, bras tendus",
    g: "Au sol",
    hip: [0, 1.6],
    lean: 90,
    hq: 90,
    hands: [
      [11.5, 1],
      [11.9, 0.6],
    ],
    feet: [
      [-8.9, 0.4],
      [-9, 0.4],
    ],
    kp: [
      [0, 1],
      [0, 1],
    ],
    ep: [
      [0, 1],
      [0, 1],
    ],
  },
  planche: {
    l: "Planche sur les avant-bras (gainage)",
    g: "Au sol",
    hip: [0, 2.4],
    lean: 77,
    hq: 80,
    hands: [
      [8.8, 0.3],
      [8.6, 0.3],
    ],
    feet: [
      [-8.9, 0.3],
      [-9, 0.3],
    ],
    kp: [
      [0, 1],
      [0, 1],
    ],
    ep: [
      [0, -1],
      [0, -1],
    ],
  },
  pompe: {
    l: "Planche bras tendus (position de pompe)",
    g: "Au sol",
    hip: [0, 4.5],
    lean: 63,
    hq: 63,
    hands: [
      [5.2, 0.3],
      [5, 0.3],
    ],
    feet: [
      [-8.2, 0.3],
      [-8.3, 0.3],
    ],
    kp: [
      [0, 1],
      [0, 1],
    ],
    ep: [
      [0, -1],
      [0, -1],
    ],
  },
  quatre: {
    l: "À quatre pattes",
    g: "Au sol",
    hip: [0, 5],
    lean: 80,
    hq: 75,
    hands: [
      [5.9, 0.2],
      [5.6, 0.2],
    ],
    feet: [
      [-4.6, 0.3],
      [-4.9, 0.3],
    ],
    kp: [
      [0.3, -1],
      [0.3, -1],
    ],
    ep: [
      [-1, 0],
      [-1, 0],
    ],
  },
};
const GYMNOMS = {
  gym: "Personnage (prépa physique)",
  main: "Main détaillée",
  dumbbell: "Haltère",
  bottle: "Bouteille d'eau",
  pullbar: "Barre de traction",
  chair: "Chaise",
  stick: "Bâton",
  anchor: "Point d'ancrage",
  wallv: "Mur",
  towel: "Serviette roulée",
};
function gymFix(e) {
  if (!e.hip) gymPose(e, e.pose || "debout");
  return e;
}
function gymPose(e, k) {
  const P = GYMPOSES[k] || GYMPOSES.debout,
    cp = v => JSON.parse(JSON.stringify(v));
  e.pose = k;
  e.hip = cp(P.hip);
  e.lean = P.lean;
  e.hq = P.hq;
  e.sw = P.sw || 0;
  e.hw = P.hw || 0;
  e.hands = cp(P.hands);
  e.feet = cp(P.feet);
  e.kp = cp(P.kp);
  e.ep = cp(P.ep);
  if (e.hq === undefined) delete e.hq;
  delete e.hdo;
  delete e.fa;
  delete e.cv;
  return e;
}
/* retourne le personnage (miroir gauche/droite) */
function gymFlip(e) {
  const fx = v => [-v[0], v[1]];
  e.hip = fx(e.hip);
  e.lean = -e.lean;
  if (e.hq !== undefined) e.hq = -e.hq;
  e.hands = e.hands.map(fx);
  e.feet = e.feet.map(fx);
  e.kp = e.kp.map(fx);
  e.ep = e.ep.map(fx);
  if (e.fa) e.fa = e.fa.map(v => -v);
  if (e.cv) e.cv = -e.cv;
}
/* deux os (r → t) : renvoie l'articulation (coude, genou) du côté de la préférence pref */
function ik2(r, t, l1, l2, pref) {
  const dx = t[0] - r[0],
    dy = t[1] - r[1],
    d = Math.hypot(dx, dy) || 0.001,
    ux = dx / d,
    uy = dy / d;
  if (d >= (l1 + l2) * 0.999) return [r[0] + ux * l1, r[1] + uy * l1];
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d),
    h = Math.sqrt(Math.max(0, l1 * l1 - a * a)),
    bx = r[0] + ux * a,
    by = r[1] + uy * a;
  const c1 = [bx - uy * h, by + ux * h],
    c2 = [bx + uy * h, by - ux * h];
  const sc = c => pref[0] * (c[0] - bx) + pref[1] * (c[1] - by);
  return sc(c1) >= sc(c2) ? c1 : c2;
}
function gymGeo(e) {
  gymFix(e);
  const s = e.s || 1,
    P = v => [e.x + v[0] * s, e.y + v[1] * s],
    rad = a => (a * Math.PI) / 180;
  const hip = P(e.hip),
    L = rad(e.lean || 0),
    sh = [hip[0] + Math.sin(L) * GYM.TOR * s, hip[1] + Math.cos(L) * GYM.TOR * s],
    /* colonne : courbure (cv) = écart du milieu du dos par rapport à la droite bassin-épaules */
    ch = [sh[0] - hip[0], sh[1] - hip[1]],
    cl = Math.hypot(ch[0], ch[1]) || 1,
    cn = [-ch[1] / cl, ch[0] / cl],
    cv = (e.cv || 0) * s,
    sp = [(hip[0] + sh[0]) / 2 + cn[0] * cv, (hip[1] + sh[1]) / 2 + cn[1] * cv],
    ctrl = [2 * sp[0] - (hip[0] + sh[0]) / 2, 2 * sp[1] - (hip[1] + sh[1]) / 2],
    Q = rad(
      e.hq ?? (e.cv ? (Math.atan2(sh[0] - ctrl[0], sh[1] - ctrl[1]) * 180) / Math.PI : (e.lean ?? 0))
    ),
    hd = [
      sh[0] + Math.sin(Q) * GYM.NECK * s + (e.hdo ? e.hdo[0] * s : 0),
      sh[1] + Math.cos(Q) * GYM.NECK * s + (e.hdo ? e.hdo[1] * s : 0),
    ];
  const sw = (e.sw || 0) * s,
    hw = (e.hw || 0) * s;
  const arms = [0, 1].map(i => {
    const a = [sh[0] + (i ? -sw : sw), sh[1]],
      h = P(e.hands[i]);
    return { a, h, m: ik2(a, h, GYM.UA * s, GYM.FA * s, (e.ep || [])[i] || [0, -1]) };
  });
  const legs = [0, 1].map(i => {
    const a = [hip[0] + (i ? -hw : hw), hip[1]],
      f = P(e.feet[i]);
    const m = ik2(a, f, GYM.TH * s, GYM.SH * s, (e.kp || [])[i] || [1, 0]),
      sd = [f[0] - m[0], f[1] - m[1]],
      n = Math.hypot(sd[0], sd[1]) || 1,
      /* pied : perpendiculaire au tibia, tournée de fa[i] degrés (flexion/extension de la cheville) */
      a0 = Math.atan2(sd[0] / n, -sd[1] / n) + rad((e.fa || [])[i] || 0);
    return { a, f, m, t: [f[0] + Math.cos(a0) * 1.9 * s, f[1] + Math.sin(a0) * 1.9 * s] };
  });
  return { s, hip, sh, hd, arms, legs, sw, hw, sp, ctrl };
}
function gymSVG(e) {
  const g = gymGeo(e),
    s = g.s,
    col = CN(e.c || "blue"),
    far = darken(col, 0.8),
    lw = 0.62 * Math.max(s, 0.8);
  const bone = (a, m, t, c, w) => limbSVG(a, m, c, w) + limbSVG(m, t, c, w);
  const leg = i => {
    const L = g.legs[i],
      c = i ? far : col,
      toe = L.t;
    return bone(L.a, L.m, L.f, c, lw) + limbSVG(L.f, toe, c, lw * 0.9);
  };
  const arm = i => {
    const A = g.arms[i],
      c = i ? far : col;
    return (
      bone(A.a, A.m, A.h, c, lw * 0.9) +
      `<circle cx="${A.h[0]}" cy="${EY(A.h[1])}" r="${0.5 * s}" fill="${c}" stroke="#fff" stroke-width=".14"/>`
    );
  };
  const spine = () => {
    if (!(e.cv || 0)) return limbSVG(g.hip, g.sh, col, lw * 1.5);
    const d = `M${g.hip[0]} ${EY(g.hip[1])}Q${g.ctrl[0]} ${EY(g.ctrl[1])} ${g.sh[0]} ${EY(g.sh[1])}`,
      w = lw * 1.5;
    return `<path d="${d}" stroke="#fff" stroke-width="${w + 0.38}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
  };
  let o = leg(1) + arm(1) + spine();
  if (g.sw) o += limbSVG([g.sh[0] - g.sw, g.sh[1]], [g.sh[0] + g.sw, g.sh[1]], col, lw * 1.2);
  if (g.hw) o += limbSVG([g.hip[0] - g.hw, g.hip[1]], [g.hip[0] + g.hw, g.hip[1]], col, lw * 1.2);
  return o + leg(0) + arm(0) + headSVG(g.hd[0], g.hd[1], GYM.HEAD * s, col);
}
/* ---- objets ---- */
var gymObjSVG = function(e) {
  const s = e.s || 1,
    c = CN(e.c || "grey"),
    tf = `transform="translate(${e.x} ${EY(e.y)}) rotate(${-(e.rot || 0)}) scale(${s})"`;
  const R = (x, y, w, h, fill, st, rx = 0.2) =>
    `<rect x="${x}" y="${-(y + h)}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${st}" stroke-width=".22"/>`;
  switch (e.t) {
    case "dumbbell":
      return `<g ${tf}>${R(-2.4, -0.25, 4.8, 0.5, "#64748B", "#475569", 0.2)}${R(-2.9, -1.4, 1.1, 2.8, c, darken(c), 0.3)}${R(1.8, -1.4, 1.1, 2.8, c, darken(c), 0.3)}${R(-1.8, -1, 0.6, 2, c, darken(c), 0.2)}${R(1.2, -1, 0.6, 2, c, darken(c), 0.2)}</g>`;
    case "bottle":
      return `<g ${tf}>${R(-0.9, 0, 1.8, 4, "#CFE8F7", "#6AA9CF", 0.5)}${R(-0.5, 4, 1, 0.8, "#CFE8F7", "#6AA9CF", 0.2)}${R(-0.6, 4.8, 1.2, 0.6, c, darken(c), 0.2)}</g>`;
    case "pullbar":
      return `<g ${tf}>${R(-7.3, 0, 0.7, 22, "#94A3B8", "#64748B", 0.2)}${R(6.6, 0, 0.7, 22, "#94A3B8", "#64748B", 0.2)}${R(-7.3, 21.8, 14.6, 0.7, "#64748B", "#475569", 0.3)}</g>`;
    case "chair":
      return `<g ${tf}>${R(-3, 0, 0.5, 4.4, "#B6C2D3", "#94A3B8")}${R(2.5, 0, 0.5, 4.4, "#B6C2D3", "#94A3B8")}${R(-3.3, 4.4, 6.6, 0.7, "#CBD5E1", "#94A3B8", 0.3)}${R(-3.3, 5.1, 0.6, 6.4, "#CBD5E1", "#94A3B8", 0.3)}</g>`;
    case "stick":
      return `<g ${tf}>${R(-8, -0.25, 16, 0.5, "#B45309", "#8A3F06", 0.25)}</g>`;
    case "towel":
      return `<g ${tf}><ellipse cx="0" cy="0" rx="1.4" ry="0.95" fill="#F2D7A0" stroke="#C9A45A" stroke-width=".22"/><path d="M-0.7 0Q0 -0.7 0.7 0" fill="none" stroke="#C9A45A" stroke-width=".18"/></g>`;
    case "anchor":
      return `<g ${tf}>${R(-0.7, -2, 1.4, 4, "#94A3B8", "#64748B", 0.3)}<circle cx="1.5" cy="0" r="0.9" fill="none" stroke="#475569" stroke-width=".4"/><path d="M0.7 0H0.6" stroke="#475569" stroke-width=".4"/></g>`;
    case "wallv":
      return `<g ${tf}>${R(-1.2, 0, 2.4, 27, "#EEF2F8", "#A8B4C6", 0.2)}</g>`;
  }
  return "";
}
const GYMOBJ = ["dumbbell", "bottle", "pullbar", "chair", "stick", "towel", "anchor", "wallv"];
Object.assign(EDP, {
  gym: c => gymFix({ t: "gym", x: 50, y: 6, c, s: 1.2 }),
  dumbbell: c => ({ t: "dumbbell", x: 50, y: 12, s: 1, c, rot: 0 }),
  bottle: c => ({ t: "bottle", x: 50, y: 6, s: 1, c, rot: 0 }),
  pullbar: () => ({ t: "pullbar", x: 50, y: 6, s: 1, c: "grey", rot: 0 }),
  chair: () => ({ t: "chair", x: 50, y: 6, s: 1, c: "grey", rot: 0 }),
  stick: c => ({ t: "stick", x: 50, y: 14, s: 1, c, rot: 0 }),
  towel: () => ({ t: "towel", x: 50, y: 12, s: 1, c: "grey", rot: 0 }),
  anchor: () => ({ t: "anchor", x: 80, y: 14, s: 1, c: "grey", rot: 0 }),
  wallv: () => ({ t: "wallv", x: 80, y: 6, s: 1, c: "grey", rot: 0 }),
});
function edPaletteSol() {
  const sec = (t, b) =>
    `<div class="psec"><div class="ptitle">${t}</div><div class="pbtns">${b}</div></div>`;
  const pb = (k, a, label, extra = "") =>
    `<button class="pbtn" data-pal="${k}:${a}" title="${label}">${extra || label}</button>`;
  return (
    sec(
      "PERSONNAGE",
      pb("gym", "blue", "Personnage articulé : choisissez la pose à droite", "🧍 personnage") +
        pb("main", "blue", "Main détaillée : avant-bras, poignet et doigts articulés", "✋ main détaillée") +
        `<p class="hint" style="margin:6px 0 0">Choisissez la pose dans le panneau de droite, puis glissez les points (mains, pieds, bassin, buste) pour l'ajuster. Deux personnages côte à côte montrent le départ et la fin du mouvement.</p>`
    ) +
    sec(
      "MATÉRIEL",
      pb("elastic", "red", "Élastique (extrémités à glisser : ancrage et main)", "élastique") +
        pb("anchor", "", "Point d'ancrage de l'élastique", "ancrage") +
        pb("dumbbell", "grey", "Haltère", "haltère") +
        pb("bottle", "blue", "Bouteille d'eau (charge légère)", "bouteille") +
        pb("stick", "amber", "Bâton ou manche à balai", "bâton") +
        pb("towel", "", "Serviette roulée", "serviette") +
        pb("mat", "", "Tapis de sol", "tapis") +
        pb("ball", "", "Ballon", "ballon") +
        pb("bench", "", "Banc", "banc") +
        pb("chair", "", "Chaise", "chaise") +
        pb("pullbar", "", "Barre de traction", "barre") +
        pb("wallv", "", "Mur (appui)", "mur")
    ) +
    sec(
      "FLÈCHES ET REPÈRES",
      pb("arrow", "red:0", "Flèche de mouvement", "→ flèche") +
        pb("rotarrow", "red|cw", "Flèche de rotation", "↻ rotation") +
        pb("line", "ink:1", "Ligne pointillée (alignement)", "ligne") +
        pb("num", "blue", "Numéro (étapes 1, 2…)", "n°") +
        pb("check", "", "Bonne posture", "✓") +
        pb("cross", "", "À éviter", "✗") +
        pb("text", "", "Zone de texte (DÉPART, FIN, consignes…)", "Texte")
    )
  );
}
/* panneau du personnage et des objets (HTML + liaisons) */
function gymPanelHTML(e) {
  if (e.t === "main") return mainPanelHTML(e);
  const sw = (list, cur) =>
    list
      .map(
        ([v, c, l]) =>
          `<button class="swt ${cur === v ? "on" : ""}" data-sw="c:${v}" title="${l}" style="background:${c}"></button>`
      )
      .join("");
  const COL = [
    ["blue", EBLUE, "bleu"],
    ["red", ERED, "rouge"],
    ["green", EGREEN, "vert"],
    ["amber", EAMB, "ambre"],
    ["ink", EINK, "noir"],
    ["grey", EGREY, "gris"],
  ];
  const rg = (l, k, mn, mx, st, v) =>
    `<label class="fl2">${l}<input type="range" min="${mn}" max="${mx}" step="${st}" value="${v}" data-rg="${k}"></label>`;
  if (e.t === "gym") {
    const groups = {};
    Object.entries(GYMPOSES).forEach(([k, v]) => (groups[v.g] = (groups[v.g] || "") + `<option value="${k}" ${e.pose === k ? "selected" : ""}>${v.l}</option>`));
    return (
      `<div class="sws">${sw(COL, e.c || "blue")}</div>` +
      `<label class="fl2">Pose<select data-gympose>${Object.entries(groups)
        .map(([g, o]) => `<optgroup label="${g}">${o}</optgroup>`)
        .join("")}</select></label>` +
      rg("Taille", "s", 0.6, 1.5, 0.05, e.s) +
      rg("Inclinaison du buste", "lean", -180, 180, 1, Math.round(e.lean || 0)) +
      rg("Courbure du dos (− creux / + rond)", "cv", -3, 3, 0.1, e.cv || 0) +
      rg("Inclinaison de la tête", "hq", -180, 180, 1, Math.round(e.hq ?? e.lean ?? 0)) +
      rg("Pied avant (cheville)", "fa0", -70, 70, 1, (e.fa || [])[0] || 0) +
      rg("Pied arrière (cheville)", "fa1", -70, 70, 1, (e.fa || [])[1] || 0) +
      `<div class="rowb"><button class="chip" data-gym="flip" title="Miroir gauche/droite">↔ Retourner</button><button class="chip" data-gym="kn" title="Plier les genoux de l'autre côté">⇅ Genoux</button><button class="chip" data-gym="el" title="Plier les coudes de l'autre côté">⇅ Coudes</button></div>` +
      `<p class="hint">Glissez les points : mains, pieds, bassin (vert) et épaules pour régler la posture. Le point violet du dos courbe la colonne, le point orange au bout du pied fait pivoter la cheville. Les articulations suivent.</p>`
    );
  }
  if (GYMOBJ.includes(e.t)) {
    const ncol = ["dumbbell", "bottle", "stick"].includes(e.t);
    return (
      (ncol ? `<div class="sws">${sw(COL, e.c || "grey")}</div>` : "") +
      rg("Taille", "s", 0.4, 3, 0.05, e.s) +
      (e.t === "wallv" || e.t === "pullbar" || e.t === "chair" ? "" : rg("Rotation", "rot", -180, 180, 5, e.rot || 0))
    );
  }
  return "";
}
function gymPanelBind(p, e) {
  if (e.t === "main") return mainPanelBind(p, e);
  const ps = p.querySelector("[data-gympose]");
  if (ps)
    ps.onchange = ev => {
      edSnap();
      const c = e.c,
        s = e.s;
      gymPose(e, ev.target.value);
      e.c = c;
      e.s = s;
      edRender(true);
    };
  p.querySelectorAll("[data-gym]").forEach(b => {
    b.onclick = () => {
      edSnap();
      const k = b.dataset.gym;
      if (k === "flip") gymFlip(e);
      if (k === "kn") e.kp = e.kp.map(v => [-v[0], -v[1]]);
      if (k === "el") e.ep = e.ep.map(v => [-v[0], -v[1]]);
      edRender(true);
    };
  });
}
