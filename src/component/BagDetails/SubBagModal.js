import React, { useState, useEffect } from 'react'
import { Input } from '@material-tailwind/react'
import { FaTimes, FaCheck } from 'react-icons/fa'
import { buildApiUrl } from '../../config/api'
import { toast } from 'react-toastify'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import { useSelector } from 'react-redux'

const SubBagModal = ({ isOpen, onClose, bagData }) => {
  const { user } = useSelector((state) => state.auth)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdBagNumber, setCreatedBagNumber] = useState('')

  // Form states
  const [oldBagAwb, setOldBagAwb] = useState('')
  const [newBagAwb, setNewBagAwb] = useState('')
  const [transferLocation, setTransferLocation] = useState('')
  const [selectedPackages, setSelectedPackages] = useState([])
  const [sourceAddress, setSourceAddress] = useState({})
  const [destinationAddress, setDestinationAddress] = useState({
    consignee_name: '',
    phone: '',
    email: '',
    co_name: '',
    address_line: '',
    pincode: '',
    city: '',
    state: '',
    country: 'India',
  })

  // Generate new bag AWB
  const generateBagNumber = () => {
    const today = new Date()
    const day = today.getDate().toString().padStart(2, '0')
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const year = today.getFullYear().toString()
    const currentDate = `${day}${month}${year}`

    try {
      const stored = JSON.parse(localStorage.getItem('subBagCounter') || '{}')
      let counter = 0
      if (stored?.date === currentDate && Number.isInteger(stored?.counter)) {
        counter = stored.counter + 1
      } else {
        counter = 1
      }
      localStorage.setItem('subBagCounter', JSON.stringify({ date: currentDate, counter }))
      const bagNum = counter.toString().padStart(4, '0')
      return `${currentDate}${bagNum}`
    } catch (e) {
      const bagNum = '0001'
      return `${currentDate}${bagNum}`
    }
  }

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && bagData) {
      setOldBagAwb(bagData?.awb_no || bagData?.awb || '')
      setNewBagAwb(generateBagNumber())
      setTransferLocation('')
      setSelectedPackages([])
      
      // Set source address from user data
      setSourceAddress({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        address_line: user?.address?.addressLine1 || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        pincode: user?.address?.pincode || '',
        country: user?.address?.country || 'India',
      })

      // Set destination address from bag data
      setDestinationAddress({
        consignee_name: bagData?.destination_name || '',
        phone: '',
        email: '',
        co_name: '',
        address_line: bagData?.destination_address_li || '',
        pincode: bagData?.destination_pincode || '',
        city: bagData?.destination_city || '',
        state: bagData?.destination_state || '',
        country: 'India',
      })
    }
  }, [isOpen, bagData, user])

  // Handle package selection
  const handlePackageToggle = (awbNumber) => {
    setSelectedPackages(prev => {
      if (prev.includes(awbNumber)) {
        return prev.filter(awb => awb !== awbNumber)
      } else {
        return [...prev, awbNumber]
      }
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validation
    const missing = []
    if (!oldBagAwb) missing.push('Old Bag AWB')
    if (!newBagAwb) missing.push('New Bag AWB')
    if (!transferLocation) missing.push('Transfer Location')
    if (selectedPackages.length === 0) missing.push('At least one package')
    if (!destinationAddress?.consignee_name) missing.push('Receiver Name')
    if (!destinationAddress?.phone) missing.push('Receiver Phone')
    if (!destinationAddress?.address_line) missing.push('Receiver Address')
    if (!destinationAddress?.city) missing.push('Receiver City')
    if (!destinationAddress?.state) missing.push('Receiver State')
    if (!destinationAddress?.pincode) missing.push('Receiver Pincode')

    if (missing.length) {
      toast.error(`Missing: ${missing.join(', ')}`)
      setIsSubmitting(false)
      return
    }

    try {
      // Prepare update bag data
      const updateBagData = {
        old_bag_awb: oldBagAwb,
        new_bag_awb: newBagAwb,
        package_awb_numbers: selectedPackages,
        source_address_id: user?.id,
        destination_address_id: destinationAddress,
        transfer_location: transferLocation,
        staff_id: user?.id
      }

      console.log('Submitting update bag data:', updateBagData)

      // Call the update bag API
      const response = await axios.post(
        buildApiUrl('/api/bags/updateBag'),
        updateBagData
      )

      if (response.data.success) {
        setShowSuccess(true)
        setCreatedBagNumber(newBagAwb)
        toast.success(response.data.message || 'Sub-bag created successfully!')
        
        setTimeout(() => {
          setShowSuccess(false)
          onClose()
          // Optionally refresh the page or update the parent component
          window.location.reload()
        }, 1500)
      } else {
        toast.error(response.data.message || 'Failed to create sub-bag')
      }
    } catch (error) {
      console.error('Error creating sub-bag:', error)
      toast.error(error.response?.data?.message || 'Failed to create sub-bag')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-xl w-[95%] max-w-5xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold">Create Sub-Bag</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Bag Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-4">Bag Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Old AWB Number"
                    value={oldBagAwb}
                    onChange={(e) => setOldBagAwb(e.target.value)}
                    placeholder="Enter old bag AWB"
                    required
                    disabled
                  />
                  <Input
                    label="New AWB Number"
                    value={newBagAwb}
                    disabled
                    onChange={(e) => setNewBagAwb(e.target.value)}
                    placeholder="Enter new bag AWB"
                    required
                  />
                  <Input
                    label="Transfer Location"
                    value={transferLocation}
                    onChange={(e) => setTransferLocation(e.target.value)}
                    placeholder="Enter transfer location"
                    required
                  />
                </div>
              </div>

              {/* Source Address */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-4">Source Address (User Address)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    label="Name"
                    value={sourceAddress.name}
                    disabled
                    placeholder="User name"
                  />
                  <Input
                    label="Phone"
                    value={sourceAddress.phone}
                    disabled
                    placeholder="User phone"
                  />
                  <Input
                    label="Email"
                    value={sourceAddress.email}
                    disabled
                    placeholder="User email"
                  />
                  <Input
                    label="Address"
                    value={sourceAddress.address_line}
                    disabled
                    placeholder="User address"
                  />
                  <Input
                    label="City"
                    value={sourceAddress.city}
                    disabled
                    placeholder="User city"
                  />
                  <Input
                    label="State"
                    value={sourceAddress.state}
                    disabled
                    placeholder="User state"
                  />
                  <Input
                    label="Pincode"
                    value={sourceAddress.pincode}
                    disabled
                    placeholder="User pincode"
                  />
                  <Input
                    label="Country"
                    value={sourceAddress.country}
                    disabled
                    placeholder="User country"
                  />
                </div>
              </div>

              {/* Package Selection */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-4">Select Packages to Transfer</h4>
                {bagData?.package_awb_nos && bagData.package_awb_nos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
                    {bagData.package_awb_nos.map((awb, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPackages.includes(awb)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => handlePackageToggle(awb)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm">{awb}</span>
                          <div className="flex items-center">
                            {selectedPackages.includes(awb) && (
                              <FaCheck className="text-red-600 text-sm" />
                            )}
                            <input
                              type="checkbox"
                              checked={selectedPackages.includes(awb)}
                              onChange={() => handlePackageToggle(awb)}
                              className="h-4 w-4 text-red-600 ml-2"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No packages available</p>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {selectedPackages.length} packages
                </p>
              </div>

              {/* Destination Address */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-4">Destination Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    label="Name"
                    value={destinationAddress.consignee_name}
                    onChange={(e) => setDestinationAddress({ ...destinationAddress, consignee_name: e.target.value })}
                    placeholder="Enter receiver name"
                    required
                  />
                  <Input
                    label="Mobile"
                    value={destinationAddress.phone}
                    onChange={(e) => setDestinationAddress({ ...destinationAddress, phone: e.target.value })}
                    placeholder="Enter mobile number"
                    required
                  />
                  <Input
                    label="Email"
                    value={destinationAddress.email}
                    onChange={(e) => setDestinationAddress({ ...destinationAddress, email: e.target.value })}
                    placeholder="Enter email"
                  />
                  <Input
                    label="Company Name"
                    value={destinationAddress.co_name}
                    onChange={(e) => setDestinationAddress({ ...destinationAddress, co_name: e.target.value })}
                    placeholder="Enter company name"
                  />
                  <Input
                    label="Address"
                    value={destinationAddress.address_line}
                    onChange={(e) => setDestinationAddress({ ...destinationAddress, address_line: e.target.value })}
                    placeholder="Enter address"
                    required
                  />
                  <Input
                    label="City"
                    value={destinationAddress.city}
                    onChange={(e) => setDestinationAddress({ ...destinationAddress, city: e.target.value })}
                    placeholder="Enter city"
                    required
                  />
                  <Input
                    label="State"
                    value={destinationAddress.state}
                    onChange={(e) => setDestinationAddress({ ...destinationAddress, state: e.target.value })}
                    placeholder="Enter state"
                    required
                  />
                  <Input
                    label="Pincode"
                    value={destinationAddress.pincode}
                    onChange={(e) => setDestinationAddress({ ...destinationAddress, pincode: e.target.value })}
                    placeholder="Enter pincode"
                    required
                  />
                  <Input
                    label="Country"
                    value={destinationAddress.country}
                    onChange={(e) => setDestinationAddress({ ...destinationAddress, country: e.target.value })}
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md text-white ${
                  isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Sub-Bag'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-16 h-16 text-green-500 animate-bounce" />
            </div>
            <h3 className="text-xl font-semibold mb-1">Sub-Bag Created</h3>
            <p className="text-gray-600 text-sm mb-2">Bag Number: {createdBagNumber}</p>
            <p className="text-gray-500 text-xs">Redirecting...</p>
          </div>
        </div>
      )}
    </>
  )
}

export default SubBagModal
