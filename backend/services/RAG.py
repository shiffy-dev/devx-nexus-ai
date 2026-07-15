import chromadb
from sentence_transformers import SentenceTransformer


# Load embedding model
model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


# Create local vector database
chroma_client = chromadb.Client()

collection = chroma_client.get_or_create_collection(
    name="madina_products"
)


def create_product_embeddings(products):

    # Prevent adding duplicates
    if collection.count() > 0:
        return

    documents = []
    ids = []

    for product in products:

        text = (
            f"{product['name']} "
            f"{product['category']} "
            f"{product.get('unit','')}"
        )

        documents.append(text)
        ids.append(product["id"])


    embeddings = model.encode(
        documents
    ).tolist()


    collection.add(
        documents=documents,
        embeddings=embeddings,
        ids=ids
    )

def semantic_search(query, products, limit=3):

    query_embedding = model.encode(
        query
    ).tolist()


    results = collection.query(
        query_embeddings=[
            query_embedding
        ],
        n_results=limit
    )


    matched_ids = results["ids"][0]


    matched_products = []

    for product in products:
        if product["id"] in matched_ids:
            matched_products.append(product)


    return matched_products