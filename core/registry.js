/* Registre : chaque fonctionnalité déclare ici ses pages, son menu et ses clics */
const VIEWS = [],
  NAVITEMS = [],
  CLICKS = [],
  LOADERS = [];
/* registerView({match:v=>bool, html:v=>string, bind:v=>void}) : une page */
const registerView = d => VIEWS.push(d);
/* registerNav({sec:"TITRE DE SECTION", secOrder:30, order:1, html:()=>string}) : une entrée du menu de gauche */
const registerNav = d => NAVITEMS.push(d);
/* registerClick(e=>true si le clic est traité) */
const registerClick = fn => CLICKS.push(fn);
/* registerLoader(async ()=>void) : chargement de données au démarrage */
const registerLoader = fn => LOADERS.push(fn);
