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

    <header class="mb-8">
      <h1 class="text-2xl font-bold text-highlighted">
        Ajouter une opportunité
      </h1>
      <p class="mt-1 text-sm text-muted">
        Renseignez le besoin, les conditions de la mission et les modalités de candidature.
      </p>
    </header>

    <UAlert
      v-if="erreurOptions"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Impossible de charger les listes de choix"
      description="Vérifiez la connexion à la base de données et rechargez la page."
      class="mb-5"
    />

    <UForm
      :state="form"
      class="space-y-5"
      @submit="creer"
    >
      <!-- Ce qu'est l'opportunité : d'où elle vient, quand et pour qui -->
      <CarteTitree
        icon="i-lucide-briefcase"
        title="Source et besoin"
      >
        <section :class="CLASSE_GRILLE">
          <UFormField
            label="Titre"
            name="titre"
            required
            class="md:col-span-2"
          >
            <UInput
              v-model="form.titre"
              placeholder="Ex. Migration de données"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Source du besoin"
            name="source"
          >
            <USelect
              v-model="form.source"
              :items="sources"
              placeholder="Sélectionner une source"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Date du signal"
            name="dateSignal"
            required
          >
            <UInput
              v-model="form.dateSignal"
              type="date"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Type de mission"
            name="typeMission"
          >
            <UInputMenu
              v-model="form.typeMission"
              v-model:search-term="recherches.typeMission"
              :items="typesMission"
              :create-item="creationProposee(recherches.typeMission, typesMission)"
              placeholder="Sélectionner ou saisir un type"
              class="w-full"
              @create="creerTypeMission"
            />
          </UFormField>

          <UFormField
            label="Niveau recherché"
            name="niveauRecherche"
          >
            <USelect
              v-model="form.niveauRecherche"
              :items="niveaux"
              placeholder="Sélectionner un niveau"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Température"
            name="temperature"
          >
            <USelect
              v-model="form.temperature"
              :items="temperatures"
              placeholder="Sélectionner une température"
              class="w-full"
            />
          </UFormField>

          <!-- Une entreprise saisie qui n'existe pas encore est créée à l'enregistrement : l'aide le signale -->
          <UFormField
            label="Client final"
            name="clientFinal"
            :help="clientFinalNouveau ? 'Nouvelle entreprise : elle sera ajoutée aux entreprises clientes.' : undefined"
          >
            <UInputMenu
              v-model="form.clientFinal"
              v-model:search-term="recherches.clientFinal"
              :items="entreprises"
              :create-item="creationProposee(recherches.clientFinal, entreprises)"
              placeholder="Rechercher ou saisir une entreprise"
              class="w-full"
              @create="creerClientFinal"
            />
          </UFormField>

          <!-- Client final inconnu : on décrit au moins son secteur et sa taille (la base refuse les deux à la fois) -->
          <template v-if="!form.clientFinal">
            <UFormField
              label="Secteur du client"
              name="clientFinalSecteur"
            >
              <UInput
                v-model="form.clientFinalSecteur"
                placeholder="Ex. Banque, industrie"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Taille du client"
              name="clientFinalTaille"
            >
              <UInput
                v-model="form.clientFinalTaille"
                placeholder="Ex. PME, grand compte"
                class="w-full"
              />
            </UFormField>
            <!-- Une seule aide pour les deux champs, sur toute la largeur, au style des aides de UFormField -->
            <p class="md:col-span-2 -mt-2 text-sm text-muted">
              {{ AIDE_CLIENT_INCONNU }}
            </p>
          </template>

          <UFormField
            label="Apporteur"
            name="apporteurId"
            required
          >
            <USelectMenu
              v-model="form.apporteurId"
              :items="membres"
              value-key="id"
              label-key="label"
              placeholder="Sélectionner un apporteur"
              :loading="chargementOptions"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Moteur"
            name="moteurId"
          >
            <USelectMenu
              v-model="form.moteurId"
              :items="membres"
              value-key="id"
              label-key="label"
              placeholder="Sélectionner un moteur"
              :loading="chargementOptions"
              clear
              class="w-full"
            />
          </UFormField>
        </section>
      </CarteTitree>

      <!-- Ce que demande la mission : technologies, rémunération, durée, lieu et urgence -->
      <CarteTitree
        icon="i-lucide-list-checks"
        title="Conditions de la mission"
      >
        <section :class="CLASSE_GRILLE">
          <UFormField
            label="Technologies"
            name="technologies"
            class="md:col-span-2"
          >
            <UInputMenu
              v-model="form.technologies"
              v-model:search-term="recherches.technologies"
              :items="technologiesDisponibles"
              multiple
              :create-item="creationProposee(recherches.technologies, technologiesDisponibles)"
              placeholder="Rechercher, choisir ou ajouter des technologies"
              class="w-full"
              @create="creerTechnologie"
            />
          </UFormField>

          <!-- Grisée tant qu'aucune technologie n'est choisie : l'aide dit pourquoi -->
          <UFormField
            label="Technologie principale"
            name="technologiePrincipale"
            :help="form.technologies.length === 0 ? 'Choisissez d\'abord des technologies.' : undefined"
          >
            <USelect
              v-model="form.technologiePrincipale"
              :items="form.technologies"
              placeholder="Sélectionner la technologie principale"
              :disabled="form.technologies.length === 0"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Timing"
            name="timing"
          >
            <USelect
              v-model="form.timing"
              :items="timings"
              placeholder="Sélectionner un timing"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="TJM annoncé (€)"
            name="tjmAnnonce"
          >
            <UInputNumber
              v-model="form.tjmAnnonce"
              :min="0"
              :step="10"
              placeholder="Ex. 550"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="TJM client (€)"
            name="tjmClient"
          >
            <UInputNumber
              v-model="form.tjmClient"
              :min="0"
              :step="10"
              placeholder="Ex. 700"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Durée annoncée (mois)"
            name="dureeAnnonceeMois"
          >
            <UInputNumber
              v-model="form.dureeAnnonceeMois"
              :min="0.5"
              :step="0.5"
              placeholder="Ex. 6"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Charge"
            name="charge"
          >
            <USelect
              v-model="form.charge"
              :items="charges"
              placeholder="Sélectionner une charge"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Ville"
            name="ville"
          >
            <UInput
              v-model="form.ville"
              placeholder="Ex. Paris"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Mode de travail"
            name="mode"
          >
            <USelect
              v-model="form.mode"
              :items="modes"
              placeholder="Sélectionner un mode"
              class="w-full"
            />
          </UFormField>
        </section>
      </CarteTitree>

      <CarteTitree
        icon="i-lucide-send"
        title="Candidature et diffusion"
      >
        <section :class="CLASSE_GRILLE">
          <UFormField
            label="Mode de candidature"
            name="modeCandidature"
          >
            <USelect
              v-model="form.modeCandidature"
              :items="modesCandidature"
              placeholder="Sélectionner un mode de candidature"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Précision du mode de candidature"
            name="modeCandidaturePrecision"
          >
            <UInput
              v-model="form.modeCandidaturePrecision"
              placeholder="Nom, mail ou canal de contact"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Niveau de diffusion"
            name="niveauDiffusion"
            class="md:col-span-2"
          >
            <URadioGroup
              v-model="form.niveauDiffusion"
              :items="niveauxDiffusion"
              orientation="vertical"
            />
          </UFormField>

          <!-- Une opportunité en interne strict ne s'ouvre jamais à l'extérieur (EF-10) : pas de lien d'annonce -->
          <UFormField
            v-if="form.niveauDiffusion !== 'interne_strict'"
            label="Lien de l'annonce extérieure"
            name="lienAnnonceExterieure"
            class="md:col-span-2"
          >
            <UInput
              v-model="form.lienAnnonceExterieure"
              type="url"
              placeholder="https://…"
              class="w-full"
            />
          </UFormField>
        </section>
      </CarteTitree>

      <footer class="flex items-center justify-end gap-3 pt-4">
        <UButton
          to="/opportunites"
          color="neutral"
          variant="ghost"
        >
          Annuler
        </UButton>
        <UButton
          type="submit"
          :loading="creation"
          icon="i-lucide-check"
        >
          Créer l'opportunité
        </UButton>
      </footer>
    </UForm>

    <!-- Après l'enregistrement : les entreprises et technologies créées à la volée, à compléter sur leur page
         (nouvel onglet, pour ne pas quitter le fil) ; fermer la fenêtre mène à la fiche de l'opportunité -->
    <UModal
      v-model:open="completionOuverte"
      title="Informations à compléter"
      description="L'opportunité est créée. Ces éléments viennent d'être ajoutés : complétez-les sur leur page."
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <ul class="space-y-2">
          <li
            v-for="lien in liensACompleter"
            :key="lien.to"
          >
            <ULink
              :to="lien.to"
              target="_blank"
              class="inline-flex items-center gap-1.5"
            >
              <UIcon
                name="i-lucide-external-link"
                class="size-4"
              />
              {{ lien.libelle }}
            </ULink>
          </li>
        </ul>
      </template>
      <template #footer>
        <UButton
          label="Voir l'opportunité"
          icon="i-lucide-arrow-right"
          @click="allerALOpportunite"
        />
      </template>
    </UModal>
  </UContainer>
