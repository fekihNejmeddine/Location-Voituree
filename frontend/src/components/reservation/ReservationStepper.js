import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { reservationsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./ReservationStepper.css";

const STEPS = [
  "Vos informations",
  "Options & extras",
  "Paiement & confirmation",
];

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
  const [info, setInfo] = useState({
    client_name: user?.name || "",
    client_email: user?.email || "",
    client_phone: user?.phone || "",
    client_cin: user?.cin || "",
  });
  const [payment, setPayment] = useState("sur_place");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [payResult, setPayResult] = useState(null);
  const [paying, setPaying] = useState(false);

  // Calculations
  const days = Math.max(
    1,
    Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000),
  );
  const base = +(days * Number(car.price_per_day)).toFixed(2);
  const extra = +selected.reduce((s, o) => s + Number(o.prix), 0).toFixed(2);
  const total = +(base + extra).toFixed(2);

  useEffect(() => {
    reservationsAPI
      .getOptions()
      .then((r) => setOptions(r.data))
      .catch(() => {});
  }, []);

  const toggleOpt = (opt) =>
    setSelected((prev) =>
      prev.find((o) => o.id === opt.id)
        ? prev.filter((o) => o.id !== opt.id)
        : [...prev, opt],
    );

  // STEP 0 → 1
  const goStep1 = () => {
    if (
      !info.client_name.trim() ||
      !info.client_email.trim() ||
      !info.client_phone.trim() ||
      !info.client_cin.trim()
    ) {
      setError("Tous les champs sont obligatoires");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(info.client_email)) {
      setError("Email invalide");
      return;
    }
    setError("");
    setStep(1);
  };

  // STEP 2 → Book
  const handleBook = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reservationsAPI.create({
        car_id: car.id,
        start_date: startDate,
        end_date: endDate,
        payment_method: payment,
        options: selected.map((o) => ({ id: o.id, prix: Number(o.prix) })),
        ...info,
      });
      setDone(res.data);
      if (payment === "en_ligne") {
        setPaying(true);
        setTimeout(async () => {
          try {
            const r = await reservationsAPI.pay(res.data.id);
            setPayResult(r.data);
          } catch {
            setPayResult({ success: false, msg: "Erreur de paiement" });
          } finally {
            setPaying(false);
          }
        }, 1800);
      }
    } catch (e) {
      setError(e.response?.data?.msg || "Erreur lors de la réservation");
    } finally {
      setLoading(false);
    }
  };

  // ── DONE SCREEN ──────────────────────────
  if (done) {
    const isPaying = payment === "en_ligne" && payResult === null;
    return (
      <div className="stp-done">
        {isPaying ? (
          <>
            <div className="spinner" />
            <p style={{ color: "var(--text3)", marginTop: ".5rem" }}>
              Traitement du paiement...
            </p>
          </>
        ) : (
          <>
            <div
              className={`done-ic ${payResult?.success === false ? "fail" : "ok"}`}
            >
              {payResult?.success === false ? "✕" : "✓"}
            </div>
            <h3>
              {payResult?.success === false
                ? "Paiement refusé"
                : "Réservation créée !"}
            </h3>
            <p
              className="text-muted"
              style={{ marginBottom: "1.2rem", fontSize: ".88rem" }}
            >
              {payResult?.msg ||
                `Votre réservation #${done.id} a été enregistrée.`}
            </p>
            <div className="done-sum">
              <div className="ds-row">
                <span>Véhicule</span>
                <strong>
                  {car.brand} {car.model}
                </strong>
              </div>
              <div className="ds-row">
                <span>Du</span>
                <strong>{startDate}</strong>
              </div>
              <div className="ds-row">
                <span>Au</span>
                <strong>{endDate}</strong>
              </div>
              <div className="ds-row">
                <span>
                  {days} jour{days > 1 ? "s" : ""}
                </span>
                <strong style={{ color: "var(--gold)" }}>
                  {total.toFixed(0)} DT
                </strong>
              </div>
            </div>
            {payResult?.success === false && (
              <button
                className="btn btn-warn btn-full"
                style={{ marginBottom: ".6rem" }}
                onClick={async () => {
                  setPaying(true);
                  setPayResult(null);
                  setTimeout(async () => {
                    try {
                      const r = await reservationsAPI.pay(done.id);
                      setPayResult(r.data);
                    } catch {
                      setPayResult({
                        success: false,
                        msg: "Erreur de paiement",
                      });
                    } finally {
                      setPaying(false);
                    }
                  }, 1500);
                }}
              >
                Réessayer le paiement
              </button>
            )}
            <button
              className="btn btn-gold btn-full"
              onClick={() => navigate("/dashboard")}
            >
              Voir mes réservations →
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="stp-wrap">
      {/* Step indicator */}
      <div className="steps">
        {STEPS.map((label, i) => (
          <div
            key={i}
            className={`step-item${i < step ? " done" : i === step ? " active" : ""}`}
          >
            <div className="step-circle">{i < step ? "✓" : i + 1}</div>
            <div className="step-label">{label}</div>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── STEP 0 : Client info ── */}
      {step === 0 && (
        <div className="a1">
          <p
            style={{
              fontSize: ".86rem",
              color: "var(--text3)",
              marginBottom: "1.2rem",
            }}
          >
            Ces informations seront utilisées pour votre contrat de location.
          </p>
          <div className="form-row col-2">
            <div className="form-group">
              <label className="form-label">Nom complet *</label>
              <input
                className="form-input"
                value={info.client_name}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, client_name: e.target.value }))
                }
                placeholder="Ahmed Ben Ali"
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
                placeholder="vous@email.com"
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
          <div className="stp-mini-sum">
            <span>
              🗓 {days} jour{days > 1 ? "s" : ""}
            </span>
            <span>
              🚗 {car.brand} {car.model}
            </span>
            <span style={{ color: "var(--gold)", fontWeight: 600 }}>
              Base : {base.toFixed(0)} DT
            </span>
          </div>
          <div className="stp-actions">
            <button className="btn btn-ghost" onClick={onClose}>
              Annuler
            </button>
            <button className="btn btn-gold" onClick={goStep1}>
              Continuer →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 1 : Options ── */}
      {step === 1 && (
        <div className="a1">
          <p
            style={{
              fontSize: ".86rem",
              color: "var(--text3)",
              marginBottom: "1.2rem",
            }}
          >
            Personnalisez votre location avec des options supplémentaires
            (toutes optionnelles).
          </p>
          {options.length === 0 ? (
            <p className="text-muted">Chargement des options...</p>
          ) : (
            <div className="opts-grid">
              {options.map((opt) => {
                const sel = !!selected.find((o) => o.id === opt.id);
                return (
                  <button
                    key={opt.id}
                    className={`opt-card${sel ? " sel" : ""}`}
                    onClick={() => toggleOpt(opt)}
                  >
                    <div className="opt-icon">{opt.icone}</div>
                    <div className="opt-name">{opt.nom}</div>
                    <div className="opt-desc">{opt.description}</div>
                    <div className="opt-price">
                      +{Number(opt.prix).toFixed(0)} DT
                    </div>
                    {sel && <div className="opt-chk">✓</div>}
                  </button>
                );
              })}
            </div>
          )}
          {selected.length > 0 && (
            <div className="stp-mini-sum" style={{ marginTop: "1rem" }}>
              {selected.map((o) => (
                <span key={o.id}>
                  {o.icone} +{Number(o.prix).toFixed(0)} DT
                </span>
              ))}
            </div>
          )}
          <div className="stp-actions">
            <button className="btn btn-ghost" onClick={() => setStep(0)}>
              ← Retour
            </button>
            <button className="btn btn-gold" onClick={() => setStep(2)}>
              Continuer →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2 : Payment ── */}
      {step === 2 && (
        <div className="a1">
          <h4 style={{ marginBottom: "1rem", fontWeight: 600 }}>
            Mode de paiement
          </h4>
          <div className="pay-opts">
            {[
              {
                key: "sur_place",
                icon: "🏪",
                title: "Paiement sur place",
                desc: "Payez lors de la prise en charge du véhicule en agence.",
              },
              {
                key: "en_ligne",
                icon: "💳",
                title: "Paiement en ligne",
                desc: "Paiement sécurisé immédiat. Réservation confirmée instantanément.",
              },
            ].map((p) => (
              <button
                key={p.key}
                className={`pay-card${payment === p.key ? " sel" : ""}`}
                onClick={() => setPayment(p.key)}
              >
                <div className="pay-icon">{p.icon}</div>
                <div>
                  <div className="pay-title">{p.title}</div>
                  <div className="pay-desc">{p.desc}</div>
                </div>
                <div
                  className={`pay-radio${payment === p.key ? " sel" : ""}`}
                />
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="pay-sum">
            <div className="ps-row">
              <span>
                Location {days} jour{days > 1 ? "s" : ""}
              </span>
              <span>{base.toFixed(0)} DT</span>
            </div>
            {selected.map((o) => (
              <div className="ps-row" key={o.id}>
                <span>
                  {o.icone} {o.nom}
                </span>
                <span>+{Number(o.prix).toFixed(0)} DT</span>
              </div>
            ))}
            <div className="divider" style={{ margin: ".6rem 0" }} />
            <div className="ps-row tot">
              <span>Total</span>
              <span>{total.toFixed(0)} DT</span>
            </div>
          </div>

          <div className="stp-actions">
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
                  ? `💳 Payer ${total.toFixed(0)} DT`
                  : "✓ Confirmer la réservation"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
