# Guide d'Installation - Système de Gestion des Projets INSTI Lokossa

## Prérequis

- PHP 8.1 ou supérieur
- Composer
- Node.js 18+ et npm
- MySQL 8+
- Git

## Installation étape par étape

### 1. Cloner le projet

```bash
git clone <repository-url> pgpi1
cd pgpi1
```

### 2. Configuration du Backend (Laravel)

```bash
cd backend

# Installer les dépendances
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Configurer la base de données dans .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=insti_projets
# DB_USERNAME=root
# DB_PASSWORD=votre_mot_de_passe

# Créer la base de données
mysql -u root -p -e "CREATE DATABASE insti_projets;"

# Exécuter les migrations
php artisan migrate

# (Optionnel) Remplir avec des données de test
php artisan db:seed

# Créer le lien symbolique pour le stockage
php artisan storage:link

# Démarrer le serveur
php artisan serve
```

Le backend sera accessible sur `http://localhost:8000`

### 3. Configuration du Frontend (React)

Ouvrir un nouveau terminal :

```bash
cd frontend

# Installer les dépendances
npm install

# Créer le fichier .env
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

## Comptes de test

Après avoir exécuté `php artisan db:seed`, vous pouvez vous connecter avec :

- **Admin**: admin@insti.bj / password
- **Directeur**: directeur@insti.bj / password
- **Chef de projet**: chef.projet@insti.bj / password
- **Membre**: membre@insti.bj / password

## Configuration avancée

### Configuration CORS

Dans `backend/.env`, ajouter :

```env
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000
SESSION_DOMAIN=localhost
```

### Configuration du stockage

Les fichiers uploadés seront stockés dans `backend/storage/app/public/`.

Assurez-vous que le dossier `storage` est accessible en écriture :

```bash
chmod -R 775 backend/storage
chmod -R 775 backend/bootstrap/cache
```

## Production

### Build du frontend

```bash
cd frontend
npm run build
```

Les fichiers seront générés dans `frontend/dist/`.

### Configuration serveur web

Pour la production, configurez votre serveur web (Apache/Nginx) pour :
- Servir le frontend depuis `frontend/dist/`
- Rediriger les requêtes API vers `backend/public/`

### Variables d'environnement production

Dans `backend/.env` :

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-domaine.com
```

## Dépannage

### Erreur "Storage link not found"

```bash
cd backend
php artisan storage:link
```

### Erreur CORS

Vérifier que `SANCTUM_STATEFUL_DOMAINS` dans `.env` contient votre domaine frontend.

### Erreur de connexion à la base de données

Vérifier les paramètres dans `backend/.env` et s'assurer que MySQL est démarré.

## Support

Pour toute question ou problème, contacter l'équipe de développement.

