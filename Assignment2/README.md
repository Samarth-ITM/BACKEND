# Hospital Management API

- **Name:** Samarth Navale
- **Roll No:** 150096725148
- **Cohort:** Sam Altman
- **Render:** [https://samarth-assignment-2-hospital-management-api.onrender.com](https://samarth-assignment-2-hospital-management-api.onrender.com)
- **Vercel:** [https://samarth-assignment-2-hospital-management-api.vercel.app](https://samarth-assignment-2-hospital-management-api.vercel.app)

Express & MongoDB backend API for managing hospital CRUD operations and user authentication.

## Getting Started

```bash
cd Samarth_Navale_150096725148
npm install
npm run dev
```

### Environment Variables (`.env`)
```env
PORT=3000
MONGO_URI=your_mongodb_uri
SESSION_SECRET=your_secret
```

## Endpoints

### Auth
- `POST /register`
- `POST /login`

### Hospitals
- `GET /`
- `GET /hospitals`
- `GET /hospitals/available`
- `GET /hospitals/:id`
- `POST /hospitals`
- `PUT /hospitals/:id`
- `DELETE /hospitals/:id`