import React, { useState, useEffect } from 'react'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import { useSelector } from 'react-redux'
import { Input } from '@material-tailwind/react'
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
  ArrowPathIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline'

const FranchiseBillingInfo = () => {
  const { user } = useSelector((state) => state.auth)
  
  // Form state management
  const [billingData, setBillingData] = useState([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const todayStr = new Date().toISOString().split('T')[0]
  
  // Initialize default date range (last 30 days) on mount
  useEffect(() => {
    const today = new Date()
    const end = today.toISOString().split('T')[0]
    const start = new Date(today)
    start.setDate(start.getDate() - 30)
    const startStr = start.toISOString().split('T')[0]
    setDateFrom(startStr)
    setDateTo(end)
  }, [])

  // Helper: extract digits from MF no (e.g., "MF-012" -> 12)
  const extractMfInteger = (mf) => {
    const digits = String(mf || '').replace(/\D/g, '')
    return digits ? parseInt(digits, 10) : ''
  }

  // Helper to call API with query params and JSON body; type derived from role
  const fetchOrdersByDateRange = async ({ start_date, end_date, role, mf_no }) => {
    try {
      if (!start_date || !end_date || !role) {
        throw new Error('Missing required parameters')
      }
      const type = role === ROLES.FRANCHISE ? 'franchise' : 'admin'
      if (type === 'franchise' && !mf_no) {
        throw new Error('mf_no is required for franchise type')
      }
      const url = buildApiUrl(API_ENDPOINTS.FETCH_ORDERS_BY_DATERANGE)
      const response = await axios({
        method: 'post',
        url,
        params: { start_date, end_date },
        data: { type, mf_no },
        headers: { 'Content-Type': 'application/json' }
      })
      return response?.data
    } catch (error) {
      console.error('API Error:', error?.response?.data || error?.message)
      return null
    }
  }

  // Fetch billing data (can be called by button)
  const fetchBilling = async () => {
    try {
      setIsFetching(true)
      if (!dateFrom || !dateTo) return
      const isFranchise = user?.role === ROLES.FRANCHISE
      const mfInteger = extractMfInteger(user?.mf_no)

      // Use helper to fetch
      const data = await fetchOrdersByDateRange({
        start_date: dateFrom,
        end_date: dateTo,
        role: user?.role,
        mf_no: isFranchise ? mfInteger : undefined
      })

      if (data?.success && Array.isArray(data?.orders)) {
        const mapped = data.orders.map((order, idx) => {
          const mfInt = order?.agent_id || mfInteger || ''
          const mfPadded = String(mfInt || '').toString().padStart(3, '0')
          const senderPin = order?.sender_address?.pincode || order?.sender_pincode || ''
          const receiverPin = order?.receiver_address?.pincode || order?.receiver_pincode || ''
          const amount = order?.amount || order?.total_amount || order?.price || 0
          const createdAt = order?.created_at ? new Date(order.created_at) : null
          const billingDate = createdAt ? createdAt.toISOString().split('T')[0] : ''
          return {
            id: order?.id || idx,
            mfNumber: `MF-${mfPadded}`,
            awbNumber: order?.awb_no || order?.order_no || '',
            senderLocationPincode: senderPin,
            receiverLocationPincode: receiverPin,
            totalParcel: Array.isArray(order?.package_data) ? order.package_data.length : 1,
            totalAmount: Number(amount) || 0,
            franchiseName: user?.co_name || 'Franchise',
            franchiseCode: '',
            billingAmount: Number(amount) || 0,
        paidAmount: 0,
            pendingAmount: Number(amount) || 0,
            billingDate,
            dueDate: billingDate,
            status: order?.status || 'Pending',
            invoiceNumber: order?.inv_no || '',
          }
        })
        setBillingData(mapped)
        setFilteredData(mapped)
      } else {
        setBillingData([])
        setFilteredData([])
      }
    } catch (err) {
      console.error('Failed to fetch franchise billing info:', err)
      setBillingData([])
      setFilteredData([])
    } finally {
      setIsFetching(false)
    }
  }

  // Auto-fetch on initial mount after dates are set
  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchBilling()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo])

  // Keep filteredData in sync with billingData (no search/status filters now)
  useEffect(() => {
    setFilteredData(billingData)
  }, [billingData])

  // Date range + search filter
  useEffect(() => {
    let filtered = billingData
    if (dateFrom) {
      filtered = filtered.filter(item => new Date(item.billingDate) >= new Date(dateFrom))
    }
    if (dateTo) {
      filtered = filtered.filter(item => new Date(item.billingDate) <= new Date(dateTo))
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(item =>
        item.mfNumber?.toLowerCase().includes(term) ||
        item.awbNumber?.toLowerCase().includes(term) ||
        String(item.senderLocationPincode || '').includes(term) ||
        String(item.receiverLocationPincode || '').includes(term)
      )
    }
    setFilteredData(filtered)
  }, [dateFrom, dateTo, searchTerm, billingData])

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

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1'>
        <Topbar />
        <div className='p-6 lg:max-w-[1200px] max-w-[400px] mx-auto'>
          {/* Header */}
          <div className='bg-gradient-to-r from-red-600 to-black rounded-lg shadow-lg p-6 mb-6'>
            <div className="flex items-center justify-between gap-4">
              <div className="p-3 bg-white rounded-full shadow-md">
                <BuildingOfficeIcon className="w-8 h-8 text-red-600" />
              </div>
              <div className='flex-1'>
                <h1 className='text-2xl font-semibold text-white mb-1'>Franchise Billing Information</h1>
                <p className='text-red-100'>Comprehensive franchise billing and payment tracking</p>
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
                  placeholder="MF Number, AWB, Pincode"
                />
              </div>
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
                <div className='flex-1'>
                  <Input 
                    type="date"
                    label="To Date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value > todayStr ? todayStr : e.target.value)}
                    icon={<CalendarIcon className="w-5 h-5" />}
                    max={todayStr}
                  />
                </div>
                {/* <button
                  onClick={fetchBilling}
                  disabled={isFetching}
                  className={`h-[42px] min-w-[200px] px-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2
                    ${isFetching ? 'bg-red-400 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'} text-white font-semibold`}
                >
                  {isFetching ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <CloudArrowDownIcon className="w-5 h-5" />
                      <span>Fetch Orders</span>
                    </>
                  )}
                </button> */}
              </div>
            </div>
          </div>

          {/* Franchise Billing Table - match BillingInfo layout */}
          <div className='bg-white rounded-lg shadow-lg border-2 border-red-100 overflow-hidden'>
            <div className="px-6 py-4 border-b-2 border-red-500 bg-gradient-to-r from-red-50 to-white">
              <h2 className='text-lg font-semibold text-black'>
                Franchise Billing Records ({filteredData.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-5 text-left bg-black text-white font-semibold px-4 py-3 rounded-t-md text-sm min-w-[700px]">
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">MF Number</div>
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">Total Parcel</div>
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">Total Amount</div>
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">Bill Date</div>
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">Due Date</div>
              </div>
              {filteredData.map((item) => (
                <div key={item.id} className="grid grid-cols-5 text-sm px-4 py-3 border-b hover:bg-gray-50 min-w-[700px]">
                  <div className="px-2 py-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                          <DocumentTextIcon className="w-4 h-4 text-red-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-black">{item.mfNumber}</div>
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
                        <div className="text-sm font-medium text-black">{item.billingDate ? new Date(item.billingDate).toLocaleDateString() : 'N/A'}</div>
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
                        <div className="text-sm font-medium text-red-600">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}</div>
                        <div className="text-xs text-gray-500">Due Date</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No franchise billing records found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {filteredData.length > 0 && (
            <div className="flex justify-end gap-4 mt-6">
              <button className="px-6 py-2 border-2 border-black text-black bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-md">
                Export to Excel
              </button>
              <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md">
                Generate Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FranchiseBillingInfo
