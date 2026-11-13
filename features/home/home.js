/* Page d'accueil */
function homeView() {
  const prepa = DISC === "prepa";
  const nb = DATA.filter(g => discDe(g) === DISC).length;
  const tiles = famsDisc()
    .map(n => {
      const f = FAMS[n];
      return `<div class="tile" style="--l:${f.l};--d:${f.d};--a:${f.a}" data-go="fam/${esc(n)}"><div class="k">${f.k}</div><h3>${esc(n)}</h3><div class="c">${DATA.filter(g => g.Famille === n).length} ${DISC === "prepa" ? "exercices" : "jeux"}</div><p>${esc(AX.FAMDESC[n])}</p></div>`;
    })
    .join("");
  const fresh = DATA.filter(g => !isEmb(g) && discDe(g) === DISC)
    .slice(-6)
    .reverse();
  return `<p class="warn" id="warn"></p><div class="hero">${
    prepa
      ? `<h2>Prépa physique : renforcer, assouplir, récupérer</h2><p>${nb} fiches d'exercices pour compléter l'escalade : renforcement des muscles peu sollicités, poutre et mobilité, avec le dosage, les points de vigilance et des progressions.</p>`
      : `<h2>Les jeux d'escalade, prêts à animer</h2><p>${nb} fiches d'exercices pédagogiques sous forme de jeux, avec schéma, variantes et conseils de sécurité, pour apprendre à grimper à tous les âges : enfants, ados et adultes.</p>`
  }<input class="search" id="hq" type="search" placeholder="${prepa ? "Rechercher un exercice, un muscle, un matériel…" : "Rechercher un jeu, un matériel, un mot…"}" autocomplete="off"></div>
  <div class="sh">CHOISIR UNE FAMILLE</div><div class="tiles">${tiles}</div>
  <div class="sh">ACCÈS RAPIDE</div><div class="chips">${prepa ? "" : `<button class="chip" data-go="anniv">★ ${LBL_SANS_EXP}</button>`}<button class="chip" data-go="nomat">○ Sans matériel</button>${(prepa ? [] : COMP_NOMS.map(c => ["comp/" + c, c]))
    .concat(objsDisc().map(o => ["obj/" + o, o]))
    .map(([r, o]) => `<button class="chip" data-go="${r}">${o}</button>`)
    .join(
      ""
    )}<button class="chip" id="rnd">🎲 ${prepa ? "Un exercice" : "Un jeu"} au hasard</button></div>
  ${fresh.length ? `<div class="sh">DERNIÈRES FICHES AJOUTÉES</div>${((S.mode = "grid"), gridHTML(fresh))}` : ""}
  ${prepa ? "" : '<div class="sh">GUIDES POUR PRÉPARER SA SÉANCE</div>'}<div class="g2">${(prepa
    ? []
    : GUIDES.slice(0, 6)
  )
    .map(
      ([k, l, i]) =>
        `<div class="box" style="cursor:pointer;margin:0" data-go="g/${k}"><b style="color:#86690F">${i}  ${l}</b></div>`
    )
    .join("")}</div>`;
}

registerNav({
  sec: "",
  secOrder: 0,
  order: 0,
  html: () => navBtn("home", "Accueil", '<span class="ic">⌂</span>'),
});
registerView({
  match: v => v === "home",
  html: () => homeView(),
  bind: () => {
    const hq = $("#hq");
    if (hq)
      hq.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          S.q = hq.value;
          go("all");
        }
      });
    const r = $("#rnd");
    if (r)
      r.addEventListener("click", () => {
        const L = DATA.filter(x => discDe(x) === DISC);
        const g = L[Math.floor(Math.random() * L.length)];
        go("jeu/" + encodeURIComponent(key(g)));
      });
  },
});

/* ---------- sélecteur de discipline (en haut du menu) ---------- */
function majTitreDisc() {
  /* le nom du site ne change pas avec la discipline (le sélecteur du menu dit laquelle on voit) */
  const t = "Le Carnet de l'Éducateur";
  const h = document.querySelector(".brand h1"),
    b = document.querySelector(".bar b");
  if (h) h.textContent = t;
  if (b) b.textContent = t;
  document.title = t + " — " + DISCIPLINES[DISC].nom;
}
function setDisc(d) {
  if (!DISCIPLINES[d] || d === DISC) return;
  if (d === "prepa" && !prepaOuverte()) return;
  DISC_MASQ = false;
  DISC = d;
  try {
    localStorage.setItem("discipline", d);
  } catch (e) {}
  S.q = "";
  GLF.fam = "";
  GLF.obj = "";
  GLF.comp = "";
  if (typeof seSwitch === "function") seSwitch();
  buildNav();
  /* changer de discipline ramène toujours à l'accueil */
  if (VIEW === "home") render();
  else go("home");
}
registerNav({
  sec: "",
  secOrder: -1,
  order: 0,
  html: () =>
    !prepaOuverte()
      ? ""
      : `<div class="discsw" role="group" aria-label="Discipline">${Object.entries(DISCIPLINES)
      .map(
        ([k, d]) =>
          `<button data-disc="${k}" aria-pressed="${k === DISC}" class="${k === DISC ? "on" : ""}">${esc(d.nom)}</button>`
      )
      .join("")}</div>`,
});
registerClick(e => {
  const b = e.target.closest("[data-disc]");
  if (!b) return;
  setDisc(b.dataset.disc);
  return true;
});
