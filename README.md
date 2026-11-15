# CRM Koloni

## Équipe & Rôles

* **Garaios Mathias** - *Scrum Master*
* **Drapied Hugo** - *Product Owner*
* **Martinez Lucie** - *Développeuse*
* **Fellah Sara** - *Développeuse*
* **Bonard Louis** - *Développeur*

---

## À propos du projet

**Koloni** est un réseau professionnel national tourné vers les freelances en Data, ayant pour objectif principal le partage de connaissances et d'opportunités professionnelles.

Actuellement, les membres font circuler des opportunités de mission et relancent des contacts de manière isolée, avec leurs propres notes, sans centralisation ni partage.

### Objectifs de l'application

* Suivre centralement les contacts et les leads.
* Gérer des relances datées et des rappels.
* Assurer un suivi précis du statut par opportunité.
* Visualiser clairement ce qui se transforme en mission au bout du compte.

### Cadre du projet

Le projet est encadré par l'IUT de Blagnac dans le cadre de la **SAE 5.01 : Développement avancé**, dont l'objectif est de réaliser une application réelle avec un client réel, en équipe, pour mettre en œuvre l'ensemble des connaissances acquises lors de la formation comme projet de fin d'études.

---

## Technologies utilisées

* **Interface :** Nuxt 4 et Nuxt UI 4
* **API :** routes serveur de Nuxt, avec zod pour la validation et nuxt-auth-utils pour les sessions
* **Base de données :** PostgreSQL, lancé avec Docker
* **Outillage :** Bun, TypeScript et ESLint

---

## Démarrage

1. Lancer la base de données : voir [bdd/postgre/README.md](bdd/postgre/README.md).
2. Lancer l'application : voir [crm-koloni/README.md](crm-koloni/README.md).

---

## Documentation

* [Recueil de besoins](recueil-de-besoin/Recueil_de_Besoins.md)
* [Cahier des charges](recueil-de-besoin/Cahier%20des%20charges.md) : exigences et découpage en releases
* [Glossaire](documentation/GLOSSAIRE.md) : schéma de la base de données
* [Charte des couleurs](documentation/CHARTE-COULEURS.md)
* [Issues GitHub](https://github.com/DresseurPanda/CRM-Koloni/issues) : une issue par exigence, regroupées par release

---

## Structure du dépôt

```text
.
├── bdd/
│   ├── postgre/             # Scripts SQL versionnés (001_, 002_, ... appliqués dans l'ordre) et Docker de la base
│   └── data/                # Données de dev, ignorées par git (non versionnées)
├── crm-koloni/              # Application Nuxt
│   ├── app/                 # Interface (Nuxt UI)
│   │   ├── pages/           # Écrans, une route par fichier
│   │   ├── components/      # Composants réutilisables
│   │   ├── composables/     # Logique partagée entre les pages
│   │   ├── middleware/      # Contrôle d'accès aux pages
│   │   └── utils/
│   ├── server/              # API (routes Nitro)
│   │   ├── api/             # Une route par fichier (ex. opportunites/index.post.ts)
│   │   └── utils/           # Connexion à la base, session, validation
│   └── shared/              # Types et utilitaires communs à l'interface et à l'API
├── documentation/
│   ├── CHARTE-COULEURS.md   # Couleurs de l'interface
│   └── GLOSSAIRE.md         # Documentation du schéma de base de données
├── recueil-de-besoin/
│   ├── Cahier des charges.md
│   ├── Recueil_de_Besoins.md
│   └── maquettes/           # Maquettes des écrans (images et HTML)
└── README.md
```

---

## Conventions

### Nommage

* Dossiers en `kebab-case` minuscule, sans espace ni accent (ex. `recueil-de-besoin/`, `documentation/`).
* Scripts SQL numérotés séquentiellement (`001_`, `002_`, ...) et appliqués dans l'ordre — voir `documentation/GLOSSAIRE.md`.

### Commits

Convention inspirée de [Conventional Commits](https://www.conventionalcommits.org/), message rédigé en français :

```text
type: résumé court

Corps optionnel expliquant le pourquoi, si le résumé ne suffit pas.
```

Types utilisés : `feat` (fonctionnalité), `fix` (correction), `docs` (documentation), `style` (mise en forme sans changement de logique), `chore` (outillage/réorganisation), `refactor` (restructuration sans changement de comportement).

---

## Utilisation de l'IA

L'équipe utilise une IA (ex: Claude Code, d'Anthropic) comme assistant de développement.

### Usages

* **Tests :** création de tests de la base de données, et tests en tant qu'utilisateur par une IA agentique qui pilote le navigateur (connexion, saisie des formulaires, vérification des écrans).
* **Données de test :** génération de jeux de données fictifs (opportunités, contacts, profils).
* **Correction de bugs :** recherche de la cause d'une erreur et proposition d'un correctif.
* **Composants :** aide à l'utilisation des composants Nuxt UI et de leurs options.
* **Qualité du code :** relecture, simplification, commentaires et documentation des composants.
* **Typage et lint :** renforcement du typage TypeScript et correction des erreurs `eslint` et `ruff`.
* **Code mort :** repérage des fichiers, fonctions et dépendances inutilisés.
* **Compréhension du code :** explication d'une partie du code à un membre qui la découvre.
* **Sécurité et DevOps :** recherche de failles de sécurité (tests d'intrusion sur l'application en local), audit des dépendances, configuration de Docker et de l'environnement de déploiement.
* **Dépendances :** choix et blocage des versions, mises à jour limitées aux correctifs de sécurité.
* **Git :** gestion des pulls, merges et rebases, des branches et des stash, correction de l'historique.
* **Commits :** découpage des changements et rédaction des messages selon la convention ci-dessus.
* **Suivi du projet :** comparaison de l'avancement avec le cahier des charges, mise à jour du découpage en releases, organisation des issues GitHub (une issue par exigence).
* **Documentation :** rédaction et relecture des documents du projet, intégration des retours du client dans le recueil de besoins et le cahier des charges.

### Règles

* Chaque proposition de l'IA est relue et validée par un membre de l'équipe avant d'être appliquée, commitée ou publiée.
* Les tests se font uniquement sur les données fictives du projet.
* Aucun secret de production n'est transmis à l'IA ; seuls des comptes et des valeurs de test sont utilisés.
