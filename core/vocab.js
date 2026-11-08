/* Vocabulaire de la Prépa physique : « jeu » devient « exercice » partout dans l'interface.
   Traduit les textes affichés (et placeholder / title / aria-label) quand DISC === "prepa".
   Les données (titres, descriptions) ne sont pas modifiées. */
const VOCAB_REGLES = [
  [/\b(C|c)e jeu\b/g, (m, c) => c + "et exercice"],
  [/\b(N|n)ouveau jeu\b/g, (m, c) => c + "ouvel exercice"],
  [/\b(D|d)u jeu\b/g, (m, c) => c + "e l'exercice"],
  [/\b(A|a)u jeu\b/g, (m, c) => (c === "A" ? "À" : "à") + " l'exercice"],
  [/\b(L|l)e jeu\b/g, (m, c) => c + "'exercice"],
  [/\bde jeux\b/g, "d'exercices"],
  [/\bde jeu\b/g, "d'exercice"],
  [/\bJEUX\b/g, "EXERCICES"],
  [/\bJEU\b/g, "EXERCICE"],
  [/\bJeux\b/g, "Exercices"],
  [/\bJeu\b/g, "Exercice"],
  [/\bjeux\b/g, "exercices"],
  [/\bjeu\b/g, "exercice"],
];
const VOCAB_SKIP = "script,style,textarea,input,.brand,.bar,[data-novocab]";
function vocabTxt(s) {
  if (!s || !/jeu/i.test(s)) return s;
  return VOCAB_REGLES.reduce((t, [re, to]) => t.replace(re, to), s);
}
function vocabNoeud(n) {
  if (DISC !== "prepa" || !n) return;
  if (n.nodeType === 3) {
    const p = n.parentElement;
    if (p && !p.closest(VOCAB_SKIP)) {
      const t = vocabTxt(n.nodeValue);
      if (t !== n.nodeValue) n.nodeValue = t;
    }
    return;
  }
  if (n.nodeType !== 1 || n.closest(VOCAB_SKIP)) return;
  const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
  const L = [];
  while (w.nextNode()) L.push(w.currentNode);
  L.forEach(vocabNoeud);
  [n, ...n.querySelectorAll("[placeholder],[title],[aria-label]")].forEach(e => {
    ["placeholder", "title", "aria-label"].forEach(a => {
      const v = e.getAttribute && e.getAttribute(a);
      if (v) {
        const t = vocabTxt(v);
        if (t !== v) e.setAttribute(a, t);
      }
    });
  });
}
(function () {
  const go = () => {
    vocabNoeud(document.body);
    new MutationObserver(ms => {
      if (DISC !== "prepa") return;
      ms.forEach(m => m.addedNodes.forEach(vocabNoeud));
    }).observe(document.body, { childList: true, subtree: true });
  };
  if (document.body) go();
  else document.addEventListener("DOMContentLoaded", go);
})();
