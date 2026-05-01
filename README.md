# 🌾 LeafScan — Rice Disease Detection System

Detects 3 rice plant diseases using YOLOv5 AI model.

## Detected Diseases
- Bacterial Blight
- Rice Blast  
- Brown Spot
- Healthy (no disease)

## How to Run (3 terminals)

### Terminal 1 — Python Model (port 8000)
```
cd model-service
pip install flask flask-cors torch torchvision pillow
python app.py
```

### Terminal 2 — Express Backend (port 5000)
```
cd backend
copy .env.example .env    # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev
```

### Terminal 3 — React Frontend (port 3000)
```
(in root folder)
echo REACT_APP_API_URL=http://localhost:5000/api > .env
npm install
npm start
```

## Deploy to Internet

### Frontend → Vercel
1. Push to GitHub
2. Go to vercel.com → Import project
3. Set env: REACT_APP_API_URL=https://your-backend.railway.app/api

### Backend → Railway
1. Go to railway.app → Deploy from GitHub
2. Set env variables: MONGO_URI, JWT_SECRET, CLIENT_URL, MODEL_API_URL

### Model Service → Railway (separate service)
1. Add Python service on Railway
2. Deploy the model-service folder
3. Set MODEL_PORT=8000

## Created by
Madhesh · Dinesh · Sooraj
