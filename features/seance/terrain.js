/* Mode terrain (téléphone) · bilan de séance · compétences travaillées
   - Mode terrain : plein écran, un exercice à la fois, chronomètre, critères et variantes, puis bilan.
   - Bilan : SMETA.bilan = { pres, bien, diff, suite } (enregistré avec la séance, repris dans le cycle).
   - Compétences : calculées d'après les codes des jeux (AX.COMP), pour une séance ou un cycle. */

/* ---------- bilan ---------- */
const BILAN_CH = [
  ["pres", "Présents / absents", "Qui était là, qui manquait"],
  ["bien", "Ce qui a bien fonctionné", "Jeux réussis, bonnes réactions du groupe"],
  ["diff", "Difficultés rencontrées", "Consignes mal comprises, jeux trop longs…"],
  ["suite", "À prévoir pour la prochaine fois", "Ajustements, jeux à reprendre"],
];
const bilanVide = b => !b || BILAN_CH.every(([k]) => !String(b[k] || "").trim());
function bilanTexte(b) {
  if (bilanVide(b)) return "";
  return BILAN_CH.filter(([k]) => String(b[k] || "").trim())
    .map(([k, t]) => `${t} : ${String(b[k]).trim()}`)
    .join("\n");
}
function bilanFicheHTML() {
  const b = SMETA.bilan;
  if (bilanVide(b)) return "";
  return `<div style="margin-top:10px;border-top:4px solid #E8A33D;background:#FFF6E5;padding:8px 14px;font-size:12px"><b style="letter-spacing:1px;font-size:11px;color:#8A4B00">BILAN DE LA SÉANCE</b>${BILAN_CH.filter(
    ([k]) => String(b[k] || "").trim()
  )
    .map(
      ([k, t]) =>
        `<div style="margin-top:4px"><b>${esc(t)} :</b> ${esc(b[k]).replace(/\n/g, "<br>")}</div>`
    )
    .join("")}</div>`;
}
function bilanFormHTML() {
  const b = SMETA.bilan || {};
  return `<div class="box noprint" style="border-left:6px solid #E8A33D"><b>Bilan de la séance</b> <span style="color:#6B7280;font-size:13px">— à remplir après la séance (aussi possible en mode terrain). Il s'affiche en bas de la fiche et peut être repris dans le cycle.</span><div class="smg" style="margin-top:8px">${BILAN_CH.map(([k, t, ph]) => `<label class="sml">${t}<textarea rows="2" data-bl="${k}" placeholder="${esc(ph)}">${esc(b[k] || "")}</textarea></label>`).join("")}</div></div>`;
}
function bilanBind(upd) {
  document.querySelectorAll("[data-bl]").forEach(i =>
    i.addEventListener("input", () => {
      SMETA.bilan = SMETA.bilan || {};
      SMETA.bilan[i.dataset.bl] = i.value;
      saveMeta();
      if (upd) upd();
    })
  );
}

/* ---------- compétences ---------- */
const compCodes = M => [
  ...new Set(M.subs.flatMap(s => s.views.map(x => x.v.code)).filter(Boolean)),
];
function compBilan(codes) {
  const set = new Set(codes);
  const r = AX.COMP.map(([t, , c]) => ({ t, n: c.filter(x => set.has(x)).length }));
  return { ok: r.filter(x => x.n), non: r.filter(x => !x.n) };
}
function compHTML(codes, quoi) {
  if (!codes.length)
    return `<div style="color:#6B7280">Aucun jeu de la bibliothèque : les compétences ne peuvent pas être calculées.</div>`;
  const { ok, non } = compBilan(codes);
  const chip = (x, c, bg) =>
    `<span class="tchip" style="background:${bg};color:${c};border-radius:12px;padding:2px 9px;margin:2px;display:inline-block">${esc(x.t)}${x.n ? " ×" + x.n : ""}</span>`;
  return `<div><b style="color:#2E7D4F">Travaillées ${quoi} :</b> ${ok.map(x => chip(x, "#1F5F3A", "#DDF1E4")).join("") || "<i>aucune</i>"}</div><div style="margin-top:4px"><b style="color:#8A4B00">Pas encore travaillées :</b> ${non.map(x => chip(x, "#8A4B00", "#FFEFD2")).join("") || "<i>toutes sont couvertes 👏</i>"}</div>`;
}

/* ---------- mode terrain ---------- */
let TR = null; /* {cartes, gi, k, restant, tourne, fin} */
let TRTIMER = null,
  TRWAKE = null;

