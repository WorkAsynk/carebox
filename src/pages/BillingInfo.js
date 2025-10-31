import React, { useState, useEffect } from 'react'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import { useSelector } from 'react-redux'
import { Input, Select, Option, Textarea } from '@material-tailwind/react'
import InvoicePreviewModal from '../components/Invoice/InvoicePreviewModal'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { buildApiUrl, API_ENDPOINTS } from '../config/api'
import { ROLES } from '../config/rolePermissions'
import { 
  CreditCardIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

const BillingInfo = () => {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  
  // Form state management
  const [billingData, setBillingData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [isFetching, setIsFetching] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewInvoice, setPreviewInvoice] = useState(null)
  const todayStr = new Date().toISOString().split('T')[0]

  // Set default date range (last 30 days) and auto-fetch
  useEffect(() => {
    const init = () => {
      const today = new Date()
      const end = today.toISOString().split('T')[0]
      const start = new Date(today)
      start.setDate(start.getDate() - 30)
      const startStr = start.toISOString().split('T')[0]
      setDateFrom(prev => prev || startStr)
      setDateTo(prev => prev || end)
    }
    init()
  }, [])

  useEffect(() => {
    if (dateFrom && dateTo) {
      handleFetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo])

  // Helper to call same API as FranchiseBillingInfo
  const extractMfInteger = (mf) => {
    const digits = String(mf || '').replace(/\D/g, '')
    return digits ? parseInt(digits, 10) : ''
  }

  const fetchOrdersByDateRange = async ({ start_date, end_date, role, mf_no }) => {
    try {
      if (!start_date || !end_date || !role) throw new Error('Missing required parameters')
      const type = role === ROLES.FRANCHISE ? 'franchise' : 'admin'
      if (type === 'franchise' && !mf_no) throw new Error('mf_no is required for franchise type')
      const url = buildApiUrl(API_ENDPOINTS.FETCH_ORDERS_BY_DATERANGE)
      const response = await axios({ method: 'post', url, params: { start_date, end_date }, data: { type, mf_no }, headers: { 'Content-Type': 'application/json' } })
      return response?.data
    } catch (error) {
      console.error('API Error:', error?.response?.data || error?.message)
      return null
    }
  }

  const handleFetch = async () => {
    try {
      setIsFetching(true)
      if (!dateFrom || !dateTo) return
      const isFranchise = user?.role === ROLES.FRANCHISE
      const mfInteger = extractMfInteger(user?.mf_no)
      const data = await fetchOrdersByDateRange({ start_date: dateFrom, end_date: dateTo, role: user?.role, mf_no: isFranchise ? mfInteger : undefined })
      if (data?.success && Array.isArray(data?.orders)) {
        const mapped = data.orders.map((order, idx) => ({
          id: order?.id || idx,
          mfNumber: `MF-${String(order?.agent_id || mfInteger || '').toString().padStart(3, '0')}`,
          awbNumber: order?.awb_no || order?.order_no || '',
          senderLocationPincode: order?.sender_address?.pincode || order?.sender_pincode || '',
          receiverLocationPincode: order?.receiver_address?.pincode || order?.receiver_pincode || '',
          packageName: order?.package_data?.[0]?.contents_description || '',
          totalParcel: Array.isArray(order?.package_data) ? order.package_data.length : 1,
          totalAmount: Number(order?.amount || order?.total_amount || order?.price || 0),
          clientName: user?.name || 'Client',
          franchiseName: user?.co_name || 'Franchise',
          invoiceNumber: order?.inv_no || '',
          billingAmount: Number(order?.amount || order?.total_amount || order?.price || 0),
          paidAmount: 0,
          pendingAmount: Number(order?.amount || order?.total_amount || order?.price || 0),
          billingDate: order?.created_at ? new Date(order.created_at).toISOString().split('T')[0] : todayStr,
          dueDate: order?.created_at ? new Date(order.created_at).toISOString().split('T')[0] : todayStr,
          status: order?.status || 'Pending',
          fullOrder: order
        }))
        setBillingData(mapped)
        setFilteredData(mapped)
      }
    } finally {
      setIsFetching(false)
    }
  }

  // Filter data based on search and filters
  useEffect(() => {
    let filtered = billingData

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.franchiseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mfNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.awbNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.senderLocationPincode.includes(searchTerm) ||
        item.receiverLocationPincode.includes(searchTerm)
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(item => new Date(item.billingDate) >= new Date(dateFrom))
    }
    if (dateTo) {
      filtered = filtered.filter(item => new Date(item.billingDate) <= new Date(dateTo))
    }

    setFilteredData(filtered)
  }, [searchTerm, statusFilter, dateFrom, dateTo, billingData])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-red-100 text-red-800'
      case 'Partial': return 'bg-black text-white'
      case 'Pending': return 'bg-gray-100 text-black'
      case 'Overdue': return 'bg-red-500 text-white'
      default: return 'bg-gray-100 text-black'
    }
  }

  const calculateTotals = () => {
    return filteredData.reduce((acc, item) => ({
      totalBilling: acc.totalBilling + item.billingAmount,
      totalAmountPaid: acc.totalAmountPaid + item.paidAmount,
      outstandingAmount: acc.outstandingAmount + item.pendingAmount,
      totalOrders: acc.totalOrders + 1
    }), { totalBilling: 0, totalAmountPaid: 0, outstandingAmount: 0, totalOrders: 0 })
  }

  const totals = calculateTotals()

  const handlePreview = (invoice) => {
    navigate('/billing-invoice', { state: { invoice } })
  }

  const handleDownload = (invoice) => {
    // Simple printable view using a new window
    const printHtml = `
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber || invoice.awbNumber || ''}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { margin-bottom: 8px; }
            .section { border: 1px solid #e5e7eb; padding: 16px; margin-top: 16px; border-radius: 8px; }
            .row { display: flex; justify-content: space-between; margin: 6px 0; }
            .label { color: #6b7280; }
            .value { color: #111827; font-weight: 600; }
          </style>
        </head>
        <body>
          <h1>Invoice Preview</h1>
          <div class="section">
            <div class="row"><span class="label">MF Number</span><span class="value">${invoice.mfNumber || ''}</span></div>
            <div class="row"><span class="label">AWB</span><span class="value">${invoice.awbNumber || ''}</span></div>
            <div class="row"><span class="label">Total Parcel</span><span class="value">${invoice.totalParcel || 0}</span></div>
            <div class="row"><span class="label">Amount</span><span class="value">₹${(invoice.totalAmount || invoice.billingAmount || 0).toLocaleString()}</span></div>
            <div class="row"><span class="label">Bill Date</span><span class="value">${invoice.billingDate || ''}</span></div>
            <div class="row"><span class="label">Due Date</span><span class="value">${invoice.dueDate || ''}</span></div>
          </div>
        </body>
      </html>`
    const w = window.open('', '_blank')
    if (w) {
      w.document.open()
      w.document.write(printHtml)
      w.document.close()
      w.focus()
      w.print()
    }
  }

  return (
    <>
    <div className='flex'>
      <Sidebar />
      <div className='flex-1'>
        <Topbar />
        <div className='p-6 lg:max-w-[1200px] max-w-[400px] mx-auto'>
          {/* Header */}
          <div className='bg-gradient-to-r from-red-600 to-black rounded-lg shadow-lg p-6 mb-6'>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-full shadow-md">
                <CreditCardIcon className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className='text-2xl font-semibold text-white mb-1'>Billing Information</h1>
                <p className='text-red-100'>Comprehensive billing and payment tracking</p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-lg border-2 border-red-100 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-black">Total Amount Paid</h3>
                  <p className="text-2xl font-bold text-black">₹{totals.totalAmountPaid.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg border-2 border-red-100 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-black">Outstanding Amount</h3>
                  <p className="text-2xl font-bold text-red-600">₹{totals.outstandingAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg border-2 border-red-100 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-black">Total Orders</h3>
                  <p className="text-2xl font-bold text-black">{totals.totalOrders.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg border-2 border-red-100 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-black">Total Billing</h3>
                  <p className="text-2xl font-bold text-red-600">₹{totals.totalBilling.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className='bg-white rounded-lg shadow-lg border-2 border-red-100 p-6 mb-6'>
            <h2 className='text-lg font-semibold text-black mb-4 border-b-2 border-red-500 pb-2'>Filters</h2>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <Input 
                  label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<DocumentTextIcon className="w-5 h-5" />}
                  placeholder="MF Number, AWB, Pincode, Client, or Invoice"
                />
              </div>
              {/* <div>
                <Select 
                  label="Status"
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                >
                  <Option value="">All Status</Option>
                  <Option value="Paid">Paid</Option>
                  <Option value="Partial">Partial</Option>
                  <Option value="Pending">Pending</Option>
                  <Option value="Overdue">Overdue</Option>
                </Select>
              </div> */}
              <div>
                <Input 
                  type="date"
                  label="From Date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  icon={<CalendarIcon className="w-5 h-5" />}
                  max={todayStr}
                />
              </div>
              <div className='flex items-end gap-3'>
                <Input 
                  type="date"
                  label="To Date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value > todayStr ? todayStr : e.target.value)}
                  icon={<CalendarIcon className="w-5 h-5" />}
                  max={todayStr}
                />
                {/* Auto-fetch on date change; button removed per requirement */}
              </div>
            </div>
          </div>

          {/* Billing Table */}
          <div className='bg-white rounded-lg shadow-lg border-2 border-red-100 overflow-hidden'>
            <div className="px-6 py-4 border-b-2 border-red-500 bg-gradient-to-r from-red-50 to-white">
              <h2 className='text-lg font-semibold text-black'>
                Billing Records ({filteredData.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              {/* Header Row */}
              <div className="grid grid-cols-6 text-left bg-black text-white font-semibold px-4 py-3 rounded-t-md text-sm min-w-[900px]">
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">MF Number</div>
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">Total Parcel</div>
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">Total Amount</div>
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">Bill Date</div>
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">Due Date</div>
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">Actions</div>
              </div>
              {/* Data Rows */}
              {isFetching ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="inline-flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                    Loading billing records...
                  </div>
                </div>
              ) : (
                filteredData.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-6 text-sm px-4 py-3 border-b hover:bg-gray-50 min-w-[900px]"
                  >
                    <div className="px-2 py-2">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                            <DocumentTextIcon className="w-4 h-4 text-red-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <button onClick={() => handlePreview(item)} className="text-sm font-medium text-black hover:underline">
                            {item.mfNumber}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="px-2 py-2">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
                            <ChartBarIcon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-black">{item.totalParcel.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Parcels</div>
                        </div>
                      </div>
                    </div>
                    <div className="px-2 py-2">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
                            <CurrencyDollarIcon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-red-600">₹{item.totalAmount.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Amount</div>
                        </div>
                      </div>
                    </div>
                    <div className="px-2 py-2">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
                            <CalendarIcon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-black">{new Date(item.billingDate).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">Bill Date</div>
                        </div>
                      </div>
                    </div>
                    <div className="px-2 py-2">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
                            <CalendarIcon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-red-600">{new Date(item.dueDate).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">Due Date</div>
                        </div>
                      </div>
                    </div>
                    <div className="px-2 py-2">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handlePreview(item)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
                          title="Preview"
                        >
                           <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                      
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {filteredData.length === 0 && !isFetching && (
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No billing records found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {filteredData.length > 0 && !isFetching && (
            <div className="flex justify-end gap-4 mt-6">
              {/* <button className="px-6 py-2 border-2 border-black text-black bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-md">
                Export to Excel
              </button>
              <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md">
                Generate Report
              </button> */}
            </div>
          )}
        </div>
      </div>
    </div>
    <InvoicePreviewModal 
      open={showPreview} 
      invoice={previewInvoice} 
      onClose={() => setShowPreview(false)} 
      onDownload={() => handleDownload(previewInvoice)} 
    />
    </>
  )
}

export default BillingInfo
