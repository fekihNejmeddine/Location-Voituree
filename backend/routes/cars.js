const router = require("express").Router();
const ctrl = require("../controllers/carController");
const { protect, roles } = require("../middleware/authMiddleware");
const { uploadCarImage } = require("../middleware/upload");

const isStaff = roles("admin", "chef_agence", "agent");
const canEdit = roles("admin", "chef_agence");

router.get("/public", ctrl.getPublic);
router.get("/:id/availability", ctrl.checkAvailability);
router.get("/", protect, isStaff, ctrl.getAll);
router.get("/:id", ctrl.getById);
router.put(
  "/:id",
  protect,
  canEdit,
  uploadCarImage,
  ctrl.update,
);
router.delete("/:id", protect, canEdit, ctrl.remove);
router.patch("/:id/toggle", protect, isStaff, ctrl.toggleAvailable);

module.exports = router;
