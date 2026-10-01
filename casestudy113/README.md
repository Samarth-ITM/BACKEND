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
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── .env.example
├── postman/
│   └── hostel-room-allocation.json
├── README.md
└── .gitignore
```

---

## API Endpoints Table

| METHOD | ENDPOINT | ACCESS | PURPOSE |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new student or warden |
| `POST` | `/api/auth/login` | Public | Login and receive JWT token |
| `GET` | `/api/rooms` | Auth | View all rooms and bed availability |
| `POST` | `/api/rooms` | Warden | Add a new room with capacity |
| `PATCH` | `/api/rooms/:id` | Warden | Update room number or capacity |
| `DELETE` | `/api/rooms/:id` | Warden | Delete an empty room |
| `POST` | `/api/allocations` | Student | Request room allocation (pending) |
| `GET` | `/api/allocations` | Auth | View allocations (all for warden, own for student) |
| `PATCH` | `/api/allocations/:id/status` | Warden | Approve or reject pending request |

---

## Environment Variables

### Backend (`backend/.env`)
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Go to **Network Access** and add your IP address (or `0.0.0.0/0` for development).
3. Go to **Database Access** and create a database user with username and password.
4. Click **Connect** -> **Drivers** -> Copy the connection string.
5. Paste it in `backend/.env` as `MONGO_URI`.

---

## Installation & Running

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGO_URI in .env
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```
Frontend runs on `http://localhost:3000`.

---

## Demonstration Test Flow (Viva Scenario)

1. **Register Warden**: Create a warden account (`role: "warden"`).
2. **Register Students**: Create Student 1, Student 2, and Student 3 (`role: "student"`).
3. **Warden Adds Room**: Room 101 with `capacity = 2`. `occupiedCount` starts at `0`.
4. **Student 1 Requests Room 101**: Allocation request created with status `pending`. (Note: `occupiedCount` is still `0`).
5. **Warden Approves Student 1**: Allocation status changes to `approved`, and `occupiedCount` increases to `1`.
6. **Student 2 Requests Room 101**: Request created with status `pending`.
7. **Warden Approves Student 2**: Allocation approved, and `occupiedCount` increases to `2` (Room is now FULL).
8. **Student 3 Requests Room 101**: Backend rejects or allows pending request.
9. **Capacity Validation Check**: Warden attempts to approve Student 3. Backend blocks it with `400 Bad Request` and message: `"Room is full"`. `occupiedCount` remains safely at `2`.
