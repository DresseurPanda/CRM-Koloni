<!--
  Fiche d'une opportunité, en lecture : résumé, conditions, technologies, contacts,
  positionnements, notes et fil (historique des statuts et journal d'actions réunis)
-->
<template>
  <UContainer class="py-8 max-w-4xl">
    <div class="mb-4">
      <UButton
        label="Retour aux opportunités"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        to="/opportunites"
      />
    </div>

    <template v-if="opportunite">
      <header class="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-highlighted">
            {{ opportunite.titre }}
          </h1>
          <p class="mt-1 text-sm text-muted">
            Signalée le {{ formaterDate(opportunite.dateSignal) }} par {{ opportunite.apporteur }}
          </p>
        </div>
        <UBadge
          :color="STATUTS_OPPORTUNITE[opportunite.statut]?.couleur"
          variant="solid"
          size="lg"
        >
          {{ opportunite.statut }}
        </UBadge>
      </header>

      <div class="space-y-5">
        <!-- Résumé et conditions : une liste de champs chacune (voir resume et conditions) -->
        <CarteTitree
          v-for="bloc in blocs"
          :key="bloc.titre"
          :icon="bloc.icone"
          :title="bloc.titre"
        >
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div
              v-for="champ in bloc.champs"
              :key="champ.label"
            >
              <dt class="text-sm text-muted">
                {{ champ.label }}
              </dt>
              <dd class="font-medium text-highlighted wrap-break-word">
                <ULink
                  v-if="champ.lien && champ.valeur"
                  :to="champ.valeur"
                  target="_blank"
                >
                  {{ champ.valeur }}
                </ULink>
                <template v-else>
                  {{ champ.valeur || 'Non renseigné' }}
                </template>
              </dd>
            </div>
          </dl>
        </CarteTitree>

        <CarteTitree
          icon="i-lucide-code"
          title="Technologies"
        >
          <!-- La technologie principale arrive en premier (tri de la route), en badge plein -->
          <div
            v-if="opportunite.technologies.length"
            class="flex flex-wrap gap-2"
          >
            <UBadge
              v-for="techno in opportunite.technologies"
              :key="techno.nom"
              :variant="techno.principale ? 'solid' : 'soft'"
              :label="techno.principale ? `${techno.nom} (principale)` : techno.nom"
            />
          </div>
          <p
            v-else
            :class="CLASSE_MESSAGE_VIDE"
          >
            Aucune technologie renseignée.
          </p>
        </CarteTitree>

        <CarteTitree
          icon="i-lucide-contact"
          title="Contacts clients"
        >
          <ul
            v-if="opportunite.contacts.length"
            class="divide-y divide-default"
          >
            <!-- Un contact par ligne : nom et lien vers sa fiche, poste et entreprise, moyens de contact -->
            <li
              v-for="contact in opportunite.contacts"
              :key="contact.id"
              class="py-2 first:pt-0 last:pb-0"
            >
              <ULink
                :to="`/contacts/${contact.id}`"
                class="font-medium"
              >
                {{ contact.prenom }} {{ contact.nom }}
              </ULink>
              <p class="text-sm text-muted">
                {{ [contact.role, contact.entreprise].filter(Boolean).join(' — ') }}
              </p>
              <p class="text-sm text-toned">
                {{ [contact.mail, contact.telephone].filter(Boolean).join(' · ') }}
              </p>
            </li>
          </ul>
          <p
            v-else
            :class="CLASSE_MESSAGE_VIDE"
          >
            Aucun contact rattaché.
          </p>
        </CarteTitree>

        <CarteTitree
          icon="i-lucide-users"
          title="Positionnements"
        >
          <div class="space-y-4">
            <!-- Boutons d'action : Se positionner / Se désister -->
            <div class="flex gap-2">
              <UButton
                v-if="!estPositionne"
                label="Se positionner"
                color="primary"
                icon="i-lucide-user-plus"
                :loading="chargementPositionnement"
                @click="sePositionner"
              />
              <UButton
                v-else
                label="Se désister"
                color="neutral"
                variant="outline"
                icon="i-lucide-user-minus"
                :loading="chargementPositionnement"
                @click="seDesister"
              />
            </div>

            <ListePersonnes
              :personnes="personnesPositionnees"
              label="Membres positionnés"
              :categories="ETATS_POSITIONNEMENT"
              :categories-masquees="['Écarté', 'Retiré']"
            />
            <p
              v-if="!opportunite.positionnements.length"
              :class="CLASSE_MESSAGE_VIDE"
            >
              Aucun membre positionné.
            </p>
          </div>
        </CarteTitree>

        <CarteTitree
          icon="i-lucide-notebook-pen"
          title="Notes"
        >
          <ul
            v-if="opportunite.notes.length"
            class="space-y-4"
          >
            <!-- Une note par ligne, de la plus récente à la plus ancienne : auteur, date, contenu -->
            <li
              v-for="note in opportunite.notes"
              :key="note.id"
            >
              <p class="text-sm text-muted">
                {{ note.auteur }}, le {{ formaterDate(note.date) }}
              </p>
              <p class="whitespace-pre-line text-default">
                {{ note.contenu }}
              </p>
            </li>
          </ul>
          <p
            v-else
            :class="CLASSE_MESSAGE_VIDE"
          >
            Aucune note.
          </p>
        </CarteTitree>

        <CarteTitree
          icon="i-lucide-history"
          title="Fil de l'opportunité"
        >
          <UTimeline
            v-if="evenements.length"
            :items="evenements"
            size="xs"
          />
          <p
            v-else
            :class="CLASSE_MESSAGE_VIDE"
          >
            Aucun événement.
          </p>
        </CarteTitree>
      </div>
    </template>

    <UAlert
      v-else
      color="neutral"
      variant="subtle"
      icon="i-lucide-circle-help"
      title="Opportunité introuvable"
    />
  </UContainer>
</template>

<script setup lang="ts">
import type { TimelineItem } from '@nuxt/ui'

const route = useRoute()

const { data: opportunite } = await useFetch<OpportuniteDetail | null>(
  () => `/api/opportunites/${route.params.id}`,
  { default: () => null }
)

// Style des messages affichés quand une section est vide (« Aucune note. »…)
const CLASSE_MESSAGE_VIDE = 'text-sm text-muted'

// Montant en euros, ou rien si non renseigné
const euros = (montant?: number) => (montant === undefined ? undefined : `${montant} €`)

// Blocs de champs affichés en grille : le résumé, puis les conditions de la mission
const blocs = computed(() => {
  const o = opportunite.value
  if (!o) return []
  return [
    {
      titre: 'Résumé',
      icone: 'i-lucide-briefcase',
      champs: [
        { label: 'Source', valeur: o.source },
        { label: 'Type de mission', valeur: o.typeMission },
        { label: 'Niveau recherché', valeur: o.niveauRecherche },
        { label: 'Température', valeur: o.temperature },
        o.clientFinal
          ? { label: 'Client final', valeur: o.clientFinal }
          : { label: 'Client final (inconnu)', valeur: [o.clientFinalSecteur, o.clientFinalTaille].filter(Boolean).join(', ') },
        { label: 'Apporteur', valeur: o.apporteur },
        ...(o.saisiPar ? [{ label: 'Saisie par', valeur: o.saisiPar }] : []),
        { label: 'Moteur', valeur: o.moteur },
        {
          label: 'Qualification',
          valeur: o.qualifieePar ? `${o.qualifieePar}, le ${formaterDate(o.dateQualification)}` : 'Pas encore qualifiée'
        },
        { label: 'Ouverture à l\'extérieur', valeur: o.dateOuvertureExterieur ? `À partir du ${formaterDate(o.dateOuvertureExterieur)}` : 'Sans objet' },
        ...(o.dateRelance ? [{ label: 'Date de relance', valeur: formaterDate(o.dateRelance) }] : []),
        ...(o.raisonPerte ? [{ label: 'Raison de la perte', valeur: o.raisonPerte }] : []),
        ...(o.preneur ? [{ label: 'Preneur', valeur: o.preneur }] : []),
        ...(o.tjmPreneur !== undefined ? [{ label: 'TJM preneur', valeur: euros(o.tjmPreneur) }] : []),
        ...(o.nombreJours !== undefined ? [{ label: 'Nombre de jours', valeur: String(o.nombreJours) }] : []),
        ...(o.dateCloture ? [{ label: 'Date de clôture', valeur: formaterDate(o.dateCloture) }] : [])
      ]
    },
    {
      titre: 'Conditions de la mission',
      icone: 'i-lucide-list-checks',
      champs: [
        { label: 'TJM annoncé', valeur: euros(o.tjmAnnonce) },
        { label: 'TJM client', valeur: euros(o.tjmClient) },
        { label: 'Durée annoncée', valeur: o.dureeAnnonceeMois === undefined ? undefined : `${o.dureeAnnonceeMois} mois` },
        { label: 'Charge', valeur: o.charge },
        { label: 'Ville', valeur: o.ville },
        { label: 'Mode de travail', valeur: o.mode },
        { label: 'Timing', valeur: o.timing },
        { label: 'Mode de candidature', valeur: [o.modeCandidature, o.modeCandidaturePrecision].filter(Boolean).join(' — ') },
        { label: 'Niveau de diffusion', valeur: o.niveauDiffusion },
        { label: 'Lien de l\'annonce extérieure', valeur: o.lienAnnonceExterieure, lien: true }
      ]
    }
  ]
})

// Positionnements au format de ListePersonnes : l'état sert de catégorie
const personnesPositionnees = computed<PersonneListee[]>(() =>
  (opportunite.value?.positionnements ?? []).map(p => ({
    id: p.membreId,
    nom: p.nom,
    prenom: p.prenom,
    mail: p.mail,
    categorie: p.etat
  }))
)

// Fil au format de UTimeline : un changement de statut se distingue par son icône
const evenements = computed<TimelineItem[]>(() =>
  (opportunite.value?.fil ?? []).map(e => ({
    date: `${formaterDate(e.date)} — ${e.auteur}`,
    title: e.titre,
    description: e.detail,
    icon: e.titre.startsWith('Statut') || e.titre.startsWith('Opportunité publiée') ? 'i-lucide-flag' : 'i-lucide-activity'
  }))
)

// Récupérer la session utilisateur actuelle
const { data: session } = await useFetch('/api/auth/session')

const chargementPositionnement = ref(false)

// Vérifie si le membre connecté est déjà positionné sur cette opportunité
const estPositionne = computed(() => {
  if (!opportunite.value || !session.value?.user?.id) return false
  return opportunite.value.positionnements.some(
    p => p.membreId === session.value.user.id && p.etatCode !== 'retire'
  )
})

async function sePositionner() {
  chargementPositionnement.value = true
  try {
    await $fetch(`/api/opportunites/${route.params.id}/positionnement`, {
      method: 'POST'
    })
    await refreshNuxtData()
  } finally {
    chargementPositionnement.value = false
  }
}

async function seDesister() {
  chargementPositionnement.value = true
  try {
    await $fetch(`/api/opportunites/${route.params.id}/positionnement`, {
      method: 'DELETE'
    })
    await refreshNuxtData()
  } finally {
    chargementPositionnement.value = false
  }
}
</script>