/* Catalogue : listes de jeux (toutes, par famille, par objectif…) et vignettes */
/* vignette : image de la carte pour les jeux intégrés, sinon carte générée automatiquement
   (famille, code, titre, résumé, schéma s'il existe, durée / effectif / intensité) */
function thumb(g) {
  if (isEmb(g)) return `<img loading="lazy" src="cartes/${esc(g.Code)}.jpg" alt="${esc(g.Titre)}">`;
  const s = driveImg(g["Schéma (lien)"] || g["Schéma"]);
  const puces = [g["Durée"], g["Effectif court"] || g.Participants, g["Intensité"]]
    .filter(Boolean)
    .map(x => `<span>${esc(x)}</span>`)
    .join("");
  return `<div class="auto"><div class="ah"><div class="af">${esc((g.Famille || "").toUpperCase())}</div><div class="ac">${esc(g.Code || "★")}</div><div class="at">${esc(g.Titre)}</div><div class="ar">${esc(g["Résumé"])}</div></div>${s ? `<div class="ai"><img loading="lazy" src="${esc(s)}" alt="" onerror="this.parentNode.remove()"></div>` : ""}<div class="ap">${puces}</div></div>`;
}
function viewTitle(v) {
  if (v === "home") return ["Accueil", ""];
  if (v === "all")
    return [
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
  if (v === "anniv")
    return [
      "Format anniversaire",
      "Jeux pensés pour un anniversaire : 6 à 12 enfants de 6 à 11 ans, débutants, environ 1 heure.",
    ];
  if (v === "nomat") return ["Sans matériel", "Jeux qui ne demandent aucun matériel particulier."];
  return ["", ""];
}
function filterGames(v) {
  let L = DATA.slice();
  if (v.startsWith("fam/")) L = L.filter(g => g.Famille === decodeURIComponent(v.slice(4)));
  else if (v.startsWith("obj/")) {
    const o = decodeURIComponent(v.slice(4));
    L = L.filter(g =>
      (g["Objectifs (tags)"] || "")
        .split(",")
        .map(s => s.trim())
        .includes(o)
    );
  } else if (v === "anniv") L = L.filter(isAnniv);
  else if (v === "nomat") L = L.filter(noMat);
  if (S.int) L = L.filter(g => g["Intensité"] === S.int);
  const q = norm(S.q);
  if (q)
    L = L.filter(g => {
      const hay = norm(Object.values(g).join(" "));
      return q.split(/\s+/).every(w => hay.includes(w));
    });
  return L;
}
function gridHTML(L) {
  if (!L.length)
    return '<div class="empty">Aucun jeu ne correspond. Essayez d\'enlever un filtre.</div>';
  if (S.mode === "list")
    return (
      `<table class="lst"><thead><tr><th>CODE</th><th>JEU</th><th>DURÉE</th><th class="hm">EFFECTIF</th><th class="hm">MATÉRIEL</th><th>INTENSITÉ</th></tr></thead><tbody>` +
      L.map(
        g =>
          `<tr class="r" data-jeu="${esc(key(g))}" style="${style(g)}"><td>${esc(g.Code || "★")}</td><td><b>${esc(g.Titre)}</b><br><span style="color:#6B7280">${esc(g["Résumé"])}</span></td><td>${esc(g["Durée"])}</td><td class="hm">${esc(g["Effectif court"] || g.Participants)}</td><td class="hm">${esc(g["Matériel"])}</td><td>${esc(g["Intensité"])}</td></tr>`
      ).join("") +
      "</tbody></table>"
    );
  return (
    '<div class="grid">' +
    L.map(
      g => `<div class="card" style="${style(g)}" data-jeu="${esc(key(g))}">${thumb(g)}</div>`
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
  <div class="chips" style="margin-bottom:14px"><span style="align-self:center;font-size:11px;letter-spacing:1px;color:#7a8497;font-weight:700">INTENSITÉ</span>${["Calme", "Modérée", "Intense"].map(i => `<button class="chip ${S.int === i ? "on" : ""}" data-int="${i}">${i}</button>`).join("")}</div>
  <p class="count" id="cnt">${L.length} jeu${L.length > 1 ? "x" : ""}</p><div id="res">${gridHTML(L)}</div>`;
}

registerNav({
  sec: "LES JEUX",
  secOrder: 10,
  order: 0,
  html: () => {
    const cnt = f => DATA.filter(g => g.Famille === f).length;
    return (
      navBtn(
        "all",
        `Tous les jeux<span class="n">${DATA.length}</span>`,
        '<span class="ic">▦</span>'
      ) +
      Object.keys(FAMS)
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
registerNav({
  sec: "PARCOURIR",
  secOrder: 20,
  order: 0,
  html: () =>
    navBtn("anniv", "Format anniversaire", '<span class="ic">★</span>') +
    navBtn("nomat", "Sans matériel", '<span class="ic">○</span>') +
    OBJS.map(o => navBtn("obj/" + o, o, '<span class="ic">›</span>')).join(""),
});
registerView({
  fallback: true,
  match: v =>
    v === "all" || v === "anniv" || v === "nomat" || v.startsWith("fam/") || v.startsWith("obj/"),
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
