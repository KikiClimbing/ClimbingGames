/* Routine chronométrée (mode terrain d'un exercice) : champ « Routine » de la fiche.
   Une ligne par étape : « Titre ; travail (s) ; repos (s) ; répétitions ; pause après l'étape (s, facultatif) ». */
let RT = null;
function routineEtapes(txt) {
  return String(txt || "")
    .split("\n")
    .map(l => l.split(";").map(x => x.trim()))
    .filter(a => a[0] && +a[1] > 0)
    .map(a => ({ t: a[0], w: +a[1], r: +a[2] || 0, n: Math.max(1, +a[3] || 1), p: +a[4] || 0 }));
}
/* suite de phases à dérouler */
function routinePhases(E) {
  const P = [{ k: "prep", t: "Prépare-toi", d: 10, i: 0, n: 0 }];
  E.forEach((e, i) => {
    for (let r = 1; r <= e.n; r++) {
      P.push({ k: "work", t: e.t, d: e.w, i, r, n: e.n });
      const dernier = r === e.n;
      const rest = dernier ? e.p : e.r;
      if (rest > 0 && !(dernier && i === E.length - 1)) P.push({ k: "rest", t: dernier ? "Pause avant la suite" : "Repos", d: rest, i, r, n: e.n, prochain: dernier ? (E[i + 1] || {}).t : e.t });
    }
  });
  return P;
}
const routineDuree = txt => routinePhases(routineEtapes(txt)).reduce((a, p) => a + (p.k === "prep" ? 0 : p.d), 0);
const rtTemps = s => Math.floor(s / 60) + ":" + String(Math.max(0, s) % 60).padStart(2, "0");
function routineBoutonHTML(g) {
  const E = routineEtapes(g && g.Routine);
  if (!E.length) return "";
  const d = routineDuree(g.Routine);
  return `<div class="tip" style="margin-bottom:10px"><b>MODE TERRAIN</b> — le chrono déroule la séquence (travail / repos, bips, vibration), durée ≈ ${Math.round(d / 60)} min.<br><a class="btn" data-routine="${esc(key(g))}" style="cursor:pointer;display:inline-block;margin-top:6px;background:#2E7D4F;color:#fff;padding:9px 16px;border-radius:8px;font-weight:700">▶ Lancer la routine</a></div>`;
}
function routineBip(f, d) {
  try {
    const a = typeof sonCtx === "function" ? sonCtx() : null;
    if (!a) return;
    if (a.state === "suspended") a.resume();
    const o = a.createOscillator(),
      g = a.createGain();
    o.frequency.value = f;
    g.gain.value = 0.25;
    o.connect(g);
    g.connect(a.destination);
    o.start();
    o.stop(a.currentTime + d);
  } catch (e) {}
}
function routineVib(p) {
  try {
    navigator.vibrate && navigator.vibrate(p);
  } catch (e) {}
}
function routineOuvrir(code) {
  const g = DATA.find(x => key(x) === code);
  if (!g) return;
  const E = routineEtapes(g.Routine);
  if (!E.length) return;
  routineFermer();
  if (typeof sonDeverrouiller === "function") sonDeverrouiller();
  RT = { g, E, P: routinePhases(E), j: 0, reste: 10, pause: false, t: null, fin: false, wl: null };
  RT.total = RT.P.reduce((a, p) => a + (p.k === "prep" ? 0 : p.d), 0);
  RT.reste = RT.P[0].d;
  const el = document.createElement("div");
  el.id = "rt";
  el.setAttribute("style", "position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:16px;color:#fff;font-family:inherit");
  document.body.appendChild(el);
  try {
    navigator.wakeLock && navigator.wakeLock.request("screen").then(w => (RT.wl = w), () => {});
  } catch (e) {}
  RT.t = setInterval(routineTick, 1000);
  routineDessin();
}
function routineFermer() {
  if (RT) {
    clearInterval(RT.t);
    try {
      RT.wl && RT.wl.release();
    } catch (e) {}
  }
  RT = null;
  const el = document.getElementById("rt");
  if (el) el.remove();
}
function routineTick() {
  if (!RT || RT.pause || RT.fin) return;
  RT.reste--;
  if (RT.reste > 0 && RT.reste <= 3) routineBip(660, 0.12);
  if (RT.reste <= 0) routineSuivante();
  else routineDessin();
}
function routineSuivante() {
  RT.j++;
  if (RT.j >= RT.P.length) {
    RT.fin = true;
    routineBip(523, 0.3);
    setTimeout(() => routineBip(784, 0.5), 350);
    routineVib([400, 150, 400]);
  } else {
    const p = RT.P[RT.j];
    RT.reste = p.d;
    if (p.k === "work") {
      routineBip(880, 0.5);
      routineVib(300);
    } else {
      routineBip(440, 0.25);
      routineVib(150);
    }
  }
  routineDessin();
}
function routineDessin() {
  const el = document.getElementById("rt");
  if (!el || !RT) return;
  const btn = (a, l, c) =>
    `<a data-rt="${a}" style="cursor:pointer;background:${c || "rgba(255,255,255,.18)"};color:#fff;padding:12px 20px;border-radius:10px;font-weight:700;font-size:16px;border:1px solid rgba(255,255,255,.35)">${l}</a>`;
  if (RT.fin) {
    el.style.background = "#2E7D4F";
    el.innerHTML = `<div style="font-size:30px;font-weight:800">✓ Routine terminée</div><div style="margin:10px 0 24px;opacity:.9">${esc(RT.g.Titre)}</div>${btn("close", "Fermer")}`;
    return;
  }
  const p = RT.P[RT.j];
  const prep = p.k === "prep",
    work = p.k === "work";
  el.style.background = prep ? "#26364D" : work ? "#C2410C" : "#2B5A9E";
  const fait = RT.P.slice(0, RT.j).reduce((a, q) => a + (q.k === "prep" ? 0 : q.d), 0) + (p.d - RT.reste);
  const restant = Math.max(0, RT.total - fait);
  const nxt = RT.P[RT.j + 1];
  const etape = RT.E[p.i];
  el.innerHTML = `<div style="position:absolute;top:14px;right:14px">${btn("close", "✕ Quitter")}</div>
  <div style="font-size:15px;opacity:.85;margin-bottom:4px">${esc(RT.g.Titre)}</div>
  <div style="font-size:22px;font-weight:800;margin-bottom:2px">${prep ? "Prépare-toi" : work ? "TRAVAIL" : "REPOS"}</div>
  <div style="font-size:18px;margin-bottom:6px">${prep ? esc(RT.E[0].t) : esc(work ? p.t : "Prochain : " + (p.prochain || "—"))}</div>
  <div style="font-size:clamp(90px,28vw,220px);font-weight:800;line-height:1">${RT.reste}</div>
  <div style="font-size:16px;margin:8px 0 18px;opacity:.9">${prep ? "" : "Répétition " + p.r + " / " + p.n + " · étape " + (p.i + 1) + " / " + RT.E.length + " · "}reste ${rtTemps(restant)}</div>
  <div style="width:min(420px,80vw);height:8px;background:rgba(255,255,255,.25);border-radius:4px;overflow:hidden;margin-bottom:22px"><div style="height:100%;width:${Math.round((fait / RT.total) * 100)}%;background:#fff"></div></div>
  <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">${btn("pause", RT.pause ? "▶ Reprendre" : "⏸ Pause")}${btn("skip", "⏭ Passer")}</div>
  ${nxt && work && nxt.k === "rest" ? "" : ""}`;
}
registerClick(e => {
  const o = e.target.closest("[data-routine]");
  if (o) {
    routineOuvrir(o.dataset.routine);
    return true;
  }
  const b = e.target.closest("[data-rt]");
  if (!b) return;
  const a = b.dataset.rt;
  if (a === "close") routineFermer();
  else if (RT && a === "pause") {
    RT.pause = !RT.pause;
    routineDessin();
  } else if (RT && a === "skip") routineSuivante();
  return true;
});
