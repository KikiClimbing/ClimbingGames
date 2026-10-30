/* Éditeur de schémas — export PNG / SVG et envoi dans le Drive */
function edDl(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 500);
}
function edSvgText() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 36" width="1600" height="576">${edSVGInner().replace(/ style="cursor:move"/g, "")}</svg>`;
}
function edPngBlob(cb, err) {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = 3200;
    c.height = 1152;
    const x = c.getContext("2d");
    x.fillStyle = "#fff";
    x.fillRect(0, 0, c.width, c.height);
    x.drawImage(img, 0, 0, 3200, 1152);
    c.toBlob(cb, "image/png");
  };
  img.onerror = err;
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(edSvgText());
}
function edExport(kind) {
  if (kind === "svg") {
    edDl(new Blob([edSvgText()], { type: "image/svg+xml" }), "schema.svg");
    return;
  }
  edPngBlob(
    b => edDl(b, "schema.png"),
    () => alert("Export impossible dans ce navigateur : utilisez le bouton SVG.")
  );
}
function edUpload() {
  const msg = $("#edUpMsg"),
    url = CONFIG.SCHEMA_UPLOAD_URL || CONFIG.GAME_ADD_URL;
  if (!url) {
    msg.innerHTML =
      "L'envoi n'est pas encore configuré (<i>GAME_ADD_URL</i> dans config.js). En attendant, exportez le PNG et déposez-le à la main dans le dossier schemas/ du dépôt.";
    return;
  }
  const name =
    ($("#edName").value || "schema").trim().replace(/[^\w\- àâäçéèêëîïôöùûüÀÉÈ]/g, "") || "schema";
  msg.textContent = "Envoi en cours…";
  edPngBlob(
    blob => {
      const fr = new FileReader();
      fr.onload = () => {
        const data = String(fr.result).split(",")[1];
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "schema",
            name: name + ".png",
            data,
            source: JSON.stringify({ els: ED.els, opt: ED.opt }),
            key: CONFIG.SCHEMA_UPLOAD_URL
              ? CONFIG.SCHEMA_UPLOAD_KEY || ""
              : CONFIG.GAME_ADD_KEY || "",
          }),
        })
          .then(r => r.json())
          .then(j => {
            if (!j.ok) throw new Error(j.error || "refusé");
            if (ED.back === "proposer") propSetSchema(j.url);
            msg.innerHTML = `✓ Envoyé${ED.back === "proposer" ? " et ajouté à votre proposition" : ""} (visible sur le site dans environ une minute). Lien à coller dans « Schéma (lien) » : <input readonly id="edLink" value="${esc(j.url)}" style="width:100%;margin-top:6px;padding:6px;border:1px solid #D5DAE5;border-radius:6px"> <button class="chip" id="edCopyLk" style="margin-top:6px">Copier le lien</button>`;
            $("#edCopyLk").onclick = () => {
              const i = $("#edLink");
              i.select();
              try {
                navigator.clipboard.writeText(i.value);
              } catch (e) {
                document.execCommand("copy");
              }
              $("#edCopyLk").textContent = "Copié !";
            };
          })
          .catch(e => {
            msg.textContent =
              "Échec de l'envoi (" +
              e.message +
              "). Exportez le PNG et déposez-le à la main dans le dossier schemas/ du dépôt.";
          });
      };
      fr.readAsDataURL(blob);
    },
    () => {
      msg.textContent = "Image impossible à générer.";
    }
  );
}

