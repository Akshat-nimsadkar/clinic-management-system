import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore'
import { db } from '../services/firebase'
import Header from '../components/Header'
import PatientCard from '../components/PatientCard'
import PrescriptionModal from '../components/PrescriptionModal'

const DoctorDashboard = () => {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)

  useEffect(() => {
    fetchPatients()
    fetchPrescriptions()
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

  const fetchPrescriptions = async () => {
    try {
      const prescriptionsQuery = query(
        collection(db, 'prescriptions'),
        where('doctorId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(prescriptionsQuery)
      const prescriptionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setPrescriptions(prescriptionsData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
      setLoading(false)
    }
  }

  const handleAddPrescription = async (prescriptionData) => {
    try {
      await addDoc(collection(db, 'prescriptions'), {
        ...prescriptionData,
        doctorId: user.uid,
        doctorName: user.name,
        createdAt: new Date()
      })
      setShowPrescriptionModal(false)
      setSelectedPatient(null)
      fetchPrescriptions()
    } catch (error) {
      console.error('Error adding prescription:', error)
    }
  }

  const getPatientPrescriptions = (patientId) => {
    return prescriptions.filter(p => p.patientId === patientId)
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back, Dr. {user.name}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Prescriptions</p>
                  <p className="text-2xl font-semibold text-gray-900">{prescriptions.length}</p>
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
                  <p className="text-sm font-medium text-gray-500">Today's Patients</p>
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
              <h2 className="text-xl font-semibold text-gray-900">Patient List</h2>
            </div>

            {patients.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No patients</h3>
                <p className="mt-1 text-sm text-gray-500">No patients have been registered yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients.map(patient => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    prescriptions={getPatientPrescriptions(patient.id)}
                    onAddPrescription={() => {
                      setSelectedPatient(patient)
                      setShowPrescriptionModal(true)
                    }}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <PrescriptionModal
          patient={selectedPatient}
          onClose={() => {
            setShowPrescriptionModal(false)
            setSelectedPatient(null)
          }}
          onSubmit={handleAddPrescription}
        />
      )}
    </div>
  )
}

export default DoctorDashboard