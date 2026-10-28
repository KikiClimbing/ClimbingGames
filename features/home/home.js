/* Page d'accueil */
function homeView() {
  const tiles = Object.keys(FAMS)
    .map(n => {
      const f = FAMS[n];
      return `<div class="tile" style="--l:${f.l};--d:${f.d};--a:${f.a}" data-go="fam/${esc(n)}"><div class="k">${f.k}</div><h3>${esc(n)}</h3><div class="c">${DATA.filter(g => g.Famille === n).length} jeux</div><p>${esc(AX.FAMDESC[n])}</p></div>`;
    })
    .join("");
  const fresh = DATA.filter(g => !isEmb(g))
    .slice(-6)
    .reverse();
  return `<p class="warn" id="warn"></p><div class="hero"><h2>Les jeux d'escalade, prêts à animer</h2><p>${DATA.length} fiches d'exercices pédagogiques sous forme de jeux, avec schéma, variantes et conseils de sécurité, pour apprendre à grimper à tous les âges : enfants, ados et adultes.</p><input class="search" id="hq" type="search" placeholder="Rechercher un jeu, un matériel, un mot…" autocomplete="off"></div>
  <div class="sh">CHOISIR UNE FAMILLE</div><div class="tiles">${tiles}</div>
  <div class="sh">ACCÈS RAPIDE</div><div class="chips"><button class="chip" data-go="anniv">★ Format anniversaire</button><button class="chip" data-go="nomat">○ Sans matériel</button>${OBJS.map(o => `<button class="chip" data-go="obj/${o}">${o}</button>`).join("")}<button class="chip" id="rnd">🎲 Un jeu au hasard</button></div>
  ${fresh.length ? `<div class="sh">DERNIÈRES FICHES AJOUTÉES</div>${((S.mode = "grid"), gridHTML(fresh))}` : ""}
  <div class="sh">GUIDES POUR PRÉPARER SA SÉANCE</div><div class="g2">${GUIDES.slice(0, 6)
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
        const g = DATA[Math.floor(Math.random() * DATA.length)];
        go("jeu/" + encodeURIComponent(key(g)));
      });
  },
});
