# Recueil de Besoins

## _Gestion de la Relation Client_

**Projet KOLONI — CRM interne**
Version 0.5 — Document de travail

---

## Table des matières

1. [Contexte](#1-contexte)
   - 1.1 [Présentation de l'organisation](#11-présentation-de-lorganisation)
   - 1.2 [Rôle dans le projet](#12-rôle-dans-le-projet)
   - 1.3 [Utilisateurs finaux](#13-utilisateurs-finaux)
   - 1.4 [Origine et problématique](#14-origine-et-problématique)
   - 1.5 [Solution proposée](#15-solution-proposée)
2. [Comprendre l'existant](#2-comprendre-lexistant)
   - 2.1 [Solution actuelle](#21-solution-actuelle)
   - 2.2 [Limites identifiées](#22-limites-identifiées)
   - 2.3 [Fonctionnalités manquantes](#23-fonctionnalités-manquantes)
3. [Besoins fonctionnels](#3-besoins-fonctionnels)
   - 3.1 [Fonctionnalités indispensables](#31-fonctionnalités-indispensables)
   - 3.2 [Actions des utilisateurs](#32-actions-des-utilisateurs)
   - 3.3 [Données à enregistrer](#33-données-à-enregistrer)
   - 3.4 [Résultats attendus](#34-résultats-attendus)
4. [Besoins non fonctionnels](#4-besoins-non-fonctionnels)
5. [Contraintes et limites](#5-contraintes-et-limites)
6. [Persona](#6-persona)
7. [Use Cases](#7-use-cases)
8. [User Stories](#8-user-stories)
9. [Priorités](#9-priorités)
   - 9.1 [Fonctionnalités obligatoires](#91-fonctionnalités-obligatoires)
   - 9.2 [Fonctionnalités souhaitées](#92-fonctionnalités-souhaitées)
   - 9.3 [Hors périmètre / évolutions](#93-hors-périmètre--évolutions)
10. [Reprise et livraison](#10-reprise-et-livraison)

---

## 1. Contexte

### 1.1 Présentation de l'organisation

Le projet est réalisé pour **KOLONI**, un collectif de freelances indépendants dans la data. Le collectif met en relation des clients ayant des besoins de missions (run, build, expertise) avec des freelances du collectif et, au besoin, des profils de son réseau, via un système d'opportunités commerciales apportées et prises en charge par différents membres.

### 1.2 Rôle dans le projet

- Conception technique de la solution
- Développement complet de la solution
- Gestion de la relation client (compréhension des besoins, validation des fonctionnalités)
- Rédaction de la documentation
- Coordination et planification pour respecter les délais

### 1.3 Utilisateurs finaux

Deux profils d'utilisateurs sont identifiés :

- **Administrateurs** (4 à 5 personnes) : membres de la « cellule commerce » de Koloni, chargés de trouver et suivre les opportunités commerciales. Ce sont eux-mêmes des freelances du collectif, susceptibles d'apporter une opportunité ou de s'y positionner.
- **Membres** (environ 45 personnes) : freelances du collectif, susceptibles de se positionner sur les opportunités et d'être retenus pour une mission.

La différence entre ces deux profils porte uniquement sur les **droits d'action** : tous les utilisateurs voient les mêmes informations (tableau détaillé en section 3.2).

Aujourd'hui, le suivi des opportunités est assuré par une seule personne. La cellule commerce testera l'outil en premier, avant une ouverture à l'ensemble des membres du collectif (environ 50 personnes).

### 1.4 Origine et problématique

Aujourd'hui, la gestion des opportunités commerciales chez Koloni repose sur trois outils dont deux informels :

- Un réseau social interne (Circle), où les offres clients sont publiées sous forme de posts ;
- Une table PostgreSQL personnelle tenue par le client, avec des colonnes telles que : titre, client, apporteur, moteur, preneur, TJM client, TJM preneur, nombre de jours, montant facturé, type de deal, statut, date du signal, date de clôture, raison de la perte, notes.
- Un tableur (Google Sheet) commun où l'on retrouve les compétences de chacun des freelances (pas toutes renseignées), notées de 1 à 4.

Cette organisation repose presque entièrement sur une seule personne (le client), qui centralise le suivi commercial. Le suivi en 7 statuts existe déjà, mais dans une table personnelle non partagée et sans historique daté des changements. Les posts publiés sur Circle ne sont ni triables ni consultables par date. L'ensemble ne permet pas de partager la charge de travail avec le reste du collectif.

### 1.5 Solution proposée

Un outil web de Gestion de la Relation Client (CRM) sur mesure, reposant sur une interface web et une base de données PostgreSQL, permettant de :

- Publier une opportunité, même incomplète, via un formulaire structuré ;
- Rendre visibles les opportunités à l'ensemble des membres et permettre à plusieurs d'entre eux de s'y positionner ;
- Suivre le cycle de vie d'une opportunité (7 statuts) jusqu'à sa signature ou sa perte, avec historique daté ;
- Distinguer l'apporteur d'affaire (le membre qui amène l'opportunité) et le preneur (le freelance retenu, renseigné à la clôture) ;
- Offrir à tous une vision transverse de l'activité de chacun sur les opportunités.

L'outil doit être simple à prendre en main, responsive (utilisable sur smartphone), construit avec des technologies libres et « IA-friendly », entièrement en français.

---

## 2. Comprendre l'existant

### 2.1 Solution actuelle

- Un réseau social (Circle), sur lequel sont postées les offres clients.
- Une table PostgreSQL personnelle tenue par le client (colonnes détaillées en section 1.4), servant de suivi commercial de fait.
- Un tableau Trello personnel, utilisé par un membre de la cellule commerce pour suivre sa prospection.
- Aucun CRM ni outil dédié partagé à ce jour.

Le client a transmis par mail, pour inspiration, la liste des colonnes de sa table de suivi, des captures des 7 statuts et le template de publication, ainsi qu'un jeu de données fictives (fichier CSV de 50 contacts : prénom, nom, mail, société, ville, rôle) destiné aux tests et démonstrations. **Aucune donnée réelle ni aucun schéma n'ont été transmis.**

### 2.2 Limites identifiées

- Gestion reposant sur une seule personne, difficile à déléguer ou à partager avec le reste du collectif.
- Suivi en 7 statuts, mais dans une table personnelle du client, non partagée ; pas d'historique daté des changements.
- Posts Circle sans tri ni recherche par date.
- Aucune traçabilité de qui a fait quoi sur une opportunité (contact, positionnement, note ajoutée…).
- Pas de distinction entre les contacts d'une opportunité et les membres du collectif.
- Pas de base partagée des profils contactés hors collectif, à recontacter en priorité.

### 2.3 Fonctionnalités manquantes

- Formulaire structuré de publication d'une opportunité, reprenant un template standardisé (source, besoin, conditions, lieu, timing, candidature, diffusion).
- Gestion des contacts liés à une opportunité, distincte de la gestion des membres du collectif.
- Workflow de statuts (7 étapes) avec historique daté des changements.
- Gestion des rôles (administrateur / membre) et des droits d'action associés.
- Journal des actions menées sur une opportunité (qui a fait quoi, et quand).
- Base partagée des profils déjà contactés hors collectif, alimentée par ceux qui les contactent.
- Recherche et filtres sur les opportunités.
- Connexion réservée aux membres du collectif.

---

## 3. Besoins fonctionnels

### 3.1 Fonctionnalités indispensables

- Se connecter à l'application (un compte par personne, rôle administrateur ou membre) ; aucune page ni donnée n'est consultable sans connexion.
- Publier une opportunité via un formulaire structuré (template fourni par le client). Une opportunité peut être publiée incomplète : elle démarre en Signal et passe en Matching une fois qualifiée (interlocuteur, besoin, TJM et mode de candidature connus). Le remplissage des champs ne suffit pas : la qualification est un acte explicite, posé par l'apporteur ou un administrateur, qui atteste que l'opportunité est qualifiée. Une opportunité ne peut pas dépasser Signal sans avoir été qualifiée, sauf pour passer en Perdu ou en En pause.
- Consulter la liste des opportunités et se positionner sur l'une d'entre elles. Plusieurs membres peuvent se positionner sur une même opportunité tant qu'elle est en Signal ou en Matching ; se positionner signale un intérêt et ne réserve pas l'opportunité. L'apporteur (ou le moteur) choisit le ou les profils présentés au client, et le passage en Proposé ne masque pas l'opportunité.
- À profil équivalent, un membre passe devant un profil extérieur au moment du choix. Les membres disposent d'un délai (2 jours à ce jour, règle en cours de rédaction au sein du collectif) avant que l'opportunité ne s'ouvre à l'extérieur du collectif, ce délai étant compté en jours calendaires à partir de la date de qualification ; l'outil affiche la date à partir de laquelle elle s'ouvre. Une opportunité en Interne strict ne s'ouvre jamais à l'extérieur. Cette ouverture dépend en outre du niveau de diffusion et de l'accord de l'apporteur.
- Rechercher et filtrer les opportunités (technologie ou famille de technologies, statut, ville, mode, client final, société du contact, date du signal).
- Consulter une vue des opportunités signées, une vue des opportunités perdues avec la raison de la perte, et une vue des opportunités en pause dont la date de relance est atteinte.
- Ajouter une note à une opportunité : tout membre peut en écrire une, et les notes sont lisibles par tous.
- Faire évoluer le statut d'une opportunité parmi les 7 statuts définis, avec horodatage automatique du changement. Les transitions sont libres : un statut peut être sauté, on peut revenir en arrière ou rouvrir une opportunité, qui conserve son historique. Raison obligatoire au passage en Perdu, date de relance obligatoire au passage en En pause. Le motif de la perte et la date de relance sont conservés dans l'historique à chaque changement de statut, y compris après une réouverture.
- Conserver un historique complet et daté des changements de statut d'une opportunité.
- Consigner dans un journal d'actions ce que chacun a fait (positionnement, présentation d'un profil, note, profil extérieur contacté ou modifié, contact ou entreprise cliente ajouté ou modifié). Les changements de statut sont consignés dans l'historique des statuts ; le fil d'une opportunité réunit les deux.
- Ne jamais supprimer une opportunité, y compris signée ou perdue (conservation en base, pas de suppression physique).
- Clôturer une opportunité signée en renseignant le preneur, le TJM preneur, le nombre de jours et la date de clôture.
- Gérer les contacts associés à une opportunité (une même personne pouvant être liée à plusieurs opportunités dans le temps), rattachés à une entreprise cliente.
- Enregistrer et consulter les profils contactés hors collectif, sous forme de fiche technique structurée.
- Consulter une liste unique des consultants, qui réunit les membres du collectif et les profils contactés hors collectif. Un profil extérieur qui adhère au collectif est relié à son compte et n'apparaît plus qu'une fois ; ce lien est posé par une personne, jamais déduit du nom. Dans l'interface, ces personnes sont regroupées sous « Consultants » et les contacts côté client sous « Contacts clients ».
- Gérer son propre profil membre (informations personnelles, disponibilité, notes).
- Gérer les comptes utilisateurs (création, rôle, désactivation d'un membre sans effacer ses traces), réservé aux administrateurs.
- Distinguer les droits d'action administrateur / membre.

### 3.2 Actions des utilisateurs

_La lecture est ouverte à tous : la distinction ci-dessous ne porte que sur les actions._

#### Membre

- Consulter les opportunités, les notes, l'historique des statuts et le journal d'actions.
- Consulter les profils contactés hors collectif.
- Rechercher et filtrer les opportunités.
- Publier une nouvelle opportunité, même incomplète.
- Se positionner sur une opportunité en Signal ou en Matching.
- Faire évoluer le statut d'une opportunité dont il est l'apporteur ou le moteur, ou sur laquelle il est positionné lorsque le mode de candidature est « contact direct recruteur ».
- Valider la qualification d'une opportunité dont il est l'apporteur.
- Ajouter une note à une opportunité.
- Enregistrer un profil contacté hors collectif.
- Créer et modifier les contacts et les entreprises clientes.
- Rattacher un contact à une opportunité dont il est l'apporteur, le moteur ou le preneur, ou l'en retirer.
- Gérer son propre profil (coordonnées, disponibilité, notes).

#### Administrateur

- Toutes les actions d'un membre.
- Faire évoluer le statut de n'importe quelle opportunité et valider n'importe quelle qualification.
- Gérer les comptes utilisateurs (création, rôle, désactivation d'un membre sans effacer ses traces).

#### Tableau des droits d'action

| Action | Admin | Apporteur | Moteur | Membre positionné ¹ | Autre membre |
| --- | :---: | :---: | :---: | :---: | :---: |
| Consulter opportunités, notes, historique, journal, profils extérieurs | ✓ | ✓ | ✓ | ✓ | ✓ |
| Rechercher et filtrer les opportunités | ✓ | ✓ | ✓ | ✓ | ✓ |
| Publier une opportunité | ✓ | ✓ | ✓ | ✓ | ✓ |
| Valider la qualification (Signal → Matching) | ✓ | ✓ | — | — | — |
| Se positionner sur une opportunité | ✓ | ✓ | ✓ | ✓ | ✓ |
| Choisir le ou les profils présentés au client | — | ✓ | ✓ | — | — |
| Faire évoluer le statut d'une opportunité | ✓ | ✓ | ✓ | ✓ | — |
| Clôturer une opportunité signée | ✓ | ✓ | ✓ | ✓ | — |
| Ajouter une note | ✓ | ✓ | ✓ | ✓ | ✓ |
| Créer et modifier les contacts et les entreprises clientes | ✓ | ✓ | ✓ | ✓ | ✓ |
| Rattacher ou retirer un contact d'une opportunité ² | ✓ | ✓ | ✓ | — | — |
| Enregistrer un profil contacté hors collectif | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gérer son propre profil | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gérer les comptes utilisateurs | ✓ | — | — | — | — |

¹ Membre positionné sur l'opportunité concernée, lorsque le mode de candidature est « contact direct recruteur ».

² Le preneur de l'opportunité, une fois celle-ci signée, a aussi ce droit.

_La lecture est ouverte à tous, sans restriction : seules les colonnes d'action ci-dessus distinguent les profils._

_Les colonnes ne s'excluent pas : un administrateur est aussi un freelance du collectif, et peut donc être l'apporteur ou le moteur d'une opportunité. Les droits d'un apporteur ou d'un moteur ne valent que sur les opportunités qu'il porte ; ceux de la colonne Admin valent sur toutes. C'est pourquoi le choix des profils présentés au client n'est pas un droit d'administrateur : il appartient à celui qui porte l'opportunité._

_La clôture d'une opportunité s'opérant par le passage au statut « Signé », elle suit les mêmes droits que le changement de statut._

_Le passage de Signal à Matching résulte de la validation explicite de la qualification, réservée à l'apporteur et aux administrateurs. Les autres transitions suivent les droits de changement de statut._

_Tout membre peut créer et modifier les contacts et les entreprises clientes : le journal d'actions trace qui a créé quoi._

### 3.3 Données à enregistrer

#### Opportunité

| Champ | Description |
| --- | --- |
| Titre / sujet | Intitulé résumant le besoin en une phrase. |
| Source | Qui porte le besoin côté client (Client / Commercial / Contact). |
| Température | Niveau de maturité de l'opportunité (chaud / tiède). |
| Type de mission | Run / Build / Expertise… |
| Technologies | Technologies demandées (ex. Talend, Power BI, Python). Liste de valeurs réutilisable, qui sert au filtre. La technologie principale peut être distinguée des technologies en bonus. Chaque technologie appartient à une famille (ETL, BI…), qui sert au filtre par domaine. Une technologie ne peut pas être saisie deux fois, sans tenir compte des majuscules ni des espaces en début et fin de nom. |
| Niveau recherché | Opérationnel / Senior / Expert. |
| Client final | Entreprise où se déroule la mission, choisie parmi les entreprises clientes, si elle est connue. Facultatif : souvent inconnue quand le besoin passe par une ESN. À défaut, un secteur et une taille d'entreprise, qui ne s'indiquent que si l'entreprise n'est pas choisie. Ne bloque jamais une publication. Distinct de la société du contact, souvent l'ESN. |
| Apporteur | Membre qui amène l'opportunité. La relation client passe par lui, par le moteur ou directement par le candidat, selon le mode de candidature. |
| Saisi par | Membre qui a créé l'opportunité dans l'outil, lorsqu'il diffère de l'apporteur. |
| Moteur | Personne qui recherche un profil hors collectif, le cas échéant. |
| Preneur | Freelance retenu, membre du collectif ou profil extérieur, renseigné à la clôture. |
| TJM annoncé | Champ du template : ce que touche le candidat, annoncé tel quel aux membres. |
| TJM client | Taux journalier moyen facturé au client. |
| TJM preneur | Taux journalier moyen versé au freelance preneur, renseigné à la clôture. |
| Durée annoncée | Durée de la mission en mois, issue du template. |
| Nombre de jours | Nombre de jours effectif, renseigné à la clôture. |
| Charge | Temps plein / 3-4 jours / 1-2 jours par semaine… |
| Ville / mode | Lieu de la mission et mode de travail (télétravail, hybride, présentiel). |
| Timing | Urgence de la mission (urgent / < 1 mois / > 1 mois). |
| Mode de candidature | Via apporteur / contact direct recruteur / via moteur, avec précision (nom, mail, canal). |
| Niveau de diffusion | Choisi par l'apporteur. **Libre** : relais LinkedIn et posts publics bienvenus. **Réseau perso** : recommandation de personne à personne, sans publication ni contact d'autres ESN. **Interne strict** : membres du collectif uniquement. Sans choix, Réseau perso s'applique. |
| Date d'ouverture à l'extérieur | Date à partir de laquelle l'opportunité peut s'ouvrir hors collectif : date de qualification augmentée du délai laissé aux membres (2 jours calendaires à ce jour, règle en cours de rédaction au sein du collectif). Calculée, affichée à titre d'information ; sans objet pour une opportunité en « Interne strict » ou pas encore qualifiée. |
| Lien de l'annonce à l'extérieur | Lien du post qui ouvre l'opportunité à l'extérieur du collectif, renseigné quand elle est relayée. Facultatif. |
| Statut | Un des 7 statuts définis (voir ci-dessous). |
| Qualifiée par, date de qualification | Membre (apporteur ou administrateur) qui a validé la qualification, et date de cette validation. Obligatoires au-delà du statut « Signal », sauf pour « Perdu » et « En pause ». |
| Date du signal | Date de détection de l'opportunité. |
| Date de clôture | Date de signature ou de perte de l'opportunité. |
| Date de relance | Obligatoire au passage en « En pause ». |
| Raison de la perte | Motif, obligatoire et non vide au passage en « Perdu ». |
| Notes | Fil de notes datées et signées, lisibles par tous (cf. entité Note ci-dessous). |
| Historique des statuts | Liste datée des changements de statut, avec l'auteur du changement, le motif de la perte et la date de relance le cas échéant. |

#### Les 7 statuts d'une opportunité

| Statut | Description |
| --- | --- |
| Signal | L'opportunité est détectée, pas encore qualifiée. |
| Matching | L'opportunité est qualifiée, on recherche le profil adapté. |
| Proposé | Un profil a été présenté au client. |
| En discussion | Les conditions sont en cours de négociation. |
| Signé | Accord écrit confirmé par les parties. |
| Perdu | L'opportunité n'a pas abouti (profil concurrent placé, besoin annulé…). |
| En pause | Le client reporte sa décision ; l'opportunité sera relancée plus tard. |

_Les transitions entre statuts sont libres : un statut peut être sauté, on peut revenir en arrière ou rouvrir une opportunité, qui conserve son historique. Chaque changement est journalisé avec son auteur et sa date. Une raison est obligatoire au passage en « Perdu », une date de relance au passage en « En pause » ; l'une et l'autre restent consultables dans l'historique après une réouverture._

#### Positionnement d'un membre sur une opportunité

| Champ | Description |
| --- | --- |
| Membre | Membre qui s'est positionné. |
| Opportunité | Opportunité concernée. |
| Date de positionnement | Date à laquelle le membre a signalé son intérêt. |
| État | Positionné (candidat) / présenté au client / retenu / écarté / retiré. |
| Commentaire | Précision libre (motivation, disponibilité annoncée…). |

_Plusieurs membres peuvent être positionnés sur une même opportunité : un positionnement signale un intérêt et ne réserve rien. Le passage à « présenté » relève de l'apporteur ou du moteur ; le membre « retenu » devient le preneur de l'opportunité, renseigné à la clôture. Un seul membre peut être retenu par opportunité. Un membre qui se désiste passe son positionnement à « retiré »._

#### Note sur une opportunité

| Champ | Description |
| --- | --- |
| Auteur | Membre qui a écrit la note. |
| Opportunité | Opportunité concernée. |
| Date | Date et heure de rédaction. |
| Contenu | Texte libre. |

_Tout membre peut écrire une note sur une opportunité, y compris s'il n'y est pas positionné. Les notes sont lisibles par tous._

#### Journal d'actions d'une opportunité

| Champ | Description |
| --- | --- |
| Auteur | Utilisateur à l'origine de l'action. |
| Date | Date et heure de l'action. |
| Type | Positionnement, présentation d'un profil, note, profil extérieur contacté ou modifié, ajout ou modification d'un contact ou d'une entreprise cliente. |
| Objet concerné | Opportunité, contact, entreprise cliente ou profil extérieur sur lequel porte l'action. |
| Commentaire | Précision libre sur l'action (ex. « j'ai contacté telle personne »). |

_Les changements de statut sont consignés dans l'historique des statuts, pas dans le journal ; le fil affiché d'une opportunité réunit les deux. Le journal couvre également les écritures faites hors de l'interface (cf. « IA-friendly », section 4) : tout auteur, humain ou agent, écrit sous un compte identifié._

#### Entreprise cliente

| Champ | Description |
| --- | --- |
| Nom | Société (ESN ou client direct). |
| Secteur | Secteur d'activité. |
| Taille | Ordre de grandeur de l'effectif. |
| Ville | Localisation principale. |

_Les sociétés des contacts sont regroupées dans cette table, réutilisable d'une opportunité à l'autre. Elle sert notamment au filtre « société du contact ». Deux entreprises ne peuvent pas porter le même nom, sans tenir compte des majuscules ni des espaces en début et fin de nom._

#### Contact lié à une opportunité

| Champ | Description |
| --- | --- |
| Nom, Prénom | Identité du contact. |
| Rôle | Fonction chez le client (commercial, responsable data…). |
| Entreprise cliente | Société du contact, rattachée à la table Entreprise cliente. |
| Mail | Adresse mail de contact. |
| Téléphone | Optionnel selon les cas. |
| Lien LinkedIn | Optionnel. |

_Un même contact peut être lié à plusieurs opportunités au fil du temps : un même commercial revient souvent. Au moins un moyen de contact (mail, téléphone ou lien LinkedIn) est requis. Deux contacts ne peuvent pas porter le même lien LinkedIn, sans tenir compte des majuscules._

#### Profil extérieur (contacté hors collectif)

| Champ | Description |
| --- | --- |
| Nom, Prénom | Identité du profil. |
| Moyen de contact | Mail, téléphone ou autre canal. |
| Technologies | Technologies maîtrisées. |
| Niveau | Opérationnel / Senior / Expert. |
| Expériences clés | Principales expériences pertinentes. |
| Ville | Localisation. |
| Disponibilité | Disponible immédiatement, à partir d'une date… |
| TJM | Taux journalier moyen souhaité. |
| Sollicitations | Pour chaque opportunité sur laquelle le profil est sollicité : le membre qui l'a sollicité, la date du contact et l'issue (présenté, retenu, écarté par le client, indisponible, sans réponse du profil, sans retour du client). |
| Auteur de la saisie | Membre qui a enregistré la fiche du profil. |

_Entité distincte du contact client. Le moteur, administrateur ou non, saisit lui-même chaque profil qu'il contacte hors collectif, sous forme de fiche technique structurée. Un profil peut être lié à plusieurs opportunités. L'issue est propre à chaque opportunité : une nouvelle sollicitation n'efface pas la précédente, et la dernière fois où l'on a fait appel à un profil reste consultable. Un profil retenu comme preneur d'une opportunité doit avoir été sollicité sur cette opportunité. Pas de fichier CV ni de pièce jointe dans cette version._

#### Membre (profil utilisateur)

| Champ | Description |
| --- | --- |
| Nom, Prénom | Identité du membre (champ obligatoire). |
| Mail | Adresse mail (champ obligatoire). |
| Téléphone | Optionnel. |
| Notes | Zone de notes libres. |
| Rôle | Administrateur ou membre. |
| Ville | Champ texte, avec une validation a minima du format (ex. code postal). |
| Disponibilité | Inconnue (valeur d'un compte neuf), en recherche, à l'écoute (en mission, mais ouvert à une proposition) ou en mission, avec une date de fin de mission ou de disponibilité pour les deux derniers états. La date de la dernière déclaration est enregistrée : à la connexion, l'outil repose la question si la disponibilité n'a jamais été déclarée ou date de plus de 30 jours. C'est ce qui permet à un membre de se rendre visible. |
| Actif / désactivé | Un membre peut être désactivé sans que ses traces soient effacées : ses positionnements, ses notes et ses actions restent visibles. |

_Compétences : hors périmètre à ce stade, décision de l'équipe projet. Une intégration en fin de projet reste envisagée si le planning le permet. Elle prendra alors la forme d'une table dédiée associant la clé primaire du freelance à chacune de ses compétences avec son niveau (note de 1 à 4), afin de rester exploitable (filtrage, matching) — et non d'un champ libre sur le profil membre._

_L'historique des clients chez qui chaque membre a déjà travaillé, pour obtenir une mise en relation, est hors périmètre de cette version._

### 3.4 Résultats attendus

- Un outil commun de suivi des opportunités, partagé par la cellule commerce et les membres. Il vient dans un premier temps en complément du réseau social Circle et de la table personnelle du client ; un éventuel remplacement se décidera après la phase de test.
- Une adoption large par le collectif (au-delà des 4 à 5 personnes de la cellule commerce), grâce à une prise en main facile au quotidien.
- Une meilleure visibilité des opportunités pour l'ensemble des membres, et une meilleure traçabilité de l'activité commerciale.
- Un historique fiable et daté du cycle de vie de chaque opportunité, jusqu'à sa signature ou sa perte.
- Une documentation technique solide, permettant au client de reprendre la main sur l'outil après la livraison.

---

## 4. Besoins non fonctionnels

| Critère | Détail |
| --- | --- |
| Facilité d'utilisation | Priorité n°1 du client : l'outil doit être facile à prendre en main pour fédérer un maximum de membres du collectif. |
| Responsive | Application web utilisable confortablement sur smartphone, en plus du poste de travail. |
| Simplicité technique | Stack volontairement simple, retenue par l'équipe projet : interface web + base de données PostgreSQL. L'exposition d'une API est hors périmètre à ce stade, à reconsidérer ensuite. |
| Technologies libres | Exigence du client : des outils libres et simples, qu'il pourra reprendre après la livraison. Le choix précis des technologies revient à l'équipe projet. |
| IA-friendly | Un agent IA lira et écrira directement dans la base. Cela impose un schéma lisible (noms explicites, commentaires sur les tables et les colonnes, contraintes déclarées) et l'enregistrement de tout ce qui se passe sur une opportunité. Le journal d'actions et les contrôles obligatoires (raison de la perte, date de relance) couvrent donc aussi les écritures faites hors de l'interface ; l'agent écrit sous un compte identifié. |
| Langue | Interface et documentation intégralement en français. |
| Hébergement | Outil développé et validé en local, puis installé sur un VPS fourni par le client (cf. section Reprise et livraison). |
| Accès | Application accessible en ligne depuis un navigateur, sans VPN, réservée aux membres du collectif connectés (un compte par personne, rôle administrateur ou membre). Aucune page ni donnée n'est consultable sans connexion. |
| Sécurité et données personnelles | Connexion obligatoire, droits d'action par rôle, aucun export public. |
| Conservation des données | Aucune suppression : les opportunités signées ou perdues restent consultables en base. Rien n'est archivé ni purgé. Seule exception : la correction d'un rattachement saisi par erreur (technologie ou contact d'une opportunité). |
| Documentation | Documentation technique complète et détaillée, en français, pour assurer la maintenabilité de l'outil par le client. |
| Passage à l'échelle | L'outil doit pouvoir accueillir davantage de membres que les ~50 membres actuels du collectif. |

---

## 5. Contraintes et limites

- Le modèle de données est à concevoir par l'équipe : aucun schéma existant n'a été transmis (cf. section 2.1).
- L'outil doit être développé et validé en local avant toute mise à disposition d'un VPS de production.
- Dans un premier temps, l'outil vient en complément du réseau social Circle et de la table personnelle du client ; un remplacement éventuel se décidera après la phase de test.
- Pas d'objet Mission dans cette version : une opportunité signée reste une opportunité, au statut Signé, avec ses champs de clôture. Il n'y a ni conversion en mission, ni affectation, ni compte-rendu de mission.
- Le reporting et les statistiques (nombre d'opportunités par statut, délai entre signal et signature) ne sont pas demandés dans ce périmètre et deviennent une évolution possible. En revanche, le suivi de « qui a fait quoi » sur une opportunité fait bien partie de cette version, via le journal d'actions.
- Pas de pièce jointe ni de fichier CV dans cette version : les profils extérieurs sont saisis sous forme de fiche structurée.
- Rien n'est archivé ni purgé : l'intégralité des opportunités et de leur historique reste en base.
- Les notifications et l'exposition d'une API sont hors périmètre à ce stade, à reconsidérer ensuite. Le besoin exprimé par le client pour les notifications est un abonnement : un membre reçoit un mail à chaque nouvelle opportunité.
- La ville est intégrée au profil membre (champ texte avec validation de format a minima). Les compétences sont hors périmètre à ce stade, avec une intégration envisagée en fin de projet.
- La matrice de compétences (Google Sheet) et l'historique des clients chez qui chaque membre a déjà travaillé sont hors périmètre de cette version.
- Tests et démonstrations sur données fictives uniquement : aucune donnée réelle du collectif ne sera transmise. Le client a fourni un fichier `Contacts_fictifs.csv` (50 contacts fictifs) ; les opportunités fictives sont à créer par l'équipe à partir du template.

---

## 6. Persona

Deux profils distincts coexistent au sein de l'outil : l'administrateur et le membre. La lecture est ouverte à tous ; seuls les droits d'action les distinguent.

### Administrateur

Fait partie de la cellule commerce de Koloni (4 à 5 personnes). Suit la relation commerciale, tout en étant lui-même un freelance du collectif : il peut apporter une opportunité ou s'y positionner.

| Attribut | Détail |
| --- | --- |
| Effectif | 4 à 5 personnes. |
| Rôle | Trouver et suivre les opportunités commerciales, faire évoluer leur statut. |
| Droits d'action spécifiques | Faire évoluer le statut de n'importe quelle opportunité et valider n'importe quelle qualification ; gérer les comptes utilisateurs (création, rôle, désactivation sans effacer les traces). |
| Actions clés | Publier et qualifier une opportunité, la faire évoluer, la clôturer, enregistrer un profil extérieur, consulter l'historique et le journal d'actions. |

### Membre

Freelance du collectif Koloni, susceptible de se positionner sur une opportunité et d'être retenu pour une mission.

| Attribut | Détail |
| --- | --- |
| Effectif | Environ 45 personnes, soit une cinquantaine de membres du collectif avec la cellule commerce. |
| Rôle | Consulter les opportunités, se rendre visible via sa disponibilité et se positionner sur une opportunité. |
| Droits d'action | Publier une opportunité, s'y positionner, y ajouter une note, enregistrer un profil extérieur. Fait évoluer le statut d'une opportunité dont il est l'apporteur ou le moteur, ou sur laquelle il est positionné lorsque le mode de candidature est « contact direct recruteur ». |
| Actions clés | Consulter et filtrer les opportunités, se positionner, ajouter une note, gérer son profil (coordonnées, disponibilité, notes). |

---

## 7. Use Cases

| # | Cas d'utilisation | Acteur |
| --- | --- | --- |
| UC1 | Se connecter à l'application | Membre, Administrateur |
| UC2 | Publier une opportunité, même incomplète | Membre, Administrateur |
| UC3 | Qualifier une opportunité et valider sa qualification | Apporteur, Administrateur |
| UC4 | Consulter les opportunités | Membre, Administrateur |
| UC5 | Rechercher et filtrer les opportunités | Membre, Administrateur |
| UC6 | Se positionner sur une opportunité | Membre, Administrateur |
| UC7 | Ajouter une note à une opportunité | Membre, Administrateur |
| UC8 | Gérer les contacts d'une opportunité | Apporteur, moteur, preneur, Administrateur |
| UC9 | Faire évoluer le statut d'une opportunité | Apporteur, moteur, membre positionné (contact direct recruteur), Administrateur |
| UC10 | Clôturer une opportunité signée | Apporteur, moteur, membre positionné (contact direct recruteur), Administrateur |
| UC11 | Consulter l'historique des statuts d'une opportunité | Membre, Administrateur |
| UC12 | Consulter le journal d'actions d'une opportunité | Membre, Administrateur |
| UC13 | Enregistrer un profil contacté hors collectif | Membre, Administrateur |
| UC14 | Consulter la base de profils contactés hors collectif | Membre, Administrateur |
| UC15 | Gérer son profil membre | Membre, Administrateur |
| UC16 | Gérer les comptes utilisateurs | Administrateur |

---

## 8. User Stories

### UC1 — Se connecter à l'application
>
> En tant que membre du collectif, je veux me connecter avec mon compte personnel, afin d'accéder aux opportunités et que chacune de mes actions soit tracée sous mon nom. Aucune page ni donnée n'est accessible sans connexion.

### UC2 — Publier une opportunité
>
> En tant que membre du collectif, je veux publier une opportunité via un formulaire structuré (source, besoin, conditions, lieu, timing, candidature, diffusion), même si je ne dispose pas encore de toutes les informations, afin que les autres membres puissent la consulter et se positionner dessus.

### UC3 — Qualifier une opportunité
>
> En tant qu'apporteur ou administrateur, je veux valider la qualification d'une opportunité une fois son interlocuteur, son besoin, son TJM et son mode de candidature connus, afin de la faire passer de Signal à Matching et de signaler aux membres qu'ils peuvent se positionner.

### UC4 — Consulter les opportunités
>
> En tant que membre, je veux consulter l'ensemble des opportunités, leurs notes, leur historique et leur journal d'actions, afin de savoir ce qui circule dans le collectif et où en est chaque dossier. Aucune information n'est masquée entre membres.

### UC5 — Rechercher et filtrer les opportunités
>
> En tant que membre en recherche de mission, je veux filtrer les opportunités par technologie, statut, ville, mode de travail, client final, société du contact ou date du signal, afin de retrouver rapidement celles qui correspondent à mon profil.

### UC6 — Se positionner sur une opportunité
>
> En tant que membre, je veux pouvoir me positionner sur une opportunité en Signal ou en Matching, afin de signaler mon intérêt à l'apporteur. Plusieurs membres peuvent se positionner sur une même opportunité : se positionner ne la réserve pas, c'est l'apporteur (ou le moteur) qui choisit le ou les profils présentés au client. Si je me désiste, je retire mon positionnement.

### UC7 — Ajouter une note à une opportunité
>
> En tant que membre, je veux écrire une note sur une opportunité, même si je n'y suis pas positionné, afin de partager une information utile au collectif. Ma note est datée, signée et lisible par tous.

### UC8 — Gérer les contacts d'une opportunité
>
> En tant qu'apporteur, moteur, preneur ou administrateur, je veux rattacher un contact et son entreprise à une opportunité, afin que le collectif sache à qui s'adresser et retrouve ce même contact lors d'une prochaine opportunité.

### UC9 — Faire évoluer le statut d'une opportunité
>
> En tant qu'apporteur, moteur ou administrateur, je veux faire évoluer le statut d'une opportunité parmi les 7 statuts définis, afin de suivre son avancement et de conserver un historique daté de son cycle de vie.

### UC10 — Clôturer une opportunité signée
>
> En tant qu'apporteur, moteur, membre positionné en contact direct recruteur ou administrateur, je veux clôturer une opportunité signée en renseignant le preneur, le TJM preneur, le nombre de jours et la date de clôture, afin de conserver une trace complète de son issue.

### UC11 — Consulter l'historique des statuts d'une opportunité
>
> En tant que membre, je veux consulter l'historique daté des changements de statut d'une opportunité, avec l'auteur de chaque changement, afin de comprendre son parcours — y compris en cas de retour en arrière ou de réouverture.

### UC12 — Consulter le journal d'actions d'une opportunité
>
> En tant que membre, je veux consulter le journal d'actions d'une opportunité, afin de savoir qui a fait quoi et quand : positionnements, profils présentés, notes, profils extérieurs contactés, contacts ajoutés. Les changements de statut figurent dans l'historique des statuts (UC11).

### UC13 — Enregistrer un profil contacté hors collectif
>
> En tant que moteur, je veux enregistrer chaque profil que je contacte hors collectif sous forme de fiche structurée (technologies, niveau, expériences clés, ville, disponibilité, TJM), afin que le collectif conserve une base de profils qualifiés à recontacter, même lorsque l'opportunité est perdue.

### UC14 — Consulter la base de profils contactés hors collectif
>
> En tant que membre, je veux consulter les profils déjà contactés hors collectif, afin de repérer un profil qualifié à recontacter en priorité plutôt que de repartir d'une recherche à zéro. Je les retrouve dans une liste unique avec les membres du collectif, où une personne n'apparaît qu'une fois.

### UC15 — Gérer son profil membre
>
> En tant que membre, je veux tenir à jour mes coordonnées et ma disponibilité (en recherche, à l'écoute ou en mission, avec la date associée), afin de me rendre visible auprès de la cellule commerce au bon moment.

### UC16 — Gérer les comptes utilisateurs
>
> En tant qu'administrateur, je veux créer les comptes, attribuer les rôles et désactiver un membre qui quitte le collectif, afin de contrôler l'accès à l'outil sans jamais effacer les traces de ce qu'il a fait.

---

## 9. Priorités

### 9.1 Fonctionnalités obligatoires

- Connexion à l'application, réservée aux membres du collectif (un compte par personne, rôle administrateur ou membre).
- Publication d'une opportunité via un formulaire structuré, y compris incomplète, avec qualification Signal → Matching validée par l'apporteur ou un administrateur.
- Consultation des opportunités et positionnement de plusieurs membres sur une même opportunité.
- Recherche et filtres sur les opportunités, avec vues dédiées : signées, perdues avec la raison de la perte, en pause dont la date de relance est atteinte.
- Notes sur une opportunité, rédigées par tout membre et lisibles par tous.
- Workflow des 7 statuts, transitions libres, historique daté des changements.
- Journal d'actions : savoir ce que chacun a fait sur une opportunité.
- Conservation permanente des opportunités (aucune suppression, aucun archivage).
- Clôture d'une opportunité signée (preneur, TJM preneur, nombre de jours, date de clôture).
- Gestion des contacts liés à une opportunité et des entreprises clientes.
- Enregistrement et consultation des profils contactés hors collectif.
- Gestion des profils membres (nom, prénom et mail obligatoires ; téléphone, ville, disponibilité, notes).
- Gestion des comptes utilisateurs et distinction des droits d'action administrateur / membre.
- Interface responsive, en français, simple à prendre en main.
- Documentation technique complète, en français.

### 9.2 Fonctionnalités souhaitées

- Vue des opportunités en colonnes par statut, dans l'esprit de Trello ou de Planner.

### 9.3 Hors périmètre / évolutions

- Matrice de compétences (actuellement sur Google Sheet) et compétences au profil membre : intégration envisagée en fin de projet, sous forme d'une table dédiée associant chaque freelance à ses compétences et à leur niveau (note de 1 à 4).
- Clients chez qui chaque membre a déjà travaillé, pour obtenir une mise en relation.
- Pièces jointes sur les contacts, les opportunités ou les profils extérieurs, fichiers CV compris.
- Prospection partagée : suivi de clients qui n'ont pas encore de besoin.
- Statistiques simples : nombre d'opportunités par statut, délai entre signal et signature.
- Pilotage de la base par un agent IA.
- Notifications (abonnement mail à chaque nouvelle opportunité) et exposition d'une API : hors périmètre à ce stade, à reconsidérer ensuite.

---

## 10. Reprise et livraison

- Koloni forkera le dépôt de l'équipe en fin de projet.
- Un README permettant de relancer le projet sur une machine vierge.
- Un fichier d'architecture et de conventions de 2 pages.
- Un schéma de base versionné par scripts de migration.
- Une documentation en français.
- Une fois l'outil validé en local, le client fournit un VPS et les accès pour l'y installer.
