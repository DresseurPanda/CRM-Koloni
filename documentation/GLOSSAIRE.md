# Glossaire du schéma KOLONI

Documentation du schéma, créé par les scripts `001` à `005` du dossier
`bdd/postgre/`. Le schéma est aussi commenté en base (`COMMENT ON` sur les
tables et les colonnes) : ce glossaire reprend et complète ces explications.

Base cible : PostgreSQL 14+.

Références :

- Recueil de besoins v0.2/v0.3, section 3.3 (données à enregistrer)
- Cahier des charges v0.1, sections 3.1 à 3.6, 4 (ENF-05/08/09/11), 7.1

## Principes structurants du script

- Aucune suppression physique des opportunités, ni de leurs traces
  (EF-09 / ENF-08) : toutes les clés étrangères vers des tables « de
  trace » (`positionnement`, `note`, `historique_statut`,
  `journal_action`) sont déclarées en `ON DELETE RESTRICT`, jamais en
  `CASCADE`.
- Désactivation d'un membre = drapeau `actif`, jamais de suppression de
  ligne (EF-02).
- Contraintes portées par la base (`CHECK`, `NOT NULL`) plutôt que par
  la seule interface, pour rester valables aussi pour les écritures d'un
  agent IA hors interface (ENF-05).
- Schéma volontairement simple : seules les 11 entités du recueil, leurs
  tables de liaison n-n, et les contraintes explicitement demandées par
  le CDC sont modélisées. Pas de table ni de mécanisme technique
  supplémentaire (ex. pas de table de suivi des migrations en base : le
  versionnement (CDC 7.1) repose sur les fichiers `.sql` numérotés du
  dossier `bdd/postgre/`, appliqués dans l'ordre).

## Plan du schéma (dans l'ordre de création)

Cinq scripts, exécutés dans l'ordre : `001_tables_de_base.sql` (tables 1 à 6),
`002_opportunites.sql` (tables 7 à 10), `003_historique_et_journal.sql`
(tables 11 et 12), `004_vues.sql` (vues) et `005_triggers.sql` (fonctions et
triggers). Viennent ensuite les données de test (`006_donnees_test.sql`) et
le rôle de l'application (`007_roles.sql`).

1. `membre` — profil utilisateur du collectif
2. `famille_technologie` — familles de technologies (le « domaine » du filtre)
3. `technologie` — liste de référence partagée
4. `entreprise_cliente` — sociétés (ESN ou client direct)
5. `contact` — interlocuteur chez le client, lié à une entreprise
6. `profil_exterieur` — profil contacté hors collectif
7. `opportunite` — cœur du modèle, avec ses index de recherche/filtre
8. Tables de liaison n-n : `opportunite_technologie`,
   `profil_exterieur_technologie`, `profil_exterieur_opportunite`,
   `opportunite_contact`
9. `positionnement` — intérêt d'un membre sur une opportunité
10. `note` — fil de notes sur une opportunité
11. `historique_statut` — traçabilité datée des changements de statut
12. `journal_action` — qui a fait quoi, y compris hors interface

---

## membre

Compte utilisateur du collectif Koloni : freelance ou administrateur
(cellule commerce). Un même membre peut être administrateur et, sur ses
propres opportunités, apporteur ou moteur.

| Colonne | Explication |
| --- | --- |
| `role` | `administrateur` (droits étendus sur tout) ou `membre`. Ne préjuge pas des rôles « apporteur »/« moteur », portés par opportunité. |
| `disponibilite` | `inconnu` (valeur d'un compte neuf, rien déclaré), `en_recherche`, `a_l_ecoute` (en mission mais ouvert à une proposition) ou `en_mission` ; sert de signal de visibilité aux autres membres. |
| `date_disponibilite` | Fin de mission (`en_mission`) ou date de disponibilité (`a_l_ecoute`). Uniquement pour ces deux états (contrainte `chk_membre_date_disponibilite`). |
| `dispo_confirmee_le` | Date de la dernière déclaration de disponibilité, enregistrée par l'application. Vide = jamais déclarée. |
| `actif` | `FALSE` = compte désactivé. Ne supprime jamais la ligne : les traces (positionnements, notes, journal) restent visibles (EF-02). |
| `ville` | Champ texte unique ; `chk_membre_ville_format` rejette une chaîne vide ou faite uniquement d'espaces, comme validation a minima demandée par le recueil. |

## famille_technologie

Famille de technologies (ETL, BI, Data warehouse…) : c'est le « domaine »
du filtre des opportunités (EF-12). Liste de référence partagée par les
technologies. Le nom est unique quelle que soit la casse et les espaces
autour (`uq_famille_technologie_nom_minuscule`) : « BI » et « bi » sont la
même famille. Renommer une famille se fait en une seule ligne.

## technologie

Liste de référence des technologies (ex. Talend, Power BI, Python),
réutilisée par `opportunite` et `profil_exterieur`, et servant aux
filtres. Le nom est unique quelle que soit la casse et les espaces autour
(`uq_technologie_nom_minuscule`) : « Python » et « python » sont la même
technologie.

| Colonne | Explication |
| --- | --- |
| `famille_id` | Famille de la technologie (`famille_technologie`), utilisée pour filtrer les opportunités par domaine. Une seule famille par technologie, facultative. |

## entreprise_cliente

Société (ESN ou client direct) réutilisable d'une opportunité à l'autre.
Sert notamment au filtre « société du contact ». Distincte du client
final d'une opportunité (cf. `opportunite.client_final_id`), qui peut
être inconnu et se choisit parmi ces entreprises. Le nom est unique quelle
que soit la casse et les espaces autour (`uq_entreprise_cliente_nom_minuscule`).

## contact

Interlocuteur chez le client. Peut être lié à plusieurs opportunités dans
le temps (cf. `opportunite_contact`). Modifiable par tout membre (droits
ouverts par défaut — cf. question 1 du client, section 12 du recueil).
Un même lien LinkedIn ne peut désigner qu'un seul contact, quelle que soit
la casse (`uq_contact_linkedin_minuscule`) ; plusieurs contacts sans lien
restent possibles.

## profil_exterieur

Profil contacté hors collectif, saisi sous forme de fiche technique
structurée par celui qui l'a contacté (généralement le moteur). Entité
distincte du contact client. Pas de CV ni pièce jointe (V0).

| Colonne | Explication |
| --- | --- |
| `auteur_id` | Membre (humain ou agent IA sous compte identifié) ayant enregistré la fiche du profil. La date et l'issue d'une sollicitation ne sont plus sur le profil : elles sont dans `profil_exterieur_opportunite`, une ligne par opportunité. |
| `membre_id` | Compte membre de cette personne, renseigné le jour où le profil adhère au collectif ; vide sinon. Un membre ne correspond qu'à un seul profil. Le lien est posé par une personne, jamais déduit du nom : deux homonymes restent deux lignes tant qu'on ne les relie pas. |

La vue `consultant` donne une seule liste de personnes sans fusionner les
tables : elle réunit les membres (`origine = 'membre'`) et les profils extérieurs
qui ne sont pas reliés à un compte (`origine = 'exterieur'`). Les
identifiants viennent de deux tables, une personne se reconnaît donc par le
couple (`origine`, `id`). La disponibilité d'un membre est un état, celle
d'un profil extérieur reste un texte libre.

## opportunite

Opportunité commerciale, du signal détecté à sa clôture (signature ou
perte). Ne fait jamais l'objet d'une suppression physique, y compris
signée ou perdue (EF-09 / ENF-08). Une opportunité signée reste une
opportunité au statut Signé : pas d'objet Mission distinct.

| Colonne | Explication |
| --- | --- |
| `apporteur_id` | Membre qui amène l'opportunité. |
| `saisi_par_id` | Membre qui a créé la fiche, si différent de l'apporteur. |
| `moteur_id` | Membre qui recherche un profil hors collectif, le cas échéant. |
| `preneur_membre_id` / `preneur_profil_exterieur_id` | Freelance retenu : membre du collectif OU profil extérieur, jamais les deux (`chk_opp_preneur_exclusif`). Renseigné à la clôture. |
| `client_final_id` | Entreprise où se déroule la mission, choisie parmi les entreprises clientes (`entreprise_cliente`). Facultatif, souvent inconnu (besoin passant par une ESN) : ne bloque jamais la publication (EF-04). Distinct de la société du contact (liée via `contact`). `client_final_secteur` et `client_final_taille` ne servent que quand l'entreprise n'est pas connue : dès qu'elle est liée, ils doivent rester vides (`chk_opp_client_final_inconnu`) et le secteur comme la taille viennent de l'entreprise. |
| `niveau_diffusion` | `libre`, `reseau_perso` (par défaut, EF-10) ou `interne_strict`. |
| `lien_annonce_exterieure` | Lien du post qui ouvre l'opportunité à l'extérieur du collectif. Facultatif, doit commencer par `https://` (`chk_opp_lien_annonce`). |
| `statut` | Un des 7 statuts. Transitions libres (saut, retour arrière, réouverture) : aucune contrainte de séquence en base, seul `historique_statut` journalise les changements. |
| `raison_perte` | Obligatoire et non vide dès que `statut = perdu` (`chk_opp_raison_perte_obligatoire`). |
| `date_relance` | Obligatoire dès que `statut = en_pause` (`chk_opp_date_relance_obligatoire`). |
| `qualifiee_par_id` / `date_qualification` | Validation explicite de la qualification Signal → Matching. Renseignées ensemble (`chk_opp_qualification_complete`) et obligatoires au-delà de Signal, sauf `perdu` et `en_pause` qui restent possibles avant qualification (`chk_opp_qualifiee`). Le qualificateur est l'apporteur de l'opportunité ou un administrateur actif (trigger `trg_opportunite_verifie_qualificateur`). |

La vue `opportunite_ouverture` donne la date à partir de laquelle une
opportunité peut s'ouvrir hors du collectif : date de qualification (lue à
l'heure de Paris) + 2 jours calendaires, délai encore en cours de rédaction
chez le client. Rien n'est stocké. Elle ne contient ni les opportunités en
`interne_strict`, qui ne s'ouvrent jamais à l'extérieur, ni celles qui ne
sont pas encore qualifiées.

Index posés uniquement sur les critères de filtre listés section 3.1 du
recueil : `statut`, `ville`, `mode`, `client_final_id`, `date_signal`,
et un index partiel sur `date_relance` pour la vue « en pause à
relancer ». Le filtre par technologie s'appuie sur la table de liaison
`opportunite_technologie`. Le filtre par société du contact s'appuie sur
l'index de `contact.entreprise_cliente_id`.

## opportunite_technologie

Technologies demandées par une opportunité. `est_principale` distingue
la technologie principale des technologies en bonus (au plus une
principale par opportunité, via `uq_opp_tech_une_principale`).

## profil_exterieur_technologie

Technologies maîtrisées par un profil contacté hors collectif.

## profil_exterieur_opportunite

Sollicitation d'un profil extérieur pour une opportunité. Un même profil
peut être sollicité sur plusieurs opportunités, chacune avec sa propre
issue : l'issue d'une sollicitation n'écrase donc plus celle d'une autre.

| Colonne | Explication |
| --- | --- |
| `sollicite_par_id` | Membre qui a sollicité le profil pour cette opportunité (le moteur en général). |
| `date_sollicitation` | Date du contact avec le profil pour cette opportunité. |
| `issue` | Résultat de cette sollicitation : `presente`, `retenu`, `ecarte_client`, `indisponible`, `sans_reponse_profil` ou `sans_retour_client` (`chk_pext_opp_issue`). Vide tant qu'elle est en cours. |

Un preneur extérieur (`opportunite.preneur_profil_exterieur_id`) doit avoir
été sollicité sur cette opportunité : clé étrangère composite
`fk_opp_preneur_sollicite`, contrôlée en fin de transaction
(`DEFERRABLE INITIALLY DEFERRED`), car la sollicitation exige l'opportunité
et l'opportunité exigerait la sollicitation. La vue
`profil_exterieur_derniere_sollicitation` donne, par profil, la dernière
fois où on a fait appel à lui.

## opportunite_contact

Contacts rattachés à une opportunité. Un même contact peut être lié à
plusieurs opportunités au fil du temps.

## positionnement

Intérêt signalé par un membre sur une opportunité. Ne réserve rien :
plusieurs membres peuvent être positionnés sur la même opportunité. Le
passage à `presente` relève de l'apporteur ou du moteur ; le membre
`retenu` devient le preneur.

| Colonne | Explication |
| --- | --- |
| `etat` | `positionne` (candidat) / `presente` (au client) / `retenu` / `ecarte` / `retire` (le membre s'est désisté). Un seul positionnement `retenu` par opportunité (`uq_positionnement_un_retenu`) : pour changer de retenu, écarter l'ancien puis retenir le nouveau, en deux instructions. |

## note

Note libre sur une opportunité. Tout membre peut en écrire une,
positionné ou non ; lisible par tous.

## historique_statut

Liste datée et signée des changements de statut d'une opportunité
(EF-07/EF-08). `ancien_statut` est `NULL` pour l'entrée initiale
(Signal). Alimentée automatiquement par un trigger à chaque changement de
`opportunite.statut`, sous l'auteur posé par `SET LOCAL app.current_membre_id`.

| Colonne | Explication |
| --- | --- |
| `motif` | Raison de la perte saisie à ce changement, uniquement pour un passage en `perdu`. |
| `date_relance` | Date de relance saisie à ce changement, uniquement pour un passage en `en_pause`. |

Rouvrir puis reperdre une opportunité écrase `opportunite.raison_perte`, et
sortir d'une pause efface `opportunite.date_relance` : chaque motif et chaque
date de relance restent ici, sur la ligne du changement qui les a posés.

## journal_action

Journal de ce que chacun a fait : qui, quoi, quand, et sur quel objet.
Couvre aussi les écritures faites hors interface : tout auteur, humain ou
agent IA, écrit sous un compte identifié (ENF-05). Les changements de
statut n'y figurent pas : `historique_statut` les journalise déjà.

| Colonne | Explication |
| --- | --- |
| `opportunite_id` | Opportunité concernée. Obligatoire pour un positionnement, une présentation de profil et une note. Facultative pour les actions sur un contact, une entreprise ou un profil extérieur, qui peuvent ne se rapporter à aucune opportunité. |
| `contact_id` / `entreprise_cliente_id` / `profil_exterieur_id` | Objet touché par l'action. Chaque type d'action exige le sien (`chk_journal_cible`) : une ligne « contact créé ou modifié » dit de quel contact il s'agit. |
| `type_action` | `positionnement`, `presentation_profil`, `note`, `profil_exterieur_contacte`, `profil_exterieur_modifie`, `contact_cree_modifie` ou `entreprise_cree_modifiee`. |

Le journal se remplit tout seul, par des triggers : l'application n'a pas
à l'écrire, et une écriture SQL directe (script, agent IA) y laisse
aussi sa trace.

| Événement | Type d'action |
| --- | --- |
| Positionnement ajouté, ou changement de son état | `positionnement` (`presentation_profil` si l'état devient « présenté ») |
| Note ajoutée | `note` |
| Profil extérieur sollicité pour une opportunité | `profil_exterieur_contacte` |
| Fiche d'un profil extérieur modifiée | `profil_exterieur_modifie` |
| Contact créé ou modifié, rattaché à une opportunité ou retiré d'une opportunité | `contact_cree_modifie` |
| Entreprise cliente créée ou modifiée | `entreprise_cree_modifiee` |

L'auteur est le membre posé par `SET LOCAL app.current_membre_id` dans la
transaction. Pour une note, un positionnement ou une sollicitation, la
ligne porte déjà son auteur, qui sert de repli. Pour un contact, une
entreprise ou un profil extérieur, rien n'en porte : l'écriture est
refusée si l'auteur manque. Une modification qui ne change aucune valeur
n'est pas journalisée.

---

## Vues de lecture

Quatre vues donnent une ligne prête à lire, pour que l'application n'ait ni
jointure ni sous-requête à écrire : elle sélectionne dans la vue et ajoute
son tri (l'ordre d'une vue n'est pas garanti). Elles gardent les codes tels
que stockés ; la traduction en libellés reste du côté de l'application.

| Vue | Contenu |
| --- | --- |
| `opportunite_resume` | Une ligne par opportunité : technologies (la principale d'abord), client final, apporteur sous la forme « Prénom N. », statut, mode, température, date du signal, diffusion, lien d'annonce, date de qualification et date d'ouverture à l'extérieur. |
| `contact_resume` | Une ligne par contact client, avec le nom de son entreprise. |
| `profil_exterieur_resume` | Une ligne par profil extérieur : technologies par ordre alphabétique, date et issue de sa dernière sollicitation. |
| `membre_resume` | Les comptes sans l'empreinte du mot de passe, que seule la connexion lit. |

---

## Ce que ce script ne fait pas (volontairement)

- Pas de table de suivi des migrations en base : la table `migrations`
  aurait été une commodité, pas une exigence du recueil ; le
  versionnement du schéma (CDC 7.1) est assuré par les fichiers `.sql`
  numérotés eux-mêmes.
- Pas de trigger de mise à jour automatique d'un champ « dernière
  modification » sur `opportunite` : non demandé, l'horodatage exigé
  porte spécifiquement sur les changements de statut (`historique_statut`).
- Les tables et les colonnes sont commentées en base (`COMMENT ON`), pour
  rester lisibles par un agent IA qui lit le schéma directement (ENF-05).
