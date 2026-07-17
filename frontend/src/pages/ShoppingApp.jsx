import React, { useState, useRef, useEffect } from "react";
import "../styles/ShoppingApp.css";

const CATEGORIES = [
  { id: "all", name: "All", emoji: "📦" },
  { id: "rice", name: "Rice & Grains", emoji: "🍚" },
  { id: "meat", name: "Fresh Meat", emoji: "🥩" },
  { id: "dairy", name: "Dairy & Chilled", emoji: "🥛" },
  { id: "produce", name: "Fresh Produce", emoji: "🥬" },
  { id: "spices", name: "Spices", emoji: "🌶️" },
  { id: "beverages", name: "Beverages", emoji: "🥤" },
  { id: "bakery", name: "Bakery", emoji: "🍞" },
  { id: "household", name: "Household", emoji: "🧹" },
  { id: "snacks", name: "Snacks", emoji: "🍿" },
];

const PRODUCTS = [
  { id: 1, name: "Basmati Rice", category: "rice", price: 32, originalPrice: 36, discount: 11, emoji: "🍚" },
  { id: 2, name: "Sella Rice", category: "rice", price: 28, originalPrice: 28, emoji: "🍚" },
  { id: 3, name: "Brown Rice", category: "rice", price: 18, originalPrice: 18, emoji: "🍚" },
  { id: 4, name: "Chicken Whole", category: "meat", price: 22, originalPrice: 25, discount: 12, emoji: "🍗" },
  { id: 5, name: "Chicken Breast", category: "meat", price: 16, originalPrice: 16, emoji: "🍗" },
  { id: 6, name: "Fresh Yogurt", category: "dairy", price: 8, originalPrice: 8, emoji: "🥛" },
  { id: 7, name: "Full Cream Milk", category: "dairy", price: 6, originalPrice: 6, emoji: "🥛" },
  { id: 8, name: "Cheddar Cheese", category: "dairy", price: 12, originalPrice: 12, emoji: "🧀" },
  { id: 9, name: "Onions", category: "produce", price: 4, originalPrice: 4, emoji: "🧅" },
  { id: 10, name: "Tomatoes", category: "produce", price: 5, originalPrice: 5, emoji: "🍅" },
  { id: 11, name: "Potatoes", category: "produce", price: 4, originalPrice: 4, emoji: "🥔" },
  { id: 12, name: "Biryani Masala", category: "spices", price: 6, originalPrice: 6, emoji: "🌶️" },
  { id: 13, name: "Pepsi Cola", category: "beverages", price: 6, originalPrice: 8, discount: 25, emoji: "🥤" },
  { id: 14, name: "Mineral Water", category: "beverages", price: 8, originalPrice: 8, emoji: "💧" },
  { id: 15, name: "Arabic Bread", category: "bakery", price: 3, originalPrice: 3, emoji: "🍞" },
  { id: 16, name: "Croissant", category: "bakery", price: 8, originalPrice: 8, emoji: "🥐" },
  { id: 17, name: "Ariel Detergent", category: "household", price: 28, originalPrice: 34, discount: 18, emoji: "🧼" },
  { id: 18, name: "Lay's Chips", category: "snacks", price: 7, originalPrice: 7, emoji: "🍟" },
];

// Mock AI responses
const AI_RESPONSES = {
  biryani: {
    message: "🍛 Great choice! For Biryani for 4 people, I recommend:\n\n• Basmati Rice (2 kg) - Base of the dish\n• Chicken Whole (2 kg) - Main protein\n• Onions (1 kg) - For caramelizing\n• Biryani Masala - Essential spice blend\n• Fresh Yogurt - For marinade\n\nI've added these to your cart! Total: AED 96",
    products: [1, 4, 9, 12, 6]
  },
  default: {
    message: "🤖 I'll help you find the perfect ingredients! Here are some popular items for you. What specific dish are you planning to make?",
    products: []
  }
};

