-- =============================================================================
-- KOLONI CRM - Vues
-- Consultants (membres et profils extérieurs), date d'ouverture à l'extérieur,
-- dernière sollicitation d'un profil extérieur, et vues de lecture (opportunités, contacts,
-- profils extérieurs, membres).
-- =============================================================================

BEGIN;

-- Dernière fois où on a fait appel à chaque profil (un profil jamais sollicité n'apparaît pas)
CREATE VIEW profil_exterieur_derniere_sollicitation AS
SELECT DISTINCT ON (profil_exterieur_id)
       profil_exterieur_id, opportunite_id, sollicite_par_id, date_sollicitation, issue
FROM profil_exterieur_opportunite
ORDER BY profil_exterieur_id, date_sollicitation DESC, opportunite_id DESC;

COMMENT ON VIEW profil_exterieur_derniere_sollicitation IS
    'Une ligne par profil extérieur déjà sollicité : sa sollicitation la plus récente (date, opportunité, issue).';

-- Consultants : membres et profils extérieurs réunis dans une seule liste, sans fusionner les tables.
-- Un profil extérieur relié à un compte membre (membre_id) n'est repris que par sa ligne de membre.
-- Les identifiants viennent de deux tables : une personne se reconnaît par (origine, id).
CREATE VIEW consultant AS
SELECT 'membre' AS origine, m.id, m.nom, m.prenom, m.ville, m.lien_linkedin,
       m.disponibilite, m.actif
FROM membre m
UNION ALL
SELECT 'exterieur', p.id, p.nom, p.prenom, p.ville, p.lien_linkedin,
       p.disponibilite, TRUE
FROM profil_exterieur p
WHERE p.membre_id IS NULL;

COMMENT ON VIEW consultant IS
    'Tous les consultants en une liste : membres du collectif (origine membre) et profils extérieurs pas encore membres (origine exterieur). La disponibilité d''un membre est un état (inconnu, en_recherche, a_l_ecoute, en_mission) ; celle d''un profil extérieur est un texte libre.';

-- Date à partir de laquelle une opportunité peut s'ouvrir hors du collectif : la date de qualification
-- plus le délai laissé aux membres (2 jours calendaires à ce jour, règle encore en cours de rédaction
-- chez le client). Rien n'est stocké. La date de qualification est lue à l'heure de Paris : sans cela,
-- le jour dépendrait du fuseau de la session. Une opportunité en interne strict ne s'ouvre jamais à
-- l'extérieur, et une opportunité non qualifiée n'a pas encore de date.
CREATE VIEW opportunite_ouverture AS
SELECT id,
       (date_qualification AT TIME ZONE 'Europe/Paris')::date + 2 AS date_ouverture_exterieur
FROM opportunite
WHERE niveau_diffusion <> 'interne_strict' AND date_qualification IS NOT NULL;

COMMENT ON VIEW opportunite_ouverture IS
    'Date d''ouverture à l''extérieur du collectif, calculée : date de qualification + 2 jours calendaires. Absente pour une opportunité en interne_strict ou pas encore qualifiée.';

-- Opportunités : apporteur, client final, technologies (la principale d'abord), qualification
CREATE VIEW opportunite_resume AS
SELECT o.id,
       o.titre,
       o.statut,
       ARRAY(
           SELECT t.nom
           FROM opportunite_technologie ot
           JOIN technologie t ON t.id = ot.technologie_id
           WHERE ot.opportunite_id = o.id
           ORDER BY ot.est_principale DESC, t.nom
       ) AS technologies,
       o.ville,
       o.mode,
       ec.nom AS client_final,
       m.prenom || ' ' || left(m.nom, 1) || '.' AS apporteur,
       o.temperature,
       o.date_signal,
       o.niveau_diffusion,
       o.lien_annonce_exterieure,
       o.date_qualification,
       ou.date_ouverture_exterieur
FROM opportunite o
JOIN membre m ON m.id = o.apporteur_id
LEFT JOIN entreprise_cliente ec ON ec.id = o.client_final_id
LEFT JOIN opportunite_ouverture ou ON ou.id = o.id;

COMMENT ON VIEW opportunite_resume IS
    'Une ligne par opportunité : technologies (la principale d''abord), client final, apporteur sous la forme « Prénom N. », qualification et date d''ouverture à l''extérieur. Statut, mode et température sont les codes stockés.';

-- Contacts clients avec le nom de leur entreprise
CREATE VIEW contact_resume AS
SELECT c.id, c.nom, c.prenom, c.role, e.nom AS entreprise, c.mail, c.telephone, c.lien_linkedin
FROM contact c
LEFT JOIN entreprise_cliente e ON e.id = c.entreprise_cliente_id;

COMMENT ON VIEW contact_resume IS
    'Une ligne par contact client, avec le nom de son entreprise (vide si elle n''est pas renseignée).';

-- Profils extérieurs avec leurs technologies et leur dernière sollicitation
CREATE VIEW profil_exterieur_resume AS
SELECT p.id,
       p.nom,
       p.prenom,
       ARRAY(
           SELECT t.nom
           FROM profil_exterieur_technologie pt
           JOIN technologie t ON t.id = pt.technologie_id
           WHERE pt.profil_exterieur_id = p.id
           ORDER BY t.nom
       ) AS technologies,
       p.ville,
       p.disponibilite,
       s.date_sollicitation,
       s.issue
FROM profil_exterieur p
LEFT JOIN profil_exterieur_derniere_sollicitation s ON s.profil_exterieur_id = p.id;

COMMENT ON VIEW profil_exterieur_resume IS
    'Une ligne par profil extérieur : technologies par ordre alphabétique, date et issue de la dernière sollicitation (vides s''il n''a jamais été sollicité).';

-- Membres sans le mot de passe haché : la connexion est la seule lecture qui en a besoin
CREATE VIEW membre_resume AS
SELECT id, nom, prenom, mail, telephone, lien_linkedin, role, ville, actif,
       disponibilite, date_disponibilite, dispo_confirmee_le, notes, date_creation
FROM membre;

COMMENT ON VIEW membre_resume IS
    'Les comptes membres sans l''empreinte du mot de passe.';

COMMIT;
