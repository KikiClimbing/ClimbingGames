/* Documentation technique : affiche docs/maintenance.md (Markdown) dans le site */
let DOCMD = null; /* texte chargé */
let DOCERR = "";
async function chargerDoc() {
  try {
    const r = await fetch("docs/maintenance.md?v=" + Date.now());
    if (!r.ok) throw new Error("HTTP " + r.status);
    DOCMD = await r.text();
  } catch (e) {
    DOCERR = e.message;
  }
  if (VIEW === "admin") render();
}
/* mini convertisseur Markdown → HTML : titres, listes, tableaux, code, gras, liens, citations */
function mdInline(t) {
  const code = [];
  t = esc(t).replace(
    /`([^`]+)`/g,
    (m, c) => "\u0001" + (code.push("<code>" + c + "</code>") - 1) + "\u0001"
  );
  t = t
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*(?=[\s).,;:]|$)/g, "$1<i>$2</i>")
    .replace(
      /\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>'
    );
  return t.replace(/\u0001(\d+)\u0001/g, (m, i) => code[+i]);
}
function mdHTML(md) {
  const L = md.replace(/\r/g, "").split("\n");
  const out = [],
    toc = [];
  let i = 0;
  while (i < L.length) {
    const l = L[i];
    if (/^```/.test(l)) {
      const buf = [];
      i++;
      while (i < L.length && !/^```/.test(L[i])) buf.push(L[i++]);
      i++;
      out.push(`<pre class="mdc">${esc(buf.join("\n"))}</pre>`);
    } else if (/^#{1,4} /.test(l)) {
      const n = l.match(/^#+/)[0].length,
        txt = l.replace(/^#+ /, "");
      const id = "doc" + toc.length;
      if (n === 2) toc.push({ id, txt });
      out.push(`<h${n + 1} class="mdh" id="${id}">${mdInline(txt)}</h${n + 1}>`);
      i++;
    } else if (/^\|/.test(l) && /^\|[\s:|-]+\|?$/.test(L[i + 1] || "")) {
      const cells = r =>
        r
          .replace(/^\||\|$/g, "")
          .split(/(?<!\\)\|/)
          .map(c => c.trim().replace(/\\\|/g, "|"));
      const head = cells(l);
      i += 2;
      const rows = [];
      while (i < L.length && /^\|/.test(L[i])) rows.push(cells(L[i++]));
      out.push(
        `<div style="overflow-x:auto"><table class="mdt"><thead><tr>${head.map(c => `<th>${mdInline(c)}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${mdInline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
      );
    } else if (/^\s*([-*]|\d+\.) /.test(l)) {
      const ord = /^\s*\d+\./.test(l),
        items = [];
      while (i < L.length && /^\s*([-*]|\d+\.) /.test(L[i])) {
        let t = L[i++].replace(/^\s*([-*]|\d+\.) /, "");
        while (i < L.length && /^\s{2,}\S/.test(L[i]) && !/^\s*([-*]|\d+\.) /.test(L[i]))
          t += " " + L[i++].trim();
        items.push(`<li>${mdInline(t)}</li>`);
      }
      out.push(`<${ord ? "ol" : "ul"}>${items.join("")}</${ord ? "ol" : "ul"}>`);
    } else if (/^> /.test(l)) {
      out.push(`<blockquote>${mdInline(l.slice(2))}</blockquote>`);
      i++;
    } else if (!l.trim()) i++;
    else {
      const buf = [];
      while (i < L.length && L[i].trim() && !/^(```|#{1,4} |\||> |\s*([-*]|\d+\.) )/.test(L[i]))
        buf.push(L[i++]);
      out.push(`<p>${mdInline(buf.join(" "))}</p>`);
    }
  }
  return { html: out.join("\n"), toc };
}
/* contenu de l'onglet « Documentation » de la page Administration (affiché seulement après connexion) */
function docHTML() {
  const head = "";
  if (DOCMD === null) {
    if (!DOCERR) chargerDoc();
    return (
      head +
      `<div class="box">${DOCERR ? "Impossible de charger la documentation (" + esc(DOCERR) + "). Ouvrez le site depuis son adresse web (pas en double-cliquant sur index.html) ou lisez directement docs/maintenance.md dans le dépôt." : "Chargement…"}</div>`
    );
  }
  const d = mdHTML(DOCMD.replace(/^# .*\n/, ""));
  return (
    head +
    `<div class="box"><b>Sommaire</b><ol class="mdtoc">${d.toc.map(t => `<li><a data-doc="${t.id}" style="cursor:pointer">${mdInline(t.txt)}</a></li>`).join("")}</ol></div><div class="md">${d.html}</div>`
  );
}
registerClick(e => {
  const a = e.target.closest("[data-doc]");
  if (!a) return;
  const t = document.getElementById(a.dataset.doc);
  if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
});
