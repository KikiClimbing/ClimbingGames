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
let TR = null; /* {meta, se, cur, mien, id, cartes, gi, k, restant, tourne, fin} */
let TRTIMER = null,
  TRWAKE = null;

const terrainModele = () => withSeance(TR.meta, TR.se, () => seModel());
function terrainCartes(gi) {
  return withSeance(TR.meta, TR.se, () => terrainCartes0(gi));
}
function terrainCartes0(gi) {
  const M = seModel(),
    g = M.G[gi],
    c = [];
  if (+g.acc)
    c.push({
      type: "info",
      titre: "Accueil",
      sec: "ACCUEIL",
      bg: "#FDF3D3",
      fg: "#8A6D12",
      dur: +g.acc,
      couleur: "#E3C463",
      steps: [],
    });
  if (M.ech.on) {
    const E = M.ech;
    c.push({
      type: "info",
      titre: E.nom || "Échauffement",
      sec: "ÉCHAUFFEMENT",
      bg: "#E6F2E6",
      fg: "#2E6F3E",
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
        jeu: x.v.titre,
        sous: s.titre && !x.same ? s.titre : "",
        sec: "CORPS DE SÉANCE",
        bg: "#E3EEF8",
        fg: "#2B5A9E",
        code: x.v.code,
        dur: +s.d[gi] || 0,
        couleur: g.c,
        steps: x.steps,
        crit: lines(x.it.crit),
        dos: x.v.dos,
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
    sec: "RETOUR AU CALME",
    bg: "#ECE7F8",
    fg: "#5B4BA8",
    dur: 0,
    couleur: "#9B8AD8",
    steps: lines(g.rc),
  });
  c.push({
    type: "bilan",
    titre: "Bilan de la séance",
    sec: "BILAN",
    bg: "#FFF6E5",
    fg: "#8A4B00",
    dur: 0,
    couleur: "#E8A33D",
    steps: [],
  });
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
/* fin du chrono : le son tourne en boucle jusqu'à ce qu'on touche « Arrêter le son » */
let TRBOUCLE = null;
const SON_PERIODE = { bip: 1300, cloche: 3000, gong: 3800, sifflet: 1800, alarme: 1700 };
function terrainBip() {
  sonStop();
  const spec = sonCourant(),
    fichier = /^sons\//.test(spec);
  const vib = () => {
    try {
      navigator.vibrate && navigator.vibrate([300, 100, 300]);
    } catch (e) {}
  };
  sonJouer(spec, fichier);
  vib();
  if (!fichier)
    TRBOUCLE = setInterval(
      () => {
        sonJouer(spec);
        vib();
      },
      SON_PERIODE[spec.replace(/^preset:/, "")] || 1500
    );
  else TRBOUCLE = true;
  if (!$("#trStop")) {
    const b = document.createElement("a");
    b.id = "trStop";
    b.textContent = "🔔 Arrêter le son";
    b.addEventListener("click", sonStop);
    document.body.appendChild(b);
  }
}
function sonStop() {
  if (TRBOUCLE && TRBOUCLE !== true) clearInterval(TRBOUCLE);
  TRBOUCLE = null;
  try {
    if (TRAUD) {
      TRAUD.loop = false;
      TRAUD.pause();
      TRAUD.currentTime = 0;
    }
    navigator.vibrate && navigator.vibrate(0);
  } catch (e) {}
  const b = document.getElementById("trStop");
  if (b) b.remove();
}
const mmss = s => {
  const a = Math.abs(s);
  return (s < 0 ? "−" : "") + Math.floor(a / 60) + ":" + String(a % 60).padStart(2, "0");
};
/* sans paramètre : la séance de « Créer une séance » (ou de la fenêtre de modification) ;
   sinon une copie d'une séance de la bibliothèque (meta, se), sans rien changer ailleurs */
function terrainOuvrir(meta, se, id, mien) {
  const cur = !meta;
  TR = {
    meta: meta || SMETA,
    se: se || SE,
    cur,
    mien: cur || !!mien,
    id: id || "",
    gi: 0,
    k: 0,
    cartes: [],
    restant: 0,
    tourne: false,
    fin: false,
  };
  withSeance(TR.meta, TR.se, () => seDefaults());
  if (id) TR.se.id = id;
  TR.cartes = terrainCartes(0);
  TR.restant = TR.cartes[0].dur * 60;
  sonPrecharger();
  document.body.classList.add("trOn");
  terrainVeille(true);
  terrainDessin();
}
function terrainFermer() {
  sonStop();
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
      TR.meta.bilan = TR.meta.bilan || {};
      TR.meta.bilan[i.dataset.bl] = i.value;
      if (TR.cur) saveMeta();
    });
  }
  const M = terrainModele(),
    c = TR.cartes[TR.k],
    n = TR.cartes.length;
  const groupes =
    M.G.length > 1
      ? `<div class="trg">${M.G.map(g => `<a data-tr="grp" data-i="${g.i}" class="${g.i === TR.gi ? "on" : ""}" style="--c:${g.c}">${esc(g.nom)}</a>`).join("")}</div>`
      : "";
  const puces = a => (a.length ? `<ul>${a.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "");
  let corps = "";
  if (c.type === "bilan") {
    const b = TR.meta.bilan || {};
    corps = `<div class="trb">${BILAN_CH.map(([k, t, ph]) => `<label>${t}<textarea rows="3" data-bl="${k}" placeholder="${esc(ph)}">${esc(b[k] || "")}</textarea></label>`).join("")}${TR.mien ? '<a class="trbtn" data-tr="save" style="background:#2E7D4F">☁ Enregistrer le bilan dans la séance</a>' : '<div class="trs">Cette séance appartient à un autre auteur : le bilan ne peut pas y être enregistré.</div>'}<div id="trMsg"></div></div>`;
  } else {
    corps = `${
      c.dur
        ? `<div class="trt"><div id="trT" class="${TR.restant <= 0 ? "fin" : ""}">${mmss(TR.restant)}</div><div class="trtb"><a data-tr="m1">−1</a><a data-tr="play" class="big">${TR.tourne ? "⏸" : "▶"}</a><a data-tr="p1">+1</a><a data-tr="rst">↺</a></div></div>`
        : ""
    }${c.img ? `<div style="margin:8px 0"><a class="trbtn" data-tr="img" style="background:#2B5A9E">🖼 Voir le schéma en grand</a></div>` : ""}${c.dos ? `<div class="trs"><b>Dosage :</b> ${esc(c.dos)}</div>` : ""}${c.mat ? `<div class="trs"><b>Matériel :</b> ${esc(c.mat)}</div>` : ""}${puces(c.steps)}${c.crit && c.crit.length ? `<div class="trs"><b>✔ Critères de réussite</b>${puces(c.crit)}</div>` : ""}${c.moins ? `<div class="trs trv" style="background:#F1F8F2;color:#1F4F2E"><b style="color:#2E6F3E">↓ Plus facile :</b> ${esc(c.moins)}</div>` : ""}${c.plus ? `<div class="trs trv" style="background:#FDF3F2;color:#5A2A1E"><b style="color:#C2571A">↑ Plus difficile :</b> ${esc(c.plus)}</div>` : ""}`;
  }
  o.innerHTML = `<div class="trh"><a data-tr="close">✕ Quitter</a><span>${TR.k + 1} / ${n}</span></div>${groupes}<div class="trbar"><i style="width:${((TR.k + 1) / n) * 100}%;background:${c.couleur}"></i></div><div class="trc" style="border-top:6px solid ${c.couleur}"><div class="trtit" style="background:${c.bg};color:${c.fg}"><div class="trsec">${esc(c.sec)}</div><h2>${c.code ? `<small>${esc(c.code)}</small> ` : ""}${esc(c.titre)}</h2>${c.jeu && norm(c.jeu) !== norm(c.titre) ? `<div class="trjeu">🎲 ${esc(c.jeu)}</div>` : ""}</div>${c.sous ? `<div class="trsub">${esc(c.sous)}</div>` : ""}${c.dur ? `<div class="trsub">${c.dur} min prévues</div>` : ""}${corps}</div><div class="trf"><a data-tr="prev" ${TR.k === 0 ? 'class="off"' : ""}>◀ Précédent</a><a data-tr="next" ${TR.k === n - 1 ? 'class="off"' : ""}>Suivant ▶</a></div>`;
  const ta = o.querySelector(".trc");
  if (ta) ta.scrollTop = 0;
}
function terrainClic(e) {
  const b = e.target.closest("[data-tr]");
  if (!b || !TR) return;
  const a = b.dataset.tr;
  sonStop();
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
    if (TR.tourne) sonDeverrouiller();
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
    (TR.cur ? enregistrerSeance() : enregistrerSeance(TR.meta, TR.se)).then(() => {
      if (TR && TR.id && typeof SBCUR !== "undefined" && SBCUR && SBID === TR.id)
        SBCUR.meta.bilan = JSON.parse(JSON.stringify(TR.meta.bilan || {}));
      const m2 = $("#trMsg");
      if (m2) m2.textContent = "Terminé : voir le message de confirmation du site.";
    });
  }
}
document.addEventListener("visibilitychange", () => {
  if (TR && document.visibilityState === "visible") terrainVeille(true);
});

/* schéma en grand : il occupe tout l'écran et s'adapte quand on tourne le téléphone (portrait ou paysage) */
function terrainImage(url) {
  terrainImageFermer();
  const o = document.createElement("div");
  o.id = "trImg";
  o.innerHTML = `<img src="${esc(url)}" alt="Schéma"><span>Touchez pour fermer</span>`;
  o.addEventListener("click", terrainImageFermer);
  document.body.appendChild(o);
}
function terrainImageFermer() {
  const o = document.getElementById("trImg");
  if (o) o.remove();
}

/* ---------- son de fin de minuterie ----------
   Réglé par l'administrateur (Administration > Réglages) : « preset:xxx » (sons générés) ou « sons/fichier.mp3 ».
   Mémorisé dans le navigateur (localStorage « trSon ») pour fonctionner sans connexion. */
const SONS = {
  bip: "Bip bip bip",
  cloche: "Cloche",
  gong: "Gong",
  sifflet: "Sifflet",
  alarme: "Alarme",
};
let TRCTX = null,
  TRAUD = null,
  TRAUDURL = "";
const sonCourant = () => {
  try {
    return localStorage.getItem("trSon") || "preset:bip";
  } catch (e) {
    return "preset:bip";
  }
};
function sonMemoriser(v) {
  try {
    localStorage.setItem("trSon", v);
  } catch (e) {}
}
/* au lancement du mode terrain : récupère le son choisi et précharge le fichier (pour qu'il marche hors connexion) */
function sonPrecharger() {
  if (CONFIG.GAME_ADD_URL)
    fetch(CONFIG.GAME_ADD_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "reglages", key: CONFIG.GAME_ADD_KEY || "" }),
    })
      .then(r => r.json())
      .then(j => {
        if (j && j.ok && j.son) {
          sonMemoriser(j.son);
          sonFichier(j.son);
        }
      })
      .catch(() => {});
  sonFichier(sonCourant());
}
function sonFichier(spec) {
  if (!/^sons\//.test(spec)) return;
  try {
    fetch(spec).catch(() => {});
  } catch (e) {}
}
function sonCtx() {
  if (!TRCTX) {
    try {
      TRCTX = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  }
  return TRCTX;
}
/* à appeler dans un clic : les navigateurs n'autorisent le son qu'après un geste de la personne */
function sonDeverrouiller() {
  const c = sonCtx();
  try {
    if (c && c.state === "suspended") c.resume();
  } catch (e) {}
  const spec = sonCourant();
  if (/^sons\//.test(spec)) {
    try {
      if (!TRAUD || TRAUDURL !== spec) {
        TRAUD = new Audio(spec);
        TRAUDURL = spec;
      }
      TRAUD.muted = true;
      TRAUD.play()
        .then(() => {
          TRAUD.pause();
          TRAUD.currentTime = 0;
          TRAUD.muted = false;
        })
        .catch(() => {
          TRAUD.muted = false;
        });
    } catch (e) {}
  }
}
function sonJouer(spec, boucle) {
  spec = spec || "preset:bip";
  if (/^sons\//.test(spec)) {
    try {
      if (!TRAUD || TRAUDURL !== spec) {
        TRAUD = new Audio(spec);
        TRAUDURL = spec;
      }
      TRAUD.muted = false;
      TRAUD.loop = !!boucle;
      TRAUD.currentTime = 0;
      TRAUD.play().catch(() => sonPreset("bip"));
    } catch (e) {
      sonPreset("bip");
    }
  } else sonPreset(spec.replace(/^preset:/, ""));
}
function sonPreset(nom) {
  const a = sonCtx();
  if (!a) return;
  try {
    if (a.state === "suspended") a.resume();
    const t0 = a.currentTime + 0.02;
    /* une note : fréquence f, début t, durée d, forme, volume v, enveloppe (percussive : décroissance) */
    const note = (f, t, d, type, v, perc) => {
      const o = a.createOscillator(),
        g = a.createGain();
      o.type = type;
      o.frequency.value = f;
      o.connect(g);
      g.connect(a.destination);
      g.gain.setValueAtTime(v, t0 + t);
      if (perc) g.gain.exponentialRampToValueAtTime(0.0008, t0 + t + d);
      else g.gain.setValueAtTime(0.0001, t0 + t + d);
      o.start(t0 + t);
      o.stop(t0 + t + d + 0.02);
      return o;
    };
    if (nom === "cloche") {
      [1, 2.76, 5.4].forEach((m, i) =>
        note(660 * m, 0, 2.2 / (i + 1), "sine", 0.3 / (i + 1), true)
      );
    } else if (nom === "gong") {
      [1, 1.5, 2.02, 2.76].forEach((m, i) =>
        note(110 * m, 0, 3.2 - i * 0.5, "sine", 0.35 / (i + 1), true)
      );
    } else if (nom === "sifflet") {
      [0, 0.7].forEach(t => {
        const o = note(2600, t, 0.5, "sine", 0.25, false),
          l = a.createOscillator(),
          lg = a.createGain();
        l.frequency.value = 38;
        lg.gain.value = 120;
        l.connect(lg);
        lg.connect(o.frequency);
        l.start(t0 + t);
        l.stop(t0 + t + 0.52);
      });
    } else if (nom === "alarme") {
      for (let i = 0; i < 6; i++) note(i % 2 ? 620 : 880, i * 0.22, 0.2, "square", 0.12, false);
    } else {
      [0, 0.25, 0.5].forEach(t => note(880, t, 0.15, "sine", 0.25, false));
    }
  } catch (e) {}
}
