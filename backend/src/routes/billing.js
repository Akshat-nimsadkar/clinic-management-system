import express from 'express'
import { firestore } from '../config/firebase.js'
import { requireRole } from '../middleware/auth.js'

const router = express.Router()

// Get all bills (with optional patient filter)
router.get('/', async (req, res) => {
  try {
    const { patientId, status } = req.query
    let query = firestore.collection('bills')

    // Filter by patient if specified
    if (patientId) {
      query = query.where('patientId', '==', patientId)
    }

    // Filter by status if specified
    if (status && ['pending', 'paid'].includes(status)) {
      query = query.where('status', '==', status)
    }

    const billsSnapshot = await query
      .orderBy('createdAt', 'desc')
      .get()

    const bills = []
    billsSnapshot.forEach(doc => {
      bills.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
      })
    })

    res.json({
      success: true,
      data: bills,
      count: bills.length
    })
  } catch (error) {
    console.error('Error fetching bills:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills'
    })
  }
})

// Get bill by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const billDoc = await firestore.collection('bills').doc(id).get()

    if (!billDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      })
    }

    const billData = {
      id: billDoc.id,
      ...billDoc.data(),
      createdAt: billDoc.data().createdAt?.toDate?.() || billDoc.data().createdAt,
      updatedAt: billDoc.data().updatedAt?.toDate?.() || billDoc.data().updatedAt
    }

    res.json({
      success: true,
      data: billData
    })
  } catch (error) {
    console.error('Error fetching bill:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bill'
    })
  }
})

// Get bills for a specific patient
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

    const billsSnapshot = await firestore
      .collection('bills')
      .where('patientId', '==', patientId)
      .orderBy('createdAt', 'desc')
      .get()

    const bills = []
    billsSnapshot.forEach(doc => {
      bills.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
      })
    })

    // Calculate totals
    const totalAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0)
    const paidAmount = bills
      .filter(bill => bill.status === 'paid')
      .reduce((sum, bill) => sum + bill.totalAmount, 0)
    const pendingAmount = bills
      .filter(bill => bill.status === 'pending')
      .reduce((sum, bill) => sum + bill.totalAmount, 0)

    res.json({
      success: true,
      data: bills,
      count: bills.length,
      summary: {
        totalAmount,
        paidAmount,
        pendingAmount
      },
      patient: {
        id: patientDoc.id,
        name: patientDoc.data().name,
        token: patientDoc.data().token
      }
    })
  } catch (error) {
    console.error('Error fetching patient bills:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient bills'
    })
  }
})

// Create new bill (Receptionist only)
router.post('/', requireRole('receptionist'), async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      items,
      totalAmount
    } = req.body

    // Validation
    if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and items are required'
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

    // Validate items
    for (const item of items) {
      if (!item.description || typeof item.amount !== 'number' || item.amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have a description and positive amount'
        })
      }
    }

    // Calculate total amount
    const calculatedTotal = items.reduce((sum, item) => sum + item.amount, 0)
    
    if (totalAmount && Math.abs(totalAmount - calculatedTotal) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Total amount does not match sum of items'
      })
    }

    const billData = {
      patientId,
      patientName: patientName || patientDoc.data().name,
      items: items.map(item => ({
        description: item.description.trim(),
        amount: parseFloat(item.amount.toFixed(2))
      })),
      totalAmount: parseFloat(calculatedTotal.toFixed(2)),
      status: 'pending',
      createdBy: req.user.uid,
      createdByName: req.user.name,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const docRef = await firestore.collection('bills').add(billData)

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: {
        id: docRef.id,
        ...billData
      }
    })
  } catch (error) {
    console.error('Error creating bill:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create bill'
    })
  }
})