</template>

<script setup lang="ts">
import type { ObjetCree } from '#shared/types/referentiels'

interface OptionsOpportunite {
  membres: { id: string, nom: string, prenom: string, mail: string }[]
  entreprises: string[]
  technologies: string[]
}

const router = useRouter()
const toast = useToast()
const { user } = useAuth()
const { data: options, pending: chargementOptions, error: erreurOptions } = await useFetch<OptionsOpportunite>('/api/opportunites/options', {
  default: () => ({ membres: [], entreprises: [], technologies: [] })
})

const form = reactive({
  titre: '',
  source: undefined as keyof typeof LIBELLES_SOURCE | undefined,
  typeMission: undefined as string | undefined,
  niveauRecherche: undefined as keyof typeof LIBELLES_NIVEAU | undefined,
  apporteurId: user.value?.id ?? '',
  moteurId: undefined as string | undefined,
  clientFinal: undefined as string | undefined,
  clientFinalSecteur: '',
  clientFinalTaille: '',
  tjmAnnonce: undefined as number | undefined,
  tjmClient: undefined as number | undefined,
  dureeAnnonceeMois: undefined as number | undefined,
  charge: undefined as string | undefined,
  timing: undefined as keyof typeof LIBELLES_TIMING | undefined,
  ville: '',
  mode: undefined as keyof typeof LIBELLES_MODE | undefined,
  temperature: undefined as keyof typeof LIBELLES_TEMPERATURE | undefined,
  modeCandidature: undefined as keyof typeof LIBELLES_MODE_CANDIDATURE | undefined,
  modeCandidaturePrecision: '',
  niveauDiffusion: 'reseau_perso' as keyof typeof LIBELLES_NIVEAU_DIFFUSION,
  lienAnnonceExterieure: '',
  dateSignal: new Date().toISOString().slice(0, 10),
  technologies: [] as string[],
  technologiePrincipale: undefined as string | undefined
})

