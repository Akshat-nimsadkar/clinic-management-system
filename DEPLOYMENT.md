# Deployment Guide

## Quick Start Commands

### Development Setup
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in new terminal)
cd frontend
npm install
npm run dev

# Initialize demo users
curl -X POST http://localhost:5000/api/auth/init-demo
```

### Production Build
```bash
# Frontend build
cd frontend
npm run build

# Backend production
cd backend
npm start
```

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### Frontend (firebase.js)
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
}
```

## Demo Credentials

**Doctor Account:**
- Email: doctor@clinic.com
- Password: doctor123

**Receptionist Account:**
- Email: receptionist@clinic.com  
- Password: receptionist123

## API Endpoints

### Authentication
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/init-demo` - Initialize demo users

### Patients
- `GET /api/patients` - List all patients
- `POST /api/patients` - Register patient (Receptionist)
- `GET /api/patients/:id` - Get patient details
- `POST /api/patients/:id/token` - Generate new token

### Prescriptions
- `GET /api/prescriptions` - List prescriptions
- `POST /api/prescriptions` - Create prescription (Doctor)
- `GET /api/prescriptions/patient/:id` - Patient prescriptions

### Billing
- `GET /api/bills` - List bills
- `POST /api/bills` - Create bill (Receptionist)
- `PUT /api/bills/:id/status` - Update bill status
- `GET /api/bills/stats/summary` - Billing statistics