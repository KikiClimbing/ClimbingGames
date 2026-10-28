/* Ma séance : éditeur + fiche calquée sur le modèle */
/* ===== Ma séance v2 : échauffement + corps de séance à sous-sections, jeux de la bibliothèque ou libres ===== */
const C1="#3A8FB0",C2="#E8662F",NAVYC="#1E2630";
let SE=null;let SEUID=1;
const seNew=()=>({ech:{on:true,nom:"",d1:10,d2:10,txt:""},subs:[{id:SEUID++,titre:"",g:"both",d1:15,d2:15,items:[]}]});
function seLoad(){try{SE=JSON.parse(localStorage.getItem("maSeance2")||"null")}catch(e){SE=null}
  if(!SE||!Array.isArray(SE.subs)){SE=seNew();
    if(SEL&&SEL.length){const one=(a,f)=>a.reduce((t,x)=>t+(+x[f]||0),0);const g=s=>DATA.find(x=>key(x)===s.k);
      const ech=SEL.filter(s=>s.ph==="ech"&&g(s)),c1=SEL.filter(s=>(s.ph||"c1")==="c1"&&g(s)),c2=SEL.filter(s=>s.ph==="c2"&&g(s));const m2=s=>s.min2===undefined?s.min:s.min2;
      if(ech.length){SE.ech.txt=ech.map(s=>"• "+g(s).Titre+(g(s).Code?" ("+g(s).Code+")":"")+" — "+(g(s)["Résumé"]||"")).join("\n");SE.ech.d1=one(ech,"min");SE.ech.d2=ech.reduce((t,s)=>t+(+m2(s)||0),0)}
      const mk=(arr,t)=>({id:SEUID++,titre:t,g:"both",d1:one(arr,"min"),d2:arr.reduce((a,s)=>a+(+m2(s)||0),0),items:arr.map(s=>({id:SEUID++,t:"lib",k:s.k,crit:""}))});
      SE.subs=[];if(c1.length)SE.subs.push(mk(c1,SMETA.bloc1||""));if(c2.length)SE.subs.push(mk(c2,SMETA.bloc2||""));if(!SE.subs.length)SE.subs=seNew().subs}}
  let mx=0;SE.subs.forEach(s=>{mx=Math.max(mx,s.id||0);s.items.forEach(i=>mx=Math.max(mx,i.id||0))});SEUID=mx+1;SE.subs.forEach(s=>{if(!s.id)s.id=SEUID++;s.items.forEach(i=>{if(!i.id)i.id=SEUID++})})}
