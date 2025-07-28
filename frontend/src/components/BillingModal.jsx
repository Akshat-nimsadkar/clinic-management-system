import React, { useState } from 'react'

const BillingModal = ({ patient, onClose, onSubmit }) => {
  const [items, setItems] = useState([
    { description: '', amount: 0 }
  ])
  const [loading, setLoading] = useState(false)

  const addItem = () => {
    setItems([...items, { description: '', amount: 0 }])
  }

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) => 
      i === index ? { ...item, [field]: field === 'amount' ? parseFloat(value) || 0 : value } : item
    )
    setItems(updated)
  }

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + item.amount, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const billData = {
        patientId: patient.id,
        patientName: patient.name,
        items: items.filter(item => item.description.trim() !== '' && item.amount > 0),
        totalAmount: getTotalAmount()
      }

      await onSubmit(billData)
    } catch (error) {
      console.error('Error creating bill:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Create Bill for {patient.name}
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
              <label className="form-label">Bill Items</label>
              <button
                type="button"
                onClick={addItem}
                className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-md"
              >
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Item {index + 1}
                    </h4>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="form-label">Description</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., Consultation Fee, Medicine, Lab Test"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-input"
                        placeholder="0.00"
                        value={item.amount || ''}
                        onChange={(e) => updateItem(index, 'amount', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
              <span className="text-2xl font-bold text-primary-600">
                ${getTotalAmount().toFixed(2)}
              </span>
            </div>
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
              disabled={loading || getTotalAmount() === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Bill'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BillingModal