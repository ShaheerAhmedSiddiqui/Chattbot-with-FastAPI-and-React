# ⚡ FAST AI (The ChattApp with FastAPI and React)

**Fast**API + Google **Gemini** — a full-stack, multi-session AI chat platform that doesn't make you wait around.

> Spin up a conversation, switch threads without losing context, and let Gemini 2.5 Flash do the thinking — all wrapped in a clean, light-themed interface built for actual daily use, not just a demo.

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white" alt="SQLAlchemy" />
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</p>

---

## 🤔 What is this, actually?

Most "AI chatbot tutorials" stop at a single `/chat` endpoint that forgets everything the moment you refresh the page. **FAST AI** doesn't. It's a real multi-user, multi-session system:

- Every user has their own account, protected behind JWT auth
- Every user can run **multiple parallel conversations** — not just one long thread
- Every conversation **remembers its own history** and feeds it back to Gemini, so the AI actually has context, not amnesia
- The whole thing is split cleanly into a FastAPI backend and a React frontend, talking over a REST API — no framework magic gluing them together

Think of it as the skeleton you'd actually want under a real product, not a weekend toy.

---

## ✨ Features

- 🔐 **Full authentication flow** — register, login, JWT-protected routes, password hashing
- 🧵 **Multi-session conversations** — create, switch between, and delete independent chat threads
- 🧠 **Context-aware AI replies** — full message history is sent to Gemini on every turn, so the model remembers what you talked about earlier in that thread
- ⚡ **Gemini 2.5 Flash** under the hood — fast, low-latency responses
- 🗄️ **Persistent storage** — every message and session is saved to a real relational database, not memory
- 🎨 **Clean, light UI** — built with React + Tailwind, optimistic UI updates so your message appears instantly while the AI is still "thinking"
- 🌐 **CORS-configured REST API** — frontend and backend run as fully independent services
- 🧩 **Modular backend architecture** — routers, schemas, CRUD layer, and services are all cleanly separated (see structure below)

---

## 🏗️ Architecture

```
                     ┌──────────────────────┐
                     │   React Frontend     │
                     │   (Vite + Tailwind)  │
                     │  Login / Register /  │
                     │      Dashboard       │
                     └──────────┬───────────┘
                                │  Axios (REST, JWT)
                                ▼
                     ┌──────────────────────┐
                     │   FastAPI Backend    │
                     │  ┌────────────────┐  │
                     │  │  API Routers   │  │  /api/v1/auth
                     │  │                │  │  /api/v1/sessions
                     │  │                │  │  /api/v1/messages
                     │  └───────┬────────┘  │
                     │          ▼           │
                     │  ┌────────────────┐  │
                     │  │  CRUD Layer    │  │
                     │  └───────┬────────┘  │
                     │          ▼           │
                     │  ┌────────────────┐  │
                     │  │  SQLAlchemy ORM│  │
                     │  └───────┬────────┘  │
                     └──────────┼───────────┘
                                ▼
                     ┌──────────────────────┐
                     │   Relational DB      │
                     │  Users / Sessions /  │
                     │      Messages        │
                     └──────────────────────┘

                     Meanwhile, on every message:
                     ┌──────────────────────┐
                     │   AI Service Layer   │──────▶  Google Gemini 2.5 Flash API
                     │  (history → prompt)  │◀──────  (contextual response)
                     └──────────────────────┘
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Backend framework** | FastAPI |
| **AI Engine** | Google Gemini 2.5 Flash (`google-genai` SDK) |
| **Database ORM** | SQLAlchemy |
| **Auth** | JWT (OAuth2 password flow) + hashed passwords |
| **Validation** | Pydantic schemas |
| **Frontend** | React (Vite) |
| **Styling** | Tailwind CSS |
| **HTTP client** | Axios |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
fast-ai/
├── backend/
│   └── app/
│       ├── api/
│       │   ├── deps.py              # Shared dependencies (get_current_user, etc.)
│       │   ├── router.py 
|       |   └── v1/
│       │       ├── auth.py          # Register / login endpoints
│       │       ├── sessions.py      # Create / list / delete chat sessions
│       │       └── messages.py      # Send / fetch messages
│       ├── core/
│       │   └── security.py          # Password hashing, JWT handling
│       ├── crud/
│       │   ├── crud_user.py
│       │   ├── crud_sessions.py
│       │   └── crud_messages.py
│       ├── database/
│       │   ├── connection.py        # DB engine/session setup
│       │   └── database_model.py    # SQLAlchemy models
│       ├── schemas/
│       │   ├── user.py
│       │   ├── sessions.py
│       │   └── messages.py
│       ├── services/
│       │   └── ai_services.py       # Gemini API integration
│       └── main.py                  # FastAPI app entrypoint
│
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.jsx      # Auth state provider
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── Dashboard.jsx        # Main chat interface
        ├── services/
        │   └── client.js            # Axios instance config
        └── App.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Gemini API key](https://aistudio.google.com/apikey)
- A database (SQLite, PostgreSQL/MySQL )

### 1. Clone the repo

```bash
git clone https://github.com/your-username/Chattbot-with-FastAPI-and-React.git
cd fast-ai
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=sqlite:///./app.db
SECRET_KEY=your_jwt_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Run the server:

```bash
uvicorn app.main:app --reload
```

Backend live at → `http://localhost:8000`
Interactive API docs → `http://localhost:8000/docs`

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend live at → `http://localhost:5173`

> Make sure your backend's CORS `origins` list in `main.py` includes your frontend's dev URL.

---

## 📡 API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/v1/auth/register` | Create a new user account | ❌ |
| `POST` | `/api/v1/auth/login` | Log in, receive a JWT | ❌ |
| `GET` | `/api/v1/sessions/` | List all chat sessions for the current user | ✅ |
| `POST` | `/api/v1/sessions/` | Create a new chat session | ✅ |
| `DELETE` | `/api/v1/sessions/{session_id}` | Delete a chat session | ✅ |
| `GET` | `/api/v1/messages/{session_id}` | Fetch full message history for a session | ✅ |
| `POST` | `/api/v1/messages/` | Send a message, get an AI-generated reply back | ✅ |

Full interactive docs are auto-generated by FastAPI — just run the backend and visit `/docs`.

---

## 🧪 How a message actually flows

1. User types a message in a session → frontend optimistically renders it instantly
2. Request hits `POST /api/v1/messages/` with `{ session_id, content }`
3. Backend verifies the session belongs to the authenticated user
4. Full prior message history for that session is pulled from the DB
5. History + new message is converted into Gemini's `Content` format and sent to the model
6. Gemini's reply is saved back to the DB and returned to the frontend
7. UI updates with the AI's response

This is what lets each conversation feel continuous — the model isn't just answering in a vacuum, it's seeing the whole thread every time.

---

## 🗺️ Roadmap

- [ ] Streaming responses (token-by-token, instead of waiting for the full reply)
- [ ] Markdown/code block rendering in chat bubbles
- [ ] Session renaming
- [ ] Light mode toggle

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

```bash
git checkout -b feature/your-feature-name
git commit -m "Add: your feature"
git push origin feature/your-feature-name
```

---

## 👤 Author

**Shaheer Ahmed Siddiqui**
BS Software Engineering
—Sukkur IBA University

📧 Email: mrshaheer75@gmail.com

🔗 LinkedIn: https://www.linkedin.com/in/shaheer-ahmed-siddiqui-b381a1248/

💻 GitHub: https://github.com/ShaheerAhmedSiddiqui/

---

<p align="center">
  Built with FastAPI, React, and a healthy amount of debugging CORS errors that turned out to be something else entirely.
</p>
