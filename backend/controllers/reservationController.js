const Reservation = require("../models/Reservation");
const Car = require("../models/Car");
const { pool } = require("../config/db");

exports.getOptions = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM reservation_options WHERE is_active=1 ORDER BY prix",
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.create = async (req, res) => {
  const {
    car_id,
    start_date,
    end_date,
    payment_method,
    client_name,
    client_email,
    client_phone,
    client_cin,
    options = [],
  } = req.body;
  if (
    !car_id ||
    !start_date ||
    !end_date ||
    !client_name ||
    !client_phone ||
    !client_cin ||
    !client_email
  )
    return res.status(400).json({ msg: "Tous les champs obligatoires requis" });
  try {
    const car = await Car.findById(car_id);
    if (!car) return res.status(404).json({ msg: "Voiture non trouvée" });
    if (!car.available)
      return res.status(400).json({ msg: "Voiture indisponible" });

    const ok = await Car.isAvailable(car_id, start_date, end_date);
    if (!ok)
      return res
        .status(400)
        .json({ msg: "Voiture déjà réservée pour ces dates" });

    const days = Math.ceil(
      (new Date(end_date) - new Date(start_date)) / 86400000,
    );
    if (days <= 0) return res.status(400).json({ msg: "Dates invalides" });

    const base_price = +(days * car.price_per_day).toFixed(2);
    const options_price = +options
      .reduce((s, o) => s + Number(o.prix || 0), 0)
      .toFixed(2);
    const total_price = +(base_price + options_price).toFixed(2);

    const r = await Reservation.create({
      car_id,
      user_id: req.user.id,
      agence_id: car.agence_id,
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
      options,
    });
    res.status(201).json(r);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.getMine = async (req, res) => {
  try {
    res.json(await Reservation.findAll({ user_id: req.user.id }));
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const r = await Reservation.findById(req.params.id);
    if (!r) return res.status(404).json({ msg: "Non trouvée" });
    const { role, id, agence_id } = req.user;
    if (role === "client" && r.user_id !== id)
      return res.status(403).json({ msg: "Accès refusé" });
    if (
      (role === "chef_agence" || role === "agent") &&
      r.agence_id !== agence_id
    )
      return res.status(403).json({ msg: "Accès refusé" });
    res.json(r);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};
exports.update = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ msg: "Voiture non trouvée" });

    const image = req.file ? `/uploads/cars/${req.file.filename}` : undefined;

    const updated = await Car.update(req.params.id, {
      ...req.body,
      ...(image ? { image } : {}),
    });

    res.json(updated);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};
exports.getManage = async (req, res) => {
  try {
    const { role, agence_id } = req.user;
    const filter =
      role === "admin" ? { ...req.query } : { ...req.query, agence_id };
    res.json(await Reservation.findAll(filter));
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.updateStatus = async (req, res) => {
  const valid = [
    "pending",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
  ];
  if (!valid.includes(req.body.status))
    return res.status(400).json({ msg: "Statut invalide" });
  try {
    const r = await Reservation.findById(req.params.id);
    if (!r) return res.status(404).json({ msg: "Non trouvée" });
    const { role, agence_id } = req.user;
    if (role !== "admin" && r.agence_id !== agence_id)
      return res.status(403).json({ msg: "Accès refusé" });
    res.json(await Reservation.updateStatus(req.params.id, req.body.status));
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.cancelMine = async (req, res) => {
  try {
    const r = await Reservation.findById(req.params.id);
    if (!r) return res.status(404).json({ msg: "Non trouvée" });
    if (r.user_id !== req.user.id)
      return res.status(403).json({ msg: "Accès refusé" });
    if (!["pending", "confirmed"].includes(r.status))
      return res
        .status(400)
        .json({ msg: "Impossible d'annuler dans cet état" });
    res.json(await Reservation.updateStatus(req.params.id, "cancelled"));
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.uploadPhotos = async (req, res) => {
  if (!req.files?.length)
    return res.status(400).json({ msg: "Aucune photo reçue" });
  try {
    const r = await Reservation.findById(req.params.id);
    if (!r) return res.status(404).json({ msg: "Non trouvée" });
    const { role, agence_id } = req.user;
    if (role !== "admin" && r.agence_id !== agence_id)
      return res.status(403).json({ msg: "Accès refusé" });
    const type = req.query.type === "apres" ? "apres" : "avant";
    const existing =
      type === "avant" ? r.photos_avant || [] : r.photos_apres || [];
    const newPaths = req.files.map(
      (f) => `/uploads/reservations/${f.filename}`,
    );
    const merged = [...existing, ...newPaths];
    await Reservation.updatePhotos(req.params.id, type, merged);
    res.json({ photos: merged });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.simulatePayment = async (req, res) => {
  try {
    const r = await Reservation.findById(req.params.id);
    if (!r) return res.status(404).json({ msg: "Non trouvée" });
    if (r.user_id !== req.user.id)
      return res.status(403).json({ msg: "Accès refusé" });
    const success = Math.random() > 0.1;
    await Reservation.updatePayment(req.params.id, success ? "paid" : "failed");
    if (success) await Reservation.updateStatus(req.params.id, "confirmed");
    res.json({
      success,
      msg: success ? "Paiement accepté ✓" : "Paiement refusé, réessayez.",
    });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { role, agence_id } = req.user;
    res.json(await Reservation.getStats(role === "admin" ? {} : { agence_id }));
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};
