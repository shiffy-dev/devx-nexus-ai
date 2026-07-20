from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq


import os
import json

from navigation.routing import create_route
from navigation.sessions import navigation_sessions
from navigation.product_locations import product_locations

from services.intent import classify_intent


from services.memory import (
    get_history,
    add_message
)

from services.RAG import (
    create_product_embeddings,
    semantic_search
)


# ==========================
# APP SETUP
# ==========================

app = FastAPI()

class AdminLoginRequest(BaseModel):
    username: str
    password: str



@app.post("/api/admin/login")
def admin_login(request: AdminLoginRequest):

    if (
        request.username == "admin"
        and request.password == "madina123"
    ):

        return {
            "success": True,
            "message": "Login successful"
        }


    return {
        "success": False,
        "message": "Invalid credentials"
    }




# ADMIN WEBSOCKET
admin_connections = []


@app.websocket("/ws/admin")
async def admin_websocket(websocket: WebSocket):

    await websocket.accept()

    admin_connections.append(websocket)

    print("✅ Admin connected")


    try:

        while True:

            await websocket.receive_text()


    except WebSocketDisconnect:

        admin_connections.remove(websocket)

        print("❌ Admin disconnected")



async def notify_admins(order):

    for connection in admin_connections:

        await connection.send_json({

            "type": "NEW_ORDER",

            "order": order

        })
      


# ==========================
# CORS
# ==========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================
# ENV + GROQ
# ==========================

load_dotenv()


client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


# ==========================
# PRODUCTS
# ==========================

with open("products.json", "r") as file:
    products = json.load(file)


create_product_embeddings(products)



# ==========================
# HELPERS
# ==========================

def detect_language(text):

    arabic_chars = 0

    for char in text:
        if "\u0600" <= char <= "\u06FF":
            arabic_chars += 1

    if arabic_chars > 3:
        return "Arabic"

    return "English"



# ==========================
# MODELS
# ==========================

class ChatRequest(BaseModel):
    message: str
    session_id: str
    branch_id: str = "madina-dubai"



class RouteRequest(BaseModel):
    session_id: str
    from_node_id: str
    product_ids: list[str]



class ScanRequest(BaseModel):
    node_id: str



# ==========================
# HOME
# ==========================

@app.get("/")
def home():

    return {
        "message": "DevX Nexus backend running"
    }



# ==========================
# AI CHAT
# ==========================

@app.post("/api/ai/chat")
def chat(request: ChatRequest):

    try:

        language = detect_language(
            request.message
        )


        history = get_history(
            request.session_id
        )
        print("BRANCH:", request.branch_id)


        intent = classify_intent(
            client,
            request.message
        )


        matched_products = semantic_search(
            request.message,
            products
        )


        print("===== DEBUG =====")
        print("LANGUAGE:", language)
        print("MESSAGE:", request.message)
        print("SESSION:", request.session_id)
        print("HISTORY:", history)
        print("INTENT:", intent)
        print("PRODUCTS:", matched_products)
        print("=================")



        response = client.chat.completions.create(

            model="llama-3.1-8b-instant",

            temperature=0.1,

            messages=[

                {
                    "role": "system",

                    "content": f"""

You are DevX Nexus AI Concierge for Madina Supermarket.

Required response language:

{language}


User intent:

{intent}


Only recommend products from this catalog:

{matched_products}


STRICT RULES:

- Only recommend products from the provided catalog.
- Never invent products.
- Keep product IDs exactly as provided.

QUANTITY RULES:

- Prices are in AED.
- Quantity means number of units/packages.
- Always use whole numbers.
- Never include units inside qty.


Return ONLY valid JSON.

Format:

{{
  "message": "short helpful response",

  "products": [
    {{
      "id": "product id",
      "qty": number,
      "reason": "why this product is recommended"
    }}
  ],

  "followUp": "question for customer"
}}

"""

                },


                *history,


                {
                    "role": "user",
                    "content": request.message
                }

            ],

            max_tokens=300
        )



        ai_reply = response.choices[0].message.content



        add_message(
            request.session_id,
            "user",
            request.message
        )


        add_message(
            request.session_id,
            "assistant",
            ai_reply
        )



        try:

            structured_response = json.loads(
                ai_reply
            )


            return {

                "intent": intent,

                "response": structured_response

            }



        except json.JSONDecodeError:


            return {

                "message": ai_reply,

                "products": matched_products,

                "followUp": "Can I help you with anything else?"

            }



    except Exception as e:


        return {

            "reply": "Sorry, the AI service is temporarily unavailable.",

            "error": str(e)

        }





