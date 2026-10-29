/* Fenêtre de détail d'un jeu (onglets Principe, Pratique, Variantes, Conseils) */
function boldTitles(s) {
  return esc(s).replace(/^([^:\n<]{2,48}) : /gm, "<b>$1 :</b> ");
}
function openFiche(code) {
  const g = DATA.find(x => key(x) === code);
  if (!g) return false;
  const img = isEmb(g)
    ? `schemas/${esc(g.Code)}.webp`
    : driveImg(g["Schéma (lien)"] || g["Schéma"]);
  const voir = (g["Voir aussi"] || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(c => {
      const o = DATA.find(x => x.Code === c);
      return o ? `<a data-jeu="${esc(c)}">${esc(c)} · ${esc(o.Titre)}</a>` : "";
    })
    .join("");
  const fact = (l, v) => (v ? `<div class="fact"><b>${l}</b>${esc(v)}</div>` : "");
  $("#fiche").setAttribute("style", style(g));
  $("#fiche").innerHTML =
    `<div class="fh"><div class="code">${esc(g.Code || "★")}</div><div class="tt"><div class="fam">${esc((g.Famille || "").toUpperCase())}${isAnniv(g) ? " · FORMAT ANNIVERSAIRE" : ""}</div><h2>${esc(g.Titre)}</h2><div class="br">${esc(g["Résumé"])}</div></div><button class="x" aria-label="Fermer">×</button></div>
  <div class="tabs"><button class="tab on" data-p="p1">Principe</button><button class="tab" data-p="p2">Pratique</button><button class="tab" data-p="p3">Variantes</button><button class="tab" data-p="p4">Conseils</button></div>
  <div class="pane on" id="p1"><p>${boldTitles(g.Principe)}</p>${img ? `<img src="${img}" alt="Schéma : ${esc(g.Titre)}" onerror="this.remove()">` : ""}</div>
  <div class="pane" id="p2"><div class="facts">${fact("PARTICIPANTS", g.Participants)}${fact("MATÉRIEL", g["Matériel"])}${fact("ESPACE", g.Espace)}${fact("DURÉE", g["Durée"])}${g.Objectif ? `<div class="fact obj"><b>OBJECTIF</b>${esc(g.Objectif)}</div>` : ""}${fact("INTENSITÉ", g["Intensité"])}${fact("OBJECTIFS TRAVAILLÉS", g["Objectifs (tags)"])}</div></div>
  <div class="pane" id="p3"><div class="var"><div><h4>− PLUS FACILE</h4>${esc(g["Plus facile"])}</div><div><h4>+ PLUS DIFFICILE</h4>${esc(g["Plus difficile"])}</div></div></div>
  <div class="pane" id="p4">${g.Conseil ? `<div class="tip"><b>CONSEIL</b> ${esc(g.Conseil)}</div>` : ""}${g["Compléments"] ? `<div class="comp">${esc(g["Compléments"])}</div>` : ""}${voir ? `<p class="voir" style="margin-top:14px"><b style="font-size:11px;letter-spacing:1px;color:var(--muted)">VOIR AUSSI</b><br>${voir}</p>` : ""}${retoursHTML(g)}${!g.Conseil && !g["Compléments"] && !voir && !retoursHTML(g) ? "<p>Pas de conseil particulier pour ce jeu.</p>" : ""}</div>
  <div class="foot"><span>${g.Auteur ? "Fiche de " + esc(g.Auteur) : ""}</span><span style="display:flex;gap:8px;flex-wrap:wrap"><a data-add="${esc(key(g))}" class="btn ghost" style="cursor:pointer;background:#26364D;color:#fff;padding:8px 14px;border-radius:8px;font-weight:700">${inSel(key(g)) ? "✓ Dans ma séance" : "＋ Ajouter à ma séance"}</a><a class="print btn ghost" style="cursor:pointer;background:#EEF1F8;color:#26364D;padding:8px 14px;border-radius:8px;font-weight:700">Imprimer la fiche</a></span></div>`;
  $("#ov").classList.add("open");
  document.body.style.overflow = "hidden";
  $("#ov").scrollTop = 0;
  return true;
}
function syncModal() {
  if (MODAL && openFiche(MODAL)) return;
  $("#ov").classList.remove("open");
  document.body.style.overflow = "";
}
function closeFiche() {
  go(VIEW);
}
function tab(p) {
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("on", t.dataset.p === p));
  document.querySelectorAll(".pane").forEach(x => x.classList.toggle("on", x.id === p));
}

registerClick(e => {
  const t = e.target.closest(".tab");
  if (t) {
    tab(t.dataset.p);
    return true;
  }
  if (e.target.id === "ov" || e.target.closest(".x")) {
    closeFiche();
    return true;
  }
  if (e.target.closest(".print")) {
    printFiche();
    return true;
  }
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && MODAL) closeFiche();
});

/* Impression d'une fiche de jeu : tout le contenu sur une seule page A4 */
function printFiche() {
  const f = $("#fiche");
  if (!f) return;
  const titres = { p1: "PRINCIPE", p2: "PRATIQUE", p3: "VARIANTES", p4: "CONSEILS" };
  document.querySelectorAll(".pane").forEach(p => {
    p.dataset.t = titres[p.id] || "";
    p.classList.toggle("pe", !p.textContent.trim() && !p.querySelector("img"));
  });
  const st = document.createElement("style");
  st.textContent = "@page{size:A4 portrait;margin:8mm}";
  document.head.appendChild(st);
  document.body.classList.add("fpm");
  f.style.zoom = 1;
  const dispo = 1000; /* hauteur disponible en pixels (A4 moins les marges, avec une réserve) */
  const h = f.scrollHeight;
  if (h > dispo) f.style.zoom = (dispo / h).toFixed(3);
  document.body.classList.add("fp");
  const fin = () => {
    document.body.classList.remove("fp", "fpm");
    f.style.zoom = "";
    st.remove();
    window.removeEventListener("afterprint", fin);
  };
  window.addEventListener("afterprint", fin);
  window.print();
  setTimeout(() => {
    if (document.body.classList.contains("fp")) fin();
  }, 60000);
}