const membres = computed(() => (options.value?.membres ?? []).map(m => ({
  ...m,
  label: `${m.prenom} ${m.nom} (${m.mail})`
})))
// Valeurs saisies dans le formulaire qui n'existaient pas encore (créées à l'enregistrement)
const saisies = reactive({ entreprises: [] as string[], typesMission: [] as string[], technologies: [] as string[] })

const entreprises = computed(() => [...(options.value?.entreprises ?? []), ...saisies.entreprises])
const technologiesDisponibles = computed(() => [...(options.value?.technologies ?? []), ...saisies.technologies])

// Client final choisi qui n'est pas encore une entreprise cliente de la base
const clientFinalNouveau = computed(() => Boolean(form.clientFinal && saisies.entreprises.includes(form.clientFinal)))

// Grille à deux colonnes des trois cartes du formulaire
const CLASSE_GRILLE = 'grid grid-cols-1 md:grid-cols-2 gap-4'

// Aide affichée sous le secteur et la taille (une fois pour les deux), qui ne servent que sans client final
const AIDE_CLIENT_INCONNU = 'À renseigner si le client final n\'est pas connu.'

// Options des listes déroulantes, déduites des codes partagés avec le serveur (shared/utils/opportunites.ts)
const sources = optionsDe(LIBELLES_SOURCE)
const niveaux = optionsDe(LIBELLES_NIVEAU)
const modes = optionsDe(LIBELLES_MODE)
const temperatures = optionsDe(LIBELLES_TEMPERATURE)
const timings = optionsDe(LIBELLES_TIMING)
const modesCandidature = optionsDe(LIBELLES_MODE_CANDIDATURE)

// Explication de chaque niveau de diffusion, affichée sous son libellé
const DESCRIPTIONS_DIFFUSION: Record<keyof typeof LIBELLES_NIVEAU_DIFFUSION, string> = {
  libre: 'Le relais public de l\'opportunité est autorisé.',
  reseau_perso: 'Partage de personne à personne, choix recommandé.',
  interne_strict: 'Réservé aux membres du collectif.'
}
const niveauxDiffusion = optionsDe(LIBELLES_NIVEAU_DIFFUSION).map(option => ({
  ...option,
  description: DESCRIPTIONS_DIFFUSION[option.value]
}))

// Listes ouvertes (non contraintes en base) : de simples propositions
const typesMission = computed(() => ['Run', 'Build', 'Expertise', ...saisies.typesMission])
const charges = ['Temps plein', '3-4 jours par semaine', '1-2 jours par semaine']

// Texte tapé dans la recherche de chaque liste ouverte à la saisie
const recherches = reactive({ typeMission: '', clientFinal: '', technologies: '' })

// « Créer … » n'est proposé que pour une valeur absente de la liste, sans tenir compte de la casse
// (la base refuse les doublons de nom à la casse près) ; 'always' le propose même si la recherche
// trouve des valeurs proches (« SQL » alors que « SQL Server » existe)
function creationProposee(recherche: string, existantes: string[]) {
  const valeur = recherche.trim().toLowerCase()
  return Boolean(valeur) && !existantes.some(v => v.toLowerCase() === valeur) ? 'always' : false
}

