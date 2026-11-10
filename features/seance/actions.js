/* Ma séance — ajout à la bibliothèque, boutons et clics */
/* choix de la famille dans un menu (pas de saisie libre : pas d'erreur de frappe possible) */
function choisirFamille(def) {
  const L = Object.keys(FAMS).filter(f => typeof discDeFamille !== "function" || discDeFamille(f) === (DISC || "escalade"));
  return new Promise(res => {
    let fait = false;
    const fin = v => {
      if (fait) return;
      fait = true;
      res(v);
    };
    const p = modal(
      "Famille du jeu",
      `<p style="margin-top:0">Dans quelle famille range-t-on ce jeu ?</p><select id="famChoix" style="width:100%;padding:8px">${L.map(f => `<option ${f === def ? "selected" : ""}>${esc(f)}</option>`).join("")}</select><div class="tools" style="margin-top:12px"><a class="btn" id="famOk" style="background:#2E7D4F;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Valider</a></div>`,
      420,
      { fin: () => fin("") }
    );
    $("#famOk").addEventListener("click", () => {
      const v = $("#famChoix").value;
      fin(v);
      modalFermer("mpop", true);
    });
  });
}
/* Ajouter un exercice libre à la bibliothèque : formulaire complet dans une fenêtre, prérempli avec ce qui est déjà saisi */
let STL = null;
function seToLib(id) {
  const f = seFind(id);
  if (!f) return;
  const it = f.s.items[f.i];
  if (!it.titre || !it.desc) {
    alert("Renseignez au moins le nom de l'exercice et la consigne.");
    return;
  }
  const d = SMETA.disc || DISC || "escalade";
  const auteur = (typeof AUTH !== "undefined" && AUTH.user && (AUTH.user.pseudo || AUTH.user.nom)) || "";
  const v = {
    Titre: it.titre,
    Famille: it.fam || "",
    Résumé: it.desc.split(/[.\n]/)[0].slice(0, 140),
    Principe: it.desc,
    Participants: it.part || "",
    Matériel: it.mat || "Aucun",
    Durée: f.s.d && f.s.d[0] ? f.s.d[0] + " min" : "",
    "Plus facile": puces(it.moins),
    "Plus difficile": puces(it.plus),
    Auteur: auteur,
    Objectif: it.cp_obj || "",
    But: it.cp_but || "",
    "Comportements attendus": it.cp_comp || "",
    Organisation: it.cp_orga || "",
    "Critères de réussite": puces(it.crit),
  };
  STL = { id, d, v };
  stlAfficher();
}
function stlAfficher() {
  const { v, d } = STL;
  modal(
    "＋ Ajouter « " + esc(v.Titre) + " » à la bibliothèque",
    `<p class="hint" style="margin:0 0 8px">Complète la fiche : elle sera relue avant d'apparaître dans la bibliothèque.</p><div class="pform">${propFormHTML(v, d, k => `data-stl-f="${esc(k)}"`, k => `data-stl-t="${esc(k)}"`, {})}<div class="tools" style="margin-top:12px"><a class="btn" data-stl="send" style="background:#2E7D4F;color:#fff;border-radius:8px;padding:10px 20px;font-weight:700;cursor:pointer">Envoyer à la bibliothèque</a><a class="chip" data-modal="fermer" data-mid="mpop">Annuler</a><span id="stlMsg" style="font-weight:700"></span></div></div>`,
    980,
    { fond: false }
  );
  document.querySelectorAll("[data-stl-f]").forEach(i => {
    i.addEventListener("input", () => {
      STL.v[i.dataset.stlF] = i.value;
    });
    if (i.dataset.stlF === "Famille") i.addEventListener("change", () => (STL.v.Famille = i.value));
  });
  document.querySelectorAll("[data-stl-t]").forEach(i =>
    i.addEventListener("change", () => {
      STL.v[i.dataset.stlT] = [...document.querySelectorAll(`[data-stl-t="${CSS.escape(i.dataset.stlT)}"]`)]
        .filter(x => x.checked)
        .map(x => x.value)
        .join(", ");
    })
  );
}
registerClick(e => {
  const b = e.target.closest("[data-stl]");
  if (!b || !STL) return;
  const v = STL.v,
    msg = t => {
      const m = $("#stlMsg");
      if (m) {
        m.style.color = "#B2263A";
        m.textContent = t;
      }
    };
  PROP_CHAMPS.forEach(c => {
    if (c.t === "select" && !c.vide && !v[c.k]) v[c.k] = c.opts()[0];
  });
  const manque = PROP_CHAMPS.filter(c => c.req && !(STL.d === "prepa" && c.k === "Participants") && !String(v[c.k] || "").trim()).map(c => c.k);
  if (manque.length) {
    msg("À compléter : " + manque.join(", ") + ".");
    return true;
  }
  if (v["Remplace le jeu"]) v["Remplace le jeu"] = v["Remplace le jeu"].split(" · ")[0];
  const jeu = { ...v };
  const ok = () => {
    const f = seFind(STL.id);
    if (f) {
      f.s.items[f.i].sent = true;
      f.s.items[f.i].fam = jeu.Famille;
      seSave();
    }
    modalFermer("mpop", true);
    toast("✓ Exercice envoyé : il apparaîtra dans la bibliothèque après relecture.");
    STL = null;
    render();
  };
  if (CONFIG.GAME_ADD_URL) {
    msg("Envoi en cours…");
    $("#stlMsg").style.color = "#6B7280";
    fetch(CONFIG.GAME_ADD_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ key: CONFIG.GAME_ADD_KEY || "", action: "jeu", jeu }),
    })
      .then(r => r.json())
      .then(j => {
        if (!j.ok) throw new Error(j.error || "refusé");
        ok();
      })
      .catch(er => msg("Échec de l'envoi (" + er.message + ")."));
  } else {
    const txt = Object.entries(jeu).map(([k, x]) => k + " : " + x).join("\n");
    try {
      navigator.clipboard.writeText(txt).catch(() => {});
    } catch (er) {}
    toast("Fiche copiée : collez-la dans le formulaire « Proposer un jeu ».");
    if (CONFIG.FORM_URL) window.open(CONFIG.FORM_URL, "_blank");
    modalFermer("mpop", true);
  }
  return true;
});
/* ---------- actions ---------- */
function seanceBind() {
  if (typeof glBind === "function") glBind();
  const upd = () => {
    const s = (SEPOP ? $("#epop") : document).querySelector("#sheet");
    if (s) s.innerHTML = sheetHTML();
    const c = $("#seControle");
    if (c) c.innerHTML = seControleInner();
    seBoutonSauve();
  };
  bilanBind(upd);
  const tb = $("#sTerrain");
  if (tb) tb.addEventListener("click", () => terrainOuvrir());
  const sub = id => seSubFind(id);
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
  const bascule = (it, cle, v, coche) => {
    const L = Array.isArray(it[cle]) ? it[cle].slice() : [];
    const j = L.indexOf(v);
    if (coche && j >= 0) L.splice(j, 1);
    if (!coche && j < 0) L.push(v);
    it[cle] = L;
  };
  document.querySelectorAll("[data-isch]").forEach(i =>
    i.addEventListener("change", () => {
      const f = seFind(+i.dataset.id);
      if (f) {
        f.s.items[f.i].schOn = i.checked;
        seSave();
        upd();
      }
    })
  );
  document.querySelectorAll("[data-ipn]").forEach(i =>
    i.addEventListener("change", () => {
      const f = seFind(+i.dataset.id);
      if (f) {
        bascule(f.s.items[f.i], "pn", +i.dataset.ipn, i.checked);
        seSave();
        upd();
      }
    })
  );
  document.querySelectorAll("[data-ivn]").forEach(i =>
    i.addEventListener("change", () => {
      const f = seFind(+i.dataset.id);
      if (f) {
        bascule(f.s.items[f.i], "vn", i.dataset.ivn, i.checked);
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
  const num = (el, e) => (el.dataset.n ? Math.max(0, +e.target.value || 0) : e.target.value);
  document.querySelectorAll("[data-gm]").forEach(i =>
    i.addEventListener("input", e => {
      SMETA.groups[+i.dataset.gi][i.dataset.gm] = num(i, e);
      saveMeta();
      upd();
    })
  );
  document.querySelectorAll("[data-gd]").forEach(i =>
    i.addEventListener("input", e => {
      const t = sub(i.dataset.sub);
      t.d[+i.dataset.gi] = num(i, e);
      seSave();
      upd();
    })
  );
  document.querySelectorAll("[data-gt]").forEach(i =>
    i.addEventListener("input", e => {
      SE.ech.gtxt[+i.dataset.gi] = e.target.value;
      seSave();
      upd();
    })
  );
  document.querySelectorAll("[data-gs]").forEach(i =>
    i.addEventListener("change", () => {
      const s = sub(i.dataset.sub),
        n = SMETA.groups.length;
      const set = new Set(s.gs || SMETA.groups.map((_, k) => k));
      if (i.checked) set.add(+i.dataset.gi);
      else set.delete(+i.dataset.gi);
      s.gs = set.size && set.size < n ? [...set].sort() : null;
      seSave();
      render();
    })
  );
  const ep = $("#seEchPer");
  if (ep)
    ep.addEventListener("change", e => {
      SE.ech.per = e.target.checked;
      if (SE.ech.per && SE.ech.gtxt.every(x => !x)) SE.ech.gtxt = SE.ech.gtxt.map(() => SE.ech.txt);
      seSave();
      render();
    });
  const ga = $("#gAdd");
  if (ga)
    ga.addEventListener("click", () => {
      SMETA.groups.push({ nom: "Groupe " + (SMETA.groups.length + 1), acc: 5, rc: "" });
      saveMeta();
      seDefaults();
      seSave();
      render();
    });
  document.querySelectorAll("[data-grm]").forEach(i =>
    i.addEventListener("click", () => {
      const g = SMETA.groups[+i.dataset.grm];
      if (!confirm("Retirer le groupe « " + (g.nom || "sans nom") + " » de toute la séance ?"))
        return;
      seDropGroup(+i.dataset.grm);
      saveMeta();
      seSave();
      render();
    })
  );
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
          localStorage.removeItem(seMetaKey());
        } catch (e) {}
        buildNav();
        render();
      }
    });
  const sc = $("#sSaveCopy");
  if (sc)
    sc.addEventListener("click", async () => {
      delete SE.id;
      sc.textContent = "Enregistrement…";
      await enregistrerSeance(undefined, undefined, true);
      render();
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
  if (sv)
    sv.addEventListener("click", async () => {
      if (!seSale()) {
        toast("Rien à enregistrer : aucune modification depuis le dernier enregistrement.");
        return;
      }
      sv.textContent = "Enregistrement…";
      await enregistrerSeance();
      render();
    });
  seBoutonSauve();
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-sa]");
  if (!b || (VIEW !== "seance" && !SEPOP)) return;
  const a = b.dataset.sa,
    id = +b.dataset.id,
    sid = +b.dataset.sub;
  const mvArr = (arr, i, d) => {
    const j = i + d;
    if (j >= 0 && j < arr.length) [arr[i], arr[j]] = [arr[j], arr[i]];
  };
  let re = true;
  if (a === "modele") {
    SMETA.modele = b.dataset.m === "creps" ? "creps" : "std";
    saveMeta();
  } else if (a === "schestd") {
    SMETA.schemaStd = !SMETA.schemaStd;
    seToutesSubs().forEach(s => s.items.forEach(i => delete i.schOn));
    saveMeta();
  } else if (a === "txtreset") {
    const f = seFind(id);
    if (f) {
      delete f.s.items[f.i].txt;
      delete f.s.items[f.i].pn;
    }
  } else if (a === "schemode") {
    SMETA.schemaMode = b.dataset.m === "sous" ? "sous" : "page";
    saveMeta();
  } else if (a === "addech")
    SE.ech.subs.push({ id: SEUID++, titre: "", gs: null, d: SMETA.groups.map(() => 10), items: [] });
  else if (a === "addsub")
    SE.subs.push({ id: SEUID++, titre: "", gs: null, d: SMETA.groups.map(() => 10), items: [] });
  else if (a === "srm") {
    if (
      seSubFind(sid).items.length &&
      !confirm("Supprimer cette sous-section et ses jeux ?")
    )
      return;
    if (SE.ech.subs.some(s => s.id === sid)) SE.ech.subs = SE.ech.subs.filter(s => s.id !== sid);
    else SE.subs = SE.subs.filter(s => s.id !== sid);
  } else if (a === "sup" || a === "sdn") {
    const L = SE.ech.subs.some(s => s.id === sid) ? SE.ech.subs : SE.subs;
    mvArr(
      L,
      L.findIndex(s => s.id === sid),
      a === "sup" ? -1 : 1
    );
  } else if (a === "addfree")
    seSubFind(sid)
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
    const s = seSubFind(sid);
    s.items.push({ id: SEUID++, t: "lib", k: key(g), crit: "" });
  } else if (a === "edsch") {
    edPopup("item:" + id);
    re = false;
  } else if (a === "edschrm") {
    const f = seFind(id);
    if (f) delete f.s.items[f.i].sch;
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
  let fini = false;
  const nettoyer = () => {
    if (fini) return;
    fini = true;
    document.body.classList.remove("ps");
    st.remove();
    window.removeEventListener("afterprint", nettoyer);
  };
  window.addEventListener("afterprint", nettoyer);
  setTimeout(nettoyer, 60000);
  window.print();
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

/* ---------- réorganiser les sous-sections (fenêtre : glisser-déposer ou flèches) ---------- */
function reorgListe() {
  const bloc = (L, nom) =>
    L.length < 2
      ? ""
      : `<h4 style="margin:12px 0 6px">${nom}</h4>` +
        L.map(
          (s, k) =>
            `<div class="rgl" draggable="true" data-rgid="${s.id}" style="display:flex;align-items:center;gap:8px;border:1px solid #D5DAE5;border-radius:8px;padding:8px 10px;margin:4px 0;background:#fff;cursor:grab"><span style="color:#9AA3B5;font-size:18px">⠿</span><b style="flex:1">${esc(s.titre || "Sous-section " + (k + 1))}</b><span style="color:#6B7280;font-size:12px">${s.items.length} exercice${s.items.length > 1 ? "s" : ""}</span><button class="chip" data-rg="up" data-rgid="${s.id}" ${k ? "" : "disabled"}>↑</button><button class="chip" data-rg="dn" data-rgid="${s.id}" ${k < L.length - 1 ? "" : "disabled"}>↓</button></div>`
        ).join("");
  return bloc(SE.ech.subs, "Échauffement") + bloc(SE.subs, "Corps de séance") || "<p>Il faut au moins deux sous-sections.</p>";
}
function reorgOuvrir() {
  modal("⇅ Réorganiser les sous-sections", `<p class="hint" style="margin:0 0 6px">Glisse une ligne ou utilise les flèches.</p><div id="rgBox">${reorgListe()}</div><div class="tools" style="margin-top:12px"><a class="chip" data-modal="fermer" data-mid="mpop">Terminé</a></div>`, 560, { fond: false });
}
function reorgMaj() {
  seSave();
  const b = $("#rgBox");
  if (b) b.innerHTML = reorgListe();
  render();
}
const reorgMv = (arr, i, d) => {
  const j = i + d;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
};
function reorgListeDe(id) {
  return SE.ech.subs.some(s => s.id === id) ? SE.ech.subs : SE.subs;
}
registerClick(e => {
  const a = e.target.closest("[data-rgo]");
  if (a) {
    reorgOuvrir();
    return true;
  }
  const b = e.target.closest("[data-rg]");
  if (!b) return;
  const id = +b.dataset.rgid,
    L = reorgListeDe(id);
  reorgMv(L, L.findIndex(s => s.id === id), b.dataset.rg === "up" ? -1 : 1);
  reorgMaj();
  return true;
});
let RG_ID = 0;
document.addEventListener("dragstart", e => {
  const r = e.target.closest && e.target.closest("[data-rgid].rgl");
  if (!r) return;
  RG_ID = +r.dataset.rgid;
  e.dataTransfer.effectAllowed = "move";
  try {
    e.dataTransfer.setData("text/plain", String(RG_ID));
  } catch (er) {}
});
document.addEventListener("dragover", e => {
  if (RG_ID && e.target.closest && e.target.closest(".rgl")) e.preventDefault();
});
document.addEventListener("drop", e => {
  const r = e.target.closest && e.target.closest(".rgl");
  if (!r || !RG_ID) return;
  e.preventDefault();
  const to = +r.dataset.rgid,
    L = reorgListeDe(RG_ID);
  if (to !== RG_ID && L === reorgListeDe(to)) {
    const [x] = L.splice(L.findIndex(s => s.id === RG_ID), 1);
    L.splice(L.findIndex(s => s.id === to) + (e.clientY > r.getBoundingClientRect().top + r.offsetHeight / 2 ? 1 : 0), 0, x);
    reorgMaj();
  }
  RG_ID = 0;
});
document.addEventListener("dragend", () => (RG_ID = 0));
