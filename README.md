
# AroMi — AI Health & Wellness Coach

An agentic AI platform that delivers personalized 
fitness, workout, and nutrition guidance through 
an adaptive AI coach.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Python + FastAPI |
| AI Agent | Groq API (Llama 3.1 70B) |
| Database | PostgreSQL (SQLite for dev) |
| Auth | JWT tokens |

## Features

- 🤖 Conversational AI fitness coach
- 🏋️ Personalized workout plan generation
- 🥗 Smart nutrition and meal planning
- 📊 Progress tracking and streak monitoring
- 💾 Persistent chat history per user account
- ⚙️ Adaptive plans based on user feedback
- 🔐 Secure user authentication

## Project Structure

aromi/
├── backend/
│   ├── agent/
│   │   ├── orchestrator.py
│   │   ├── system_prompt.py
│   │   └── tools/
│   ├── models/
│   ├── routers/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── api/
│   └── package.json
├── CLAUDE.md
└── README.md

## Local Setup

### Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Fill in your .env values
uvicorn main:app --reload --port 8000

### Frontend
cd frontend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev

### Required API Keys
- **Groq API** (free): https://console.groq.com
- Get key → add to backend/.env as GROQ_API_KEY

## Environment Variables

See backend/.env.example and 
frontend/.env.example for all required variables.
