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
function edSVGInner(withSel) {
  let o = edDefs() + `<rect width="100" height="36" fill="#fff"/>`;
  if (ED.opt.tapis)
    o += `<rect x="2" y="${EY(4)}" width="96" height="3.7" rx=".8" fill="#DDE5F0"/>`;
  if (ED.opt.mur)
    o += `<rect x="6" y="${EY(33)}" width="88" height="29" rx="1.4" fill="#EEF2F8" stroke="#A8B4C6" stroke-width=".35"/>`;
  if (ED.opt.vue)
    o += `<text x="98.5" y="1.5" text-anchor="end" font-size="1.12" font-weight="700" fill="${EGREY}" font-family="Calibri,Carlito,Arial,sans-serif" dominant-baseline="middle">${esc(ED.opt.vue)}</text>`;
  if (ED.opt.legende)
    o += `<text x="50" y="${EY(1.9)}" text-anchor="middle" font-size="1.5" fill="${EINK}" font-family="Calibri,Carlito,Arial,sans-serif" dominant-baseline="middle">${esc(ED.opt.legende)}</text>`;
  const ord = ["hold", "tape", "hoopfloor", "hoopflat", "ring", "hoopside"];
  const ord2 = ["zone", "zonecircle", "mat", "bench"];
  const order = e => {
    const j = ord2.indexOf(e.t);
    if (j >= 0) return -1;
    const i = ord.indexOf(e.t);
    return i >= 0
      ? i
      : ["arrow", "text", "line", "rope", "cross", "check", "num"].includes(e.t)
        ? 20
        : 10;
  };
  ED.els
    .map((e, i) => [e, i])
    .sort((a, b) => order(a[0]) - order(b[0]) || a[1] - b[1])
    .forEach(([e]) => {
      o += `<g data-id="${e.id}" style="cursor:move">${elSVG(e)}</g>`;
    });
  return o;
}
function edHandles(e) {
  const h = [];
  if (["climber", "stand", "sit"].includes(e.t)) {
    figFix(e);
    h.push(
      ...e.hands.map((p, i) => ({ k: "h" + i, x: e.x + p[0] * e.s, y: e.y + p[1] * e.s })),
      ...e.feet.map((p, i) => ({ k: "f" + i, x: e.x + p[0] * e.s, y: e.y + p[1] * e.s }))
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
      c.setAttribute("r", 1.25);
      c.setAttribute("fill", h.k[0] === "f" ? "#FFF3D6" : "#fff");
      c.setAttribute("stroke", h.k[0] === "f" ? "#E0A030" : "#2F6FDB");
      c.setAttribute("stroke-width", ".35");
      c.setAttribute("data-h", h.k);
      c.style.cursor = "crosshair";
      svg.appendChild(c);
    });
  }
  edSave();
  if (panel) edPanel();
}
