import express from 'express'
import { firestore } from '../config/firebase.js'
import { requireRole } from '../middleware/auth.js'

const router = express.Router()

// Get all prescriptions (with optional patient filter)
router.get('/', async (req, res) => {
  try {
    const { patientId, doctorId } = req.query
    let query = firestore.collection('prescriptions')

    // Filter by patient if specified
    if (patientId) {
      query = query.where('patientId', '==', patientId)
    }

    // Filter by doctor if specified or if user is a doctor
    if (doctorId) {
      query = query.where('doctorId', '==', doctorId)
    } else if (req.user.role === 'doctor') {
      query = query.where('doctorId', '==', req.user.uid)
    }

    const prescriptionsSnapshot = await query
      .orderBy('createdAt', 'desc')
      .get()

    const prescriptions = []
    prescriptionsSnapshot.forEach(doc => {
      prescriptions.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
      })
    })

    res.json({
      success: true,
      data: prescriptions,
      count: prescriptions.length
    })
  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions'
    })
  }
})

// Get prescription by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const prescriptionDoc = await firestore.collection('prescriptions').doc(id).get()

    if (!prescriptionDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      })
    }

    const prescriptionData = {
      id: prescriptionDoc.id,
      ...prescriptionDoc.data(),
      createdAt: prescriptionDoc.data().createdAt?.toDate?.() || prescriptionDoc.data().createdAt
    }

    // Check if user has access to this prescription
    if (req.user.role === 'doctor' && prescriptionData.doctorId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    res.json({
      success: true,
      data: prescriptionData
    })
  } catch (error) {
    console.error('Error fetching prescription:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescription'
    })
  }
})

// Get prescriptions for a specific patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params

    // Verify patient exists
    const patientDoc = await firestore.collection('patients').doc(patientId).get()
    if (!patientDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      })
    }

    let query = firestore
      .collection('prescriptions')
      .where('patientId', '==', patientId)

    // If user is a doctor, only show their prescriptions
    if (req.user.role === 'doctor') {
      query = query.where('doctorId', '==', req.user.uid)
    }

    const prescriptionsSnapshot = await query
      .orderBy('createdAt', 'desc')
      .get()

    const prescriptions = []
    prescriptionsSnapshot.forEach(doc => {
      prescriptions.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
      })
    })

    res.json({
      success: true,
      data: prescriptions,
      count: prescriptions.length,
      patient: {
        id: patientDoc.id,
        name: patientDoc.data().name,
        token: patientDoc.data().token
      }
    })
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient prescriptions'
    })
  }
})

// Create new prescription (Doctor only)
router.post('/', requireRole('doctor'), async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      medications,
      notes
    } = req.body

    // Validation
    if (!patientId || !medications || !Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and medications are required'
      })
    }

    // Verify patient exists
    const patientDoc = await firestore.collection('patients').doc(patientId).get()
    if (!patientDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      })
    }

    // Validate medications
    for (const med of medications) {
      if (!med.name || !med.dosage || !med.frequency || !med.duration) {
        return res.status(400).json({
          success: false,
          message: 'Each medication must have name, dosage, frequency, and duration'
        })
      }
    }

    const prescriptionData = {
      patientId,
      patientName: patientName || patientDoc.data().name,
      doctorId: req.user.uid,
      doctorName: req.user.name,
      medications: medications.map(med => ({
        name: med.name.trim(),
        dosage: med.dosage.trim(),
        frequency: med.frequency.trim(),
        duration: med.duration.trim()
      })),
      notes: notes?.trim() || '',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const docRef = await firestore.collection('prescriptions').add(prescriptionData)

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: {
        id: docRef.id,
        ...prescriptionData
      }
    })
  } catch (error) {
    console.error('Error creating prescription:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create prescription'
    })
  }
})

// Update prescription (Doctor only, own prescriptions)
router.put('/:id', requireRole('doctor'), async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const prescriptionRef = firestore.collection('prescriptions').doc(id)
    const prescriptionDoc = await prescriptionRef.get()

    if (!prescriptionDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      })
    }

    // Check if doctor owns this prescription
    if (prescriptionDoc.data().doctorId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own prescriptions'
      })
    }

    // Remove fields that shouldn't be updated
    delete updates.id
    delete updates.patientId
    delete updates.doctorId
    delete updates.createdAt

    // Add updated timestamp
    updates.updatedAt = new Date()

    // Validate medications if provided
    if (updates.medications) {
      if (!Array.isArray(updates.medications) || updates.medications.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Medications must be a non-empty array'
        })
      }

      for (const med of updates.medications) {
        if (!med.name || !med.dosage || !med.frequency || !med.duration) {
          return res.status(400).json({
            success: false,
            message: 'Each medication must have name, dosage, frequency, and duration'
          })
        }
      }

      updates.medications = updates.medications.map(med => ({
        name: med.name.trim(),
        dosage: med.dosage.trim(),
        frequency: med.frequency.trim(),
        duration: med.duration.trim()
      }))
    }

    await prescriptionRef.update(updates)

    const updatedDoc = await prescriptionRef.get()
    const updatedData = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data().createdAt?.toDate?.() || updatedDoc.data().createdAt
    }

    res.json({
      success: true,
      message: 'Prescription updated successfully',
      data: updatedData
    })
  } catch (error) {
    console.error('Error updating prescription:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update prescription'
    })
  }
})

// Delete prescription (Doctor only, own prescriptions)
router.delete('/:id', requireRole('doctor'), async (req, res) => {
  try {
    const { id } = req.params

    const prescriptionRef = firestore.collection('prescriptions').doc(id)
    const prescriptionDoc = await prescriptionRef.get()

    if (!prescriptionDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      })
    }

    // Check if doctor owns this prescription
    if (prescriptionDoc.data().doctorId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own prescriptions'
      })
    }

    await prescriptionRef.delete()

    res.json({
      success: true,
      message: 'Prescription deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting prescription:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete prescription'
    })
  }
})

export default router