# Salon Management API

🚀 **Live Deployment Links:**
- **Render:** [https://samarth-assignment-4-salon-management-api.onrender.com](https://samarth-assignment-4-salon-management-api.onrender.com)
- **Vercel:** [https://samarth-assignment-4-salon-management-api.vercel.app](https://samarth-assignment-4-salon-management-api.vercel.app)

---

- **Name:** Samarth Navale
- **Roll No:** 150096725148
- **Cohort:** Sam Altman

---

A salon management REST API built with Express 5 and Supabase PostgreSQL, featuring JWT authentication on protected routes. Salons manage services with cascading relationships.

## Tech Stack

- **Framework:** Express 5
- **Database:** Supabase PostgreSQL via `@supabase/supabase-js`
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` for password hashing
- **Configuration:** `dotenv`

## Project Structure

```
Samarth_Navale_150096725148/
├── config/
│   └── db.js
├── models/
│   ├── Users.js
│   ├── Salons.js
│   ├── Services.js
│   └── unwrap.js
├── controllers/
│   ├── authController.js
│   ├── salonController.js
│   └── serviceController.js
├── routes/
│   ├── authRoutes.js
│   ├── salonRoutes.js
│   └── serviceRoutes.js
├── middleware/
│   ├── auth.js
│   └── logger.js
├── .env
├── .env.example
├── render.yaml
├── vercel.json
├── requests.http
├── package.json
└── server.js
```

## Quick Start (Local Setup)

1. **Navigate to project folder:**
   ```bash
   cd Samarth_Navale_150096725148
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create `.env` based on `.env.example`:
   ```env
   PORT=4000
   SUPABASE_URL=https://your-supabase-project.supabase.co
   SUPABASE_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the server:**
   - Development mode: `npm run dev`
   - Production mode: `npm start`

Server will be running at `http://localhost:4000`.

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default: `4000`) |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_KEY` | Supabase API Key |
| `JWT_SECRET` | Secret key used to sign JWT tokens |

## Data Models

### User Schema (`models/Users.js`)
| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key, default `gen_random_uuid()` |
| `username` | TEXT | Required |
| `email` | TEXT | Required, unique |
| `password` | TEXT | Required, bcrypt hashed |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### Salon Schema (`models/Salons.js`)
| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key, default `gen_random_uuid()` |
| `name` | TEXT | Required |
| `city` | TEXT | Required |
| `address` | TEXT | Optional |
| `rating` | NUMERIC(2,1) | Rating between 0 and 5 |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### Service Schema (`models/Services.js`)
| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key, default `gen_random_uuid()` |
| `salon_id` | UUID | Foreign key referencing `salons(id)` (ON DELETE CASCADE) |
| `service_name` | TEXT | Required |
| `price` | NUMERIC | Required, positive number |
| `duration` | TEXT | Optional duration |
| `is_available` | BOOLEAN | Default `true` |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

*(Deleting a salon automatically deletes all associated services).*

## Authentication

Register, then log in to obtain a JWT token. Pass the token on protected routes in the header:

```http
Authorization: Bearer <token>
```

A missing, invalid, or expired token returns `401 Unauthorized`.

## API Endpoints

### 🔑 Authentication Routes
| Method | Route | Auth Required | Description |
|---|---|---|---|
| `POST` | `/register` | No | Register a new user |
| `POST` | `/login` | No | Log in and receive JWT token |

### 💇 Salon Routes
| Method | Route | Auth Required | Description |
|---|---|---|---|
| `GET` | `/salons` | No | List all salons |
| `GET` | `/salons/top` | No | List top 5 salons by rating |
| `GET` | `/salons/city/:city` | No | List salons filtered by city |
| `GET` | `/salons/:id` | No | Get details of a specific salon |
| `POST` | `/salons` | Yes | Create a new salon |
| `PUT` | `/salons/:id` | Yes | Update an existing salon |
| `DELETE` | `/salons/:id` | Yes | Delete a salon and its services |

### ✂️ Service Routes
| Method | Route | Auth Required | Description |
|---|---|---|---|
| `GET` | `/salons/:id/services` | No | List services for a specific salon |
| `POST` | `/salons/:id/services` | Yes | Add a new service to a salon |
| `GET` | `/services/available` | No | List all available services |
| `PUT` | `/services/:id` | Yes | Update a service |
| `DELETE` | `/services/:id` | Yes | Delete a service |

## HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Successful operation |
| `201` | Resource created |
| `400` | Bad request / validation error |
| `401` | Unauthorized / invalid or missing token |
| `404` | Resource not found |
| `500` | Internal server error |
