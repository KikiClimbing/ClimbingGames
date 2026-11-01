/* Pseudo du compte : affiché à la place du nom Google (auteur des séances, responsable d'équipe…).
   Proposé une fois après la connexion, modifiable dans « Mon compte ». L'adresse Google reste l'identifiant. */
function pseudoPopup(premier) {
  modal(
    premier ? "Choisis ton pseudo" : "Mon pseudo",
    `<div class="box"><p style="margin-top:0">${premier ? "Ton pseudo remplacera ton nom Google partout sur le site (auteur de tes séances, équipes…). " : ""}3 à 24 caractères : lettres, chiffres, espace, _ . -</p>
    <label class="sml">Pseudo<input id="psV" maxlength="24" value="${esc((AUTH.user && AUTH.user.pseudo) || (premier ? String(AUTH.user.nom || "").split(" ")[0] : ""))}"></label>
    <div class="tools" style="margin-top:10px"><a class="btn" id="psOk" style="background:#2E7D4F;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Enregistrer</a>${premier ? '<a class="chip" id="psPlus" style="cursor:pointer">Plus tard</a>' : ""}<span id="psMsg" style="font-weight:700"></span></div></div>`
  );
  const plus = $("#psPlus");
  if (plus)
    plus.addEventListener("click", () => {
      try {
        sessionStorage.setItem("pseudoPlusTard", "1");
      } catch (e) {}
      modalFermer();
    });
  $("#psOk").addEventListener("click", async () => {
    const m = $("#psMsg");
    m.style.color = "#6B7280";
    m.textContent = "Enregistrement…";
    try {
      const j = await comptePost("profil_pseudo", { pseudo: $("#psV").value });
      AUTH.session = j.session;
      AUTH.user = j.user;
      localStorage.setItem(COMPTE_LS, JSON.stringify({ session: j.session, user: j.user }));
      modalFermer();
      buildNav();
      render();
      toast("✓ Pseudo enregistré : " + j.user.pseudo);
    } catch (e) {
      m.style.color = "#B2263A";
      m.textContent = e.message;
    }
  });
}
registerClick(e => {
  const b = e.target.closest("[data-pseudo]");
  if (!b) return;
  pseudoPopup(false);
  return true;
});
/* propose le pseudo une fois, après le chargement, aux comptes qui n'en ont pas */
registerLoader(async () => {
  if (!compteOn() || !AUTH.user || AUTH.reel || AUTH.user.pseudo) return;
  try {
    if (sessionStorage.getItem("pseudoPlusTard")) return;
  } catch (e) {}
  setTimeout(() => !$("#mpop") && pseudoPopup(true), 1200);
});
