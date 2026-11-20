# CRM Koloni

Application web du CRM interne KOLONI — Nuxt 4 + Nuxt UI 4 + Bun.

## Installation

Prérequis : [Bun](https://bun.sh) installé.

```bash
bun install
```

## Configuration

Créer le fichier d'environnement local à partir de l'exemple :

```bash
cp .env.example .env
```

Renseigner `NUXT_APP_SECRET` avec une chaîne aléatoire d'au moins 32 caractères, par exemple :

```bash
openssl rand -hex 32
```

## Démarrage

```bash
bun run dev
```

L'application est alors accessible sur [http://localhost:3000](http://localhost:3000). Toute navigation redirige vers `/login` tant que l'utilisateur n'est pas connecté (middleware d'authentification global).

## Scripts disponibles

| Commande | Description |
| --- | --- |
| `bun run dev` | Lance le serveur de développement. |
| `bun run build` | Build de production. |
| `bun run preview` | Prévisualise le build de production en local. |
| `bun run typecheck` | Vérifie les types (`nuxt typecheck`). |
| `bun run lint` | Vérifie le style et les erreurs (`eslint .`). |

## Composants réutilisables (`app/components/`)

### `MenuApplication`

En-tête de navigation principal (desktop + mobile), avec les entrées adaptées au rôle de l'utilisateur connecté (l'entrée « Comptes » n'apparaît que pour un administrateur).

- Pas de props.
- Dépend de `useAuth()` (voir plus bas).

```vue
<template>
  <UApp>
    <MenuApplication />
    <NuxtPage />
  </UApp>
</template>
```

### `InfoUtilisateur`

Affiche le nom complet et le rôle (« Administrateur » / « Membre ») de l'utilisateur connecté. À n'afficher que si `isAuthenticated`.

- Pas de props.
- Dépend de `useAuth()`.

```vue
<InfoUtilisateur v-if="isAuthenticated" />
```

### `CarteTitree`

`UCard` avec un en-tête standardisé (icône + titre).

| Prop | Type | Description |
| --- | --- | --- |
| `icon` | `string` | Nom de l'icône Iconify (ex. `i-lucide-briefcase`). |
| `title` | `string` | Titre affiché dans l'en-tête. |

Slot par défaut : contenu de la carte.

Slot `actions` (optionnel) : boutons alignés à droite de l'en-tête.

```vue
<CarteTitree icon="i-lucide-briefcase" title="Opportunités en cours">
  <template #actions>
    <UButton label="Ajouter" icon="i-lucide-plus" size="sm" />
  </template>
  <p>Contenu de la carte…</p>
</CarteTitree>
```

### `TableauOpportunites`

Tableau d'opportunités réutilisable (liste principale et vues filtrées), basé sur `UTable`. La barre colorée à gauche et le badge de statut reflètent le `StatutOpportunite` de chaque ligne ; les colonnes intermédiaires affichent des pastilles (`BadgeItem`) configurables, suivies de l'apporteur et de la date du signal.

| Prop | Type | Description |
| --- | --- | --- |
| `opportunites` | `Opportunite[]` | Données à afficher. |
| `getBadges` | `(o: Opportunite) => BadgeItem[]` | Fonction retournant les pastilles d'une opportunité (voir `useOpportuniteBadges`). |
| `columns?` | `string[]` | Sous-ensemble de clés de `OPPORTUNITE_BADGE_COLUMNS` à afficher ; toutes par défaut. |
| `titreTo?` | `(o: Opportunite) => string` | Lien cliquable sur le titre (optionnel). |

```vue
<script setup lang="ts">
const { getOpportuniteBadges } = useOpportuniteBadges(opportunites)
</script>

<template>
  <TableauOpportunites
    :opportunites="opportunites"
    :get-badges="getOpportuniteBadges"
    :titre-to="o => `/opportunites/${o.id}`"
  />
</template>
```

### `BarrePagination`

Barre de pagination centrée, autour de `UPagination`.

| Prop | Type | Description |
| --- | --- | --- |
| `total` | `number` | Nombre total d'éléments. |
| `itemsPerPage` | `number` | Éléments affichés par page. |

La page courante (commence à 1) se lie avec `v-model:page`.

```vue
<BarrePagination v-model:page="page" :total="total" :items-per-page="20" />
```

### `ListeDeroulanteLibellee`

`USelect` dans un `UFormField` (libellé au-dessus), dont la largeur s'ajuste automatiquement à l'option la plus longue, placeholder compris.

