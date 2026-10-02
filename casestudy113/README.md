# Hostel Room Allocation System

A college hostel room allocation management system with capacity-controlled room bookings, role-based authorization, and status tracking.

## Overview
- **Project**: Hostel Room Allocation System
- **Backend**: Node.js + Express.js + TypeScript + MongoDB (Mongoose)
- **Frontend**: React + TypeScript + Vite
- **Main Concepts Demonstrated**:
  - Mongoose schemas with relationship references
  - Full CRUD operations for rooms
  - JWT authentication and bcrypt password hashing
  - Role-based authorization (`student` and `warden`)
  - Strict room bed capacity validation
  - Allocation status workflow tracking (`pending` -> `approved` / `rejected`)
  - Clean RESTful APIs

---

## Folder Structure

```
casestudy113/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Student.ts
│   │   │   ├── Room.ts
│   │   │   └── Allocation.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── rooms.ts
│   │   │   └── allocations.ts
│   │   └── server.ts
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── test-api.ts
│   ├── tsconfig.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── postman/
│   └── hostel-room-allocation.json
├── README.md
└── .gitignore
```

---

## API Endpoints Table

| METHOD | ENDPOINT | ACCESS | PURPOSE |
|---|---|---|---|
| `GET` | `/api` | Public | Health / Welcome check |
| `POST` | `/api/auth/register` | Public | Register new student or warden |
| `POST` | `/api/auth/login` | Public | Login with email/password and receive JWT |
| `POST` | `/api/auth/google` | Public | Google Sign-In & auto-sync to MongoDB Atlas |
| `GET` | `/api/auth/me` | Auth | Get authenticated user profile from MongoDB |
| `PATCH` | `/api/auth/profile` | Auth | Update name and switch role directly in MongoDB |
| `GET` | `/api/rooms` | Auth | View all rooms and bed availability |
| `POST` | `/api/rooms` | Warden | Add a new room with capacity |
| `PATCH` | `/api/rooms/:id` | Warden | Update room number or capacity |
| `DELETE` | `/api/rooms/:id` | Warden | Delete an empty room |
| `POST` | `/api/allocations` | Student | Request room allocation (pending) |
| `GET` | `/api/allocations` | Auth | View allocations (all for warden, own for student) |
| `PATCH` | `/api/allocations/:id/status` | Warden | Approve or reject pending request |

---

## Live Cloud Deployments

- **Frontend (Vercel)**: [https://casestudy113.vercel.app](https://casestudy113.vercel.app)
- **Backend (Render)**: [https://casestudy113.onrender.com/api](https://casestudy113.onrender.com/api)
- **Database (MongoDB Atlas)**: `casestudy113.4uag7mq.mongodb.net`

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5001
MONGO_URI=<YOUR_MONGO_URI>
JWT_SECRET=<YOUR_JWT_SECRET>
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=https://casestudy113.onrender.com/api
```

---

## Installation & Running

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5001`.

### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`.

### 3. Automated Verification Tests
```bash
cd backend
npm test
```
Runs 40 integration checks verifying authentication, Google Sign-In sync, authorization, CRUD, capacity limits, and duplicate protection.

---

## Demonstration Test Flow (Viva Scenario)

1. **Google Sign-In**: Click "Sign in with Google", select or enter your account. User profile is immediately created and synced into MongoDB Atlas.
2. **Role Switcher**: Click "Edit Profile / Switch Role" to toggle between Student and Warden; updates persist directly to MongoDB Atlas.
3. **Warden Adds Room**: Room 101 with `capacity = 2`. `occupiedCount` starts at `0`.
4. **Student 1 Requests Room 101**: Allocation request created with status `pending`. (`occupiedCount` remains `0`).
5. **Warden Approves Student 1**: Allocation status changes to `approved`, and `occupiedCount` increases to `1`.
6. **Student 2 Requests Room 101**: Request created with status `pending`.
7. **Warden Approves Student 2**: Allocation approved, and `occupiedCount` increases to `2` (Room is now FULL).
8. **Student 3 Requests Room 101**: Backend rejects request with `400 Bad Request` and message: `"Room is full"`.
9. **Capacity Validation Check**: Warden approval is blocked if room is full; `occupiedCount` safely stays at `2`.

