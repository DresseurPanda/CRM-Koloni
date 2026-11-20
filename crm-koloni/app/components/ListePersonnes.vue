<!--
  ListePersonnes — groupe de personnes affichées en puces, avec retrait individuel optionnel
  Ne s'affiche pas si la liste est vide.
  Le composant ne supprime rien : il émet « retirer » et la page décide quoi faire,
  en général changer un état (ex. positionnement → « Retiré ») pour garder l'historique.
  Props :
    personnes          — personnes à afficher
    label              — titre du groupe (suivi du nombre total de personnes, catégories masquées comprises)
    color              — couleur du compteur, et des puces hors catégorie : NuxtUiColor, défaut 'primary'
    display            — texte de chaque puce : 'nomComplet' (défaut) ou 'mail'
    retirable          — affiche la croix : booléen pour toutes les puces, ou fonction par personne
                         (ex. selon les droits de l'utilisateur) ; défaut : false
    categories         — catégories possibles, chacune avec sa couleur (optionnel) : les puces sont alors
                         regroupées selon personne.categorie, avec une case à cocher par catégorie pour l'afficher ou non
    categoriesMasquees — labels des catégories décochées au départ (ex. ['Retiré'])
  Émet : retirer(personne) au clic sur la croix d'une puce, après confirmation dans une fenêtre
-->
<template>
  <section
    v-if="personnes.length > 0"
    class="space-y-3"
  >
    <header class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div class="flex items-center gap-2">
        <p class="text-sm font-medium text-toned">
          {{ label }}
        </p>
        <UBadge
          :label="String(personnes.length)"
          :color="color"
          size="sm"
          variant="soft"
        />
      </div>
      <!-- Une case par catégorie, de la couleur de ses puces : cochée = groupe affiché -->
      <UCheckbox
        v-for="categorie in categories"
        :key="categorie.label"
        :model-value="!masquees.includes(categorie.label)"
        :label="`${categorie.label} (${personnesDe(categorie.label).length})`"
        :color="categorie.color ?? color"
        @update:model-value="basculer(categorie.label)"
      />
    </header>

    <!-- Un bloc par groupe de puces (voir groupes) : le titre de la catégorie, puis ses puces -->
    <div
      v-for="groupe in groupes"
      :key="groupe.titre ?? ''"
      class="space-y-1"
    >
      <p
        v-if="groupe.titre"
        class="text-xs text-muted"
      >
        {{ groupe.titre }}
      </p>
      <ul class="flex flex-wrap gap-2">
        <!-- Une puce par personne : un UBadge de la couleur du groupe, avec son libellé,
             puis la croix si elle est retirable -->
        <li
          v-for="personne in groupe.personnes"
          :key="personne.id"
          class="max-w-xs"
        >
          <UBadge
            :color="groupe.couleur"
            variant="subtle"
            class="max-w-full gap-1.5 rounded-full px-3"
          >
            <span class="truncate">{{ libellePuce(personne) }}</span>
            <!-- Survol de la croix : fond de la couleur du texte de la puce, quelle que soit la couleur -->
            <button
              v-if="estRetirable(personne)"
              type="button"
              class="shrink-0 rounded-full p-0.5 transition-colors hover:bg-current/15"
              :aria-label="`Retirer ${libellePuce(personne)}`"
              @click="personneARetirer = personne"
            >
              <UIcon
                name="i-lucide-x"
                class="size-3"
              />
            </button>
          </UBadge>
        </li>
      </ul>
    </div>

    <!-- Confirmation du retrait : la croix ouvre cette fenêtre, « retirer » n'est émis qu'après validation -->
    <FenetreConfirmation
      v-model:open="confirmationOuverte"
      title="Confirmer le retrait"
      :description="personneARetirer ? `Retirer ${libellePuce(personneARetirer)} de « ${label} » ?` : undefined"
      confirm-label="Retirer"
      @confirmer="confirmerRetrait"
    />
  </section>
</template>

<script lang="ts" setup>
// Props détaillées dans l'en-tête ; par défaut : couleur primary, nom complet affiché,
// pas de croix, pas de catégories, aucune catégorie masquée
const props = withDefaults(defineProps<{
  personnes: PersonneListee[]
  label: string
  color?: NuxtUiColor
  display?: 'nomComplet' | 'mail'
  retirable?: boolean | ((personne: PersonneListee) => boolean)
  categories?: CategoriePersonne[]
  categoriesMasquees?: string[]
}>(), {
  color: 'primary',
  display: 'nomComplet',
  retirable: false,
  categories: undefined,
  categoriesMasquees: () => []
})

// « retirer » transmet la personne à la page, qui change son état (le composant ne supprime rien)
const emit = defineEmits<{ retirer: [personne: PersonneListee] }>()

// Personne dont le retrait attend confirmation ; null = fenêtre de confirmation fermée
const personneARetirer = ref<PersonneListee | null>(null)

// Ouverture de la fenêtre, déduite de personneARetirer ; la fermer (Échap, clic à côté) annule le retrait
const confirmationOuverte = computed({
  get: () => personneARetirer.value !== null,
  set: (ouverte) => {
    if (!ouverte) personneARetirer.value = null
  }
})

// Retrait validé dans la fenêtre : envoie l'événement à la page, puis oublie la personne
function confirmerRetrait() {
  if (personneARetirer.value) emit('retirer', personneARetirer.value)
  personneARetirer.value = null
}

// Labels des catégories décochées par l'utilisateur (initialisés depuis la prop)
const masquees = ref<string[]>([...props.categoriesMasquees])

// Coche ou décoche une catégorie : l'ajoute aux masquées si elle était affichée, l'en retire sinon
function basculer(categorie: string) {
  masquees.value = masquees.value.includes(categorie)
    ? masquees.value.filter(c => c !== categorie)
    : [...masquees.value, categorie]
}

// Personnes d'une catégorie : sert au compteur de sa case à cocher et au contenu de son groupe
function personnesDe(categorie: string): PersonneListee[] {
  return props.personnes.filter(p => p.categorie === categorie)
}

// Groupes de puces affichés : un seul groupe sans titre si aucune catégorie n'est fournie,
// sinon un groupe par catégorie cochée et non vide, avec la couleur de la catégorie
const groupes = computed<{ titre?: string, couleur: NuxtUiColor, personnes: PersonneListee[] }[]>(() => {
  if (!props.categories) return [{ couleur: props.color, personnes: props.personnes }]
  return props.categories
    .filter(c => !masquees.value.includes(c.label))
    .map(c => ({ titre: c.label, couleur: c.color ?? props.color, personnes: personnesDe(c.label) }))
    .filter(g => g.personnes.length > 0)
})

// Affiche-t-on la croix sur cette puce ? retirable vaut soit un booléen (même réponse pour toutes
// les puces), soit une fonction qui décide pour chaque personne (ex. selon les droits)
function estRetirable(personne: PersonneListee): boolean {
  return typeof props.retirable === 'function' ? props.retirable(personne) : props.retirable
}

// Texte de la puce selon la prop display : le mail, ou le prénom suivi du nom
function libellePuce(personne: PersonneListee): string {
  return props.display === 'mail' ? personne.mail : `${personne.prenom} ${personne.nom}`
}
</script>