const seSave=()=>{try{localStorage.setItem("maSeance2",JSON.stringify(SE))}catch(e){}};
const selCount=()=>SE?SE.subs.reduce((a,s)=>a+s.items.length,0):0;
const seHas=c=>SE.subs.some(s=>s.items.some(i=>i.t==="lib"&&i.k===c));
function seAdd(c,subId){const g=DATA.find(x=>key(x)===c);if(!g||seHas(c))return;let s=SE.subs.find(x=>x.id===subId)||SE.subs[SE.subs.length-1];if(!s){s={id:SEUID++,titre:"",g:"both",d1:15,d2:15,items:[]};SE.subs.push(s)}s.items.push({id:SEUID++,t:"lib",k:c,crit:""});seSave();const e=$("#selcount");if(e)e.textContent=selCount()}
function seFind(id){for(const s of SE.subs){const i=s.items.findIndex(x=>x.id===id);if(i>=0)return {s,i}}return null}
const inSel=seHas,addSel=seAdd;
seDefaults0();function seDefaults0(){}
function seDefaults(){const d={titre:"",periode:"",theme:"",educ:"",objectif:"",dates:"",deux:true,g1:"Enfants (8–10 ans)",g2:"Ados (11–14 ans)",acc1:5,acc2:5,objCol:"",secu:"",rc1:"",rc2:""};Object.keys(d).forEach(k=>{if(SMETA[k]===undefined)SMETA[k]=d[k]})}
const stepsOf=(v,it)=>{let L=String(v.desc||"").split(/\n/).map(l=>l.replace(/^\s*[•\-–▸]\s*/,"").trim()).filter(Boolean);if(L.length===1&&!v.free)L=L[0].split(/(?<=[.!?])\s+(?=[A-ZÉÈÀÂÎÔÛ«"“])/).map(l=>l.trim()).filter(Boolean);return L};
const lines=t=>String(t||"").split(/\n/).map(l=>l.replace(/^\s*[•\-–]\s*/,"").trim()).filter(Boolean);
const capf=t=>t.charAt(0).toUpperCase()+t.slice(1);
/* vue normalisée d'un jeu (bibliothèque ou libre) */
function itemView(it){if(it.t==="lib"){const g=DATA.find(x=>key(x)===it.k);if(!g)return null;return {titre:g.Titre,code:g.Code||"",desc:g["Principe"]||g["Résumé"]||"",meta:[g["Participants"],g["Espace"],g["Matériel"]&&"Matériel : "+g["Matériel"]].filter(Boolean).join(" · "),plus:g["Plus difficile"],moins:g["Plus facile"],crit:it.crit,mat:g["Matériel"],noMat:noMat(g),resume:g["Résumé"]||"",fam:g}}
  return {titre:it.titre||"[Nom du jeu]",code:"",desc:it.desc||"",meta:[it.part,it.mat&&"Matériel : "+it.mat].filter(Boolean).join(" · "),plus:it.plus,moins:it.moins,crit:it.crit,mat:it.mat,noMat:/^(aucun|—)/i.test((it.mat||"").trim()),resume:it.desc||"",free:true}}
function seModel(){seDefaults();const two=SMETA.deux!==false;const inc=(s)=>({1:s.g!=="2",2:two&&s.g!=="1"});
  const subs=SE.subs.map(s=>{const g=two?s.g:"1";const i1=g!=="2",i2=two&&g!=="1";return {...s,g,i1,i2,views:s.items.map(i=>({it:i,v:itemView(i)})).filter(x=>x.v)}});
  subs.forEach(s=>{const many=s.views.length>1;s.views.forEach(x=>{const def=(!many&&s.titre)?s.titre:x.v.titre;x.def=def;x.name=(x.it.nom||"").trim()||def;x.same=!!s.titre&&norm(x.name)===norm(s.titre);x.steps=stepsOf(x.v,x.it)})});
  const mats={};subs.forEach(s=>s.views.forEach(({v})=>{if(v.noMat||!v.mat)return;String(v.mat).split(/[;,]|\bet\b/i).map(x=>x.replace(/\(.*?\)/g,"").trim()).filter(t=>t&&!/^(aucun|option)/i.test(norm(t))).forEach(t=>{const kk=norm(t);(mats[kk]=mats[kk]||{t,c:[]}).c.push(v.code||v.titre)})}));
  const ech=SE.ech,e1=ech.on?(+ech.d1||0):0,e2=ech.on?(+ech.d2||0):0;
  const c1=subs.reduce((a,s)=>a+(s.i1?(+s.d1||0):0),0),c2=subs.reduce((a,s)=>a+(s.i2?(+s.d2||0):0),0);
  return {two,subs,ech,mats:Object.values(mats),c1,c2,tot1:(+SMETA.acc1||0)+e1+c1,tot2:(+SMETA.acc2||0)+e2+c2,nGames:subs.reduce((a,s)=>a+s.views.length,0)}}
/* étiquettes de durée : [{t:"15'",c:couleur}] */
const tgs=(M,d1,d2,g="both")=>{const a=[];if(g!=="2")a.push({t:d1+"'",c:C1});if(M.two&&g!=="1")a.push({t:d2+"'",c:C2});return a};
function sheetHTML(){const M=seModel(),S=SMETA,two=M.two;const ph=t=>`<i style="color:#8A93A3">${t}</i>`;const v=(x,p)=>x?esc(x):ph(p);
  const tagbox=a=>`<span style="display:inline-flex;gap:3px">${a.map(x=>`<span style="background:${x.c};color:#fff;font-weight:700;padding:2px 9px;min-width:30px;text-align:center">${x.t}</span>`).join("")}</span>`;
  const band=(a,title,bg,col,body)=>`<div style="display:flex;align-items:center;gap:10px;background:${bg};padding:3px 8px 3px 0;margin-top:8px;font-size:12px;font-weight:700;color:${col}">${tagbox(a)}<span>${title}</span></div>${body||""}`;
  let h=`<div class="sheet" style="font-size:13px;color:#2B2F36;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact">
  <div style="background:${NAVYC};color:#fff;display:grid;grid-template-columns:2fr 1.6fr 1.1fr 1.4fr;gap:14px;padding:12px 16px;align-items:center">
   <div><b style="font-size:18px">${v(S.titre,"[Cycle n — Séance n]")}</b> <span style="color:#C9D1DE">${v(S.periode,"[période]")}</span><br><b>Thème :</b> <span style="color:#C9D1DE">${v(S.theme,"[thème de la séance]")}</span><br><b>Éducateurs :</b> <span style="color:#C9D1DE">${v(S.educ,"[prénoms]")}</span></div>
   <div><b>Objectif général :</b> <span style="color:#C9D1DE">${v(S.objectif,"[ce que la séance doit permettre d'apprendre]")}</span></div>
   <div style="text-align:center"><b>Dates :</b> <span style="color:#C9D1DE">${v(S.dates,"[jj mois]")}</span></div>
   <div style="font-size:12px"><span style="color:${C1}">■</span> ${esc(S.g1||"Groupe 1")} – ${M.tot1} min${two?`<br><span style="color:${C2}">■</span> ${esc(S.g2||"Groupe 2")} – ${M.tot2} min`:""}</div></div>`;
  h+=band(tgs(M,S.acc1||0,S.acc2||0),"ACCUEIL","#FDF3D3","#8A6D12");
  if(M.ech.on)h+=band(tgs(M,M.ech.d1||0,M.ech.d2||0),"ÉCHAUFFEMENT"+(M.ech.nom?" — "+esc(M.ech.nom):""),"#E6F2E6","#2E6F3E",lines(M.ech.txt).length?`<div style="padding:4px 10px;font-size:12px">${String(M.ech.txt).split("\n").map(l=>`<div><span style="color:${C1};font-weight:700">▸</span> ${esc(l.replace(/^\s*[•\-–▸]\s*/,""))}</div>`).join("")}</div>`:`<div style="padding:4px 10px;font-size:12px">${ph("▸ [Décrire le déroulé : qui fait quoi, combien de temps]")}</div>`);
  h+=band(tgs(M,M.c1,M.c2),"CORPS DE SÉANCE","#E3EEF8","#2B5A9E");
  const th=(t,c,f)=>`<div style="background:${f};color:${c};font-weight:700;font-size:11px;padding:5px 10px;border-bottom:1px solid #D5DAE5">${t}</div>`;
  const exo=(x,n)=>{const v=x.v,L=lines;const nm=esc(x.name);const col=(t,c,sg,bg)=>`<div style="background:${bg};padding:6px 10px;border-bottom:1px solid #D5DAE5;font-size:12px">${L(t).map(l=>`<div style="margin-bottom:2px"><b style="color:${c}">${sg}</b> ${esc(l)}</div>`).join("")||ph("—")}</div>`;
    const cr=L(v.crit);
    const first=x.same?`<div style="margin:0 0 3px">${x.steps.map(l=>`<div><b style="color:${C1}">▸</b> ${esc(l)}</div>`).join("")}</div>`:`<b style="color:${C1}">▸</b> <b>${n}. ${nm}</b>${v.code?` <span style="color:#6B7280;font-size:11px">(${esc(v.code)})</span>`:""}<div style="margin:2px 0;white-space:pre-line">${esc(v.desc)}</div>`;
    return `<div style="padding:6px 10px;border-bottom:1px solid #D5DAE5;font-size:12px">${first}<div style="color:#6B7280;font-size:11px;font-style:italic">${x.same&&v.code?"Fiche "+esc(v.code)+" · ":""}${esc(v.meta)}</div></div>`+col(v.plus,C2,"+","#FDF3F2")+col(v.moins,"#2E6F3E","–","#F1F8F2")+`<div style="background:#FDF3F2;padding:6px 10px;border-bottom:1px solid #D5DAE5;font-size:12px">${cr.length?cr.map(l=>`<div><b style="color:#2E6F3E">✓</b> ${esc(l)}</div>`).join(""):ph("✓ [critère observable]")+"<br>"+ph("✓ [critère observable]")}</div>`};
  if(M.subs.length){let n=0;h+=`<div style="display:grid;grid-template-columns:3.2fr 1.2fr 1.2fr 1.3fr;margin-top:8px"><div style="background:#2B5A9E;color:#E3EEF8;font-weight:700;font-size:11px;padding:5px 10px">EXERCICE / DÉFI / JEU</div>${th("PLUS DIFFICILE (+)","#B2543A","#FBE6E4")}${th("PLUS FACILE (–)","#2E6F3E","#E6F2E8")}${th("CRITÈRES DE RÉUSSITE","#B2263A","#FBE6E4")}`;
    M.subs.forEach((s,k)=>{const who=two&&s.g!=="both"?` <span style="font-weight:400">· ${esc(s.g==="1"?S.g1:S.g2)} seulement</span>`:"";
      h+=`<div style="background:#ECE7F8;padding:4px 10px;font-size:12px;font-weight:700;color:#5B4BA8">${tgs(M,s.d1||0,s.d2||0,s.g).map(x=>`<span style="display:inline-block;background:#fff;color:${x.c};border:1px solid ${x.c};padding:0 6px;margin-right:4px;min-width:26px;text-align:center">${x.t}</span>`).join("")} &nbsp;${esc(s.titre||"Sous-section "+(k+1))}${who}</div><div style="background:#FDF3F2"></div><div style="background:#F1F8F2"></div><div style="background:#FDF3F2"></div>`;
      s.views.forEach(x=>{if(!x.same)n++;h+=exo(x,n)})});h+=`</div>`}
  const fb=(t,b,bg="#F2F3F5")=>`<div style="background:${bg};padding:8px 12px;font-size:12px;border-left:3px solid #fff"><b style="font-size:11px">${t}</b><br>${b}</div>`;
  h+=`<div style="display:grid;grid-template-columns:1.6fr 1.3fr 1.1fr 1.4fr;margin-top:12px">${fb("OBJECTIF COLLECTIF",S.objCol?esc(S.objCol).replace(/\n/g,"<br>"):ph("[ce que le groupe doit réussir]"))}${fb("MATÉRIEL",M.mats.length?M.mats.map(m=>`☐ ${esc(capf(m.t))} <span style="color:#8A93A3;font-size:10px">${m.c.map(esc).join(", ")}</span>`).join("<br>"):"Aucun matériel particulier.")}${fb("SÉCURITÉ",S.secu?esc(S.secu).replace(/\n/g,"<br>"):ph("[rappels : hauteur, tapis, pas de saut…]"))}${fb("RETOUR AU CALME",`<b style="color:${C1}">${esc(S.g1||"Groupe 1")} :</b> ${v(S.rc1,"[étirements, bilan…]")}`+(two?`<br><b style="color:${C2}">${esc(S.g2||"Groupe 2")} :</b> ${v(S.rc2,"[étirements, bilan…]")}`:""))}</div></div>`;
  return h}
/* ---------- éditeur ---------- */
function seanceView(){seDefaults();const M=seModel(),S=SMETA,two=M.two;
  const head=`<h2 class="pt">Ma séance</h2><p class="lead">Construisez votre séance comme dans votre modèle : accueil, échauffement, puis un corps de séance découpé en autant de sous-sections que vous voulez, pour les deux groupes ou pour un seul. Les exercices viennent de la bibliothèque de jeux ou s'écrivent librement. Tout est enregistré dans ce navigateur ; exportez en Word, en PDF ou en texte.</p>`;
  const inp=(k,l,p,span)=>`<label class="sml" style="${span?"grid-column:1/-1":""}">${l}<input data-sm="${k}" value="${esc(S[k])}" placeholder="${esc(p)}"></label>`;
  const colf=(cls,c)=>`border-left:4px solid ${c};padding-left:8px`;
  const num=(attr,l,val,c)=>`<label class="sml" style="${colf(0,c)}">${l}<input type="number" min="0" max="180" ${attr} value="${val}"></label>`;
  const txa=(k,l,p)=>`<label class="sml">${l}<textarea rows="2" data-sm="${k}" placeholder="${esc(p)}">${esc(S[k])}</textarea></label>`;
  const E=SE.ech;
  const subHTML=(s,k)=>{const gsel=two?`<label class="sml">Pour<select data-sa-set="g" data-sub="${s.id}"><option value="both" ${s.g==="both"?"selected":""}>les 2 groupes</option><option value="1" ${s.g==="1"?"selected":""}>${esc(S.g1||"Groupe 1")} seulement</option><option value="2" ${s.g==="2"?"selected":""}>${esc(S.g2||"Groupe 2")} seulement</option></select></label>`:"";
    const sv=M.subs[k];
    const items=sv.items.map((it,j)=>{const v=itemView(it);if(!v)return "";
      const mv=`<span class="noprint" style="white-space:nowrap"><button class="chip" data-sa="iup" data-id="${it.id}">↑</button> <button class="chip" data-sa="idn" data-id="${it.id}">↓</button> <button class="chip" data-sa="irm" data-id="${it.id}">✕</button></span>`;
      const vw=sv.views.find(x=>x.it.id===it.id);const nmf=`<label class="sml">Nom dans la fiche <span style="font-weight:400">(par défaut : ${esc(vw?vw.def:v.titre)})</span><input data-si="nom" data-id="${it.id}" value="${esc(it.nom||"")}" placeholder="${esc(vw?vw.def:v.titre)}"></label>`;
      if(it.t==="lib")return `<div class="sit"><div class="sith"><b style="color:${famOf(v.fam).d}">${esc(v.code||"★")} · ${esc(v.titre)}</b>${mv}</div>${nmf}<label class="sml" style="margin-top:8px">Critères de réussite (un par ligne)<textarea rows="2" data-si="crit" data-id="${it.id}" placeholder="Ex. Le pied est posé sans bruit">${esc(it.crit||"")}</textarea></label></div>`;
      const f=(k2,l,p,rows)=>`<label class="sml" style="${rows?"grid-column:1/-1":""}">${l}${rows?`<textarea rows="${rows}" data-si="${k2}" data-id="${it.id}" placeholder="${esc(p)}">${esc(it[k2]||"")}</textarea>`:`<input data-si="${k2}" data-id="${it.id}" value="${esc(it[k2]||"")}" placeholder="${esc(p)}">`}</label>`;
      return `<div class="sit free"><div class="sith"><b>✎ Exercice libre</b>${mv}</div><div class="smg">${f("titre","Nom de l'exercice","Ex. Le pied muet")}${nmf}${f("part","Participants","Ex. binômes")}${f("mat","Matériel","Aucun")}${f("desc","Consigne / déroulé","Qui joue, ce qu'on fait, comment on gagne…",3)}${f("plus","Plus difficile (+) — un par ligne","• …",2)}${f("moins","Plus facile (–) — un par ligne","• …",2)}${f("crit","Critères de réussite — un par ligne","Ex. Le pied est posé sans bruit",2)}</div><div style="margin-top:6px"><a class="chip" data-sa="tolib" data-id="${it.id}" style="cursor:pointer">＋ Ajouter cet exercice à la bibliothèque</a></div></div>`}).join("");
    return `<div class="ssub"><div class="smg" style="align-items:end"><label class="sml" style="grid-column:span 2">Titre de la sous-section<input data-ss="titre" data-sub="${s.id}" value="${esc(s.titre)}" placeholder="Ex. Poser les pieds"></label>${gsel}${s.g!=="2"?num(`data-ss="d1" data-n="1" data-sub="${s.id}"`,"Durée — "+esc(S.g1||"groupe 1")+" (min)",s.d1,C1):""}${two&&s.g!=="1"?num(`data-ss="d2" data-n="1" data-sub="${s.id}"`,"Durée — "+esc(S.g2||"groupe 2")+" (min)",s.d2,C2):""}
     <span class="noprint" style="white-space:nowrap;padding-bottom:8px"><button class="chip" data-sa="sup" data-sub="${s.id}">↑</button> <button class="chip" data-sa="sdn" data-sub="${s.id}">↓</button> <button class="chip" data-sa="srm" data-sub="${s.id}">✕ Supprimer</button></span></div>
     ${items||'<p class="hint" style="margin:8px 0">Aucun exercice dans cette sous-section.</p>'}
     <div class="sadd"><input list="gl" data-lib="${s.id}" placeholder="Chercher un exercice de la bibliothèque (code ou nom)…"><button class="chip" data-sa="addlib" data-sub="${s.id}">＋ Ajouter</button><button class="chip" data-sa="addfree" data-sub="${s.id}">＋ Exercice libre</button></div></div>`};
  const dl=`<datalist id="gl">${DATA.map(g=>`<option value="${esc((g.Code?g.Code+" · ":"")+g.Titre)}"></option>`).join("")}</datalist>`;
  return head+`<div class="box noprint"><b>Informations de la séance</b>
   <div class="smg">${inp("titre","Cycle et séance","Ex. Cycle 1 — Séance 4")}${inp("periode","Période","Ex. octobre")}${inp("theme","Thème","Ex. Pose de pieds & transfert de poids")}${inp("educ","Éducateurs","Prénoms")}${inp("objectif","Objectif général","Ce que la séance doit permettre d'apprendre",1)}${inp("dates","Dates","Ex. 7 & 10 octobre")}</div>
   <div class="smg" style="margin-top:8px"><label class="fl" style="grid-column:1/-1"><input type="checkbox" id="smDeux" ${two?"checked":""}> Deux groupes (code couleur bleu / orange comme dans le modèle)</label>
    <label class="sml" style="${colf(0,C1)}">Groupe 1<input data-sm="g1" value="${esc(S.g1)}"></label>${two?`<label class="sml" style="${colf(0,C2)}">Groupe 2<input data-sm="g2" value="${esc(S.g2)}"></label>`:"<span></span>"}
    ${num('data-sm="acc1" data-n="1"',"Accueil — "+esc(S.g1||"groupe 1")+" (min)",S.acc1,C1)}${two?num('data-sm="acc2" data-n="1"',"Accueil — "+esc(S.g2||"groupe 2")+" (min)",S.acc2,C2):""}</div></div>
  <div class="box noprint" style="border-left:6px solid #7FCB8F"><label class="fl" style="margin:0 0 8px"><input type="checkbox" id="seEchOn" ${E.on?"checked":""}> <b>Échauffement</b></label>
   ${E.on?`<div class="smg"><label class="sml" style="grid-column:span 2">Nom de l'échauffement<input data-se="nom" value="${esc(E.nom)}" placeholder="Ex. Jeux de déplacement"></label>${num('data-se="d1" data-n="1"',"Durée — "+esc(S.g1||"groupe 1")+" (min)",E.d1,C1)}${two?num('data-se="d2" data-n="1"',"Durée — "+esc(S.g2||"groupe 2")+" (min)",E.d2,C2):""}<label class="sml" style="grid-column:1/-1">Déroulé (texte libre, une ligne par étape)<textarea rows="3" data-se="txt" placeholder="Qui fait quoi, combien de temps. Un jeu du site peut servir : ex. G1 · Jacadi, C2 · Le loup glacé">${esc(E.txt)}</textarea></label></div>`:""}</div>
  <div class="box noprint" style="border-left:6px solid #6EA8DC"><b>Corps de séance</b> <span style="color:#6B7280;font-size:13px">— total : <b style="color:${C1}">${M.c1} min</b>${two?` · <b style="color:${C2}">${M.c2} min</b>`:""}</span>
   <div style="margin-top:8px">${SE.subs.map(subHTML).join("")}</div><div style="margin-top:10px"><a class="chip" data-sa="addsub" style="cursor:pointer;background:#26364D;color:#fff">＋ Ajouter une sous-section</a></div>${dl}</div>
  <div class="box noprint"><b>Bas de fiche</b><div class="smg" style="margin-top:8px">${txa("objCol","Objectif collectif","Ce que le groupe doit réussir")}${txa("secu","Sécurité","Hauteur, tapis, pas de saut…")}${txa("rc1","Retour au calme — "+(S.g1||"groupe 1"),"Étirements, bilan…")}${two?txa("rc2","Retour au calme — "+(S.g2||"groupe 2"),"Étirements, bilan…"):""}</div></div>
  <h3 class="noprint" style="margin:18px 0 8px;color:#26364D">Aperçu de la fiche</h3><div id="sheet" style="border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.12)">${sheetHTML()}</div>
  <div class="tools noprint" style="margin-top:14px"><a class="btn" id="sPrint" style="background:#26364D;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Imprimer / PDF</a><a class="btn" id="sWord" style="background:#2B5A9E;color:#fff;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Télécharger en Word</a><a class="btn" id="sCopy" style="background:#EEF1F8;color:#26364D;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;display:inline-block">Copier le texte</a><a class="chip" id="sClear">Tout effacer</a><span id="sMsg" style="color:#2E7D4F;font-weight:700"></span></div>`}
function seanceText(){const M=seModel(),S=SMETA,two=M.two;let t=(S.titre||"Ma séance")+(S.periode?" ("+S.periode+")":"")+"\n";if(S.theme)t+="Thème : "+S.theme+"\n";if(S.educ)t+="Éducateurs : "+S.educ+"\n";if(S.objectif)t+="Objectif : "+S.objectif+"\n";if(S.dates)t+="Dates : "+S.dates+"\n";
  const d=(a,b)=>a+(two?"/"+b:"");t+=`\nGroupes : ${S.g1}${two?" / "+S.g2:""}\nAccueil [${d(S.acc1,S.acc2)} min]\n`;
  if(M.ech.on){t+=`\nÉCHAUFFEMENT${M.ech.nom?" — "+M.ech.nom:""} [${d(M.ech.d1,M.ech.d2)} min]\n`;if(M.ech.txt)t+=M.ech.txt+"\n"}
  t+=`\nCORPS DE SÉANCE [${d(M.c1,M.c2)} min]\n`;M.subs.forEach((s,k)=>{t+=`\n${s.titre||"Sous-section "+(k+1)}${two&&s.g!=="both"?" · "+(s.g==="1"?S.g1:S.g2)+" seulement":""} [${s.g==="1"?s.d1:s.g==="2"?s.d2:d(s.d1,s.d2)} min]\n`;s.views.forEach(x=>{t+=`- ${x.name}${x.v.code?" ("+x.v.code+")":""} — ${x.v.resume}\n`})});
  t+=`\nDurée totale : ${d(M.tot1,M.tot2)} min\n`;if(M.mats.length)t+="Matériel : "+M.mats.map(m=>capf(m.t)).join(", ")+"\n";return t}
function seToLib(id){const f=seFind(id);if(!f)return;const it=f.s.items[f.i],m=$("#sMsg");if(!it.titre||!it.desc){alert("Renseignez au moins le nom de l'exercice et la consigne.");return}
  const fam=prompt("Famille du jeu : Exploration, Coopération, Défis ou Animation ?",it.fam||"Coopération");if(!fam)return;it.fam=fam;
  const auteur=SMETA.educ||prompt("Votre prénom (auteur de la fiche) ?")||"";
  const jeu={"Titre":it.titre,"Famille":fam,"Résumé":it.desc.split(/[.\n]/)[0].slice(0,140),"Principe":it.desc,"Participants":it.part||"—","Matériel":it.mat||"Aucun","Durée":(f.s.d1||"")+" min","Plus facile":it.moins||"","Plus difficile":it.plus||"","Auteur":auteur};
  if(CONFIG.GAME_ADD_URL){m.textContent="Envoi en cours…";fetch(CONFIG.GAME_ADD_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({key:CONFIG.GAME_ADD_KEY||"",jeu})}).then(r=>r.json()).then(j=>{if(!j.ok)throw new Error(j.error||"refusé");it.sent=true;seSave();m.textContent="✓ Exercice envoyé : il apparaîtra dans la bibliothèque après relecture."}).catch(e=>{m.textContent="Échec de l'envoi ("+e.message+")."})}
  else{const txt=Object.entries(jeu).map(([k,v])=>k+" : "+v).join("\n");try{navigator.clipboard.writeText(txt).catch(()=>{})}catch(e){}m.textContent="Fiche copiée : collez-la dans le formulaire « Proposer un jeu ».";if(CONFIG.FORM_URL)window.open(CONFIG.FORM_URL,"_blank")}}
/* ---------- actions ---------- */
function seanceBind(){const upd=()=>{const s=$("#sheet");if(s)s.innerHTML=sheetHTML()};
  const sub=id=>SE.subs.find(x=>x.id===+id);
  document.querySelectorAll("[data-sm]").forEach(i=>i.addEventListener("input",e=>{SMETA[i.dataset.sm]=i.dataset.n?Math.max(0,+e.target.value||0):e.target.value;saveMeta();upd()}));
  document.querySelectorAll("[data-se]").forEach(i=>i.addEventListener("input",e=>{SE.ech[i.dataset.se]=i.dataset.n?Math.max(0,+e.target.value||0):e.target.value;seSave();upd()}));
  document.querySelectorAll("[data-ss]").forEach(i=>i.addEventListener("input",e=>{const s=sub(i.dataset.sub);s[i.dataset.ss]=i.dataset.n?Math.max(0,+e.target.value||0):e.target.value;seSave();upd()}));
  document.querySelectorAll("[data-si]").forEach(i=>i.addEventListener("input",e=>{const f=seFind(+i.dataset.id);if(f){f.s.items[f.i][i.dataset.si]=e.target.value;seSave();upd()}}));
  document.querySelectorAll("[data-sa-set]").forEach(i=>i.addEventListener("change",e=>{const s=sub(i.dataset.sub);s[i.dataset.saSet]=e.target.value;seSave();render()}));
  const dx=$("#smDeux");if(dx)dx.addEventListener("change",e=>{SMETA.deux=e.target.checked;saveMeta();render()});
  const eo=$("#seEchOn");if(eo)eo.addEventListener("change",e=>{SE.ech.on=e.target.checked;seSave();render()});
  const pr=$("#sPrint");if(pr)pr.addEventListener("click",()=>{document.body.classList.add("ps");const st=document.createElement("style");st.textContent="@page{size:A4 landscape;margin:8mm}";document.head.appendChild(st);window.print();setTimeout(()=>{document.body.classList.remove("ps");st.remove()},800)});
  const wd=$("#sWord");if(wd)wd.addEventListener("click",seanceWord);
  const cp=$("#sCopy");if(cp)cp.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(seanceText());$("#sMsg").textContent="Texte copié !"}catch(e){$("#sMsg").textContent="Copie impossible : sélectionnez le texte à la main."}});
  const cl=$("#sClear");if(cl)cl.addEventListener("click",()=>{if(confirm("Tout effacer (informations et jeux) ?")){SE=seNew();seSave();SMETA={};localStorage.removeItem("maSeanceMeta");buildNav();render()}})}
document.addEventListener("click",e=>{const b=e.target.closest("[data-sa]");if(!b||VIEW!=="seance")return;const a=b.dataset.sa,id=+b.dataset.id,sid=+b.dataset.sub;
  const mvArr=(arr,i,d)=>{const j=i+d;if(j>=0&&j<arr.length)[arr[i],arr[j]]=[arr[j],arr[i]]};let re=true;
  if(a==="addsub")SE.subs.push({id:SEUID++,titre:"",g:"both",d1:10,d2:10,items:[]});
  else if(a==="srm"){if(SE.subs.find(s=>s.id===sid).items.length&&!confirm("Supprimer cette sous-section et ses jeux ?"))return;SE.subs=SE.subs.filter(s=>s.id!==sid)}
  else if(a==="sup"||a==="sdn")mvArr(SE.subs,SE.subs.findIndex(s=>s.id===sid),a==="sup"?-1:1);
  else if(a==="addfree")SE.subs.find(s=>s.id===sid).items.push({id:SEUID++,t:"free",nom:"",titre:"",desc:"",part:"",mat:"",plus:"",moins:"",crit:""});
  else if(a==="addlib"){const inp=document.querySelector(`[data-lib="${sid}"]`),val=(inp.value||"").trim().toLowerCase();const g=DATA.find(x=>((x.Code?x.Code+" · ":"")+x.Titre).toLowerCase()===val)||DATA.find(x=>(x.Code||"").toLowerCase()===val)||DATA.find(x=>norm(x.Titre).includes(norm(val))&&val.length>2);
    if(!g){inp.style.borderColor="#E0485A";return}const s=SE.subs.find(x=>x.id===sid);s.items.push({id:SEUID++,t:"lib",k:key(g),crit:""})}
  else if(a==="irm"){const f=seFind(id);f.s.items.splice(f.i,1)}
  else if(a==="iup"||a==="idn"){const f=seFind(id);mvArr(f.s.items,f.i,a==="iup"?-1:1)}
  else if(a==="tolib"){seToLib(id);re=false}
  if(re){seSave();buildNav();render()}});
seLoad();
registerNav({sec:"MES SÉANCES",secOrder:30,order:3,html:()=>navBtn("seance",`Ma séance<span class="n" id="selcount">${selCount()||""}</span>`,'<span class="ic">☰</span>')});
registerView({match:v=>v==="seance",html:()=>seanceView(),bind:()=>seanceBind()});
registerClick(e=>{const ad=e.target.closest("[data-add]");if(ad){const c=ad.dataset.add;if(inSel(c)){go("seance")}else{addSel(c);ad.textContent="✓ Ajouté — voir ma séance";ad.dataset.done="1"}return true}});
