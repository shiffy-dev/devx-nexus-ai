import React, { useState, useRef, useEffect, useContext } from "react";
import { CartContext } from "../context/CartContext";
import "../styles/ChatBot.css";

export default function ChatBot({ onViewCart }) {

  const { addToCart } = useContext(CartContext);

  const [messages, setMessages] = useState([
    {
      type: "bot",
      text:
        "👋 Welcome to DevX AI Concierge!\n\nI'm your smart shopping assistant. Tell me what you'd like to cook and I'll build the perfect shopping list for you! 🛒",
      products: []
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [sessionId] = useState(() => {

  const existingSession =
    localStorage.getItem("devx_session_id");


  if (existingSession) {
    return existingSession;
  }


  const newSession =
    `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;


  localStorage.setItem(
    "devx_session_id",
    newSession
  );


  return newSession;

});

  const messagesEndRef = useRef(null);


  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [messages]);



  // ==============================
  // ADD PRODUCT TO CART
  // ==============================

  const addProductToCart = async (product) => {

    try {

      console.log(
        "ADDING PRODUCT:",
        product
      );


      // Get full product details
      const response = await fetch(
        `http://localhost:8000/api/products/${product.id}`
      );


      if (!response.ok) {

        throw new Error(
          "Product details API failed"
        );

      }


      const productDetails =
        await response.json();


      console.log(
        "PRODUCT DETAILS:",
        productDetails
      );



      addToCart(
        {
          id: productDetails.id,

          name: productDetails.name,

          price: productDetails.price,

          unit: productDetails.unit,


          // THIS COMES FROM products.json
          location:
            productDetails.location,

          node:
            productDetails.node

        },

        product.qty || 1

      );


      console.log(
        "ADDED TO CART:",
        productDetails
      );


    } catch(error) {


      console.error(
        "ADD CART ERROR:",
        error
      );


      // fallback if API fails

      addToCart(

        {
          id: product.id,

          name: product.name,

          price: product.price,

          unit: product.unit,

          location:
            product.location ||
            "Unknown",

          node:
            product.node ||
            null
        },

        product.qty || 1

      );


    }

  };





  // ==============================
  // CHAT API
  // ==============================

  const handleSendMessage = async (e) => {

    e.preventDefault();


    if(!input.trim() || loading)
      return;



    const userMessage = input;



    setMessages(prev => [

      ...prev,

      {
        type:"user",
        text:userMessage,
        products:[]
      }

    ]);



    setInput("");

    setLoading(true);



    try {


      const response = await fetch(

        "http://localhost:8000/api/ai/chat",

        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body: JSON.stringify({

 message:userMessage,

 session_id:sessionId,

 branch_id:"madina-dubai"

})
        }

      );



      if(!response.ok){

        throw new Error(
          `API error ${response.status}`
        );

      }



      const data =
        await response.json();



      console.log(
        "BACKEND RESPONSE:",
        data
      );



      const botMessage =

        data.response?.message ||

        data.message ||

        "Sorry, I couldn't process that.";



      const products =

        data.response?.products ||

        data.products ||

        [];



      setMessages(prev => [

        ...prev,

        {

          type:"bot",

          text:botMessage,

          products:products

        }

      ]);



    } catch(error) {


      console.error(
        "CHAT ERROR:",
        error
      );



      setMessages(prev => [

        ...prev,

        {

          type:"bot",

          text:"❌ Backend connection failed.",

          products:[]

        }

      ]);



    } finally {

      setLoading(false);

    }


  };





  return (

    <div className="chatbot-container">


      <div className="chatbot-header">


        <h1>
          🤖 AI Shopping Assistant
        </h1>


        <p>
          Smart shopping made easy
        </p>


        {
          onViewCart &&

          <button

            className="view-cart-btn"

            onClick={onViewCart}

          >

            🛒 View Cart

          </button>

        }


      </div>





      <div className="chat-wrapper">


        <div className="chat-messages">


          {
            messages.map((msg,index)=>(


              <div key={index}>


                <div
                  className={`message message-${msg.type}`}
                >


                  <div className="message-avatar">

                    {
                      msg.type==="user"
                      ? "👤"
                      : "🤖"
                    }

                  </div>



                  <div className="message-bubble">

                    {msg.text}

                  </div>


                </div>





                {
                  msg.products &&
                  msg.products.length > 0 &&


                  <div className="products-container">


                    {
                      msg.products.map(product=>(


                        <div
                          className="product-card"
                          key={product.id}
                        >


                          <div className="product-info">


                            <h4>
                              {product.name}
                            </h4>


                            <p className="product-unit">
                              {product.qty || 1} unit(s)
                            </p>


                            <p className="product-reason">
                              💡 {product.reason}
                            </p>


                          </div>





                          <div className="product-footer">


                            <span className="product-price">

                              AED {product.price}

                            </span>



                            <button

                              className="add-to-cart-btn"

                              onClick={() =>
                                addProductToCart(product)
                              }

                            >

                              + Add (×{product.qty || 1})

                            </button>



                          </div>


                        </div>


                      ))
                    }


                  </div>

                }


              </div>


            ))
          }





          {
            loading &&

            <div className="message message-bot">


              <div className="message-avatar">
                🤖
              </div>


              <div className="message-bubble typing">

                <span></span>
                <span></span>
                <span></span>

              </div>


            </div>

          }



          <div ref={messagesEndRef}/>


        </div>





        <form

          className="chat-form"

          onSubmit={handleSendMessage}

        >

          <input

            className="chat-input"

            value={input}

            onChange={
              e => setInput(e.target.value)
            }

            placeholder="What do you want to cook?"

          />


          <button

            className="send-btn"

            disabled={loading}

          >

            {
              loading
              ? "⏳"
              : "📤"
            }

          </button>


        </form>


      </div>


    </div>

  );

}