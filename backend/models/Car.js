const { pool } = require("../config/db");

const Car = {
  findAll: async ({
    agence_id,
    category,
    maxPrice,
    available,
    search,
    transmission,
  } = {}) => {
    let q = `SELECT c.*, a.nom AS agence_nom, a.ville AS agence_ville
             FROM cars c JOIN agences a ON c.agence_id=a.id WHERE 1=1`;
    const p = [];
    if (agence_id) {
      q += " AND c.agence_id=?";
      p.push(parseInt(agence_id));
    }
    if (category) {
      q += " AND c.category=?";
      p.push(category);
    }
    if (maxPrice) {
      q += " AND c.price_per_day<=?";
      p.push(Number(maxPrice));
    }
    if (transmission) {
      q += " AND c.transmission=?";
      p.push(transmission);
    }
    if (available !== undefined) {
      q += " AND c.available=?";
      p.push(available ? 1 : 0);
    }
    if (search) {
      q += " AND (c.brand LIKE ? OR c.model LIKE ?)";
      p.push(`%${search}%`, `%${search}%`);
    }
    q += " ORDER BY c.created_at DESC";
    const [r] = await pool.execute(q, p);
    return r;
  },

  findById: async (id) => {
    const [r] = await pool.execute(
      `SELECT c.*, a.nom AS agence_nom, a.ville AS agence_ville, a.phone AS agence_phone
       FROM cars c JOIN agences a ON c.agence_id=a.id WHERE c.id=?`,
      [id],
    );
    return r[0] || null;
  },

  create: async (data) => {
    const {
      agence_id,
      brand,
      model,
      year,
      price_per_day,
      category,
      transmission = "manuelle",
      seats = 5,
      fuel = "essence",
      color = null,
      plate = null,
      mileage = 0,
      description = null,
      image = null,
    } = data;
    const [r] = await pool.execute(
      `INSERT INTO cars(agence_id,brand,model,year,price_per_day,category,
                        transmission,seats,fuel,color,plate,mileage,description,image)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        agence_id,
        brand,
        model,
        year,
        price_per_day,
        category,
        transmission,
        seats,
        fuel,
        color,
        plate,
        mileage,
        description,
        image,
      ],
    );
    return Car.findById(r.insertId);
  },

  update: async (id, fields) => {
    const allowed = [
      "brand",
      "model",
      "year",
      "price_per_day",
      "category",
      "transmission",
      "seats",
      "fuel",
      "color",
      "plate",
      "mileage",
      "description",
      "image",
      "available",
    ];
    const sets = [];
    const vals = [];
    for (const k of allowed)
      if (fields[k] !== undefined) {
        sets.push(`${k}=?`);
        vals.push(fields[k]);
      }
    if (!sets.length) return Car.findById(id);
    vals.push(id);
    await pool.execute(`UPDATE cars SET ${sets.join(",")} WHERE id=?`, vals);
    return Car.findById(id);
  },

  remove: async (id) => pool.execute("DELETE FROM cars WHERE id=?", [id]),

  isAvailable: async (carId, start, end, excludeId = null) => {
    let q = `SELECT COUNT(*) AS cnt FROM reservations
             WHERE car_id=? AND status NOT IN('cancelled','completed')
             AND start_date < ? AND end_date > ?`;
    const p = [carId, end, start];
    if (excludeId) {
      q += " AND id!=?";
      p.push(excludeId);
    }
    const [r] = await pool.execute(q, p);
    return r[0].cnt === 0;
  },
};

module.exports = Car;
