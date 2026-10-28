/* Aides sur les fiches de jeux : famille, couleurs, liens, tests */
const FDEF = { k: "?", l: "#FBF4DC", m: "#F3E4AE", d: "#86690F", a: "#E3C463" };
const famOf = g => FAMS[g.Famille] || FDEF;
const style = g => {
  const f = famOf(g);
  return `--l:${f.l};--m:${f.m};--d:${f.d};--a:${f.a}`;
};
const pubOK = g => /^(oui|yes|true|1|x|✓)$/i.test(g["Publié"] || "");
const isEmb = g => g.Code && EMBED.some(e => e.Code === g.Code);
const isAnniv = g => /oui|checked|✓|true/i.test(g["Format anniversaire"] || "");
const noMat = g => /^(aucun|—)/i.test((g["Matériel"] || "").trim());
const key = g => g.Code || g.Titre;
const titleOf = c => {
  const g = DATA.find(x => x.Code === c);
  return g ? g.Titre : "";
};
const lk = c =>
  titleOf(c)
    ? `<a class="lk" data-jeu="${esc(c)}" style="color:${(FAMS[(DATA.find(x => x.Code === c) || {}).Famille] || FDEF).d}">${esc(c)} · ${esc(titleOf(c))}</a>`
    : `<span>${esc(c)}</span>`;
const lks = arr => arr.map(lk).join(" ");
const codeLk = c =>
  titleOf(c)
    ? `<a class="lk" data-jeu="${esc(c)}" style="color:${(FAMS[(DATA.find(x => x.Code === c) || {}).Famille] || FDEF).d}">${esc(c)}</a>`
    : esc(c);
