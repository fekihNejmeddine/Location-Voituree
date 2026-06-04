const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const protect = async (req, res, next) => {
  try {
    let token = null;

    // Authorization: Bearer TOKEN
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Non autorisé, token manquant",
      });
    }

    // Vérification JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupération user
    const [rows] = await pool.query(
      "SELECT id, name, email, role, is_active FROM users WHERE id = ?",
      [decoded.id],
    );

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur introuvable",
      });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Compte désactivé",
      });
    }

    req.user = user;

    next();
  } catch (err) {
    console.error(err);

    return res.status(401).json({
      success: false,
      message: "Token invalide",
    });
  }
};

const roles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé",
      });
    }

    next();
  };
};

module.exports = {
  protect,
  roles,
};
