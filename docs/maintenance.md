# Documentation technique et maintenance

Ce document décrit **tout** ce qu'il faut savoir pour maintenir le site seul : architecture, emplacement des données, échanges entre GitHub et Google, procédures et dépannage.
Il est dans le dépôt (`docs/maintenance.md`) et s'affiche dans le site (Administration > Documentation). **Mettez-le à jour à chaque changement** (voir « Journal des changements » en bas).

## 1. Vue d'ensemble

Le site est **statique** : aucun serveur à lui, aucune compilation. Ce sont des fichiers HTML/CSS/JS servis par **GitHub Pages**. Tout ce qui est « dynamique » passe par Google :

- **lecture** : le navigateur télécharge des feuilles Google **publiées en CSV** (public, sans mot de passe) ;
- **écriture** : le navigateur envoie un `POST` à un **script Apps Script** (une « application web » Google), qui écrit dans le Google Sheet ou dans le dépôt GitHub.

```
                         ┌──────────────────────┐
   navigateur  ──GET──▶  │ GitHub Pages (dépôt) │  index.html, JS, CSS, images
   (le site)             └──────────────────────┘
       │ GET (CSV publié)             ▲ commit (API GitHub, jeton)
       ▼                              │
 ┌───────────────┐   POST    ┌────────────────────┐
 │ Google Sheet  │ ◀──────── │ Apps Script        │ ◀── navigateur
 │ (jeux,séances,│  écrit    │ serveur_site.gs    │     (POST text/plain)
 │  retours)     │           └────────────────────┘
 └───────────────┘
       ▲
       │ réponses
 Formulaires Google (« Proposer un jeu », « Retour terrain »)
```

Points clés :

- Aucune base de données classique : **le Google Sheet est la base**, le dépôt GitHub contient le code, les images et un jeu de données de secours.
- Le site marche même si Google est indisponible (données de secours intégrées), mais les écritures échouent.
- Rien n'est stocké côté site sur les personnes : les brouillons (séance en cours, logo…) restent dans le navigateur (`localStorage`).

## 2. Où sont les données

| Donnée | Emplacement | Qui écrit | Qui lit |
|---|---|---|---|
| Code, HTML, CSS | dépôt GitHub (dossiers `core/`, `features/`, `css/`) | vous (Commit & Push) | navigateur |
| 36 jeux d'origine (secours) | `data/jeux.js` (constante `EMBED`) | généré une fois, ne pas éditer | site, si la feuille est inaccessible |
| Textes annexes (familles, objectifs, guides…) | `data/annexes.js` (constante `AX`) | vous | site |
| Vignettes des 36 jeux | `cartes/CODE.jpg` | vous | liste des jeux |
| Schémas des 36 jeux | `schemas/CODE.webp` | vous | fiche d'un jeu |
| Nouveaux schémas | `schemas/NOM.png` (+ `schemas/CODE.json`, dessin source, pour ceux faits depuis Administration) dans le dépôt | script Apps Script (API GitHub) | fiche d'un jeu (via « Schéma (lien) ») |
| **Tous les jeux** (nouveaux compris) | Google Sheet, onglet des fiches (colonnes `Titre` + `Principe`) | formulaire, « Ma séance », page Administration | site (CSV publié) |
| Séances créées avec l'outil | Google Sheet, onglet `Séances` | script (action `seance`) | site (CSV publié) + copie dans le navigateur |
| Retours de terrain | Google Sheet, onglet des retours | formulaire « Retour terrain » | site (CSV publié) |
| Séances en Word / PDF / Docs | dossier Google Drive (`LIBRARY_URL`) | éducateurs | iframe Drive |
| Séance en cours, logo, préférences | `localStorage` du navigateur | le site | le site |

Règle importante : **quand la feuille répond, elle remplace les données intégrées.** Pour corriger un jeu, modifiez sa ligne dans la feuille (ou la page Administration), pas `data/jeux.js`.

## 3. Le Google Sheet

Un seul classeur, plusieurs onglets (les noms libres sauf `Séances`) :

### 3.1 Onglet des fiches de jeux
Reconnu par le script grâce à la présence des colonnes `Titre` et `Principe`. Colonnes utilisées par le site (le nom doit être exact) :

`Horodateur` · `Code` · `Titre` · `Famille` · `Résumé` · `Principe` · `Participants` · `Effectif court` · `Espace` · `Matériel` · `Durée` · `Intensité` · `Objectif` · `Objectifs (tags)` · `Plus facile` · `Plus difficile` · `Conseil` · `Compléments` · `Voir aussi` · `Auteur` · `Schéma (lien)` · `Format anniversaire` · `Publié`

