# 🌱 PLANTERY — MERN Stack (Advanced Edition)

> Full-featured MERN platform for plant care, plant-based commerce, and admin management.
> Same dark eco-tech UI throughout user **and** admin panels. JavaScript only. No Lovable hosting required.

---

## What's inside

```
plantery-mern/
├── server/   # Node + Express + MongoDB + JWT
└── client/   # React + Vite + Tailwind (dark eco-tech UI)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally **OR** a free MongoDB Atlas connection string

### 1. Backend

```bash
cd server
npm install
cp .env.example .env       # edit MONGO_URI and JWT_SECRET if you want
npm run seed               # creates admin user + 6 sample products
npm run dev                # http://localhost:5000
```

`.env`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/plantery
JWT_SECRET=replace-with-a-long-random-string
CLIENT_URL=http://localhost:5173
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm run dev                # http://localhost:5173
```

Open http://localhost:5173 — same PLANTERY UI, now with admin panel and full e-commerce.

---

## 🔑 Default Admin Login (after `npm run seed`)

```
Email:    admin@plantery.local
Password: admin123
```

> The very **first user** you ever register also automatically becomes an admin (handy if you skip the seed).
> You can promote/demote any user later from the Admin → Users panel.

---

## ✨ Features

### 👤 User side
- JWT signup / login
- Browse plants, seeds, fertilizers, accessories
- Search & category filters
- Cart with quantity + checkout
- Order history
- Personal plant care dashboard with watering + fertilizing reminders

### 🛡️ Admin Panel (`/admin`, admins only)
- **Dashboard stats** — products, orders, users, revenue
- **Product manager** — create / edit / delete products in all 4 categories
  - Upload product images directly (file → base64) or paste an image URL
- **Order manager** — view every order, update status (pending → paid → shipped → delivered)
- **User manager** — promote users to admin or demote back to user
- All wrapped in the same matching dark eco-tech UI as the user side

---

## 🔐 API Reference

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/register` | – |
| POST | `/api/auth/login` | – |
| GET  | `/api/auth/me` | ✅ |
| GET/POST/PATCH/DELETE | `/api/plants(/:id)` | ✅ user |
| POST | `/api/plants/:id/water` | ✅ user |
| POST | `/api/plants/:id/fertilize` | ✅ user |
| GET  | `/api/products(/:id)` | – |
| GET/POST | `/api/orders` | ✅ user |
| **GET/POST/PATCH/DELETE** | **`/api/admin/products(/:id)`** | 🛡️ admin |
| **GET/PATCH** | **`/api/admin/orders(/:id)`** | 🛡️ admin |
| **GET** | **`/api/admin/users`** | 🛡️ admin |
| **PATCH** | **`/api/admin/users/:id/role`** | 🛡️ admin |
| **GET** | **`/api/admin/stats`** | 🛡️ admin |

---

## ✅ No common pitfalls
- **CORS** is configured permissively for dev (`Authorization`, all methods, OPTIONS preflight) — no CORS errors even if you change ports.
- **JSON limit** is bumped to 10 MB so base64 image uploads work.
- All admin routes are guarded server-side by `adminRequired` middleware — UI hiding is just convenience, the API is the real gate.
- First-user-becomes-admin fallback so you can never lock yourself out.

© PLANTERY. Cultivated with care.
