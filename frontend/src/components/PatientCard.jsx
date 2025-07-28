import React from 'react'

const PatientCard = ({ 
  patient, 
  prescriptions = [], 
  bills = [], 
  onAddPrescription, 
  onCreateBill, 
  onUpdateBillStatus,
  showActions = false, 
  showBilling = false 
}) => {
  const formatDate = (date) => {
    if (!date) return 'N/A'
    const d = date.toDate ? date.toDate() : new Date(date)
    return d.toLocaleDateString()
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
    const dob = dateOfBirth.toDate ? dateOfBirth.toDate() : new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    return age
  }

  const getTotalBillAmount = () => {
    return bills.reduce((total, bill) => total + bill.totalAmount, 0)
  }

  const getPendingBillAmount = () => {
    return bills
      .filter(bill => bill.status === 'pending')
      .reduce((total, bill) => total + bill.totalAmount, 0)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
            <p className="text-sm text-gray-500">Token: {patient.token}</p>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Age:</span>
          <span className="text-gray-900">{calculateAge(patient.dateOfBirth)} years</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Phone:</span>
          <span className="text-gray-900">{patient.phone}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Email:</span>
          <span className="text-gray-900 truncate">{patient.email}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Registered:</span>
          <span className="text-gray-900">{formatDate(patient.createdAt)}</span>
        </div>
      </div>

      {/* Prescription Info for Doctor */}
      {showActions && (
        <div className="border-t pt-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Prescriptions</span>
            <span className="text-sm text-gray-500">{prescriptions.length} total</span>
          </div>
          {prescriptions.length > 0 && (
            <div className="text-xs text-gray-600">
              Last: {formatDate(prescriptions[0]?.createdAt)}
            </div>
          )}
        </div>
      )}

      {/* Billing Info for Receptionist */}
      {showBilling && (
        <div className="border-t pt-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Bills:</span>
              <p className="font-semibold text-gray-900">${getTotalBillAmount().toFixed(2)}</p>
            </div>
            <div>
              <span className="text-gray-500">Pending:</span>
              <p className="font-semibold text-red-600">${getPendingBillAmount().toFixed(2)}</p>
            </div>
          </div>
          {bills.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {bills.slice(0, 3).map((bill) => (
                  <span
                    key={bill.id}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      bill.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    ${bill.totalAmount.toFixed(2)} - {bill.status}
                  </span>
                ))}
                {bills.length > 3 && (
                  <span className="text-xs text-gray-500">+{bills.length - 3} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        {showActions && (
          <button
            onClick={() => onAddPrescription(patient)}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Prescription
          </button>
        )}

        {showBilling && (
          <>
            <button
              onClick={() => onCreateBill(patient)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200"
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Create Bill
            </button>
            {bills.some(bill => bill.status === 'pending') && (
              <button
                onClick={() => {
                  const pendingBill = bills.find(bill => bill.status === 'pending')
                  if (pendingBill) {
                    onUpdateBillStatus(pendingBill.id, 'paid')
                  }
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200"
              >
                Mark Paid
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PatientCard