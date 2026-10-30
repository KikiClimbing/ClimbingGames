/* Éditeur de schémas — dessin des pièces (prises, personnages, objets, flèches…) */
/* ---- formes (coordonnées en « y vers le haut », converties à l'affichage) ---- */
function limbSVG(p, q, col, lw) {
  const d = `M${p[0]} ${EY(p[1])}L${q[0]} ${EY(q[1])}`;
  return `<path d="${d}" stroke="#fff" stroke-width="${lw + 0.38}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${col}" stroke-width="${lw}" stroke-linecap="round" fill="none"/>`;
}
function headSVG(x, y, r, col) {
  return `<circle cx="${x}" cy="${EY(y)}" r="${r}" fill="${col}" stroke="#fff" stroke-width=".2"/>`;
}
const FIG = {
  climber: {
    hip: 0,
    tor: 4.2,
    head: 6.1,
    hands: [
      [-7, 8.5],
      [7.5, 7],
    ],
    feet: [
      [-5.4, -5],
      [5.4, -5],
    ],
  },
  pclimber: {
    hip: 0,
    tor: 4.2,
    head: 6.1,
    hands: [
      [-4.5, 8],
      [-3.5, 11.5],
    ],
    feet: [
      [-3, -5.5],
      [-1.2, -6.8],
    ],
  },
  stand: {
    hip: 5,
    tor: 4.2,
    head: 6,
    hands: [
      [-3.2, 5.8],
      [3.2, 5.8],
    ],
    feet: [
      [-1.7, 0],
      [1.7, 0],
    ],
  },
  sit: {
    hip: 1.2,
    tor: 4,
    head: 5.8,
    hands: [
      [3, 3.2],
      [1, 2.4],
    ],
    feet: [
      [4.8, 0.8],
      [3.8, 0],
    ],
  },
};
function figFix(e) {
  const d = FIG[e.t];
  if (d) {
    if (!e.hands) e.hands = JSON.parse(JSON.stringify(d.hands));
    if (!e.feet) e.feet = JSON.parse(JSON.stringify(d.feet));
  }
  return e;
}
function ik(r, t, L, pref) {
  const dx = t[0] - r[0],
    dy = t[1] - r[1],
    d = Math.hypot(dx, dy) || 0.001;
  if (d >= 2 * L * 0.999) return [(r[0] + t[0]) / 2, (r[1] + t[1]) / 2];
  const h = Math.sqrt(L * L - (d * d) / 4),
    ux = dx / d,
    uy = dy / d,
    mx = (r[0] + t[0]) / 2,
    my = (r[1] + t[1]) / 2;
  const c1 = [mx - uy * h, my + ux * h],
    c2 = [mx + uy * h, my - ux * h];
  const sc = c => pref.x * (c[0] - mx) + pref.y * (c[1] - my);
  return sc(c1) >= sc(c2) ? c1 : c2;
}
function figSVG(e, type) {
  const G = FIG[type];
  if (!e.hands) e.hands = JSON.parse(JSON.stringify(G.hands));
  if (!e.feet) e.feet = JSON.parse(JSON.stringify(G.feet));
  const pf = type === "pclimber",
    fd = Math.sign(e.hands.reduce((a, h) => a + h[0], 0)) || -1;
  const { x, y, s } = e,
    col = CN(e.c || "blue"),
    lw = 0.42 * Math.max(s, 0.75),
    ang = ((e.lean || 0) * Math.PI) / 180,
    rot = l => [Math.sin(ang) * l, Math.cos(ang) * l];
  const hip = [x, y + G.hip * s],
    tr = rot(G.tor * s),
    sh = [hip[0] + tr[0], hip[1] + tr[1]],
    hr = rot(G.head * s),
    hd = [hip[0] + hr[0], hip[1] + hr[1]];
  let o = "";
  e.feet.forEach(([fx, fy]) => {
    const f = [x + fx * s, y + fy * s];
    const k = ik(
      hip,
      f,
      5 * s,
      pf ? { x: fd, y: 0.3 } : { x: fx >= 0 ? 1 : -1, y: type === "sit" ? 1 : 0.3 }
    );
    o +=
      limbSVG(hip, k, col, lw) +
      limbSVG(k, f, col, lw) +
      `<circle cx="${f[0]}" cy="${EY(f[1])}" r="${0.6 * s}" fill="${col}" stroke="#fff" stroke-width=".14"/>`;
  });
  o += limbSVG(hip, sh, col, lw * 1.35);
  e.hands.forEach(([hx, hy]) => {
    const t = [x + hx * s, y + hy * s];
    const m = ik(sh, t, 4.4 * s, pf ? { x: -fd * 0.5, y: -1 } : { x: hx >= 0 ? 1 : -1, y: -0.6 });
    o +=
      limbSVG(sh, m, col, lw) +
      limbSVG(m, t, col, lw) +
      `<circle cx="${t[0]}" cy="${EY(t[1])}" r="${0.6 * s}" fill="${col}" stroke="#fff" stroke-width=".14"/>`;
  });
  return o + headSVG(hd[0], hd[1], 1.5 * s, col);
}
const climberSVG = e => figSVG(e, "climber"),
  standSVG = e => figSVG(e, "stand"),
  sitSVG = e => figSVG(e, "sit"),
  pclimberSVG = e => figSVG(e, "pclimber");
