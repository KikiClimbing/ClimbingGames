/* Éditeur de schémas — palette de pièces et page */
const EDP = {
  hold: c => ({ t: "hold", x: 50, y: 19, c, r: 1.35 }),
  ring: c => ({ t: "ring", x: 50, y: 19, c, r: 2.6 }),
  climber: c => ({
    t: "climber",
    x: 50,
    y: 15,
    c,
    s: 1,
    hip: 0,
    hands: [
      [-7, 8.5],
      [7.5, 7],
    ],
    feet: [
      [-5.4, -5],
      [5.4, -5],
    ],
  }),
  stand: c => figFix({ t: "stand", x: 50, y: 5, c, s: 1 }),
  sit: c => figFix({ t: "sit", x: 50, y: 5, c, s: 1 }),
  hoopflat: () => ({ t: "hoopflat", x: 50, y: 19, s: 1 }),
  hoopfloor: () => ({ t: "hoopfloor", x: 50, y: 6, s: 1 }),
  hoopside: () => ({ t: "hoopside", x: 50, y: 19, s: 1 }),
  phold: c => ({ t: "phold", d: 6 + Math.round(Math.random() * 16), c, r: 1.3 }),
  pclimber: c => figFix({ t: "pclimber", x: 40, y: 14, c, s: 1, hip: 0 }),
  elastic: c => ({ t: "elastic", x1: 30, y1: 12, x2: 70, y2: 12, c, bend: 0.08 }),
  rotarrow: a => ({
    t: "rotarrow",
    x: 50,
    y: 19,
    s: 1,
    c: a.split("|")[0],
    cw: a.split("|")[1] !== "ccw",
  }),
  plaque: c => ({ t: "plaque", x: 50, y: 19, s: 1, c, rot: 0, lab: "" }),
  shoe: c => ({ t: "shoe", x: 50, y: 19, s: 1, c, rot: 0, flip: false }),
  pion: c => ({ t: "pion", x: 50, y: 19, s: 1, c, rot: 0 }),
  scarf: c => ({ t: "scarf", x: 50, y: 19, s: 1.5, c }),
  ball: () => ({ t: "ball", x: 50, y: 19, s: 1.5 }),
  die: () => ({ t: "die", x: 50, y: 19, s: 1, n: 5 }),
  watch: () => ({ t: "watch", x: 86, y: 29, s: 1 }),
  quickdraw: () => ({ t: "quickdraw", x: 50, y: 19, s: 1.2 }),
  tape: () => ({ t: "tape", x: 50, y: 19 }),
  rope: c => ({ t: "rope", x1: 30, y1: 30, x2: 30, y2: 6, c, bend: 0.15 }),
  line: (c, d) => ({ t: "line", x1: 35, y1: 19, x2: 65, y2: 19, c, dash: !!d }),
  zone: c => ({ t: "zone", x: 50, y: 19, w: 24, h: 10, c }),
  zonecircle: c => ({ t: "zonecircle", x: 50, y: 19, s: 1, c }),
  cone: () => ({ t: "cone", x: 50, y: 5, s: 1 }),
  bench: () => ({ t: "bench", x: 50, y: 5, s: 1 }),
  mat: () => ({ t: "mat", x: 50, y: 4, s: 1 }),
  foot: c => ({ t: "foot", x: 50, y: 19, s: 1, c, rot: 0 }),
  handp: c => ({ t: "handp", x: 50, y: 19, s: 1, c, rot: 0 }),
  cross: () => ({ t: "cross", x: 50, y: 19, s: 1 }),
  check: () => ({ t: "check", x: 50, y: 19, s: 1 }),
  star: c => ({ t: "star", x: 50, y: 19, s: 1, c }),
  num: c => ({ t: "num", x: 50, y: 19, s: 1, c, n: 1 }),
  flag: c => ({ t: "flag", x: 50, y: 19, s: 1, c }),
  target: () => ({ t: "target", x: 50, y: 19, s: 1 }),
  card: () => ({ t: "card", x: 50, y: 19, s: 1 }),
  volume: c => ({ t: "volume", x: 50, y: 19, s: 1, c }),
  arrow: (c, d) => ({ t: "arrow", x1: 36, y1: 19, x2: 64, y2: 19, c, dash: !!d, bend: 0 }),
  text: () => ({ t: "text", x: 50, y: 28, s: "Mon texte", c: "ink", fs: 1.9 }),
};
function edPaletteHTML() {
  const sec = (t, b) =>
    `<div class="psec"><div class="ptitle">${t}</div><div class="pbtns">${b}</div></div>`;
  const pb = (k, a, label, extra = "") =>
    `<button class="pbtn" data-pal="${k}:${a}" title="${label}">${extra || label}</button>`;
  const dot = c =>
    `<span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${c};border:2px solid ${darken(c)}"></span>`;
  return (
    sec(
      "PRISES",
      HOLDC.map((c, i) => pb("hold", c, "Prise " + HOLDN[i], dot(c))).join("") +
        `<button class="pbtn wide" id="edSeed">Semer des prises au hasard</button>`
    ) +
    sec(
      "VUE DE PROFIL",
      HOLDC.map((c, i) => pb("phold", c, "Prise de profil " + HOLDN[i], dot(c))).join("") +
        pb("pclimber", "blue", "Grimpeur de profil bleu", "🧗 profil bleu") +
        pb("pclimber", "red", "Grimpeur de profil rouge", "🧗 profil rouge")
    ) +
    sec(
      "ANNEAUX",
      pb(
        "ring",
        "green",
        "Prise cible",
        `<span class="ringi" style="border-color:${EGREEN}"></span> cible`
      ) +
        pb(
          "ring",
          "amber",
          "Prise imposée",
          `<span class="ringi" style="border-color:${EAMB}"></span> imposée`
        )
    ) +
    sec(
      "PERSONNAGES",
      pb("climber", "blue", "Grimpeur bleu", "🧗 bleu") +
        pb("climber", "red", "Grimpeur rouge", "🧗 rouge") +
        pb("stand", "blue", "Debout bleu", "🧍 bleu") +
        pb("stand", "red", "Debout rouge", "🧍 rouge") +
        pb("sit", "blue", "Assis bleu", "assis bleu") +
        pb("sit", "red", "Assis rouge", "assis rouge")
    ) +
    sec(
      "OBJETS",
      pb("hoopflat", "", "Cerceau vertical (de face)", "cerceau vertical") +
        pb("hoopfloor", "", "Cerceau horizontal (à plat au sol)", "cerceau horizontal") +
        pb("hoopside", "", "Cerceau vertical (de profil)", "cerceau profil") +
        pb("pion", "blue", "Joueur vu de dessus (bleu)", "joueur dessus bleu") +
        pb("pion", "red", "Joueur vu de dessus (rouge)", "joueur dessus rouge") +
        pb("plaque", "blue", "Plaquette bleue", "plaquette bleue") +
        pb("plaque", "red", "Plaquette rouge", "plaquette rouge") +
        pb("plaque", "amber", "Plaquette ambre", "plaquette ambre") +
        pb("shoe", "blue", "Chausson d'escalade", "chausson") +
        pb("scarf", EBLUE, "Foulard bleu", "foulard bleu") +
        pb("scarf", ERED, "Foulard rouge", "foulard rouge") +
        pb("scarf", "#F7D858", "Foulard jaune", "foulard jaune") +
        pb("ball", "", "Ballon", "ballon") +
        pb("die", "", "Dé", "dé") +
        pb("watch", "", "Chronomètre", "chrono") +
        pb("quickdraw", "", "Dégaine", "dégaine") +
        pb("tape", "", "Scotch", "scotch") +
        pb("cone", "", "Plot", "plot") +
        pb("bench", "", "Banc", "banc") +
        pb("mat", "", "Tapis", "tapis") +
        pb("card", "", "Carte", "carte") +
        pb("target", "", "Cible", "cible") +
        pb("flag", "red", "Fanion", "fanion") +
        pb("volume", "#A894E6", "Volume", "volume")
    ) +
    sec(
      "CORDES ET LIGNES",
      pb("rope", "amber", "Corde ambre", "corde") +
        pb("rope", "blue", "Corde bleue", "corde bleue") +
        pb("rope", "red", "Corde rouge", "corde rouge") +
        pb("elastic", "red", "Élastique rouge", "élastique rouge") +
        pb("elastic", "blue", "Élastique bleu", "élastique bleu") +
        pb("elastic", "amber", "Élastique ambre", "élastique ambre") +
        pb("line", "ink:0", "Ligne (départ, limite)", "ligne") +
        pb("line", "ink:1", "Ligne pointillée", "ligne pointillée")
    ) +
    sec(
      "ZONES ET REPÈRES",
      pb("zone", "blue", "Zone rectangulaire", "zone") +
        pb("zone", "red", "Zone rouge", "zone rouge") +
        pb("zonecircle", "green", "Zone ronde", "zone ronde") +
        pb("foot", "blue", "Empreinte de pied", "👣 pied") +
        pb("handp", "blue", "Empreinte de main", "✋ main") +
        pb("num", "blue", "Numéro", "n°") +
        pb("star", "amber", "Étoile", "★ étoile") +
        pb("check", "", "Validé", "✓") +
        pb("cross", "", "Interdit", "✗")
    ) +
    sec(
      "FLÈCHES ET TEXTE",
      pb("arrow", "ink:0", "Flèche pleine", "→ pleine") +
        pb("arrow", "blue:1", "Flèche bleue pointillée", "→ bleue") +
        pb("arrow", "red:1", "Flèche rouge pointillée", "→ rouge") +
        pb("arrow", "green:1", "Flèche verte pointillée", "→ verte") +
        pb("rotarrow", "blue|cw", "Flèche de rotation (sens horaire)", "↻ rotation") +
        pb("rotarrow", "blue|ccw", "Flèche de rotation (sens anti-horaire)", "↺ rotation") +
        pb("text", "", "Zone de texte", "Texte")
    )
  );
}
function editorHTML() {
  return `<h2 class="pt">Dessiner un schéma</h2><p class="lead">Construisez un schéma dans le style des fiches : placez les prises, les grimpeurs, les objets et les flèches, puis exportez l'image. Votre brouillon est enregistré dans ce navigateur.</p>
${edCtxHTML()}<div class="edwrap"><aside class="edpal" id="edpal">${edPaletteHTML()}</aside>
<section class="edmain"><div class="edtools"><button class="chip" id="edUndo">↶ Annuler</button><button class="chip" id="edRedo">↷ Rétablir</button><button class="chip" id="edExample">Exemple</button><button class="chip" id="edClear">Tout effacer</button><span class="grow" style="flex:1"></span><button class="chip" id="edSaveJson">Enregistrer le brouillon</button><label class="chip" style="cursor:pointer">Ouvrir un brouillon<input type="file" id="edOpen" accept=".json" hidden></label><button class="btn" id="edPng" style="background:#26364D;color:#fff;border:0;border-radius:8px;padding:8px 16px;font-weight:700;cursor:pointer">Exporter en PNG</button><button class="chip" id="edSvg">SVG</button></div>
<div class="box" style="margin:0 0 10px;display:flex;gap:10px;flex-wrap:wrap;align-items:center"><b>Envoyer dans le site</b><select id="edFam" style="padding:7px;border:1px solid #D5DAE5;border-radius:6px;font:inherit"></select><input id="edName" placeholder="Nom du fichier (automatique selon la catégorie)" style="flex:1;min-width:180px;padding:7px;border:1px solid #D5DAE5;border-radius:6px;font:inherit"><button class="chip" id="edUp" style="background:#26364D;color:#fff;border-color:#26364D">Envoyer</button><div id="edUpMsg" style="flex-basis:100%;font-size:14px"></div></div>
<div class="edcan"><svg id="edsvg" viewBox="0 0 100 36" xmlns="http://www.w3.org/2000/svg"></svg></div>
<div class="box" style="margin-top:12px;font-size:14.5px"><b>Pour l'ajouter à une fiche :</b> cliquez sur « Envoyer », copiez le lien obtenu et collez-le dans le champ <i>Schéma (lien)</i> de la fiche (ou exportez le PNG et déposez-le vous-même dans le dossier schemas/ du dépôt).</div></section>
<aside class="edpanel" id="edpanel"></aside></div>`;
}
