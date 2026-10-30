/* Éditeur de schémas — panneau de réglages de la pièce sélectionnée */
function edPanel() {
  const p = $("#edpanel");
  if (!p) return;
  const e = ED.els.find(x => x.id === ED.sel);
  const COLH = [
    ["amber", EAMB, "ambre"],
    ["blue", EBLUE, "bleu"],
    ["red", ERED, "rouge"],
    ["green", EGREEN, "vert"],
    ["ink", EINK, "noir"],
    ["grey", EGREY, "gris"],
  ];
  const sw = (list, cur, attr) =>
    list
      .map(
        ([v, c, l]) =>
          `<button class="swt ${cur === v ? "on" : ""}" data-sw="${attr}:${v}" title="${l}" style="background:${c}"></button>`
      )
      .join("");
  if (!e) {
    const M = edMur(),
      top = ED.opt.mode === "dessus",
      pro = ED.opt.mode === "profil",
      W = edWall();
    const rg = (l, k, mn, mx, v) =>
      `<label class="fl2">${l}<input type="range" min="${mn}" max="${mx}" step="1" value="${v}" data-or="${k}"></label>`;
    p.innerHTML = `<h4>Réglages du schéma</h4>
   <label class="fl2">Type de vue<select id="oMode"><option value="face" ${!top ? "selected" : ""}>Vue de face (mur)</option><option value="dessus" ${top ? "selected" : ""}>Vue de dessus (aire de jeu)</option><option value="profil" ${pro ? "selected" : ""}>Vue de profil (mur incliné)</option></select></label>
   <label class="fl"><input type="checkbox" id="oMur" ${ED.opt.mur ? "checked" : ""}> ${top ? "Afficher l'aire de jeu" : "Afficher le mur"}</label>${top ? "" : `<label class="fl"><input type="checkbox" id="oTapis" ${ED.opt.tapis ? "checked" : ""}> Afficher le tapis</label>`}
   ${
     pro
       ? rg("Inclinaison du mur (° vers le grimpeur)", "incl", -20, 60, ED.opt.incl ?? 15) +
         rg("Longueur du mur", "murH", 8, 32, W.L) +
         rg("Position horizontale du pied du mur", "murX", 5, 90, W.gx)
       : rg(top ? "Largeur de l'aire" : "Largeur du mur", "murW", 10, 96, M.w) +
         rg(top ? "Hauteur de l'aire" : "Hauteur du mur", "murH", 8, 32, M.h) +
         rg("Position horizontale", "murX", 0, 90, M.x) +
         rg("Position verticale", "murY", 0, 26, M.y)
   }
   <label class="fl2">Étiquette en haut à droite<select id="oVue"><option ${ED.opt.vue === "VUE DE FACE" ? "selected" : ""}>VUE DE FACE</option><option ${ED.opt.vue === "VUE DE DESSUS" ? "selected" : ""}>VUE DE DESSUS</option><option ${ED.opt.vue === "VUE DE PROFIL" ? "selected" : ""}>VUE DE PROFIL</option><option value="" ${!ED.opt.vue ? "selected" : ""}>(aucune)</option></select></label>
   <label class="fl2">Légende sous le mur<input id="oLeg" value="${esc(ED.opt.legende)}" placeholder="Ex. : toucher un maximum de prises"></label>
   <p class="hint">Cliquez sur un élément du schéma pour le modifier. Glissez pour le déplacer.</p>`;
    p.querySelectorAll("[data-or]").forEach(i => {
      i.onpointerdown = () => edSnap();
      i.oninput = ev => {
        ED.opt[i.dataset.or] = +ev.target.value;
        edRender();
      };
    });
    $("#oMode").onchange = ev => {
      edSnap();
      ED.opt.mode = ev.target.value;
      ["murX", "murY", "murW", "murH"].forEach(k => delete ED.opt[k]);
      ED.opt.vue =
        { dessus: "VUE DE DESSUS", profil: "VUE DE PROFIL" }[ev.target.value] || "VUE DE FACE";
      edRender(true);
    };
    $("#oMur").onchange = ev => {
      edSnap();
      ED.opt.mur = ev.target.checked;
      edRender();
    };
    if ($("#oTapis"))
      $("#oTapis").onchange = ev => {
        edSnap();
        ED.opt.tapis = ev.target.checked;
        edRender();
      };
    $("#oVue").onchange = ev => {
      edSnap();
      ED.opt.vue = ev.target.value;
      edRender();
    };
    $("#oLeg").oninput = ev => {
      ED.opt.legende = ev.target.value;
      edRender();
    };
    return;
  }
  const T = {
    hold: "Prise",
    ring: "Anneau",
    climber: "Grimpeur",
    stand: "Personnage debout",
    sit: "Personnage assis",
    hoopflat: "Cerceau (face)",
    hoopfloor: "Cerceau (au sol)",
    hoopside: "Cerceau (profil)",
    pion: "Joueur (vue de dessus)",
    phold: "Prise de profil",
    elastic: "Élastique",
    rotarrow: "Flèche de rotation",
    plaque: "Plaquette",
    shoe: "Chausson",
    pclimber: "Grimpeur de profil",
    scarf: "Foulard",
    ball: "Ballon",
    die: "Dé",
    watch: "Chronomètre",
    quickdraw: "Dégaine",
    tape: "Scotch",
    arrow: "Flèche",
    text: "Texte",
    rope: "Corde",
    line: "Ligne",
    zone: "Zone rectangulaire",
    zonecircle: "Zone ronde",
    cone: "Plot",
    bench: "Banc",
    mat: "Tapis",
    foot: "Empreinte de pied",
    handp: "Empreinte de main",
    cross: "Interdit",
    check: "Validé",
    star: "Étoile",
    num: "Numéro",
    flag: "Fanion",
    target: "Cible",
    card: "Carte",
    volume: "Volume",
  }[e.t];
  let h = `<h4>${T}</h4>`;
  if (e.t === "hold")
    h += `<div class="sws">${sw(
      HOLDC.map((c, i) => [c, c, HOLDN[i]]),
      e.c,
      "c"
    )}</div><label class="fl2">Taille<input type="range" min="0.9" max="2.4" step="0.05" value="${e.r}" data-rg="r"></label>`;
  if (e.t === "ring")
    h += `<div class="sws">${sw(
      [
        ["green", EGREEN, "Prise cible (vert)"],
        ["amber", EAMB, "Prise imposée (ambre)"],
      ],
      e.c,
      "c"
    )}</div><label class="fl2">Taille<input type="range" min="1.5" max="4" step="0.1" value="${e.r}" data-rg="r"></label>`;
  if (e.t === "phold")
    h += `<div class="sws">${sw(
      HOLDC.map((c, i) => [c, c, HOLDN[i]]),
      e.c,
      "c"
    )}</div><label class="fl2">Taille<input type="range" min="0.8" max="2.6" step="0.05" value="${e.r}" data-rg="r"></label><label class="fl2">Position le long du mur<input type="range" min="0" max="${edWall().L}" step="0.5" value="${e.d}" data-rg="d"></label><p class="hint">Glissez la prise : elle reste collée au mur.</p>`;
  if (["climber", "stand", "sit", "pclimber"].includes(e.t))
    h +=
      `<div class="sws">${sw(
        [
          ["blue", EBLUE, "Équipe bleue"],
          ["red", ERED, "Équipe rouge"],
          ["grey", EGREY, "Éducateur"],
          ["green", EGREEN, "Vert"],
        ],
        e.c,
        "c"
      )}</div><label class="fl2">Taille<input type="range" min="0.5" max="1.8" step="0.05" value="${e.s}" data-rg="s"></label>` +
      `<label class="fl2">Inclinaison du corps<input type="range" min="-60" max="60" step="1" value="${e.lean || 0}" data-rg="lean"></label><label class="fl"><input type="checkbox" id="edSnapCk" ${ED.snap !== false ? "checked" : ""}> Aimanter aux prises</label><p class="hint">Glissez les points sur les mains et les pieds pour les placer : ils se collent à la prise la plus proche.</p>`;
  if (
    ["hoopflat", "hoopfloor", "hoopside", "ball", "watch", "quickdraw", "scarf", "die"].includes(
      e.t
    )
  )
    h += `<label class="fl2">Taille<input type="range" min="0.5" max="2.5" step="0.05" value="${e.s}" data-rg="s"></label>`;
  if (["hoopflat", "hoopfloor", "hoopside"].includes(e.t)) {
    const d = HOOPD[e.t];
    h += `<div class="sws">${sw(COLH, e.c || "amber", "c")}</div><label class="fl2">Largeur<input type="range" min="0.5" max="14" step="0.1" value="${e.w ?? d[0]}" data-rg="w"></label><label class="fl2">Hauteur<input type="range" min="0.5" max="14" step="0.1" value="${e.h ?? d[1]}" data-rg="h"></label><label class="fl2">Rotation<input type="range" min="-90" max="90" step="5" value="${e.rot || 0}" data-rg="rot"></label><label class="fl2">Épaisseur du trait<input type="range" min="0.2" max="1.4" step="0.05" value="${e.th || (e.t === "hoopflat" ? 0.62 : 0.56)}" data-rg="th"></label><label class="fl"><input type="checkbox" data-ck="fill" ${(e.fill ?? e.t === "hoopside") ? "checked" : ""}> Intérieur rempli</label>`;
  }
  if (e.t === "rotarrow")
    h += `<div class="sws">${sw(COLH, e.c || "blue", "c")}</div><label class="fl2">Taille<input type="range" min="0.4" max="3" step="0.05" value="${e.s}" data-rg="s"></label><label class="fl"><input type="checkbox" data-ck="cw" ${e.cw !== false ? "checked" : ""}> Sens horaire ↻</label><label class="fl"><input type="checkbox" data-ck="solid" ${e.solid ? "checked" : ""}> Trait plein</label>`;
  if (e.t === "plaque")
    h += `<div class="sws">${sw(COLH, e.c || "blue", "c")}</div><label class="fl2">Taille<input type="range" min="0.5" max="3" step="0.05" value="${e.s}" data-rg="s"></label><label class="fl2">Rotation<input type="range" min="-180" max="180" step="5" value="${e.rot || 0}" data-rg="rot"></label><label class="fl2">Texte (numéro, lettre)<input data-lab2 maxlength="4" value="${esc(e.lab || "")}"></label>`;
  if (e.t === "shoe")
    h += `<div class="sws">${sw(COLH, e.c || "blue", "c")}</div><label class="fl2">Taille<input type="range" min="0.5" max="3" step="0.05" value="${e.s}" data-rg="s"></label><label class="fl2">Rotation<input type="range" min="-180" max="180" step="5" value="${e.rot || 0}" data-rg="rot"></label><label class="fl"><input type="checkbox" data-ck="flip" ${e.flip ? "checked" : ""}> Retourner (miroir)</label>`;
  if (e.t === "elastic") h += `<div class="sws">${sw(COLH, e.c || "red", "c")}</div>`;
  if (e.t === "pion")
    h += `<div class="sws">${sw(COLH, e.c || "blue", "c")}</div><label class="fl2">Taille<input type="range" min="0.5" max="2.5" step="0.05" value="${e.s}" data-rg="s"></label><label class="fl2">Rotation<input type="range" min="-180" max="180" step="5" value="${e.rot || 0}" data-rg="rot"></label>`;
  if (["zone", "zonecircle"].includes(e.t))
    h += `<label class="fl"><input type="checkbox" data-ck="solid" ${e.solid ? "checked" : ""}> Trait plein (sans pointillés)</label>`;
  if (e.t === "scarf")
    h += `<div class="sws">${sw(
      [
        [EBLUE, EBLUE, "bleu"],
        [ERED, ERED, "rouge"],
        ["#F7D858", "#F7D858", "jaune"],
        ["#7FCB8F", "#7FCB8F", "vert"],
      ],
      e.c,
      "c"
    )}</div>`;
  if (e.t === "die")
    h += `<label class="fl2">Valeur<select data-sel="n">${[1, 2, 3, 4, 5, 6].map(n => `<option ${e.n == n ? "selected" : ""}>${n}</option>`).join("")}</select></label>`;
  if (e.t === "arrow")
    h += `<div class="sws">${sw(
      [
        ["ink", EINK, "noir"],
        ["blue", EBLUE, "bleu"],
        ["red", ERED, "rouge"],
        ["green", EGREEN, "vert"],
      ],
      e.c || "ink",
      "c"
    )}</div><label class="fl"><input type="checkbox" data-ck="dash" ${e.dash ? "checked" : ""}> Pointillés</label><label class="fl2">Courbure<input type="range" min="-0.6" max="0.6" step="0.05" value="${e.bend || 0}" data-rg="bend"></label><p class="hint">Glissez les deux points pour régler le départ et l'arrivée.</p>`;
  if (e.t === "text")
    h += `<label class="fl2">Texte<textarea data-tx rows="3">${esc(e.s)}</textarea></label><div class="sws">${sw(
      [
        ["ink", EINK, "noir"],
        ["green", EGREEN, "vert"],
        ["amber", "#8A6D12", "ambre"],
        ["blue", EBLUE, "bleu"],
        ["red", ERED, "rouge"],
      ],
      e.c || "ink",
      "c"
    )}</div>
   <div class="rowb" style="margin-top:6px"><button class="chip ${e.b !== false ? "on" : ""}" data-tg="b"><b>G</b></button><button class="chip ${e.i ? "on" : ""}" data-tg="i"><i>I</i></button><button class="chip ${e.u ? "on" : ""}" data-tg="u"><u>S</u></button><button class="chip ${(e.al || "c") === "l" ? "on" : ""}" data-al="l">⇤</button><button class="chip ${(e.al || "c") === "c" ? "on" : ""}" data-al="c">↔</button><button class="chip ${e.al === "r" ? "on" : ""}" data-al="r">⇥</button></div>
   <label class="fl2">Police<select data-sel2="font"><option value="sans" ${(e.font || "sans") === "sans" ? "selected" : ""}>Standard</option><option value="serif" ${e.font === "serif" ? "selected" : ""}>Avec empattements</option><option value="hand" ${e.font === "hand" ? "selected" : ""}>Manuscrite</option></select></label>
   <label class="fl2">Fond<select data-sel2="bg"><option value="white" ${(e.bg || "white") === "white" ? "selected" : ""}>Blanc</option><option value="tint" ${e.bg === "tint" ? "selected" : ""}>Teinté</option><option value="box" ${e.bg === "box" ? "selected" : ""}>Encadré</option><option value="none" ${e.bg === "none" ? "selected" : ""}>Sans fond</option></select></label>
   <label class="fl2">Taille<input type="range" min="1" max="5" step="0.1" value="${e.fs || 1.9}" data-rg="fs"></label>`;
  const COL5 = [
    ["blue", EBLUE, "bleu"],
    ["red", ERED, "rouge"],
    ["green", EGREEN, "vert"],
    ["amber", EAMB, "ambre"],
    ["ink", EINK, "noir"],
    ["grey", EGREY, "gris"],
  ];
  if (["foot", "handp", "star", "num", "flag", "zone", "zonecircle", "rope", "line"].includes(e.t))
    h += `<div class="sws">${sw(COL5, e.c || "x", "c")}</div>`;
  if (e.t === "volume")
    h += `<div class="sws">${sw(
      HOLDC.map((c, i) => [c, c, HOLDN[i]]),
      e.c,
      "c"
    )}</div>`;
  if (
    [
      "cone",
      "bench",
      "mat",
      "foot",
      "handp",
      "cross",
      "check",
      "star",
      "num",
      "flag",
      "target",
      "card",
      "volume",
      "zonecircle",
    ].includes(e.t)
  )
    h += `<label class="fl2">Taille<input type="range" min="0.5" max="3" step="0.05" value="${e.s}" data-rg="s"></label>`;
  if (["foot", "handp"].includes(e.t))
    h += `<label class="fl2">Rotation<input type="range" min="-180" max="180" step="5" value="${e.rot || 0}" data-rg="rot"></label>`;
  if (e.t === "zone")
    h += `<label class="fl2">Largeur<input type="range" min="4" max="80" step="1" value="${e.w || 20}" data-rg="w"></label><label class="fl2">Hauteur<input type="range" min="3" max="30" step="1" value="${e.h || 10}" data-rg="h"></label>`;
  if (e.t === "num")
    h += `<label class="fl2">Numéro<input type="number" min="0" max="99" value="${e.n || 1}" data-num></label>`;
  if (isLine(e))
    h += `<label class="fl2">Étiquette sur la ligne<input data-lab value="${esc(e.lab || "")}" placeholder="Ex. : 30 s, aller, retour"></label>`;
  if (["rope", "line", "elastic"].includes(e.t))
    h += `<label class="fl"><input type="checkbox" data-ck="dash" ${e.dash ? "checked" : ""}> Pointillés</label><label class="fl2">Courbure<input type="range" min="-0.6" max="0.6" step="0.05" value="${e.bend || 0}" data-rg="bend"></label><p class="hint">Glissez les deux points pour régler les extrémités.</p>`;
  h += `<div class="rowb"><button class="chip" data-op="dup">Dupliquer</button><button class="chip" data-op="front">Devant</button><button class="chip" data-op="back">Derrière</button><button class="chip" data-op="del" style="color:#B2263A">Supprimer</button></div>`;
  p.innerHTML = h;
  const sk = p.querySelector("#edSnapCk");
  if (sk)
    sk.onchange = ev => {
      ED.snap = ev.target.checked;
    };
  p.querySelectorAll("[data-rg]").forEach(i => {
    i.onpointerdown = () => edSnap();
    i.oninput = ev => {
      e[i.dataset.rg] = +ev.target.value;
      edRender();
    };
  });
  p.querySelectorAll("[data-sw]").forEach(
    b =>
      (b.onclick = () => {
        const [k, v] = b.dataset.sw.split(":");
        edSnap();
        e[k] = v;
        edRender(true);
      })
  );
  p.querySelectorAll("[data-sel]").forEach(
    s =>
      (s.onchange = ev => {
        edSnap();
        e[s.dataset.sel] = +ev.target.value;
        edRender();
      })
  );
  p.querySelectorAll("[data-ck]").forEach(
    c =>
      (c.onchange = ev => {
        edSnap();
        e[c.dataset.ck] = ev.target.checked;
        edRender();
      })
  );
  const l2 = p.querySelector("[data-lab2]");
  if (l2)
    l2.oninput = ev => {
      e.lab = ev.target.value;
      edRender();
    };
  const lb = p.querySelector("[data-lab]");
  if (lb)
    lb.oninput = ev => {
      e.lab = ev.target.value;
      edRender();
    };
  p.querySelectorAll("[data-tg]").forEach(
    b =>
      (b.onclick = () => {
        edSnap();
        const k = b.dataset.tg;
        e[k] = k === "b" ? !(e.b !== false) : !e[k];
        edRender(true);
      })
  );
  p.querySelectorAll("[data-al]").forEach(
    b =>
      (b.onclick = () => {
        edSnap();
        e.al = b.dataset.al;
        edRender(true);
      })
  );
  p.querySelectorAll("[data-sel2]").forEach(
    x =>
      (x.onchange = ev => {
        edSnap();
        e[x.dataset.sel2] = ev.target.value;
        edRender(true);
      })
  );
  const nm = p.querySelector("[data-num]");
  if (nm)
    nm.oninput = ev => {
      e.n = +ev.target.value;
      edRender();
    };
  const tx = p.querySelector("[data-tx]");
  if (tx)
    tx.oninput = ev => {
      e.s = ev.target.value;
      edRender();
    };
  p.querySelectorAll("[data-op]").forEach(b => (b.onclick = () => edOp(b.dataset.op)));
}
function edOp(op) {
  const i = ED.els.findIndex(x => x.id === ED.sel);
  if (i < 0) return;
  edSnap();
  const e = ED.els[i];
  if (op === "del") {
    ED.els.splice(i, 1);
    ED.sel = null;
  } else if (op === "dup") {
    const c = JSON.parse(JSON.stringify(e));
    c.id = ED.next++;
    if (isLine(c)) {
      c.x1 += 2;
      c.x2 += 2;
    } else if (c.t === "phold") c.d += 2.5;
    else c.x += 2;
    ED.els.push(c);
    ED.sel = c.id;
  } else if (op === "front" || op === "back") {
    const zs = ED.els.filter(x => x !== e).map(x => (typeof x.z === "number" ? x.z : edLayer(x)));
    if (zs.length) e.z = op === "front" ? Math.max(...zs) + 1 : Math.min(...zs) - 1;
  }
  edRender(true);
}
