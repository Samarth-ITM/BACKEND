# Hostel Room Allocation System - Backend

Express.js and TypeScript backend for managing hostel room allocations with bed capacity validation and role-based authorization.

## Features
- JWT Authentication (bcrypt password hashing)
- Role-based authorization (`student` and `warden`)
- Room CRUD operations
- Allocation workflow (Pending -> Approved / Rejected)
- Strict bed capacity enforcement

## Environment Variables
Create `.env` file based on `.env.example`:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## Installation & Running
```bash
npm install
npm run dev     # Starts development server with tsx
npm run build   # Compiles TypeScript to dist/
npm start       # Runs production build from dist/
```
