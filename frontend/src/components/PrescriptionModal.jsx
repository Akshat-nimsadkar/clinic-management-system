import React, { useState } from 'react'

const PrescriptionModal = ({ patient, onClose, onSubmit }) => {
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '' }
  ])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }])
  }

  const removeMedication = (index) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const updateMedication = (index, field, value) => {
    const updated = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    )
    setMedications(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const prescriptionData = {
        patientId: patient.id,
        patientName: patient.name,
        medications: medications.filter(med => med.name.trim() !== ''),
        notes
      }

      await onSubmit(prescriptionData)
    } catch (error) {
      console.error('Error submitting prescription:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Add Prescription for {patient.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">Patient Information</label>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Name:</strong> {patient.name}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Token:</strong> {patient.token}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Phone:</strong> {patient.phone}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="form-label">Medications</label>
              <button
                type="button"
                onClick={addMedication}
                className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-md"
              >
                Add Medication
              </button>
            </div>

            <div className="space-y-4">
              {medications.map((medication, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Medication {index + 1}
                    </h4>
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Medicine Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., Paracetamol"
                        value={medication.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Dosage</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., 500mg"
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Frequency</label>
                      <select
                        className="form-input"
                        value={medication.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        required
                      >
                        <option value="">Select frequency</option>
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Three times daily">Three times daily</option>
                        <option value="Four times daily">Four times daily</option>
                        <option value="As needed">As needed</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Duration</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., 7 days"
                        value={medication.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Additional Notes</label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="Any additional instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                'Add Prescription'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PrescriptionModal