# Clinic Management System

A comprehensive web-based clinic management system built with React, TailwindCSS, Express.js, Node.js, and Firebase. This system provides role-based access for doctors and receptionists to manage patients, prescriptions, and billing efficiently.

## 🚀 Features

### 👨‍⚕️ Doctor Features
- **Secure Authentication**: Firebase-based login system
- **Patient Dashboard**: View all registered patients with their details
- **Patient History**: Access complete patient medical history
- **Prescription Management**: Create and manage prescriptions for patients
- **Real-time Updates**: Live synchronization of patient data

### 🧑‍💼 Receptionist Features
- **Secure Authentication**: Role-based Firebase authentication
- **Patient Registration**: Register new patients and generate unique tokens
- **Patient Management**: View and update patient information
- **Billing System**: Create bills, track payments, and manage financial records
- **Token Generation**: Generate and manage patient tokens for appointments

### 🎨 UI/UX Features
- **Responsive Design**: Mobile-first design with TailwindCSS
- **Modern Interface**: Clean, intuitive user interface
- **Real-time Data**: Live updates across all components
- **Role-based Access**: Secure access control based on user roles

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TailwindCSS**: Utility-first CSS framework for responsive design
- **React Router**: Client-side routing and navigation
- **Firebase SDK**: Authentication and Firestore integration
- **Vite**: Fast build tool and development server

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Firebase Admin SDK**: Server-side Firebase integration
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security middleware

### Database & Authentication
- **Firebase Authentication**: Secure user authentication
- **Cloud Firestore**: NoSQL document database
- **Firebase Security Rules**: Data access control

## 📁 Project Structure

```
clinic-management-system/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React context providers
│   │   ├── services/       # API services and Firebase config
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Authentication and validation
│   │   ├── config/         # Firebase and app configuration
│   │   └── services/       # Business logic services
│   └── package.json        # Backend dependencies
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Authentication and Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clinic-management-system
   ```

2. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication and Firestore Database
   - Generate service account credentials for the backend
   - Get web app configuration for the frontend

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment variables
   cp .env.example .env
   # Edit .env with your Firebase credentials
   
   # Start development server
   npm run dev
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Update Firebase configuration in src/services/firebase.js
   
   # Start development server
   npm run dev
   ```

5. **Initialize Demo Users**
   ```bash
   # Make a POST request to initialize demo users
   curl -X POST http://localhost:5000/api/auth/init-demo
   ```

### Demo Accounts

After initialization, you can use these demo accounts:

**Doctor Account:**
- Email: `doctor@clinic.com`
- Password: `doctor123`

**Receptionist Account:**
- Email: `receptionist@clinic.com`
- Password: `receptionist123`

## 🔧 Configuration

### Firebase Configuration

1. **Frontend Configuration** (`frontend/src/services/firebase.js`):
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

2. **Backend Configuration** (`backend/.env`):
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   ```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Authenticated users can read/write patients, prescriptions, and bills
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📱 API Documentation

### Authentication Endpoints
- `GET /api/auth/verify` - Verify authentication token
- `POST /api/auth/profile` - Create user profile
- `POST /api/auth/init-demo` - Initialize demo users

### Patient Management
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Register new patient (Receptionist only)
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient information
- `POST /api/patients/:id/token` - Generate new patient token

### Prescription Management
- `GET /api/prescriptions` - Get prescriptions (filtered by role)
- `POST /api/prescriptions` - Create prescription (Doctor only)
- `GET /api/prescriptions/patient/:patientId` - Get patient prescriptions
- `PUT /api/prescriptions/:id` - Update prescription (Doctor only)

### Billing Management
- `GET /api/bills` - Get all bills
- `POST /api/bills` - Create new bill (Receptionist only)
- `GET /api/bills/patient/:patientId` - Get patient bills
- `PUT /api/bills/:id/status` - Update bill status (Receptionist only)

## 🔒 Security Features

- **Firebase Authentication**: Secure user authentication with JWT tokens
- **Role-based Access Control**: Different permissions for doctors and receptionists
- **API Authentication**: All API endpoints require valid authentication
- **CORS Protection**: Configured for secure cross-origin requests
- **Input Validation**: Server-side validation for all user inputs
- **Security Headers**: Helmet.js for additional security headers

## 🎯 Usage

### For Doctors
1. Login with doctor credentials
2. View patient list on the dashboard
3. Click on a patient to view details
4. Add prescriptions using the "Add Prescription" button
5. View prescription history for each patient

### For Receptionists
1. Login with receptionist credentials
2. Register new patients using the "Register Patient" button
3. View all patients and their information
4. Create bills for patients using the "Create Bill" button
5. Mark bills as paid when payments are received
6. Generate new tokens for patients if needed

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update environment variables for production

### Backend Deployment (Railway/Heroku)
1. Set up environment variables in your hosting service
2. Deploy the backend folder
3. Update CORS settings for your frontend domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section below
2. Review the Firebase console for authentication/database issues
3. Check browser console for frontend errors
4. Review server logs for backend issues

## 🔧 Troubleshooting

### Common Issues

1. **Firebase Authentication Errors**
   - Verify Firebase configuration in both frontend and backend
   - Check if Authentication is enabled in Firebase Console
   - Ensure service account has proper permissions

2. **CORS Errors**
   - Update CORS configuration in backend server
   - Check if frontend URL is correctly configured

3. **Database Connection Issues**
   - Verify Firestore is enabled in Firebase Console
   - Check security rules allow read/write operations
   - Ensure proper indexing for queries

4. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check for version compatibility issues
   - Verify all environment variables are set

## 🎉 Acknowledgments

- Firebase for authentication and database services
- TailwindCSS for the beautiful UI framework
- React team for the amazing frontend library
- Express.js for the robust backend framework