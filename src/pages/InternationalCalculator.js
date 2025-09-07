import React, { useState, useEffect } from 'react'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import { useSelector } from 'react-redux'
import { Input, Select, Option } from '@material-tailwind/react'
import { 
  TruckIcon, 
  ClockIcon, 
  BanknotesIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline'

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000, prefix = "₹" }) => {
  const [currentValue, setCurrentValue] = useState(0)

  useEffect(() => {
    let startTime = null
    const startValue = 0
    const endValue = value

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const current = startValue + (endValue - startValue) * easeOutQuart
      
      setCurrentValue(Math.floor(current))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <span className="font-bold text-2xl">
      {prefix}{currentValue.toLocaleString()}
    </span>
  )
}

// Rate Card Component
const RateCard = ({ title, price, icon: Icon, delay = 0, isHighlighted = false }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div 
      className={`
        transform transition-all duration-700 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
        ${isHighlighted 
          ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-2xl scale-105 border-2 border-red-300' 
          : 'bg-white text-gray-800 shadow-lg hover:shadow-xl border border-gray-200'
        }
        rounded-xl p-6 hover:scale-105 transition-transform duration-300 cursor-pointer
        relative overflow-hidden
      `}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-black to-transparent rounded-full transform rotate-45"></div>
      </div>
      
      {/* Icon */}
      <div className={`
        inline-flex items-center justify-center w-12 h-12 rounded-full mb-4
        ${isHighlighted ? 'bg-white bg-opacity-20' : 'bg-gray-100'}
      `}>
        <Icon className={`w-6 h-6 ${isHighlighted ? 'text-white' : 'text-red-500'}`} />
      </div>

      {/* Title */}
      <h3 className={`
        text-sm font-medium uppercase tracking-wide mb-2
        ${isHighlighted ? 'text-white text-opacity-90' : 'text-gray-600'}
      `}>
        {title}
      </h3>

      {/* Price */}
      <div className={`
        ${isHighlighted ? 'text-white' : 'text-black'}
        mb-2
      `}>
        {isVisible && <AnimatedCounter value={price} duration={1500} />}
      </div>

      {/* Badge */}
      {isHighlighted && (
        <div className="absolute top-3 right-3">
          <div className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full font-medium">
            RECOMMENDED
          </div>
        </div>
      )}

      {/* Bottom accent */}
      <div className={`
        absolute bottom-0 left-0 right-0 h-1 
        ${isHighlighted ? 'bg-white bg-opacity-30' : 'bg-gradient-to-r from-red-500 to-black'}
      `}></div>
    </div>
  )
}

