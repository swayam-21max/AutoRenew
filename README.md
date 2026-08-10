# PolicyPulse

**AI-Powered Insurance Renewal Reminder Platform**

PolicyPulse helps users avoid missing insurance renewal deadlines by automating policy document processing, data extraction, expiry monitoring, and renewal reminders.

---

## ✨ Features

- 🤖 **AI-Powered Extraction** — Upload insurance policy PDFs, and Google Gemini AI automatically extracts key details (policy number, holder name, insurer, dates)
- 📊 **Dashboard Analytics** — Overview with stats cards (total, active, expiring soon, expired), recent policies, and upcoming expirations
- 📋 **Policy Management** — Full CRUD with search, filter by status, sort, and pagination
- 🔔 **Smart Reminders** — Automated email reminders at 30, 15, 7, and 1 day before expiry
- 🔒 **Secure Authentication** — JWT-based auth with bcrypt password hashing
- 📱 **Responsive Design** — Mobile, tablet, and desktop friendly
- 🎨 **Modern UI** — Clean, calm SaaS design inspired by Notion, Stripe, and Linear

---

## 🏗️ Architecture

```
PolicyPulse/
├── backend/                    # Express.js API Server
│   ├── src/
│   │   ├── config/             # Database configuration
│   │   ├── controllers/        # Request handlers
│   │   ├── middlewares/        # Auth, upload, error handling
│   │   ├── models/             # Database queries
│   │   ├── routes/             # API route definitions
│   │   ├── schedulers/         # Cron job for reminders
│   │   ├── services/           # Gemini AI, Email services
│   │   ├── utils/              # Validators
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Entry point
│   ├── uploads/                # Temporary PDF storage
│   └── schema.sql              # PostgreSQL schema
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # Auth context provider
│   │   ├── layouts/            # Auth & Dashboard layouts
│   │   ├── pages/              # Page components
│   │   ├── routes/             # React Router config
│   │   └── services/           # Axios API layer
│   └── index.html
│
└── README.md
```

---

## 🛠️ Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Frontend       | React, Vite, React Router DOM     |
| Backend        | Node.js, Express.js               |
| Database       | PostgreSQL (Neon-compatible)       |
| AI             | Google Gemini API                  |
| Auth           | JWT + bcrypt                       |
| Email          | Nodemailer (Gmail SMTP)            |
| Scheduler      | node-cron                          |
| File Upload    | Multer                             |
| Security       | Helmet, CORS, Rate Limiting        |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)
- Google Gemini API key ([Get one](https://aistudio.google.com/app/apikey))
- Gmail account with App Password (for email reminders)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/policypulse.git
cd policypulse
```

### 2. Set up the database

Run the schema against your PostgreSQL database:

```bash
psql -d your_database_url -f backend/schema.sql
```

Or for Neon, paste the contents of `backend/schema.sql` into the Neon SQL Editor.

### 3. Configure environment variables

**Backend** — copy and fill in:
```bash
cp backend/.env.example backend/.env
```

Required variables:
| Variable       | Description                           |
|----------------|---------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string          |
| `JWT_SECRET`   | Secret key for JWT signing            |
| `GEMINI_API_KEY`| Google Gemini API key                |
| `EMAIL_USER`   | Gmail address                         |
| `EMAIL_PASS`   | Gmail App Password                    |
| `FRONTEND_URL` | Frontend URL for CORS                 |

**Frontend** — copy and fill in:
```bash
cp frontend/.env.example frontend/.env
```

### 4. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Run locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

---

## 📡 API Documentation

### Auth
| Method | Endpoint            | Description         | Auth |
|--------|---------------------|---------------------|------|
| POST   | `/api/auth/register`| Register new user   | No   |
| POST   | `/api/auth/login`   | Login               | No   |
| GET    | `/api/auth/me`      | Get current user    | Yes  |

### Dashboard
| Method | Endpoint              | Description         | Auth |
|--------|-----------------------|---------------------|------|
| GET    | `/api/dashboard/stats`| Dashboard data      | Yes  |

### Policies
| Method | Endpoint               | Description           | Auth |
|--------|------------------------|-----------------------|------|
| GET    | `/api/policies`        | List policies         | Yes  |
| GET    | `/api/policies/:id`    | Get single policy     | Yes  |
| POST   | `/api/policies/upload` | Upload & extract PDF  | Yes  |
| POST   | `/api/policies`        | Save new policy       | Yes  |
| PUT    | `/api/policies/:id`    | Update policy         | Yes  |
| DELETE | `/api/policies/:id`    | Delete policy         | Yes  |

### Health
| Method | Endpoint       | Description    | Auth |
|--------|----------------|----------------|------|
| GET    | `/api/health`  | Server status  | No   |

---

## 🚢 Deployment

### Frontend → Vercel

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. Set `VITE_API_URL` environment variable to your backend URL
4. Deploy

### Backend → Render / Railway

1. Connect your GitHub repo
2. Set root directory to `backend`
3. Set start command to `npm start`
4. Add all environment variables from `.env.example`
5. Deploy

### Database → Neon

1. Create a free database at [neon.tech](https://neon.tech)
2. Run `schema.sql` in the SQL Editor
3. Copy the connection string to `DATABASE_URL`

---

## 📧 Email Reminder Schedule

| Trigger            | Reminder Type |
|--------------------|---------------|
| 30 days before     | `30d`         |
| 15 days before     | `15d`         |
| 7 days before      | `7d`          |
| 1 day before       | `1d`          |

Runs daily at **9:00 AM** via node-cron. Duplicate reminders are prevented via database constraints.

---

## 🔒 Security

- JWT authentication with configurable expiry
- bcrypt password hashing (12 rounds)
- Helmet security headers
- CORS restricted to frontend origin
- Rate limiting (100 req/15min general, 20 req/15min auth)
- PDF-only file validation with 10MB limit
- Parameterized SQL queries (no SQL injection)
- Secure error handling (no stack traces in production)

---

## 📄 License

MIT