- `Publié` : la ligne n'apparaît sur le site que si la valeur est `OUI` (aussi acceptés : yes, true, 1, x, ✓). `REFUSÉ` est écrit par la page Administration pour écarter un jeu.
- `Code` : lettre(s) de la famille + numéro (E = Exploration, C = Coopération, D = Défis, G = Animation). Le tri du catalogue est lettre puis numéro.
- `Schéma (lien)` : URL d'une image. Un lien Google Drive est converti en miniature ; une URL du site (`https://…/schemas/xx.png`) est utilisée telle quelle.
- `Plus facile`, `Plus difficile` : une idée par ligne ; la puce « • » est ajoutée automatiquement à l'affichage et à l'enregistrement.
- Ajouter une colonne n'est utile que si le code la lit (voir `features/jeux/fiche.js`) : les colonnes inconnues sont ignorées, mais la page Administration les propose toutes à l'édition.

### 3.2 Onglet `Séances`
Créé automatiquement par le script à la première séance enregistrée.

`id` · `Horodateur` (ISO) · `Titre` · `Thème` · `Éducateurs` · `Dates` · `Exercices` (nombre) · `Données` (JSON complet de la séance, 49 000 caractères max) · `Publié` (`OUI`)

La liste du site lit surtout `Données` (titre, auteur, date, thème, objectif sont relus dans le JSON).

### 3.3 Onglet des retours
Alimenté par le formulaire « Retour terrain » (colonnes `Code du jeu`, `Note` ou `Ça a marché ?`, `Ce qui a bien marché`, `À changer`, `Auteur`, `Public`…). Une colonne `Publié` = `OUI` est ajoutée à la main pour afficher un retour.

### 3.4 Publication CSV
Fichier > Partager > **Publier sur le Web** > choisir **l'onglet** (pas « Document entier ») > format **CSV** > Publier. L'adresse obtenue va dans `config.js`. Il faut une adresse **par onglet** (fiches, séances, retours). Google met à jour le CSV publié avec un délai de quelques minutes.

**Confidentialité** : un onglet publié est lisible par toute personne qui connaît l'adresse, et `config.js` est dans un dépôt public. Tout ce qui est dans ces onglets (y compris les jeux non publiés et les séances) est donc techniquement lisible. Ne mettez rien de confidentiel dans ces feuilles.

## 4. Configuration : `config.js`

Fichier à la racine, **le vôtre** : il n'est jamais écrasé par une mise à jour (il n'est pas dans les zips livrés). Il définit `window.SITE_CONFIG`, fusionné avec les valeurs par défaut de `core/defaults.js` (objet `CONFIG`).

| Clé | Rôle |
|---|---|
| `SHEET_CSV_URL` | CSV publié de l'onglet des fiches |
| `SEANCES_CSV_URL` | CSV publié de l'onglet `Séances` |
| `RETOURS_CSV_URL` | CSV publié de l'onglet des retours |
| `FORM_URL` | lien du formulaire « Proposer un jeu » |
| `RETOUR_FORM_URL` | lien du formulaire « Retour terrain » |
| `TEMPLATE_SEANCE_URL`, `TEMPLATE_CYCLE_URL` | modèles Google Docs (page « Séances & cycles ») |
| `LIBRARY_URL` | dossier Drive de la bibliothèque (onglet « Dossier Google Drive ») |
| `GAME_ADD_URL` | adresse `/exec` de l'application web Apps Script (**une seule pour tout**) |
| `GAME_ADD_KEY` | mot de passe « du site » : doit être identique à `CLE_SITE` dans le script. Visible publiquement : ce n'est pas un secret, seulement un filtre anti-spam |
| `SCHEMA_UPLOAD_URL`, `SCHEMA_UPLOAD_KEY` | obsolètes : à laisser vides (si renseignés, l'envoi des schémas utilise l'ancien script) |

Ne mettez **jamais** dans `config.js` : le mot de passe administrateur, le jeton GitHub.

## 5. Le script Apps Script : `scripts-google/serveur_site.gs`

Un seul projet Apps Script, lié au Google Sheet (Extensions > Apps Script). Il est déployé en **application web** : Exécuter en tant que **Moi**, accès **Tout le monde**. Son adresse `/exec` est `GAME_ADD_URL`.

### 5.1 Constantes à renseigner (en haut du fichier)
`CLE_SITE`, `MOT_DE_PASSE_ADMIN`, `GITHUB_JETON`, `GITHUB_DEPOT` (« compte/depot »), `GITHUB_BRANCHE`, `URL_DU_SITE` (avec `/` final), `NOM_FEUILLE` (vide en général).
Ce fichier est **privé** : ne le copiez pas dans le dépôt avec vos vraies valeurs.

