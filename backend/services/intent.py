import json


def classify_intent(client, message):

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": """
You are an intent classifier for DevX Nexus AI Concierge.

Classify the user's message into ONE of these categories.

Definitions:

recipe_request:
User wants ingredients or items needed to prepare a dish.
Example:
"I need biryani ingredients for 5 people"

product_search:
User is looking for a specific product.
Example:
"Do you have Pepsi?"

budget_constrained:
User has a spending limit.
Example:
"Give me food under 50 AED"

dietary_filter:
User has dietary requirements.
Example:
"I need keto products"
"I need gluten free food"

question:
User asks general information.
Example:
"Where is the milk aisle?"

reorder:
User wants to buy previous items again.

add_to_existing:
User wants to add items to an existing order.

other:
Anything else.

confidence must be a number between 0 and 100.

Return ONLY JSON.

Format:

{
  "intent": "",
  "confidence": 0,
  "entities": {
    "budget": null,
    "servings": null,
    "dietary": null,
    "product": null
  }
}
"""
            },
            {
                "role": "user",
                "content": message
            }
        ],
        max_tokens=200
    )

    try:
        return json.loads(
            response.choices[0].message.content
        )

    except json.JSONDecodeError:
        return {
            "intent": "other",
            "confidence": 0,
            "entities": {}
        }