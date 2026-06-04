const Agence = require("../models/Agence");

exports.getAll = async (req, res) => {
  try {
    res.json(await Agence.findAll());
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const a = await Agence.findById(req.params.id);
    if (!a) return res.status(404).json({ msg: "Agence non trouvée" });
    res.json(a);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.create = async (req, res) => {
  if (!req.body.nom) return res.status(400).json({ msg: "nom requis" });
  try {
    const a = await Agence.create(req.body);
    res.status(201).json(a);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const a = await Agence.update(req.params.id, req.body);
    res.json(a);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Agence.remove(req.params.id);
    res.json({ msg: "Agence supprimée" });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};