### 5.2 Protocole
Le site envoie `POST` avec `Content-Type: text/plain;charset=utf-8` (pour éviter la requête CORS préliminaire que Apps Script ne gère pas) et un corps JSON. Réponse : `{"ok":true,…}` ou `{"ok":false,"error":"…"}`.

| `action` | Mot de passe | Corps | Effet |
|---|---|---|---|
| `jeu` (ou absente) | `key` = `CLE_SITE` | `jeu:{Titre,Principe,…}` | ajoute une ligne **non publiée** dans l'onglet des fiches (puces ajoutées à `Plus facile/Plus difficile`) |
| `seance` | `key` | `seance:{id,titre,theme,educ,dates,nb,data}` | crée ou met à jour la ligne de l'onglet `Séances` (clé = `id`) |
| `seance_suppr` | `key` | `id` | supprime la ligne |
| `schema` | `key` | `name`, `data` (PNG en base64) | écrit `schemas/NOM.png` dans le dépôt via l'API GitHub (`PUT /contents`), renvoie `url` |
| `admin_liste` | `admin` = `MOT_DE_PASSE_ADMIN` | `tous` (booléen) | renvoie `colonnes` et `jeux:[{ligne,valeurs,publie}]` (en attente, ou tous) |
| `admin_enregistrer` | `admin` | `ligne`, `titreAvant`, `valeurs`, `publier`, `retirer` | écrit les champs ; `publier` met `Publié`=`OUI`, `retirer` le vide |
| `admin_refuser` | `admin` | `ligne`, `titreAvant` | met `Publié`=`REFUSÉ` |
| `schemas_liste` | `key` | — | même résultat que `admin_schemas`, pour le sélecteur du formulaire « Proposer un jeu » (sans mot de passe administrateur) |
| `admin_schemas` | `admin` | — | liste les images du dossier `schemas/` du dépôt (API GitHub) : `schemas:[{nom,url}]` |
| `admin_schema` | `admin` | `ligne`, `titreAvant`, `code`, `data` (PNG base64), `source` (JSON du dessin) | écrit `schemas/CODE.png` et `schemas/CODE.json` dans le dépôt, met à jour `Schéma (lien)` (URL avec `?v=` anti-cache), renvoie `url` |

`titreAvant` protège contre les modifications concurrentes : si le titre de la ligne a changé depuis le chargement, l'écriture est refusée (« rechargez la liste »).

### 5.3 Déployer une modification
1. Coller le code, **Enregistrer**.
2. Exécuter `testerConnexions` (menu des fonctions) : accepte les autorisations et affiche dans le journal l'état de la feuille, du jeton GitHub et des mots de passe.
3. Déployer > Gérer les déploiements > ✎ > **Nouvelle version** > Déployer. L'adresse `/exec` ne change pas. Sans cette étape, le site utilise l'ancienne version.

### 5.4 Jeton GitHub
GitHub > Settings > Developer settings > Personal access tokens. Soit « Fine-grained » (dépôt choisi, permission *Contents : Read and write*), soit « classic » avec la case `repo`. Il expire : quand les envois de schémas échouent avec « GitHub a refusé (401) », créez un nouveau jeton et remplacez `GITHUB_JETON`.

### 5.5 Autres scripts (`scripts-google/`)
- `creer_formulaire.gs` : crée le formulaire « Proposer un jeu » et le relie au Sheet (à exécuter une fois).
- `creer_formulaire_retour.gs` : idem pour « Retour terrain ».
- `recevoir_schemas.gs` : **ancien** (envoi vers Drive), remplacé par l'action `schema`. Peut être supprimé.

## 6. Le code du site

### 6.1 Principes
- Pas de bundler, pas de modules ES : des `<script>` classiques chargés **dans l'ordre** par `index.html` partagent une même portée globale. L'ordre compte : une fonction doit être définie avant d'être **appelée** au chargement (les fonctions utilisées plus tard, au clic, peuvent être définies après).
- Tout fichier JS/CSS nouveau doit être ajouté dans `index.html` (avant `core/main.js`).
- Formatage : Prettier (`.prettierrc` : 100 colonnes, 2 espaces, `trailingComma es5`, `arrowParens avoid`).
- Cache : chaque fichier est appelé avec `?v=NN`. **À chaque livraison, changez `NN` partout** dans `index.html` (rechercher/remplacer) : sinon les visiteurs gardent d'anciens fichiers.

