import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme, THEMES } from "../../context/ThemeContext";
import "./Navbar.css";

const ROLE_LABEL = {
  admin: "Admin",
  chef_agence: "Chef Agence",
  agent: "Agent",
  client: "Client",
};
const getDash = (role) => {
  if (role === "admin") return "/admin";
  if (role === "chef_agence") return "/chef";
  if (role === "agent") return "/agent";
  return "/dashboard";
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pref, setPref } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [thMenu, setThMenu] = useState(false);
  const close = () => {
    setOpen(false);
    setThMenu(false);
  };
  const handleLogout = () => {
    logout();
    navigate("/");
    close();
  };
  const curTheme = THEMES.find((t) => t.key === pref);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" onClick={close}>
          🚗 LOC_Voiture
        </Link>

        <div className="navbar-center">
          <NavLink
            to="/"
            end
            className={({ isActive }) => "nav-lk" + (isActive ? " act" : "")}
          >
            Accueil
          </NavLink>
          <NavLink
            to="/cars"
            className={({ isActive }) => "nav-lk" + (isActive ? " act" : "")}
          >
            Voitures
          </NavLink>
          {user && (
            <NavLink
              to={getDash(user.role)}
              className={({ isActive }) => "nav-lk" + (isActive ? " act" : "")}
            >
              Dashboard
            </NavLink>
          )}
        </div>

        <div className="navbar-right">
          {/* Theme toggle */}
          <div className="th-wrap" onMouseLeave={() => setThMenu(false)}>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setThMenu(!thMenu)}
              title="Thème"
            >
              {curTheme?.icon}
            </button>
            {thMenu && (
              <div className="th-menu">
                {THEMES.map((t) => (
                  <button
                    key={t.key}
                    className={`th-opt${pref === t.key ? " sel" : ""}`}
                    onClick={() => {
                      setPref(t.key);
                      setThMenu(false);
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="nb-user">
              <div className="nb-avatar">{user.name[0].toUpperCase()}</div>
              <div className="nb-info">
                <span className="nb-name">{user.name}</span>
                <span className={`badge badge-${user.role}`}>
                  {ROLE_LABEL[user.role]}
                </span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Déco
              </button>
            </div>
          ) : (
            <div className="nb-auth">
              <Link to="/login" className="btn btn-ghost btn-sm">
                Connexion
              </Link>
              <Link to="/register" className="btn btn-gold  btn-sm">
                S'inscrire
              </Link>
            </div>
          )}
          <button
            className="nb-toggle btn btn-ghost btn-icon"
            onClick={() => setOpen(!open)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <div className="nb-drawer">
          {[
            { to: "/", label: "Accueil", end: true },
            { to: "/cars", label: "Voitures" },
            ...(user ? [{ to: getDash(user.role), label: "Dashboard" }] : []),
          ].map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className="nb-dl"
              onClick={close}
            >
              {l.label}
            </NavLink>
          ))}
          <div className="nb-dth">
            {THEMES.map((t) => (
              <button
                key={t.key}
                className={`nb-dtb${pref === t.key ? " sel" : ""}`}
                onClick={() => setPref(t.key)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className="nb-da">
            {user ? (
              <button
                className="btn btn-danger btn-sm btn-full"
                style={{ marginTop: "1rem" }}
                onClick={handleLogout}
              >
                Déconnexion
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-ghost btn-sm btn-full"
                  onClick={close}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="btn btn-gold btn-sm btn-full"
                  onClick={close}
                  style={{ marginTop: ".4rem" }}
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
