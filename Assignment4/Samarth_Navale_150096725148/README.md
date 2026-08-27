# Salon Management API

Assignment 4 — Samarth Navale, Roll no: 150096725148

A salon management REST API built with Express and Supabase PostgreSQL, featuring JWT authentication on protected routes. Salons manage services with cascading relationships.

## Tech stack

- Express 5
- Supabase PostgreSQL via `@supabase/supabase-js`
- jsonwebtoken for auth tokens
- bcryptjs for password hashing
- dotenv for configuration

## Project structure

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
├── requests.http
├── package.json
└── server.js
```

## Setup

Requires Node.js and Supabase credentials configured in `.env`.

```bash
npm install
npm start          # or: npm run dev
```

Server runs at `http://localhost:4000`.

### Environment variables

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default: `4000`) |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_KEY` | Supabase API Key |
| `JWT_SECRET` | Secret key used to sign JWT tokens |

## Data models

**User**

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key, default `gen_random_uuid()` |
| `username` | TEXT | Required |
| `email` | TEXT | Required, unique |
| `password` | TEXT | Required, bcrypt hashed |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Salon**

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key, default `gen_random_uuid()` |
| `name` | TEXT | Required |
| `city` | TEXT | Required |
| `address` | TEXT | Optional |
| `rating` | NUMERIC(2,1) | Rating between 0 and 5 |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Service**

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key, default `gen_random_uuid()` |
| `salon_id` | UUID | Foreign key referencing `salons(id)` (ON DELETE CASCADE) |
| `service_name` | TEXT | Required |
| `price` | NUMERIC | Required, positive number |
| `duration` | TEXT | Optional duration |
| `is_available` | BOOLEAN | Default `true` |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

## Authentication

Register, then log in to obtain a JWT token. Pass the token on protected routes in the header:

```
Authorization: Bearer <token>
```

A missing, invalid, or expired token returns `401 Unauthorized`.

## API Endpoints

### Auth

| Method | Route | Auth Required | Description |
|---|---|---|---|
| POST | `/register` | No | Register a new user |
| POST | `/login` | No | Log in and receive JWT token |

### Salons

| Method | Route | Auth Required | Description |
|---|---|---|---|
| GET | `/salons` | No | List all salons |
| GET | `/salons/top` | No | List top 5 salons by rating |
| GET | `/salons/city/:city` | No | List salons filtered by city |
| GET | `/salons/:id` | No | Get details of a specific salon |
| POST | `/salons` | Yes | Create a new salon |
| PUT | `/salons/:id` | Yes | Update an existing salon |
| DELETE | `/salons/:id` | Yes | Delete a salon and its services |

### Services

| Method | Route | Auth Required | Description |
|---|---|---|---|
| GET | `/salons/:id/services` | No | List services for a specific salon |
| POST | `/salons/:id/services` | Yes | Add a new service to a salon |
| GET | `/services/available` | No | List all available services |
| PUT | `/services/:id` | Yes | Update a service |
| DELETE | `/services/:id` | Yes | Delete a service |

## Status codes

| Code | Meaning |
|---|---|
| 200 | Successful operation |
| 201 | Resource created |
| 400 | Bad request / validation error |
| 401 | Unauthorized / invalid or missing token |
| 404 | Resource not found |
| 500 | Internal server error |