| Prop | Type | Description |
| --- | --- | --- |
| `label` | `string` | Libellé affiché au-dessus du sélecteur. |
| `items` | `(string \| { label: string, value: string })[]` | Options proposées. |
| `placeholder?` | `string` | Texte affiché sans sélection. |

La valeur sélectionnée se lie avec `v-model`.

```vue
<ListeDeroulanteLibellee
  v-model="statutChoisi"
  label="Statut"
  :items="['Signal', 'Matching', 'Proposé']"
  placeholder="Tous les statuts"
/>
```

### `ListePersonnes`

Liste de personnes affichées en puces, avec retrait individuel optionnel. Ne s'affiche pas si `personnes` est vide.

| Prop | Type | Description |
| --- | --- | --- |
| `personnes` | `PersonneListee[]` | Personnes à afficher. |
| `label` | `string` | Titre du groupe, suivi du nombre total de personnes (catégories masquées comprises). |
| `color?` | `NuxtUiColor` | Couleur du compteur, et des puces sans catégorie (`primary` par défaut). |
| `display?` | `'nomComplet' \| 'mail'` | Champ affiché sur chaque puce (`nomComplet` par défaut). |
| `retirable?` | `boolean \| (p: PersonneListee) => boolean` | Affiche la croix de retrait, pour toutes les puces ou selon la personne (ex. selon les droits). `false` par défaut. |
| `categories?` | `CategoriePersonne[]` | Catégories possibles, chacune avec sa couleur (`{ label, color? }`) : les puces sont regroupées selon `personne.categorie`, avec une case à cocher de la même couleur par catégorie pour l'afficher ou la masquer. |
| `categoriesMasquees?` | `string[]` | Labels des catégories décochées au départ. |

Émet `retirer` avec la personne concernée, après confirmation : la croix ouvre une fenêtre « Confirmer le retrait », et l'événement n'est envoyé qu'au clic sur « Retirer ». Le composant ne supprime rien : c'est à la page de changer l'état de la personne (ex. positionnement → « Retiré ») pour conserver l'historique.

```vue
<ListePersonnes
  :personnes="positionnements"
  label="Positionnements"
  :categories="[
    { label: 'Positionné', color: 'primary' },
    { label: 'Présenté au client', color: 'info' },
    { label: 'Retenu', color: 'success' },
    { label: 'Écarté', color: 'error' },
    { label: 'Retiré', color: 'neutral' }
  ]"
  :categories-masquees="['Écarté', 'Retiré']"
  :retirable="p => p.id === moi.id && p.categorie !== 'Retiré'"
  @retirer="p => passerEnRetire(p)"
/>
```

### `FenetreConfirmation`

Fenêtre (`UModal`) qui demande de confirmer une action avant de la lancer. « Annuler », Échap ou un clic à côté la ferment sans rien faire.

| Prop | Type | Description |
| --- | --- | --- |
| `title` | `string` | Titre de la fenêtre. |
| `description?` | `string` | Question posée. |
| `confirmLabel?` | `string` | Texte du bouton de validation (`Confirmer` par défaut). |
| `color?` | `NuxtUiColor` | Couleur du bouton de validation (`error` par défaut). |

L'ouverture se lie avec `v-model:open`. Émet `confirmer` au clic sur le bouton de validation, puis se ferme.

```vue
<FenetreConfirmation
  v-model:open="confirmationOuverte"
  title="Confirmer le retrait"
  description="Retirer Camille Démo de « Positionnements » ?"
  confirm-label="Retirer"
  @confirmer="retirer"
/>
```

## Composables (`app/composables/`)

### `useAuth()`

Expose l'état d'authentification courant à partir de `nuxt-auth-utils` : `isAuthenticated`, `user`, `role`, `isAdmin`, `session`, ainsi que `refresh()` et `logout()`.

### `useOpportuniteBadges(opportunites)`

Construit les pastilles (`BadgeItem`) d'une liste d'opportunités, avec une couleur stable par valeur (technologie, ville, mode, client final). Expose `technologieColors` et `getOpportuniteBadges(o)`, à passer en prop `getBadges` de `TableauOpportunites`.

## Types partagés

- `shared/types/utilisateur.ts` : `Role` (`admin` / `membre`) et `Utilisateur`.
- `app/types/index.d.ts` : `StatutOpportunite`, `Opportunite`, `BadgeItem`, `NuxtUiColor`, `PersonneListee`.
