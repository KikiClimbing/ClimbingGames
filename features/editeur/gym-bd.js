/* Style BD du personnage (prépa physique) : tête ronde avec visage, cheveux, haut de couleur,
   avant-bras et mains couleur peau, chaussures claires, contours foncés. La couleur choisie = les vêtements. */
const BD_SKIN = "#F3C9A6",
  BD_INK = "#26364D",
  BD_HAIR = "#5A3B2A",
  BD_SHOE = "#F5F7FB";
function gymBDSVG(e) {
  const g = gymGeo(e),
    s = g.s,
    u = Math.max(s, 0.8),
    col = CN(e.c || "blue"),
    far = darken(col, 0.78),
    skinFar = darken(BD_SKIN, 0.9);
  const P = v => `${(+v[0]).toFixed(3)} ${(+EY(v[1])).toFixed(3)}`;
  /* trait épais avec contour foncé */
  const ln = (a, b, c, w) => {
    const d = `M${P(a)}L${P(b)}`;
    return `<path d="${d}" stroke="${BD_INK}" stroke-width="${(w + 0.34 * u).toFixed(3)}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${c}" stroke-width="${w.toFixed(3)}" stroke-linecap="round" fill="none"/>`;
  };
  const leg = i => {
    const L = g.legs[i],
      c = i ? far : col;
    return ln(L.a, L.m, c, 1.6 * u) + ln(L.m, L.f, c, 1.35 * u) + ln(L.f, L.t, i ? darken(BD_SHOE, 0.88) : BD_SHOE, 1.2 * u);
  };
  const arm = i => {
    const A = g.arms[i];
    const c = i ? far : col,
      k = i ? skinFar : BD_SKIN;
    return (
      ln(A.a, A.m, c, 1.25 * u) +
      ln(A.m, A.h, k, 1.0 * u) +
      `<circle cx="${A.h[0].toFixed(3)}" cy="${EY(A.h[1]).toFixed(3)}" r="${(0.68 * u).toFixed(3)}" fill="${k}" stroke="${BD_INK}" stroke-width="${(0.17 * u).toFixed(3)}"/>`
    );
  };
  const torso = () => {
    const w = 3.2 * u;
    let d = `M${P(g.hip)}L${P(g.sh)}`;
    if (e.cv) d = `M${P(g.hip)}Q${P(g.ctrl)} ${P(g.sh)}`;
    return `<path d="${d}" stroke="${BD_INK}" stroke-width="${(w + 0.34 * u).toFixed(3)}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${col}" stroke-width="${w.toFixed(3)}" stroke-linecap="round" fill="none"/>`;
  };
  /* tête : visage tourné selon l'inclinaison du cou */
  const r = GYM.HEAD * s * 1.3,
    q = e.hq ?? (e.cv ? (Math.atan2(g.sh[0] - g.ctrl[0], g.sh[1] - g.ctrl[1]) * 180) / Math.PI : e.lean || 0),
    lk = (e.look || 0) * 0.34 * r,
    cx = g.hd[0],
    cy = EY(g.hd[1]);
  const face = `
    <path d="M${-r * 0.98} ${-r * 0.05}A${r} ${r} 0 0 1 ${r * 0.98} ${-r * 0.05}Q${r * 0.55} ${-r * 0.62} ${lk * 0.4} ${-r * 0.5}Q${-r * 0.6} ${-r * 0.55} ${-r * 0.98} ${-r * 0.05}Z" fill="${BD_HAIR}" stroke="${BD_INK}" stroke-width="${r * 0.1}" stroke-linejoin="round"/>
    <ellipse cx="${lk - r * 0.36}" cy="${r * 0.08}" rx="${r * 0.11}" ry="${r * 0.16}" fill="${BD_INK}"/>
    <ellipse cx="${lk + r * 0.36}" cy="${r * 0.08}" rx="${r * 0.11}" ry="${r * 0.16}" fill="${BD_INK}"/>
    <circle cx="${lk - r * 0.32}" cy="${r * 0.02}" r="${r * 0.04}" fill="#fff"/>
    <circle cx="${lk + r * 0.4}" cy="${r * 0.02}" r="${r * 0.04}" fill="#fff"/>
    <circle cx="${lk - r * 0.62}" cy="${r * 0.38}" r="${r * 0.14}" fill="#F29B9B" opacity=".55"/>
    <circle cx="${lk + r * 0.62}" cy="${r * 0.38}" r="${r * 0.14}" fill="#F29B9B" opacity=".55"/>
    <path d="M${lk - r * 0.3} ${r * 0.42}Q${lk} ${r * 0.72} ${lk + r * 0.3} ${r * 0.42}" fill="none" stroke="${BD_INK}" stroke-width="${r * 0.09}" stroke-linecap="round"/>`;
  const head = `${ln(g.sh, g.hd, BD_SKIN, 0.95 * u)}<g transform="translate(${cx.toFixed(3)} ${cy.toFixed(3)}) rotate(${q.toFixed(1)})"><circle r="${r.toFixed(3)}" fill="${BD_SKIN}" stroke="${BD_INK}" stroke-width="${(0.17 * u).toFixed(3)}"/><ellipse cx="${(-r * 1.0).toFixed(3)}" cy="${(r * 0.1).toFixed(3)}" rx="${(r * 0.14).toFixed(3)}" ry="${(r * 0.22).toFixed(3)}" fill="${BD_SKIN}" stroke="${BD_INK}" stroke-width="${(0.12 * u).toFixed(3)}"/><ellipse cx="${(r * 1.0).toFixed(3)}" cy="${(r * 0.1).toFixed(3)}" rx="${(r * 0.14).toFixed(3)}" ry="${(r * 0.22).toFixed(3)}" fill="${BD_SKIN}" stroke="${BD_INK}" stroke-width="${(0.12 * u).toFixed(3)}"/><circle r="${(r - 0.05).toFixed(3)}" fill="${BD_SKIN}"/>${face}</g>`;
  return leg(1) + arm(1) + torso() + leg(0) + arm(0) + head;
}
