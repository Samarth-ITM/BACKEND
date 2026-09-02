# Hospital Management API

- **Name:** Samarth Navale
- **Roll No:** 150096725148
- **Cohort:** Sam Altman

Express & MongoDB backend API for managing hospital CRUD operations and user authentication.

## Getting Started

```bash
cd hm-crud
npm install
npm run dev
```

### Environment Variables (`hm-crud/.env`)
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