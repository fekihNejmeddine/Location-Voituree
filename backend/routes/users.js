const router = require("express").Router();
const ctrl = require("../controllers/userController");
const { protect, roles } = require("../middleware/authMiddleware");

const isAdmin = roles("admin");
const isStaff = roles("admin", "chef_agence");

router.get("/", protect, isStaff, ctrl.getAll);
router.get("/:id", protect, isStaff, ctrl.getById);
router.post("/", protect, isAdmin, ctrl.create);
router.put("/:id", protect, isAdmin, ctrl.update);
router.delete("/:id", protect, isAdmin, ctrl.remove);
router.patch("/:id/toggle", protect, isAdmin, ctrl.toggleActive);

module.exports = router;
