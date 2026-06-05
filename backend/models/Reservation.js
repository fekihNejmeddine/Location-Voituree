const { pool } = require("../config/db");

const BASE_SELECT = `
  SELECT r.*,
         c.brand, c.model, c.year, c.image AS car_image,
         a.nom AS agence_nom, a.ville AS agence_ville,
         u.name AS user_name, u.email AS user_email
  FROM reservations r
  JOIN cars    c ON r.car_id    = c.id
  JOIN agences a ON r.agence_id = a.id
  JOIN users   u ON r.user_id = u.id
`;

const withOptions = async (res) => {
  if (!res) return null;
  const [opts] = await pool.execute(
    `SELECT oi.*, ro.nom, ro.icone
     FROM reservation_option_items oi JOIN reservation_options ro ON oi.option_id=ro.id
     WHERE oi.reservation_id=?`,
    [res.id],
  );
  return {
    ...res,
    options: opts,
    photos_avant: res.photos_avant ? JSON.parse(res.photos_avant) : [],
    photos_apres: res.photos_apres ? JSON.parse(res.photos_apres) : [],
  };
};

const Reservation = {
  create: async ({
    car_id,
    user_id,
    agence_id,
    client_name,
    client_email,
    client_phone,
    client_cin,
    start_date,
    end_date,
    payment_method = "sur_place",
    base_price,
    options_price = 0,
    total_price,
    options = [],
  }) => {
    const [r] = await pool.execute(
      `INSERT INTO reservations
         (car_id,user_id,agence_id,client_name,client_email,client_phone,client_cin,
          start_date,end_date,payment_method,base_price,options_price,total_price)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        car_id,
        user_id,
        agence_id,
        client_name,
        client_email,
        client_phone,
        client_cin,
        start_date,
        end_date,
        payment_method,
        base_price,
        options_price,
        total_price,
      ],
    );
    const id = r.insertId;
    for (const opt of options) {
      await pool.execute(
        "INSERT INTO reservation_option_items(reservation_id,option_id,prix_unitaire) VALUES(?,?,?)",
        [id, opt.id, opt.prix],
      );
    }
    return Reservation.findById(id);
  },

  findById: async (id) => {
    const [r] = await pool.execute(`${BASE_SELECT} WHERE r.id=?`, [id]);
    return withOptions(r[0] || null);
  },

  findAll: async ({ agence_id, user_id, status, car_id } = {}) => {
    let q = `${BASE_SELECT} WHERE 1=1`;
    const p = [];
    if (agence_id) {
      q += " AND r.agence_id=?";
      p.push(parseInt(agence_id));
    }
    if (user_id) {
      q += " AND r.user_id=?";
      p.push(parseInt(user_id));
    }
    if (status) {
      q += " AND r.status=?";
      p.push(status);
    }
    if (car_id) {
      q += " AND r.car_id=?";
      p.push(parseInt(car_id));
    }
    q += " ORDER BY r.created_at DESC";
    const [rows] = await pool.execute(q, p);
    return rows; // list view doesn't need full options detail
  },

  updateStatus: async (id, status) => {
    await pool.execute("UPDATE reservations SET status=? WHERE id=?", [
      status,
      id,
    ]);
    return Reservation.findById(id);
  },

  updatePayment: async (id, status) =>
    pool.execute("UPDATE reservations SET payment_status=? WHERE id=?", [
      status,
      id,
    ]),

  updatePhotos: async (id, type, paths) => {
    const col = type === "avant" ? "photos_avant" : "photos_apres";
    await pool.execute(`UPDATE reservations SET ${col}=? WHERE id=?`, [
      JSON.stringify(paths),
      id,
    ]);
  },

  getStats: async ({ agence_id } = {}) => {
    const where = agence_id ? `WHERE agence_id=${parseInt(agence_id)}` : "";
    const [r] = await pool.execute(`
      SELECT
        COUNT(*)                                              AS total,
        SUM(status='pending')                                AS pending,
        SUM(status='confirmed')                              AS confirmed,
        SUM(status='in_progress')                            AS in_progress,
        SUM(status='completed')                              AS completed,
        SUM(status='cancelled')                              AS cancelled,
        COALESCE(SUM(IF(status!='cancelled',total_price,0)),0) AS revenue
      FROM reservations ${where}`);
    return r[0];
  },
};

module.exports = Reservation;
