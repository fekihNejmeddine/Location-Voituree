const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.getAll = async (req, res) => {
  try {
    // Chef/agent can only see users of their agency
    const { role, agence_id } = req.user;
    const filter = { ...req.query };
    if (role === "chef_agence") filter.agence_id = agence_id;
    res.json(await User.findAll(filter));
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.create = async (req, res) => {
  const { name, email, password, phone, cin, role, agence_id } = req.body;
  if (!name || !email)
    return res.status(400).json({ msg: "name et email requis" });
  try {
    if (await User.findByEmail(email))
      return res.status(400).json({ msg: "Email déjà utilisé" });
    const hash = await bcrypt.hash(password || "Password123!", 10);
    const user = await User.create({
      name,
      email,
      password: hash,
      phone,
      cin,
      role,
      agence_id,
    });
    res.status(201).json(user);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.update(req.params.id, req.body);
    res.json(user);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id)
      return res
        .status(400)
        .json({ msg: "Vous ne pouvez pas vous supprimer vous-même" });
    await User.remove(req.params.id);
    res.json({ msg: "Utilisateur supprimé" });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "Non trouvé" });
    const updated = await User.update(req.params.id, {
      is_active: user.is_active ? 0 : 1,
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};
