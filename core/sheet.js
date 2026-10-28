/* Chargement de la feuille Google publiée (CSV) */
async function loadSheet(){
  if(!CONFIG.SHEET_CSV_URL)return;
  try{const r=await fetch(CONFIG.SHEET_CSV_URL,{cache:"no-store"});if(!r.ok)throw 0;
    const rows=parseCSV(await r.text()).filter(pubOK).filter(g=>g.Titre);if(rows.length)DATA=rows;
  }catch(e){const w=$("#warn");if(w){w.style.display="block";w.textContent="La feuille Google n'a pas pu être chargée : affichage de la dernière version enregistrée dans le site."}}
}
registerLoader(loadSheet);