### 6.2 Arborescence
```
index.html            liste ordonnée des CSS/JS
config.js             vos adresses (jamais écrasé)
docs/maintenance.md   ce document
core/                 moteur : defaults, state, utils, games, registry, nav, router, render, sheet, main
features/             un dossier par fonctionnalité
  home/ jeux/ retours/ guides/ biblio/ mes-seances/ seance/ editeur/ admin/
data/                 jeux.js (EMBED), annexes.js (AX)
cartes/ schemas/      images
css/                  base.css, responsive.css (mobile + impression)
scripts-google/       scripts Apps Script (copies de référence)
```

### 6.3 Le registre (`core/registry.js`)
Chaque fonctionnalité se déclare elle-même :

- `registerView({match, html, bind, fallback})` : une page. `match(v)` dit si la page gère l'adresse `#/v`, `html(v)` renvoie le HTML, `bind(v)` branche les événements après affichage.
- `registerNav({sec, secOrder, order, html})` : une entrée du menu (sections : 0 accueil, 10 LES JEUX, 20 PARCOURIR, 30 MES SÉANCES, 40 GUIDES, 50 ADMINISTRATION).
- `registerClick(fn)` : gestionnaire de clic global ; `fn(e)` renvoie `true` si le clic est traité (les suivants sont ignorés). L'ordre de déclaration (donc de chargement des scripts) décide de la priorité : `core/main.js`, chargé en dernier, gère les `[data-go]` et `[data-jeu]` en dernier recours.
- `registerLoader(async fn)` : chargements de données au démarrage (`loadSheet`, `loadRetours`, `loadSeances`).

### 6.4 Démarrage (`core/main.js`)
Affichage immédiat avec les données intégrées (`route()`), puis `Promise.all` de tous les loaders ; ensuite menu et page sont reconstruits (`buildNav(); render()`). Une page qui lève une exception affiche un cadre rouge au lieu de planter le site.

### 6.5 Navigation
Routage par l'ancre : `#/home`, `#/all`, `#/fam/Défis`, `#/jeu/E4` (fenêtre de détail), `#/seance`, `#/biblio`, `#/sb/<id>` (séance de la bibliothèque), `#/admin` (administration : onglets « Gérer les jeux » et « Documentation »)…  `go(v)` change l'ancre ; `route()` réagit à `hashchange`.

### 6.6 Les jeux (`core/games.js`, `features/jeux/`)
- `DATA` (état global) = jeux affichés. `key(g)` = `Code` sinon `Titre`.
- `isEmb(g)` : le code figure dans `EMBED` → images `cartes/CODE.jpg` et `schemas/CODE.webp`.
- Jeu non intégré → **vignette générée** en HTML/CSS (`thumb()` dans `list.js`) : en-tête de famille, code, titre, résumé, schéma si `Schéma (lien)`, pastilles durée / effectif / intensité.
- Tri : `parCode` (lettres puis numéro, sans code à la fin).
- Mode d'affichage liste/vignettes : défaut « liste », choix mémorisé (`localStorage.modeJeux`).
- Impression d'une fiche : `printFiche()` force une page A4 portrait (zoom si trop haute).

### 6.7 « Ma séance » (`features/seance/`)
Fichiers : `modele.js` (données, migration, calculs), `fiche.js` (aperçu HTML `sheetHTML()`), `formulaire.js` (saisie), `actions.js` (événements, impression, logo), `export-word.js` (docx), `donnees-anciennes.js` (anciens formats), `seance.js` (déclaration).

Données (`localStorage`: `maSeance2` = `SE`, `maSeanceMeta` = `SMETA`, `logoSalle`) :

```js
SMETA = { titre, periode, theme, educ, objectif, dates, objCol, secu, logo,
          groups: [ { nom, acc, rc } ] }          // 1 à 4 groupes, 2 par défaut
SE = { id?,                                       // présent si la séance est enregistrée en bibliothèque
       ech: { on, nom, d:[min par groupe], txt, per, gtxt:[texte par groupe] },
       subs: [ { id, titre, gs:null|[index], d:[min par groupe], items:[ … ] } ] }
// item : { id, t:"lib", k:code, crit, nom }  ou  { id, t:"free", nom, titre, desc, part, mat, plus, moins, crit, fam }
```