const InternationalCalculator = () => {
  const { user } = useSelector((state) => state.auth)
  
  // Form state management
  const [bookingBranch, setBookingBranch] = useState('')
  const [customerType, setCustomerType] = useState('CP')
  const [productType, setProductType] = useState('')
  const [shipmentType, setShipmentType] = useState('')
  const [destination, setDestination] = useState('')
  const [destinationPincode, setDestinationPincode] = useState('')
  const [weight, setWeight] = useState('')
  const [length, setLength] = useState('')
  const [breadth, setBreadth] = useState('')
  const [height, setHeight] = useState('')
  const [serviceType, setServiceType] = useState('')
  
  // Additional options state
  const [codOption, setCodOption] = useState(false)
  const [insuranceOption, setInsuranceOption] = useState(false)
  const [fragileHandling, setFragileHandling] = useState(false)

  // Set user location as booking branch on component mount
  useEffect(() => {
    if (user?.city) {
      setBookingBranch(user.city)
    } else if (user?.address) {
      setBookingBranch(user.address)
    } else {
      setBookingBranch('Mumbai') // Default fallback
    }
  }, [user])
  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1'>
        <Topbar />
        <div className='p-6 max-w-[1200px] mx-auto'>
          {/* Header */}
          <div className='bg-white rounded-lg shadow p-6 mb-6'>
            <h1 className='text-2xl font-semibold text-gray-900 mb-2'>International Rate Calculator</h1>
            <p className='text-gray-600'>Calculate shipping rates for international deliveries</p>
          </div>

          {/* Calculator Form */}
          <div className='bg-white rounded-lg shadow p-6'>
            {/* Basic Information */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
              {/* Booking Branch */}
              <div>
                <Input 
                  label="Booking Branch *"
                  value={bookingBranch}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              {/* Customer Type */}
              <div>
                <Select 
                  label="Customer Type *"
                  value={customerType}
                  onChange={(val) => setCustomerType(val)}
                >
                  <Option value="CP">CP</Option>
                </Select>
              </div>

              {/* Product Type */}
              <div>
                <Select 
                  label="Product Type *"
                  value={productType}
                  onChange={(val) => setProductType(val)}
                >
                  <Option value="Box">Box</Option>
                  <Option value="Parcel">Parcel</Option>
                </Select>
              </div>
            </div>

            {/* Shipment Information */}
            <div className='mb-8'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>Shipment Information</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Shipment Type */}
                <div>
                  <Select 
                    label="Shipment Type *"
                    value={shipmentType}
                    onChange={(val) => setShipmentType(val)}
                  >
                    <Option value="Commercial">Commercial</Option>
                    <Option value="Document">Document</Option>
                    <Option value="Gift">Gift</Option>
                    <Option value="Residential">Residential</Option>
                    <Option value="Sample">Sample</Option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Destination Details */}
            <div className='mb-8'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>Destination Details</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <Select 
                    label="Destination *"
                    value={destination}
                    onChange={(val) => setDestination(val)}
                  >
                    <Option value="US">United States</Option>
                    <Option value="UK">United Kingdom</Option>
                    <Option value="CA">Canada</Option>
                    <Option value="AU">Australia</Option>
                    <Option value="DE">Germany</Option>
                    <Option value="FR">France</Option>
                    <Option value="JP">Japan</Option>
                    <Option value="SG">Singapore</Option>
                    <Option value="AE">UAE</Option>
                    <Option value="NL">Netherlands</Option>
                  </Select>
                </div>

                <div>
                  <Input 
                    label="Destination Pincode *"
                    value={destinationPincode}
                    onChange={(e) => setDestinationPincode(e.target.value)}
                    placeholder="Enter destination pincode"
                  />
                </div>
              </div>
            </div>

            {/* Package Dimensions */}
            <div className='mb-8'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>Package Dimensions</h3>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <div>
                  <Input 
                    type="number"
                    label="Weight (kg) *"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Input 
                    type="number"
                    label="Length (cm) *"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Input 
                    type="number"
                    label="Breadth (cm) *"
                    value={breadth}
                    onChange={(e) => setBreadth(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Input 
                    type="number"
                    label="Height (cm) *"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Service Type */}
            <div className='mb-8'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>Service Type</h3>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <label className='flex items-center cursor-pointer'>
                  <input 
                    type="radio" 
                    name="serviceType" 
                    value="Same Day"
                    checked={serviceType === "Same Day"}
                    onChange={(e) => setServiceType(e.target.value)}
                    className='mr-3 w-4 h-4 text-blue-600'
                  />
                  <span className='text-gray-700'>Same Day</span>
                </label>
                <label className='flex items-center cursor-pointer'>
                  <input 
                    type="radio" 
                    name="serviceType" 
                    value="Next Day"
                    checked={serviceType === "Next Day"}
                    onChange={(e) => setServiceType(e.target.value)}
                    className='mr-3 w-4 h-4 text-blue-600'
                  />
                  <span className='text-gray-700'>Next Day</span>
                </label>
                <label className='flex items-center cursor-pointer'>
                  <input 
                    type="radio" 
                    name="serviceType" 
                    value="Standard (2-3 days)"
                    checked={serviceType === "Standard (2-3 days)"}
                    onChange={(e) => setServiceType(e.target.value)}
                    className='mr-3 w-4 h-4 text-blue-600'
                  />
                  <span className='text-gray-700'>Standard (2-3 days)</span>
                </label>
                <label className='flex items-center cursor-pointer'>
                  <input 
                    type="radio" 
                    name="serviceType" 
                    value="Economy (4-7 days)"
                    checked={serviceType === "Economy (4-7 days)"}
                    onChange={(e) => setServiceType(e.target.value)}
                    className='mr-3 w-4 h-4 text-blue-600'
                  />
                  <span className='text-gray-700'>Economy (4-7 days)</span>
                </label>
              </div>
            </div>

            {/* Additional Options */}
            <div className='mb-8'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>Additional Options</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <label className='flex items-center cursor-pointer'>
                  <input 
                    type="checkbox" 
                    checked={codOption}
                    onChange={(e) => setCodOption(e.target.checked)}
                    className='mr-3 w-4 h-4 text-blue-600'
                  />
                  <span className='text-gray-700'>COD (Cash on Delivery)</span>
                </label>
                <label className='flex items-center cursor-pointer'>
                  <input 
                    type="checkbox" 
                    checked={insuranceOption}
                    onChange={(e) => setInsuranceOption(e.target.checked)}
                    className='mr-3 w-4 h-4 text-blue-600'
                  />
                  <span className='text-gray-700'>Insurance</span>
                </label>
                <label className='flex items-center cursor-pointer'>
                  <input 
                    type="checkbox" 
                    checked={fragileHandling}
                    onChange={(e) => setFragileHandling(e.target.checked)}
                    className='mr-3 w-4 h-4 text-blue-600'
                  />
                  <span className='text-gray-700'>Fragile Handling</span>
                </label>
              </div>
            </div>

            {/* Calculate Button */}
            <div className='mt-8 flex justify-center'>
              <button className='bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors'>
                Calculate Rate
              </button>
            </div>

            {/* Results Section */}
            <div className='mt-12 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200'>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-black rounded-full mb-4">
                  <SparklesIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-2'>Rate Calculation Results</h3>
                <p className='text-gray-600'>Choose the best shipping option for your needs</p>
              </div>
              
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
                <RateCard
                  title="Express Rate"
                  price={2500}
                  icon={TruckIcon}
                  delay={200}
                  isHighlighted={false}
                />
                <RateCard
                  title="Standard Rate"
                  price={1800}
                  icon={ClockIcon}
                  delay={400}
                  isHighlighted={true}
                />
                <RateCard
                  title="Economy Rate"
                  price={1200}
                  icon={BanknotesIcon}
                  delay={600}
                  isHighlighted={false}
                />
              </div>

              {/* Additional Info */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <h4 className="font-semibold text-gray-900">Estimated Transit Time</h4>
                  </div>
                  <p className="text-gray-600">3-5 Business Days</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <h4 className="font-semibold text-gray-900">Service Guarantee</h4>
                  </div>
                  <p className="text-gray-600">100% Safe & Secure Delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InternationalCalculator
