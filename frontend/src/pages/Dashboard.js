import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reservationsAPI, carsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

/* ══════════════════════════════════════
   USER DASHBOARD
══════════════════════════════════════ */
function UserDashboard({ user }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const r = await reservationsAPI.getMine();
      setReservations(r.data);
    } catch {
      setError("Impossible de charger vos réservations.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    if (!window.confirm("Annuler cette réservation ?")) return;
    try {
      await reservationsAPI.cancel(id);
      load();
    } catch (e) {
      alert(e.response?.data?.msg || "Erreur");
    }
  };

  if (loading)
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );

  return (
    <div className="page">
      <div className="container">
        <div className="page-header fade-up">
          <div className="gold-line" />
          <h1>Mes Réservations</h1>
          <p>
            Bonjour,{" "}
            <strong style={{ color: "var(--gold)" }}>{user.name}</strong>
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {reservations.length === 0 ? (
          <div className="empty-state fade-up">
            <div className="icon">🗓️</div>
            <h3>Aucune réservation</h3>
            <p>Vous n'avez pas encore réservé de véhicule.</p>
            <Link
              to="/cars"
              className="btn btn-gold"
              style={{ marginTop: "1.2rem" }}
            >
              Explorer les voitures
            </Link>
          </div>
        ) : (
          <div className="fade-up">
            {reservations.map((r) => (
              <div key={r.id} className="reservation-card">
                <div>
                  {r.image ? (
                    <img src={r.image} alt="" className="reservation-car-img" />
                  ) : (
                    <div className="reservation-car-placeholder">🚗</div>
                  )}
                </div>
                <div className="reservation-info">
                  <h4>
                    {r.brand} {r.model}
                  </h4>
                  <p>
                    📅 {new Date(r.start_date).toLocaleDateString("fr-FR")}
                    {" → "}
                    {new Date(r.end_date).toLocaleDateString("fr-FR")}
                  </p>
                  <span className={`badge badge-${r.status}`}>{r.status}</span>
                </div>
                <div>
                  <div className="reservation-price">
                    {Number(r.total_price).toFixed(0)} DT
                  </div>
                  <div className="reservation-actions">
                    {(r.status === "pending" || r.status === "confirmed") && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => cancel(r.id)}
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════ */
function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [cars, setCars] = useState([]);
  const [tab, setTab] = useState("reservations");
  const [loading, setLoading] = useState(true);
  const [carForm, setCarForm] = useState({
    brand: "",
    model: "",
    year: "",
    price_per_day: "",
    category: "economique",
    transmission: "manuelle",
    seats: 5,
    fuel: "essence",
    description: "",
  });
  const [carMsg, setCarMsg] = useState("");
  const [carErr, setCarErr] = useState("");

  const load = async () => {
    try {
      const [rRes, sRes, cRes] = await Promise.all([
        reservationsAPI.getAll(),
        reservationsAPI.getStats(),
        carsAPI.getAll(),
      ]);
      setReservations(rRes.data);
      setStats(sRes.data);
      setCars(cRes.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const confirmRes = async (id) => {
    try {
      await reservationsAPI.confirm(id);
      load();
    } catch {}
  };
  const cancelRes = async (id) => {
    try {
      await reservationsAPI.cancel(id);
      load();
    } catch {}
  };
  const deleteCar = async (id) => {
    if (!window.confirm("Supprimer cette voiture ?")) return;
    try {
      await carsAPI.delete(id);
      load();
    } catch {}
  };

  const submitCar = async (e) => {
    e.preventDefault();
    setCarErr("");
    setCarMsg("");
    try {
      await carsAPI.create({
        ...carForm,
        year: Number(carForm.year),
        price_per_day: Number(carForm.price_per_day),
        seats: Number(carForm.seats),
      });
      setCarMsg("Voiture ajoutée avec succès !");
      setCarForm({
        brand: "",
        model: "",
        year: "",
        price_per_day: "",
        category: "economique",
        transmission: "manuelle",
        seats: 5,
        fuel: "essence",
        description: "",
      });
      load();
    } catch (err) {
      setCarErr(err.response?.data?.msg || "Erreur");
    }
  };

  const TABS = [
    { key: "reservations", label: "Réservations" },
    { key: "cars", label: "Voitures" },
    { key: "add-car", label: "+ Ajouter une voiture" },
  ];

  if (loading)
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );

  return (
    <div className="page">
      <div className="container">
        <div className="page-header fade-up">
          <div className="gold-line" />
          <h1>Administration</h1>
          <p>Tableau de bord — gestion globale</p>
        </div>

        {/* Stat cards */}
        {stats && (
          <div className="admin-stats fade-up">
            {[
              { num: stats.total, label: "Total réservations" },
              { num: stats.confirmed, label: "Confirmées" },
              { num: stats.pending, label: "En attente" },
              {
                num: `${Number(stats.revenue || 0).toFixed(0)} DT`,
                label: "Revenus",
              },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`admin-tab${tab === t.key ? " active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Reservations */}
        {tab === "reservations" && (
          <div className="admin-table-wrap fade-up">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Véhicule</th>
                  <th>Dates</th>
                  <th>Prix</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div>{r.user_name}</div>
                      <div className="admin-table-cell-sub">{r.user_email}</div>
                    </td>
                    <td>
                      {r.brand} {r.model}
                    </td>
                    <td style={{ fontSize: ".8rem", color: "var(--subtle)" }}>
                      {new Date(r.start_date).toLocaleDateString("fr-FR")}
                      {" → "}
                      {new Date(r.end_date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="admin-table-price">
                      {Number(r.total_price).toFixed(0)} DT
                    </td>
                    <td>
                      <span className={`badge badge-${r.status}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        {r.status === "pending" && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => confirmRes(r.id)}
                          >
                            ✓
                          </button>
                        )}
                        {r.status !== "cancelled" && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => cancelRes(r.id)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab: Cars list */}
        {tab === "cars" && (
          <div className="admin-table-wrap fade-up">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Véhicule</th>
                  <th>Catégorie</th>
                  <th>Prix/jour</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>
                        {c.brand} {c.model}
                      </strong>
                      <span className="admin-table-cell-sub"> {c.year}</span>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {c.category}
                    </td>
                    <td className="admin-table-price">
                      {Number(c.price_per_day).toFixed(0)} DT
                    </td>
                    <td>
                      <span
                        className={`badge ${c.available ? "badge-confirmed" : "badge-cancelled"}`}
                      >
                        {c.available ? "Disponible" : "Indisponible"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteCar(c.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab: Add car */}
        {tab === "add-car" && (
          <div className="admin-form fade-up">
            {carMsg && <div className="alert alert-success">{carMsg}</div>}
            {carErr && <div className="alert alert-error">{carErr}</div>}
            <form onSubmit={submitCar}>
              <div className="admin-form-grid">
                {[
                  ["brand", "Marque", "text"],
                  ["model", "Modèle", "text"],
                  ["year", "Année", "number"],
                  ["price_per_day", "Prix / jour (DT)", "number"],
                ].map(([k, l, t]) => (
                  <div key={k} className="form-group">
                    <label className="form-label">{l}</label>
                    <input
                      className="form-input"
                      type={t}
                      value={carForm[k]}
                      onChange={(e) =>
                        setCarForm((f) => ({ ...f, [k]: e.target.value }))
                      }
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Catégorie</label>
                  <select
                    className="form-input form-select"
                    value={carForm.category}
                    onChange={(e) =>
                      setCarForm((f) => ({ ...f, category: e.target.value }))
                    }
                  >
                    <option value="economique">Économique</option>
                    <option value="berline">Berline</option>
                    <option value="SUV">SUV</option>
                    <option value="luxe">Luxe</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Transmission</label>
                  <select
                    className="form-input form-select"
                    value={carForm.transmission}
                    onChange={(e) =>
                      setCarForm((f) => ({
                        ...f,
                        transmission: e.target.value,
                      }))
                    }
                  >
                    <option value="manuelle">Manuelle</option>
                    <option value="automatique">Automatique</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Carburant</label>
                  <select
                    className="form-input form-select"
                    value={carForm.fuel}
                    onChange={(e) =>
                      setCarForm((f) => ({ ...f, fuel: e.target.value }))
                    }
                  >
                    <option value="essence">Essence</option>
                    <option value="diesel">Diesel</option>
                    <option value="electrique">Électrique</option>
                    <option value="hybride">Hybride</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre de places</label>
                  <input
                    className="form-input"
                    type="number"
                    min="2"
                    max="9"
                    value={carForm.seats}
                    onChange={(e) =>
                      setCarForm((f) => ({ ...f, seats: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description (optionnel)</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={carForm.description}
                  onChange={(e) =>
                    setCarForm((f) => ({ ...f, description: e.target.value }))
                  }
                  style={{ resize: "vertical" }}
                />
              </div>
              <button type="submit" className="btn btn-gold">
                Ajouter la voiture
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   EXPORT — auto-switch user / admin
══════════════════════════════════════ */
export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  return isAdmin() ? <AdminDashboard /> : <UserDashboard user={user} />;
}
