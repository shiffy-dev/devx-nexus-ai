import React, { useState } from "react";
import "./App.css";
import { CartProvider } from "./context/CartContext";
import ChatBot from "./pages/ChatBot";
import Cart from "./pages/Cart";

function App() {
  const [currentView, setCurrentView] = useState("chat");

  return (
    <CartProvider>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        {currentView === "chat" ? (
          <ChatBot onViewCart={() => setCurrentView("cart")} />
        ) : (
          <Cart onBackToChat={() => setCurrentView("chat")} />
        )}
      </div>
    </CartProvider>
  );
}

export default App;