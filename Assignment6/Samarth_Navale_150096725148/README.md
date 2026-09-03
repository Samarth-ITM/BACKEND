# 📚 Library Management System API (Assignment 6)

🚀 **Live Deployment Links:**
- **Render:** [https://samarth-assignment-6-library-management-api.onrender.com](https://samarth-assignment-6-library-management-api.onrender.com)
- **Vercel:** [https://samarth-assignment-6-library-management-api.vercel.app](https://samarth-assignment-6-library-management-api.vercel.app)

---

- **Name:** Samarth Navale
- **Roll No:** 150096725148
- **Cohort:** Sam Altman

---

A production-ready RESTful API for a **Library Management System** built with **Node.js**, **Express.js**, **JWT**, **bcrypt**, and **Firebase Firestore**.

Includes Role-Based Access Control (RBAC), Swagger UI Documentation, Request Logging, Input Validation, and Rate Limiting.

---

## 🚀 Features

- 🔐 **Authentication & Authorization**: JWT token-based auth with password hashing using `bcrypt`.
- 👥 **Role-Based Access Control (RBAC)**: Enforced permissions for `Student` and `Librarian` roles via middleware.
- 📚 **Book Management**: Full CRUD operations for books with categories, stock quantity tracking, and availability status.
- 🔄 **Borrowing & Return System**: Students can borrow and return books with automated due date tracking (14 days) and stock adjustment.
- 🗄️ **Firebase Firestore Database**: Firestore integration with fallback support for instant out-of-the-box local testing.
- 📊 **Swagger API Documentation**: Interactive OpenAPI 3.0 UI available at `/api-docs`.
- 🚦 **Rate Limiting**: Protects endpoints against API abuse (100 requests / 15 minutes per IP).
- 📝 **Logging & Error Handling**: Comprehensive request logger and global error handling middleware.

---

## 📁 Project Folder Structure

```
📂 Assignment6/
├── 📄 server.js               # Express Server Entry Point
├── 📄 package.json            # Project Dependencies
├── 📄 .env                    # Environment Variables
├── 📄 .env.example            # Sample Environment File
├── 📂 src/
│   ├── 📂 config/
│   │   ├── 📄 firebase.js     # Firebase Firestore Config & Fallback Adapter
│   │   └── 📄 swagger.js      # Swagger UI Setup Config
│   ├── 📂 middleware/
│   │   ├── 📄 auth.js         # JWT Authentication Middleware
│   │   ├── 📄 role.js         # Role Authorization Middleware
│   │   ├── 📄 logger.js       # Custom Request Logging Middleware
│   │   ├── 📄 rateLimiter.js  # IP Rate Limiting Middleware
│   │   └── 📄 validator.js   # Input Payload Validation Rules
│   ├── 📂 routes/
│   │   ├── 📄 authRoutes.js   # Authentication Endpoints
│   │   ├── 📄 bookRoutes.js   # Book Management & Borrow/Return Endpoints
│   │   ├── 📄 userRoutes.js   # User Management Endpoints (Librarian Only)
│   │   └── 📄 transactionRoutes.js # Transaction Endpoints
│   ├── 📂 controllers/
│   │   ├── 📄 authController.js
│   │   ├── 📄 bookController.js
│   │   ├── 📄 userController.js
│   │   └── 📄 transactionController.js
│   ├── 📂 models/
│   │   ├── 📄 userModel.js        # User Firestore Schema Model
│   │   ├── 📄 bookModel.js        # Book Firestore Schema Model
│   │   └── 📄 transactionModel.js # Transaction Firestore Schema Model
│   └── 📂 utils/
│       ├── 📄 jwt.js          # JWT Helper Utilities
│       └── 📄 validation.js   # Express Validation Formatter
├── 📂 docs/
│   ├── 📄 swagger.yaml        # OpenAPI 3.0 Documentation Specification
│   └── 📄 Library_Management_API.postman_collection.json # Postman Collection
└── 📄 README.md               # Project Documentation
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Node.js** (v14+ installed)
- **npm** or **yarn**

### 2. Install Dependencies
Navigate into the project directory and install node modules:
```bash
cd Assignment6
npm install
```

### 3. Environment Variables Configuration
Copy `.env.example` to `.env` or edit `.env` directly:
```bash
cp .env.example .env
```

Set your configuration values inside `.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

# Firebase Credentials (Optional - Mock mode active when set to sample values)
FIREBASE_PROJECT_ID=sample-library-project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@sample.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Run the API Server

#### Production Mode:
```bash
npm start
```

#### Development Mode (with nodemon):
```bash
npm run dev
```

The server will launch at `http://localhost:5000`.

---

## 📖 API Documentation (Swagger UI)

Interactive API documentation is available via Swagger UI:
👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

You can test all endpoints, view request body schemas, and pass Authorization headers directly inside Swagger!

---

## 📌 API Endpoints Overview

| Method | Endpoint | Description | Access / Role |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new user | Public |
| **POST** | `/api/auth/login` | User login & receive JWT token | Public |
| **GET** | `/api/auth/profile` | Get current user profile | Authenticated |
| **PUT** | `/api/auth/profile` | Update current user profile | Authenticated |
| **GET** | `/api/books` | Get all books (filters: `category`, `status`, `author`) | Public |
| **GET** | `/api/books/search` | Search books by title or author (`?q=term`) | Public |
| **GET** | `/api/books/:id` | Get details of a single book | Public |
| **POST** | `/api/books` | Add a new book | 👩‍🏫 Librarian Only |
| **PUT** | `/api/books/:id` | Update book details | 👩‍🏫 Librarian Only |
| **DELETE**| `/api/books/:id` | Delete a book | 👩‍🏫 Librarian Only |
| **POST** | `/api/books/:id/borrow` | Borrow a book | 👨‍🎓 Student Only |
| **POST** | `/api/books/:id/return` | Return a borrowed book | 👨‍🎓 Student Only |
| **GET** | `/api/transactions` | View all system transactions | 👩‍🏫 Librarian Only |
| **GET** | `/api/transactions/my` | View personal borrow history | Authenticated |
| **GET** | `/api/users` | List all registered users | 👩‍🏫 Librarian Only |
| **GET** | `/api/users/:id` | Get user details | 👩‍🏫 Librarian Only |
| **PUT** | `/api/users/:id/role` | Update user role (`student`/`librarian`) | 👩‍🏫 Librarian Only |
| **DELETE**| `/api/users/:id` | Delete a user | 👩‍🏫 Librarian Only |

---

## 🔑 Permissions & Role Matrix

| Action | Student 👨‍🎓 | Librarian 👩‍🏫 |
| :--- | :---: | :---: |
| View / Search Books | ✅ | ✅ |
| Borrow / Return Books | ✅ | ❌ |
| Add / Edit / Delete Books | ❌ | ✅ |
| View All Transactions | ❌ | ✅ |
| Manage Users & Roles | ❌ | ✅ |

---

## 🗄️ Firestore Database Schema

### Users Collection (`users`)
```json
{
  "userId": "string",
  "name": "string",
  "email": "string (unique)",
  "password": "string (hashed)",
  "role": "student | librarian",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Books Collection (`books`)
```json
{
  "bookId": "string",
  "title": "string",
  "author": "string",
  "isbn": "string",
  "category": "string",
  "status": "available | borrowed",
  "quantity": 5,
  "createdAt": "timestamp"
}
```

### Transactions Collection (`transactions`)
```json
{
  "transactionId": "string",
  "userId": "string",
  "bookId": "string",
  "type": "borrow | return",
  "borrowDate": "timestamp",
  "returnDate": "timestamp (null if active)",
  "dueDate": "timestamp (14 days)",
  "status": "active | returned | overdue"
}
```

---

## 🧪 Testing with Postman

1. Open **Postman**.
2. Click **Import** -> Select file `docs/Library_Management_API.postman_collection.json`.
3. Register a user or login to get a `token`.
4. Add the token in the request header as `Authorization: Bearer <YOUR_JWT_TOKEN>`.
