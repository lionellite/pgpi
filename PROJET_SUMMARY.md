# Résumé du Projet - Système de Gestion des Projets INSTI Lokossa

## Vue d'ensemble

Système complet de gestion numérique des projets institutionnels développé pour l'INSTI Lokossa avec une architecture moderne et sécurisée.

## Technologies utilisées

### Backend
- **Laravel 12** (PHP 8+)
- **Laravel Sanctum** pour l'authentification API
- **MySQL 8** pour la base de données
- **Eloquent ORM** pour les modèles

### Frontend
- **React 19** avec hooks
- **Material UI v7** pour l'interface utilisateur
- **React Router v7** pour la navigation
- **Axios** pour les appels API
- **Vite** comme build tool

## Architecture

### Backend (API REST)

#### Modèles de données
1. **User** - Utilisateurs avec rôles RBAC
2. **Projet** - Projets institutionnels
3. **ActiviteProjet** - Activités liées aux projets
4. **MediaProjet** - Médias (images, vidéos, audios)
5. **DocumentProjet** - Documents avec versioning
6. **Partenaire** - Partenaires externes
7. **Pivot tables** - Relations many-to-many

#### Contrôleurs API
- `AuthController` - Authentification (login, register, logout)
- `ProjetController` - CRUD projets + gestion personnel/partenaires
- `ActiviteProjetController` - Gestion des activités
- `MediaProjetController` - Upload et gestion des médias
- `DocumentProjetController` - Gestion documents avec validation
- `PartenaireController` - CRUD partenaires
- `DashboardController` - Statistiques et données du tableau de bord

#### Sécurité
- Authentification par tokens (Sanctum)
- Middleware RBAC pour les permissions
- Validation des entrées
- Protection CSRF
- Hashage bcrypt pour les mots de passe

### Frontend (SPA React)

#### Structure
```
src/
├── components/     # Composants réutilisables
│   └── Layout.jsx  # Layout principal avec navigation
├── contexts/       # Contextes React
│   └── AuthContext.jsx  # Gestion de l'authentification
├── pages/         # Pages de l'application
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Projets.jsx
│   └── ProjetDetail.jsx
└── services/      # Services API
    └── api.js     # Configuration Axios
```

#### Fonctionnalités
- Authentification avec tokens
- Tableau de bord avec statistiques
- Liste et détails des projets
- Interface responsive (Material UI)
- Gestion des erreurs et loading states

## Fonctionnalités implémentées

### ✅ Authentification & Autorisation
- Login/Logout
- Inscription
- Réinitialisation de mot de passe
- RBAC (6 rôles différents)
- Protection des routes

### ✅ Gestion des Projets
- CRUD complet
- États (planifié, en cours, suspendu, clôturé, archivé)
- Upload d'images multiples
- Assignation chef de projet
- Filtres et recherche

### ✅ Gestion des Activités
- CRUD activités
- Suivi d'avancement (pourcentage)
- Types prédéfinis
- Données JSON libres
- Dates début/fin

### ✅ Gestion des Médias
- Upload images, vidéos, audios, documents
- Prévisualisation
- Gestion des fichiers

### ✅ Gestion des Documents
- Upload avec versioning
- Workflow de validation (brouillon → en attente → validé/rejeté)
- Types de documents
- Historique des modifications

### ✅ Gestion des Partenaires
- Répertoire centralisé
- Association aux projets
- Rôles et types de partenariat

### ✅ Gestion du Personnel
- Assignation aux projets
- Rôles et périodes
- Gestion des membres d'équipe

### ✅ Tableau de bord
- Statistiques globales
- Projets récents
- Activités à venir (7 jours)
- Projets en retard
- Avancement moyen

## Rôles et permissions (RBAC)

| Rôle | Permissions |
|------|-------------|
| **Admin** | Tous les droits sur toute l'application |
| **Directeur** | Créer/Valider/Clôturer projets, voir tous les projets |
| **Chef de projet** | CRUD complet sur ses projets + activités, médias, documents |
| **Membre** | Lire projets + créer/modifier activités et documents |
| **Partenaire** | Lecture seule + dépôt documents dans espace dédié |
| **Consultation** | Lecture seule de tous les projets ou projets publics |

## Base de données

### Tables principales
- `users` - Utilisateurs
- `projets` - Projets
- `activite_projet` - Activités
- `media_projet` - Médias
- `document_projet` - Documents
- `partenaires` - Partenaires
- `partenaire_projet` - Relation projets-partenaires
- `personnel_projet` - Relation projets-personnel

## API Endpoints principaux

```
POST   /api/login
POST   /api/register
POST   /api/logout
GET    /api/user
GET    /api/dashboard

GET    /api/projets
POST   /api/projets
GET    /api/projets/{id}
PUT    /api/projets/{id}
DELETE /api/projets/{id}
POST   /api/projets/{id}/archive
POST   /api/projets/{id}/cloturer

GET    /api/projets/{id}/activites
POST   /api/projets/{id}/activites
PUT    /api/activites/{id}
DELETE /api/activites/{id}

GET    /api/projets/{id}/documents
POST   /api/projets/{id}/documents
POST   /api/documents/{id}/valider
POST   /api/documents/{id}/rejeter

GET    /api/projets/{id}/medias
POST   /api/projets/{id}/medias

GET    /api/partenaires
POST   /api/partenaires
```

## Prochaines étapes (Fonctionnalités avancées)

- [ ] Notifications par email
- [ ] Export PDF/Excel des projets
- [ ] Calendrier global des activités
- [ ] Graphiques d'avancement
- [ ] Recherche avancée avec filtres multiples
- [ ] Gestion des budgets
- [ ] Journalisation des actions
- [ ] API de reporting

## Installation

Voir `INSTALLATION.md` pour les instructions détaillées.

## Structure du projet

```
pgpi1/
├── backend/          # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   └── Http/Middleware/
│   ├── database/migrations/
│   └── routes/api.php
├── frontend/        # Application React
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── contexts/
│       └── services/
├── README.md
├── INSTALLATION.md
└── PROJET_SUMMARY.md
```

## Notes importantes

1. **Sécurité**: Tous les endpoints sont protégés par authentification Sanctum
2. **Permissions**: Les permissions sont vérifiées côté serveur dans chaque contrôleur
3. **Stockage**: Les fichiers sont stockés dans `backend/storage/app/public/`
4. **CORS**: Configuré pour accepter les requêtes depuis le frontend
5. **Validation**: Toutes les entrées sont validées côté serveur

## Support

Pour toute question ou problème, consulter la documentation ou contacter l'équipe de développement.

