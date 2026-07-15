from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
import os
import json

from services.intent import classify_intent

from services.memory import (
    get_history,
    add_message
)

from services.RAG import (
    create_product_embeddings,
    semantic_search
)


app = FastAPI()

load_dotenv()


client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


with open("products.json", "r") as file:
    products = json.load(file)


create_product_embeddings(products)


def detect_language(text):

    arabic_chars = 0

    for char in text:
        if "\u0600" <= char <= "\u06FF":
            arabic_chars += 1

    if arabic_chars > 3:
        return "Arabic"

    return "English"



class ChatRequest(BaseModel):
    message: str
    session_id: str



@app.get("/")
def home():

    return {
        "message": "DevX Nexus backend running"
    }



@app.post("/api/ai/chat")
def chat(request: ChatRequest):

    try:

        # Detect user language
        language = detect_language(
            request.message
        )


        # Load previous conversation
        history = get_history(
            request.session_id
        )


        # Intent classification
        intent = classify_intent(
            client,
            request.message
        )


        # Semantic search
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
- Product reasons must be based only on catalog information.
- Never invent products.
- Never describe products incorrectly.

Examples:
- Basmati Rice is rice, not wheat.
- Chicken Whole is chicken.
- Biryani Masala is a spice product.


LANGUAGE RULES:

If required language is English:
- All JSON text fields must be English.
- Do not use Arabic.
- Do not use Chinese.
- Do not mix languages.

If required language is Arabic:
- All JSON text fields must be Arabic.

Ignore language from:
- previous conversation history
- product catalog
- intent metadata


QUANTITY RULES:

- Prices are in AED.
- Quantity means number of purchasable units/packages, not weight.
- Never ask the user for kilograms. Ask for number of packs/units if needed.
- Always use whole numbers.
- Never return weight as quantity.
- Never include units inside qty.
- For recipe requests, estimate the minimum number of product packages required.
- Never increase quantity based on serving size unless the catalog package size requires it.

Bad:

"qty": "1 bag"


Good:

"qty": 1



Keep product IDs exactly as provided.

Return ONLY valid JSON.

No markdown.


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


                # Previous memory
                *history,


                {
                    "role": "user",
                    "content": request.message
                }

            ],

            max_tokens=300
        )



        ai_reply = response.choices[0].message.content



        # Save conversation

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




@app.get("/test-key")
def test_key():

    key = os.getenv("GROQ_API_KEY")


    return {

        "key_loaded": key is not None

    }