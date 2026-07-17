import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import "../styles/Checkout.css";

export default function Checkout({ onBackToCart, onOrderPlaced }) {
  const { cartItems, getTotalPrice, clearCart } = useContext(CartContext);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    deliveryType: "delivery",
    paymentMethod: "cash"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const orderData = {
        customer: {
          name: formData.fullName,
          phone: formData.phone,
          address: formData.address
        },
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          qty: item.quantity,
          price: item.price
        })),
        deliveryType: formData.deliveryType,
        paymentMethod: formData.paymentMethod,
        totalAmount: getTotalPrice() + 5,
        branchId: "branch-deira-3"
      };

      const response = await fetch("http://localhost:8000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error("Order creation failed");

      const result = await response.json();
      clearCart();
      onOrderPlaced(result.order_id, result.estimatedTime);
    } catch (err) {
      setError(err.message || "Failed to place order. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.fullName && formData.phone && formData.address;

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button className="back-btn" onClick={onBackToCart}>
          ← Back to Cart
        </button>
        <h1>📦 Checkout</h1>
        <div className="spacer"></div>
      </div>

      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-section">
            <h2>Delivery Details</h2>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+971 50 123 4567"
                required
              />
            </div>

            <div className="form-group">
              <label>Delivery Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Building, Street, Area, Dubai"
                rows="3"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Delivery Type</label>
                <select
                  name="deliveryType"
                  value={formData.deliveryType}
                  onChange={handleChange}
                >
                  <option value="delivery">🚗 Home Delivery (AED 5)</option>
                  <option value="pickup">🏪 Store Pickup (Free)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="cash">💵 Cash on Delivery</option>
                  <option value="card">💳 Credit/Debit Card</option>
                  <option value="wallet">📱 Digital Wallet</option>
                </select>
              </div>
            </div>
          </div>

          {error && <div className="error-message">❌ {error}</div>}

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="place-order-btn"
          >
            {loading ? "⏳ Placing Order..." : `✓ Place Order (AED ${(getTotalPrice() + 5).toFixed(2)})`}
          </button>
        </form>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {cartItems.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.name} × {item.quantity}</span>
                <span>AED {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>AED {getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery:</span>
              <span>{formData.deliveryType === "pickup" ? "Free" : "AED 5.00"}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>AED {(getTotalPrice() + (formData.deliveryType === "pickup" ? 0 : 5)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}