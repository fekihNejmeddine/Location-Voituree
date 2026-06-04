const router = require("express").Router();
const ctrl = require("../controllers/agenceController");
const { protect, roles } = require("../middleware/authMiddleware");

const isAdmin = roles("admin");

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", protect, isAdmin, ctrl.create);
router.put("/:id", protect, isAdmin, ctrl.update);
router.delete("/:id", protect, isAdmin, ctrl.remove);

module.exports = router;
