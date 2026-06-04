-- ============================================
-- Base de données : location_voiture
-- Exécutez ce fichier dans phpMyAdmin ou MySQL Workbench
-- ============================================

CREATE DATABASE IF NOT EXISTS location_voiture
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE location_voiture;

-- ============================================
-- Table : users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  phone      VARCHAR(20)   DEFAULT NULL,
  role       ENUM('user','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Table : cars
-- ============================================
CREATE TABLE IF NOT EXISTS cars (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  brand        VARCHAR(100) NOT NULL,
  model        VARCHAR(100) NOT NULL,
  year         INT          NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  category     ENUM('economique','berline','SUV','luxe') NOT NULL,
  transmission ENUM('manuelle','automatique') DEFAULT 'manuelle',
  seats        INT DEFAULT 5,
  fuel         ENUM('essence','diesel','electrique','hybride') DEFAULT 'essence',
  image        VARCHAR(255) DEFAULT NULL,
  description  TEXT         DEFAULT NULL,
  available    TINYINT(1)   DEFAULT 1,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Table : reservations
-- ============================================
CREATE TABLE IF NOT EXISTS reservations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT  NOT NULL,
  car_id      INT  NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status      ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (car_id)  REFERENCES cars(id)   ON DELETE CASCADE
);

-- ============================================
-- Données de test : quelques voitures
-- ============================================
INSERT INTO cars (brand, model, year, price_per_day, category, transmission, seats, fuel) VALUES
('Renault',  'Clio',       2022, 50.00,  'economique', 'manuelle',    5, 'essence'),
('Peugeot',  '308',        2021, 65.00,  'berline',    'automatique', 5, 'diesel'),
('Toyota',   'RAV4',       2023, 90.00,  'SUV',        'automatique', 5, 'hybride'),
('Mercedes', 'Classe C',   2022, 150.00, 'luxe',       'automatique', 5, 'essence'),
('Dacia',    'Sandero',    2023, 40.00,  'economique', 'manuelle',    5, 'essence'),
('Volkswagen','Tiguan',    2022, 85.00,  'SUV',        'automatique', 5, 'diesel');

-- ============================================
-- Compte admin de test (password: Admin123!)
-- ============================================
INSERT INTO users (name, email, password, role) VALUES
('Administrateur', 'admin@location.com',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'admin');
