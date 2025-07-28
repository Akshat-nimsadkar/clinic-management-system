import express from 'express'
import { auth, firestore } from '../config/firebase.js'

const router = express.Router()

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided'
      })
    }

    const token = authHeader.split(' ')[1]
    const decodedToken = await auth.verifyIdToken(token)
    
    // Get user data from Firestore
    const userDoc = await firestore.collection('users').doc(decodedToken.uid).get()
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const userData = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      ...userDoc.data()
    }

    res.json({
      success: true,
      user: userData
    })
  } catch (error) {
    console.error('Token verification error:', error)
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }
})

// Create user profile (called after Firebase Auth registration)
router.post('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided'
      })
    }

    const token = authHeader.split(' ')[1]
    const decodedToken = await auth.verifyIdToken(token)
    
    const { name, role } = req.body

    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name and role are required'
      })
    }

    if (!['doctor', 'receptionist'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be doctor or receptionist'
      })
    }

    // Create user document in Firestore
    const userData = {
      name,
      role,
      email: decodedToken.email,
      createdAt: new Date()
    }

    await firestore.collection('users').doc(decodedToken.uid).set(userData)

    res.json({
      success: true,
      message: 'User profile created successfully',
      user: {
        uid: decodedToken.uid,
        ...userData
      }
    })
  } catch (error) {
    console.error('Profile creation error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create user profile'
    })
  }
})

// Initialize demo users
router.post('/init-demo', async (req, res) => {
  try {
    const demoUsers = [
      {
        email: 'doctor@clinic.com',
        password: 'doctor123',
        name: 'Dr. John Smith',
        role: 'doctor'
      },
      {
        email: 'receptionist@clinic.com',
        password: 'receptionist123',
        name: 'Sarah Johnson',
        role: 'receptionist'
      }
    ]

    const results = []

    for (const user of demoUsers) {
      try {
        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
          email: user.email,
          password: user.password,
          displayName: user.name
        })

        // Create user document in Firestore
        await firestore.collection('users').doc(userRecord.uid).set({
          name: user.name,
          role: user.role,
          email: user.email,
          createdAt: new Date()
        })

        results.push({
          email: user.email,
          role: user.role,
          status: 'created'
        })
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          results.push({
            email: user.email,
            role: user.role,
            status: 'already exists'
          })
        } else {
          results.push({
            email: user.email,
            role: user.role,
            status: 'error',
            error: error.message
          })
        }
      }
    }

    res.json({
      success: true,
      message: 'Demo users initialization completed',
      results
    })
  } catch (error) {
    console.error('Demo initialization error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to initialize demo users'
    })
  }
})

export default router