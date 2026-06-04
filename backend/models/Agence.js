const { pool } = require("../config/db");

const Agence = {
  findAll: async () => {
    const [r] = await pool.execute(`
      SELECT a.*,
        (SELECT COUNT(*) FROM users  WHERE agence_id=a.id AND role='chef_agence') AS nb_chefs,
        (SELECT COUNT(*) FROM users  WHERE agence_id=a.id AND role='agent')       AS nb_agents,
        (SELECT COUNT(*) FROM cars   WHERE agence_id=a.id)                        AS nb_cars,
        (SELECT COUNT(*) FROM reservations WHERE agence_id=a.id)                  AS nb_reservations
      FROM agences a ORDER BY a.created_at DESC`);
    return r;
  },

  findById: async (id) => {
    const [r] = await pool.execute("SELECT * FROM agences WHERE id=?", [id]);
    return r[0] || null;
  },

  create: async ({
    nom,
    adresse = null,
    ville = null,
    phone = null,
    email = null,
    description = null,
  }) => {
    const [r] = await pool.execute(
      "INSERT INTO agences(nom,adresse,ville,phone,email,description) VALUES(?,?,?,?,?,?)",
      [nom, adresse, ville, phone, email, description],
    );
    return Agence.findById(r.insertId);
  },

  update: async (id, fields) => {
    const allowed = [
      "nom",
      "adresse",
      "ville",
      "phone",
      "email",
      "description",
      "logo",
      "is_active",
    ];
    const sets = [];
    const vals = [];
    for (const k of allowed)
      if (fields[k] !== undefined) {
        sets.push(`${k}=?`);
        vals.push(fields[k]);
      }
    if (!sets.length) return Agence.findById(id);
    vals.push(id);
    await pool.execute(`UPDATE agences SET ${sets.join(",")} WHERE id=?`, vals);
    return Agence.findById(id);
  },

  remove: async (id) => pool.execute("DELETE FROM agences WHERE id=?", [id]),
};

module.exports = Agence;
