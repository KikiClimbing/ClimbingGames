/* Créer une séance — recherche d'exercices en fenêtre : filtres, liste et aperçu de la fiche du jeu.
   Ouverte par « 🔍 Chercher un exercice » dans une sous-section ; on peut ajouter plusieurs jeux sans la fermer. */
const RX = { sub: 0, q: "", sel: "" };
function rxListe() {
  const q = norm(RX.q);
  return glListe().filter(
    g => !q || norm([g.Code, g.Titre, g["Résumé"], g["Objectifs (tags)"]].join(" ")).includes(q)
  );
}
function rxItemsHTML() {
  const L = rxListe();
  return (
    `<div class="count" style="margin:4px 0">${L.length} jeu${L.length > 1 ? "x" : ""}</div>` +
    (L.map(g => {
      const k = key(g),
        c = famOf(g).d;
      return `<div class="rxi ${RX.sel === k ? "on" : ""}" data-rx="sel" data-k="${esc(k)}"><span class="rxc" style="background:${c}">${esc(g.Code || "★")}</span><span class="rxt"><b>${esc(g.Titre)}</b><br><span style="color:#6B7280;font-size:12px">${esc([g["Durée"], g["Intensité"], g.Participants].filter(Boolean).join(" · "))}</span></span>${seHas(k) ? '<span class="rxd" title="Déjà dans la séance">✓</span>' : ""}</div>`;
    }).join("") || '<div class="empty">Aucun jeu avec ces filtres.</div>')
  );
}
function rxApercuHTML() {
  const g = DATA.find(x => key(x) === RX.sel);
  if (!g)
    return `<div class="empty" style="margin-top:30px">Cliquez un jeu pour voir sa fiche.</div>`;
  const k = key(g),
    sub = RX.sub === "ech" ? { titre: "Échauffement" } : SE.subs.find(s => s.id === RX.sub),
    img = typeof crepsImg === "function" ? crepsImg(g) : "";
  const ligne = (t, v) => (v ? `<div><b>${t} :</b> ${esc(v)}</div>` : "");
  return `<div style="border-top:6px solid ${famOf(g).d};padding-top:8px"><h3 style="margin:0 0 4px">${esc(g.Code ? g.Code + " · " : "")}${esc(g.Titre)}</h3><div style="color:#6B7280;margin-bottom:6px">${esc(g.Famille || "")}</div>
  ${img ? `<img src="${esc(img)}" alt="Schéma" loading="lazy" style="max-width:100%;border:1px solid #D5DAE5;border-radius:6px;background:#fff">` : ""}
  <p style="margin:8px 0">${esc(g["Résumé"] || "")}</p>${g.Principe ? `<div style="white-space:pre-wrap;font-size:14px">${esc(g.Principe)}</div>` : ""}
  <div style="margin-top:8px;font-size:14px">${ligne("Participants", g.Participants)}${ligne("Espace", g.Espace)}${ligne("Matériel", g["Matériel"])}${ligne("Durée", g["Durée"])}${ligne("Intensité", g["Intensité"])}${ligne("Plus facile", g["Plus facile"])}${ligne("Plus difficile", g["Plus difficile"])}</div>
  <div class="tools" style="margin-top:12px"><a class="btn" data-rx="add" data-k="${esc(k)}" style="background:#2E7D4F;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">${seHas(k) ? "✓ Déjà dans la séance" : "＋ Ajouter à la séance"}${sub && sub.titre ? " (« " + esc(sub.titre) + " »)" : ""}</a><a class="chip" href="${esc(gameUrl(k))}" target="_blank" rel="noopener">Fiche complète ↗</a></div></div>`;
}
function rxOuvrir(subId) {
  RX.sub = subId;
  RX.sel = "";
  modal(
    "🔍 Chercher un exercice",
    `<div class="rx"><div class="rxl">${glFiltresHTML()}<input class="search" id="rxq" type="search" placeholder="Code, nom, mot-clé…" value="${esc(RX.q)}" style="margin:6px 0;width:100%"><div id="rxliste">${rxItemsHTML()}</div></div><div class="rxr" id="rxap">${rxApercuHTML()}</div></div>`,
    1200,
    { fond: false }
  );
  glBind();
  document.querySelectorAll("#mpop [data-glf]").forEach(i =>
    i.addEventListener("change", () => {
      $("#rxliste").innerHTML = rxItemsHTML();
    })
  );
  $("#rxq").addEventListener("input", e => {
    RX.q = e.target.value;
    $("#rxliste").innerHTML = rxItemsHTML();
  });
}
registerClick(e => {
  const o = e.target.closest("[data-sa=rxopen]");
  if (o) {
    rxOuvrir(o.dataset.sub === "ech" ? "ech" : +o.dataset.sub);
    return true;
  }
  const b = e.target.closest("[data-rx]");
  if (!b) return;
  const k = b.dataset.k;
  if (b.dataset.rx === "sel") {
    RX.sel = k;
    $("#rxliste").innerHTML = rxItemsHTML();
    $("#rxap").innerHTML = rxApercuHTML();
    $("#rxap").scrollTop = 0;
  } else if (b.dataset.rx === "add" && !seHas(k)) {
    seAdd(k, RX.sub);
    seSave();
    buildNav();
    render();
    toast("✓ Ajouté à la séance");
    $("#rxliste").innerHTML = rxItemsHTML();
    $("#rxap").innerHTML = rxApercuHTML();
  }
  return true;
});
