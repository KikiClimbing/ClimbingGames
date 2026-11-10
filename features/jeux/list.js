/* Catalogue : listes de jeux (toutes, par famille, par objectif…) et vignettes */
/* vignette : image de la carte pour les jeux intégrés, sinon carte générée automatiquement
   (famille, code, titre, résumé, schéma s'il existe, durée / effectif / intensité) */
/* pastille « Antagoniste » (prépa physique, exercices de renforcement des muscles opposés à ceux de la grimpe) */
function typePill(g) {
  if (!g || g.Type !== "Antagoniste") return "";
  return `<span class="tpill" style="background:#FDE7C8;color:#8A4B00;font-weight:700" title="Muscles opposés à ceux de la grimpe">Antagoniste</span>`;
}
function thumb(g) {
  if (isEmb(g)) return `<img loading="lazy" src="cartes/${esc(g.Code)}.jpg" alt="${esc(g.Titre)}">`;
  const s = driveImg(g["Schéma (lien)"] || g["Schéma"]);
  const puces = (DISC === "prepa" ? [g["Durée"]] : [g["Durée"], g["Effectif court"] || g.Participants, g["Intensité"]])
    .filter(Boolean)
    .map(x => `<span>${esc(x)}</span>`)
    .join("") + typePill(g);
  return `<div class="auto"><div class="ah"><div class="af">${esc((g.Famille || "").toUpperCase())}</div><div class="ac">${esc(g.Code || "★")}</div><div class="at">${esc(g.Titre)}</div><div class="ar">${esc(g["Résumé"])}</div></div>${s ? `<div class="ai"><img loading="lazy" src="${esc(s)}" alt="" onerror="this.parentNode.remove()"></div>` : ""}<div class="ap">${puces}</div></div>`;
}
function viewTitle(v) {
  if (v === "home") return ["Accueil", ""];
  if (v === "fav")
    return [
      "Mes favoris",
      "Les jeux que vous avez marqués d'une étoile (enregistrés dans ce navigateur, pour votre compte).",
    ];
  if (v === "all")
    return DISC === "prepa"
      ? [
          "Tous les exercices",
          "Renforcement, poutre et mobilité : des exercices à faire les jours sans escalade ou en complément des séances.",
        ]
      : [
          "Tous les jeux",
          "Le catalogue complet. Utilisez la recherche et les filtres pour trouver le jeu qu'il vous faut.",
        ];
  if (v.startsWith("fam/")) {
    const n = decodeURIComponent(v.slice(4));
    return [n, AX.FAMDESC[n] || ""];
  }
  if (v.startsWith("obj/"))
    return [
      "Objectif : " + decodeURIComponent(v.slice(4)),
      "Les jeux qui travaillent cet objectif.",
    ];
  if (v.startsWith("pcat/")) {
    const n = decodeURIComponent(v.slice(5)),
      c = POUTRE_CATS.find(x => x[0] === n);
    return ["Poutre : " + n, c ? c[1] : "Les exercices de poutre de cette filière."];
  }
  if (v.startsWith("comp/")) {
    const n = decodeURIComponent(v.slice(5)),
      c = COMPETENCES.find(x => x[0] === n);
    return ["Compétence : " + n, c ? c[1] : "Les jeux qui travaillent cette compétence."];
  }
  if (v === "anniv")
    return [
      LBL_SANS_EXP,
      "Jeux ludiques qui ne demandent aucune expérience de l'escalade (hors cours d'escalade) : animation, anniversaire, initiation, groupe de débutants.",
    ];
  if (v === "nomat") return ["Sans matériel", "Jeux qui ne demandent aucun matériel particulier."];
  return ["", ""];
}
function filterGames(v) {
  /* la discipline choisie (menu) limite les listes générales ; une famille ou les favoris montrent tout */
  let L = DATA.filter(g => v.startsWith("fam/") || v === "fav" || discDe(g) === DISC);
  if (v.startsWith("fam/")) L = L.filter(g => g.Famille === decodeURIComponent(v.slice(4)));
  else if (v.startsWith("pcat/")) {
    const c = decodeURIComponent(v.slice(5));
    L = L.filter(g => g.Famille === "Poutre" && g["Catégorie"] === c);
  } else if (v.startsWith("obj/")) {
    const o = decodeURIComponent(v.slice(4));
    L = L.filter(g =>
      (g["Objectifs (tags)"] || "")
        .split(",")
        .map(s => s.trim())
        .includes(o)
    );
  } else if (v.startsWith("comp/")) {
    const c = decodeURIComponent(v.slice(5));
    L = L.filter(g => compDe(g).includes(c));
  } else if (v === "fav") L = L.filter(isFav);
  else if (v === "anniv") L = L.filter(isAnniv);
  else if (v === "nomat") L = L.filter(noMat);
  if (S.int) L = L.filter(g => g["Intensité"] === S.int);
  const q = norm(S.q);
  if (q)
    L = L.filter(g => {
      const hay = norm(Object.values(g).join(" "));
      return q.split(/\s+/).every(w => hay.includes(w));
    });
  return L.sort(parCode);
}
/* tri par code : lettres puis numéro (C2 avant C10) ; les jeux sans code à la fin */
function parCode(a, b) {
  const p = g => {
    const m = String(g.Code || "").match(/^([A-Za-zÀ-ÿ]*)(\d*)/);
    const l = m[1].toUpperCase() || "\uffff";
    /* Prépa physique : renforcement, puis mobilité */
    return [DISC === "prepa" && "RMK".includes(l) ? "RMK".indexOf(l) + "" : l, +m[2] || 0];
  };
  const x = p(a),
    y = p(b);
  return x[0] === y[0]
    ? x[1] - y[1] || String(a.Titre).localeCompare(b.Titre)
    : x[0] < y[0]
      ? -1
      : 1;
}
function gridHTML(L) {
  if (!L.length)
    return '<div class="empty">Aucun jeu ne correspond. Essayez d\'enlever un filtre.</div>';
  if (S.mode === "list")
    return (
      (DISC === "prepa"
        ? `<table class="lst"><thead><tr><th>CODE</th><th>EXERCICE</th><th>TYPE</th><th>DURÉE</th><th class="hm">MATÉRIEL</th></tr></thead><tbody>`
        : `<table class="lst"><thead><tr><th>CODE</th><th>JEU</th><th>DURÉE</th><th class="hm">EFFECTIF</th><th class="hm">MATÉRIEL</th><th>INTENSITÉ</th></tr></thead><tbody>`) +
      L.map(
        g =>
          DISC === "prepa"
            ? `<tr class="r" data-jeu="${esc(key(g))}" style="${style(g)}"><td>${esc(g.Code || "★")} ${favEtoile(g)}</td><td><b>${esc(g.Titre)}</b><br><span style="color:#6B7280">${esc(g["Résumé"])}</span></td><td>${typePill(g)}</td><td>${esc(g["Durée"])}</td><td class="hm">${esc(g["Matériel"])}</td></tr>`
            : `<tr class="r" data-jeu="${esc(key(g))}" style="${style(g)}"><td>${esc(g.Code || "★")} ${favEtoile(g)}</td><td><b>${esc(g.Titre)}</b><br><span style="color:#6B7280">${esc(g["Résumé"])}</span></td><td>${esc(g["Durée"])}</td><td class="hm">${esc(g["Effectif court"] || g.Participants)}</td><td class="hm">${esc(g["Matériel"])}</td><td>${esc(g["Intensité"])}</td></tr>`
      ).join("") +
      "</tbody></table>"
    );
  return (
    '<div class="grid">' +
    L.map(
      g =>
        `<div class="card" style="${style(g)}" data-jeu="${esc(key(g))}">${thumb(g)}${favEtoile(g)}</div>`
    ).join("") +
    "</div>"
  );
}
function listView(v) {
  const [t, l] = viewTitle(v);
  const L = filterGames(v);
  return `<h2 class="pt">${esc(t)}</h2><p class="lead">${esc(l)}</p><p class="warn" id="warn"></p>
  <div class="tools"><input class="search grow" id="q" type="search" placeholder="Rechercher dans cette liste…" value="${esc(S.q)}" autocomplete="off">
  <div class="seg"><button data-mode="grid" class="${S.mode === "grid" ? "on" : ""}">Galerie</button><button data-mode="list" class="${S.mode === "list" ? "on" : ""}">Liste</button></div></div>
  ${DISC === "prepa" ? "" : `<div class="chips" style="margin-bottom:14px"><span style="align-self:center;font-size:11px;letter-spacing:1px;color:#7a8497;font-weight:700">INTENSITÉ</span>${["Calme", "Modérée", "Intense"].map(i => `<button class="chip ${S.int === i ? "on" : ""}" data-int="${i}">${i}</button>`).join("")}</div>`}
  <p class="count" id="cnt">${L.length} jeu${L.length > 1 ? "x" : ""}</p><div id="res">${gridHTML(L)}</div>`;
}

