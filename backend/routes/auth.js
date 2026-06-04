const router = require("express").Router();
const ctrl = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.get("/me", protect, ctrl.getMe);
router.put("/profile", protect, ctrl.updateProfile);
router.put("/password", protect, ctrl.changePassword);

module.exports = router; 
