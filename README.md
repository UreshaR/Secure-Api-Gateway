# 🔐 Secure API Gateway

**Final Year Project** — Information Security + Software Engineering

---

## 📦 Project Structure
```
secure-api-gateway/
├── backend/          ← Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/   ← DB connection
│   │   ├── controllers/  ← auth, admin, crypto
│   │   ├── middleware/   ← auth, rbac, logger, attack detection
│   │   ├── models/       ← User, RequestLog, AttackAlert
│   │   ├── routes/       ← auth, admin, crypto, protected
│   │   └── utils/        ← jwt, encryption, seed
│   ├── .env.example
│   └── package.json
└── frontend/         ← React dashboard
    └── src/
        ├── pages/    ← Login, Dashboard, Logs, Alerts, Users, Crypto
        ├── components/ ← Layout/Sidebar
        ├── context/  ← AuthContext
        └── utils/    ← Axios API client
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js ≥ 18
- MongoDB running locally on port 27017

### 2. Backend Setup
```bash
cd backend
cp .env.example .env          # edit values if needed
npm install
npm run seed                   # creates 3 test users
npm run dev                    # starts on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start                      # starts on http://localhost:3000
```

---

## 🔑 Test Accounts

| Email                | Password      | Role      |
|----------------------|---------------|-----------|
| admin@gateway.com    | Admin@12345   | admin     |
| dev@gateway.com      | Dev@123456    | developer |
| user@gateway.com     | User@123456   | user      |

---

## 🛡️ Security Features

| Module              | Implementation                          |
|---------------------|-----------------------------------------|
| Authentication      | JWT (24h expiry), bcrypt (rounds: 12)   |
| Password hashing    | bcrypt + SHA-256 available              |
| RBAC                | admin / developer / user roles          |
| Encryption          | AES-256-CBC (crypto-js)                 |
| Request logging     | Every request → MongoDB (90-day TTL)    |
| Brute force         | 5 attempts → 15-min IP block            |
| DDoS detection      | 200 req/min threshold → block + alert   |
| Injection detection | XSS + SQL patterns blocked              |
| Rate limiting       | 100 req/15min global (express-rate-limit)|
| Security headers    | Helmet.js                               |

---

## 📡 API Endpoints

### Auth
```
POST /api/auth/register    → register new user
POST /api/auth/login       → login (brute-force protected)
GET  /api/auth/me          → get current user (auth required)
POST /api/auth/logout      → logout
```

### Admin (admin or developer)
```
GET   /api/admin/stats              → dashboard statistics
GET   /api/admin/logs               → request logs (filterable)
GET   /api/admin/alerts             → attack alerts
PATCH /api/admin/alerts/:id/resolve → resolve alert (admin only)
GET   /api/admin/users              → all users (admin only)
PATCH /api/admin/users/:id          → update user role/status (admin only)
```

### Crypto (auth required)
```
POST /api/crypto/encrypt   → AES-256 encrypt
POST /api/crypto/decrypt   → AES-256 decrypt
POST /api/crypto/hash      → SHA-256 hash
```

### Protected (RBAC demo)
```
GET /api/protected/user       → any authenticated user
GET /api/protected/developer  → developer + admin
GET /api/protected/admin      → admin only
```

---

## 🏗️ Architecture

```
Client → [Rate Limiter] → [DDoS Detector] → [Request Logger]
       → [Auth Middleware] → [RBAC Middleware]
       → Controller → MongoDB
                    → [Attack Alerts]
```

---

## 📚 Built With
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
- **Auth**: JWT, bcrypt
- **Crypto**: crypto-js (AES-256)
- **Frontend**: React, Recharts, React Router
