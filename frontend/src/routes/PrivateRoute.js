import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading)
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );
  return user ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: loc }} replace />
  );
}

export function RoleRoute({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
