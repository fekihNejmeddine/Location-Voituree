# Backend - Application de Location de Voiture
API REST avec Node.js, Express et MySQL

## Structure
```
backend/
├── config/
│   ├── db.js           → Connexion MySQL (pool de connexions)
│   └── schema.sql      → Script SQL pour créer les tables
├── models/
│   ├── User.js         → Requêtes SQL utilisateurs
│   ├── Car.js          → Requêtes SQL voitures
│   └── Reservation.js  → Requêtes SQL réservations
├── controllers/
│   ├── authController.js
│   ├── carController.js
│   └── reservationController.js
├── routes/
│   ├── auth.js
│   ├── cars.js
│   └── reservations.js
├── middleware/
│   └── authMiddleware.js  → Vérification JWT + rôle admin
├── .env                   → Variables d'environnement (NE PAS commiter)
├── .env.example           → Modèle .env
├── server.js              → Point d'entrée
└── package.json
```

## Installation

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer la base de données MySQL
- Ouvrir phpMyAdmin (XAMPP) ou MySQL Workbench
- Exécuter le fichier `config/schema.sql`
- Cela crée la base de données, les tables et quelques données de test

### 3. Configurer le fichier .env
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=location_voiture
JWT_SECRET=monSecretJWT_TresLong2024
```

### 4. Démarrer le serveur
```bash
npm run dev    # développement (nodemon)
npm start      # production
```

## Routes API

### Authentification
| Méthode | Route              | Description         | Auth |
|---------|--------------------|---------------------|------|
| POST    | /api/auth/register | Inscription         | Non  |
| POST    | /api/auth/login    | Connexion           | Non  |
| GET     | /api/auth/me       | Profil connecté     | Oui  |

### Voitures
| Méthode | Route                        | Description              | Auth  |
|---------|------------------------------|--------------------------|-------|
| GET     | /api/cars                    | Liste toutes             | Non   |
| GET     | /api/cars/:id                | Détail une voiture       | Non   |
| GET     | /api/cars/:id/availability   | Vérif. disponibilité     | Non   |
| POST    | /api/cars                    | Ajouter                  | Admin |
| PUT     | /api/cars/:id                | Modifier                 | Admin |
| DELETE  | /api/cars/:id                | Supprimer                | Admin |

### Réservations
| Méthode | Route                        | Description              | Auth  |
|---------|------------------------------|--------------------------|-------|
| POST    | /api/reservations            | Créer une réservation    | User  |
| GET     | /api/reservations/mes        | Mes réservations         | User  |
| GET     | /api/reservations/:id        | Détail réservation       | User  |
| PUT     | /api/reservations/:id/cancel | Annuler                  | User  |
| GET     | /api/reservations/admin/all  | Toutes (admin)           | Admin |
| GET     | /api/reservations/admin/stats| Statistiques (admin)     | Admin |
| PUT     | /api/reservations/:id/confirm| Confirmer (admin)        | Admin |

## Exemples de requêtes (Thunder Client / Postman)

### Inscription
POST http://localhost:5000/api/auth/register
```json
{
  "name": "Ahmed Ben Ali",
  "email": "ahmed@email.com",
  "password": "monMotDePasse123"
}
```

### Connexion
POST http://localhost:5000/api/auth/login
```json
{
  "email": "ahmed@email.com",
  "password": "monMotDePasse123"
}
```

### Créer une réservation
POST http://localhost:5000/api/reservations
Header: Authorization: Bearer <token>
```json
{
  "car_id": 1,
  "start_date": "2025-06-01",
  "end_date": "2025-06-05"
}
```
