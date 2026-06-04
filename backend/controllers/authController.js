const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const sign = (u) =>
  jwt.sign(
    { id: u.id, role: u.role, agence_id: u.agence_id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

exports.register = async (req, res) => {
  const { name, email, password, phone, cin } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ msg: "name, email et password sont requis" });
  try {
    if (await User.findByEmail(email))
      return res.status(400).json({ msg: "Email déjà utilisé" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hash,
      phone,
      cin,
      role: "client",
    });
    res.status(201).json({ token: sign(user), user });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ msg: "email et password requis" });
  try {
    const raw = await User.findByEmail(email);
    if (!raw || !(await bcrypt.compare(password, raw.password)))
      return res.status(400).json({ msg: "Identifiants incorrects" });
    if (!raw.is_active)
      return res.status(403).json({ msg: "Compte désactivé" });
    const user = await User.findById(raw.id);
    res.json({ token: sign(raw), user });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.update(req.user.id, req.body);
    res.json(user);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res.status(400).json({ msg: "oldPassword et newPassword requis" });
  try {
    const raw = await User.findByEmail(req.user.email);
    if (!(await bcrypt.compare(oldPassword, raw.password)))
      return res.status(400).json({ msg: "Ancien mot de passe incorrect" });
    await User.setPassword(req.user.id, await bcrypt.hash(newPassword, 10));
    res.json({ msg: "Mot de passe mis à jour" });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};
