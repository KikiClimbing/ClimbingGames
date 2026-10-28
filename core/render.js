/* Affichage de la page courante via le registre */
const errBox=(m)=>`<div class="box" style="border:2px solid #E0485A"><b>Erreur dans cette page :</b> ${esc(m)}</div>`;
function render(){const v=VIEW;const d=VIEWS.find(x=>x.match(v))||VIEWS.find(x=>x.fallback);let h="";
  try{h=d?d.html(v):""}catch(err){h=errBox(err.message)}
  $("#main").innerHTML=h;
  try{if(d&&d.bind)d.bind(v)}catch(err){$("#main").insertAdjacentHTML("afterbegin",errBox(err.message))}}
