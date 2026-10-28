/* Anciennes données « Ma séance » (migration) et informations générales de la séance */
let SEL=[];try{SEL=JSON.parse(localStorage.getItem("maSeance")||"[]")}catch(e){SEL=[]}
const saveSel=()=>{try{localStorage.setItem("maSeance",JSON.stringify(SEL))}catch(e){}};
let SMETA={titre:"",public:""};try{SMETA=Object.assign(SMETA,JSON.parse(localStorage.getItem("maSeanceMeta")||"{}"))}catch(e){}
const saveMeta=()=>{try{localStorage.setItem("maSeanceMeta",JSON.stringify(SMETA))}catch(e){}};