// « Créer … » dans un UInputMenu émet seulement l'événement create, sans sélectionner la valeur :
// on l'ajoute à sa liste puis on la sélectionne. Une valeur déjà présente, à la casse près, est
// reprise telle quelle (la base refuse les doublons de nom sans tenir compte de la casse).
function ajouterSaisie(ajoutees: string[], existantes: string[], saisie: string): string | undefined {
  const valeur = saisie.trim()
  if (!valeur) return undefined
  const existante = existantes.find(v => v.toLowerCase() === valeur.toLowerCase())
  if (existante) return existante
  ajoutees.push(valeur)
  return valeur
}

function creerClientFinal(nom: string) {
  form.clientFinal = ajouterSaisie(saisies.entreprises, entreprises.value, nom)
}

function creerTypeMission(type: string) {
  form.typeMission = ajouterSaisie(saisies.typesMission, typesMission.value, type)
}

function creerTechnologie(nom: string) {
  const technologie = ajouterSaisie(saisies.technologies, technologiesDisponibles.value, nom)
  if (technologie && !form.technologies.includes(technologie)) form.technologies.push(technologie)
  // La sélection multiple reste ouverte : on vide la recherche pour taper la technologie suivante
  recherches.technologies = ''
}

const creation = ref(false)

// Opportunité enregistrée, et liens vers les objets créés à compléter (fenêtre ouverte s'il y en a)
const idOpportunite = ref<string>()
const liensACompleter = ref<{ libelle: string, to: string }[]>([])

const completionOuverte = computed({
  get: () => liensACompleter.value.length > 0,
  // Fermer la fenêtre (Échap, clic à côté) mène aussi à la fiche de l'opportunité
  set: (ouverte) => {
    if (!ouverte) allerALOpportunite()
  }
})

function allerALOpportunite() {
  return router.push(`/opportunites/${idOpportunite.value}`)
}

// Un lien par entreprise et par technologie créées, vers la page qui permet de les compléter
function liensVers(objetsCrees: { entreprises: ObjetCree[], technologies: ObjetCree[] }) {
  return [
    ...objetsCrees.entreprises.map(e => ({
      libelle: `Compléter l'entreprise « ${e.nom} » (secteur, taille, ville)`,
      to: `/entreprises/${e.id}`
    })),
    ...objetsCrees.technologies.map(t => ({
      libelle: `Rattacher la technologie « ${t.nom} » à sa famille`,
      to: `/technologies/${t.id}`
    }))
  ]
}

watch(() => form.technologies, (selection) => {
  if (form.technologiePrincipale && !selection.includes(form.technologiePrincipale)) {
    form.technologiePrincipale = undefined
  }
}, { deep: true })

watch(entreprises, (liste) => {
  if (form.clientFinal && !liste.includes(form.clientFinal)) {
    form.clientFinal = undefined
  }
})

// Le champ du lien disparaît en interne strict : on vide aussi sa valeur, pour ne pas l'envoyer
watch(() => form.niveauDiffusion, (niveau) => {
  if (niveau === 'interne_strict') form.lienAnnonceExterieure = ''
})

async function creer() {
  if (!form.titre.trim()) {
    toast.add({ title: 'Le titre est obligatoire.', color: 'error' })
    return
  }
  if (!form.apporteurId) {
    toast.add({ title: 'Sélectionnez un apporteur.', color: 'error' })
    return
  }

  creation.value = true
  try {
    const resultat = await $fetch<{ id: string, objetsCrees: { entreprises: ObjetCree[], technologies: ObjetCree[] } }>('/api/opportunites', {
      method: 'POST',
      body: {
        ...form,
        clientFinal: form.clientFinal?.trim() || undefined,
        clientFinalSecteur: form.clientFinalSecteur.trim() || undefined,
        clientFinalTaille: form.clientFinalTaille.trim() || undefined,
        typeMission: form.typeMission?.trim() || undefined,
        modeCandidaturePrecision: form.modeCandidaturePrecision.trim() || undefined,
        lienAnnonceExterieure: form.lienAnnonceExterieure.trim() || undefined
      }
    })
    toast.add({ title: 'Opportunité créée avec succès', color: 'success' })
    idOpportunite.value = resultat.id
    // Rien de nouveau à compléter : on va directement à la fiche ; sinon la fenêtre s'ouvre
    const liens = liensVers(resultat.objetsCrees)
    if (liens.length) liensACompleter.value = liens
    else await allerALOpportunite()
  } catch (error) {
    const message = (error as { data?: { statusMessage?: string } }).data?.statusMessage
    toast.add({ title: 'Création impossible', description: message, color: 'error' })
  } finally {
    creation.value = false
  }
}
</script>
