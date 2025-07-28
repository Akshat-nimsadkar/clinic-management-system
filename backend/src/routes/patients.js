import express from 'express'
import { firestore } from '../config/firebase.js'
import { requireRole } from '../middleware/auth.js'

const router = express.Router()

// Get all patients
router.get('/', async (req, res) => {
  try {
    const patientsSnapshot = await firestore
      .collection('patients')
      .orderBy('createdAt', 'desc')
      .get()

    const patients = []
    patientsSnapshot.forEach(doc => {
      patients.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        dateOfBirth: doc.data().dateOfBirth?.toDate?.() || doc.data().dateOfBirth
      })
    })

    res.json({
      success: true,
      data: patients,
      count: patients.length
    })
  } catch (error) {
    console.error('Error fetching patients:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients'
    })
  }
})

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const patientDoc = await firestore.collection('patients').doc(id).get()

    if (!patientDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      })
    }

    const patientData = {
      id: patientDoc.id,
      ...patientDoc.data(),
      createdAt: patientDoc.data().createdAt?.toDate?.() || patientDoc.data().createdAt,
      dateOfBirth: patientDoc.data().dateOfBirth?.toDate?.() || patientDoc.data().dateOfBirth
    }

    res.json({
      success: true,
      data: patientData
    })
  } catch (error) {
    console.error('Error fetching patient:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient'
    })
  }
})

// Register new patient (Receptionist only)
router.post('/', requireRole('receptionist'), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      dateOfBirth,
      emergencyContact,
      medicalHistory
    } = req.body

    // Validation
    if (!name || !email || !phone || !address || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, address, and date of birth are required'
      })
    }

    // Check if patient with email already exists
    const existingPatient = await firestore
      .collection('patients')
      .where('email', '==', email)
      .get()

    if (!existingPatient.empty) {
      return res.status(400).json({
        success: false,
        message: 'Patient with this email already exists'
      })
    }

    // Generate unique token
    const token = `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const patientData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address.trim(),
      dateOfBirth: new Date(dateOfBirth),
      emergencyContact: emergencyContact?.trim() || '',
      medicalHistory: medicalHistory?.trim() || '',
      token,
      registeredBy: req.user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const docRef = await firestore.collection('patients').add(patientData)

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: {
        id: docRef.id,
        ...patientData
      }
    })
  } catch (error) {
    console.error('Error registering patient:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to register patient'
    })
  }
})

// Update patient information
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Remove fields that shouldn't be updated
    delete updates.id
    delete updates.token
    delete updates.createdAt
    delete updates.registeredBy

    // Add updated timestamp
    updates.updatedAt = new Date()

    // Convert dateOfBirth to Date if provided
    if (updates.dateOfBirth) {
      updates.dateOfBirth = new Date(updates.dateOfBirth)
    }

    const patientRef = firestore.collection('patients').doc(id)
    const patientDoc = await patientRef.get()

    if (!patientDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      })
    }

    await patientRef.update(updates)

    const updatedDoc = await patientRef.get()
    const updatedData = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data().createdAt?.toDate?.() || updatedDoc.data().createdAt,
      dateOfBirth: updatedDoc.data().dateOfBirth?.toDate?.() || updatedDoc.data().dateOfBirth
    }

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: updatedData
    })
  } catch (error) {
    console.error('Error updating patient:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update patient'
    })
  }
})

// Generate new token for patient
router.post('/:id/token', requireRole('receptionist'), async (req, res) => {
  try {
    const { id } = req.params

    const patientRef = firestore.collection('patients').doc(id)
    const patientDoc = await patientRef.get()

    if (!patientDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      })
    }

    // Generate new token
    const newToken = `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    await patientRef.update({
      token: newToken,
      updatedAt: new Date()
    })

    res.json({
      success: true,
      message: 'New token generated successfully',
      data: {
        token: newToken
      }
    })
  } catch (error) {
    console.error('Error generating token:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate new token'
    })
  }
})

// Search patients
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params
    const searchTerm = query.toLowerCase()

    const patientsSnapshot = await firestore
      .collection('patients')
      .get()

    const patients = []
    patientsSnapshot.forEach(doc => {
      const data = doc.data()
      const patientData = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        dateOfBirth: data.dateOfBirth?.toDate?.() || data.dateOfBirth
      }

      // Search in name, email, phone, or token
      if (
        data.name?.toLowerCase().includes(searchTerm) ||
        data.email?.toLowerCase().includes(searchTerm) ||
        data.phone?.includes(searchTerm) ||
        data.token?.toLowerCase().includes(searchTerm)
      ) {
        patients.push(patientData)
      }
    })

    res.json({
      success: true,
      data: patients,
      count: patients.length
    })
  } catch (error) {
    console.error('Error searching patients:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to search patients'
    })
  }
})

export default router