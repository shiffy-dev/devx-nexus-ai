import React, { useState } from "react";
import "./App.css";
import { CartProvider } from "./context/CartContext";
import ChatBot from "./pages/ChatBot";
import Cart from "./pages/Cart";
import Navigation from "./pages/navigation";
import Checkout from "./pages/Checkout";

function App() {
  const [currentView, setCurrentView] = useState("chat");
  const [orderId, setOrderId] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);

  return (
    <CartProvider>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        {currentView === "chat" && (
          <ChatBot onViewCart={() => setCurrentView("cart")} />
        )}

        {currentView === "cart" && (
          <Cart
            onBackToChat={() => setCurrentView("chat")}
            onNavigate={() => setCurrentView("navigation")}
            onCheckout={() => setCurrentView("checkout")}
          />
        )}

        {currentView === "navigation" && (
          <Navigation
            cartItems={[]} // Pass from context
            onBackToCart={() => setCurrentView("cart")}
            onCompleteNavigation={() => setCurrentView("checkout")}
          />
        )}

        {currentView === "checkout" && (
          <Checkout
            onBackToCart={() => setCurrentView("cart")}
            onOrderPlaced={(id, time) => {
              setOrderId(id);
              setEstimatedTime(time);
              setCurrentView("confirmation");
            }}
          />
        )}

        {currentView === "confirmation" && (
          <div className="confirmation-screen">
            <div className="confirmation-card">
              <div className="success-icon">✅</div>
              <h1>Order Placed Successfully!</h1>
              <p>Order ID: {orderId}</p>
              <p>Estimated arrival: {estimatedTime}</p>
              <button onClick={() => {
                setCurrentView("chat");
                setOrderId(null);
                setEstimatedTime(null);
              }}>
                Place Another Order
              </button>
            </div>
          </div>
        )}
      </div>
    </CartProvider>
  );
}

export default App;