function terrainCartes(gi) {
  const M = seModel(),
    g = M.G[gi],
    c = [];
  if (+g.acc)
    c.push({ type: "info", titre: "Accueil", dur: +g.acc, couleur: "#6EA8DC", steps: [] });
  if (M.ech.on) {
    const E = M.ech;
    c.push({
      type: "info",
      titre: E.nom || "Échauffement",
      dur: +E.d[gi] || 0,
      couleur: "#7FCB8F",
      steps: lines(E.per ? E.gtxt[gi] : E.txt),
    });
  }
  M.subs.forEach(s => {
    if (!s.idx.includes(gi)) return;
    s.views.forEach(x =>
      c.push({
        type: "jeu",
        titre: x.name,
        sous: s.titre && !x.same ? s.titre : "",
        code: x.v.code,
        dur: +s.d[gi] || 0,
        couleur: g.c,
        steps: x.steps,
        crit: lines(x.it.crit),
        plus: x.v.plus,
        moins: x.v.moins,
        mat: x.v.noMat ? "" : x.v.mat,
        img: crepsImgRow({ src: x.it, g: crepsJeu(x.it) }),
      })
    );
  });
  c.push({
    type: "info",
    titre: "Retour au calme",
    dur: 0,
    couleur: "#9B8AD8",
    steps: lines(g.rc),
  });
  c.push({ type: "bilan", titre: "Bilan de la séance", dur: 0, couleur: "#E8A33D", steps: [] });
  return c;
}
async function terrainVeille(on) {
  try {
    if (on && navigator.wakeLock) TRWAKE = await navigator.wakeLock.request("screen");
    else if (TRWAKE) {
      await TRWAKE.release();
      TRWAKE = null;
    }
  } catch (e) {}
}
function terrainBip() {
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25, 0.5].forEach(t => {
      const o = a.createOscillator(),
        g = a.createGain();
      o.frequency.value = 880;
      o.connect(g);
      g.connect(a.destination);
      g.gain.value = 0.25;
      o.start(a.currentTime + t);
      o.stop(a.currentTime + t + 0.15);
    });
  } catch (e) {}
  try {
    navigator.vibrate && navigator.vibrate([300, 100, 300]);
  } catch (e) {}
}
const mmss = s => {
  const a = Math.abs(s);
  return (s < 0 ? "−" : "") + Math.floor(a / 60) + ":" + String(a % 60).padStart(2, "0");
};
function terrainOuvrir() {
  seDefaults();
  TR = { gi: 0, k: 0, cartes: terrainCartes(0), restant: 0, tourne: false, fin: false };
  TR.restant = TR.cartes[0].dur * 60;
  document.body.classList.add("trOn");
  terrainVeille(true);
  terrainDessin();
}
function terrainFermer() {
  terrainImageFermer();
  clearInterval(TRTIMER);
  TRTIMER = null;
  terrainVeille(false);
  const o = $("#terrain");
  if (o) o.remove();
  document.body.classList.remove("trOn");
  TR = null;
  if (typeof render === "function") render();
}
function terrainCarte(k) {
  clearInterval(TRTIMER);
  TRTIMER = null;
  TR.k = Math.max(0, Math.min(TR.cartes.length - 1, k));
  TR.restant = TR.cartes[TR.k].dur * 60;
  TR.tourne = false;
  TR.fin = false;
  terrainDessin();
}
function terrainTick() {
  TR.restant--;
  if (TR.restant === 0 && !TR.fin) {
    TR.fin = true;
    terrainBip();
  }
  const t = $("#trT");
  if (t) {
    t.textContent = mmss(TR.restant);
    t.classList.toggle("fin", TR.restant <= 0);
  }
}
function terrainDessin() {
  if (!TR) return;
  let o = $("#terrain");
  if (!o) {
    o = document.createElement("div");
    o.id = "terrain";
    document.body.appendChild(o);
    o.addEventListener("click", terrainClic);
    o.addEventListener("input", e => {
      const i = e.target.closest("[data-bl]");
      if (!i) return;
      SMETA.bilan = SMETA.bilan || {};
      SMETA.bilan[i.dataset.bl] = i.value;
      saveMeta();
    });
  }
  const M = seModel(),
    c = TR.cartes[TR.k],
    n = TR.cartes.length;
  const groupes =
    M.G.length > 1
      ? `<div class="trg">${M.G.map(g => `<a data-tr="grp" data-i="${g.i}" class="${g.i === TR.gi ? "on" : ""}" style="--c:${g.c}">${esc(g.nom)}</a>`).join("")}</div>`
      : "";
  const puces = a => (a.length ? `<ul>${a.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "");
  let corps = "";
  if (c.type === "bilan") {
    const b = SMETA.bilan || {};
    corps = `<div class="trb">${BILAN_CH.map(([k, t, ph]) => `<label>${t}<textarea rows="3" data-bl="${k}" placeholder="${esc(ph)}">${esc(b[k] || "")}</textarea></label>`).join("")}<a class="trbtn" data-tr="save" style="background:#2E7D4F">☁ Enregistrer le bilan dans la séance</a><div id="trMsg"></div></div>`;
  } else {
    corps = `${
      c.dur
        ? `<div class="trt"><div id="trT" class="${TR.restant <= 0 ? "fin" : ""}">${mmss(TR.restant)}</div><div class="trtb"><a data-tr="m1">−1</a><a data-tr="play" class="big">${TR.tourne ? "⏸" : "▶"}</a><a data-tr="p1">+1</a><a data-tr="rst">↺</a></div></div>`
        : ""
    }${c.img ? `<div style="margin:8px 0"><a class="trbtn" data-tr="img" style="background:#2B5A9E">🖼 Voir le schéma en plein écran (paysage)</a></div>` : ""}${c.mat ? `<div class="trs"><b>Matériel :</b> ${esc(c.mat)}</div>` : ""}${puces(c.steps)}${c.crit && c.crit.length ? `<div class="trs"><b>✔ Critères de réussite</b>${puces(c.crit)}</div>` : ""}${c.moins ? `<div class="trs"><b>↓ Plus facile :</b> ${esc(c.moins)}</div>` : ""}${c.plus ? `<div class="trs"><b>↑ Plus difficile :</b> ${esc(c.plus)}</div>` : ""}`;
  }
  o.innerHTML = `<div class="trh"><a data-tr="close">✕ Quitter</a><span>${TR.k + 1} / ${n}</span></div>${groupes}<div class="trbar"><i style="width:${((TR.k + 1) / n) * 100}%;background:${c.couleur}"></i></div><div class="trc" style="border-top:6px solid ${c.couleur}"><h2>${c.code ? `<small>${esc(c.code)}</small> ` : ""}${esc(c.titre)}</h2>${c.sous ? `<div class="trsub">${esc(c.sous)}</div>` : ""}${c.dur ? `<div class="trsub">${c.dur} min prévues</div>` : ""}${corps}</div><div class="trf"><a data-tr="prev" ${TR.k === 0 ? 'class="off"' : ""}>◀ Précédent</a><a data-tr="next" ${TR.k === n - 1 ? 'class="off"' : ""}>Suivant ▶</a></div>`;
  const ta = o.querySelector(".trc");
  if (ta) ta.scrollTop = 0;
}
function terrainClic(e) {
  const b = e.target.closest("[data-tr]");
  if (!b || !TR) return;
  const a = b.dataset.tr;
  if (a === "close") terrainFermer();
  else if (a === "img") terrainImage(TR.cartes[TR.k].img);
  else if (a === "prev") terrainCarte(TR.k - 1);
  else if (a === "next") terrainCarte(TR.k + 1);
  else if (a === "grp") {
    TR.gi = +b.dataset.i;
    TR.cartes = terrainCartes(TR.gi);
    terrainCarte(0);
  } else if (a === "play") {
    TR.tourne = !TR.tourne;
    clearInterval(TRTIMER);
    TRTIMER = TR.tourne ? setInterval(terrainTick, 1000) : null;
    terrainDessin();
  } else if (a === "m1" || a === "p1") {
    TR.restant += a === "p1" ? 60 : -60;
    TR.fin = TR.restant <= 0;
    const t = $("#trT");
    if (t) {
      t.textContent = mmss(TR.restant);
      t.classList.toggle("fin", TR.restant <= 0);
    }
  } else if (a === "rst") terrainCarte(TR.k);
  else if (a === "save") {
    const m = $("#trMsg");
    if (m) m.textContent = "Enregistrement…";
    enregistrerSeance().then(() => {
      const m2 = $("#trMsg");
      if (m2) m2.textContent = "Terminé : voir le message de confirmation du site.";
    });
  }
}
document.addEventListener("visibilitychange", () => {
  if (TR && document.visibilityState === "visible") terrainVeille(true);
});

/* schéma en plein écran, toujours en paysage : on le tourne si le téléphone est tenu en portrait */
function terrainImage(url) {
  terrainImageFermer();
  const o = document.createElement("div");
  o.id = "trImg";
  o.innerHTML = `<img src="${esc(url)}" alt="Schéma"><span>Touchez pour fermer</span>`;
  o.addEventListener("click", terrainImageFermer);
  document.body.appendChild(o);
  const place = () => {
    const im = o.querySelector("img"),
      port = innerHeight > innerWidth;
    o.classList.toggle("rot", port);
    im.style.width = (port ? innerHeight : innerWidth) + "px";
    im.style.height = (port ? innerWidth : innerHeight) + "px";
  };
  o._place = place;
  place();
  window.addEventListener("resize", place);
  try {
    /* si le navigateur le permet : vrai plein écran, écran verrouillé en paysage */
    Promise.resolve(o.requestFullscreen && o.requestFullscreen())
      .then(
        () => screen.orientation && screen.orientation.lock && screen.orientation.lock("landscape")
      )
      .catch(() => {});
  } catch (e) {}
}
function terrainImageFermer() {
  const o = document.getElementById("trImg");
  if (!o) return;
  window.removeEventListener("resize", o._place);
  o.remove();
  try {
    if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
    if (document.fullscreenElement) document.exitFullscreen();
  } catch (e) {}
}
