# Jeux d'escalade — site pour éducateurs

> **Documentation complète : `docs/maintenance.md`** (aussi dans le site : Administration > Documentation). À mettre à jour à chaque changement.

Site statique (aucun outil de compilation) hébergé sur GitHub Pages. Il fonctionne aussi en ouvrant `index.html` directement dans un navigateur.

## Organisation

```
index.html            page unique : liste les fichiers CSS et JS à charger (dans l'ordre)
config.js             VOS adresses (feuille Google, formulaires, Drive…) — à modifier, jamais écrasé par une mise à jour
README.md             ce fichier

core/                 le « moteur », commun à toutes les fonctionnalités
  defaults.js           réglages par défaut, familles de jeux, objectifs
  state.js              état global (jeux chargés, page courante…)
  utils.js, games.js    petites fonctions utilitaires
  registry.js           registre : registerView / registerNav / registerClick / registerLoader
  nav.js, router.js, render.js   menu de gauche, navigation par adresse (#/page), affichage
  sheet.js              chargement de la feuille Google publiée
  main.js               démarrage

features/             UNE FONCTIONNALITÉ = UN DOSSIER
  home/                 page d'accueil
  jeux/                 catalogue (list.js) et fenêtre de détail d'un jeu (fiche.js) + leurs CSS
  retours/              retours de terrain
  guides/               guides (sécurité, matériel, glossaire…)
  biblio/               bibliothèque de séances (dossier Drive)
  mes-seances/          page « Séances & cycles »
  seance/               « Ma séance » : modele.js (données et calculs), fiche.js (aperçu),
                        formulaire.js (saisie), actions.js (boutons), export-word.js
  editeur/              éditeur de schémas : etat, formes (dessin des pièces), rendu, panneau,
                        palette, interactions (souris/clavier), export

data/                 contenus (jeux.js, annexes.js) — générés depuis la base de données
cartes/, schemas/     images des fiches (nommées par code de jeu : E4.jpg, E4.webp)
scripts-google/       scripts Apps Script à coller dans Google (formulaires, envoi de schémas…)
```

## Ajouter une fonctionnalité

1. Créer `features/ma-fonction/ma-fonction.js` (et `.css` si besoin).
2. Y déclarer ce qu'elle apporte :

```js
registerNav({sec:"MES SÉANCES", secOrder:30, order:9, html:()=>navBtn("ma-page","Ma page",'<span class="ic">★</span>')});
registerView({match:v=>v==="ma-page", html:()=>"<h2 class='pt'>Ma page</h2>", bind:()=>{/* après affichage */}});
registerClick(e=>{const b=e.target.closest("[data-mon-bouton]");if(b){/* … */return true}});
registerLoader(async()=>{/* chargement de données au démarrage */});
```

3. Ajouter deux lignes dans `index.html` : un `<link>` pour le CSS et un `<script>` pour le JS (avant `core/main.js`).

`secOrder` fixe l'ordre des sections du menu (0 accueil, 10 jeux, 20 parcourir, 30 mes séances, 40 guides) ; `order` l'ordre dans la section.

## Mettre à jour le site

Les fichiers sont mis en cache par le navigateur. À chaque modification, **changez le numéro `?v=16`** dans `index.html` (rechercher/remplacer) pour que tout le monde recharge les fichiers.

## Tester en local

Double-clic sur `index.html`, ou `python3 -m http.server` dans ce dossier puis http://localhost:8000.

## Mise en forme du code

Le code est formaté avec Prettier (réglages dans `.prettierrc`). Pour reformater après une modification :

```
npx prettier --write "core/**/*.js" "features/**/*.js" "features/**/*.css" "css/*.css"
```


## Séances enregistrées (base de données)
- `features/biblio/seances.js` : enregistrement (`enregistrerSeance`), liste, page détail (`#/sb/<id>`), « utiliser comme modèle ».
- `features/biblio/seances.css` : style (message, lignes cliquables).
- Côté Google : `scripts-google/ajouter_jeu.gs` (action `seance`) crée l'onglet « Séances ». Publier cet onglet en CSV et mettre l'adresse dans `config.js` : `SEANCES_CSV_URL`.
- Attention : un onglet publié sur le web est lisible par toute personne qui a l'adresse.
- Prettier : ajouter les nouveaux fichiers au même glob (déjà couverts par `features/**`).

## Administration et serveur Google
- `scripts-google/serveur_site.gs` remplace `ajouter_jeu.gs` et `recevoir_schemas.gs` : un seul script pour les jeux proposés, les séances (enregistrer / supprimer), les schémas (envoyés dans `schemas/` du dépôt GitHub) et l'administration.
- `features/admin/admin.js` : page « Jeux en attente » (mot de passe administrateur, jamais dans config.js).
- Le site utilise `GAME_ADD_URL` / `GAME_ADD_KEY` pour tout (`SCHEMA_UPLOAD_*` restent possibles pour l'ancien script).
