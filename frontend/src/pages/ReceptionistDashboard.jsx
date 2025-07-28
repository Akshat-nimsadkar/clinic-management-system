import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { collection, query, getDocs, addDoc, orderBy, doc, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import Header from '../components/Header'
import PatientCard from '../components/PatientCard'
import PatientRegistrationModal from '../components/PatientRegistrationModal'
import BillingModal from '../components/BillingModal'

const ReceptionistDashboard = () => {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [showBillingModal, setShowBillingModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)

  useEffect(() => {
    fetchPatients()
    fetchBills()
  }, [])

  const fetchPatients = async () => {
    try {
      const patientsQuery = query(
        collection(db, 'patients'),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(patientsQuery)
      const patientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setPatients(patientsData)
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const fetchBills = async () => {
    try {
      const billsQuery = query(
        collection(db, 'bills'),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(billsQuery)
      const billsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setBills(billsData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching bills:', error)
      setLoading(false)
    }
  }

  const handleRegisterPatient = async (patientData) => {
    try {
      // Generate unique token
      const token = `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      await addDoc(collection(db, 'patients'), {
        ...patientData,
        token,
        createdAt: new Date(),
        registeredBy: user.uid
      })
      
      setShowRegistrationModal(false)
      fetchPatients()
    } catch (error) {
      console.error('Error registering patient:', error)
    }
  }

  const handleCreateBill = async (billData) => {
    try {
      await addDoc(collection(db, 'bills'), {
        ...billData,
        createdAt: new Date(),
        createdBy: user.uid,
        status: 'pending'
      })
      
      setShowBillingModal(false)
      setSelectedPatient(null)
      fetchBills()
    } catch (error) {
      console.error('Error creating bill:', error)
    }
  }

  const handleUpdateBillStatus = async (billId, status) => {
    try {
      await updateDoc(doc(db, 'bills', billId), {
        status,
        updatedAt: new Date()
      })
      fetchBills()
    } catch (error) {
      console.error('Error updating bill status:', error)
    }
  }

  const getPatientBills = (patientId) => {
    return bills.filter(b => b.patientId === patientId)
  }

  const getTotalRevenue = () => {
    return bills
      .filter(b => b.status === 'paid')
      .reduce((total, bill) => total + bill.totalAmount, 0)
  }

  const getPendingBills = () => {
    return bills.filter(b => b.status === 'pending').length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Receptionist Dashboard</h1>
              <p className="mt-2 text-gray-600">Welcome back, {user.name}</p>
            </div>
            <button
              onClick={() => setShowRegistrationModal(true)}
              className="btn-primary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Register Patient
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Patients</p>
                  <p className="text-2xl font-semibold text-gray-900">{patients.length}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">${getTotalRevenue().toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Bills</p>
                  <p className="text-2xl font-semibold text-gray-900">{getPendingBills()}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0v4a2 2 0 002 2h6a2 2 0 002-2v-4a2 2 0 00-2-2H10a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Today's Registrations</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {patients.filter(p => {
                      const today = new Date().toDateString()
                      const patientDate = p.createdAt?.toDate?.()?.toDateString?.() || ''
                      return patientDate === today
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Patients List */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Patient Management</h2>
            </div>

            {patients.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No patients</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by registering a new patient.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowRegistrationModal(true)}
                    className="btn-primary"
                  >
                    Register First Patient
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients.map(patient => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    bills={getPatientBills(patient.id)}
                    onCreateBill={() => {
                      setSelectedPatient(patient)
                      setShowBillingModal(true)
                    }}
                    onUpdateBillStatus={handleUpdateBillStatus}
                    showBilling={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient Registration Modal */}
      {showRegistrationModal && (
        <PatientRegistrationModal
          onClose={() => setShowRegistrationModal(false)}
          onSubmit={handleRegisterPatient}
        />
      )}

      {/* Billing Modal */}
      {showBillingModal && (
        <BillingModal
          patient={selectedPatient}
          onClose={() => {
            setShowBillingModal(false)
            setSelectedPatient(null)
          }}
          onSubmit={handleCreateBill}
        />
      )}
    </div>
  )
}

export default ReceptionistDashboard