# Hotel Management API

🚀 **Live Deployment Links:**
- **Render:** [https://samarth-assignment-1-hotel-management-api.onrender.com](https://samarth-assignment-1-hotel-management-api.onrender.com)
- **Vercel:** [https://samarth-assignment-1-hotel-management-api.vercel.app](https://samarth-assignment-1-hotel-management-api.vercel.app)

---

- **Name:** Samarth Navale
- **Roll Number:** 150096725148
- **Cohort:** Sam Altman

## Overview
A RESTful Hotel Management API built with **Node.js**, **Express.js**, **Passport.js** (Local Strategy authentication), **express-session**, and **bcryptjs**.

## Features
- 🔐 **User Authentication**: Register (`POST /register`) and Login (`POST /login`) with bcrypt password hashing and Passport Local Strategy.
- 🏨 **Hotel CRUD Operations**: Create (`POST /hotels`), Read (`GET /hotels`), Update (`PUT /hotels/:id`), and Delete (`DELETE /hotels/:id`) hotels.
- 🔍 **Filtering**: Filter hotels by rating (`GET /hotels?rating=5`).
- 🌐 **Deployment Ready**: Fully configured for one-click deployment on both **Render** and **Vercel**.

## Project Structure
```
├── server.js          # Main Express app & API routes
├── requests.http      # Sample HTTP requests for testing endpoints
├── package.json       # Project dependencies & scripts
├── render.yaml        # Render deployment configuration
├── vercel.json        # Vercel deployment configuration
├── .env.example       # Example environment configuration
├── .gitignore         # Git ignore rules
└── README.md          # Project documentation
```

## API Endpoints

### 🔑 Authentication
| Method | Route | Description | Sample Request Body |
|---|---|---|---|
| `POST` | `/register` | Register a new user | `{ "username": "samarth", "email": "samarth@example.com", "password": "pass123" }` |
| `POST` | `/login` | Authenticate user | `{ "username": "samarth", "password": "pass123" }` |

### 🏨 Hotel Management
| Method | Route | Description | Params / Query |
|---|---|---|---|
| `GET` | `/` | API Status & Welcome message | N/A |
| `GET` | `/hotels` | Get list of all hotels | Optional query: `?rating=4.8` |
| `GET` | `/hotels/:id` | Get details of a single hotel | `id` (numeric) |
| `POST` | `/hotels` | Add a new hotel | `{ "name": "Grand Palace", "location": "Mumbai", "rating": 4.8, "pricePerNight": 2500 }` |
| `PUT` | `/hotels/:id` | Update an existing hotel | `id` (numeric) + JSON Body |
| `DELETE` | `/hotels/:id` | Delete a hotel by ID | `id` (numeric) |

## Quick Start (Local Setup)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Samarth-ITM/Samarth-assignment-1-hotel-management-api.git
   cd Samarth-assignment-1-hotel-management-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   ```bash
   cp .env.example .env
   ```

4. **Start the server:**
   - Development mode: `npm run dev`
   - Production mode: `npm start`

The API will be available at `http://localhost:3000`.
