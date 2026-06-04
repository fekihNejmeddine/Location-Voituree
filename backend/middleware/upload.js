const multer = require("multer");
const path = require("path");
const fs = require("fs");

const makeStorage = (subdir) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, `../uploads/${subdir}`);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    },
  });

const imageFilter = (req, file, cb) => {
  if (/^image\/(jpeg|jpg|png|webp)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error("Seules les images JPG/PNG/WEBP sont acceptées"));
};

const limits = { fileSize: 5 * 1024 * 1024 };

// 🔥 IMPORTANT: créer directement les handlers
const uploadCarImage = multer({
  storage: makeStorage("cars"),
  fileFilter: imageFilter,
  limits,
}).single("image");

const uploadCarPhotos = multer({
  storage: makeStorage("cars"),
  fileFilter: imageFilter,
  limits,
}).array("photos", 10);

const uploadReservationPhotos = multer({
  storage: makeStorage("reservations"),
  fileFilter: imageFilter,
  limits,
}).array("photos", 10);

module.exports = {
  uploadCarImage,
  uploadCarPhotos,
  uploadReservationPhotos,
};
