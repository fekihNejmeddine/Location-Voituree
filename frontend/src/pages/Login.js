import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const s = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const getDash = (role) => {
    if (role === "admin") return "/admin";
    if (role === "chef_agence") return "/chef";
    if (role === "agent") return "/agent";
    return "/dashboard";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);
      navigate(from || getDash(res.data.user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.msg || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card anim-1">
        <div className="auth-brand">🚗 LOC_Voiture</div>
        <h2 className="auth-title">Bon retour !</h2>
        <p className="auth-sub">Connectez-vous à votre espace</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={s("email")}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={s("password")}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-gold btn-full"
            style={{ marginTop: ".5rem" }}
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <div className="auth-demo">
          <p>Comptes de démonstration :</p>
          {[
            { label: "Admin", email: "admin@LOC_Voiture.tn", pw: "password" },
            { label: "Chef agence", email: "chef@LOC_Voiture.tn", pw: "password" },
            { label: "Agent", email: "agent@LOC_Voiture.tn", pw: "password" },
            { label: "Client", email: "client@LOC_Voiture.tn", pw: "password" },
          ].map((d) => (
            <button
              key={d.label}
              className="demo-btn"
              onClick={() => setForm({ email: d.email, password: d.pw })}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="auth-footer">
          Pas de compte ? <Link to="/register">S'inscrire</Link>
        </div>
      </div>
    </div>
  );
}
