import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import "../styles/Cart.css";

export default function Cart({ onBackToChat, onCheckout, onNavigate }) {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } =
    useContext(CartContext);

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <button className="back-btn" onClick={onBackToChat}>
            ← Back to Chat
          </button>
          <h1>🛒 Your Cart</h1>
        </div>

        <div className="empty-cart">
          <div className="empty-icon">🛍️</div>
          <h2>Your cart is empty</h2>
          <p>Start chatting to add items!</p>
          <button className="back-btn-large" onClick={onBackToChat}>
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <button className="back-btn" onClick={onBackToChat}>
          ← Back to Chat
        </button>
        <h1>🛒 Your Cart</h1>
        <div className="spacer"></div>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-unit">{item.unit}</p>
                <p className="item-location">📍 {item.location}</p>
              </div>

              <div className="item-price">
                <p className="unit-price">AED {item.price}</p>
                <p className="total-price">
                  AED {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>

              <div className="quantity-control">
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  −
                </button>
                <span className="qty-display">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.id)}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

               <div className="cart-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>AED {getTotalPrice().toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery:</span>
            <span>AED 5.00</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>AED {(getTotalPrice() + 5).toFixed(2)}</span>
          </div>

          <button 
            className="checkout-btn" 
            onClick={onCheckout}
          >
            💳 Proceed to Checkout
          </button>

          <button 
            className="navigation-btn" 
            onClick={onNavigate}
          >
            🗺️ Find My Route in Store
          </button>

          <button className="continue-shopping" onClick={onBackToChat}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}