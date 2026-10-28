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
    url = CONFIG.SCHEMA_UPLOAD_URL;
  if (!url) {
    msg.innerHTML =
      "L'envoi dans le Drive n'est pas encore configuré (voir le guide : <i>SCHEMA_UPLOAD_URL</i> dans config.js). En attendant, exportez le PNG et déposez-le à la main dans le Drive.";
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
          body: JSON.stringify({ name: name + ".png", data, key: CONFIG.SCHEMA_UPLOAD_KEY || "" }),
        })
          .then(r => r.json())
          .then(j => {
            if (!j.ok) throw new Error(j.error || "refusé");
            msg.innerHTML = `✓ Envoyé. Lien à coller dans « Schéma (lien) » : <input readonly id="edLink" value="${esc(j.url)}" style="width:100%;margin-top:6px;padding:6px;border:1px solid #D5DAE5;border-radius:6px"> <button class="chip" id="edCopyLk" style="margin-top:6px">Copier le lien</button>`;
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
              "). Exportez le PNG et déposez-le à la main dans le Drive.";
          });
      };
      fr.readAsDataURL(blob);
    },
    () => {
      msg.textContent = "Image impossible à générer.";
    }
  );
}
