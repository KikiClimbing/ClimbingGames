/* Ma séance — ajout à la bibliothèque, boutons et clics */
function seToLib(id) {
  const f = seFind(id);
  if (!f) return;
  const it = f.s.items[f.i],
    m = $("#sMsg");
  if (!it.titre || !it.desc) {
    alert("Renseignez au moins le nom de l'exercice et la consigne.");
    return;
  }
  const fam = prompt(
    "Famille du jeu : Exploration, Coopération, Défis ou Animation ?",
    it.fam || "Coopération"
  );
  if (!fam) return;
  it.fam = fam;
  const auteur = SMETA.educ || prompt("Votre prénom (auteur de la fiche) ?") || "";
  const jeu = {
    Titre: it.titre,
    Famille: fam,
    Résumé: it.desc.split(/[.\n]/)[0].slice(0, 140),
    Principe: it.desc,
    Participants: it.part || "—",
    Matériel: it.mat || "Aucun",
    Durée: (f.s.d1 || "") + " min",
    "Plus facile": it.moins || "",
    "Plus difficile": it.plus || "",
    Auteur: auteur,
  };
  if (CONFIG.GAME_ADD_URL) {
    m.textContent = "Envoi en cours…";
    fetch(CONFIG.GAME_ADD_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ key: CONFIG.GAME_ADD_KEY || "", jeu }),
    })
      .then(r => r.json())
      .then(j => {
        if (!j.ok) throw new Error(j.error || "refusé");
        it.sent = true;
        seSave();
        m.textContent = "✓ Exercice envoyé : il apparaîtra dans la bibliothèque après relecture.";
      })
      .catch(e => {
        m.textContent = "Échec de l'envoi (" + e.message + ").";
      });
  } else {
    const txt = Object.entries(jeu)
      .map(([k, v]) => k + " : " + v)
      .join("\n");
    try {
      navigator.clipboard.writeText(txt).catch(() => {});
    } catch (e) {}
    m.textContent = "Fiche copiée : collez-la dans le formulaire « Proposer un jeu ».";
    if (CONFIG.FORM_URL) window.open(CONFIG.FORM_URL, "_blank");
  }
}
/* ---------- actions ---------- */
function seanceBind() {
  const upd = () => {
    const s = $("#sheet");
    if (s) s.innerHTML = sheetHTML();
  };
  const sub = id => SE.subs.find(x => x.id === +id);
  document.querySelectorAll("[data-sm]").forEach(i =>
    i.addEventListener("input", e => {
      SMETA[i.dataset.sm] = i.dataset.n ? Math.max(0, +e.target.value || 0) : e.target.value;
      saveMeta();
      upd();
    })
  );
  document.querySelectorAll("[data-se]").forEach(i =>
    i.addEventListener("input", e => {
      SE.ech[i.dataset.se] = i.dataset.n ? Math.max(0, +e.target.value || 0) : e.target.value;
      seSave();
      upd();
    })
  );
  document.querySelectorAll("[data-ss]").forEach(i =>
    i.addEventListener("input", e => {
      const s = sub(i.dataset.sub);
      s[i.dataset.ss] = i.dataset.n ? Math.max(0, +e.target.value || 0) : e.target.value;
      seSave();
      upd();
    })
  );
  document.querySelectorAll("[data-si]").forEach(i =>
    i.addEventListener("input", e => {
      const f = seFind(+i.dataset.id);
      if (f) {
        f.s.items[f.i][i.dataset.si] = e.target.value;
        seSave();
        upd();
      }
    })
  );
  document.querySelectorAll("[data-sa-set]").forEach(i =>
    i.addEventListener("change", e => {
      const s = sub(i.dataset.sub);
      s[i.dataset.saSet] = e.target.value;
      seSave();
      render();
    })
  );
  const dx = $("#smDeux");
  if (dx)
    dx.addEventListener("change", e => {
      SMETA.deux = e.target.checked;
      saveMeta();
      render();
    });
  const eo = $("#seEchOn");
  if (eo)
    eo.addEventListener("change", e => {
      SE.ech.on = e.target.checked;
      seSave();
      render();
    });
  const pr = $("#sPrint");
  if (pr) pr.addEventListener("click", imprimerSeance);
  const wd = $("#sWord");
  if (wd) wd.addEventListener("click", () => seanceWord());
  const cp = $("#sCopy");
  if (cp)
    cp.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(seanceText());
        $("#sMsg").textContent = "Texte copié !";
      } catch (e) {
        $("#sMsg").textContent = "Copie impossible : sélectionnez le texte à la main.";
      }
    });
  const cl = $("#sClear");
  if (cl)
    cl.addEventListener("click", () => {
      if (
        confirm(
          "Effacer tout le contenu de cette séance (informations, échauffement, sous-sections et exercices) ?\n\nLe logo de la salle est conservé."
        )
      ) {
        SE = seNew();
        seSave();
        SMETA = {};
        try {
          localStorage.removeItem("maSeanceMeta");
        } catch (e) {}
        buildNav();
        render();
      }
    });
  const lg = $("#sLogo");
  if (lg)
    lg.addEventListener("change", e => {
      const f = e.target.files[0];
      if (f)
        logoDepuisFichier(f, url => {
          SMETA.logo = url;
          saveMeta();
          try {
            localStorage.setItem("logoSalle", url);
          } catch (er) {}
          render();
        });
    });
  const lo = $("#sLogoOff");
  if (lo)
    lo.addEventListener("click", () => {
      SMETA.logo = "";
      saveMeta();
      render();
    });
  const sv = $("#sSave");
  if (sv) sv.addEventListener("click", enregistrerSeance);
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-sa]");
  if (!b || VIEW !== "seance") return;
  const a = b.dataset.sa,
    id = +b.dataset.id,
    sid = +b.dataset.sub;
  const mvArr = (arr, i, d) => {
    const j = i + d;
    if (j >= 0 && j < arr.length) [arr[i], arr[j]] = [arr[j], arr[i]];
  };
  let re = true;
  if (a === "addsub")
    SE.subs.push({ id: SEUID++, titre: "", g: "both", d1: 10, d2: 10, items: [] });
  else if (a === "srm") {
    if (
      SE.subs.find(s => s.id === sid).items.length &&
      !confirm("Supprimer cette sous-section et ses jeux ?")
    )
      return;
    SE.subs = SE.subs.filter(s => s.id !== sid);
  } else if (a === "sup" || a === "sdn")
    mvArr(
      SE.subs,
      SE.subs.findIndex(s => s.id === sid),
      a === "sup" ? -1 : 1
    );
  else if (a === "addfree")
    SE.subs
      .find(s => s.id === sid)
      .items.push({
        id: SEUID++,
        t: "free",
        nom: "",
        titre: "",
        desc: "",
        part: "",
        mat: "",
        plus: "",
        moins: "",
        crit: "",
      });
  else if (a === "addlib") {
    const inp = document.querySelector(`[data-lib="${sid}"]`),
      val = (inp.value || "").trim().toLowerCase();
    const g =
      DATA.find(x => ((x.Code ? x.Code + " · " : "") + x.Titre).toLowerCase() === val) ||
      DATA.find(x => (x.Code || "").toLowerCase() === val) ||
      DATA.find(x => norm(x.Titre).includes(norm(val)) && val.length > 2);
    if (!g) {
      inp.style.borderColor = "#E0485A";
      return;
    }
    const s = SE.subs.find(x => x.id === sid);
    s.items.push({ id: SEUID++, t: "lib", k: key(g), crit: "" });
  } else if (a === "irm") {
    const f = seFind(id);
    f.s.items.splice(f.i, 1);
  } else if (a === "iup" || a === "idn") {
    const f = seFind(id);
    mvArr(f.s.items, f.i, a === "iup" ? -1 : 1);
  } else if (a === "tolib") {
    seToLib(id);
    re = false;
  }
  if (re) {
    seSave();
    buildNav();
    render();
  }
});

/* imprime uniquement la fiche de séance (A4 paysage) */
function imprimerSeance() {
  document.body.classList.add("ps");
  const st = document.createElement("style");
  st.textContent = "@page{size:A4 landscape;margin:8mm}";
  document.head.appendChild(st);
  window.print();
  setTimeout(() => {
    document.body.classList.remove("ps");
    st.remove();
  }, 800);
}
/* réduit un logo téléversé (hauteur 120 px max) pour qu'il reste léger */
function logoDepuisFichier(file, cb) {
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 120 / img.naturalHeight, 360 / img.naturalWidth);
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.naturalWidth * k));
      c.height = Math.max(1, Math.round(img.naturalHeight * k));
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL(/png|svg|gif/.test(file.type) ? "image/png" : "image/jpeg", 0.88));
    };
    img.onerror = () => alert("Image illisible.");
    img.src = r.result;
  };
  r.readAsDataURL(file);
}
