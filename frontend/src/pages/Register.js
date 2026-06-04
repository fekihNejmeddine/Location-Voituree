import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
    cin: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const s = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Mots de passe différents");
      return;
    }
    if (form.password.length < 6) {
      setError("Min. 6 caractères");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card anim-1">
        <div className="auth-brand">🚗 LOC_Voiture</div>
        <h2 className="auth-title">Créer un compte</h2>
        <p className="auth-sub">Rejoignez LOC_Voiture gratuitement</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <input
                className="form-input"
                placeholder="Ahmed Ben Ali"
                value={form.name}
                onChange={s("name")}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone</label>
              <input
                className="form-input"
                placeholder="+216 XX XXX XXX"
                value={form.phone}
                onChange={s("phone")}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={s("email")}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Numéro CIN</label>
            <input
              className="form-input"
              placeholder="8 chiffres"
              value={form.cin}
              onChange={s("cin")}
            />
          </div>
          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                className="form-input"
                type="password"
                placeholder="Min. 6 caractères"
                value={form.password}
                onChange={s("password")}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmer</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={s("confirm")}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-gold btn-full"
            style={{ marginTop: ".5rem" }}
            disabled={loading}
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>
        <div className="auth-footer">
          Déjà membre ? <Link to="/login">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}
