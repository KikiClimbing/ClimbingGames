/* Éditeur de schémas */
/* ================= ÉDITEUR DE SCHÉMAS ================= */
const ED={els:[],sel:null,hist:[],redo:[],next:1,opt:{face:true,mur:true,tapis:true,legende:"",vue:"VUE DE FACE"},drag:null};
const HOLDC=["#F28B82","#F6B26B","#F7D858","#7FCB8F","#6EC1E4","#A894E6","#F49AC1","#5FCDBF"];
const HOLDN=["rouge","orange","jaune","vert","bleu clair","violet","rose","turquoise"];
const EBLUE="#2F6FDB",ERED="#E0485A",EINK="#334155",EGREY="#94A3B8",EAMB="#E0A030",EGREEN="#2E9E6B";
const darken=(c,k=.72)=>{c=c.replace("#","");const r=[0,2,4].map(i=>Math.round(parseInt(c.substr(i,2),16)*k));return "#"+r.map(v=>v.toString(16).padStart(2,"0")).join("")};
const CN=n=>({ink:EINK,blue:EBLUE,red:ERED,green:EGREEN,amber:EAMB,grey:EGREY,brown:"#B45309"}[n]||n||EINK);
const isLine=e=>["arrow","rope","line"].includes(e.t);
const EY=y=>+(36-y).toFixed(3);
function edLoad(){try{const s=JSON.parse(localStorage.getItem("edSchema")||"null");if(s&&Array.isArray(s.els)){s.els=s.els.filter(x=>x&&x.t&&typeof x.id==="number");ED.els=s.els;ED.opt=Object.assign(ED.opt,s.opt||{});ED.next=Math.max(1,...ED.els.map(e=>e.id+1))}}catch(e){}}
function edSave(){try{localStorage.setItem("edSchema",JSON.stringify({els:ED.els,opt:ED.opt}))}catch(e){}}
function edSnap(){ED.hist.push(JSON.stringify({els:ED.els,opt:ED.opt}));if(ED.hist.length>60)ED.hist.shift();ED.redo=[]}
function edUndo(){if(!ED.hist.length)return;ED.redo.push(JSON.stringify({els:ED.els,opt:ED.opt}));const s=JSON.parse(ED.hist.pop());ED.els=s.els;ED.opt=s.opt;ED.sel=null;edRender(true)}
function edRedo(){if(!ED.redo.length)return;ED.hist.push(JSON.stringify({els:ED.els,opt:ED.opt}));const s=JSON.parse(ED.redo.pop());ED.els=s.els;ED.opt=s.opt;ED.sel=null;edRender(true)}
function edAdd(el){edSnap();el.id=ED.next++;ED.els.push(el);ED.sel=el.id;edRender(true)}
const ellipsePath=()=>"";
/* ---- formes (coordonnées en « y vers le haut », converties à l'affichage) ---- */
function limbSVG(p,q,col,lw){const d=`M${p[0]} ${EY(p[1])}L${q[0]} ${EY(q[1])}`;return `<path d="${d}" stroke="#fff" stroke-width="${lw+.38}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${col}" stroke-width="${lw}" stroke-linecap="round" fill="none"/>`}
function headSVG(x,y,r,col){return `<circle cx="${x}" cy="${EY(y)}" r="${r}" fill="${col}" stroke="#fff" stroke-width=".2"/>`}
const FIG={climber:{hip:0,tor:4.2,head:6.1,hands:[[-7,8.5],[7.5,7]],feet:[[-5.4,-5],[5.4,-5]]},
  stand:{hip:5,tor:4.2,head:6,hands:[[-3.2,5.8],[3.2,5.8]],feet:[[-1.7,0],[1.7,0]]},
  sit:{hip:1.2,tor:4,head:5.8,hands:[[3,3.2],[1,2.4]],feet:[[4.8,.8],[3.8,0]]}};
function figFix(e){const d=FIG[e.t];if(d){if(!e.hands)e.hands=JSON.parse(JSON.stringify(d.hands));if(!e.feet)e.feet=JSON.parse(JSON.stringify(d.feet))}return e}
function ik(r,t,L,pref){const dx=t[0]-r[0],dy=t[1]-r[1],d=Math.hypot(dx,dy)||.001;if(d>=2*L*.999)return [(r[0]+t[0])/2,(r[1]+t[1])/2];
  const h=Math.sqrt(L*L-d*d/4),ux=dx/d,uy=dy/d,mx=(r[0]+t[0])/2,my=(r[1]+t[1])/2;const c1=[mx-uy*h,my+ux*h],c2=[mx+uy*h,my-ux*h];
  const sc=c=>pref.x*(c[0]-mx)+pref.y*(c[1]-my);return sc(c1)>=sc(c2)?c1:c2}
function figSVG(e,type){const G=FIG[type];if(!e.hands)e.hands=JSON.parse(JSON.stringify(G.hands));if(!e.feet)e.feet=JSON.parse(JSON.stringify(G.feet));
  const {x,y,s}=e,col=CN(e.c||"blue"),lw=.42*Math.max(s,.75),ang=(e.lean||0)*Math.PI/180,rot=(l)=>[Math.sin(ang)*l,Math.cos(ang)*l];
  const hip=[x,y+G.hip*s],tr=rot(G.tor*s),sh=[hip[0]+tr[0],hip[1]+tr[1]],hr=rot(G.head*s),hd=[hip[0]+hr[0],hip[1]+hr[1]];let o="";
  e.feet.forEach(([fx,fy])=>{const f=[x+fx*s,y+fy*s];const k=ik(hip,f,5*s,{x:fx>=0?1:-1,y:type==="sit"?1:.3});o+=limbSVG(hip,k,col,lw)+limbSVG(k,f,col,lw)+`<circle cx="${f[0]}" cy="${EY(f[1])}" r="${.6*s}" fill="${col}" stroke="#fff" stroke-width=".14"/>`});
  o+=limbSVG(hip,sh,col,lw*1.35);
  e.hands.forEach(([hx,hy])=>{const t=[x+hx*s,y+hy*s];const m=ik(sh,t,4.4*s,{x:hx>=0?1:-1,y:-.6});o+=limbSVG(sh,m,col,lw)+limbSVG(m,t,col,lw)+`<circle cx="${t[0]}" cy="${EY(t[1])}" r="${.6*s}" fill="${col}" stroke="#fff" stroke-width=".14"/>`});
  return o+headSVG(hd[0],hd[1],1.5*s,col)}
const climberSVG=e=>figSVG(e,"climber"),standSVG=e=>figSVG(e,"stand"),sitSVG=e=>figSVG(e,"sit");
function dieSVG(e){const {x,y,s}=e,z=6.5*s,o=z*.25;const P={1:[[0,0]],2:[[-o,o],[o,-o]],3:[[-o,o],[0,0],[o,-o]],4:[[-o,o],[o,o],[-o,-o],[o,-o]],5:[[-o,o],[o,o],[0,0],[-o,-o],[o,-o]],6:[[-o,o],[o,o],[-o,0],[o,0],[-o,-o],[o,-o]]};
  return `<rect x="${x-z/2}" y="${EY(y)-z/2}" width="${z}" height="${z}" rx="1" fill="#fff" stroke="${EINK}" stroke-width=".28"/>`+P[e.n||5].map(([dx,dy])=>`<circle cx="${x+dx}" cy="${EY(y+dy)}" r="${z*.075}" fill="${EINK}"/>`).join("")}
