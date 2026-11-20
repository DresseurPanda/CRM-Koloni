# Cahier des charges

## _CRM interne — Gestion de la relation client_

**Projet KOLONI**
Version 0.3 — Document de travail
Document de référence : Recueil de besoins, version 0.4

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
   - 1.1 [Contexte](#11-contexte)
   - 1.2 [Objectif](#12-objectif)
   - 1.3 [Parties prenantes](#13-parties-prenantes)
   - 1.4 [Utilisateurs et rôles](#14-utilisateurs-et-rôles)
2. [Périmètre](#2-périmètre)
   - 2.1 [Inclus dans le projet](#21-inclus-dans-le-projet)
   - 2.2 [Hors périmètre](#22-hors-périmètre)
3. [Exigences fonctionnelles](#3-exigences-fonctionnelles)
   - 3.1 [Authentification et comptes](#31-authentification-et-comptes)
   - 3.2 [Opportunités](#32-opportunités)
   - 3.3 [Collaboration sur une opportunité](#33-collaboration-sur-une-opportunité)
   - 3.4 [Contacts, entreprises et profils extérieurs](#34-contacts-entreprises-et-profils-extérieurs)
   - 3.5 [Profil membre](#35-profil-membre)
   - 3.6 [Données](#36-données)
4. [Exigences non fonctionnelles et contraintes](#4-exigences-non-fonctionnelles-et-contraintes)
5. [Organisation, planning et chiffrage](#5-organisation-planning-et-chiffrage)
   - 5.1 [Équipe](#51-équipe)
   - 5.2 [Découpage en releases](#52-découpage-en-releases)
   - 5.3 [Chiffrage économique](#53-chiffrage-économique)
6. [Risques et points ouverts](#6-risques-et-points-ouverts)
   - 6.1 [Risques](#61-risques)
   - 6.2 [Points ouverts](#62-points-ouverts)
7. [Livrables, recette et reprise](#7-livrables-recette-et-reprise)
   - 7.1 [Livrables](#71-livrables)
   - 7.2 [Recette](#72-recette)
   - 7.3 [Reprise](#73-reprise)

---

## 1. Présentation du projet

### 1.1 Contexte

Le projet est réalisé pour **KOLONI**, un collectif d'environ 50 freelances indépendants dans la data. Le collectif met en relation des clients ayant des besoins de missions (run, build, expertise) avec des freelances du collectif et, au besoin, des profils de son réseau, via des opportunités commerciales apportées et prises en charge par différents membres.

Le suivi de ces opportunités repose aujourd'hui sur une seule personne et sur trois outils : un réseau social interne (Circle), une table PostgreSQL personnelle et un tableur partagé de compétences. Il n'existe ni suivi partagé, ni historique daté des changements de statut, ni traçabilité de qui a fait quoi.

### 1.2 Objectif

Réaliser un outil web de gestion de la relation client (CRM) sur mesure, permettant de :

- publier une opportunité, même incomplète, via un formulaire structuré ;
- rendre les opportunités visibles à tous les membres et permettre à plusieurs d'entre eux de s'y positionner ;
- suivre le cycle de vie d'une opportunité en 7 statuts, avec historique daté ;
- tracer toutes les actions menées sur une opportunité ;
- conserver une base partagée des profils contactés hors collectif ;
- distinguer l'apporteur d'affaire, le moteur et le preneur.

Priorité n°1 du client : la facilité de prise en main, pour fédérer un maximum de membres.

### 1.3 Parties prenantes

| Partie prenante | Rôle |
| --- | --- |
| Client (KOLONI) | Commanditaire, interlocuteur unique pour la validation des fonctionnalités, fournisseur du VPS de production. |
| Équipe projet | Conception, développement, documentation et livraison (cf. 5.1). |
| Administrateurs (4 à 5) | Membres de la cellule commerce ; premiers testeurs de l'outil. |
| Membres (environ 45) | Freelances du collectif ; utilisateurs finaux après la phase de test. |

### 1.4 Utilisateurs et rôles

Deux profils : **administrateur** et **membre**. La lecture est ouverte à tous ; seuls les droits d'action les distinguent. Un administrateur étant aussi un freelance du collectif, il peut être apporteur ou moteur d'une opportunité. Les droits d'un apporteur ou d'un moteur ne valent que sur les opportunités qu'il porte.

---

## 2. Périmètre

### 2.1 Inclus dans le projet

- Connexion, comptes utilisateurs et droits d'action par rôle.
- Publication, qualification, consultation, recherche et filtrage des opportunités.
- Workflow de 7 statuts avec historique daté, clôture d'une opportunité signée.
- Positionnement de plusieurs membres sur une opportunité, choix des profils présentés au client.
- Notes et journal d'actions.
- Contacts et entreprises clientes.
- Profils contactés hors collectif (fiche structurée).
- Profil membre (coordonnées, disponibilité, notes).
- Jeu de données fictives pour les tests et démonstrations.
- Documentation et livrables de reprise (cf. section 7).

### 2.2 Hors périmètre

Ces éléments sont hors périmètre à ce stade et pourront être reconsidérés ensuite :

- Matrice de compétences et compétences au profil membre (intégration envisagée en fin de projet si le planning le permet).
- Historique des clients chez qui chaque membre a déjà travaillé.
- Pièces jointes et fichiers CV.
- Objet Mission (conversion, affectation, compte-rendu de mission).
- Prospection partagée (clients sans besoin identifié).
- Reporting et statistiques.
- Notifications par mail (abonnement à chaque nouvelle opportunité).
- Exposition d'une API.
- Pilotage de la base par un agent IA.
- Remplacement de Circle et de la table personnelle du client : à décider après la phase de test.

---

## 3. Exigences fonctionnelles

Chaque exigence est rattachée à un cas d'utilisation (UC) du recueil de besoins, à une priorité (**O** = obligatoire, **S** = souhaitée) et à la release qui la livre (cf. 5.2).

**Légende des références :**

- **EF** = Exigence Fonctionnelle : ce que l'outil doit faire (ex. EF-05, la qualification d'une opportunité).
- **ENF** = Exigence Non Fonctionnelle : comment l'outil doit être, ses qualités et contraintes (ex. ENF-02, l'application doit être responsive). Elles sont détaillées en section 4.
- Les numéros servent de références stables pour relier une exigence à un cas d'utilisation, à une release ou à la recette.

### 3.1 Authentification et comptes

| Réf. | Exigence | UC | Priorité | Release |
| --- | --- | --- | :---: | :---: |
| EF-01 | Connexion par compte personnel. Aucune page ni donnée n'est consultable sans connexion. | UC1 | O | V0 |
| EF-02 | Création de comptes, attribution du rôle et désactivation d'un membre sans effacer ses traces (positionnements, notes, actions). Réservé aux administrateurs. | UC16 | O | V0 |
| EF-03 | Droits d'action par rôle, conformément au tableau du recueil de besoins (section 3.2). | UC1 | O | V0, V2 |

### 3.2 Opportunités

| Réf. | Exigence | UC | Priorité | Release |
| --- | --- | --- | :---: | :---: |
| EF-04 | Publication d'une opportunité via un formulaire structuré (source, besoin, conditions, lieu, timing, candidature, diffusion), même incomplète. Elle démarre au statut Signal. Le client final, s'il est connu, est choisi parmi les entreprises clientes ; il ne bloque jamais la publication. | UC2 | O | V1 |
| EF-05 | Qualification explicite Signal → Matching, posée par l'apporteur ou un administrateur. Le remplissage des champs ne suffit pas. Perdu et En pause restent possibles avant qualification. | UC3 | O | V2 |
| EF-06 | Consultation de la liste et du détail d'une opportunité (notes, historique, journal). Aucune information n'est masquée entre membres. | UC4 | O | V1 |
| EF-07 | Changement de statut parmi les 7 statuts, transitions libres (saut, retour en arrière, réouverture), horodatage automatique. Raison obligatoire et non vide au passage en Perdu, date de relance obligatoire au passage en En pause. | UC9 | O | V2 |
| EF-08 | Historique complet et daté des changements de statut, avec l'auteur de chaque changement, le motif de la perte et la date de relance le cas échéant, conservés après une réouverture. | UC11 | O | V2 |
| EF-09 | Aucune suppression physique d'une opportunité, y compris signée ou perdue. | — | O | V1 |
| EF-10 | Niveau de diffusion (Libre, Réseau perso, Interne strict ; Réseau perso par défaut) et affichage de la date d'ouverture à l'extérieur du collectif, calculée à partir de la date de qualification et du délai laissé aux membres (2 jours calendaires à ce jour), sans objet en Interne strict ou tant que l'opportunité n'est pas qualifiée. Lien de l'annonce à l'extérieur facultatif. | UC2 | O | V1, V2 |
| EF-11 | Clôture d'une opportunité signée : preneur, TJM preneur, nombre de jours, date de clôture. | UC10 | O | V2 |
| EF-12 | Recherche et filtres : technologie ou famille de technologies, statut, ville, mode, client final, société du contact, date du signal. | UC5 | O | V3 |
| EF-13 | Vues dédiées : opportunités signées, opportunités perdues avec raison de la perte, opportunités en pause dont la date de relance est atteinte. | UC5 | O | V3 |
| EF-14 | Vue des opportunités en colonnes par statut, dans l'esprit de Trello ou de Planner. | UC4 | S | V4 |

### 3.3 Collaboration sur une opportunité

| Réf. | Exigence | UC | Priorité | Release |
| --- | --- | --- | :---: | :---: |
| EF-15 | Positionnement de plusieurs membres sur une opportunité en Signal ou en Matching. Le positionnement signale un intérêt et ne réserve rien. Un seul membre peut être retenu par opportunité. Un membre qui se désiste retire son positionnement. | UC6 | O | V2 |
| EF-16 | Choix, par l'apporteur ou le moteur, du ou des profils présentés au client. Le passage en Proposé ne masque pas l'opportunité. | UC6 | O | V2 |
| EF-17 | Notes datées et signées, écrites par tout membre (positionné ou non), lisibles par tous. | UC7 | O | V2 |
| EF-18 | Journal d'actions : positionnement, présentation d'un profil, note, profil extérieur contacté ou modifié, ajout ou modification d'un contact ou d'une entreprise. Chaque entrée porte l'auteur, la date, un commentaire et l'objet concerné. Les changements de statut figurent dans l'historique des statuts (EF-08). | UC12 | O | V2 |

### 3.4 Contacts, entreprises et profils extérieurs

| Réf. | Exigence | UC | Priorité | Release |
| --- | --- | --- | :---: | :---: |
| EF-19 | Gestion des contacts liés à une opportunité et des entreprises clientes. Un contact peut être lié à plusieurs opportunités. Tout membre peut les créer et les modifier. Un contact exige au moins un mail, un téléphone ou un lien LinkedIn. Une entreprise, une technologie ou un lien LinkedIn de contact ne peut pas être saisi deux fois, sans tenir compte des majuscules ni des espaces en début et fin. | UC8 | O | V1, V2 |
| EF-20 | Enregistrement d'un profil contacté hors collectif sous forme de fiche structurée, lié à une ou plusieurs opportunités, avec, pour chacune, le membre qui l'a sollicité, la date et l'issue de la sollicitation. | UC13 | O | V3 |
| EF-21 | Consultation de la base des profils contactés hors collectif, dans une liste unique des consultants avec les membres du collectif. Un profil extérieur relié à un compte membre n'apparaît qu'une fois. | UC14 | O | V3 |

### 3.5 Profil membre

| Réf. | Exigence | UC | Priorité | Release |
| --- | --- | --- | :---: | :---: |
| EF-22 | Gestion de son propre profil : nom, prénom et mail obligatoires ; téléphone, ville (format validé a minima), disponibilité (inconnue, en recherche, à l'écoute, en mission) avec la date associée, notes. La disponibilité est redemandée à la connexion si elle n'a jamais été déclarée ou date de plus de 30 jours. | UC15 | O | V3 |

### 3.6 Données

Le modèle de données est à concevoir par l'équipe (aucun schéma existant). Il couvre les entités décrites en section 3.3 du recueil de besoins : Opportunité, Positionnement, Note, Journal d'actions, Entreprise cliente, Contact, Profil extérieur, Membre, ainsi que la liste de technologies réutilisable, classée par famille de technologies, et l'historique des statuts.

---

## 4. Exigences non fonctionnelles et contraintes

| Réf. | Critère | Exigence |
| --- | --- | --- |
| ENF-01 | Facilité d'utilisation | Prise en main sans formation. Priorité n°1 du client. |
| ENF-02 | Responsive | Utilisation confortable sur smartphone et sur poste de travail. |
| ENF-03 | Langue | Interface et documentation intégralement en français. |
| ENF-04 | Technologies | Interface web et base PostgreSQL. Technologies libres, reprenables par le client. Choix précis à arrêter par l'équipe (cf. 6.2). |
| ENF-05 | IA-friendly | Schéma lisible : noms explicites, commentaires sur les tables et les colonnes, contraintes déclarées. Le journal d'actions et les contrôles obligatoires couvrent aussi les écritures faites hors de l'interface, sous un compte identifié. |
| ENF-06 | Accès | Application accessible en ligne depuis un navigateur, sans VPN, réservée aux membres connectés. |
| ENF-07 | Sécurité | Connexion obligatoire, droits d'action par rôle, aucun export public. |
| ENF-08 | Conservation | Aucune suppression, aucun archivage, aucune purge. Seule exception : la correction d'un rattachement saisi par erreur (technologie ou contact d'une opportunité). |
| ENF-09 | Passage à l'échelle | Capacité à accueillir davantage que les 50 membres actuels. |
| ENF-10 | Hébergement | Développement et validation en local, puis installation sur un VPS fourni par le client. |
| ENF-11 | Données de test | Données fictives uniquement (fichier `Contacts_fictifs.csv` fourni par le client ; opportunités fictives créées par l'équipe à partir du template). |
| ENF-12 | Documentation | Documentation technique complète et détaillée, en français. |

---

## 5. Organisation, planning et chiffrage

### 5.1 Équipe

| Membre | Rôle |
| --- | --- |
| Mathias Garaios | Scrum Master |
| Hugo Drapied | Product Owner |
| Lucie Martinez | Développeuse |
| Sara Fellah | Développeuse |
| Louis Bonard | Développeur |

Chaque membre est mobilisé 15 heures par semaine pendant 14 semaines. Le développement suit une méthode agile, par releases successives.

### 5.2 Découpage en releases

| Release | Durée | Contenu | Exigences |
| --- | :---: | --- | --- |
| **V0 — Socle** | 2 semaines | Modèle de données et scripts de migration, connexion, comptes, rôles et droits, jeu de données fictives, README de lancement. | EF-01 à EF-03 |
| **V1 — Cycle de vie d'une opportunité** | 3 semaines | Publication, consultation, non-suppression, contacts et entreprises, diffusion. | EF-04, EF-06, EF-09, EF-10, EF-19 |
| **V2 — Travail collectif** | 3 semaines | Reporté de la V1 : qualification, 7 statuts avec historique, modification d'une opportunité, rattachement des contacts. Puis positionnements, choix des profils présentés, notes, journal d'actions, clôture. | EF-03, EF-05, EF-07, EF-08, EF-10, EF-19 (reportées de la V1) ; EF-11, EF-15 à EF-18 |
| **V3 — Recherche et base de profils** | 3 semaines | Recherche et filtres, vues dédiées, profils extérieurs, profil membre. | EF-12, EF-13, EF-20 à EF-22 |
| **V4 — Finalisation** | 3 semaines | Vue en colonnes par statut (si le planning le permet), finitions responsive, documentation finale, recette avec le client, préparation de l'installation sur le VPS. | EF-14, ENF-01 à ENF-12 |

**Bilan des releases terminées :**

- **V0** : livrée. Les droits sur les actions d'une opportunité (EF-03) sont livrés avec la qualification, en V2.
- **V1** : publication, consultation et non-suppression livrées ; fiches des contacts, des entreprises et des technologies, sans doublon. Reportés en V2 : la qualification (EF-05), le changement de statut et son historique (EF-07, EF-08), la modification d'une opportunité après sa publication, dont le niveau de diffusion (EF-10), et le rattachement des contacts à une opportunité (EF-19).
- Livré en avance dans la base de données : les règles du journal d'actions, des positionnements et de la liste unique des consultants (V2 et V3).

Le découpage est une proposition de l'équipe, à valider avec le client. Les compétences des membres (hors périmètre) ne seraient intégrées qu'en fin de V4, si le planning le permet.

### 5.3 Chiffrage économique

Le chiffrage repose sur le volume horaire du projet, converti en jours-personne, auquel est appliqué un taux journalier moyen (TJM).

**Volume horaire du projet :**

L'équipe est composée de 5 personnes, mobilisées individuellement 15 heures par semaine sur une durée de 14 semaines, soit :

5 personnes × 14 semaines × 15 h = 1 050 heures, réparties sur l'ensemble des releases (V0 à V4).

**Taux journalier retenu :**

Un TJM de 270 €/jour a été retenu. Ce montant se situe entre deux références :

- le TJM moyen constaté pour un développeur freelance junior sur le marché (0 à 2 ans d'expérience professionnelle), de l'ordre de 320 à 400 €/jour selon les grilles sectorielles ;
- Un tarif réduit, plus proche des pratiques observées pour des prestations réalisées par des étudiants (type Junior-Entreprise), qui se situe généralement en dessous de cette fourchette.

Ce compromis reflète à la fois la nature réelle de la prestation (besoin client authentique, engagement sur un périmètre fonctionnel complet, documentation et recette) et le statut d'étudiants en formation de notre équipe, sans expérience professionnelle indépendante préalable.

Nous ajoutons à cela une autre métrique qui est le rôle au sein du projet de chaque membre. Nous attribuons donc un bonus de 15 % au Scrum Master et 5 % au Product Owner, qui sont des chiffres cohérents vis-à-vis du travail supplémentaire, des responsabilités inhérentes aux rôles, ainsi qu'à la fourchette de salaire que l'on retrouve dans le marché actuel.

**Chiffrage total :**

On arrive donc à un calcul final de :

On convertit le TJM en taux hebdomadaire moyen (au vu de nos horaires spéciaux) : 270 (TJM) × 15 (heures/semaine) / 7 (heures par jour) = 578 €/semaine

3 personnes (développeur) × 14 semaines × 578 (taux hebdomadaire) + 1 personne (Scrum Master) × 14 × 578 × 1,15 (bonus de rôle) + 1 personne (Product Owner) × 14 × 578 × 1,05 = 24 300 + 9 315 + 8 505 = **42 120 €**

---

## 6. Risques et points ouverts

### 6.1 Risques

| Risque | Mesure |
| --- | --- |
| Client unique interlocuteur, disponibilité limitée pour valider. | Validation à la fin de chaque release ; questions regroupées. |
| Aucune donnée réelle ni schéma existant. | Modèle de données conçu par l'équipe et validé avec le client dès la V0. |
| Volume horaire limité (15 h par semaine et par personne). | Priorités O / S : la vue en colonnes (EF-14) est la première variable d'ajustement. |
| Règles métier encore en cours de rédaction au sein du collectif. | Points ouverts ci-dessous à faire confirmer par le client. |

### 6.2 Points ouverts

- Choix des technologies (interface, serveur) : à arrêter par l'équipe avant le début de la V0 ; les sections « Backend » et « Frontend » du README sont à compléter en conséquence.
- Délai laissé aux membres avant ouverture à l'extérieur : 2 jours à ce jour, règle en cours de rédaction par le collectif.
- Découpage en releases et calendrier : à valider avec le client.
- Date de début du projet : à renseigner.

---

## 7. Livrables, recette et reprise

### 7.1 Livrables

- L'application, développée et validée en local, puis installée sur le VPS fourni par le client.
- Le dépôt de code, que Koloni forkera en fin de projet.
- Un README permettant de relancer le projet sur une machine vierge.
- Un fichier d'architecture et de conventions de 2 pages.
- Un schéma de base versionné par scripts de migration.
- Une documentation technique en français.
- Le présent cahier des charges et le recueil de besoins.

### 7.2 Recette

Chaque release fait l'objet d'une démonstration au client sur données fictives. La recette finale vérifie, pour chaque exigence obligatoire (O), le fonctionnement du cas d'utilisation associé avec un compte administrateur et un compte membre, ainsi que l'absence d'accès sans connexion.

### 7.3 Reprise

Une fois l'outil validé en local, le client fournit un VPS et les accès pour l'y installer. À l'issue du projet, Koloni reprend la main sur le dépôt et la documentation.
