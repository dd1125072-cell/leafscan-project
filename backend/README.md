# 🌿 Plant Disease Detector — Full Stack

React frontend + Express/MongoDB backend for AI-powered plant disease detection.

---

## Project Structure

```
plant-disease-detector/          ← your original React frontend
plant-disease-backend/           ← NEW Express + MongoDB backend
  ├── server.js                  ← entry point
  ├── .env.example               ← copy to .env and fill in values
  ├── models/
  │   ├── User.js                ← Mongoose user schema (bcrypt hashed password)
  │   └── Scan.js                ← Mongoose scan schema (stores image location)
  ├── routes/
  │   ├── auth.js                ← POST /api/auth/register, /login, GET /me
  │   └── scans.js               ← POST/GET/DELETE /api/scans
  ├── middleware/
  │   └── auth.js                ← JWT protect middleware
  └── frontend-integration/      ← drop these files into your React src/
      ├── api.js           →  src/utils/api.js
      ├── App.jsx          →  src/App.jsx          (replaces original)
      ├── Footer.jsx       →  src/components/Footer.jsx
      ├── Footer.css       →  src/components/Footer.css
      ├── RegisterPage.jsx →  src/pages/RegisterPage.jsx
      ├── LoginPage.jsx    →  src/pages/LoginPage.jsx
      ├── DetectPage.jsx   →  src/pages/DetectPage.jsx
      └── LogsPage.jsx     →  src/pages/LogsPage.jsx
```

---

## 1. Backend Setup

```bash
cd plant-disease-backend
cp .env.example .env          # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev                   # starts on http://localhost:5000
```

### .env values you must set

| Variable    | Description |
|-------------|-------------|
| `MONGO_URI` | MongoDB connection string. Get a free cluster at https://cloud.mongodb.com |
| `JWT_SECRET`| Any long random string — keep it secret |
| `CLIENT_URL`| URL of your React app (default `http://localhost:3000`) |

---

## 2. Frontend Integration

Copy the files from `frontend-integration/` into the React project:

```bash
# From inside the plant-disease-backend folder:
cp frontend-integration/api.js         ../plant-disease-detector/src/utils/api.js
cp frontend-integration/App.jsx        ../plant-disease-detector/src/App.jsx
cp frontend-integration/Footer.jsx     ../plant-disease-detector/src/components/Footer.jsx
cp frontend-integration/Footer.css     ../plant-disease-detector/src/components/Footer.css
cp frontend-integration/RegisterPage.jsx ../plant-disease-detector/src/pages/RegisterPage.jsx
cp frontend-integration/LoginPage.jsx    ../plant-disease-detector/src/pages/LoginPage.jsx
cp frontend-integration/DetectPage.jsx   ../plant-disease-detector/src/pages/DetectPage.jsx
cp frontend-integration/LogsPage.jsx     ../plant-disease-detector/src/pages/LogsPage.jsx
```

Then add a `.env` in the React project root:

```
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
cd plant-disease-detector
npm install
npm start
```

---

## 3. API Endpoints

### Auth
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{name, email, password}` | Create account → returns JWT |
| POST | `/api/auth/login`    | `{email, password}`       | Sign in → returns JWT |
| GET  | `/api/auth/me`       | —                         | Get current user (JWT required) |

### Scans (all require `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/scans`     | Save a new scan (image stored as base64 in MongoDB) |
| GET    | `/api/scans`     | List your scans (`?filter=healthy&search=tomato`) |
| DELETE | `/api/scans/:id` | Delete one scan |
| DELETE | `/api/scans`     | Delete all your scans |

---

## 4. MongoDB Schema

### User
```
name, email (unique), password (bcrypt), createdAt, updatedAt
```

### Scan
```
userId (ref User), userName,
plantName, notes,
imageUrl (disk path if file upload),
imageData (base64 if JSON body),
label, isHealthy, confidence,
createdAt, updatedAt
```

---

## 5. Security Notes

- Passwords are hashed with **bcrypt** (12 salt rounds) — never stored in plain text
- JWT tokens expire in 7 days — refresh by logging in again
- Image base64 is stored directly in MongoDB (works fine for the plant image sizes)
- For production, consider storing images in S3/Cloudinary instead and saving only the URL

---

## Creators

Built with ❤️ by **Madhesh**, **Dinesh**, and **Sooraj**
