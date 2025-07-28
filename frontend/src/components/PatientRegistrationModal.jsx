import React, { useState } from 'react'

const PatientRegistrationModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    emergencyContact: '',
    medicalHistory: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const patientData = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth)
      }

      await onSubmit(patientData)
    } catch (error) {
      console.error('Error registering patient:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Register New Patient
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter patient's full name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                className={`form-input ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
            </div>
          </div>

          <div>
            <label className="form-label">Address *</label>
            <textarea
              name="address"
              className={`form-input ${errors.address ? 'border-red-500' : ''}`}
              rows="2"
              placeholder="Enter complete address"
              value={formData.address}
              onChange={handleChange}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="form-label">Emergency Contact</label>
            <input
              type="text"
              name="emergencyContact"
              className="form-input"
              placeholder="Emergency contact name and phone"
              value={formData.emergencyContact}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="form-label">Medical History</label>
            <textarea
              name="medicalHistory"
              className="form-input"
              rows="3"
              placeholder="Any relevant medical history, allergies, or conditions..."
              value={formData.medicalHistory}
              onChange={handleChange}
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
                  Registering...
                </div>
              ) : (
                'Register Patient'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PatientRegistrationModal