- `gs = null` : sous-section commune à tous les groupes ; sinon liste des groupes concernés. `ech.per = false` : un échauffement commun ; `true` : un texte par groupe.
- `seDefaults()` complète et **migre** les anciennes données (2 groupes fixes `g1/g2/acc1/acc2/d1/d2/g`) vers ce format ; elle est idempotente et appelée par `seModel()`.
- `seModel()` calcule la vue : groupes colorés (`GCOL`), totaux par groupe, matériel agrégé, noms d'exercices.
- `withSeance(meta, se, fn)` substitue temporairement `SMETA`/`SE` (pour afficher ou exporter une séance de la bibliothèque) : **synchrone uniquement**.
- Couleurs de groupe : bleu `#3A8FB0`, orange `#E8662F`, vert `#4E9A5B`, violet `#8A55B5`.
- Impression : `imprimerSeance()` ajoute `body.ps` et `@page` paysage ; le CSS d'impression (`css/responsive.css`) ne laisse visible que `#sheet`. Le nettoyage se fait sur `afterprint`.
- Word : `docx` 9.7.1 chargé à la demande depuis jsDelivr (`export-word.js`), liens hypertextes vers les jeux, logo en `ImageRun`.
- Logo : téléversé, redimensionné (≤ 120 px de haut) via canvas, mémorisé et repris par défaut à chaque nouvelle séance.
- Ajouter un jeu libre à la bibliothèque : `seToLib()` envoie l'action `jeu` (non publié).

### 6.8 Bibliothèque de séances (`features/biblio/`)
- `seances.js` : `loadSeances()` (CSV), `sbAll()` fusionne les séances de la feuille et celles du navigateur (`localStorage.seancesEnregistrees`) ; **la plus récente (champ `ts`) gagne**. Les suppressions locales sont mémorisées (`seancesSupprimees`) jusqu'à ce que le CSV soit rafraîchi.
- `enregistrerSeance()` : attribue un `id` si besoin et envoie l'action `seance` (mise à jour si l'`id` existe).
- Détail `#/sb/<id>` : aperçu, impression, Word, **Modifier** (recharge dans « Ma séance » en conservant l'`id`), **Utiliser comme modèle** (copie sans `id`), **Supprimer**.
- `biblio.js` : deux onglets (outil / Drive), onglet mémorisé (`biblioTab`).

### 6.9 Éditeur de schémas (`features/editeur/`)
Éditeur SVG maison : `etat.js` (état, annulation), `formes.js` (dessin des pièces : prises, personnages, flèches…), `rendu.js`, `panneau.js` (propriétés), `palette.js`, `interactions.js` (souris/clavier), `export.js` (PNG/SVG, envoi). L'envoi appelle l'action `schema` ; la réponse contient l'URL à coller dans `Schéma (lien)`. Brouillon : `localStorage.edSchema`.

Réglages (v30) : `ED.opt` contient `mode` (`face`/`dessus`), `murX/murY/murW/murH` (mur ou aire de jeu, lus par `edMur()` dans `rendu.js`), `tapis`, `vue`, `legende`. Chaque pièce peut avoir un niveau `z` (Devant/Derrière le modifient ; sans `z`, le niveau par défaut vient de `edLayer()`). Cerceaux (`hoopflat/hoopfloor/hoopside`, dessinés par `hoopSVG()` dans `formes.js`) : `w`, `h` (rayons), `rot`, `c`, `th`, `fill`, `s`. Pièce `pion` = joueur vu de dessus. Vue de profil (v31) : `ED.opt.mode="profil"`, `incl` (inclinaison en °), `murX/murY/murH` = pied et longueur du mur (`edWall()` dans `formes.js`) ; `phold` = prise collée au mur (position `d` le long du mur, calculée par `edPos()`), `pclimber` = grimpeur de profil (2 bras, 2 jambes, mains/pieds aimantés aux prises). Zones : `solid` = trait plein.

Nommage : le **code du jeu** est automatique (`admPrefixe`, `admCodeSuggere`, `admin.js`) : lettre de la famille + numéro libre suivant ; en lecture seule, suit la famille tant que le jeu est en attente, figé une fois publié. Le **nom d'un schéma** est indépendant du code (un schéma peut servir à plusieurs jeux) : l'éditeur propose un nom par défaut selon la catégorie (`edNomAuto`) mais il reste modifiable avant l'envoi, y compris depuis Administration (champ « Nom du fichier » : même nom = remplacement, autre nom = nouveau fichier lié à ce jeu seulement).

Pièces ajoutées (v34) : `elastic` (ligne avec nœuds aux extrémités), `rotarrow` (flèche circulaire, sens et trait plein réglables), `plaque` (plaquette avec texte), `shoe` (chausson, miroir). Pièces ajoutées (v35) : `magbag`, `carabiner`, `harness`, `helmet` (matériel), `banner` (drapeau), `cone` coloré (`c`), `chalk` (tracé à la craie : cercle/rectangle/croix, bruit déterministe selon l'id dans `chalkSVG`), `score` (panneau avec titre et deux scores), et les poses du personnage debout (`POSES` dans `palette.js`, menu « Pose » du panneau). v36 : palette allégée ; `spit` remplace `plaque` (le type `plaque` reste dessiné pour les anciens brouillons mais n'est plus proposé). Les cerceaux horizontal/vertical sont les types `hoopfloor` / `hoopflat` / `hoopside`.

### 6.9 bis Proposer un jeu (`features/proposer/proposer.js`)
Formulaire intégré au site (`#/proposer`), qui remplace le formulaire Google dès que `GAME_ADD_URL` est renseigné (le lien « + Proposer un jeu » du menu pointe alors vers lui ; sinon il utilise `FORM_URL`). Les champs sont décrits dans le tableau `PROP_CHAMPS` (mêmes noms que les colonnes de la feuille : pour ajouter un champ, ajouter une colonne et une ligne dans ce tableau). Le brouillon est gardé dans `localStorage.propDraft`. L'envoi est l'action `jeu` : la ligne arrive **non publiée**, à relire dans Administration. Schéma : « Dessiner » ouvre l'éditeur avec `ED.back = "proposer"` (le lien de l'image envoyée est mis dans le brouillon par `propSetSchema()`), « Choisir un schéma existant » liste les images non utilisées (action `schemas_liste`). Le formulaire Google (`creer_formulaire.gs`) n'est plus nécessaire mais reste fonctionnel.

