## Project Setup

### Prerequisites

Before running the project, ensure the following are installed:

- Node.js (v18 or higher)
- Python 3.11 or higher
- Git

## Getting the Code

Clone the repository to your local machine:

```bash
git clone https://github.com/your-username/devx-nexus-ai-concierge.git
```

Navigate into the project folder:

```bash
cd devx-nexus-ai-concierge
```

---

## Backend Installation

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:

   ```bash
   python -m venv venv
   ```

   **Windows:**
   ```bash
   venv\Scripts\activate
   ```

   **macOS / Linux:**
   ```bash
   source venv/bin/activate
   ```

3. Install required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file inside the backend folder and add your API key:

   ```
   GROQ_API_KEY=your_api_key_here
   ```

5. Start the FastAPI server:

   ```bash
   uvicorn main:app --reload
   ```

   The backend will run at: [http://localhost:8000](http://localhost:8000)

---

## Frontend Installation

1. Open a new terminal and navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the React application:

   ```bash
   npm start
   ```

   The frontend will run at: [http://localhost:3000](http://localhost:3000)

FOR API DOCUMENTATION GO TO http://127.0.0.1:8000/docs 




## Overview

DevX Nexus AI Concierge is an AI-powered grocery assistant developed for Madina Supermarket. The platform helps customers discover products, generate grocery recommendations, navigate through the store using optimized routes, and complete their orders through an integrated checkout workflow.

The system combines a React frontend with a FastAPI backend, using AI-powered product understanding, store navigation algorithms, and order management features to provide a seamless in-store shopping experience.

---

## Technology Stack

### Frontend

- **React.js**
  - Built the customer-facing interface using reusable components.
  - Used for chatbot, cart, checkout, navigation, and admin dashboard.
  - Enables fast UI updates and smooth user interactions.
- **Context API**
  - Manages global application state.
  - Handles cart data, selected products, and order information across pages.
- **Custom CSS**
  - Creates the responsive white + blue dashboard UI.
  - Provides consistent styling for cards, layouts, buttons, and components.

### Backend

- **FastAPI (Python)**
  - Used to build high-performance REST APIs.
  - Handles chatbot requests, product search, orders, and navigation services.
  - Provides automatic request validation using Pydantic.
- **Python**
  - Chosen because of its strong AI and backend ecosystem.
  - Simplifies integration with AI models and data processing logic.

### Artificial Intelligence

- **Groq API + Llama Model**
  - Provides fast AI inference for real-time chatbot responses.
  - Understands natural language grocery requests.
  - Generates product recommendations based on the supermarket catalog.

### Data Management

- **JSON Product Catalog**
  - Stores product details including names, categories, prices, and locations.
  - Lightweight solution suitable for prototype development.
  - Can be migrated to PostgreSQL for production scaling.

### Navigation System

- **Graph-Based Routing Algorithm**
  - Represents the supermarket layout as a graph.
  - Nodes represent aisles/product locations.
  - Edges represent paths between locations.
  - Calculates optimized routes for customers collecting multiple items.

### Development Tools

- **Git** — Used for version control and managing frontend/backend branches.
- **VS Code** — Primary development environment.
- **npm** — Used for frontend dependency management and running the React application.
- **Uvicorn** — Used to run the FastAPI backend server.

### Architecture Summary

- React Frontend → User interface and interactions
- FastAPI Backend → API layer and business logic
- Groq Llama AI → Natural language understanding
- Graph Routing Engine → Store navigation optimization
- Product Catalog → Grocery data source
- Context API → Frontend state management

NOTE - for future development the following can be noted:
- APIs for live order track, admin dashboard CRUD APIs
- The project is not 100% perfect, I developed according to time constraint
- The Frontend and Backend needs more working and additional unique features to make the project perfect and deployable
