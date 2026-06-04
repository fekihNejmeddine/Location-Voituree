require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/db");

connectDB();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/agences", require("./routes/agences"));
app.use("/api/cars", require("./routes/cars"));
app.use("/api/reservations", require("./routes/reservations"));

app.get("/", (_, res) => res.json({ status: "ok", msg: "LOC_Voiture API v2 ✅" }));

app.use((req, res) => res.status(404).json({ msg: "Route non trouvée" }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: err.message || "Erreur serveur" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
