import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { carsAPI } from "../services/api";
import CarCard from "../components/ui/CarCard";

const CATS = [
  { v: "economique", l: "Économique", i: "🚙" },
  { v: "berline", l: "Berline", i: "🚗" },
  { v: "SUV", l: "SUV", i: "🚐" },
  { v: "luxe", l: "Luxe", i: "🏎️" },
];

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    carsAPI
      .getPublic({ available: true })
      .then((r) => setCars(r.data.slice(0, 6)))
      .finally(() => setLoading(false));
  }, []);

  const doSearch = (e) => {
    e.preventDefault();
    navigate(`/cars${search ? `?search=${search}` : ""}`);
  };

  return (
    <>
      {/* HERO */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "var(--bg2)",
          padding: "7rem 0 5rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at 65% 40%,rgba(212,168,67,.06) 0%,transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.018,
            backgroundImage:
              "linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />
        <div className="container" style={{ position: "relative" }}>
          <div className="a1" style={{ maxWidth: 600 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".7rem",
                marginBottom: "1.4rem",
              }}
            >
              <div
                style={{ height: 1, width: 28, background: "var(--gold)" }}
              />
              <span className="eyebrow">Location de voiture — Tunisie</span>
            </div>
            <h1 style={{ marginBottom: "1.1rem" }}>
              Conduisez sans
              <br />
              <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
                compromis.
              </em>
            </h1>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--text3)",
                maxWidth: 460,
                marginBottom: "2.4rem",
                lineHeight: 1.75,
              }}
            >
              Des centaines de véhicules sélectionnés, disponibles
              instantanément. Réservez en ligne en quelques minutes.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link to="/cars" className="btn btn-gold btn-lg">
                Explorer les voitures
              </Link>
              <Link to="/register" className="btn btn-ghost btn-lg">
                Créer un compte
              </Link>
            </div>
          </div>

          <form
            onSubmit={doSearch}
            className="a2"
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 22,
              padding: "1.2rem 1.5rem",
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              alignItems: "flex-end",
              marginTop: "3.5rem",
              boxShadow: "var(--shl)",
            }}
          >
            <div
              className="form-group"
              style={{ margin: 0, flex: 1, minWidth: 160 }}
            >
              <label className="form-label">Recherche</label>
              <input
                className="form-input"
                placeholder="Marque ou modèle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div
              className="form-group"
              style={{ margin: 0, flex: 1, minWidth: 150 }}
            >
              <label className="form-label">Catégorie</label>
              <select
                className="form-input form-select"
                onChange={(e) => navigate(`/cars?category=${e.target.value}`)}
              >
                <option value="">Toutes</option>
                {CATS.map((c) => (
                  <option key={c.v} value={c.v}>
                    {c.l}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="submit" className="btn btn-gold">
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* STATS */}
      <section
        style={{
          background: "var(--bg3)",
          borderBottom: "1px solid var(--border)",
          padding: "1.8rem 0",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))",
              gap: "1rem",
              textAlign: "center",
            }}
          >
            {[
              { n: "200+", l: "Véhicules" },
              { n: "5k+", l: "Clients" },
              { n: "3", l: "Agences" },
              { n: "24/7", l: "Support" },
            ].map((s) => (
              <div key={s.l}>
                <div
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "var(--gold)",
                    lineHeight: 1,
                  }}
                >
                  {s.n}
                </div>
                <div
                  style={{
                    fontSize: ".76rem",
                    color: "var(--text3)",
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    marginTop: ".25rem",
                  }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section
        style={{ padding: "3rem 0", borderBottom: "1px solid var(--border)" }}
      >
        <div className="container">
          <div className="section-header">
            <div>
              <div className="gold-bar" />
              <h2>Par catégorie</h2>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))",
              gap: "1rem",
            }}
          >
            {CATS.map((c) => (
              <button
                key={c.v}
                onClick={() => navigate(`/cars?category=${c.v}`)}
                style={{
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "1.4rem",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all .2s",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(212,168,67,.4)";
                  e.currentTarget.style.boxShadow = "var(--glow)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "2.1rem", marginBottom: ".45rem" }}>
                  {c.i}
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontWeight: 600,
                    color: "var(--text2)",
                  }}
                >
                  {c.l}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CARS */}
      <section className="page">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="gold-bar" />
              <h2>Voitures disponibles</h2>
            </div>
            <Link to="/cars" className="btn btn-ghost btn-sm">
              Voir tout →
            </Link>
          </div>
          {loading ? (
            <div className="loading-page">
              <div className="spinner" />
            </div>
          ) : cars.length === 0 ? (
            <div className="empty-state">
              <span className="icon">🚗</span>
              <h3>Aucune voiture</h3>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))",
                gap: "1.4rem",
              }}
            >
              {cars.map((c) => (
                <CarCard key={c.id} car={c} showAgence />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "var(--bg3)",
          borderTop: "1px solid var(--border)",
          padding: "4rem 0",
          textAlign: "center",
        }}
      >
        <div className="container">
          <div className="gold-bar" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ marginBottom: ".8rem" }}>Prêt à prendre la route ?</h2>
          <p
            style={{
              color: "var(--text3)",
              maxWidth: 400,
              margin: "0 auto 2rem",
              lineHeight: 1.7,
            }}
          >
            Créez votre compte gratuitement et réservez en moins de 2 minutes.
          </p>
          <Link to="/register" className="btn btn-gold btn-xl">
            Commencer maintenant
          </Link>
        </div>
      </section>
    </>
  );
}
