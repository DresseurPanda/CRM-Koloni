# Base de données PostgreSQL (Docker)

Base PostgreSQL 16 du CRM Koloni, lancée en local avec Docker Compose. Au premier démarrage, elle crée le schéma puis charge un jeu de données de test fictif.

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et **démarré**.

## Configuration

Depuis ce dossier (`bdd/postgre`), créer le fichier d'environnement local :

```bash
cp .env.example .env
```

Puis remplacer les valeurs de `POSTGRES_PASSWORD` et de `KOLONI_APP_PASSWORD` dans `.env`. Le fichier `.env` n'est jamais commité.

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `POSTGRES_DB` | `koloni` | Nom de la base. |
| `POSTGRES_USER` | `koloni_proprietaire` | Propriétaire des tables : il crée le schéma et charge les données. L'application ne s'en sert pas. |
| `POSTGRES_PASSWORD` | aucun (obligatoire) | Mot de passe du propriétaire. |
| `KOLONI_APP_PASSWORD` | aucun (obligatoire) | Mot de passe du rôle `koloni_app`, celui de l'application. |
| `POSTGRES_PORT` | `5432` | Port publié sur la machine. À changer si un autre Postgres utilise déjà le 5432. |

L'application se connecte avec le rôle `koloni_app`, qui peut lire, ajouter et modifier, mais jamais supprimer (sauf corriger le rattachement d'une technologie ou d'un contact à une opportunité). L'historique des statuts et le journal sont remplis automatiquement par des triggers, et en ajout seul : l'application ne peut ni les modifier ni les supprimer. Les droits sont définis dans `007_roles.sql`.

## Lancer la base

```bash
docker compose up -d --build
```

Le conteneur `koloni_postgres` démarre en arrière-plan. Pour vérifier qu'il est prêt :

```bash
docker compose ps
```

La colonne `STATUS` doit afficher `healthy`.

La base n'est accessible que depuis la machine locale (`127.0.0.1`), pas depuis le réseau.

## Se connecter

```bash
docker exec -it koloni_postgres psql -U koloni_proprietaire -d koloni
```

Cette commande se connecte en propriétaire (tous les droits). Pour voir ce que voit l'application, remplacer `koloni_proprietaire` par `koloni_app`.

Quelques commandes utiles dans `psql` : `\dt` (liste des tables), `\d opportunite` (détail d'une table), `\q` (quitter).

## Connecter l'application Nuxt

Dans `crm-koloni/.env`, renseigner le rôle `koloni_app` et son mot de passe :

```text
NUXT_DATABASE_HOST=localhost
NUXT_DATABASE_PORT=5432
NUXT_DATABASE_NAME=koloni
NUXT_DATABASE_USER=koloni_app
NUXT_DATABASE_PASSWORD=<KOLONI_APP_PASSWORD>
```

Après `bun run dev`, la page <http://localhost:3000/api/health> doit afficher `"status": "ok"`.

## Arrêter la base

| Commande | Effet |
| --- | --- |
| `docker compose stop` | Arrête le conteneur, les données sont conservées. |
| `docker compose down` | Supprime le conteneur, les données sont conservées (volume `koloni_pgdata`). |
| `docker compose down -v` | Supprime le conteneur **et les données**. |

## Réinitialiser la base

Les scripts SQL ne s'exécutent qu'à la **première initialisation** du volume. Pour repartir d'une base vide, avec le schéma et les données de test :

```bash
docker compose down -v
docker compose up -d --build
```

Même chose après toute modification d'un des scripts SQL (`001` à `007`).

## Contenu du dossier

| Fichier | Rôle |
| --- | --- |
| `Dockerfile` | Image `postgres:16-alpine` qui embarque les scripts SQL. |
| `docker-compose.yml` | Service, port, volume de données et healthcheck. |
| `.env.example` | Modèle des variables d'environnement. |
| `001_tables_de_base.sql` | Membres, références (familles, technologies, entreprises), contacts et profils extérieurs. |
| `002_opportunites.sql` | Opportunité, tables de liaison, positionnements et notes. |
| `003_historique_et_journal.sql` | Historique des statuts et journal d'actions. |
| `004_vues.sql` | Vues : consultants, ouverture à l'extérieur, dernière sollicitation, et vues de lecture (opportunités, contacts, profils extérieurs, membres). |
| `005_triggers.sql` | Fonctions et triggers (historique, contrôles, alimentation du journal). |
| `006_donnees_test.sql` | Données de test fictives (membres, contacts, opportunités…). |
| `007_roles.sql` | Rôle `koloni_app` de l'application et ses droits (jamais de suppression). |

Les scripts `*.sql` sont exécutés dans l'ordre alphabétique de leur nom.

## Problèmes fréquents

- **`Cannot connect to the Docker daemon`** : Docker Desktop n'est pas démarré.
- **`port is already allocated`** : un autre programme utilise le port 5432. Changer `POSTGRES_PORT` dans `.env` (par exemple `5433`) et reporter la valeur dans `NUXT_DATABASE_PORT`.
- **`POSTGRES_PASSWORD` ou `KOLONI_APP_PASSWORD` : erreur au lancement** : la variable n'est pas définie, vérifier que `.env` existe dans ce dossier et contient les deux mots de passe.
- **`password authentication failed for user "koloni_app"` côté Nuxt** : `NUXT_DATABASE_PASSWORD` doit valoir `KOLONI_APP_PASSWORD`, et non `POSTGRES_PASSWORD`.
- **Le mot de passe modifié n'est pas pris en compte** : Postgres ne lit le mot de passe qu'à la création du volume. Réinitialiser la base (voir plus haut).