function labSVG(e){if(!e.lab)return "";const x1=e.x1,y1=e.y1,x2=e.x2,y2=e.y2,mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1,bd=e.bend||0;const cx=mx-dy*bd,cy=my-dx*bd*-1;const px=(x1+2*cx+x2)/4,py=(y1+2*(my+dx*bd)+y2)/4;const fs=1.5,w=String(e.lab).length*fs*.54+1.2;return `<rect x="${px-w/2}" y="${EY(py)-fs*.8}" width="${w}" height="${fs*1.6}" rx=".6" fill="#fff" fill-opacity=".95"/><text x="${px}" y="${EY(py)}" text-anchor="middle" dominant-baseline="central" font-size="${fs}" font-weight="700" fill="${CN(e.c==="ink"||!e.c?"ink":e.c)}" font-family="Calibri,Carlito,Arial,sans-serif">${esc(e.lab)}</text>`}
function elSVG(e){return elSVG0(e)+(isLine(e)?labSVG(e):"")}
function elSVG0(e){
  switch(e.t){
    case "hold":return `<circle cx="${e.x}" cy="${EY(e.y)}" r="${e.r}" fill="${e.c}" stroke="${darken(e.c)}" stroke-width=".17"/>`;
    case "ring":{const col=e.c==="amber"?EAMB:EGREEN;return `<circle cx="${e.x}" cy="${EY(e.y)}" r="${e.r}" fill="none" stroke="${col}" stroke-width=".38"/>`}
    case "climber":case "stand":case "sit":return climberSVG(e);
    case "hoopflat":return `<circle cx="${e.x}" cy="${EY(e.y)}" r="${7*e.s}" fill="none" stroke="${EAMB}" stroke-width=".62"/>`;
    case "hoopfloor":return `<ellipse cx="${e.x}" cy="${EY(e.y)}" rx="${6*e.s}" ry="${1.7*e.s}" fill="none" stroke="${EAMB}" stroke-width=".56"/>`;
    case "hoopside":return `<ellipse cx="${e.x}" cy="${EY(e.y)}" rx="${1.7*e.s}" ry="${5.5*e.s}" fill="#FFF3D6" stroke="${EAMB}" stroke-width=".56"/>`;
    case "scarf":{const c=e.c,s=e.s,x=e.x,y=e.y;return `<polygon points="${x-1.3*s},${EY(y)} ${x+1.5*s},${EY(y+.9*s)} ${x+.6*s},${EY(y-1.5*s)}" fill="${c}" stroke="${darken(c,.75)}" stroke-width=".16"/>`}
    case "ball":return `<circle cx="${e.x}" cy="${EY(e.y)}" r="${1.3*e.s}" fill="#F59E0B" stroke="${darken("#F59E0B",.7)}" stroke-width=".19"/><path d="M${e.x-1*e.s} ${EY(e.y)}H${e.x+1*e.s}" stroke="${darken("#F59E0B",.7)}" stroke-width=".14"/>`;
    case "die":return dieSVG(e);
    case "watch":{const r=2.8*e.s,x=e.x,y=EY(e.y);return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${EINK}" stroke-width=".31"/><rect x="${x-.7}" y="${y-r-1}" width="1.4" height="1" fill="${EINK}"/><path d="M${x} ${y}V${y-r*.65}M${x} ${y}L${x+r*.5} ${y+r*.1}" stroke="${EINK}" stroke-width=".26" fill="none"/>`}
    case "quickdraw":{const s=e.s,x=e.x,y=e.y,c="#6B7280";return `<ellipse cx="${x}" cy="${EY(y+1.9*s)}" rx="${.75*s}" ry="${1.15*s}" fill="none" stroke="${c}" stroke-width=".28"/><rect x="${x-.45*s}" y="${EY(y+1)}" width="${.9*s}" height="${1.6*s}" fill="${c}"/><ellipse cx="${x}" cy="${EY(y-1.7*s)}" rx="${.75*s}" ry="${1.15*s}" fill="none" stroke="${c}" stroke-width=".28"/>`}
    case "tape":return [35,-35].map(a=>`<rect x="${e.x-2}" y="${EY(e.y)-.5}" width="4" height="1" fill="#FFE08A" stroke="#C9A227" stroke-width=".1" transform="rotate(${a} ${e.x} ${EY(e.y)})"/>`).join("");

    case "rope":{const col=CN(e.c||"amber");const [x1,y1,x2,y2]=[e.x1,EY(e.y1),e.x2,EY(e.y2)];const mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1;const cx=mx-dy*(e.bend||0),cy=my+dx*(e.bend||0);const d=`M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}`;
      return `<path d="${d}" stroke="#fff" stroke-width="1.25" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${col}" stroke-width=".9" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#fff" stroke-opacity=".55" stroke-width=".9" fill="none" stroke-dasharray=".35 .7"/>`}
    case "line":{const col=CN(e.c||"ink");return `<path d="M${e.x1} ${EY(e.y1)}L${e.x2} ${EY(e.y2)}" stroke="transparent" stroke-width="3" fill="none"/><path d="M${e.x1} ${EY(e.y1)}L${e.x2} ${EY(e.y2)}" stroke="${col}" stroke-width=".45" fill="none" ${e.dash?'stroke-dasharray=".9 .6"':""} stroke-linecap="round"/>`}
    case "zone":{const col=CN(e.c||"blue"),w=e.w||20,h=e.h||10;return `<rect x="${e.x-w/2}" y="${EY(e.y)-h/2}" width="${w}" height="${h}" rx="1" fill="${col}" fill-opacity=".12" stroke="${col}" stroke-width=".3" stroke-dasharray=".9 .6"/>`}
    case "zonecircle":{const col=CN(e.c||"green");return `<circle cx="${e.x}" cy="${EY(e.y)}" r="${8*e.s}" fill="${col}" fill-opacity=".12" stroke="${col}" stroke-width=".3" stroke-dasharray=".9 .6"/>`}
    case "cone":{const s=e.s,x=e.x,y=EY(e.y);return `<rect x="${x-1.5*s}" y="${y-.4*s}" width="${3*s}" height=".8" fill="#E8590C"/><polygon points="${x-1.1*s},${y-.2*s} ${x+1.1*s},${y-.2*s} ${x},${y-3.2*s}" fill="#FF8A3D" stroke="#C2410C" stroke-width=".15"/><rect x="${x-.7*s}" y="${y-1.8*s}" width="${1.4*s}" height=".45" fill="#fff"/>`}
    case "bench":{const s=e.s,x=e.x,y=EY(e.y);return `<rect x="${x-4*s}" y="${y-.7*s}" width="${8*s}" height="${1.1*s}" rx=".3" fill="#C99A5B" stroke="#8A6330" stroke-width=".18"/><rect x="${x-3.4*s}" y="${y+.4*s}" width=".7" height="${1.9*s}" fill="#8A6330"/><rect x="${x+2.7*s}" y="${y+.4*s}" width=".7" height="${1.9*s}" fill="#8A6330"/>`}
    case "mat":{const s=e.s,x=e.x,y=EY(e.y);return `<rect x="${x-6*s}" y="${y-1.2*s}" width="${12*s}" height="${2.4*s}" rx=".9" fill="#DDE5F0" stroke="#8FA0BA" stroke-width=".25"/><path d="M${x-2*s} ${y-1.2*s}V${y+1.2*s}M${x+2*s} ${y-1.2*s}V${y+1.2*s}" stroke="#8FA0BA" stroke-width=".15"/>`}
    case "foot":{const col=CN(e.c||"blue"),s=e.s,x=e.x,y=EY(e.y);return `<g transform="rotate(${e.rot||0} ${x} ${y})"><ellipse cx="${x}" cy="${y-.9*s}" rx="${.85*s}" ry="${1.5*s}" fill="${col}" fill-opacity=".85"/><ellipse cx="${x}" cy="${y+1.3*s}" rx="${.6*s}" ry="${.8*s}" fill="${col}" fill-opacity=".85"/></g>`}
    case "handp":{const col=CN(e.c||"blue"),s=e.s,x=e.x,y=EY(e.y);return `<g transform="rotate(${e.rot||0} ${x} ${y})"><ellipse cx="${x}" cy="${y+.3*s}" rx="${1.1*s}" ry="${1.2*s}" fill="${col}" fill-opacity=".85"/>`+[[-1.1,-1.3,-.15],[-.4,-1.8,0],[.4,-1.8,0],[1.1,-1.3,.15]].map(([dx,dy])=>`<ellipse cx="${x+dx*s}" cy="${y+dy*s}" rx="${.3*s}" ry="${.7*s}" fill="${col}" fill-opacity=".85"/>`).join("")+`</g>`}
    case "cross":{const s=e.s,x=e.x,y=EY(e.y);return `<path d="M${x-1.6*s} ${y-1.6*s}L${x+1.6*s} ${y+1.6*s}M${x+1.6*s} ${y-1.6*s}L${x-1.6*s} ${y+1.6*s}" stroke="${ERED}" stroke-width=".7" stroke-linecap="round"/>`}
    case "check":{const s=e.s,x=e.x,y=EY(e.y);return `<path d="M${x-1.8*s} ${y}L${x-.5*s} ${y+1.4*s}L${x+1.9*s} ${y-1.6*s}" stroke="${EGREEN}" stroke-width=".75" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`}
    case "star":{const col=CN(e.c||"amber"),s=e.s,x=e.x,y=EY(e.y);const p=[...Array(10)].map((_,i)=>{const a=-Math.PI/2+i*Math.PI/5,r=(i%2?.9:2.1)*s;return (x+r*Math.cos(a)).toFixed(2)+","+(y+r*Math.sin(a)).toFixed(2)}).join(" ");return `<polygon points="${p}" fill="${col}" stroke="#fff" stroke-width=".18" stroke-linejoin="round"/>`}
    case "num":{const col=CN(e.c||"blue"),s=e.s,x=e.x,y=EY(e.y);return `<circle cx="${x}" cy="${y}" r="${1.7*s}" fill="${col}" stroke="#fff" stroke-width=".22"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${2.1*s}" font-weight="700" fill="#fff" font-family="Calibri,Carlito,Arial,sans-serif">${esc(String(e.n||1))}</text>`}
    case "flag":{const col=CN(e.c||"red"),s=e.s,x=e.x,y=EY(e.y);return `<rect x="${x-.15}" y="${y-5*s}" width=".3" height="${5*s}" fill="${EINK}"/><polygon points="${x+.15},${y-5*s} ${x+3.2*s},${y-3.9*s} ${x+.15},${y-2.8*s}" fill="${col}"/>`}
    case "target":{const s=e.s,x=e.x,y=EY(e.y);return [[2.4,"#fff"],[1.8,ERED],[1.2,"#fff"],[.6,ERED]].map(([r,c])=>`<circle cx="${x}" cy="${y}" r="${r*s}" fill="${c}" stroke="${ERED}" stroke-width=".12"/>`).join("")}
    case "card":{const s=e.s,x=e.x,y=EY(e.y);return `<rect x="${x-1.6*s}" y="${y-2.2*s}" width="${3.2*s}" height="${4.4*s}" rx=".4" fill="#fff" stroke="${EINK}" stroke-width=".2"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${2.4*s}" font-weight="700" fill="${EBLUE}" font-family="Calibri,Carlito,Arial,sans-serif">?</text>`}
    case "volume":{const col=CN(e.c||"#A894E6"),s=e.s,x=e.x,y=EY(e.y);return `<polygon points="${x-4*s},${y+2.6*s} ${x},${y-3.2*s} ${x+4*s},${y+2.6*s}" fill="${col}" stroke="${darken(col.startsWith("#")?col:"#888888")}" stroke-width=".25" stroke-linejoin="round"/><polygon points="${x},${y-3.2*s} ${x+4*s},${y+2.6*s} ${x+1.2*s},${y+2.6*s}" fill="#000" fill-opacity=".1"/>`}
    case "arrow":{const col=CN(["blue","red","green"].includes(e.c)?e.c:"ink");const [x1,y1,x2,y2]=[e.x1,EY(e.y1),e.x2,EY(e.y2)];const mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1;const cx=mx-dy*(e.bend||0),cy=my+dx*(e.bend||0);
      return `<path d="M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}" stroke="transparent" stroke-width="3" fill="none"/><path d="M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}" stroke="${col}" stroke-width=".36" fill="none" ${e.dash?'stroke-dasharray=".9 .6"':""} marker-end="url(#ah-${["blue","red","green"].includes(e.c)?e.c:"ink"})"/>`}
    case "text":{const col={ink:EINK,green:EGREEN,amber:"#8A6D12",blue:EBLUE,red:ERED,white:"#fff"}[e.c||"ink"],fs=e.fs||1.9;const lines=String(e.s||"").split("\n");const bold=e.b!==false;const ff={sans:"Calibri,Carlito,Segoe UI,Arial,sans-serif",serif:"Georgia,'Times New Roman',serif",hand:"'Comic Sans MS','Segoe Print',cursive"}[e.font||"sans"];
      const w=Math.max(...lines.map(l=>l.length),1)*fs*(bold?.54:.5)+1.4,h=lines.length*fs*1.2+.8;const al=e.al||"c";const tx=al==="l"?e.x-w/2+.7:al==="r"?e.x+w/2-.7:e.x,an=al==="l"?"start":al==="r"?"end":"middle";
      const bgm=e.bg||"white";const bgc={white:["#fff",.92,"none"],none:["none",0,"none"],tint:[{ink:"#E8ECF3",green:"#DDF3E8",amber:"#FFF3D6",blue:"#DCE8FB",red:"#FCE0E4",white:"#fff"}[e.c||"ink"],1,"none"],box:["#fff",1,col]}[bgm];
      return `<rect x="${e.x-w/2}" y="${EY(e.y)-h/2}" width="${w}" height="${h}" rx=".7" fill="${bgc[0]}" fill-opacity="${bgc[1]}" stroke="${bgc[2]}" stroke-width=".18"/>`+lines.map((l,i)=>`<text x="${tx}" y="${EY(e.y)-h/2+.4+fs*1.0+i*fs*1.2}" text-anchor="${an}" font-size="${fs}" font-weight="${bold?700:400}" font-style="${e.i?"italic":"normal"}" fill="${col}" font-family="${ff}"${e.u?' text-decoration="underline"':""}>${esc(l)}</text>`).join("")}
  }return ""}
function edDefs(){const cols={ink:EINK,blue:EBLUE,red:ERED,green:EGREEN};return "<defs>"+Object.entries(cols).map(([k,c])=>`<marker id="ah-${k}" markerWidth="1.8" markerHeight="1.8" refX="4" refY="2.5" orient="auto" markerUnits="userSpaceOnUse" viewBox="0 0 5 5"><path d="M0 0L5 2.5L0 5z" fill="${c}"/></marker>`).join("")+"</defs>"}
function edSVGInner(withSel){let o=edDefs()+`<rect width="100" height="36" fill="#fff"/>`;
  if(ED.opt.tapis)o+=`<rect x="2" y="${EY(4)}" width="96" height="3.7" rx=".8" fill="#DDE5F0"/>`;
  if(ED.opt.mur)o+=`<rect x="6" y="${EY(33)}" width="88" height="29" rx="1.4" fill="#EEF2F8" stroke="#A8B4C6" stroke-width=".35"/>`;
  if(ED.opt.vue)o+=`<text x="98.5" y="1.5" text-anchor="end" font-size="1.12" font-weight="700" fill="${EGREY}" font-family="Calibri,Carlito,Arial,sans-serif" dominant-baseline="middle">${esc(ED.opt.vue)}</text>`;
  if(ED.opt.legende)o+=`<text x="50" y="${EY(1.9)}" text-anchor="middle" font-size="1.5" fill="${EINK}" font-family="Calibri,Carlito,Arial,sans-serif" dominant-baseline="middle">${esc(ED.opt.legende)}</text>`;
  const ord=["hold","tape","hoopfloor","hoopflat","ring","hoopside"];
  const ord2=["zone","zonecircle","mat","bench"];const order=e=>{const j=ord2.indexOf(e.t);if(j>=0)return -1;const i=ord.indexOf(e.t);return i>=0?i:["arrow","text","line","rope","cross","check","num"].includes(e.t)?20:10};
  ED.els.map((e,i)=>[e,i]).sort((a,b)=>order(a[0])-order(b[0])||a[1]-b[1]).forEach(([e])=>{o+=`<g data-id="${e.id}" style="cursor:move">${elSVG(e)}</g>`});
  return o}
function edHandles(e){const h=[];
  if(["climber","stand","sit"].includes(e.t)){figFix(e);h.push(...e.hands.map((p,i)=>({k:"h"+i,x:e.x+p[0]*e.s,y:e.y+p[1]*e.s})),...e.feet.map((p,i)=>({k:"f"+i,x:e.x+p[0]*e.s,y:e.y+p[1]*e.s})))}
  if(isLine(e)){h.push({k:"a1",x:e.x1,y:e.y1},{k:"a2",x:e.x2,y:e.y2})}
  return h}
function edRender(panel){const svg=$("#edsvg");if(!svg)return;svg.innerHTML=edSVGInner();
  const g=svg.querySelector(`[data-id="${ED.sel}"]`);
  if(g){const b=g.getBBox();const r=document.createElementNS("http://www.w3.org/2000/svg","rect");r.setAttribute("x",b.x-.6);r.setAttribute("y",b.y-.6);r.setAttribute("width",b.width+1.2);r.setAttribute("height",b.height+1.2);r.setAttribute("fill","none");r.setAttribute("stroke","#2F6FDB");r.setAttribute("stroke-width",".2");r.setAttribute("stroke-dasharray",".6 .4");r.setAttribute("pointer-events","none");svg.appendChild(r);
    const e=ED.els.find(x=>x.id===ED.sel);edHandles(e).forEach(h=>{const c=document.createElementNS("http://www.w3.org/2000/svg","circle");c.setAttribute("cx",h.x);c.setAttribute("cy",EY(h.y));c.setAttribute("r",1.25);c.setAttribute("fill",h.k[0]==="f"?"#FFF3D6":"#fff");c.setAttribute("stroke",h.k[0]==="f"?"#E0A030":"#2F6FDB");c.setAttribute("stroke-width",".35");c.setAttribute("data-h",h.k);c.style.cursor="crosshair";svg.appendChild(c)})}
  edSave();if(panel)edPanel()}
function edPanel(){const p=$("#edpanel");if(!p)return;const e=ED.els.find(x=>x.id===ED.sel);
  const sw=(list,cur,attr)=>list.map(([v,c,l])=>`<button class="swt ${cur===v?"on":""}" data-sw="${attr}:${v}" title="${l}" style="background:${c}"></button>`).join("");
  if(!e){p.innerHTML=`<h4>Réglages du schéma</h4><label class="fl"><input type="checkbox" id="oMur" ${ED.opt.mur?"checked":""}> Afficher le mur</label><label class="fl"><input type="checkbox" id="oTapis" ${ED.opt.tapis?"checked":""}> Afficher le tapis</label>
   <label class="fl2">Étiquette en haut à droite<select id="oVue"><option ${ED.opt.vue==="VUE DE FACE"?"selected":""}>VUE DE FACE</option><option ${ED.opt.vue==="VUE DE DESSUS"?"selected":""}>VUE DE DESSUS</option><option value="" ${!ED.opt.vue?"selected":""}>(aucune)</option></select></label>
   <label class="fl2">Légende sous le mur<input id="oLeg" value="${esc(ED.opt.legende)}" placeholder="Ex. : toucher un maximum de prises"></label>
   <p class="hint">Cliquez sur un élément du schéma pour le modifier. Glissez pour le déplacer.</p>`;
   $("#oMur").onchange=ev=>{edSnap();ED.opt.mur=ev.target.checked;edRender()};$("#oTapis").onchange=ev=>{edSnap();ED.opt.tapis=ev.target.checked;edRender()};
   $("#oVue").onchange=ev=>{edSnap();ED.opt.vue=ev.target.value;edRender()};$("#oLeg").oninput=ev=>{ED.opt.legende=ev.target.value;edRender()};return}
  const T={hold:"Prise",ring:"Anneau",climber:"Grimpeur",stand:"Personnage debout",sit:"Personnage assis",hoopflat:"Cerceau (face)",hoopfloor:"Cerceau (au sol)",hoopside:"Cerceau (profil)",scarf:"Foulard",ball:"Ballon",die:"Dé",watch:"Chronomètre",quickdraw:"Dégaine",tape:"Scotch",arrow:"Flèche",text:"Texte",rope:"Corde",line:"Ligne",zone:"Zone rectangulaire",zonecircle:"Zone ronde",cone:"Plot",bench:"Banc",mat:"Tapis",foot:"Empreinte de pied",handp:"Empreinte de main",cross:"Interdit",check:"Validé",star:"Étoile",num:"Numéro",flag:"Fanion",target:"Cible",card:"Carte",volume:"Volume"}[e.t];
  let h=`<h4>${T}</h4>`;
  if(e.t==="hold")h+=`<div class="sws">${sw(HOLDC.map((c,i)=>[c,c,HOLDN[i]]),e.c,"c")}</div><label class="fl2">Taille<input type="range" min="0.9" max="2.4" step="0.05" value="${e.r}" data-rg="r"></label>`;
  if(e.t==="ring")h+=`<div class="sws">${sw([["green",EGREEN,"Prise cible (vert)"],["amber",EAMB,"Prise imposée (ambre)"]],e.c,"c")}</div><label class="fl2">Taille<input type="range" min="1.5" max="4" step="0.1" value="${e.r}" data-rg="r"></label>`;
  if(["climber","stand","sit"].includes(e.t))h+=`<div class="sws">${sw([["blue",EBLUE,"Équipe bleue"],["red",ERED,"Équipe rouge"],["grey",EGREY,"Éducateur"],["green",EGREEN,"Vert"]],e.c,"c")}</div><label class="fl2">Taille<input type="range" min="0.5" max="1.8" step="0.05" value="${e.s}" data-rg="s"></label>`+`<label class="fl2">Inclinaison du corps<input type="range" min="-60" max="60" step="1" value="${e.lean||0}" data-rg="lean"></label><label class="fl"><input type="checkbox" id="edSnapCk" ${ED.snap!==false?"checked":""}> Aimanter aux prises</label><p class="hint">Glissez les points sur les mains et les pieds pour les placer : ils se collent à la prise la plus proche.</p>`;
  if(["hoopflat","hoopfloor","hoopside","ball","watch","quickdraw","scarf","die"].includes(e.t))h+=`<label class="fl2">Taille<input type="range" min="0.5" max="2.5" step="0.05" value="${e.s}" data-rg="s"></label>`;
  if(e.t==="scarf")h+=`<div class="sws">${sw([[EBLUE,EBLUE,"bleu"],[ERED,ERED,"rouge"],["#F7D858","#F7D858","jaune"],["#7FCB8F","#7FCB8F","vert"]],e.c,"c")}</div>`;
  if(e.t==="die")h+=`<label class="fl2">Valeur<select data-sel="n">${[1,2,3,4,5,6].map(n=>`<option ${e.n==n?"selected":""}>${n}</option>`).join("")}</select></label>`;
  if(e.t==="arrow")h+=`<div class="sws">${sw([["ink",EINK,"noir"],["blue",EBLUE,"bleu"],["red",ERED,"rouge"],["green",EGREEN,"vert"]],e.c||"ink","c")}</div><label class="fl"><input type="checkbox" data-ck="dash" ${e.dash?"checked":""}> Pointillés</label><label class="fl2">Courbure<input type="range" min="-0.6" max="0.6" step="0.05" value="${e.bend||0}" data-rg="bend"></label><p class="hint">Glissez les deux points pour régler le départ et l'arrivée.</p>`;
  if(e.t==="text")h+=`<label class="fl2">Texte<textarea data-tx rows="3">${esc(e.s)}</textarea></label><div class="sws">${sw([["ink",EINK,"noir"],["green",EGREEN,"vert"],["amber","#8A6D12","ambre"],["blue",EBLUE,"bleu"],["red",ERED,"rouge"]],e.c||"ink","c")}</div>
   <div class="rowb" style="margin-top:6px"><button class="chip ${e.b!==false?"on":""}" data-tg="b"><b>G</b></button><button class="chip ${e.i?"on":""}" data-tg="i"><i>I</i></button><button class="chip ${e.u?"on":""}" data-tg="u"><u>S</u></button><button class="chip ${(e.al||"c")==="l"?"on":""}" data-al="l">⇤</button><button class="chip ${(e.al||"c")==="c"?"on":""}" data-al="c">↔</button><button class="chip ${e.al==="r"?"on":""}" data-al="r">⇥</button></div>
   <label class="fl2">Police<select data-sel2="font"><option value="sans" ${(e.font||"sans")==="sans"?"selected":""}>Standard</option><option value="serif" ${e.font==="serif"?"selected":""}>Avec empattements</option><option value="hand" ${e.font==="hand"?"selected":""}>Manuscrite</option></select></label>
   <label class="fl2">Fond<select data-sel2="bg"><option value="white" ${(e.bg||"white")==="white"?"selected":""}>Blanc</option><option value="tint" ${e.bg==="tint"?"selected":""}>Teinté</option><option value="box" ${e.bg==="box"?"selected":""}>Encadré</option><option value="none" ${e.bg==="none"?"selected":""}>Sans fond</option></select></label>
   <label class="fl2">Taille<input type="range" min="1" max="5" step="0.1" value="${e.fs||1.9}" data-rg="fs"></label>`;
  const COL5=[["blue",EBLUE,"bleu"],["red",ERED,"rouge"],["green",EGREEN,"vert"],["amber",EAMB,"ambre"],["ink",EINK,"noir"],["grey",EGREY,"gris"]];
  if(["foot","handp","star","num","flag","zone","zonecircle","rope","line"].includes(e.t))h+=`<div class="sws">${sw(COL5,e.c||"x","c")}</div>`;
  if(e.t==="volume")h+=`<div class="sws">${sw(HOLDC.map((c,i)=>[c,c,HOLDN[i]]),e.c,"c")}</div>`;
  if(["cone","bench","mat","foot","handp","cross","check","star","num","flag","target","card","volume","zonecircle"].includes(e.t))h+=`<label class="fl2">Taille<input type="range" min="0.5" max="3" step="0.05" value="${e.s}" data-rg="s"></label>`;
  if(["foot","handp"].includes(e.t))h+=`<label class="fl2">Rotation<input type="range" min="-180" max="180" step="5" value="${e.rot||0}" data-rg="rot"></label>`;
  if(e.t==="zone")h+=`<label class="fl2">Largeur<input type="range" min="4" max="80" step="1" value="${e.w||20}" data-rg="w"></label><label class="fl2">Hauteur<input type="range" min="3" max="30" step="1" value="${e.h||10}" data-rg="h"></label>`;
  if(e.t==="num")h+=`<label class="fl2">Numéro<input type="number" min="0" max="99" value="${e.n||1}" data-num></label>`;
  if(isLine(e))h+=`<label class="fl2">Étiquette sur la ligne<input data-lab value="${esc(e.lab||"")}" placeholder="Ex. : 30 s, aller, retour"></label>`;
  if(["rope","line"].includes(e.t))h+=`<label class="fl"><input type="checkbox" data-ck="dash" ${e.dash?"checked":""}> Pointillés</label><label class="fl2">Courbure<input type="range" min="-0.6" max="0.6" step="0.05" value="${e.bend||0}" data-rg="bend"></label><p class="hint">Glissez les deux points pour régler les extrémités.</p>`;
  h+=`<div class="rowb"><button class="chip" data-op="dup">Dupliquer</button><button class="chip" data-op="front">Devant</button><button class="chip" data-op="back">Derrière</button><button class="chip" data-op="del" style="color:#B2263A">Supprimer</button></div>`;
  p.innerHTML=h;
  const sk=p.querySelector("#edSnapCk");if(sk)sk.onchange=ev=>{ED.snap=ev.target.checked};
  p.querySelectorAll("[data-rg]").forEach(i=>{i.onpointerdown=()=>edSnap();i.oninput=ev=>{e[i.dataset.rg]=+ev.target.value;edRender()}});
  p.querySelectorAll("[data-sw]").forEach(b=>b.onclick=()=>{const[k,v]=b.dataset.sw.split(":");edSnap();e[k]=v;edRender(true)});
  p.querySelectorAll("[data-sel]").forEach(s=>s.onchange=ev=>{edSnap();e[s.dataset.sel]=+ev.target.value;edRender()});
  p.querySelectorAll("[data-ck]").forEach(c=>c.onchange=ev=>{edSnap();e[c.dataset.ck]=ev.target.checked;edRender()});
  const lb=p.querySelector("[data-lab]");if(lb)lb.oninput=ev=>{e.lab=ev.target.value;edRender()};
  p.querySelectorAll("[data-tg]").forEach(b=>b.onclick=()=>{edSnap();const k=b.dataset.tg;e[k]=k==="b"?!(e.b!==false):!e[k];edRender(true)});
  p.querySelectorAll("[data-al]").forEach(b=>b.onclick=()=>{edSnap();e.al=b.dataset.al;edRender(true)});
  p.querySelectorAll("[data-sel2]").forEach(x=>x.onchange=ev=>{edSnap();e[x.dataset.sel2]=ev.target.value;edRender(true)});
  const nm=p.querySelector("[data-num]");if(nm)nm.oninput=ev=>{e.n=+ev.target.value;edRender()};
  const tx=p.querySelector("[data-tx]");if(tx)tx.oninput=ev=>{e.s=ev.target.value;edRender()};
  p.querySelectorAll("[data-op]").forEach(b=>b.onclick=()=>edOp(b.dataset.op))}
function edOp(op){const i=ED.els.findIndex(x=>x.id===ED.sel);if(i<0)return;edSnap();const e=ED.els[i];
  if(op==="del"){ED.els.splice(i,1);ED.sel=null}
  else if(op==="dup"){const c=JSON.parse(JSON.stringify(e));c.id=ED.next++;if(isLine(c)){c.x1+=2;c.x2+=2}else c.x+=2;ED.els.push(c);ED.sel=c.id}
  else if(op==="front"){ED.els.splice(i,1);ED.els.push(e)}else if(op==="back"){ED.els.splice(i,1);ED.els.unshift(e)}
  edRender(true)}
const EDP={
  hold:c=>({t:"hold",x:50,y:19,c,r:1.35}),
  ring:c=>({t:"ring",x:50,y:19,c,r:2.6}),
  climber:c=>({t:"climber",x:50,y:15,c,s:1,hip:0,hands:[[-7,8.5],[7.5,7]],feet:[[-5.4,-5],[5.4,-5]]}),
  stand:c=>figFix({t:"stand",x:50,y:5,c,s:1}),sit:c=>figFix({t:"sit",x:50,y:5,c,s:1}),
  hoopflat:()=>({t:"hoopflat",x:50,y:19,s:1}),hoopfloor:()=>({t:"hoopfloor",x:50,y:6,s:1}),hoopside:()=>({t:"hoopside",x:50,y:19,s:1}),
  scarf:c=>({t:"scarf",x:50,y:19,s:1.5,c}),ball:()=>({t:"ball",x:50,y:19,s:1.5}),die:()=>({t:"die",x:50,y:19,s:1,n:5}),watch:()=>({t:"watch",x:86,y:29,s:1}),quickdraw:()=>({t:"quickdraw",x:50,y:19,s:1.2}),tape:()=>({t:"tape",x:50,y:19}),
  rope:c=>({t:"rope",x1:30,y1:30,x2:30,y2:6,c,bend:.15}),line:(c,d)=>({t:"line",x1:35,y1:19,x2:65,y2:19,c,dash:!!d}),
  zone:c=>({t:"zone",x:50,y:19,w:24,h:10,c}),zonecircle:c=>({t:"zonecircle",x:50,y:19,s:1,c}),cone:()=>({t:"cone",x:50,y:5,s:1}),bench:()=>({t:"bench",x:50,y:5,s:1}),mat:()=>({t:"mat",x:50,y:4,s:1}),
  foot:c=>({t:"foot",x:50,y:19,s:1,c,rot:0}),handp:c=>({t:"handp",x:50,y:19,s:1,c,rot:0}),cross:()=>({t:"cross",x:50,y:19,s:1}),check:()=>({t:"check",x:50,y:19,s:1}),star:c=>({t:"star",x:50,y:19,s:1,c}),num:c=>({t:"num",x:50,y:19,s:1,c,n:1}),flag:c=>({t:"flag",x:50,y:19,s:1,c}),target:()=>({t:"target",x:50,y:19,s:1}),card:()=>({t:"card",x:50,y:19,s:1}),volume:c=>({t:"volume",x:50,y:19,s:1,c}),
  arrow:(c,d)=>({t:"arrow",x1:36,y1:19,x2:64,y2:19,c,dash:!!d,bend:0}),text:()=>({t:"text",x:50,y:28,s:"Mon texte",c:"ink",fs:1.9})};
function edPaletteHTML(){const sec=(t,b)=>`<div class="psec"><div class="ptitle">${t}</div><div class="pbtns">${b}</div></div>`;
  const pb=(k,a,label,extra="")=>`<button class="pbtn" data-pal="${k}:${a}" title="${label}">${extra||label}</button>`;
  const dot=c=>`<span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${c};border:2px solid ${darken(c)}"></span>`;
  return sec("PRISES",HOLDC.map((c,i)=>pb("hold",c,"Prise "+HOLDN[i],dot(c))).join("")+`<button class="pbtn wide" id="edSeed">Semer des prises au hasard</button>`)+
  sec("ANNEAUX",pb("ring","green","Prise cible",`<span class="ringi" style="border-color:${EGREEN}"></span> cible`)+pb("ring","amber","Prise imposée",`<span class="ringi" style="border-color:${EAMB}"></span> imposée`))+
  sec("PERSONNAGES",pb("climber","blue","Grimpeur bleu","🧗 bleu")+pb("climber","red","Grimpeur rouge","🧗 rouge")+pb("stand","blue","Debout bleu","🧍 bleu")+pb("stand","red","Debout rouge","🧍 rouge")+pb("sit","blue","Assis bleu","assis bleu")+pb("sit","red","Assis rouge","assis rouge"))+
  sec("OBJETS",pb("hoopflat","","Cerceau de face","cerceau face")+pb("hoopfloor","","Cerceau au sol","cerceau sol")+pb("hoopside","","Cerceau de profil","cerceau profil")+pb("scarf",EBLUE,"Foulard bleu","foulard bleu")+pb("scarf",ERED,"Foulard rouge","foulard rouge")+pb("scarf","#F7D858","Foulard jaune","foulard jaune")+pb("ball","","Ballon","ballon")+pb("die","","Dé","dé")+pb("watch","","Chronomètre","chrono")+pb("quickdraw","","Dégaine","dégaine")+pb("tape","","Scotch","scotch")+pb("cone","","Plot","plot")+pb("bench","","Banc","banc")+pb("mat","","Tapis","tapis")+pb("card","","Carte","carte")+pb("target","","Cible","cible")+pb("flag","red","Fanion","fanion")+pb("volume","#A894E6","Volume","volume"))+
  sec("CORDES ET LIGNES",pb("rope","amber","Corde ambre","corde")+pb("rope","blue","Corde bleue","corde bleue")+pb("rope","red","Corde rouge","corde rouge")+pb("line","ink:0","Ligne (départ, limite)","ligne")+pb("line","ink:1","Ligne pointillée","ligne pointillée"))+
  sec("ZONES ET REPÈRES",pb("zone","blue","Zone rectangulaire","zone")+pb("zone","red","Zone rouge","zone rouge")+pb("zonecircle","green","Zone ronde","zone ronde")+pb("foot","blue","Empreinte de pied","👣 pied")+pb("handp","blue","Empreinte de main","✋ main")+pb("num","blue","Numéro","n°")+pb("star","amber","Étoile","★ étoile")+pb("check","","Validé","✓")+pb("cross","","Interdit","✗"))+
  sec("FLÈCHES ET TEXTE",pb("arrow","ink:0","Flèche pleine","→ pleine")+pb("arrow","blue:1","Flèche bleue pointillée","→ bleue")+pb("arrow","red:1","Flèche rouge pointillée","→ rouge")+pb("arrow","green:1","Flèche verte pointillée","→ verte")+pb("text","","Zone de texte","Texte"))}
function editorHTML(){return `<h2 class="pt">Dessiner un schéma</h2><p class="lead">Construisez un schéma dans le style des fiches : placez les prises, les grimpeurs, les objets et les flèches, puis exportez l'image. Votre brouillon est enregistré dans ce navigateur.</p>
<div class="edwrap"><aside class="edpal" id="edpal">${edPaletteHTML()}</aside>
<section class="edmain"><div class="edtools"><button class="chip" id="edUndo">↶ Annuler</button><button class="chip" id="edRedo">↷ Rétablir</button><button class="chip" id="edExample">Exemple</button><button class="chip" id="edClear">Tout effacer</button><span class="grow" style="flex:1"></span><button class="chip" id="edSaveJson">Enregistrer le brouillon</button><label class="chip" style="cursor:pointer">Ouvrir un brouillon<input type="file" id="edOpen" accept=".json" hidden></label><button class="btn" id="edPng" style="background:#26364D;color:#fff;border:0;border-radius:8px;padding:8px 16px;font-weight:700;cursor:pointer">Exporter en PNG</button><button class="chip" id="edSvg">SVG</button></div>
<div class="box" style="margin:0 0 10px;display:flex;gap:10px;flex-wrap:wrap;align-items:center"><b>Envoyer dans le Drive</b><input id="edName" placeholder="Nom du fichier (ex. D5-chrono-prises)" style="flex:1;min-width:180px;padding:7px;border:1px solid #D5DAE5;border-radius:6px;font:inherit"><button class="chip" id="edUp" style="background:#26364D;color:#fff;border-color:#26364D">Envoyer</button><div id="edUpMsg" style="flex-basis:100%;font-size:14px"></div></div>
<div class="edcan"><svg id="edsvg" viewBox="0 0 100 36" xmlns="http://www.w3.org/2000/svg"></svg></div>
<div class="box" style="margin-top:12px;font-size:14.5px"><b>Pour l'ajouter à une fiche :</b> cliquez sur « Envoyer dans le Drive », copiez le lien obtenu et collez-le dans le champ <i>Schéma (lien)</i> du formulaire (ou exportez le PNG et déposez-le vous-même dans le Drive).</div></section>
<aside class="edpanel" id="edpanel"></aside></div>`}
const EDCSS=`.edwrap{display:grid;grid-template-columns:210px 1fr 230px;gap:14px;align-items:start}
.edpal,.edpanel{background:#fff;border-radius:12px;padding:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);max-height:80vh;overflow:auto;position:sticky;top:12px}
.psec{margin-bottom:12px}.ptitle{font-size:11px;font-weight:700;letter-spacing:1.5px;color:#7a8497;margin-bottom:6px}.pbtns{display:flex;flex-wrap:wrap;gap:5px}
.pbtn{border:1px solid #D5DAE5;background:#fff;border-radius:8px;padding:5px 9px;font:inherit;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:5px}.pbtn:hover{border-color:#26364D;background:#F5F7FB}.pbtn.wide{width:100%;justify-content:center;background:#EEF1F8;font-weight:700}
.ringi{display:inline-block;width:14px;height:14px;border-radius:50%;border:3px solid}
.edtools{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;align-items:center}
.edcan{background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);padding:8px}.edcan svg{width:100%;display:block;touch-action:none;user-select:none;border:1px dashed #D5DAE5;border-radius:8px}
.edpanel h4{margin:0 0 8px;color:#26364D}.fl{display:flex;gap:7px;align-items:center;margin:6px 0;font-size:14px}.fl2{display:block;margin:8px 0;font-size:13px;color:#6B7280}.fl2 input,.fl2 select,.fl2 textarea{display:block;width:100%;margin-top:3px;padding:6px;border:1px solid #D5DAE5;border-radius:6px;font:inherit;color:#2B2F36}.fl2 input[type=range]{padding:0}
.sws{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.swt{width:26px;height:26px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px #aab;cursor:pointer}.swt.on{box-shadow:0 0 0 3px #26364D}
.rowb{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}.hint{font-size:13px;color:#6B7280;line-height:1.4}
@media(max-width:1000px){.edwrap{grid-template-columns:1fr}.edpal,.edpanel{position:static;max-height:none}.edpal{order:2}.edmain{order:1}.edpanel{order:3}}`;
function edInit(){edLoad();edRender(true);const svg=$("#edsvg");
  const pt=ev=>{const m=svg.getScreenCTM().inverse();const p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;const q=p.matrixTransform(m);return [q.x,36-q.y]};
  svg.addEventListener("pointerdown",ev=>{const hd=ev.target.closest("[data-h]");const g=ev.target.closest("[data-id]");
    if(hd){const e=ED.els.find(x=>x.id===ED.sel);edSnap();ED.drag={k:"handle",h:hd.dataset.h,e};svg.setPointerCapture(ev.pointerId);return}
    if(g){ED.sel=+g.dataset.id;const e=ED.els.find(x=>x.id===ED.sel);edSnap();ED.drag={k:"move",e,p0:pt(ev),o:JSON.parse(JSON.stringify(e)),moved:false};svg.setPointerCapture(ev.pointerId);edRender(true)}
    else{ED.sel=null;edRender(true)}});
  svg.addEventListener("pointermove",ev=>{const d=ED.drag;if(!d)return;const p=pt(ev);
    if(d.k==="move"){const dx=p[0]-d.p0[0],dy=p[1]-d.p0[1];d.moved=true;const e=d.e;if(isLine(e)){e.x1=d.o.x1+dx;e.x2=d.o.x2+dx;e.y1=d.o.y1+dy;e.y2=d.o.y2+dy}else{e.x=+(d.o.x+dx).toFixed(2);e.y=+(d.o.y+dy).toFixed(2)}}
    else{const e=d.e,h=d.h;if(h[0]==="a"){if(h==="a1"){e.x1=p[0];e.y1=p[1]}else{e.x2=p[0];e.y2=p[1]}}else{let q=p;if(ED.snap!==false){let best=null,bd=3.2;ED.els.forEach(o=>{if(["hold","volume","ring","foot","handp"].includes(o.t)){const dd=Math.hypot(o.x-p[0],o.y-p[1]);if(dd<bd){bd=dd;best=[o.x,o.y]}}});if(best)q=best}const i=+h[1],arr=h[0]==="h"?e.hands:e.feet;arr[i]=[+((q[0]-e.x)/e.s).toFixed(2),+((q[1]-e.y)/e.s).toFixed(2)]}}
    edRender(false)});
  const end=()=>{if(ED.drag){const d=ED.drag;ED.drag=null;
if(d.k==="move"&&!d.moved)ED.hist.pop();edRender(true)}};
  svg.addEventListener("pointerup",end);svg.addEventListener("pointercancel",end);
  $("#edpal").addEventListener("click",ev=>{const b=ev.target.closest("[data-pal]");if(b){const[k,a]=b.dataset.pal.split(":");let el;const pr=b.dataset.pal.split(":");if(k==="arrow"||k==="line")el=EDP[k](pr[1],pr[2]==="1");else el=EDP[k](a);
      el.x!==undefined&&(el.x+=Math.round((Math.random()-.5)*10),el.y+=Math.round((Math.random()-.5)*4));edAdd(el);return}
    if(ev.target.id==="edSeed")edSeed()});
  $("#edUndo").onclick=edUndo;$("#edRedo").onclick=edRedo;
  $("#edClear").onclick=()=>{if(confirm("Tout effacer ?")){edSnap();ED.els=[];ED.sel=null;edRender(true)}};
  $("#edExample").onclick=()=>{edSnap();ED.opt={face:true,mur:true,tapis:true,legende:"toucher un maximum de prises avec les mains",vue:"VUE DE FACE"};ED.els=[];ED.next=1;edSeedRaw(34);[{t:"climber",x:50,y:14,c:"blue",s:1,hands:[[-6,9],[6.5,8]],feet:[[-5.6,-4.7],[5.6,-4.7]]},{t:"ring",x:44.4,y:9.3,c:"amber",r:2.5},{t:"ring",x:55.6,y:9.3,c:"amber",r:2.5},{t:"text",x:20,y:27,s:"2 prises de pieds\nimposées",c:"amber",fs:1.9}].forEach(e=>{e.id=ED.next++;ED.els.push(e)});ED.sel=null;edRender(true)};
  $("#edPng").onclick=()=>edExport("png");$("#edUp").onclick=edUpload;$("#edSvg").onclick=()=>edExport("svg");
  $("#edSaveJson").onclick=()=>{const b=new Blob([JSON.stringify({els:ED.els,opt:ED.opt})],{type:"application/json"});edDl(b,"schema-brouillon.json")};
  $("#edOpen").onchange=ev=>{const f=ev.target.files[0];if(!f)return;f.text().then(t=>{try{const s=JSON.parse(t);edSnap();ED.els=s.els||[];ED.opt=Object.assign(ED.opt,s.opt||{});ED.next=Math.max(1,...ED.els.map(e=>e.id+1));ED.sel=null;edRender(true)}catch(e){alert("Fichier illisible.")}})};
  document.addEventListener("keydown",edKey)}
function edKey(ev){if(VIEW!=="editeur")return;const tag=(ev.target.tagName||"").toLowerCase();if(["input","textarea","select"].includes(tag))return;
  if((ev.ctrlKey||ev.metaKey)&&ev.key==="z"){ev.preventDefault();ev.shiftKey?edRedo():edUndo();return}
  if(ev.key==="Delete"||ev.key==="Backspace"){if(ED.sel){ev.preventDefault();edOp("del")}return}
  const e=ED.els.find(x=>x.id===ED.sel);if(!e)return;const st=ev.shiftKey?1:.25,m={ArrowLeft:[-st,0],ArrowRight:[st,0],ArrowUp:[0,st],ArrowDown:[0,-st]}[ev.key];
  if(m){ev.preventDefault();if(isLine(e)){e.x1+=m[0];e.x2+=m[0];e.y1+=m[1];e.y2+=m[1]}else{e.x+=m[0];e.y+=m[1]}edRender(false)}}
function edSeedRaw(n){const rect=[8.5,6,91.5,31.5],pts=[];const avoid=ED.els.filter(e=>["climber","stand","sit","ring","hoopflat","hoopfloor","hoopside","watch","text","die","ball","quickdraw"].includes(e.t)).map(e=>e.t==="climber"?{x:e.x,y:e.y,r:12}:{x:e.x||50,y:e.y||19,r:(e.t==="text"?9:5)});
  let tries=0;while(pts.length<n&&tries<4000){tries++;const x=rect[0]+Math.random()*(rect[2]-rect[0]),y=rect[1]+Math.random()*(rect[3]-rect[1]);
    if(pts.some(p=>Math.hypot(p[0]-x,p[1]-y)<6.4)||avoid.some(a=>Math.hypot(a.x-x,a.y-y)<a.r))continue;pts.push([x,y])}
  let last="";pts.forEach(([x,y])=>{let c;do{c=HOLDC[Math.floor(Math.random()*HOLDC.length)]}while(c===last);last=c;ED.els.unshift({id:ED.next++,t:"hold",x:+x.toFixed(2),y:+y.toFixed(2),c,r:+(1.35*(.95+Math.random()*.25)).toFixed(2)})})}
function edSeed(){edSnap();edSeedRaw(36);edRender(true)}
function edDl(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function edSvgText(){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 36" width="1600" height="576">${edSVGInner().replace(/ style="cursor:move"/g,"")}</svg>`}
function edPngBlob(cb,err){const img=new Image();img.onload=()=>{const c=document.createElement("canvas");c.width=3200;c.height=1152;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,3200,1152);c.toBlob(cb,"image/png")};img.onerror=err;img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(edSvgText())}
function edExport(kind){if(kind==="svg"){edDl(new Blob([edSvgText()],{type:"image/svg+xml"}),"schema.svg");return}
  edPngBlob(b=>edDl(b,"schema.png"),()=>alert("Export impossible dans ce navigateur : utilisez le bouton SVG."))}
function edUpload(){const msg=$("#edUpMsg"),url=CONFIG.SCHEMA_UPLOAD_URL;
  if(!url){msg.innerHTML="L'envoi dans le Drive n'est pas encore configuré (voir le guide : <i>SCHEMA_UPLOAD_URL</i> dans config.js). En attendant, exportez le PNG et déposez-le à la main dans le Drive.";return}
  const name=($("#edName").value||"schema").trim().replace(/[^\w\- àâäçéèêëîïôöùûüÀÉÈ]/g,"")||"schema";msg.textContent="Envoi en cours…";
  edPngBlob(blob=>{const fr=new FileReader();fr.onload=()=>{const data=String(fr.result).split(",")[1];
    fetch(url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({name:name+".png",data,key:CONFIG.SCHEMA_UPLOAD_KEY||""})}).then(r=>r.json()).then(j=>{
      if(!j.ok)throw new Error(j.error||"refusé");msg.innerHTML=`✓ Envoyé. Lien à coller dans « Schéma (lien) » : <input readonly id="edLink" value="${esc(j.url)}" style="width:100%;margin-top:6px;padding:6px;border:1px solid #D5DAE5;border-radius:6px"> <button class="chip" id="edCopyLk" style="margin-top:6px">Copier le lien</button>`;
      $("#edCopyLk").onclick=()=>{const i=$("#edLink");i.select();try{navigator.clipboard.writeText(i.value)}catch(e){document.execCommand("copy")}$("#edCopyLk").textContent="Copié !"}}).catch(e=>{msg.textContent="Échec de l'envoi ("+e.message+"). Exportez le PNG et déposez-le à la main dans le Drive."})};fr.readAsDataURL(blob)},()=>{msg.textContent="Image impossible à générer."})}

registerNav({sec:"MES SÉANCES",secOrder:30,order:2,html:()=>navBtn("editeur","Dessiner un schéma",'<span class="ic">✏</span>')});
registerView({match:v=>v==="editeur",html:()=>editorHTML(),bind:()=>{try{edInit()}catch(err){try{localStorage.removeItem("edSchema")}catch(e){}ED.els=[];edInit()}}});
