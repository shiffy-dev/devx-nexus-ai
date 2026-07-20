import React, { useState } from "react";
import "./App.css";

import { CartProvider } from "./context/CartContext";

import ChatBot from "./pages/ChatBot";
import Cart from "./pages/Cart";
import Navigation from "./pages/navigation";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";

function App() {

  const [currentView, setCurrentView] = useState("chat");
  const [navigationItems, setNavigationItems] = useState([]);

  return (

    <CartProvider>

      <div className="app">

        {/* CHAT */}

        {currentView === "chat" && (

          <ChatBot
            onViewCart={() => setCurrentView("cart")}
          />

        )}



        {/* CART */}

        {currentView === "cart" && (

          <Cart

            onBackToChat={() =>
              setCurrentView("chat")
            }

            onNavigate={(items) => {

              setNavigationItems(items);

              setCurrentView("navigation");

            }}

            onCheckout={() =>
              setCurrentView("checkout")
            }

          />

        )}



        {/* NAVIGATION */}

        {currentView === "navigation" && (

          <Navigation

            cartItems={navigationItems}

            onBackToCart={() =>
              setCurrentView("cart")
            }

            onCompleteNavigation={() =>
              setCurrentView("checkout")
            }

          />

        )}



        {/* CHECKOUT */}

        {currentView === "checkout" && (

          <Checkout

            onBackToCart={() =>
              setCurrentView("cart")
            }

            onAdmin={() =>
              setCurrentView("admin")
            }

          />

        )}



        {/* ADMIN */}

        {currentView === "admin" && (

          <Admin

            onBack={() =>
              setCurrentView("checkout")
            }

          />

        )}

      </div>

    </CartProvider>

  );

}

export default App;