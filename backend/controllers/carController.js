const Car = require("../models/Car");

// Public: all available cars (for website visitors)
exports.getPublic = async (req, res) => {
  try {
    res.json(await Car.findAll({ ...req.query, available: true }));
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

// Staff: cars filtered by agency
exports.getAll = async (req, res) => {
  try {
    const { role, agence_id } = req.user;
    const filter = { ...req.query };
    if (role === "chef_agence" || role === "agent")
      filter.agence_id = agence_id;
    res.json(await Car.findAll(filter));
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ msg: "Voiture non trouvée" });
    res.json(car);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.checkAvailability = async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end)
    return res.status(400).json({ msg: "start et end requis" });
  try {
    const ok = await Car.isAvailable(req.params.id, start, end);
    res.json({ available: ok });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { role, agence_id: userAgence } = req.user;
    const agence_id = role === "admin" ? req.body.agence_id : userAgence;
    if (!agence_id) return res.status(400).json({ msg: "agence_id requis" });
    const image = req.file ? `/uploads/cars/${req.file.filename}` : null;
    const car = await Car.create({ ...req.body, agence_id, image });
    res.status(201).json(car);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ msg: "Voiture non trouvée" });
    const { role, agence_id } = req.user;
    if (role !== "admin" && car.agence_id !== agence_id)
      return res.status(403).json({ msg: "Accès refusé" });
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

exports.remove = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ msg: "Voiture non trouvée" });
    const { role, agence_id } = req.user;
    if (role !== "admin" && car.agence_id !== agence_id)
      return res.status(403).json({ msg: "Accès refusé" });
    await Car.remove(req.params.id);
    res.json({ msg: "Voiture supprimée" });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.toggleAvailable = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ msg: "Non trouvée" });
    const updated = await Car.update(req.params.id, {
      available: car.available ? 0 : 1,
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};
