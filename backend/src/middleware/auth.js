import { auth, firestore } from '../config/firebase.js'

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authorization token provided'
      })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(token)
    
    // Get user data from Firestore
    const userDoc = await firestore.collection('users').doc(decodedToken.uid).get()
    
    if (!userDoc.exists) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found in database'
      })
    }

    // Attach user data to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      ...userDoc.data()
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Authentication token has expired'
      })
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Invalid authentication token format'
      })
    }

    return res.status(401).json({
      error: 'Authentication Failed',
      message: 'Failed to authenticate user'
    })
  }
}

export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      })
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role: ${requiredRole}`
      })
    }

    next()
  }
}