import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { carsAPI } from "../services/api";
import CarCard from "../components/ui/CarCard";

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sp] = useSearchParams();
  const [f, setF] = useState({
    search: sp.get("search") || "",
    category: sp.get("category") || "",
    maxPrice: "",
    transmission: "",
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const reset = () =>
    setF({ search: "", category: "", maxPrice: "", transmission: "" });

  useEffect(() => {
    setLoading(true);
    setError("");
    const p = {};
    if (f.category) p.category = f.category;
    if (f.maxPrice) p.maxPrice = f.maxPrice;
    if (f.transmission) p.transmission = f.transmission;
    if (f.search) p.search = f.search;
    carsAPI
      .getPublic(p)
      .then((r) => setCars(r.data))
      .catch(() => setError("Impossible de charger les voitures"))
      .finally(() => setLoading(false));
  }, [f]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header a1">
          <div className="gold-bar" />
          <h1>Nos Véhicules</h1>
          <p>Trouvez le véhicule qui correspond à vos besoins</p>
        </div>

        {/* Filters */}
        <div
          className="a2"
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "1.2rem 1.5rem",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "flex-end",
            marginBottom: "2rem",
          }}
        >
          <div
            className="form-group"
            style={{ margin: 0, flex: 1, minWidth: 150 }}
          >
            <label className="form-label">Recherche</label>
            <input
              className="form-input"
              placeholder="Marque, modèle..."
              value={f.search}
              onChange={set("search")}
            />
          </div>
          <div
            className="form-group"
            style={{ margin: 0, flex: 1, minWidth: 140 }}
          >
            <label className="form-label">Catégorie</label>
            <select
              className="form-input form-select"
              value={f.category}
              onChange={set("category")}
            >
              <option value="">Toutes</option>
              <option value="economique">Économique</option>
              <option value="berline">Berline</option>
              <option value="SUV">SUV</option>
              <option value="luxe">Luxe</option>
              <option value="utilitaire">Utilitaire</option>
            </select>
          </div>
          <div
            className="form-group"
            style={{ margin: 0, flex: 1, minWidth: 130 }}
          >
            <label className="form-label">Prix max/j</label>
            <input
              className="form-input"
              type="number"
              placeholder="Ex: 150 DT"
              value={f.maxPrice}
              onChange={set("maxPrice")}
              min="0"
            />
          </div>
          <div
            className="form-group"
            style={{ margin: 0, flex: 1, minWidth: 140 }}
          >
            <label className="form-label">Transmission</label>
            <select
              className="form-input form-select"
              value={f.transmission}
              onChange={set("transmission")}
            >
              <option value="">Toutes</option>
              <option value="manuelle">Manuelle</option>
              <option value="automatique">Automatique</option>
            </select>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={reset}>
            ↺ Réinitialiser
          </button>
        </div>

        {!loading && (
          <div
            style={{
              marginBottom: "1.5rem",
              color: "var(--text3)",
              fontSize: ".85rem",
            }}
          >
            <span style={{ color: "var(--gold)", fontWeight: 600 }}>
              {cars.length}
            </span>{" "}
            véhicule{cars.length !== 1 ? "s" : ""} trouvé
            {cars.length !== 1 ? "s" : ""}
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}
        {loading ? (
          <div className="loading-page">
            <div className="spinner" />
          </div>
        ) : cars.length === 0 ? (
          <div className="empty-state a3">
            <span className="icon">🔍</span>
            <h3>Aucun résultat</h3>
            <p>Modifiez les filtres.</p>
            <button
              className="btn btn-ghost"
              style={{ marginTop: "1rem" }}
              onClick={reset}
            >
              Réinitialiser
            </button>
          </div>
        ) : (
          <div
            className="a3"
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
    </div>
  );
}