### 6.10 Administration (`features/admin/`)
- Page « Administration » (`admin.js`), un seul lien dans le menu ; après saisie du mot de passe, trois onglets : « Gérer les jeux », « Schémas » et « Documentation ». Gestion des jeux : : le mot de passe administrateur est envoyé au script à chaque requête (champ `admin`) et gardé seulement dans `sessionStorage` (`admPw`, effacé à la fermeture de l'onglet). **La vérification est faite côté script** : sans le bon mot de passe, rien n'est lisible ni modifiable.
- Onglets : « En attente » et « Tous les jeux » ; édition de tous les champs ; valider/publier, enregistrer, retirer, refuser. Code proposé automatiquement (prochain numéro de la famille).
- Schéma d'un jeu : le bouton « ✏ Dessiner / modifier le schéma » (jeux dont le code n'est **pas** dans `EMBED`) ouvre l'éditeur lié au jeu (`ED.ctx`, `edOuvrirPourJeu()` dans `features/editeur/export.js`). Il recharge le dessin source `schemas/CODE.json` (ou la copie locale `edSrc_CODE` si elle date de moins de 10 min, le temps que GitHub Pages publie), puis « Enregistrer dans le jeu » envoie l'image et la source (`admin_schema`). Les 36 schémas d'origine ne sont que des images : non modifiables avec l'outil. Cliquer « Dessiner un schéma » dans le menu supprime le lien avec le jeu.
- Onglet « Schémas » : bibliothèque des images de `schemas/` (action `admin_schemas`), avec la mention « utilisé : CODE » ou « non associé à un jeu » (comparaison avec les jeux publiés, les jeux chargés dans l'onglet des jeux et les 36 schémas d'origine). Dans la fiche d'un jeu, « 🖼 Choisir un schéma existant » ouvre un sélecteur (non associés en premier) qui remplit « Schéma (lien) » ; il faut ensuite « Enregistrer ». Un schéma envoyé depuis « Dessiner un schéma » est stocké avec son dessin source (`NOM.json`).
- Onglet « Documentation » (`doc.js`, `docHTML()`) : affiche ce fichier, uniquement après connexion. **Attention** : la restriction ne concerne que l'interface ; le fichier `docs/maintenance.md` reste lisible par quiconque ouvre le dépôt public ou connaît son adresse. Il ne doit donc contenir aucun secret (mots de passe, jeton). Pour le rendre vraiment privé, il faudrait le sortir du dépôt public.

### 6.11 Clés `localStorage` / `sessionStorage`

| Clé | Contenu |
|---|---|
| `maSeance2` | séance en cours (`SE`) |
| `maSeanceMeta` | informations de la séance en cours (`SMETA`) |
| `maSeance` | ancien format (migré, lecture seule) |
| `logoSalle` | dernier logo téléversé |
| `seancesEnregistrees` | copie locale des séances enregistrées |
| `seancesSupprimees` | identifiants supprimés en attendant le rafraîchissement du CSV |
| `biblioTab` | onglet de la bibliothèque |
| `modeJeux` | liste / vignettes |
| `edSchema` | brouillon de l'éditeur de schémas |
| `propDraft` | brouillon du formulaire « Proposer un jeu » |
| `edSrc_CODE` | dernier dessin source enregistré pour le jeu CODE (copie locale) |
| `sessionStorage.admPw` | mot de passe administrateur (session) |

