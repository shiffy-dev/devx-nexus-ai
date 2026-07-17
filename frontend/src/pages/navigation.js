import React, { useState, useEffect } from "react";
import "../styles/Navigation.css";

export default function Navigation({ cartItems, onBackToCart, onCompleteNavigation }) {
  const [route, setRoute] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentNode, setCurrentNode] = useState("N-001");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [navSession, setNavSession] = useState(null);

  useEffect(() => {
    fetchRoute();
  }, []);

  const fetchRoute = async () => {
    try {
      setLoading(true);
      const productIds = cartItems.map(item => item.id);
      
      const response = await fetch("http://localhost:8000/api/navigation/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: `nav_${Date.now()}`,
          from_node_id: "N-001",
          product_ids: productIds
        })
      });

      if (!response.ok) throw new Error("Could not fetch route");
      const data = await response.json();
      setRoute(data.route);
      setNavSession(data.session_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async (nodeId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/navigation/session/${navSession}/scan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ node_id: nodeId })
      });

      if (response.ok) {
        setCurrentNode(nodeId);
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);

        if (nextStep >= route.length) {
          setTimeout(() => onCompleteNavigation(), 1000);
        }
      }
    } catch (err) {
      setError("Scan failed, try again");
    }
  };

  if (loading) {
    return (
      <div className="nav-container">
        <div className="nav-loading">
          <div className="spinner"></div>
          <p>Loading your store route...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nav-container">
        <div className="nav-error">
          <p>❌ {error}</p>
          <button onClick={onBackToCart}>Go Back</button>
        </div>
      </div>
    );
  }

  const currentInstruction = route && route[currentStep];
  const itemsRemaining = route ? route.length - currentStep : 0;
  const itemsCollected = currentStep;

  return (
    <div className="nav-container">
      <div className="nav-header">
        <button className="back-btn" onClick={onBackToCart}>
          ← Back
        </button>
        <h1>🗺️ Store Navigation</h1>
        <div className="nav-progress">
          <span className="progress-text">{itemsCollected}/{route?.length}</span>
        </div>
      </div>

      <div className="nav-content">
        <div className="nav-main">
          {currentInstruction && (
            <>
              <div className="instruction-card">
                <div className="instruction-number">Step {currentStep + 1} of {route.length}</div>
                <h2 className="instruction-text">{currentInstruction.instruction}</h2>
                <div className="instruction-details">
                  <p>📍 {currentInstruction.location}</p>
                  <p>📏 Distance: ~{currentInstruction.distance}m</p>
                  <p>⏱️ Time: ~{Math.ceil(currentInstruction.distance / 1.4)}s</p>
                </div>
              </div>

              <div className="qr-section">
                <p>When you reach the location, scan the QR code or select it below:</p>
                <div className="node-selector">
                  <label>📍 Current Location:</label>
                  <select
                    value={currentNode}
                    onChange={(e) => handleQRScan(e.target.value)}
                    className="node-dropdown"
                  >
                    <option value="">-- Scan QR or Select Location --</option>
                    {route.map((step, idx) => (
                      <option key={idx} value={step.node_id}>
                        {step.location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {itemsRemaining === 0 && (
            <div className="nav-complete">
              <div className="success-icon">✅</div>
              <h2>Collection Complete!</h2>
              <p>Head to checkout to finish your purchase.</p>
              <button onClick={onCompleteNavigation} className="checkout-btn">
                Go to Checkout
              </button>
            </div>
          )}
        </div>

        <div className="nav-sidebar">
          <h3>📦 Remaining Items</h3>
          <div className="items-list">
            {route && route.slice(currentStep).map((step, idx) => (
              <div key={idx} className={`item-card ${idx === 0 ? "active" : ""}`}>
                <span className="item-num">{itemsCollected + idx + 1}</span>
                <div>
                  <p className="item-name">{step.location}</p>
                  <p className="item-distance">~{step.distance}m away</p>
                </div>
              </div>
            ))}
          </div>

          <div className="nav-stats">
            <div className="stat">
              <span className="stat-label">Total Distance</span>
              <span className="stat-value">{route?.reduce((sum, s) => sum + s.distance, 0)}m</span>
            </div>
            <div className="stat">
              <span className="stat-label">Est. Time</span>
              <span className="stat-value">~{Math.ceil(route?.reduce((sum, s) => sum + s.distance, 0) / 1.4)}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}