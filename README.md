## Système de Réservation d'Équipement de Laboratoire

Une application web pour gérer les réservations d'équipement de laboratoire avec authentification utilisateur et fonctionnalités d'administration.

## Fonctionnalités

1. **Authentification et Gestion des Utilisateurs**
   - Inscription et connexion des utilisateurs
   - Authentification basée sur JWT
   - Fonctionnalité de réinitialisation de mot de passe
   - Rôles d'utilisateur (Administrateur et Utilisateur)

2. **Gestion d'Équipement**
   - Ajouter, mettre à jour et supprimer des équipements
   - Détails de l'équipement : nom, description, numéro de série, photo, statut
   - Catégories d'équipement

3. **Système de Réservation**
   - Demander des réservations d'équipement
   - Flux de travail d'approbation administrateur
   - Gestion du processus de retour
   - Détection de conflits

4. **Notifications par Email**
   - Confirmation d'inscription
   - Mises à jour du statut de réservation
   - Rappels de retour
   - Réinitialisation de mot de passe

## Technologies Utilisées

- **Backend**: Node.js, Express.js
- **Base de données**: MongoDB avec Mongoose
- **Authentification**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **Téléchargement de fichiers**: Multer
- **Validation**: Express-validator

## Configuration

1. **Cloner le dépôt**

2. **Installer les dépendances**
   ```
   npm install
   ```

3. **Configurer les variables d'environnement**
   Créez un fichier `.env` dans le répertoire racine avec les variables suivantes :
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/lab-equipment
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=your_email@gmail.com
   NODE_ENV=development
   ```

4. **Démarrer MongoDB**
   Assurez-vous que MongoDB fonctionne sur votre machine ou utilisez MongoDB Atlas.

5. **Exécuter l'application**
   - Mode développement :
     ```
     npm run dev
     ```
   - Mode production :
     ```
     npm start
     ```

## Points de Terminaison API

### Authentification
- `POST /api/auth/register` - Inscrire un nouvel utilisateur
- `POST /api/auth/login` - Se connecter et obtenir un token
- `GET /api/auth/me` - Obtenir les informations de l'utilisateur actuel
- `POST /api/auth/forgot-password` - Demander une réinitialisation de mot de passe
- `POST /api/auth/reset-password` - Réinitialiser le mot de passe

### Utilisateurs
- `GET /api/users` - Obtenir tous les utilisateurs (Administrateur uniquement)
- `GET /api/users/:id` - Obtenir un utilisateur par ID
- `PUT /api/users/:id` - Mettre à jour un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur (Administrateur uniquement)
- `PUT /api/users/:id/change-password` - Changer le mot de passe

### Équipement
- `GET /api/equipment` - Obtenir tout l'équipement
- `GET /api/equipment/categories` - Obtenir les catégories d'équipement
- `GET /api/equipment/:id` - Obtenir un équipement par ID
- `POST /api/equipment` - Créer un équipement (Administrateur uniquement)
- `PUT /api/equipment/:id` - Mettre à jour un équipement (Administrateur uniquement)
- `DELETE /api/equipment/:id` - Supprimer un équipement (Administrateur uniquement)

### Réservations
- `GET /api/reservations` - Obtenir toutes les réservations
- `GET /api/reservations/statistics` - Obtenir les statistiques de réservation (Administrateur uniquement)
- `GET /api/reservations/:id` - Obtenir une réservation par ID
- `POST /api/reservations` - Créer une nouvelle réservation
- `PUT /api/reservations/:id/status` - Mettre à jour le statut de réservation (Administrateur uniquement)
- `PUT /api/reservations/:id/return` - Retourner l'équipement
- `PUT /api/reservations/:id/cancel` - Annuler la réservation

