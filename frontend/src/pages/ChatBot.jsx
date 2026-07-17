import React, { useState, useRef, useEffect, useContext } from "react";
import { CartContext } from "../context/CartContext";
import "../styles/ChatBot.css";

export default function ChatBot({ onViewCart }) {
  const { addToCart } = useContext(CartContext);
  const [messages, setMessages] = useState([
    { type: "bot", text: "👋 Welcome to DevX AI Concierge!\n\nI'm your smart shopping assistant. Tell me what you'd like to cook and I'll build the perfect shopping list for you! 🛒", products: [] }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Add user message
    const userMessage = input;
    setMessages(prev => [...prev, { type: "user", text: userMessage, products: [] }]);
    setInput("");
    setLoading(true);

    try {
      // Call backend API
      const response = await fetch("http://localhost:8000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract message and products from response
      const botMessage = data.response?.message || "Sorry, I couldn't process that. Please try again.";
      let products = data.response?.products || [];
      
      // Fetch full product details for each recommended product
      if (products.length > 0) {
        const enrichedProducts = await Promise.all(
          products.map(async (prod) => {
            try {
              const detailResponse = await fetch(`http://localhost:8000/api/products/${prod.id}`);
              if (detailResponse.ok) {
                const details = await detailResponse.json();
                return {
                  ...prod,
                  name: details.name,
                  price: details.price,
                  unit: details.unit,
                  location: details.location
                };
              }
            } catch (err) {
              console.warn(`Could not fetch details for product ${prod.id}`);
            }
            return prod;
          })
        );
        products = enrichedProducts;
      }
      
      // Add bot message with products
      setMessages(prev => [...prev, { 
        type: "bot", 
        text: botMessage,
        products: products
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        type: "bot", 
        text: "❌ Connection error. Make sure the backend is running on http://localhost:8000",
        products: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h1>🤖 AI Shopping Assistant</h1>
        <p>Smart shopping made easy</p>
        {onViewCart && (
          <button className="view-cart-btn" onClick={onViewCart}>
            🛒 View Cart
          </button>
        )}
      </div>

      <div className="chat-wrapper">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx}>
              <div className={`message message-${msg.type}`}>
                <div className="message-avatar">
                  {msg.type === "user" ? "👤" : "🤖"}
                </div>
                <div className="message-bubble">
                  {msg.text}
                </div>
              </div>

              {msg.products && msg.products.length > 0 && (
                <div className="products-container">
                  {msg.products.map((product) => (
                    <div key={product.id} className="product-card">
                      <div className="product-info">
                        <h4>{product.name}</h4>
                        <p className="product-unit">{product.unit}</p>
                        <p className="product-reason">💡 {product.reason}</p>
                      </div>
                      <div className="product-footer">
                        <span className="product-price">AED {product.price}</span>
                        <button
                          className="add-to-cart-btn"
                          onClick={() => {
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              unit: product.unit,
                              location: product.location || "Aisle Unknown"
                            }, product.qty || 1);
                          }}
                        >
                          + Add (×{product.qty || 1})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="message message-bot">
              <div className="message-avatar">🤖</div>
              <div className="message-bubble typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-form">
          <input
            type="text"
            placeholder="What do you want to cook? (e.g., 'Biryani for 4 people')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="chat-input"
            autoFocus
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="send-btn"
          >
            {loading ? "⏳" : "📤"}
          </button>
        </form>
      </div>
    </div>
  );
}
