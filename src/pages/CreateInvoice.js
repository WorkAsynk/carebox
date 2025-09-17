import React, { useState, useEffect } from 'react'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import { useSelector } from 'react-redux'
import { Input, Select, Option, Textarea } from '@material-tailwind/react'
import { 
  DocumentPlusIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'
import { buildApiUrl, API_ENDPOINTS } from '../config/api'

// PDF generation libraries (install with: npm install html2canvas jspdf)
// import html2canvas from 'html2canvas'
// import { jsPDF } from 'jspdf'

// Fallback for when libraries are not installed
const html2canvas = window.html2canvas || (() => Promise.reject('html2canvas not installed'))
const jsPDF = window.jsPDF || (() => { throw new Error('jsPDF not installed') })

// Print styles for single page invoice
const printStyles = `
  @media print {
    @page {
      size: A4;
      margin: 0.5in;
    }
    
    body * {
      visibility: hidden;
    }
    
    #invoice-document, #invoice-document * {
      visibility: visible;
    }
    
    #invoice-document {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100vh;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg width='250' height='250' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='watermark' x='0' y='0' width='250' height='250' patternUnits='userSpaceOnUse'%3e%3ctext x='30' y='125' font-family='Arial, sans-serif' font-size='22' fill='rgba(255, 0, 0, 0.08)' font-weight='bold' transform='rotate(-45 125 125)'%3eCarebox%3c/text%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23watermark)'/%3e%3c/svg%3e");
      background-repeat: repeat;
      background-size: 250px 250px;
      font-size: 11px;
      line-height: 1.3;
      border: none;
      border-radius: 0;
      box-shadow: none;
      overflow: visible;
    }
    
    .print-header {
      padding: 15px !important;
      margin-bottom: 10px !important;
    }
    
    .print-body {
      padding: 15px !important;
    }
    
    .print-section {
      margin-bottom: 12px !important;
    }
    
    .print-table {
      font-size: 10px !important;
    }
    
    .print-table th {
      padding: 6px 4px !important;
    }
    
    .print-table td {
      padding: 4px !important;
    }
    
    .print-footer {
      padding: 10px !important;
      margin-top: 15px !important;
    }
    
    .no-print {
      display: none !important;
    }
    
    h1 {
      font-size: 28px !important;
      margin-bottom: 8px !important;
    }
    
    h2 {
      font-size: 16px !important;
      margin-bottom: 8px !important;
    }
    
    h3 {
      font-size: 14px !important;
      margin-bottom: 6px !important;
    }
    
    .print-compact {
      margin-bottom: 8px !important;
    }
    
    .print-grid {
      gap: 8px !important;
    }
  }
`

const CreateInvoice = () => {
  const { user } = useSelector((state) => state.auth)
  
  // Form state management
  const [invoiceNumber, setInvoiceNumber] = useState('')
  // To Address (Franchise Details)
  const [franchiseName, setFranchiseName] = useState('')
  const [mfNumber, setMfNumber] = useState('')
  const [franchiseAddressLine1, setFranchiseAddressLine1] = useState('')
  const [franchiseAddressLine2, setFranchiseAddressLine2] = useState('')
  const [franchiseAddressLine3, setFranchiseAddressLine3] = useState('')
  const [franchisePincode, setFranchisePincode] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [totalParcel, setTotalParcel] = useState(0)
  const [billingAmount, setBillingAmount] = useState(0)
  const [invoiceDate, setInvoiceDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  
  // Franchise users autocomplete
  const [franchiseUsers, setFranchiseUsers] = useState([])
  const [selectedFranchise, setSelectedFranchise] = useState(null)
  const [franchiseInput, setFranchiseInput] = useState('')
  const [showFranchiseDropdown, setShowFranchiseDropdown] = useState(false)
  const [services, setServices] = useState([{
    description: '',
    quantity: 1,
    rate: 0,
    amount: 0
  }])
  const [taxRate, setTaxRate] = useState(18)
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('')
  const [showInvoicePreview, setShowInvoicePreview] = useState(false)

  // Auto-generate invoice number and fetch franchise users
  useEffect(() => {
    const generateInvoiceNumber = () => {
      const today = new Date()
      const year = today.getFullYear()
      const month = (today.getMonth() + 1).toString().padStart(2, '0')
      const day = today.getDate().toString().padStart(2, '0')
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      return `INV-${year}${month}${day}-${random}`
    }
    
    setInvoiceNumber(generateInvoiceNumber())
    setInvoiceDate(new Date().toISOString().split('T')[0])
    
    // Set due date to 30 days from today
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)
    setDueDate(dueDate.toISOString().split('T')[0])
    
    // Fetch franchise users
    fetchFranchiseUsers()
  }, [])

  // Fetch users with Franchise role
  const fetchFranchiseUsers = async () => {
    try {
      const { data } = await axios.get(buildApiUrl(API_ENDPOINTS.FETCH_ALL_USERS))
      if (data && data.user) {
        // Filter users with Franchise role and not deleted
        const franchises = data.user.filter(user => 
          user.role === 'Franchise' && user.is_deleted === false
        )
        setFranchiseUsers(franchises)
      }
    } catch (error) {
      console.error('Error fetching franchise users:', error)
    }
  }

  // Handle franchise selection
  const handleFranchiseSelect = async (franchise) => {
    setSelectedFranchise(franchise)
    setFranchiseName(franchise.name || '')
    setMfNumber(franchise.mf_no || '')
    setGstNumber(franchise.gst_no || '')
    setFranchiseInput(`${franchise.name} - ${franchise.co_name}`)
    setShowFranchiseDropdown(false)
    
    // Fetch and populate address
    if (franchise.address) {
      setFranchiseAddressLine1(franchise.address.addressLine1 || '')
      setFranchiseAddressLine2(franchise.address.addressLine2 || '')
      setFranchiseAddressLine3(franchise.address.landmark || franchise.address.city || '')
      setFranchisePincode(franchise.address.pincode || '')
    }
  }

  // Filter franchise users based on input
  const filteredFranchises = franchiseUsers.filter(franchise =>
    franchise.name.toLowerCase().includes(franchiseInput.toLowerCase()) ||
    franchise.co_name.toLowerCase().includes(franchiseInput.toLowerCase())
  )

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.franchise-autocomplete')) {
        setShowFranchiseDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Add new service line
  const addServiceLine = () => {
    setServices([...services, {
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    }])
  }

  // Remove service line
  const removeServiceLine = (index) => {
    if (services.length > 1) {
      const newServices = services.filter((_, i) => i !== index)
      setServices(newServices)
    }
  }

  // Update service line
  const updateServiceLine = (index, field, value) => {
    const newServices = [...services]
    newServices[index][field] = value
    
    // Calculate amount if quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      newServices[index].amount = newServices[index].quantity * newServices[index].rate
    }
    
    setServices(newServices)
  }

  // Calculate totals
  const subtotal = services.reduce((sum, service) => sum + service.amount, 0)
  const taxAmount = (subtotal * taxRate) / 100
  const total = subtotal + taxAmount

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission and show invoice preview
    console.log('Invoice data:', {
      invoiceNumber,
      franchiseName,
      mfNumber,
      franchiseAddressLine1,
      franchiseAddressLine2,
      franchiseAddressLine3,
      franchisePincode,
      totalParcel,
      billingAmount,
      gstNumber,
      invoiceDate,
      dueDate,
      services,
      taxRate,
      subtotal,
      taxAmount,
      total,
      notes,
      terms,
      fromAddress: {
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || {}
      }
    })
    setShowInvoicePreview(true)
  }

  // Enhanced print functionality
  const handlePrint = () => {
    // Inject print styles
    const styleSheet = document.createElement('style')
    styleSheet.innerText = printStyles
    document.head.appendChild(styleSheet)
    
    // Print
    window.print()
    
    // Remove styles after printing
    setTimeout(() => {
      document.head.removeChild(styleSheet)
    }, 1000)
  }

  // Enhanced download functionality
  const handleDownload = async () => {
    try {
      const element = document.getElementById('invoice-document')
      
      // Create canvas from HTML element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      pdf.save(`invoice-${invoiceNumber}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      // Fallback: open print dialog
      handlePrint()
    }
  }

  // Enhanced email functionality
  const handleEmail = () => {
    const subject = `Invoice ${invoiceNumber} - ${user?.name || 'Carebox'}`
    const body = `
Dear ${franchiseName},

Please find attached invoice ${invoiceNumber} for the services provided.

Invoice Details:
- Invoice Number: ${invoiceNumber}
- Date: ${new Date(invoiceDate).toLocaleDateString()}
- Due Date: ${new Date(dueDate).toLocaleDateString()}
- Total Amount: ₹${total.toFixed(2)}
- Billing Amount: ₹${billingAmount.toFixed(2)}

From: ${user?.name || 'Carebox'}
To: ${franchiseName}
MF Number: ${mfNumber}
GST Number: ${gstNumber}

Thank you for your business!

Best regards,
${user?.name || 'Carebox'}
    `.trim()
    
    const mailtoLink = `mailto:${selectedFranchise?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  // Invoice Preview Component
  const InvoicePreview = () => (
    <div className='p-6 max-w-[900px] mx-auto'>
      {/* Header */}
      <div className='bg-gradient-to-r from-red-600 to-black rounded-lg shadow-lg p-6 mb-6'>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-md">
              <DocumentPlusIcon className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className='text-2xl font-semibold text-white mb-1'>Invoice Preview</h1>
              <p className='text-red-100'>Professional invoice ready for action</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowInvoicePreview(false)}
              className="px-4 py-2 border-2 border-white text-white hover:bg-white hover:text-black transition-colors rounded-md"
            >
              Back to Edit
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Document */}
      <div 
        id="invoice-document" 
        className='bg-white rounded-lg shadow-lg border-2 border-red-100 overflow-hidden mb-6 relative'
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg width='250' height='250' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='watermark' x='0' y='0' width='250' height='250' patternUnits='userSpaceOnUse'%3e%3ctext x='30' y='125' font-family='Arial, sans-serif' font-size='22' fill='rgba(255, 0, 0, 0.08)' font-weight='bold' transform='rotate(-45 125 125)'%3eCarebox%3c/text%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23watermark)'/%3e%3c/svg%3e")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '250px 250px'
        }}
      >
        {/* Invoice Header */}
        <div className="bg-gradient-to-r from-red-50 to-white p-8 border-b-2 border-red-500 print-header">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">INVOICE</h1>
              <div className="text-red-600 font-semibold">#{invoiceNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600 mb-2">₹{total.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Amount</div>
            </div>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-8 print-body">
          {/* From and To Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print-section print-grid print-compact">
            <div>
              <h3 className="text-lg font-semibold text-black mb-3 border-b-2 border-red-500 pb-1">FROM</h3>
              <div className="space-y-2">
                <div className="font-semibold text-black">{user?.name || 'Carebox'}</div>
                <div className="text-gray-700">{user?.email || ''}</div>
                <div className="text-gray-700">{user?.phone || ''}</div>
                <div className="text-gray-700 space-y-1">
                  {user?.address?.addressLine1 && <div>{user.address.addressLine1}</div>}
                  {user?.address?.addressLine2 && <div>{user.address.addressLine2}</div>}
                  {user?.address?.landmark && <div>{user.address.landmark}</div>}
                  {user?.address?.city && <div>{user.address.city}</div>}
                  {user?.address?.pincode && <div>Pincode: {user.address.pincode}</div>}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black mb-3 border-b-2 border-red-500 pb-1">TO</h3>
              <div className="space-y-2">
                <div className="font-semibold text-black">{franchiseName}</div>
                <div className="text-gray-700">MF: {mfNumber}</div>
                <div className="text-gray-700">GST: {gstNumber}</div>
                <div className="text-gray-700 space-y-1">
                  {franchiseAddressLine1 && <div>{franchiseAddressLine1}</div>}
                  {franchiseAddressLine2 && <div>{franchiseAddressLine2}</div>}
                  {franchiseAddressLine3 && <div>{franchiseAddressLine3}</div>}
                  {franchisePincode && <div>Pincode: {franchisePincode}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print-section print-grid print-compact">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-gray-600">Invoice Date</div>
              <div className="font-semibold text-black">{new Date(invoiceDate).toLocaleDateString()}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-gray-600">Due Date</div>
              <div className="font-semibold text-black">{new Date(dueDate).toLocaleDateString()}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-gray-600">Total Parcels</div>
              <div className="font-semibold text-black">{totalParcel}</div>
            </div>
          </div>

          {/* Services Table */}
          <div className="mb-8 print-section print-compact">
            <h3 className="text-lg font-semibold text-black mb-3 border-b-2 border-red-500 pb-1">SERVICES</h3>
            <div className="overflow-x-auto">
              <table className="w-full print-table">
                <thead>
                  <tr className="bg-black">
                    <th className="text-left py-3 px-4 text-white font-semibold">Description</th>
                    <th className="text-center py-3 px-4 text-white font-semibold">Qty</th>
                    <th className="text-right py-3 px-4 text-white font-semibold">Rate</th>
                    <th className="text-right py-3 px-4 text-white font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-800">{service.description}</td>
                      <td className="py-3 px-4 text-center text-gray-800">{service.quantity}</td>
                      <td className="py-3 px-4 text-right text-gray-800">₹{service.rate.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-red-600">₹{service.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8 print-section print-compact">
            <div className="w-full max-w-sm">
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Tax ({taxRate}%):</span>
                  <span className="font-semibold">₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-red-500">
                  <span className="text-xl font-bold text-black">TOTAL:</span>
                  <span className="text-xl font-bold text-red-600">₹{total.toFixed(2)}</span>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200 mt-4">
                  <div className="text-sm text-gray-600">Billing Amount</div>
                  <div className="text-lg font-bold text-red-600">₹{billingAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          {(notes || terms) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print-section print-compact print-grid">
              {notes && (
                <div>
                  <h4 className="font-semibold text-black mb-2 border-b border-red-300 pb-1">Notes</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-line">{notes}</p>
                </div>
              )}
              {terms && (
                <div>
                  <h4 className="font-semibold text-black mb-2 border-b border-red-300 pb-1">Terms & Conditions</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-line">{terms}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Invoice Footer */}
        <div className="bg-black text-white p-6 text-center print-footer">
          <p className="text-sm">Thank you for your business!</p>
          <p className="text-xs text-gray-300 mt-2">Generated on {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-6 no-print">
        <button 
          onClick={handlePrint}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg flex items-center gap-2 transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Invoice
        </button>
        <button 
          onClick={handleDownload}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2 transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button>
        <button 
          onClick={handleEmail}
          className="px-6 py-3 border-2 border-red-500 text-red-500 bg-white rounded-lg hover:bg-red-50 transition-colors shadow-lg flex items-center gap-2 transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email Invoice
        </button>
      </div>

      {/* Instructions for users */}
      {/* <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 no-print">
        <h4 className="font-semibold mb-2">📝 Instructions:</h4>
        <ul className="space-y-1">
          <li><strong>Print:</strong> Single-page invoice with "Carebox" watermark background</li>
          <li><strong>Download:</strong> Save as PDF with high quality (requires html2canvas & jsPDF libraries)</li>
          <li><strong>Email:</strong> Opens your email client with pre-filled invoice details</li>
        </ul>
        <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
          <p className="text-xs text-blue-700 font-medium">
            ✅ Optimized for single-page printing with compact layout and "Carebox" watermark
          </p>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Note: For PDF download to work, please install: <code>npm install html2canvas jspdf</code>
        </p>
      </div> */}
    </div>
  )

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1'>
        <Topbar />
        {showInvoicePreview ? (
          <InvoicePreview />
        ) : (
          <div className='p-6 max-w-[1200px] mx-auto'>
          {/* Header */}
          <div className='bg-gradient-to-r from-red-600 to-black rounded-lg shadow-lg p-6 mb-6'>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-full shadow-md">
                <DocumentPlusIcon className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className='text-2xl font-semibold text-white mb-1'>Create Invoice</h1>
                <p className='text-red-100'>Generate professional invoices for your clients</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Franchise Details (To Address) */}
            <div className='bg-white rounded-lg shadow-lg border-2 border-red-100 p-6 mb-6'>
              <h2 className='text-lg font-semibold text-black mb-4 border-b-2 border-red-500 pb-2'>To Address - Franchise Details</h2>
              
              {/* Franchise Autocomplete */}
              <div className='mb-6 relative franchise-autocomplete'>
                <Input
                  label="Select Franchise *"
                  value={franchiseInput}
                  onChange={(e) => {
                    setFranchiseInput(e.target.value)
                    setShowFranchiseDropdown(true)
                  }}
                  onFocus={() => setShowFranchiseDropdown(true)}
                  icon={<UserIcon className="w-5 h-5" />}
                  placeholder="Search franchise by name or company"
                />
                
                {/* Dropdown */}
                {showFranchiseDropdown && filteredFranchises.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredFranchises.map((franchise) => (
                      <div
                        key={franchise.id}
                        className="px-4 py-2 hover:bg-red-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleFranchiseSelect(franchise)}
                      >
                        <div className="font-medium text-gray-900">{franchise.name}</div>
                        <div className="text-sm text-gray-500">{franchise.co_name}</div>
                        <div className="text-xs text-gray-400">MF: {franchise.mf_no || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div>
                  <Input 
                    label="Franchise Name *"
                    value={franchiseName}
                    onChange={(e) => setFranchiseName(e.target.value)}
                    icon={<UserIcon className="w-5 h-5" />}
                    placeholder="Auto-filled from selection"
                    disabled
                  />
                </div>
                <div>
                  <Input 
                    label="MF Number *"
                    value={mfNumber}
                    onChange={(e) => setMfNumber(e.target.value)}
                    icon={<DocumentPlusIcon className="w-5 h-5" />}
                    placeholder="Auto-filled from selection"
                    disabled
                  />
                </div>
                <div>
                  <Input 
                    label="GST Number *"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="Auto-filled from selection"
                    disabled
                  />
                </div>
              </div>
              <div className='mt-6'>
                <h3 className='text-md font-semibold text-black mb-3'>Franchise Address (Auto-populated)</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                  <div>
                    <Input 
                      label="Address Line 1 *"
                      value={franchiseAddressLine1}
                      onChange={(e) => setFranchiseAddressLine1(e.target.value)}
                      placeholder="Auto-filled from selection"
                      disabled
                    />
                  </div>
                  <div>
                    <Input 
                      label="Address Line 2"
                      value={franchiseAddressLine2}
                      onChange={(e) => setFranchiseAddressLine2(e.target.value)}
                      placeholder="Auto-filled from selection"
                      disabled
                    />
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                  <div>
                    <Input 
                      label="Address Line 3"
                      value={franchiseAddressLine3}
                      onChange={(e) => setFranchiseAddressLine3(e.target.value)}
                      placeholder="Auto-filled from selection"
                      disabled
                    />
                  </div>
                  <div>
                    <Input 
                      label="Pincode *"
                      value={franchisePincode}
                      onChange={(e) => setFranchisePincode(e.target.value)}
                      placeholder="Auto-filled from selection"
                      disabled
                    />
                  </div>
                </div>
                
                <h3 className='text-md font-semibold text-black mb-3'>Parcel & Billing Details</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Input 
                      type="number"
                      label="Total Parcel *"
                      value={totalParcel}
                      onChange={(e) => setTotalParcel(parseInt(e.target.value) || 0)}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Input 
                      type="number"
                      label="Billing Amount *"
                      value={billingAmount}
                      onChange={(e) => setBillingAmount(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      icon={<CurrencyDollarIcon className="w-5 h-5" />}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className='bg-white rounded-lg shadow-lg border-2 border-red-100 p-6 mb-6'>
              <h2 className='text-lg font-semibold text-black mb-4 border-b-2 border-red-500 pb-2'>Invoice Details</h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div>
                  <Input 
                    label="Invoice Number *"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    icon={<DocumentPlusIcon className="w-5 h-5" />}
                  />
                </div>
                <div>
                  <Input 
                    type="date"
                    label="Current Date *"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    icon={<CalendarIcon className="w-5 h-5" />}
                  />
                </div>
                <div>
                  <Input 
                    type="date"
                    label="Due Date *"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    icon={<CalendarIcon className="w-5 h-5" />}
                  />
                </div>
              </div>
            </div>


            {/* Services */}
            <div className='bg-white rounded-lg shadow-lg border-2 border-red-100 p-6 mb-6'>
              <div className="flex justify-between items-center mb-4">
                <h2 className='text-lg font-semibold text-black border-b-2 border-red-500 pb-2'>Services</h2>
                <button 
                  type="button"
                  onClick={addServiceLine}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-md"
                >
                  Add Line
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-black">
                      <th className="text-left py-3 px-2 text-white font-semibold">Description</th>
                      <th className="text-left py-3 px-2 w-24 text-white font-semibold">Qty</th>
                      <th className="text-left py-3 px-2 w-32 text-white font-semibold">Rate</th>
                      <th className="text-left py-3 px-2 w-32 text-white font-semibold">Amount</th>
                      <th className="w-16 text-white font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-2">
                          <Input 
                            size="sm"
                            value={service.description}
                            onChange={(e) => updateServiceLine(index, 'description', e.target.value)}
                            placeholder="Service description"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input 
                            type="number"
                            size="sm"
                            value={service.quantity}
                            onChange={(e) => updateServiceLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                            min="1"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input 
                            type="number"
                            size="sm"
                            value={service.rate}
                            onChange={(e) => updateServiceLine(index, 'rate', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <div className="p-2 bg-red-50 border border-red-200 rounded text-sm font-medium text-red-700">
                            ₹{service.amount.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          {services.length > 1 && (
                            <button 
                              type="button"
                              onClick={() => removeServiceLine(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className='bg-white rounded-lg shadow-lg border-2 border-red-100 p-6 mb-6'>
              <h2 className='text-lg font-semibold text-black mb-4 border-b-2 border-red-500 pb-2'>Invoice Totals</h2>
              <div className="max-w-md ml-auto">
                <div className="flex justify-between py-2">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {/* <div className="flex justify-between items-center py-2">
                  <span>Tax Rate:</span>
                  <div className="w-24">
                    <Input 
                      type="number"
                      size="sm"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                </div> */}
                <div className="flex justify-between py-2">
                  <span>Tax Amount:</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-red-500 font-bold text-lg text-red-600">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className='bg-white rounded-lg shadow-lg border-2 border-red-100 p-6 mb-6'>
              <h2 className='text-lg font-semibold text-black mb-4 border-b-2 border-red-500 pb-2'>Additional Information</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <Textarea 
                    
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Any additional notes for the client"
                  />
                </div>
                <div>
                  <Textarea 
                    
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    rows={4}
                    placeholder="Payment terms and conditions"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              
              <button 
                type="submit"
                className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-md"
              >
                Create Invoice
              </button>
            </div>
          </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateInvoice
