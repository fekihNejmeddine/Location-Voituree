import React, { useState, useEffect, useCallback } from "react";
import { usersAPI, agencesAPI, reservationsAPI } from "../services/api";

const ROLE_LABEL = {
  admin: "Admin",
  chef_agence: "Chef Agence",
  agent: "Agent",
  client: "Client",
};
const STATUS_LABEL = {
  pending: "En attente",
  confirmed: "Confirmée",
  in_progress: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
};

// ── Generic CRUD Modal ──────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="modal-hd">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-bd">{children}</div>
      </div>
    </div>
  );
}

// ── Stats Grid ──────────────────────────────────────────────────────────────
function StatsGrid({ stats }) {
  if (!stats) return null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}
    >
      {[
        { label: "Réservations", num: stats.total, color: "gold" },
        { label: "Confirmées", num: stats.confirmed, color: "blue" },
        { label: "En attente", num: stats.pending, color: "warn" },
        { label: "En cours", num: stats.in_progress, color: "purple" },
        { label: "Terminées", num: stats.completed, color: "green" },
        {
          label: "Revenus",
          num: `${Number(stats.revenue || 0).toFixed(0)} DT`,
          color: "gold",
        },
      ].map((s) => (
        <div key={s.label} className={`stat-card ${s.color}`}>
          <div className="stat-num">{s.num}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Agences Tab ──────────────────────────────────────────────────────────────
function AgencesTab() {
  const [agences, setAgences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | {mode:'add'|'edit', data}
  const [form, setForm] = useState({
    nom: "",
    adresse: "",
    ville: "",
    phone: "",
    email: "",
    description: "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await agencesAPI.getAll();
      setAgences(r.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setForm({
      nom: "",
      adresse: "",
      ville: "",
      phone: "",
      email: "",
      description: "",
    });
    setModal({ mode: "add" });
    setErr("");
  };
  const openEdit = (a) => {
    setForm({
      nom: a.nom,
      adresse: a.adresse || "",
      ville: a.ville || "",
      phone: a.phone || "",
      email: a.email || "",
      description: a.description || "",
    });
    setModal({ mode: "edit", id: a.id });
    setErr("");
  };

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      if (modal.mode === "add") await agencesAPI.create(form);
      else await agencesAPI.update(modal.id, form);
      setModal(null);
      load();
    } catch (ex) {
      setErr(ex.response?.data?.msg || "Erreur");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer cette agence ?")) return;
    try {
      await agencesAPI.remove(id);
      load();
    } catch (ex) {
      alert(ex.response?.data?.msg || "Erreur");
    }
  };

  if (loading)
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );

  return (
    <div>
      <div className="section-header">
        <h3>Agences ({agences.length})</h3>
        <button className="btn btn-gold btn-sm" onClick={openAdd}>
          + Ajouter une agence
        </button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Ville</th>
              <th>Contact</th>
              <th>Chefs</th>
              <th>Agents</th>
              <th>Voitures</th>
              <th>Réservations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agences.map((a) => (
              <tr key={a.id}>
                <td>
                  <strong>{a.nom}</strong>
                  <div className="table-sub">{a.adresse}</div>
                </td>
                <td>{a.ville || "—"}</td>
                <td>
                  <div style={{ fontSize: ".8rem" }}>{a.phone || "—"}</div>
                  <div className="table-sub">{a.email || "—"}</div>
                </td>
                <td style={{ textAlign: "center" }}>{a.nb_chefs}</td>
                <td style={{ textAlign: "center" }}>{a.nb_agents}</td>
                <td style={{ textAlign: "center" }}>{a.nb_cars}</td>
                <td style={{ textAlign: "center" }}>{a.nb_reservations}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => openEdit(a)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => remove(a.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal
          title={modal.mode === "add" ? "Nouvelle agence" : "Modifier agence"}
          onClose={() => setModal(null)}
        >
          {err && <div className="alert alert-error">{err}</div>}
          <form onSubmit={save}>
            <div className="form-group">
              <label className="form-label">Nom *</label>
              <input
                className="form-input"
                value={form.nom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nom: e.target.value }))
                }
                required
              />
            </div>
            <div className="form-row col-2">
              <div className="form-group">
                <label className="form-label">Ville</label>
                <input
                  className="form-input"
                  value={form.ville}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ville: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input
                  className="form-input"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Adresse</label>
              <input
                className="form-input"
                value={form.adresse}
                onChange={(e) =>
                  setForm((f) => ({ ...f, adresse: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: ".7rem",
                justifyContent: "flex-end",
                marginTop: "1rem",
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setModal(null)}
              >
                Annuler
              </button>
              <button type="submit" className="btn btn-gold">
                Sauvegarder
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ── Users Tab ───────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [agences, setAgences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: "", search: "" });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    cin: "",
    role: "client",
    agence_id: "",
  });
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ur, ar] = await Promise.all([
        usersAPI.getAll(filter),
        agencesAPI.getAll(),
      ]);
      setUsers(ur.data);
      setAgences(ar.data);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      cin: "",
      role: "client",
      agence_id: "",
    });
    setModal({ mode: "add" });
    setErr("");
  };
  const openEdit = (u) => {
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      phone: u.phone || "",
      cin: u.cin || "",
      role: u.role,
      agence_id: u.agence_id || "",
    });
    setModal({ mode: "edit", id: u.id });
    setErr("");
  };

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const payload = { ...form, agence_id: form.agence_id || null };
      if (modal.mode === "add") await usersAPI.create(payload);
      else {
        const p = { ...payload };
        if (!p.password) delete p.password;
        await usersAPI.update(modal.id, p);
      }
      setModal(null);
      load();
    } catch (ex) {
      setErr(ex.response?.data?.msg || "Erreur");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await usersAPI.remove(id);
      load();
    } catch (ex) {
      alert(ex.response?.data?.msg || "Erreur");
    }
  };

  const toggle = async (id) => {
    try {
      await usersAPI.toggle(id);
      load();
    } catch (ex) {
      alert("Erreur");
    }
  };

  const needsAgence = ["chef_agence", "agent"].includes(form.role);

  return (
    <div>
      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.2rem",
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        <div className="form-group" style={{ margin: 0, minWidth: 160 }}>
          <label className="form-label">Rôle</label>
          <select
            className="form-input form-select"
            value={filter.role}
            onChange={(e) => setFilter((f) => ({ ...f, role: e.target.value }))}
          >
            <option value="">Tous</option>
            <option value="admin">Admin</option>
            <option value="chef_agence">Chef Agence</option>
            <option value="agent">Agent</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div
          className="form-group"
          style={{ margin: 0, flex: 1, minWidth: 180 }}
        >
          <label className="form-label">Recherche</label>
          <input
            className="form-input"
            placeholder="Nom ou email..."
            value={filter.search}
            onChange={(e) =>
              setFilter((f) => ({ ...f, search: e.target.value }))
            }
          />
        </div>
        <button className="btn btn-gold btn-sm" onClick={openAdd}>
          + Ajouter
        </button>
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner" />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Agence</th>
                <th>CIN</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div className="table-sub">{u.email}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${u.role}`}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td>{u.agence_nom || "—"}</td>
                  <td style={{ fontSize: ".82rem" }}>{u.cin || "—"}</td>
                  <td style={{ fontSize: ".82rem" }}>{u.phone || "—"}</td>
                  <td>
                    <span
                      className={`badge badge-${u.is_active ? "active" : "inactive"}`}
                    >
                      {u.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(u)}
                      >
                        ✏️
                      </button>
                      <button
                        className={`btn btn-sm ${u.is_active ? "btn-warn" : "btn-success"}`}
                        onClick={() => toggle(u.id)}
                        title={u.is_active ? "Désactiver" : "Activer"}
                      >
                        {u.is_active ? "🔒" : "🔓"}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(u.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title={
            modal.mode === "add" ? "Nouvel utilisateur" : "Modifier utilisateur"
          }
          onClose={() => setModal(null)}
        >
          {err && <div className="alert alert-error">{err}</div>}
          <form onSubmit={save}>
            <div className="form-row col-2">
              <div className="form-group">
                <label className="form-label">Nom *</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input
                  className="form-input"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">CIN</label>
                <input
                  className="form-input"
                  value={form.cin}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cin: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                Mot de passe {modal.mode === "edit" ? "(laisser vide)" : "*"}
              </label>
              <input
                className="form-input"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                required={modal.mode === "add"}
              />
            </div>
            <div className="form-row col-2">
              <div className="form-group">
                <label className="form-label">Rôle</label>
                <select
                  className="form-input form-select"
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="chef_agence">Chef Agence</option>
                  <option value="agent">Agent</option>
                  <option value="client">Client</option>
                </select>
              </div>
              {needsAgence && (
                <div className="form-group">
                  <label className="form-label">Agence *</label>
                  <select
                    className="form-input form-select"
                    value={form.agence_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, agence_id: e.target.value }))
                    }
                    required={needsAgence}
                  >
                    <option value="">Sélectionner...</option>
                    {agences.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nom}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: ".7rem",
                justifyContent: "flex-end",
                marginTop: "1rem",
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setModal(null)}
              >
                Annuler
              </button>
              <button type="submit" className="btn btn-gold">
                Sauvegarder
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ── Reservations Tab ────────────────────────────────────────────────────────
function ReservationsTab() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await reservationsAPI.getManage({});
      setReservations(r.data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await reservationsAPI.updateStatus(id, status);
      load();
    } catch (e) {
      alert(e.response?.data?.msg || "Erreur");
    }
  };

  const filtered = filter
    ? reservations.filter((r) => r.status === filter)
    : reservations;

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.2rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <select
          className="form-input form-select"
          style={{ width: "auto", minWidth: 160 }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <span style={{ fontSize: ".83rem", color: "var(--text3)" }}>
          {filtered.length} réservation{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>
      {loading ? (
        <div className="loading-page">
          <div className="spinner" />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Véhicule</th>
                <th>Agence</th>
                <th>Dates</th>
                <th>Total</th>
                <th>Paiement</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ color: "var(--text3)", fontSize: ".78rem" }}>
                    #{r.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.client_name}</div>
                    <div className="table-sub">{r.user_email}</div>
                  </td>
                  <td>
                    {r.brand} {r.model}
                  </td>
                  <td style={{ fontSize: ".82rem" }}>{r.agence_nom}</td>
                  <td style={{ fontSize: ".8rem", color: "var(--text3)" }}>
                    {new Date(r.start_date).toLocaleDateString("fr-FR")} →{" "}
                    {new Date(r.end_date).toLocaleDateString("fr-FR")}
                  </td>
                  <td style={{ color: "var(--gold)", fontWeight: 700 }}>
                    {Number(r.total_price).toFixed(0)} DT
                  </td>
                  <td>
                    <span className={`badge badge-${r.payment_status}`}>
                      {r.payment_status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${r.status}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      {r.status === "pending" && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => updateStatus(r.id, "confirmed")}
                        >
                          ✓ Conf.
                        </button>
                      )}
                      {r.status === "confirmed" && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => updateStatus(r.id, "in_progress")}
                        >
                          ▶ Démarrer
                        </button>
                      )}
                      {r.status === "in_progress" && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => updateStatus(r.id, "completed")}
                        >
                          ✓ Terminer
                        </button>
                      )}
                      {!["cancelled", "completed"].includes(r.status) && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => updateStatus(r.id, "cancelled")}
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
    </div>
  );
}

// ── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    reservationsAPI
      .getStats()
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, []);

  const TABS = [
    { key: "stats", label: "📊 Statistiques" },
    { key: "agences", label: "🏢 Agences" },
    { key: "users", label: "👥 Utilisateurs" },
    { key: "reservations", label: "📋 Réservations" },
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="page-header a1">
          <div className="gold-bar" />
          <h1>Dashboard Admin</h1>
          <p>Gestion globale du système</p>
        </div>

        <div className="tabs a2">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab-btn${tab === t.key ? " active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "stats" && (
          <div className="a1">
            <StatsGrid stats={stats} />
            <div className="alert alert-info">
              💡 Sélectionnez un onglet pour gérer les agences, utilisateurs ou
              réservations.
            </div>
          </div>
        )}
        {tab === "agences" && <AgencesTab />}
        {tab === "users" && <UsersTab />}
        {tab === "reservations" && <ReservationsTab />}
      </div>
    </div>
  );
}
