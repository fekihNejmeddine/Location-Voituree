import React from "react";
import { Link } from "react-router-dom";
import { imgSrc } from "../../services/api";

export default function CarCard({ car, showAgence = false }) {
  return (
    <div className="card card-hover" style={{ cursor: "default" }}>
      <div style={{ position: "relative", overflow: "hidden" }}>
        {car.image ? (
          <img
            src={imgSrc(car.image)}
            alt={`${car.brand} ${car.model}`}
            style={{
              width: "100%",
              height: 195,
              objectFit: "cover",
              transition: "transform .4s",
              display: "block",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.04)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: 195,
              background: "var(--bg3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3rem",
              color: "var(--text4)",
            }}
          >
            🚗
          </div>
        )}
        <span
          style={{
            position: "absolute",
            top: ".7rem",
            left: ".7rem",
            background: "rgba(0,0,0,.72)",
            backdropFilter: "blur(6px)",
            padding: ".2rem .6rem",
            borderRadius: 20,
            fontSize: ".66rem",
            fontWeight: 700,
            color: "var(--gold)",
            textTransform: "uppercase",
            letterSpacing: ".07em",
            border: "1px solid rgba(212,168,67,.3)",
          }}
        >
          {car.category}
        </span>
        <span
          style={{
            position: "absolute",
            top: ".75rem",
            right: ".75rem",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: car.available ? "var(--ok)" : "var(--err)",
            boxShadow: car.available ? "0 0 6px var(--ok)" : "none",
            border: "2px solid var(--bg2)",
            display: "block",
          }}
        />
      </div>
      <div style={{ padding: "1.1rem 1.2rem" }}>
        <div
          style={{ fontWeight: 700, fontSize: "1rem", marginBottom: ".3rem" }}
        >
          {car.brand} {car.model}{" "}
          <span
            style={{
              fontWeight: 400,
              fontSize: ".84rem",
              color: "var(--text3)",
            }}
          >
            ({car.year})
          </span>
        </div>
        {showAgence && car.agence_nom && (
          <div
            style={{
              fontSize: ".75rem",
              color: "var(--text3)",
              marginBottom: ".4rem",
            }}
          >
            📍 {car.agence_nom} — {car.agence_ville}
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: ".6rem",
            flexWrap: "wrap",
            fontSize: ".76rem",
            color: "var(--text3)",
            marginBottom: "1rem",
          }}
        >
          <span>🪑 {car.seats}</span>
          <span>⚙️ {car.transmission === "manuelle" ? "Man." : "Auto."}</span>
          <span>⛽ {car.fuel}</span>
          {car.color && <span>🎨 {car.color}</span>}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: ".9rem",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "var(--gold)",
            }}
          >
            {Number(car.price_per_day).toFixed(0)}{" "}
            <span
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: ".73rem",
                fontWeight: 400,
                color: "var(--text3)",
              }}
            >
              DT/j
            </span>
          </div>
          <Link
            to={`/cars/${car.id}`}
            className={`btn btn-sm ${car.available ? "btn-gold" : "btn-ghost"}`}
          >
            {car.available ? "Réserver →" : "Voir"}
          </Link>
        </div>
      </div>
    </div>
  );
}
