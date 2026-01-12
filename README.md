# Système de Gestion Numérique des Projets Institutionnels - INSTI Lokossa

Plateforme web complète pour la gestion des projets institutionnels de l'INSTI Lokossa.

## Architecture

- **Backend**: Laravel 12 (PHP 8+)
- **Frontend**: React 19 + Material UI
- **Base de données**: MySQL 8
- **Authentification**: Laravel Sanctum

## Installation

### Prérequis

- PHP 8.1+
- Composer
- Node.js 18+
- MySQL 8+

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Le backend sera accessible sur `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

## Configuration

### Backend (.env)

```env
APP_NAME="INSTI Gestion Projets"
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=insti_projets
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
```

## Structure du projet

```
pgpi1/
├── backend/          # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   └── Models/
│   ├── database/migrations/
│   └── routes/api.php
└── frontend/         # Application React
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── contexts/
    │   └── services/
```

## Fonctionnalités

### Gestion des utilisateurs (RBAC)

- **Admin**: Tous les droits
- **Directeur**: Validation/clôture projets, gestion globale
- **Chef de projet**: CRUD complet sur ses projets
- **Membre**: Lecture + création/modification activités et documents
- **Partenaire**: Lecture seule + dépôt documents
- **Consultation**: Lecture seule

### Modules

1. **Projets**: CRUD complet avec états (planifié, en cours, suspendu, clôturé, archivé)
2. **Activités**: Gestion des activités avec suivi d'avancement et données JSON
3. **Médias**: Upload d'images, vidéos, audios
4. **Documents**: Gestion avec versioning et workflow de validation
5. **Partenaires**: Répertoire centralisé
6. **Personnel**: Assignation avec rôles et périodes

### Tableau de bord

- Statistiques globales
- Projets récents
- Activités à venir
- Projets en retard

## API Endpoints

### Authentification
- `POST /api/login` - Connexion
- `POST /api/register` - Inscription
- `POST /api/logout` - Déconnexion
- `GET /api/user` - Utilisateur actuel

### Projets
- `GET /api/projets` - Liste des projets
- `POST /api/projets` - Créer un projet
- `GET /api/projets/{id}` - Détails d'un projet
- `PUT /api/projets/{id}` - Modifier un projet
- `DELETE /api/projets/{id}` - Supprimer un projet
- `POST /api/projets/{id}/archive` - Archiver
- `POST /api/projets/{id}/cloturer` - Clôturer

### Activités
- `GET /api/projets/{id}/activites` - Liste des activités
- `POST /api/projets/{id}/activites` - Créer une activité
- `PUT /api/activites/{id}` - Modifier une activité
- `DELETE /api/activites/{id}` - Supprimer une activité

### Documents
- `GET /api/projets/{id}/documents` - Liste des documents
- `POST /api/projets/{id}/documents` - Upload document
- `POST /api/documents/{id}/valider` - Valider document
- `POST /api/documents/{id}/rejeter` - Rejeter document

### Médias
- `GET /api/projets/{id}/medias` - Liste des médias
- `POST /api/projets/{id}/medias` - Upload média

### Partenaires
- `GET /api/partenaires` - Liste des partenaires
- `POST /api/partenaires` - Créer un partenaire

### Dashboard
- `GET /api/dashboard` - Statistiques et données du tableau de bord

## Sécurité

- Authentification par tokens (Sanctum)
- Hashage des mots de passe (bcrypt)
- Protection CSRF
- Validation des entrées
- Gestion des permissions par rôle (RBAC)

## Développement

### Migrations

```bash
php artisan migrate
php artisan migrate:refresh --seed
```

### Tests

```bash
php artisan test
```

## Licence

Ce projet est développé pour l'INSTI Lokossa dans le cadre d'un projet académique.

