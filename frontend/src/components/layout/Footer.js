import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="footer-brand">LOC_Voiture.</div>
          <div>© {new Date().getFullYear()} — Application de location de voiture</div>
        </div>
        <div className="footer-links">
          <Link to="/"    className="footer-link">Accueil</Link>
          <Link to="/cars" className="footer-link">Voitures</Link>
        </div>
      </div>
    </footer>
  );
}