// Update bill status (Receptionist only)
router.put('/:id/status', requireRole('receptionist'), async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !['pending', 'paid'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "pending" or "paid"'
      })
    }

    const billRef = firestore.collection('bills').doc(id)
    const billDoc = await billRef.get()

    if (!billDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      })
    }

    const updateData = {
      status,
      updatedAt: new Date(),
      updatedBy: req.user.uid,
      updatedByName: req.user.name
    }

    // Add payment date if marking as paid
    if (status === 'paid' && billDoc.data().status !== 'paid') {
      updateData.paidAt = new Date()
    }

    await billRef.update(updateData)

    const updatedDoc = await billRef.get()
    const updatedData = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data().createdAt?.toDate?.() || updatedDoc.data().createdAt,
      updatedAt: updatedDoc.data().updatedAt?.toDate?.() || updatedDoc.data().updatedAt,
      paidAt: updatedDoc.data().paidAt?.toDate?.() || updatedDoc.data().paidAt
    }

    res.json({
      success: true,
      message: `Bill marked as ${status} successfully`,
      data: updatedData
    })
  } catch (error) {
    console.error('Error updating bill status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update bill status'
    })
  }
})

// Update bill details (Receptionist only)
router.put('/:id', requireRole('receptionist'), async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const billRef = firestore.collection('bills').doc(id)
    const billDoc = await billRef.get()

    if (!billDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      })
    }

    // Don't allow updating paid bills
    if (billDoc.data().status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update paid bills'
      })
    }

    // Remove fields that shouldn't be updated
    delete updates.id
    delete updates.patientId
    delete updates.createdAt
    delete updates.createdBy
    delete updates.createdByName

    // Validate items if provided
    if (updates.items) {
      if (!Array.isArray(updates.items) || updates.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Items must be a non-empty array'
        })
      }

      for (const item of updates.items) {
        if (!item.description || typeof item.amount !== 'number' || item.amount <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Each item must have a description and positive amount'
          })
        }
      }

      updates.items = updates.items.map(item => ({
        description: item.description.trim(),
        amount: parseFloat(item.amount.toFixed(2))
      }))

      // Recalculate total amount
      updates.totalAmount = parseFloat(
        updates.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)
      )
    }

    // Add updated timestamp and user info
    updates.updatedAt = new Date()
    updates.updatedBy = req.user.uid
    updates.updatedByName = req.user.name

    await billRef.update(updates)

    const updatedDoc = await billRef.get()
    const updatedData = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data().createdAt?.toDate?.() || updatedDoc.data().createdAt,
      updatedAt: updatedDoc.data().updatedAt?.toDate?.() || updatedDoc.data().updatedAt
    }

    res.json({
      success: true,
      message: 'Bill updated successfully',
      data: updatedData
    })
  } catch (error) {
    console.error('Error updating bill:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update bill'
    })
  }
})

// Delete bill (Receptionist only, pending bills only)
router.delete('/:id', requireRole('receptionist'), async (req, res) => {
  try {
    const { id } = req.params

    const billRef = firestore.collection('bills').doc(id)
    const billDoc = await billRef.get()

    if (!billDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      })
    }

    // Don't allow deleting paid bills
    if (billDoc.data().status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete paid bills'
      })
    }

    await billRef.delete()

    res.json({
      success: true,
      message: 'Bill deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting bill:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete bill'
    })
  }
})

// Get billing statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const billsSnapshot = await firestore.collection('bills').get()

    let totalRevenue = 0
    let pendingAmount = 0
    let totalBills = 0
    let paidBills = 0
    let pendingBills = 0

    billsSnapshot.forEach(doc => {
      const bill = doc.data()
      totalBills++
      
      if (bill.status === 'paid') {
        totalRevenue += bill.totalAmount
        paidBills++
      } else {
        pendingAmount += bill.totalAmount
        pendingBills++
      }
    })

    res.json({
      success: true,
      data: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        pendingAmount: parseFloat(pendingAmount.toFixed(2)),
        totalBills,
        paidBills,
        pendingBills,
        averageBillAmount: totalBills > 0 ? parseFloat(((totalRevenue + pendingAmount) / totalBills).toFixed(2)) : 0
      }
    })
  } catch (error) {
    console.error('Error fetching billing stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch billing statistics'
    })
  }
})

export default router