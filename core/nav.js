/* Menu de gauche, construit à partir des entrées déclarées par les fonctionnalités */
function navBtn(v,label,extra=""){return `<button class="nav ${VIEW===v?"on":""}" data-go="${esc(v)}">${extra}${label}</button>`}
function buildNav(){
  const items=NAVITEMS.slice().sort((a,b)=>(a.secOrder-b.secOrder)||((a.order||0)-(b.order||0)));let h="",last=null;
  items.forEach(it=>{if(it.sec&&it.sec!==last)h+=`<div class="sec">${it.sec}</div>`;last=it.sec;h+=it.html()});
  $("#navbox").innerHTML=h}
