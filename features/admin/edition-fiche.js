/* Modifier un jeu directement depuis sa fiche (administrateur) : formulaire complet dans une fenêtre, sans changer de page. */
let FE = null;
function feBouton(g) {
  return compteOn() && compteAdmin()
    ? `<a data-fe="open" data-c="${esc(key(g))}" class="btn ghost" style="cursor:pointer;background:#fff;color:#26364D;border:1px solid #26364D;padding:8px 14px;border-radius:8px;font-weight:700">✎ Modifier</a>`
    : "";
}
async function feOuvrir(code) {
  const g = DATA.find(x => key(x) === code);
  if (!g) return;
  toast("Chargement du jeu…");
  try {
    const j = await admPost("admin_liste", { tous: true });
    const l = j.jeux.find(x => String(x.valeurs.Code || "").trim() === String(g.Code || "").trim() && x.valeurs.Titre);
    if (!l) throw new Error("jeu introuvable dans la feuille (jeu intégré au site : à modifier dans la feuille)");
    FE = { ligne: l.ligne, v: { ...l.valeurs }, orig: l.valeurs.Titre, publie: l.publie, code };
    feAfficher();
  } catch (e) {
    toast("Impossible de charger : " + e.message);
  }
}
function feAfficher() {
  const v = FE.v;
  modal(
    "✎ Modifier « " + esc(v.Titre) + " »",
    `<div class="pform"><div class="smg">${propFormHTML(v, discDeFamille(v.Famille) || "escalade", k => `data-fe-f="${esc(k)}"`, k => `data-fe-t="${esc(k)}"`, {})}</div><div class="tools" style="margin-top:12px"><a class="btn" data-fe="save" style="background:#2E7D4F;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Enregistrer</a><span id="feMsg" style="color:#2E7D4F;font-weight:700"></span></div></div>`,
    980,
    { fond: false }
  );
  document.querySelectorAll("[data-fe-f]").forEach(i =>
    i.addEventListener("input", () => {
      FE.v[i.dataset.feF] = i.value;
    })
  );
  document.querySelectorAll("[data-fe-t]").forEach(i =>
    i.addEventListener("change", () => {
      FE.v[i.dataset.feT] = [...document.querySelectorAll(`[data-fe-t="${CSS.escape(i.dataset.feT)}"]`)]
        .filter(x => x.checked)
        .map(x => x.value)
        .join(", ");
    })
  );
}
registerClick(e => {
  const b = e.target.closest("[data-fe]");
  if (!b) return;
  if (b.dataset.fe === "open") {
    feOuvrir(b.dataset.c);
    return true;
  }
  if (b.dataset.fe === "save" && FE) {
    $("#feMsg").textContent = "Enregistrement…";
    admPost("admin_enregistrer", { ligne: FE.ligne, titreAvant: FE.orig, valeurs: FE.v, publier: false })
      .then(() => {
        const g = DATA.find(x => key(x) === FE.code);
        if (g) Object.assign(g, FE.v);
        toast("✓ Jeu enregistré dans la feuille (visible pour tous après la prochaine publication de la feuille).");
        modalFermer("mpop", true);
        render();
      })
      .catch(er => {
        $("#feMsg").style.color = "#B2263A";
        $("#feMsg").textContent = "Échec : " + er.message;
      });
    return true;
  }
});
