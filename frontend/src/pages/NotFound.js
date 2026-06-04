import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-num">404</div>
      <h2>Page introuvable</h2>
      <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <div className="not-found-actions">
        <Link to="/"     className="btn btn-gold">Accueil</Link>
        <Link to="/cars" className="btn btn-ghost">Voir les voitures</Link>
      </div>
    </div>
  );
}