/* nom automatique : lettre de la catégorie + numéro suivant, en évitant les fichiers déjà présents */
async function edNomAuto(fam, nm) {
  nm = nm || $("#edName");
  if (!fam) return;
  let pris = [];
  try {
    const r = await fetch(CONFIG.GAME_ADD_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "schemas_liste", key: CONFIG.GAME_ADD_KEY || "" }),
    });
    const j = await r.json();
    if (j.ok) pris = j.schemas.map(s => s.nom.replace(/\.\w+$/, ""));
  } catch (e) {}
  nm.value = admCodeSuggere(fam, pris);
}
/* Schéma d'un jeu, depuis Administration > Gérer les jeux (ED.ctx = { code, titre, ligne, orig }) */
function edCtxHTML() {
  const c = ED.ctx;
  if (!c && ED.back === "proposer")
    return `<div class="box" style="margin:0 0 12px;border-left:6px solid #2E7D4F"><b>Schéma du jeu que vous proposez</b><div class="tools" style="margin-top:8px"><button class="chip" id="edBackForm" style="background:#2E7D4F;color:#fff;border-color:#2E7D4F">← Retour au formulaire</button></div><p class="hint" style="margin:6px 0 0">Dessinez, donnez un nom au fichier puis cliquez sur « Envoyer » : le lien sera ajouté automatiquement à votre proposition.</p></div>`;
  if (!c) return "";
  return `<div class="box" style="margin:0 0 12px;border-left:6px solid #2E7D4F"><b>Schéma ${c.fichier ? esc(c.nom) : "du jeu " + esc(c.code) + " · " + esc(c.titre)}</b><div class="tools" style="margin-top:8px"><button class="chip" id="edCtxSave" style="background:#2E7D4F;color:#fff;border-color:#2E7D4F">✓ Enregistrer dans le jeu</button><button class="chip" id="edCtxBack">← Retour à l'administration</button><label style="display:flex;gap:6px;align-items:center;font-size:14px">Nom du fichier<input id="edCtxName" value="${esc(c.nom || "")}" placeholder="ex. D12" style="padding:6px;border:1px solid #D5DAE5;border-radius:6px;width:160px"></label><span id="edCtxMsg" style="font-weight:700"></span></div><p class="hint" style="margin:6px 0 0">L'image est envoyée dans le dépôt (dossier schemas/) avec son dessin source : vous pourrez la rouvrir et la modifier plus tard. ${c.fichier ? "Le fichier existant est remplacé (changez le nom pour en créer un nouveau)." : "Le champ « Schéma (lien) » du jeu est rempli automatiquement. Un schéma peut servir à plusieurs jeux : gardez le nom pour modifier le fichier existant, changez-le pour en créer un nouveau."}</p></div>`;
}
function edCtxBind() {
  const c = ED.ctx;
  const fm = $("#edFam");
  if (fm) {
    fm.style.display = c ? "none" : "";
    $("#edName").style.display = c ? "none" : "";
    if (!c) {
      fm.innerHTML =
        `<option value="">Catégorie…</option>` +
        Object.keys(FAMS)
          .map(f => `<option>${esc(f)}</option>`)
          .join("");
      fm.onchange = () => edNomAuto(fm.value);
    }
  }
  if (!c && ED.back === "proposer") {
    $("#edBackForm").onclick = () => go("proposer");
    if (fm && PROP.v.Famille && !$("#edName").value) {
      fm.value = PROP.v.Famille;
      edNomAuto(PROP.v.Famille);
    }
    return;
  }
  if (!c) return;
  $("#edCtxBack").onclick = () => go("admin");
  if (!$("#edCtxName").value) edNomAuto(c.fam, $("#edCtxName"));
  $("#edCtxSave").onclick = () => {
    const m = $("#edCtxMsg");
    if (!ED.els.length) {
      m.style.color = "#B2263A";
      m.textContent = "Le dessin est vide.";
      return;
    }
    const nom = ($("#edCtxName").value || "").replace(/\.(png|json)$/i, "").replace(/[^\w-]/g, "");
    if (!nom) {
      m.style.color = "#B2263A";
      m.textContent = "Donnez un nom au fichier.";
      return;
    }
    m.style.color = "#26364D";
    m.textContent = "Envoi en cours…";
    edPngBlob(
      blob => {
        const fr = new FileReader();
        fr.onload = async () => {
          const source = JSON.stringify({ els: ED.els, opt: ED.opt });
          try {
            const j = await admPost(c.fichier ? "admin_schema_fichier" : "admin_schema", {
              ligne: c.ligne,
              titreAvant: c.orig,
              code: nom,
              data: String(fr.result).split(",")[1],
              source,
            });
            if (c.fichier) ADM.schemas = null;
            try {
              localStorage.setItem("edSrc_" + nom, JSON.stringify({ ts: Date.now(), source }));
            } catch (e) {}
            const g = ADM.list && ADM.list.find(x => x.ligne === c.ligne);
            if (g) g.valeurs["Schéma (lien)"] = j.url;
            m.style.color = "#2E7D4F";
            m.textContent = "✓ Schéma enregistré (visible sur le site dans environ une minute).";
          } catch (e) {
            m.style.color = "#B2263A";
            m.textContent = "Échec : " + e.message;
          }
        };
        fr.readAsDataURL(blob);
      },
      () => {
        m.textContent = "Image impossible à générer.";
      }
    );
  };
}
/* ouvre l'éditeur sur le schéma d'un jeu : dessin source s'il existe, sinon page blanche */
async function edOuvrirPourJeu(ctx) {
  let src = null;
  const cle = ctx.nom || ctx.code;
  try {
    const loc = JSON.parse(localStorage.getItem("edSrc_" + cle) || "null");
    const r = await fetch("schemas/" + encodeURIComponent(cle) + ".json?v=" + Date.now());
    const dist = r.ok ? JSON.parse(await r.text()) : null;
    src = loc && (!dist || Date.now() - loc.ts < 600000) ? JSON.parse(loc.source) : dist;
  } catch (e) {
    try {
      const loc = JSON.parse(localStorage.getItem("edSrc_" + cle) || "null");
      if (loc) src = JSON.parse(loc.source);
    } catch (x) {}
  }
  try {
    const cur = JSON.parse(localStorage.getItem("edSchema") || "null");
    if (
      cur &&
      cur.els &&
      cur.els.length &&
      !(ED.ctx && ED.ctx.code === ctx.code && ED.ctx.nom === ctx.nom) &&
      !confirm("Votre brouillon actuel dans l'éditeur sera remplacé. Continuer ?")
    )
      return;
    localStorage.setItem(
      "edSchema",
      JSON.stringify(src && src.els ? src : { els: [], opt: ED.opt })
    );
  } catch (e) {}
  ED.ctx = ctx;
  go("editeur");
}
