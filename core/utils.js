/* Fonctions utilitaires */
const $ = s => document.querySelector(s);
const esc = s =>
  String(s == null ? "" : s).replace(
    /[&<>"]/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]
  );
const norm = s =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
function parseCSV(t) {
  const rows = [];
  let r = [],
    f = "",
    q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c == '"') {
        if (t[i + 1] == '"') {
          f += '"';
          i++;
        } else q = false;
      } else f += c;
    } else if (c == '"') q = true;
    else if (c == ",") {
      r.push(f);
      f = "";
    } else if (c == "\n" || c == "\r") {
      if (c == "\r" && t[i + 1] == "\n") i++;
      r.push(f);
      rows.push(r);
      r = [];
      f = "";
    } else f += c;
  }
  if (f !== "" || r.length) {
    r.push(f);
    rows.push(r);
  }
  const h = rows.shift().map(x => x.trim());
  return rows
    .filter(x => x.some(y => y.trim()))
    .map(x => Object.fromEntries(h.map((k, i) => [k, (x[i] || "").trim()])));
}
function driveImg(u) {
  const m = String(u || "").match(/(?:\/d\/|[?&]id=)([\w-]{15,})/);
  return m && /drive\.google/.test(u)
    ? "https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w1600"
    : u;
}
