/* Éditeur de schémas — souris, clavier, semis de prises */
function edInit() {
  edLoad();
  edRender(true);
  const svg = $("#edsvg");
  const pt = ev => {
    const m = svg.getScreenCTM().inverse();
    const p = svg.createSVGPoint();
    p.x = ev.clientX;
    p.y = ev.clientY;
    const q = p.matrixTransform(m);
    return [q.x, 36 - q.y];
  };
  svg.addEventListener("pointerdown", ev => {
    const hd = ev.target.closest("[data-h]");
    const g = ev.target.closest("[data-id]");
    if (hd) {
      const e = ED.els.find(x => x.id === ED.sel);
      edSnap();
      ED.drag = { k: "handle", h: hd.dataset.h, e };
      svg.setPointerCapture(ev.pointerId);
      return;
    }
    if (g) {
      ED.sel = +g.dataset.id;
      const e = ED.els.find(x => x.id === ED.sel);
      edSnap();
      ED.drag = { k: "move", e, p0: pt(ev), o: JSON.parse(JSON.stringify(e)), moved: false };
      svg.setPointerCapture(ev.pointerId);
      edRender(true);
    } else {
      ED.sel = null;
      edRender(true);
    }
  });
  svg.addEventListener("pointermove", ev => {
    const d = ED.drag;
    if (!d) return;
    const p = pt(ev);
    if (d.k === "move") {
      const dx = p[0] - d.p0[0],
        dy = p[1] - d.p0[1];
      d.moved = true;
      const e = d.e;
      if (e.t === "phold") {
        const W = edWall();
        e.d = +Math.min(W.L, Math.max(0, (p[0] - W.gx) * W.u[0] + (p[1] - W.gy) * W.u[1])).toFixed(
          2
        );
      } else if (isLine(e)) {
        e.x1 = d.o.x1 + dx;
        e.x2 = d.o.x2 + dx;
        e.y1 = d.o.y1 + dy;
        e.y2 = d.o.y2 + dy;
      } else {
        e.x = +(d.o.x + dx).toFixed(2);
        e.y = +(d.o.y + dy).toFixed(2);
      }
    } else {
      const e = d.e,
        h = d.h;
      if (h[0] === "a") {
        if (h === "a1") {
          e.x1 = p[0];
          e.y1 = p[1];
        } else {
          e.x2 = p[0];
          e.y2 = p[1];
        }
      } else {
        let q = p;
        if (ED.snap !== false) {
          let best = null,
            bd = 3.2;
          ED.els.forEach(o => {
            if (["hold", "volume", "ring", "foot", "handp", "phold"].includes(o.t)) {
              const op = edPos(o),
                dd = Math.hypot(op[0] - p[0], op[1] - p[1]);
              if (dd < bd) {
                bd = dd;
                best = op;
              }
            }
          });
          if (best) q = best;
        }
        const i = +h[1],
          arr = h[0] === "h" ? e.hands : e.feet;
        arr[i] = [+((q[0] - e.x) / e.s).toFixed(2), +((q[1] - e.y) / e.s).toFixed(2)];
      }
    }
    edRender(false);
  });
  const end = () => {
    if (ED.drag) {
      const d = ED.drag;
      ED.drag = null;
      if (d.k === "move" && !d.moved) ED.hist.pop();
      edRender(true);
    }
  };
  svg.addEventListener("pointerup", end);
  svg.addEventListener("pointercancel", end);
  $("#edpal").addEventListener("click", ev => {
    const b = ev.target.closest("[data-pal]");
    if (b) {
      const [k, a] = b.dataset.pal.split(":");
      let el;
      const pr = b.dataset.pal.split(":");
      if (k === "arrow" || k === "line") el = EDP[k](pr[1], pr[2] === "1");
      else el = EDP[k](a);
      el.x !== undefined &&
        ((el.x += Math.round((Math.random() - 0.5) * 10)),
        (el.y += Math.round((Math.random() - 0.5) * 4)));
      edAdd(el);
      return;
    }
    if (ev.target.id === "edSeed") edSeed();
  });
  $("#edUndo").onclick = edUndo;
  $("#edRedo").onclick = edRedo;
  $("#edClear").onclick = () => {
    if (confirm("Tout effacer ?")) {
      edSnap();
      ED.els = [];
      ED.sel = null;
      edRender(true);
    }
  };
  $("#edExample").onclick = () => {
    edSnap();
    ED.opt = {
      face: true,
      mur: true,
      tapis: true,
      legende: "toucher un maximum de prises avec les mains",
      vue: "VUE DE FACE",
    };
    ED.els = [];
    ED.next = 1;
    edSeedRaw(34);
    [
      {
        t: "climber",
        x: 50,
        y: 14,
        c: "blue",
        s: 1,
        hands: [
          [-6, 9],
          [6.5, 8],
        ],
        feet: [
          [-5.6, -4.7],
          [5.6, -4.7],
        ],
      },
      { t: "ring", x: 44.4, y: 9.3, c: "amber", r: 2.5 },
      { t: "ring", x: 55.6, y: 9.3, c: "amber", r: 2.5 },
      { t: "text", x: 20, y: 27, s: "2 prises de pieds\nimposées", c: "amber", fs: 1.9 },
    ].forEach(e => {
      e.id = ED.next++;
      ED.els.push(e);
    });
    ED.sel = null;
    edRender(true);
  };
  $("#edPng").onclick = () => edExport("png");
  $("#edUp").onclick = edUpload;
  edCtxBind();
  $("#edSvg").onclick = () => edExport("svg");
  $("#edSaveJson").onclick = () => {
    const b = new Blob([JSON.stringify({ els: ED.els, opt: ED.opt })], {
      type: "application/json",
    });
    edDl(b, "schema-brouillon.json");
  };
  $("#edOpen").onchange = ev => {
    const f = ev.target.files[0];
    if (!f) return;
    f.text().then(t => {
      try {
        const s = JSON.parse(t);
        edSnap();
        ED.els = s.els || [];
        ED.opt = Object.assign(ED.opt, s.opt || {});
        ED.next = Math.max(1, ...ED.els.map(e => e.id + 1));
        ED.sel = null;
        edRender(true);
      } catch (e) {
        alert("Fichier illisible.");
      }
    });
  };
  document.addEventListener("keydown", edKey);
}
function edKey(ev) {
  if (VIEW !== "editeur") return;
  const tag = (ev.target.tagName || "").toLowerCase();
  if (["input", "textarea", "select"].includes(tag)) return;
  if ((ev.ctrlKey || ev.metaKey) && ev.key === "z") {
    ev.preventDefault();
    ev.shiftKey ? edRedo() : edUndo();
    return;
  }
  if (ev.key === "Delete" || ev.key === "Backspace") {
    if (ED.sel) {
      ev.preventDefault();
      edOp("del");
    }
    return;
  }
  const e = ED.els.find(x => x.id === ED.sel);
  if (!e) return;
  const st = ev.shiftKey ? 1 : 0.25,
    m = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, st], ArrowDown: [0, -st] }[ev.key];
  if (m) {
    ev.preventDefault();
    if (e.t === "phold") e.d = Math.max(0, e.d + m[1] * 4);
    else if (isLine(e)) {
      e.x1 += m[0];
      e.x2 += m[0];
      e.y1 += m[1];
      e.y2 += m[1];
    } else {
      e.x += m[0];
      e.y += m[1];
    }
    edRender(false);
  }
}
function edSeedRaw(n) {
  const rect = [8.5, 6, 91.5, 31.5],
    pts = [];
  const avoid = ED.els
    .filter(e =>
      [
        "climber",
        "stand",
        "sit",
        "ring",
        "hoopflat",
        "hoopfloor",
        "hoopside",
        "watch",
        "text",
        "die",
        "ball",
        "quickdraw",
      ].includes(e.t)
    )
    .map(e =>
      e.t === "climber"
        ? { x: e.x, y: e.y, r: 12 }
        : { x: e.x || 50, y: e.y || 19, r: e.t === "text" ? 9 : 5 }
    );
  let tries = 0;
  while (pts.length < n && tries < 4000) {
    tries++;
    const x = rect[0] + Math.random() * (rect[2] - rect[0]),
      y = rect[1] + Math.random() * (rect[3] - rect[1]);
    if (
      pts.some(p => Math.hypot(p[0] - x, p[1] - y) < 6.4) ||
      avoid.some(a => Math.hypot(a.x - x, a.y - y) < a.r)
    )
      continue;
    pts.push([x, y]);
  }
  let last = "";
  pts.forEach(([x, y]) => {
    let c;
    do {
      c = HOLDC[Math.floor(Math.random() * HOLDC.length)];
    } while (c === last);
    last = c;
    ED.els.unshift({
      id: ED.next++,
      t: "hold",
      x: +x.toFixed(2),
      y: +y.toFixed(2),
      c,
      r: +(1.35 * (0.95 + Math.random() * 0.25)).toFixed(2),
    });
  });
}
function edSeed() {
  edSnap();
  edSeedRaw(36);
  edRender(true);
}
