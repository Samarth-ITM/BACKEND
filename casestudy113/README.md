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
PORT=5001
MONGO_URI=mongodb+srv://rougeparrot_db_user:UQRMntOSFbCKjo7P@casestudy113.4uag7mq.mongodb.net/hostel_room_allocation?retryWrites=true&w=majority
JWT_SECRET=super_secret_hostel_allocation_jwt_key_2026_samarth
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5001/api
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
Runs 36 integration checks verifying authentication, authorization, CRUD, capacity limits, and duplicate protection.

---

## Demonstration Test Flow (Viva Scenario)

1. **Register Warden**: Create a warden account (`role: "warden"`).
2. **Register Students**: Create Student 1, Student 2, and Student 3 (`role: "student"`).
3. **Warden Adds Room**: Room 101 with `capacity = 2`. `occupiedCount` starts at `0`.
4. **Student 1 Requests Room 101**: Allocation request created with status `pending`. (`occupiedCount` remains `0`).
5. **Warden Approves Student 1**: Allocation status changes to `approved`, and `occupiedCount` increases to `1`.
6. **Student 2 Requests Room 101**: Request created with status `pending`.
7. **Warden Approves Student 2**: Allocation approved, and `occupiedCount` increases to `2` (Room is now FULL).
8. **Student 3 Requests Room 101**: Backend rejects request with `400 Bad Request` and message: `"Room is full"`.
9. **Capacity Validation Check**: Warden cannot approve beyond capacity; `occupiedCount` safely stays at `2`.