## 7. Procédures courantes

### Mettre en ligne une modification du code
1. Modifier les fichiers (github.dev : touche `.` sur la page du dépôt ; ou en local).
2. Changer le numéro `?v=` dans `index.html`.
3. Formater : `npx prettier@3 --write "core/**/*.js" "features/**/*.js" "features/**/*.css" "css/*.css"`.
4. Commit & Push. GitHub Pages republie en ~1 minute. Ctrl+F5 pour tester.
5. Mettre à jour ce document.

### Tester en local
`python3 -m http.server` dans le dossier, puis http://localhost:8000 (ouvrir `index.html` directement fonctionne aussi, sauf pour la page Documentation qui charge un fichier).

### Publier un jeu proposé
Administration > Gérer les jeux > « Relire / modifier » > compléter (Code, Famille, durée…) > « Valider et publier ». Visible sur le site après le rafraîchissement du CSV publié (quelques minutes).

### Ajouter un schéma à un jeu
Éditeur de schémas > nom du fichier > « Envoyer » > copier le lien > le coller dans `Schéma (lien)` (page Administration). Le fichier apparaît dans `schemas/` du dépôt, et sur le site environ une minute après.

### Ajouter un champ à la fiche des jeux
1. Ajouter la colonne dans le Sheet (nom exact).
2. L'afficher dans `features/jeux/fiche.js` (`openFiche`), éventuellement dans `list.js`.
3. Si le champ doit être édité/envoyé : il apparaît tout seul dans la page Administration ; pour l'envoi depuis « Ma séance », compléter `seToLib()` (`features/seance/actions.js`).

### Ajouter une fonctionnalité
Créer `features/ma-fonction/ma-fonction.js` avec `registerView` / `registerNav` / `registerClick` / `registerLoader` (voir 6.3), puis l'ajouter à `index.html`.

### Changer un mot de passe
- Site (`GAME_ADD_KEY` + `CLE_SITE`) : modifier **les deux** (config.js et script), redéployer le script (nouvelle version), pousser `config.js`.
- Administrateur : modifier `MOT_DE_PASSE_ADMIN`, redéployer.

### Renouveler le jeton GitHub
Créer un jeton (voir 5.4), le coller dans `GITHUB_JETON`, exécuter `testerConnexions`, redéployer.

### Sauvegarder
Le dépôt GitHub (historique complet du code et des images) ; pour la feuille : Fichier > Télécharger, ou l'historique des versions de Google Sheets.

## 8. Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| « Failed to fetch » | adresse `GAME_ADD_URL` fausse (pas `/exec`), accès du déploiement ≠ « Tout le monde » | vérifier l'adresse, le déploiement (5), tester l'adresse dans le navigateur |
| « mot de passe du site incorrect » | `GAME_ADD_KEY` ≠ `CLE_SITE` | rendre identiques ; redéployer ; vider le cache |
| « mot de passe administrateur incorrect » | saisie ≠ `MOT_DE_PASSE_ADMIN` | corriger, redéployer |
| Modifications du script sans effet | pas de **nouvelle version** du déploiement | Déployer > Gérer > ✎ > Nouvelle version |
| « GitHub a refusé (401/403/404) » | jeton expiré, droits insuffisants, mauvais `GITHUB_DEPOT` | `testerConnexions`, nouveau jeton avec *Contents: write* |
| Nouveau jeu absent du site | `Publié` ≠ `OUI`, ou CSV pas encore rafraîchi | publier ; attendre quelques minutes ; ouvrir l'adresse CSV pour vérifier |
| Séance enregistrée mais absente de la liste | `SEANCES_CSV_URL` vide ou onglet non publié | publier l'onglet `Séances` en CSV |
| Une page affiche un cadre rouge | erreur JS dans cette page | console du navigateur (F12) ; le message indique la ligne |
| Ancien site affiché | cache | changer `?v=`, Ctrl+F5 |
| Menu « Administration » absent | `features/admin/admin.js` non poussé ou absent d'`index.html` | vérifier le dossier et l'`index.html` du dépôt |
| Word : « export impossible » | jsDelivr bloqué (réseau) | réessayer, autre réseau |
| PDF de séance en portrait | navigateur qui ignore `@page` | choisir « Paysage » dans la boîte d'impression |

## 9. Sécurité et confidentialité

