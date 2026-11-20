<!--
  TableauOpportunites — tableau d'opportunités (liste principale et vues filtrées), basé sur UTable
  Colonnes, de gauche à droite :
    barre colorée selon le statut, titre, pastilles (client final, ville),
    apporteur, température, statut, date du signal
  Props :
    opportunites — opportunités à afficher
    getBadges    — renvoie les pastilles d'une opportunité (voir useOpportuniteBadges)
    columns      — clés des colonnes de pastilles à afficher ('Client final', 'Ville') ; défaut : toutes
    titreTo      — renvoie le lien du titre d'une opportunité (optionnel : titre sans lien si absent)
-->
<template>
  <UTable
    :data="opportunites"
    :columns="colonnesTableau"
    :ui="{
      th: 'text-[10px] uppercase tracking-wide text-dimmed py-1',
      td: 'py-2 align-middle'
    }"
  />
</template>

<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'

const props = defineProps<{
  opportunites: Opportunite[]
  getBadges: (o: Opportunite) => BadgeItem[]
  columns?: string[]
  titreTo?: (o: Opportunite) => string
}>()

const UBadge = resolveComponent('UBadge')
const UTooltip = resolveComponent('UTooltip')
const NuxtLink = resolveComponent('NuxtLink')

// Couleurs des statuts (STATUTS_OPPORTUNITE) et des températures (COULEURS_TEMPERATURE) :
// partagées avec la fiche de détail, dans app/utils/opportunites.ts

const CLASSE_TITRE = 'font-medium text-sm text-highlighted truncate'

// Colonnes de pastilles affichées, dans l'ordre de OPPORTUNITE_BADGE_COLUMNS
const colonnesPastilles = computed(() =>
  props.columns
    ? OPPORTUNITE_BADGE_COLUMNS.filter(c => props.columns!.includes(c.key))
    : OPPORTUNITE_BADGE_COLUMNS
)

const colonnesTableau = computed<TableColumn<Opportunite>[]>(() => [
  // Barre colorée selon le statut (colonne sans en-tête)
  {
    id: 'bar',
    header: '',
    meta: { class: { th: 'w-1 p-0', td: 'w-1 p-0 pr-2' } },
    cell: ({ row }) => h('div', {
      // Couleur du statut Signal si le statut venant de la base de donnée n'est pas reconnu
      class: ['w-1 rounded-sm self-stretch', (STATUTS_OPPORTUNITE[row.original.statut] ?? STATUTS_OPPORTUNITE.Signal).barre],
      style: 'min-height: 2rem'
    })
  },

  // Titre, cliquable si titreTo est fourni
  {
    accessorKey: 'titre',
    header: 'Titre',
    cell: ({ row }) => {
      const to = props.titreTo?.(row.original)
      return to
        ? h(NuxtLink, { to, class: `${CLASSE_TITRE} hover:underline` }, () => row.original.titre)
        : h('p', { class: CLASSE_TITRE }, row.original.titre)
    }
  },

  // Colonnes de pastilles : une colonne par entrée de OPPORTUNITE_BADGE_COLUMNS (Client final, Ville),
  // dans l'ordre et la largeur qu'elle définit
  ...colonnesPastilles.value.map((col): TableColumn<Opportunite> => ({
    id: col.key,
    header: col.label,
    meta: { class: { th: `${col.width} text-center`, td: `${col.width} text-center` } },
    cell: ({ row }) => {
      // Parmi les pastilles de l'opportunité, celle de cette colonne est la seule dont le champ tooltip
      // (« infobulle », jamais affiché ici : il sert à reconnaître le type de pastille) vaut la clé
      // de la colonne (ex. 'Ville') ; cellule vide si l'opportunité n'en a pas
      const badge = props.getBadges(row.original).find(b => b.tooltip === col.key)
      if (!badge) return null
      // Pastille : texte, couleur et icônes (avant / après le texte) fournis par getBadges
      const pastille = h(UBadge, {
        color: badge.color,
        leadingIcon: badge.icon,
        trailingIcon: badge.trailingIcon,
        variant: 'soft',
        size: 'md'
      }, () => badge.label)
      // Infobulle = nom de la colonne ; pastille cliquable si elle porte un lien (badge.to)
      return h(UTooltip, { text: col.label }, () =>
        badge.to ? h(NuxtLink, { to: badge.to }, () => pastille) : pastille
      )
    }
  })),

  // Apporteur : texte simple, affiché tel quel (ex. « Alexia P. »)
  {
    accessorKey: 'apporteur',
    header: 'Apporteur',
    meta: { class: { th: 'w-32', td: 'w-32 text-sm' } }
  },

  // Température : badge Chaud (rouge) ou Tiède (bleu) selon COULEURS_TEMPERATURE, avec l'infobulle
  // « Température » ; cellule vide si la température n'est pas renseignée (champ facultatif)
  {
    id: 'temperature',
    header: 'Température',
    meta: { class: { th: 'w-28 text-center', td: 'w-28 text-center' } },
    cell: ({ row }) => {
      const t = row.original.temperature
      if (!t) return null
      return h(UTooltip, { text: 'Température' }, () =>
        h(UBadge, { color: COULEURS_TEMPERATURE[t], variant: 'soft', size: 'md' }, () => t)
      )
    }
  },

  // Statut : badge plein, de la couleur définie dans STATUTS_OPPORTUNITE, avec l'infobulle « Statut »
  {
    id: 'statut',
    header: 'Statut',
    meta: { class: { th: 'w-28 text-center', td: 'w-28 text-center' } },
    cell: ({ row }) => h(UTooltip, { text: 'Statut' }, () =>
      h(UBadge, {
        color: STATUTS_OPPORTUNITE[row.original.statut]?.couleur,
        variant: 'solid',
        size: 'md'
      }, () => row.original.statut)
    )
  },

  // Date du signal : AAAA-MM-JJ → JJ/MM/AAAA
  {
    accessorKey: 'dateSignal',
    header: 'Date signal',
    meta: { class: { th: 'w-28 text-center', td: 'w-28 text-center text-sm' } },
    cell: ({ row }) => formaterDate(row.original.dateSignal)
  }
])
</script>
