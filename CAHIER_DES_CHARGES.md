# Cahier des charges — Système de gestion des projets (INSTI Lokossa)

## 1) Contexte et objectifs
L’INSTI Lokossa souhaite disposer d’une application web pour gérer des **projets institutionnels** : création, suivi, documentation, médias, activités, partenaires, personnel et rattachement à des services.

Objectifs principaux :
- Centraliser les informations projet (description, objectifs, dates, durée, statut).
- Associer **partenaires** (avec rôle) et **personnel** (avec rôle, périodes).
- Structurer l’organisation par **services** (hiérarchie) et **gérants**.
- Mettre en place une gestion des accès par rôles (RBAC).
- Fournir des listes paginées et filtrables.

## 2) Périmètre fonctionnel

### 2.1 Authentification & autorisations
- Authentification par API (Sanctum).
- Rôles utilisateurs (catégories) :
  - `personnel`
  - `chef` (**affiché “chef projet”** dans l’interface)
  - `directeur`
  - `admin` (administrateur)
  - `apprenant`
- Règles d’accès (principes) :
  - `admin` : accès complet (gestion utilisateurs, services, partenaires, projets, etc.).
  - `directeur` : gestion projets + services + partenaires.
  - `chef` : création/gestion de projets selon règles internes.
  - `personnel` / `apprenant` : accès restreint (consultation/participation selon rattachement).

### 2.2 Gestion des utilisateurs
- CRUD utilisateurs (réservé à l’admin).
- Champs attendus (selon schéma actuel) : `nom`, `prenoms` (exposé en `prenom` côté UI), `email`, `password`, `role_id` (via table `roles`), `service_id` (optionnel), `departement_id` (optionnel).
- Affichage en liste avec rôle, département, service.
- **Département** : sélection optionnelle lors de la création/modification.

### 2.3 Départements (INSTI)
- Table `departements` contenant les 5 départements :
  - Génie Electrique et Informatique (GEI)
  - Génie Civil (GC)
  - Génie Mécanique et Productique (GMP)
  - Maintenance des Systèmes (MS)
  - Génie Energétique (GE)
- Endpoint lecture seule pour alimenter le formulaire utilisateur.

### 2.4 Gestion des partenaires
- Table dédiée `partenaires` (les partenaires ne sont pas des users).
- CRUD partenaires (admin + directeur).
- Champs : nom, point de contact, localisation, email, téléphone, description, logo (upload).
- Recherche + pagination.

### 2.5 Gestion des services
- Table `services` :
  - hiérarchie (parent/enfants),
  - types : `service`, `labo_pedagogique`, `labo_recherche`, `atelier`, `division`,
  - code, titre, date création, statut.
- Gestion des gérants via `service_gerants` (manager = utilisateur).
- CRUD services (admin + directeur) avec recherche, filtres et pagination.
- Rattachement optionnel d’un utilisateur à un service (`users.service_id`).

### 2.6 Gestion des projets
Création / modification / consultation projet avec :
- Titre
- Objectif général
- Objectifs spécifiques
- Description
- Dates début/fin + durée calculée
- Chef de projet
- Associations :
  - **Partenaires positionnés** (partenaire + rôle)
  - **Personnel** (user + rôle + date début/fin)
  - **Services** : un projet peut être associé à un ou plusieurs services (pivot `projet_service`)

Remarques UI :
- Le formulaire projet n’affiche plus le champ “Services associés” (selon demande).
- Lors de l’ajout d’un personnel au projet, l’UI affiche le **service du user** et permet de saisir le **rôle** dans le projet.

### 2.7 Détails projet (visualisation)
La page détail projet doit afficher :
- Toutes les informations générales
- Liste des partenaires + rôles
- Liste du personnel + rôles + service
- Liste des services associés
- Onglet “Informations” : inclut aussi un aperçu des dernières activités / médias / documents
- Médias et documents : pagination côté listes.

### 2.8 Journalisation / audit
- Journal d’audit consultable (selon contrôles d’accès définis).

## 3) Exigences non fonctionnelles
- Pagination côté API pour toutes les listes volumineuses (projets, partenaires, médias, documents, services, etc.).
- Filtrage (recherche, statut, dates, service…) selon écrans.
- Gestion des erreurs :
  - Messages d’erreurs explicites côté UI.
  - Validation serveur via FormRequests.
- Upload fichiers (logos partenaires, documents, médias) via Storage Laravel.
- Sécurité :
  - Accès API protégé par `auth:sanctum`.
  - Contrôles d’accès basés sur rôle.

## 4) Architecture technique
- **Backend** : Laravel (API REST)
  - Migrations + seeders
  - Modèles Eloquent + relations
  - FormRequests (validation + autorisation)
  - Resources API (format JSON stable pour le frontend)
- **Frontend** : React + Material UI
  - Pages : projets, détail projet, formulaire projet, partenaires, services, utilisateurs
  - Axios pour API
  - Pagination (MUI Pagination)

## 5) Données / Modèle relationnel (résumé)
- `users` : utilisateurs + rattachement optionnel à `services` et `departements`
- `roles`, `modules` : RBAC / multi-modules (selon schéma)
- `departements` : liste fixe des départements INSTI
- `partenaires` : partenaires externes
- `projets` : entité projet
- `projet_service` : pivot projet ↔ services
- `personnel_projet` : pivot projet ↔ users (rôle + dates)
- `projet_partenaire` (ou équivalent) : pivot projet ↔ partenaires (rôle)
- `services` : arbre organisationnel
- `service_gerants` : gérants (users) des services
- `audit_logs` : journalisation

## 6) Critères d’acceptation (exemples)
- Un **directeur** voit le menu **Partenaires** et peut créer/éditer/supprimer un partenaire.
- Un **directeur** ne voit pas le menu **Utilisateurs**.
- Dans l’UI, le rôle `chef` s’affiche comme **“chef projet”** (liste users + badge top bar + select).
- Le formulaire utilisateur permet de choisir un **département** optionnel depuis une liste de 5 départements.
- Les listes (projets, partenaires, services, médias, documents) affichent une pagination fonctionnelle.