- `GAME_ADD_KEY` est publique (dans `config.js`) : toute personne qui la lit peut proposer un jeu, enregistrer ou supprimer une séance. Seule la page Administration (jeux) est réellement protégée par mot de passe, vérifié côté script.
- Les onglets publiés en CSV sont lisibles par quiconque a l'adresse.
- Le jeton GitHub ne vit que dans le script Apps Script privé. Ne le copiez jamais dans le dépôt.
- Les données saisies dans « Ma séance » restent dans le navigateur tant qu'on n'enregistre pas dans la bibliothèque.

## 10. Limites connues

- Pas de comptes utilisateurs : pas d'auteur « vérifié », pas de droits par séance.
- Délai de rafraîchissement du CSV publié (quelques minutes).
- Une séance enregistrée est limitée à ~45 000 caractères (le logo est retiré si nécessaire).
- La suppression d'un groupe rend « commune » une sous-section qui ne lui était destinée qu'à lui.
- Les 36 jeux d'origine gardent leurs images (`cartes/`, `schemas/`) même si leur ligne est modifiée dans la feuille.

## 11. Journal des changements

À compléter à chaque livraison : date, version `?v=`, changement.

| Date | Version | Changement |
|---|---|---|
| 2026-10-30 | 36 | Éditeur : palette allégée (un bouton par objet, couleur et variantes dans le panneau de droite), poses du personnage debout réglables, spit d'escalade à la place des plaquettes |
| 2026-10-30 | 35 | Éditeur : matériel d'escalade, drapeaux et plots colorés, tracés à la craie, personnages en situation, panneau de score |
| 2026-10-30 | 34 | Éditeur : élastiques, flèches de rotation, plaquettes, chaussons ; le nom d'un schéma est de nouveau libre (suggestion par catégorie, modifiable, aussi depuis Administration) ; plus de renommage automatique du schéma quand le code change (**script Apps Script à redéployer**) |
| 2026-10-30 | 33 | Administration : le champ Code est en lecture seule (automatique). Jeu en attente : suit la famille ; jeu publié : figé. Pour corriger un code à la main : modifier la feuille Google directement |
| 2026-10-30 | 32 | Codes automatiques par famille (lettre + numéro suivant), le code et le nom du schéma suivent un changement de famille (renommage dans le dépôt à l'enregistrement) ; catégorie + nom automatique dans l'éditeur ; Administration > Schémas : bouton « Modifier » (dessin source) ; **script Apps Script à redéployer** (actions `admin_schema_fichier`, renommage GitHub) |
| 2026-10-30 | 31 | Éditeur : vue de profil (mur à inclinaison réglable, prises collées au mur, grimpeurs de profil) |
| 2026-10-30 | 30 | Éditeur : Devant/Derrière fonctionnels, mur réglable (largeur, hauteur, position), mode « vue de dessus », réglages des cerceaux (largeur, hauteur, rotation, couleur, remplissage), joueur vu de dessus, zones à trait plein |
| 2026-10-30 | 29 | Formulaire « Proposer un jeu » intégré au site (dessin ou choix d'un schéma existant) |
| 2026-10-30 | 28 | Administration : onglet « Schémas » (bibliothèque, schémas non associés) et sélecteur « Choisir un schéma existant » dans la fiche d'un jeu |
| 2026-10-29 | 27 | Un seul lien « Administration » ; après connexion, onglets « Gérer les jeux » et « Documentation » |
| 2026-10-29 | 26 | Administration : aperçu du schéma du jeu dans la fiche à valider |
| 2026-10-29 | 25 | Administration : dessiner / modifier le schéma d'un jeu avec l'éditeur (nouveaux jeux seulement), enregistrement direct dans le dépôt et dans la feuille |
| 2026-10-29 | 24 | Documentation intégrée (Administration > Documentation) |
| 2026-10-29 | 23 | Administration : édition de tous les jeux, retrait du site ; vignettes automatiques à taille corrigée ; tri par code ; documentation intégrée |
| 2026-10-29 | 19–22 | Script unique `serveur_site.gs` (jeux, séances, schémas → GitHub, administration) ; page « Jeux en attente » ; séances : liste en lignes, suppression, modification, PDF paysage ; puces automatiques |
| 2026-10-29 | 18 | « Ma séance » : groupes libres (2 à 4), échauffement par groupe, sous-sections par groupe |
| 2026-10-29 | 17 | Base de séances (onglet `Séances`), bibliothèque à deux onglets, logo, effacement, impression d'une fiche de jeu sur une page |
| avant | ≤ 16 | Refactor en dossiers par fonctionnalité, éditeur de schémas, export Word, retours de terrain |
