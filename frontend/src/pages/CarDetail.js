import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { carsAPI } from "../services/api";
import { imgSrc } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/ui/Modal";
import ReservationStepper from "../components/reservation/ReservationStepper";

export default function CarDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [avail, setAvail] = useState(null);
  const [checking, setChecking] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    carsAPI
      .getById(id)
      .then((r) => setCar(r.data))
      .catch(() => setError("Voiture introuvable"))
      .finally(() => setLoading(false));
  }, [id]);

  const checkDates = async () => {
    if (!startDate || !endDate) return;
    setChecking(true);
    setAvail(null);
    try {
      const r = await carsAPI.checkAvail(id, startDate, endDate);
      setAvail(r.data.available);
    } catch {
      setAvail(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) checkDates();
  }, [startDate, endDate]);

  const days =
    startDate && endDate
      ? Math.max(
          0,
          Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000),
        )
      : 0;
  const total = car ? days * Number(car.price_per_day) : 0;

  const handleReserve = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowModal(true);
  };

  if (loading)
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );
  if (error || !car)
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-error">
            {error || "Voiture non trouvée"}
          </div>
          <Link to="/cars" className="btn btn-ghost">
            ← Retour
          </Link>
        </div>
      </div>
    );

  return (
    <div className="page">
      <div className="container">
        {/* Breadcrumb */}
        <div
          style={{
            marginBottom: "1.5rem",
            fontSize: ".82rem",
            color: "var(--text3)",
          }}
        >
          <Link to="/cars" style={{ color: "var(--gold)" }}>
            Voitures
          </Link>
          <span style={{ margin: "0 .5rem" }}>›</span>
          <span>
            {car.brand} {car.model}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "2.5rem",
            alignItems: "start",
          }}
        >
          {/* LEFT */}
          <div className="a1">
            {car.image ? (
              <img
                src={imgSrc(car.image)}
                alt={`${car.brand} ${car.model}`}
                style={{
                  width: "100%",
                  height: 340,
                  objectFit: "cover",
                  borderRadius: 14,
                  border: "1px solid var(--border)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 340,
                  background: "var(--bg3)",
                  borderRadius: 14,
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "5rem",
                  color: "var(--text4)",
                }}
              >
                🚗
              </div>
            )}
            <div style={{ marginTop: "1.8rem" }}>
              <div className="gold-bar" />
              <h1 style={{ fontSize: "1.8rem", marginBottom: ".4rem" }}>
                {car.brand} {car.model}
              </h1>
              <p style={{ color: "var(--text3)", marginBottom: "1.5rem" }}>
                Année {car.year} · {car.category} · {car.agence_nom},{" "}
                {car.agence_ville}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: ".75rem",
                  marginBottom: "1.2rem",
                }}
              >
                {[
                  ["Transmission", car.transmission],
                  ["Carburant", car.fuel],
                  ["Places", `${car.seats} places`],
                  ["Couleur", car.color || "N/A"],
                  ["Plaque", car.plate || "N/A"],
                  ["Kilométrage", `${car.mileage || 0} km`],
                  [
                    "Disponibilité",
                    car.available ? "✅ Disponible" : "❌ Indisponible",
                  ],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    style={{
                      background: "var(--bg3)",
                      padding: ".82rem 1rem",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: ".68rem",
                        color: "var(--text3)",
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        marginBottom: ".18rem",
                      }}
                    >
                      {l}
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: ".92rem",
                        color: "var(--text2)",
                      }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>
              {car.description && (
                <p
                  style={{
                    background: "var(--bg3)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "1rem 1.1rem",
                    color: "var(--text3)",
                    fontSize: ".9rem",
                    lineHeight: 1.7,
                  }}
                >
                  {car.description}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Booking box */}
          <div
            className="a2"
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 22,
              padding: "1.7rem",
              position: "sticky",
              top: 78,
              boxShadow: "var(--shl)",
            }}
          >
            <div
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "2rem",
                fontWeight: 700,
                color: "var(--gold)",
              }}
            >
              {Number(car.price_per_day).toFixed(0)}{" "}
              <span
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: ".82rem",
                  fontWeight: 400,
                  color: "var(--text3)",
                }}
              >
                DT / jour
              </span>
            </div>
            <div className="divider" />
            <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>
              Sélectionner les dates
            </h3>

            <div className="form-group">
              <label className="form-label">Date de début</label>
              <input
                className="form-input"
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date de fin</label>
              <input
                className="form-input"
                type="date"
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {checking && (
              <div
                style={{
                  fontSize: ".82rem",
                  color: "var(--text3)",
                  marginBottom: ".8rem",
                }}
              >
                Vérification...
              </div>
            )}
            {avail === true && (
              <div
                className="alert alert-success"
                style={{ marginBottom: ".8rem" }}
              >
                ✓ Disponible pour ces dates
              </div>
            )}
            {avail === false && (
              <div
                className="alert alert-error"
                style={{ marginBottom: ".8rem" }}
              >
                ✗ Déjà réservée pour ces dates
              </div>
            )}

            {days > 0 && (
              <div
                style={{
                  background: "var(--bg3)",
                  borderRadius: 8,
                  padding: "1rem 1.1rem",
                  marginBottom: "1rem",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: ".86rem",
                    padding: ".28rem 0",
                    color: "var(--text3)",
                  }}
                >
                  <span>
                    {Number(car.price_per_day).toFixed(0)} DT × {days} jour
                    {days > 1 ? "s" : ""}
                  </span>
                  <span>{total.toFixed(0)} DT</span>
                </div>
                <div className="divider" style={{ margin: ".5rem 0" }} />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 700,
                    fontSize: ".98rem",
                    color: "var(--gold)",
                  }}
                >
                  <span>Estimation</span>
                  <span>{total.toFixed(0)} DT</span>
                </div>
              </div>
            )}

            <button
              className="btn btn-gold btn-full"
              onClick={handleReserve}
              disabled={
                !car.available ||
                avail === false ||
                !startDate ||
                !endDate ||
                days <= 0
              }
            >
              {!car.available
                ? "Indisponible"
                : !user
                  ? "Se connecter pour réserver"
                  : "Réserver maintenant →"}
            </button>

            {!user && (
              <p
                style={{
                  textAlign: "center",
                  fontSize: ".8rem",
                  color: "var(--text3)",
                  marginTop: ".8rem",
                }}
              >
                <Link to="/login" style={{ color: "var(--gold)" }}>
                  Connectez-vous
                </Link>{" "}
                pour réserver
              </p>
            )}

            <div
              style={{
                marginTop: "1.2rem",
                padding: "1rem",
                background: "var(--bg3)",
                borderRadius: 8,
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontSize: ".75rem",
                  fontWeight: 600,
                  color: "var(--text3)",
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                  marginBottom: ".5rem",
                }}
              >
                Agence
              </div>
              <div style={{ fontSize: ".86rem", fontWeight: 600 }}>
                {car.agence_nom}
              </div>
              <div style={{ fontSize: ".78rem", color: "var(--text3)" }}>
                📍 {car.agence_ville}
              </div>
              {car.agence_phone && (
                <div style={{ fontSize: ".78rem", color: "var(--text3)" }}>
                  📞 {car.agence_phone}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <Modal title="Réserver — " wide onClose={() => setShowModal(false)}>
          <ReservationStepper
            car={car}
            startDate={startDate}
            endDate={endDate}
            onClose={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}
