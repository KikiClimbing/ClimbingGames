/* Éditeur de schémas — assemblage du dessin et poignées */
function edDefs() {
  const cols = { ink: EINK, blue: EBLUE, red: ERED, green: EGREEN };
  return (
    "<defs>" +
    Object.entries(cols)
      .map(
        ([k, c]) =>
          `<marker id="ah-${k}" markerWidth="1.8" markerHeight="1.8" refX="4" refY="2.5" orient="auto" markerUnits="userSpaceOnUse" viewBox="0 0 5 5"><path d="M0 0L5 2.5L0 5z" fill="${c}"/></marker>`
      )
      .join("") +
    "</defs>"
  );
}
function edMur() {
  const o = ED.opt;
  return { x: o.murX ?? 6, y: o.murY ?? 4, w: o.murW ?? 88, h: o.murH ?? 29 };
}
function edLayer(e) {
  const ord = ["hold", "tape", "hoopfloor", "hoopflat", "ring", "hoopside"];
  const i = ord.indexOf(e.t === "phold" ? "hold" : e.t);
  if (["zone", "zonecircle", "mat", "bench", "chalk", "wallv", "chair", "pullbar", "wallbg", "table", "bike", "box"].includes(e.t)) return -1;
  return i >= 0
    ? i
    : ["arrow", "text", "line", "rope", "elastic", "rotarrow", "cross", "check", "num"].includes(
          e.t
        )
      ? 20
      : 10;
}
function edSVGInner(withSel) {
  let o = edDefs() + `<rect width="100" height="36" fill="#fff"/>`;
  const M = edMur();
  if (ED.opt.mode === "profil") {
    const W = edWall(),
      P = (d, k) => [W.gx + W.u[0] * d + W.n[0] * k, EY(W.gy + W.u[1] * d + W.n[1] * k)];
    if (ED.opt.tapis)
      o += `<rect x="2" y="${EY(W.gy)}" width="96" height="3.7" rx=".8" fill="#DDE5F0"/>`;
    if (ED.opt.mur)
      o += `<polygon points="${[P(0, 0), P(W.L, 0), P(W.L, -3), P(0, -3)].map(q => q.map(v => +v.toFixed(2)).join(",")).join(" ")}" fill="#EEF2F8" stroke="#A8B4C6" stroke-width=".35" stroke-linejoin="round"/>`;
  } else if (ED.opt.mode === "sol") {
    if (ED.opt.mur !== false)
      o += `<rect x="0" y="${EY(6)}" width="100" height="6" fill="#E9EEF6"/><line x1="0" y1="${EY(6)}" x2="100" y2="${EY(6)}" stroke="#A8B4C6" stroke-width=".35"/>`;
  } else if (ED.opt.mode === "dessus") {
    if (ED.opt.mur)
      o += `<rect x="${M.x}" y="${EY(M.y + M.h)}" width="${M.w}" height="${M.h}" rx="1.4" fill="#F4F7FB" stroke="#A8B4C6" stroke-width=".35" stroke-dasharray="1.2 .8"/>`;
  } else {
    if (ED.opt.tapis)
      o += `<rect x="2" y="${EY(4)}" width="96" height="3.7" rx=".8" fill="#DDE5F0"/>`;
    if (ED.opt.mur)
      o += `<rect x="${M.x}" y="${EY(M.y + M.h)}" width="${M.w}" height="${M.h}" rx="1.4" fill="#EEF2F8" stroke="#A8B4C6" stroke-width=".35"/>`;
  }
  if (ED.opt.vue)
    o += `<text x="98.5" y="1.5" text-anchor="end" font-size="1.12" font-weight="700" fill="${EGREY}" font-family="Calibri,Carlito,Arial,sans-serif" dominant-baseline="middle">${esc(ED.opt.vue)}</text>`;
  if (ED.opt.legende)
    o += `<text x="50" y="${EY(1.9)}" text-anchor="middle" font-size="1.5" fill="${EINK}" font-family="Calibri,Carlito,Arial,sans-serif" dominant-baseline="middle">${esc(ED.opt.legende)}</text>`;
  const lay = e => (typeof e.z === "number" ? e.z : edLayer(e));
  ED.els
    .map((e, i) => [e, i])
    .sort((a, b) => lay(a[0]) - lay(b[0]) || a[1] - b[1])
    .forEach(([e]) => {
      o += `<g data-id="${e.id}" style="cursor:move">${elSVG(e)}</g>`;
    });
  return o;
}
function edHandles(e) {
  const h = [];
  if (e.t === "gym") {
    const g = gymGeo(e);
    e.hands.forEach((p, i) => h.push({ k: "h" + i, x: e.x + p[0] * e.s, y: e.y + p[1] * e.s }));
    e.feet.forEach((p, i) => h.push({ k: "f" + i, x: e.x + p[0] * e.s, y: e.y + p[1] * e.s }));
    h.push({ k: "p", x: g.hip[0], y: g.hip[1] }, { k: "t", x: g.sh[0], y: g.sh[1] });
    h.push({ k: "c", x: (g.hip[0] + g.sh[0]) / 2 + (g.sp[0] - (g.hip[0] + g.sh[0]) / 2), y: g.sp[1] });
    g.legs.forEach((L, i) => h.push({ k: "o" + i, x: L.t[0], y: L.t[1] }));
  } else if (e.t === "main") {
    h.push(...mainHandles(e));
  } else if (["climber", "stand", "sit", "pclimber"].includes(e.t)) {
    figFix(e);
    h.push(
      ...e.hands.map((p, i) => ({ k: "h" + i, x: e.x + p[0] * e.s, y: e.y + p[1] * e.s })),
      ...e.feet.map((p, i) => ({ k: "f" + i, x: e.x + p[0] * e.s, y: e.y + p[1] * e.s })),
      {
        k: "p",
        x: e.x + (e.pel ? e.pel[0] : 0) * e.s,
        y: e.y + (FIG[e.t].hip + (e.pel ? e.pel[1] : 0)) * e.s,
      }
    );
  }
  if (isLine(e)) {
    h.push({ k: "a1", x: e.x1, y: e.y1 }, { k: "a2", x: e.x2, y: e.y2 });
  }
  return h;
}
function edRender(panel) {
  const svg = $("#edsvg");
  if (!svg) return;
  svg.innerHTML = edSVGInner();
  const g = svg.querySelector(`[data-id="${ED.sel}"]`);
  if (g) {
    const b = g.getBBox();
    const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("x", b.x - 0.6);
    r.setAttribute("y", b.y - 0.6);
    r.setAttribute("width", b.width + 1.2);
    r.setAttribute("height", b.height + 1.2);
    r.setAttribute("fill", "none");
    r.setAttribute("stroke", "#2F6FDB");
    r.setAttribute("stroke-width", ".2");
    r.setAttribute("stroke-dasharray", ".6 .4");
    r.setAttribute("pointer-events", "none");
    svg.appendChild(r);
    const e = ED.els.find(x => x.id === ED.sel);
    edHandles(e).forEach(h => {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", h.x);
      c.setAttribute("cy", EY(h.y));
      c.setAttribute("r", 0.62); /* bassin : point 2 fois plus petit */
      c.setAttribute("fill", h.k[0] === "f" || h.k[0] === "o" ? "#FFF3D6" : h.k === "p" ? "#DDF1E4" : h.k === "c" ? "#EADCF8" : "#fff");
      c.setAttribute("stroke", h.k[0] === "f" || h.k[0] === "o" ? "#E0A030" : h.k === "p" ? "#2E7D4F" : h.k === "c" ? "#7A3FC0" : "#2F6FDB");
      c.setAttribute("stroke-width", ".35");
      c.setAttribute("data-h", h.k);
      c.style.cursor = "crosshair";
      svg.appendChild(c);
    });
  }
  edSave();
  if (panel) edPanel();
}