# ==========================
# TEST KEY
# ==========================

@app.get("/test-key")
def test_key():

    key = os.getenv("GROQ_API_KEY")


    return {

        "key_loaded": key is not None

    }


# ==========================
# PRODUCT DETAILS
# ==========================

@app.get("/api/products/{product_id}")
def get_product(product_id: str):

    for product in products:

        if product["id"] == product_id:

            return product


    return {
        "error": "Product not found"
    }
# ==========================
# NAVIGATION ROUTE
# ==========================

@app.post("/api/navigation/route")
def navigation_route(request: RouteRequest):

    route = create_route(
        request.from_node_id,
        request.product_ids
    )


    product_details = []


    for product_id in request.product_ids:

        for product in products:

            if product["id"] == product_id:

                product_details.append({

    "id": product["id"],

    "name": product["name"],

    "node": product.get(
        "node",
        "Unknown"
    ),

    "location": product.get(
        "location",
        "Unknown"
    )

})


    navigation_steps = []


    for node in route:

        matched_product = None


        for product in product_details:

            if product["node"] == node:

                matched_product = product



        navigation_steps.append({

    "node_id": node,

    "location":
        matched_product["location"]
        if matched_product
        else f"Store Node {node}",


    "instruction":
        f"Pick up {matched_product['name']}"
        if matched_product
        else f"Continue towards {node}",


    "distance": 10,


    "product":
        matched_product["name"]
        if matched_product
        else "Checkpoint"

})



    navigation_sessions[request.session_id] = {

        "route": navigation_steps,

        "products": request.product_ids,

        "current_node": request.from_node_id

    }



    return {

        "session_id": request.session_id,

        "route": navigation_steps,

        "products": product_details,

        "estimated_time_minutes": len(route)

    }

# ==========================
# QR SCAN
# ==========================

@app.patch("/api/navigation/session/{session_id}/scan")
def scan_qr(
    session_id: str,
    request: ScanRequest
):

    session = navigation_sessions.get(session_id)

    if not session:
        return {
            "error":"Session not found"
        }


    session["current_node"] = request.node_id


    return {

        "session_id": session_id,

        "current_node": request.node_id,

        "instruction":
        "Arrived at {request.node_id}",

        "message":
        "Location updated successfully"

    }

# ==========================
# NAVIGATION STEP
# ==========================

@app.get("/api/navigation/session/{session_id}/step")
def navigation_step(session_id: str):

    session = navigation_sessions.get(
        session_id
    )


    if not session:

        return {

            "error": "Session not found"

        }



    return {

        "session_id": session_id,

        "current_node": session["current_node"],

        "instruction": f"Continue from {session['current_node']}"

    }

# ==========================
# DELETE AI SESSION
# ==========================

@app.delete("/api/ai/session/{session_id}")
def delete_ai_session(session_id: str):

    try:

        navigation_sessions.pop(
            session_id,
            None
        )


        return {
            "message":"Session cleared",
            "session_id":session_id
        }


    except Exception as e:

        return {
            "error":str(e)
        }
    
# ==========================
# GET AI SESSION HISTORY
# ==========================

@app.get("/api/ai/session/{session_id}")
def get_ai_session(session_id: str):

    history = get_history(session_id)


    return {

        "session_id": session_id,

        "messages": history

    }

class OrderRequest(BaseModel):
    order_id: str
    customer: str
    items: list[str]
    status: str



@app.post("/api/orders")
async def create_order(order: OrderRequest):

    await notify_admins(
        order.dict()
    )


    return {

        "message": "Order sent to admin",

        "order": order

    }