# 📚 StackIt Backend

**StackIt** is a minimal StackOverflow-style Q&A platform focused on simplicity, structured knowledge sharing, and collaborative learning.

This is the **backend** built with **FastAPI**, managed using **Poetry**.

---

## 🚀 Features

- User authentication via JWT
- Ask and answer questions using rich text
- Tagging system for categorizing questions
- Upvoting/downvoting answers
- Real-time notifications (via WebSockets)
- Admin moderation tools

---

## 🧰 Tech Stack

- **Language:** Python 3.10+
- **Framework:** FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy or SQLModel
- **Auth:** JWT (via `python-jose`)
- **Realtime:** WebSockets + Redis (optional)
- **Package Manager:** Poetry

---

## 🛠️ Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/stackit-backend.git
cd stackit-backend
```

### 2. Install Poetry

If not already installed:

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

Or follow: [https://python-poetry.org/docs/#installation](https://python-poetry.org/docs/#installation)

### 3. Install Dependencies

```bash
poetry install
```

### 4. Create and Configure `.env`

```bash
cp .env.example .env
```

Edit the `.env` file with your actual credentials:

```env
DATABASE_URL=postgresql://youruser:yourpassword@localhost:5432/stackit
SECRET_KEY=your_super_secret_jwt_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 🧪 Running the Application

### Dev Server (Hot Reload)

```bash
poetry run uvicorn app.main:app --reload
```

Visit: [http://localhost:8000/docs](http://localhost:8000/docs) – FastAPI’s Swagger UI

---

## 🗃️ Database Setup

Make sure PostgreSQL is installed and running.

### Create the DB

```bash
createdb stackit
```

### Run Migrations (with Alembic or manual)

If using Alembic:

```bash
alembic init alembic
# configure alembic.ini and env.py
poetry run alembic revision --autogenerate -m "Initial schema"
poetry run alembic upgrade head
```

---

## 🔐 Authentication

- Register: `POST /auth/register`
- Login: `POST /auth/login`
- Protected routes use `Authorization: Bearer <token>`

---

## 📬 Notifications (WebSocket)

Coming soon:

- Real-time answer and comment notifications using FastAPI WebSockets + Redis pub/sub.

---

## 🧪 Running Tests

```bash
poetry run pytest
```

---

## 🧼 Code Style

- Follows **PEP8**
- Use `black`, `isort`, and `ruff` (recommended)

---

## 📂 Project Structure

```
app/
├── api/         # API routers
├── core/        # Config, auth utils
├── db/          # DB connection/session
├── models/      # SQLAlchemy models
├── schemas/     # Pydantic schemas
├── services/    # Business logic
├── sockets/     # WebSocket logic
└── main.py      # FastAPI app entry
```

---

## 📄 License

MIT License © 2025