export default function ShoppingApp() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [messages, setMessages] = useState([
    { type: "bot", text: "👋 Hi! Tell me what you'd like to cook and I'll build your shopping list!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const filteredProducts = selectedCategory === "all" 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = input;
    setMessages(prev => [...prev, { type: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      // Simple keyword matching for AI response
      let response;
      const lowerInput = userMessage.toLowerCase();
      
      if (lowerInput.includes("biryani")) {
        response = AI_RESPONSES.biryani;
      } else {
        response = AI_RESPONSES.default;
      }

      // Add bot message
      setMessages(prev => [...prev, { type: "bot", text: response.message }]);

      // Auto-add recommended products to cart
      if (response.products.length > 0) {
        response.products.forEach(productId => {
          const product = PRODUCTS.find(p => p.id === productId);
          if (product) {
            addToCart(product);
          }
        });
        setShowCart(true);
      }

      setLoading(false);
    }, 500);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="shopping-app">
      {/* Header */}
      <div className="shopping-header">
        <h2>🛍️ Your SmartGrocery Assistant</h2>
        <p>Tell me what you want to cook or your budget — I'll build your cart instantly</p>
      </div>

      <div className="shopping-container">
        {/* Chat Interface */}
        <div className="chat-section">
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}`}>
                <div className="message-content">
                  {msg.type === "bot" ? "🤖" : "👤"} 
                  <div className="message-text">{msg.text}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message bot">
                <div className="message-content">
                  🤖
                  <div className="message-text typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-form">
            <input
              type="text"
              placeholder="Tell me what you want to cook (e.g., 'Biryani for 4 people')"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="chat-input"
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="send-button"
            >
              {loading ? "⏳" : "📤"} Send
            </button>
          </form>
        </div>

        {/* Products & Cart */}
        <div className="main-content">
          {/* Categories */}
          <div className="categories-horizontal">
            <h3>Shop by Category</h3>
            <div className="category-list-horizontal">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`category-btn-h ${selectedCategory === cat.id ? "active" : ""}`}
                >
                  <span className="cat-emoji">{cat.emoji}</span>
                  <span className="cat-name">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Products Section */}
          <div className="products-section">
            <h3>{CATEGORIES.find(c => c.id === selectedCategory)?.name || "All Products"}</h3>
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <span className="product-emoji">{product.emoji}</span>
                    {product.discount && (
                      <div className="discount-badge">{product.discount}% OFF</div>
                    )}
                  </div>
                  <div className="product-info">
                    <p className="product-category">{product.category.toUpperCase()}</p>
                    <h4 className="product-name">{product.name}</h4>
                    <div className="product-price">
                      <span className="price">AED {product.price}</span>
                      {product.originalPrice !== product.price && (
                        <span className="original-price">AED {product.originalPrice}</span>
                      )}
                    </div>
                    <button 
                      onClick={() => addToCart(product)}
                      className="add-to-cart-btn"
                    >
                      + Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Toggle for Mobile */}
          <div className="cart-toggle-mobile">
            <button 
              onClick={() => setShowCart(!showCart)}
              className="cart-toggle"
            >
              🛒 View Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* Cart Sidebar */}
        {showCart && (
          <div className="cart-sidebar">
            <div className="cart-header">
              <h3>🛒 My Cart</h3>
              <button 
                onClick={() => setShowCart(false)}
                className="close-cart"
              >
                ✕
              </button>
            </div>
            
            <div className="cart-items">
              {cart.length === 0 ? (
                <p className="empty-cart">Your cart is empty</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <span className="item-emoji">{item.emoji}</span>
                      <div>
                        <p className="item-name">{item.name}</p>
                        <p className="item-price">AED {item.price} each</p>
                      </div>
                    </div>
                    <div className="quantity-control">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <p className="item-total">AED {item.price * item.quantity}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <strong>Total:</strong>
                  <strong>AED {cartTotal.toFixed(2)}</strong>
                </div>
                <button className="checkout-btn">
                  💳 Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
