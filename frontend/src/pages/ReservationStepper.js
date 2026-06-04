import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { carsAPI, reservationsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./ReservationStepper.css";

const STEP_LABELS = ["Vos informations", "Options & extras", "Paiement"];

export default function ReservationStepper({
  car,
  startDate,
  endDate,
  onClose,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [payResult, setPayResult] = useState(null);

  const [info, setInfo] = useState({
    client_name: user?.name || "",
    client_email: user?.email || "",
    client_phone: user?.phone || "",
    client_cin: user?.cin || "",
  });

  const days = Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000);
  const base = days * car.price_per_day;
  const extra = selected.reduce((s, o) => s + Number(o.prix), 0);
  const total = base + extra;

  const [payment, setPayment] = useState("sur_place");

  useEffect(() => {
    reservationsAPI
      .getOptions()
      .then((r) => setOptions(r.data))
      .catch(() => {});
  }, []);

  const toggleOption = (opt) => {
    setSelected((prev) =>
      prev.find((o) => o.id === opt.id)
        ? prev.filter((o) => o.id !== opt.id)
        : [...prev, opt],
    );
  };

  const handleStep1 = () => {
    if (
      !info.client_name ||
      !info.client_email ||
      !info.client_phone ||
      !info.client_cin
    ) {
      setError("Tous les champs sont requis");
      return;
    }
    setError("");
    setStep(1);
  };

  const handleStep2 = () => {
    setStep(2);
  };

  const handleBook = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reservationsAPI.create({
        car_id: car.id,
        start_date: startDate,
        end_date: endDate,
        payment_method: payment,
        options: selected.map((o) => ({ id: o.id, prix: o.prix })),
        ...info,
      });
      setDone(res.data);
      if (payment === "en_ligne") {
        // Simulate payment
        setTimeout(async () => {
          const r = await reservationsAPI.simulatePayment(res.data.id);
          setPayResult(r.data);
        }, 1500);
      }
    } catch (e) {
      setError(e.response?.data?.msg || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  if (done)
    return (
      <div className="step-done">
        {payResult === null && payment === "en_ligne" ? (
          <>
            <div className="spinner" />
            <p>Traitement du paiement...</p>
          </>
        ) : (
          <>
            <div
              className={`done-icon ${payResult?.success === false ? "fail" : "ok"}`}
            >
              {payResult?.success === false ? "✕" : "✓"}
            </div>
            <h3>
              {payResult?.success === false
                ? "Paiement refusé"
                : "Réservation confirmée !"}
            </h3>
            <p className="text-muted">
              {payResult?.msg ||
                `Votre réservation #${done.id} a été créée avec succès.`}
            </p>
            <div className="done-summary">
              <div className="done-row">
                <span>Véhicule</span>
                <span>
                  {car.brand} {car.model}
                </span>
              </div>
              <div className="done-row">
                <span>Période</span>
                <span>
                  {startDate} → {endDate}
                </span>
              </div>
              <div className="done-row total">
                <span>Total</span>
                <span>{total.toFixed(0)} DT</span>
              </div>
            </div>
            <button
              className="btn btn-gold btn-full"
              style={{ marginTop: "1.2rem" }}
              onClick={() => navigate("/dashboard")}
            >
              Voir mes réservations
            </button>
          </>
        )}
      </div>
    );

  return (
    <div className="res-stepper">
      {/* Step indicator */}
      <div className="steps">
        {STEP_LABELS.map((label, i) => (
          <div
            key={i}
            className={`step-item ${i < step ? "done" : i === step ? "active" : ""}`}
          >
            <div className="step-circle">{i < step ? "✓" : i + 1}</div>
            <div className="step-label">{label}</div>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* STEP 0: Client info */}
      {step === 0 && (
        <div className="step-panel anim-1">
          <h3 className="step-title">Vos informations</h3>
          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label">Nom complet *</label>
              <input
                className="form-input"
                value={info.client_name}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, client_name: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                className="form-input"
                type="email"
                value={info.client_email}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, client_email: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone *</label>
              <input
                className="form-input"
                value={info.client_phone}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, client_phone: e.target.value }))
                }
                placeholder="+216 XX XXX XXX"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Numéro CIN *</label>
              <input
                className="form-input"
                value={info.client_cin}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, client_cin: e.target.value }))
                }
                placeholder="8 chiffres"
              />
            </div>
          </div>
          <div className="step-mini-summary">
            <span>
              🗓 {days} jour{days > 1 ? "s" : ""}
            </span>
            <span>💰 Base : {base.toFixed(0)} DT</span>
          </div>
          <div className="step-actions">
            <button className="btn btn-ghost" onClick={onClose}>
              Annuler
            </button>
            <button className="btn btn-gold" onClick={handleStep1}>
              Continuer →
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: Options */}
      {step === 1 && (
        <div className="step-panel anim-1">
          <h3 className="step-title">Options & extras</h3>
          <p
            className="text-muted"
            style={{ marginBottom: "1.2rem", fontSize: ".86rem" }}
          >
            Personnalisez votre location (optionnel)
          </p>
          <div className="options-grid">
            {options.map((opt) => {
              const isSelected = selected.find((o) => o.id === opt.id);
              return (
                <button
                  key={opt.id}
                  className={`option-card${isSelected ? " selected" : ""}`}
                  onClick={() => toggleOption(opt)}
                >
                  <div className="option-icon">{opt.icone}</div>
                  <div className="option-name">{opt.nom}</div>
                  <div className="option-desc">{opt.description}</div>
                  <div className="option-price">
                    +{Number(opt.prix).toFixed(0)} DT
                  </div>
                  {isSelected && <div className="option-check">✓</div>}
                </button>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div className="step-mini-summary">
              {selected.map((o) => (
                <span key={o.id}>
                  {o.icone} +{Number(o.prix).toFixed(0)} DT
                </span>
              ))}
            </div>
          )}
          <div className="step-actions">
            <button className="btn btn-ghost" onClick={() => setStep(0)}>
              ← Retour
            </button>
            <button className="btn btn-gold" onClick={handleStep2}>
              Continuer →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Payment */}
      {step === 2 && (
        <div className="step-panel anim-1">
          <h3 className="step-title">Mode de paiement</h3>
          <div className="payment-options">
            <button
              className={`payment-card${payment === "sur_place" ? " selected" : ""}`}
              onClick={() => setPayment("sur_place")}
            >
              <div className="payment-icon">🏪</div>
              <div>
                <div className="payment-name">Paiement sur place</div>
                <div className="payment-desc">
                  Payez lors de la prise en charge du véhicule
                </div>
              </div>
              {payment === "sur_place" && (
                <div className="payment-check">✓</div>
              )}
            </button>
            <button
              className={`payment-card${payment === "en_ligne" ? " selected" : ""}`}
              onClick={() => setPayment("en_ligne")}
            >
              <div className="payment-icon">💳</div>
              <div>
                <div className="payment-name">Paiement en ligne</div>
                <div className="payment-desc">
                  Paiement sécurisé immédiat — réservation confirmée
                  instantanément
                </div>
              </div>
              {payment === "en_ligne" && <div className="payment-check">✓</div>}
            </button>
          </div>

          <div className="pay-summary card" style={{ marginTop: "1.2rem" }}>
            <div className="card-body">
              <div className="pay-row">
                <span>
                  Location {days} jour{days > 1 ? "s" : ""}
                </span>
                <span>{base.toFixed(0)} DT</span>
              </div>
              {selected.map((o) => (
                <div className="pay-row" key={o.id}>
                  <span>
                    {o.icone} {o.nom}
                  </span>
                  <span>+{Number(o.prix).toFixed(0)} DT</span>
                </div>
              ))}
              <div className="divider" />
              <div className="pay-row total">
                <span>Total</span>
                <span>{total.toFixed(0)} DT</span>
              </div>
            </div>
          </div>

          <div className="step-actions">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>
              ← Retour
            </button>
            <button
              className="btn btn-gold"
              onClick={handleBook}
              disabled={loading}
            >
              {loading
                ? "Traitement..."
                : payment === "en_ligne"
                  ? "💳 Payer " + total.toFixed(0) + " DT"
                  : "✓ Confirmer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