registerNav({
  sec: "LES JEUX",
  secOrder: 10,
  order: 0,
  html: () => {
    const cnt = f => DATA.filter(g => g.Famille === f).length;
    const prepa = DISC === "prepa";
    return (
      navBtn(
        "all",
        `${prepa ? "Tous les exercices" : "Tous les jeux"}<span class="n">${DATA.filter(g => discDe(g) === DISC).length}</span>`,
        '<span class="ic">▦</span>'
      ) +
      famsDisc()
        .map(n =>
          navBtn(
            "fam/" + n,
            `${esc(n)}<span class="n">${cnt(n)}</span>`,
            `<span class="dot" style="background:${FAMS[n].a}"></span>`
          )
        )
        .join("")
    );
  },
});
/* menu « Compétences » (escalade) : 7 entrées repliables, ouvertes par défaut */
function compOuvert() {
  if (VIEW.startsWith("comp/")) return true;
  try {
    return localStorage.getItem("navComp") !== "0";
  } catch (e) {
    return true;
  }
}
/* menu « Poutre par filière » (prépa) */
function poutreOuvert() {
  if (VIEW.startsWith("pcat/") || VIEW === "fam/Poutre") return true;
  try {
    return localStorage.getItem("navPoutre") === "1";
  } catch (e) {
    return false;
  }
}
function poutreMenuHTML() {
  if (DISC !== "prepa") return "";
  const ouvert = poutreOuvert();
  const bt = `<button class="nav" data-navpoutre="1" aria-expanded="${ouvert}"><span class="ic">${ouvert ? "▾" : "▸"}</span>Poutre par filière</button>`;
  if (!ouvert) return bt;
  return `<div class="navgrp">${bt}${POUTRE_CATS.map(c => navBtn("pcat/" + c[0], c[0], '<span class="ic">›</span>')).join("")}</div>`;
}
registerClick(e => {
  if (!e.target.closest("[data-navpoutre]")) return;
  const o = !poutreOuvert();
  try {
    localStorage.setItem("navPoutre", o ? "1" : "0");
  } catch (er) {}
  if (!o && (VIEW.startsWith("pcat/") || VIEW === "fam/Poutre")) go("all");
  else buildNav();
  return true;
});
function compMenuHTML() {
  if (DISC === "prepa") return poutreMenuHTML();
  const ouvert = compOuvert();
  return (
    `<button class="nav" data-navcomp="1" aria-expanded="${ouvert}"><span class="ic">${ouvert ? "▾" : "▸"}</span>Compétences</button>` +
    (ouvert ? COMP_NOMS.map(c => navBtn("comp/" + c, c, '<span class="ic">›</span>')).join("") : "")
  );
}
registerClick(e => {
  if (!e.target.closest("[data-navcomp]")) return;
  const o = !compOuvert();
  try {
    localStorage.setItem("navComp", o ? "1" : "0");
  } catch (er) {}
  if (!o && VIEW.startsWith("comp/")) go("all");
  else buildNav();
  return true;
});
registerNav({
  sec: "PARCOURIR",
  secOrder: 20,
  order: 0,
  html: () =>
    compMenuHTML() +
    objsDisc()
      .map(o => navBtn("obj/" + o, o, `<span class="ic">${DISC === "prepa" ? "›" : "☀"}</span>`))
      .join("") +
    (DISC === "prepa" ? "" : navBtn("anniv", LBL_SANS_EXP, '<span class="ic">★</span>')) +
    navBtn("nomat", "Sans matériel", '<span class="ic">○</span>'),
});
registerView({
  fallback: true,
  match: v =>
    v === "all" ||
    v === "fav" ||
    v === "anniv" ||
    v === "nomat" ||
    v.startsWith("fam/") ||
    v.startsWith("obj/") ||
    v.startsWith("comp/") ||
    v.startsWith("pcat/"),
  html: v => listView(v),
  bind: () => {
    const q = $("#q");
    if (q)
      q.addEventListener("input", e => {
        S.q = e.target.value;
        const L = filterGames(VIEW);
        $("#cnt").textContent = L.length + " jeu" + (L.length > 1 ? "x" : "");
        $("#res").innerHTML = gridHTML(L);
      });
  },
});
registerClick(e => {
  const m = e.target.closest("[data-mode]");
  if (m) {
    S.mode = m.dataset.mode;
    try {
      localStorage.setItem("modeJeux", S.mode);
    } catch (e) {}
    render();
    return true;
  }
  const i = e.target.closest("[data-int]");
  if (i) {
    S.int = S.int === i.dataset.int ? null : i.dataset.int;
    render();
    return true;
  }
});
