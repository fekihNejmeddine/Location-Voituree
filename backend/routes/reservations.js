const router = require("express").Router();
const ctrl = require("../controllers/reservationController");
const { protect, roles } = require("../middleware/authMiddleware");
const { uploadPhotos } = require("../middleware/upload");

const isStaff = roles("admin", "chef_agence", "agent");

router.get("/options", ctrl.getOptions);
router.post("/", protect, ctrl.create);
router.get("/mine", protect, ctrl.getMine);
router.get("/manage", protect, isStaff, ctrl.getManage);
router.get("/stats", protect, isStaff, ctrl.getStats);
router.get("/:id", protect, ctrl.getById);
router.put("/:id/status", protect, isStaff, ctrl.updateStatus);
router.put("/:id/cancel", protect, ctrl.cancelMine);

router.post("/:id/pay", protect, ctrl.simulatePayment);

module.exports = router;