/* Mur vu de profil : surface de (gx,gy) vers le haut, inclinée de a degrés vers le côté grimpeur */
function edWall() {
  const o = ED.opt,
    a = ((o.incl ?? 15) * Math.PI) / 180;
  return {
    gx: o.murX ?? 30,
    gy: o.murY ?? 4,
    L: o.murH ?? 28,
    a,
    u: [Math.sin(a), Math.cos(a)],
    n: [Math.cos(a), -Math.sin(a)],
  };
}
function edPos(e) {
  if (e.t !== "phold") return [e.x, e.y];
  const W = edWall(),
    d = Math.min(W.L, Math.max(0, e.d || 0)),
    k = e.r * 0.55;
  return [W.gx + W.u[0] * d + W.n[0] * k, W.gy + W.u[1] * d + W.n[1] * k];
}
function dieSVG(e) {
  const { x, y, s } = e,
    z = 6.5 * s,
    o = z * 0.25;
  const P = {
    1: [[0, 0]],
    2: [
      [-o, o],
      [o, -o],
    ],
    3: [
      [-o, o],
      [0, 0],
      [o, -o],
    ],
    4: [
      [-o, o],
      [o, o],
      [-o, -o],
      [o, -o],
    ],
    5: [
      [-o, o],
      [o, o],
      [0, 0],
      [-o, -o],
      [o, -o],
    ],
    6: [
      [-o, o],
      [o, o],
      [-o, 0],
      [o, 0],
      [-o, -o],
      [o, -o],
    ],
  };
  return (
    `<rect x="${x - z / 2}" y="${EY(y) - z / 2}" width="${z}" height="${z}" rx="1" fill="#fff" stroke="${EINK}" stroke-width=".28"/>` +
    P[e.n || 5]
      .map(
        ([dx, dy]) => `<circle cx="${x + dx}" cy="${EY(y + dy)}" r="${z * 0.075}" fill="${EINK}"/>`
      )
      .join("")
  );
}
function labSVG(e) {
  if (!e.lab) return "";
  const x1 = e.x1,
    y1 = e.y1,
    x2 = e.x2,
    y2 = e.y2,
    mx = (x1 + x2) / 2,
    my = (y1 + y2) / 2,
    dx = x2 - x1,
    dy = y2 - y1,
    bd = e.bend || 0;
  const cx = mx - dy * bd,
    cy = my - dx * bd * -1;
  const px = (x1 + 2 * cx + x2) / 4,
    py = (y1 + 2 * (my + dx * bd) + y2) / 4;
  const fs = 1.5,
    w = String(e.lab).length * fs * 0.54 + 1.2;
  return `<rect x="${px - w / 2}" y="${EY(py) - fs * 0.8}" width="${w}" height="${fs * 1.6}" rx=".6" fill="#fff" fill-opacity=".95"/><text x="${px}" y="${EY(py)}" text-anchor="middle" dominant-baseline="central" font-size="${fs}" font-weight="700" fill="${CN(e.c === "ink" || !e.c ? "ink" : e.c)}" font-family="Calibri,Carlito,Arial,sans-serif">${esc(e.lab)}</text>`;
}
const HOOPD = { hoopflat: [7, 7], hoopfloor: [6, 1.7], hoopside: [1.7, 5.5] };
function hoopSVG(e) {
  const d = HOOPD[e.t],
    s = e.s || 1,
    rx = (e.w ?? d[0]) * s,
    ry = (e.h ?? d[1]) * s,
    col = CN(e.c || "amber"),
    th = e.th || (e.t === "hoopflat" ? 0.62 : 0.56),
    fill = e.fill ?? e.t === "hoopside";
  return `<ellipse cx="${e.x}" cy="${EY(e.y)}" rx="${rx}" ry="${ry}" fill="${fill ? "#FFF3D6" : "none"}" stroke="${col}" stroke-width="${th}"${e.rot ? ` transform="rotate(${e.rot} ${e.x} ${EY(e.y)})"` : ""}/>`;
}
function elSVG(e) {
  return elSVG0(e) + (isLine(e) ? labSVG(e) : "");
}
function elSVG0(e) {
  switch (e.t) {
    case "hold":
      return `<circle cx="${e.x}" cy="${EY(e.y)}" r="${e.r}" fill="${e.c}" stroke="${darken(e.c)}" stroke-width=".17"/>`;
    case "ring": {
      const col = e.c === "amber" ? EAMB : EGREEN;
      return `<circle cx="${e.x}" cy="${EY(e.y)}" r="${e.r}" fill="none" stroke="${col}" stroke-width=".38"/>`;
    }
    case "phold": {
      const [x, y] = edPos(e),
        c = e.c || "#F28B82";
      return `<ellipse cx="${x}" cy="${EY(y)}" rx="${e.r * 1.1}" ry="${e.r * 0.85}" transform="rotate(${(edWall().a * 180) / Math.PI} ${x} ${EY(y)})" fill="${c}" stroke="${darken(c)}" stroke-width=".17"/>`;
    }
    case "pclimber":
      return pclimberSVG(e);
    case "climber":
    case "stand":
    case "sit":
      return climberSVG(e);
    case "hoopflat":
    case "hoopfloor":
    case "hoopside":
      return hoopSVG(e);
    case "pion": {
      const col = CN(e.c || "blue"),
        z = e.s || 1;
      return `<g transform="translate(${e.x} ${EY(e.y)}) rotate(${e.rot || 0}) scale(${z})"><ellipse rx="2.3" ry="1.1" cy="0" fill="${col}" stroke="${darken(col)}" stroke-width=".2"/><circle r="1.15" fill="#fff" stroke="${darken(col)}" stroke-width=".2"/></g>`;
    }
    case "scarf": {
      const c = e.c,
        s = e.s,
        x = e.x,
        y = e.y;
      return `<polygon points="${x - 1.3 * s},${EY(y)} ${x + 1.5 * s},${EY(y + 0.9 * s)} ${x + 0.6 * s},${EY(y - 1.5 * s)}" fill="${c}" stroke="${darken(c, 0.75)}" stroke-width=".16"/>`;
    }
    case "ball":
      return `<circle cx="${e.x}" cy="${EY(e.y)}" r="${1.3 * e.s}" fill="#F59E0B" stroke="${darken("#F59E0B", 0.7)}" stroke-width=".19"/><path d="M${e.x - 1 * e.s} ${EY(e.y)}H${e.x + 1 * e.s}" stroke="${darken("#F59E0B", 0.7)}" stroke-width=".14"/>`;
    case "die":
      return dieSVG(e);
    case "watch": {
      const r = 2.8 * e.s,
        x = e.x,
        y = EY(e.y);
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${EINK}" stroke-width=".31"/><rect x="${x - 0.7}" y="${y - r - 1}" width="1.4" height="1" fill="${EINK}"/><path d="M${x} ${y}V${y - r * 0.65}M${x} ${y}L${x + r * 0.5} ${y + r * 0.1}" stroke="${EINK}" stroke-width=".26" fill="none"/>`;
    }
    case "quickdraw": {
      const s = e.s,
        x = e.x,
        y = e.y,
        c = "#6B7280";
      return `<ellipse cx="${x}" cy="${EY(y + 1.9 * s)}" rx="${0.75 * s}" ry="${1.15 * s}" fill="none" stroke="${c}" stroke-width=".28"/><rect x="${x - 0.45 * s}" y="${EY(y + 1)}" width="${0.9 * s}" height="${1.6 * s}" fill="${c}"/><ellipse cx="${x}" cy="${EY(y - 1.7 * s)}" rx="${0.75 * s}" ry="${1.15 * s}" fill="none" stroke="${c}" stroke-width=".28"/>`;
    }
    case "tape":
      return [35, -35]
        .map(
          a =>
            `<rect x="${e.x - 2}" y="${EY(e.y) - 0.5}" width="4" height="1" fill="#FFE08A" stroke="#C9A227" stroke-width=".1" transform="rotate(${a} ${e.x} ${EY(e.y)})"/>`
        )
        .join("");

    case "rope": {
      const col = CN(e.c || "amber");
      const [x1, y1, x2, y2] = [e.x1, EY(e.y1), e.x2, EY(e.y2)];
      const mx = (x1 + x2) / 2,
        my = (y1 + y2) / 2,
        dx = x2 - x1,
        dy = y2 - y1;
      const cx = mx - dy * (e.bend || 0),
        cy = my + dx * (e.bend || 0);
      const d = `M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}`;
      return `<path d="${d}" stroke="#fff" stroke-width="1.25" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${col}" stroke-width=".9" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#fff" stroke-opacity=".55" stroke-width=".9" fill="none" stroke-dasharray=".35 .7"/>`;
    }
    case "line": {
      const col = CN(e.c || "ink");
      return `<path d="M${e.x1} ${EY(e.y1)}L${e.x2} ${EY(e.y2)}" stroke="transparent" stroke-width="3" fill="none"/><path d="M${e.x1} ${EY(e.y1)}L${e.x2} ${EY(e.y2)}" stroke="${col}" stroke-width=".45" fill="none" ${e.dash ? 'stroke-dasharray=".9 .6"' : ""} stroke-linecap="round"/>`;
    }
    case "zone": {
      const col = CN(e.c || "blue"),
        w = e.w || 20,
        h = e.h || 10;
      return `<rect x="${e.x - w / 2}" y="${EY(e.y) - h / 2}" width="${w}" height="${h}" rx="1" fill="${col}" fill-opacity=".12" stroke="${col}" stroke-width=".3"${e.solid ? "" : ' stroke-dasharray=".9 .6"'}/>`;
    }
    case "zonecircle": {
      const col = CN(e.c || "green");
      return `<circle cx="${e.x}" cy="${EY(e.y)}" r="${8 * e.s}" fill="${col}" fill-opacity=".12" stroke="${col}" stroke-width=".3"${e.solid ? "" : ' stroke-dasharray=".9 .6"'}/>`;
    }
    case "cone": {
      const s = e.s,
        x = e.x,
        y = EY(e.y);
      return `<rect x="${x - 1.5 * s}" y="${y - 0.4 * s}" width="${3 * s}" height=".8" fill="#E8590C"/><polygon points="${x - 1.1 * s},${y - 0.2 * s} ${x + 1.1 * s},${y - 0.2 * s} ${x},${y - 3.2 * s}" fill="#FF8A3D" stroke="#C2410C" stroke-width=".15"/><rect x="${x - 0.7 * s}" y="${y - 1.8 * s}" width="${1.4 * s}" height=".45" fill="#fff"/>`;
    }
    case "bench": {
      const s = e.s,
        x = e.x,
        y = EY(e.y);
      return `<rect x="${x - 4 * s}" y="${y - 0.7 * s}" width="${8 * s}" height="${1.1 * s}" rx=".3" fill="#C99A5B" stroke="#8A6330" stroke-width=".18"/><rect x="${x - 3.4 * s}" y="${y + 0.4 * s}" width=".7" height="${1.9 * s}" fill="#8A6330"/><rect x="${x + 2.7 * s}" y="${y + 0.4 * s}" width=".7" height="${1.9 * s}" fill="#8A6330"/>`;
    }
    case "mat": {
      const s = e.s,
        x = e.x,
        y = EY(e.y);
      return `<rect x="${x - 6 * s}" y="${y - 1.2 * s}" width="${12 * s}" height="${2.4 * s}" rx=".9" fill="#DDE5F0" stroke="#8FA0BA" stroke-width=".25"/><path d="M${x - 2 * s} ${y - 1.2 * s}V${y + 1.2 * s}M${x + 2 * s} ${y - 1.2 * s}V${y + 1.2 * s}" stroke="#8FA0BA" stroke-width=".15"/>`;
    }
    case "foot": {
      const col = CN(e.c || "blue"),
        s = e.s,
        x = e.x,
        y = EY(e.y);
      return `<g transform="rotate(${e.rot || 0} ${x} ${y})"><ellipse cx="${x}" cy="${y - 0.9 * s}" rx="${0.85 * s}" ry="${1.5 * s}" fill="${col}" fill-opacity=".85"/><ellipse cx="${x}" cy="${y + 1.3 * s}" rx="${0.6 * s}" ry="${0.8 * s}" fill="${col}" fill-opacity=".85"/></g>`;
    }
    case "handp": {
      const col = CN(e.c || "blue"),
        s = e.s,
        x = e.x,
        y = EY(e.y);
      return (
        `<g transform="rotate(${e.rot || 0} ${x} ${y})"><ellipse cx="${x}" cy="${y + 0.3 * s}" rx="${1.1 * s}" ry="${1.2 * s}" fill="${col}" fill-opacity=".85"/>` +
        [
          [-1.1, -1.3, -0.15],
          [-0.4, -1.8, 0],
          [0.4, -1.8, 0],
          [1.1, -1.3, 0.15],
        ]
          .map(
            ([dx, dy]) =>
              `<ellipse cx="${x + dx * s}" cy="${y + dy * s}" rx="${0.3 * s}" ry="${0.7 * s}" fill="${col}" fill-opacity=".85"/>`
          )
          .join("") +
        `</g>`
      );
    }
    case "cross": {
      const s = e.s,
        x = e.x,
        y = EY(e.y);
      return `<path d="M${x - 1.6 * s} ${y - 1.6 * s}L${x + 1.6 * s} ${y + 1.6 * s}M${x + 1.6 * s} ${y - 1.6 * s}L${x - 1.6 * s} ${y + 1.6 * s}" stroke="${ERED}" stroke-width=".7" stroke-linecap="round"/>`;
    }
    case "check": {
      const s = e.s,
        x = e.x,
        y = EY(e.y);
      return `<path d="M${x - 1.8 * s} ${y}L${x - 0.5 * s} ${y + 1.4 * s}L${x + 1.9 * s} ${y - 1.6 * s}" stroke="${EGREEN}" stroke-width=".75" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    }
    case "star": {
      const col = CN(e.c || "amber"),
        s = e.s,
        x = e.x,
        y = EY(e.y);
      const p = [...Array(10)]
        .map((_, i) => {
          const a = -Math.PI / 2 + (i * Math.PI) / 5,
            r = (i % 2 ? 0.9 : 2.1) * s;
          return (x + r * Math.cos(a)).toFixed(2) + "," + (y + r * Math.sin(a)).toFixed(2);
        })
        .join(" ");
      return `<polygon points="${p}" fill="${col}" stroke="#fff" stroke-width=".18" stroke-linejoin="round"/>`;
    }
    case "num": {
      const col = CN(e.c || "blue"),
        s = e.s,
        x = e.x,
        y = EY(e.y);
      return `<circle cx="${x}" cy="${y}" r="${1.7 * s}" fill="${col}" stroke="#fff" stroke-width=".22"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${2.1 * s}" font-weight="700" fill="#fff" font-family="Calibri,Carlito,Arial,sans-serif">${esc(String(e.n || 1))}</text>`;
    }
    case "flag": {
      const col = CN(e.c || "red"),
        s = e.s,
        x = e.x,
        y = EY(e.y);
      return `<rect x="${x - 0.15}" y="${y - 5 * s}" width=".3" height="${5 * s}" fill="${EINK}"/><polygon points="${x + 0.15},${y - 5 * s} ${x + 3.2 * s},${y - 3.9 * s} ${x + 0.15},${y - 2.8 * s}" fill="${col}"/>`;
    }
    case "target": {
      const s = e.s,
        x = e.x,
        y = EY(e.y);
      return [
        [2.4, "#fff"],
        [1.8, ERED],
        [1.2, "#fff"],
        [0.6, ERED],
      ]
        .map(
          ([r, c]) =>
            `<circle cx="${x}" cy="${y}" r="${r * s}" fill="${c}" stroke="${ERED}" stroke-width=".12"/>`
        )
        .join("");
    }
    case "card": {
      const s = e.s,
        x = e.x,
        y = EY(e.y);
      return `<rect x="${x - 1.6 * s}" y="${y - 2.2 * s}" width="${3.2 * s}" height="${4.4 * s}" rx=".4" fill="#fff" stroke="${EINK}" stroke-width=".2"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${2.4 * s}" font-weight="700" fill="${EBLUE}" font-family="Calibri,Carlito,Arial,sans-serif">?</text>`;
    }
    case "volume": {
      const col = CN(e.c || "#A894E6"),
        s = e.s,
        x = e.x,
        y = EY(e.y);
      return `<polygon points="${x - 4 * s},${y + 2.6 * s} ${x},${y - 3.2 * s} ${x + 4 * s},${y + 2.6 * s}" fill="${col}" stroke="${darken(col.startsWith("#") ? col : "#888888")}" stroke-width=".25" stroke-linejoin="round"/><polygon points="${x},${y - 3.2 * s} ${x + 4 * s},${y + 2.6 * s} ${x + 1.2 * s},${y + 2.6 * s}" fill="#000" fill-opacity=".1"/>`;
    }
    case "arrow": {
      const col = CN(["blue", "red", "green"].includes(e.c) ? e.c : "ink");
      const [x1, y1, x2, y2] = [e.x1, EY(e.y1), e.x2, EY(e.y2)];
      const mx = (x1 + x2) / 2,
        my = (y1 + y2) / 2,
        dx = x2 - x1,
        dy = y2 - y1;
      const cx = mx - dy * (e.bend || 0),
        cy = my + dx * (e.bend || 0);
      return `<path d="M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}" stroke="transparent" stroke-width="3" fill="none"/><path d="M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}" stroke="${col}" stroke-width=".36" fill="none" ${e.dash ? 'stroke-dasharray=".9 .6"' : ""} marker-end="url(#ah-${["blue", "red", "green"].includes(e.c) ? e.c : "ink"})"/>`;
    }
    case "text": {
      const col = {
          ink: EINK,
          green: EGREEN,
          amber: "#8A6D12",
          blue: EBLUE,
          red: ERED,
          white: "#fff",
        }[e.c || "ink"],
        fs = e.fs || 1.9;
      const lines = String(e.s || "").split("\n");
      const bold = e.b !== false;
      const ff = {
        sans: "Calibri,Carlito,Segoe UI,Arial,sans-serif",
        serif: "Georgia,'Times New Roman',serif",
        hand: "'Comic Sans MS','Segoe Print',cursive",
      }[e.font || "sans"];
      const w = Math.max(...lines.map(l => l.length), 1) * fs * (bold ? 0.54 : 0.5) + 1.4,
        h = lines.length * fs * 1.2 + 0.8;
      const al = e.al || "c";
      const tx = al === "l" ? e.x - w / 2 + 0.7 : al === "r" ? e.x + w / 2 - 0.7 : e.x,
        an = al === "l" ? "start" : al === "r" ? "end" : "middle";
      const bgm = e.bg || "white";
      const bgc = {
        white: ["#fff", 0.92, "none"],
        none: ["none", 0, "none"],
        tint: [
          {
            ink: "#E8ECF3",
            green: "#DDF3E8",
            amber: "#FFF3D6",
            blue: "#DCE8FB",
            red: "#FCE0E4",
            white: "#fff",
          }[e.c || "ink"],
          1,
          "none",
        ],
        box: ["#fff", 1, col],
      }[bgm];
      return (
        `<rect x="${e.x - w / 2}" y="${EY(e.y) - h / 2}" width="${w}" height="${h}" rx=".7" fill="${bgc[0]}" fill-opacity="${bgc[1]}" stroke="${bgc[2]}" stroke-width=".18"/>` +
        lines
          .map(
            (l, i) =>
              `<text x="${tx}" y="${EY(e.y) - h / 2 + 0.4 + fs * 1.0 + i * fs * 1.2}" text-anchor="${an}" font-size="${fs}" font-weight="${bold ? 700 : 400}" font-style="${e.i ? "italic" : "normal"}" fill="${col}" font-family="${ff}"${e.u ? ' text-decoration="underline"' : ""}>${esc(l)}</text>`
          )
          .join("")
      );
    }
  }
  return "";
}
