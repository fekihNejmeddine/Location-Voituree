const { pool } = require('../config/db');

const User = {
  // Trouver un utilisateur par email
  findByEmail: async (email) => {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  // Trouver un utilisateur par ID
  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // Créer un nouvel utilisateur
  create: async ({ name, email, password, phone = null }) => {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, password, phone]
    );
    return { id: result.insertId, name, email, phone, role: 'user' };
  },

  // Mettre à jour le profil
  update: async (id, { name, phone }) => {
    await pool.execute(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name, phone, id]
    );
    return User.findById(id);
  },

  // Lister tous les utilisateurs (admin)
  findAll: async () => {
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  },
};

module.exports = User;
