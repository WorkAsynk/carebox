import React, { useState, useEffect } from 'react'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import { useSelector } from 'react-redux'
import { Input, Select, Option, Textarea } from '@material-tailwind/react'
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
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const FranchiseBillingInfo = () => {
  const { user } = useSelector((state) => state.auth)
  
  // Form state management
  const [billingData, setBillingData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filteredData, setFilteredData] = useState([])
  
  // Sample franchise billing data
  useEffect(() => {
    const sampleFranchiseBillingData = [
      {
        id: 1,
        mfNumber: 'MF001234',
        awbNumber: 'AWB2024120101',
        senderLocationPincode: '400001',
        receiverLocationPincode: '110001',
        totalParcel: 150,
        totalAmount: 25000,
        franchiseName: 'Mumbai Central',
        franchiseCode: 'MUM001',
        franchiseOwner: 'Rajesh Sharma',
        franchiseContact: '+91-9876543210',
        invoiceNumber: 'FINV-20241201-001',
        billingAmount: 25000,
        paidAmount: 25000,
        pendingAmount: 0,
        billingDate: '2024-12-01',
        dueDate: '2024-12-31',
        status: 'Paid',
        paymentMethod: 'Bank Transfer',
        gstNumber: 'GST123456789',
        totalParcels: 150
      },
      {
        id: 2,
        mfNumber: 'MF001235',
        awbNumber: 'AWB2024120202',
        senderLocationPincode: '110001',
        receiverLocationPincode: '560001',
        totalParcel: 85,
        totalAmount: 18500,
        franchiseName: 'Delhi North',
        franchiseCode: 'DEL002',
        franchiseOwner: 'Priya Singh',
        franchiseContact: '+91-9876543211',
        invoiceNumber: 'FINV-20241202-002',
        billingAmount: 18500,
        paidAmount: 10000,
        pendingAmount: 8500,
        billingDate: '2024-12-02',
        dueDate: '2025-01-01',
        status: 'Partial',
        paymentMethod: 'Cash',
        gstNumber: 'GST987654321',
        totalParcels: 85
      },
      {
        id: 3,
        mfNumber: 'MF001236',
        awbNumber: 'AWB2024120303',
        senderLocationPincode: '560001',
        receiverLocationPincode: '600001',
        totalParcel: 200,
        totalAmount: 32000,
        franchiseName: 'Bangalore South',
        franchiseCode: 'BLR003',
        franchiseOwner: 'Amit Kumar',
        franchiseContact: '+91-9876543212',
        invoiceNumber: 'FINV-20241203-003',
        billingAmount: 32000,
        paidAmount: 0,
        pendingAmount: 32000,
        billingDate: '2024-12-03',
        dueDate: '2024-12-25',
        status: 'Pending',
        paymentMethod: 'Online',
        gstNumber: 'GST456789123',
        totalParcels: 200
      },
      {
        id: 4,
        mfNumber: 'MF001237',
        awbNumber: 'AWB2024120404',
        senderLocationPincode: '600001',
        receiverLocationPincode: '700001',
        totalParcel: 300,
        totalAmount: 45000,
        franchiseName: 'Chennai East',
        franchiseCode: 'CHN004',
        franchiseOwner: 'Sunita Patel',
        franchiseContact: '+91-9876543213',
        invoiceNumber: 'FINV-20241204-004',
        billingAmount: 45000,
        paidAmount: 45000,
        pendingAmount: 0,
        billingDate: '2024-12-04',
        dueDate: '2024-12-30',
        status: 'Paid',
        paymentMethod: 'UPI',
        gstNumber: 'GST789123456',
        totalParcels: 300
      },
      {
        id: 5,
        mfNumber: 'MF001238',
        awbNumber: 'AWB2024120505',
        senderLocationPincode: '700001',
        receiverLocationPincode: '400001',
        totalParcel: 75,
        totalAmount: 15000,
        franchiseName: 'Kolkata West',
        franchiseCode: 'KOL005',
        franchiseOwner: 'Vikram Gupta',
        franchiseContact: '+91-9876543214',
        invoiceNumber: 'FINV-20241205-005',
        billingAmount: 15000,
        paidAmount: 0,
        pendingAmount: 15000,
        billingDate: '2024-12-05',
        dueDate: '2024-12-20',
        status: 'Overdue',
        paymentMethod: 'Bank Transfer',
        gstNumber: 'GST321654987',
        totalParcels: 75
      }
    ]
    
    setBillingData(sampleFranchiseBillingData)
    setFilteredData(sampleFranchiseBillingData)
  }, [])

  // Filter data based on search and filters
  useEffect(() => {
    let filtered = billingData

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.franchiseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.franchiseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.franchiseOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1'>
        <Topbar />
        <div className='p-6 max-w-[1200px] mx-auto'>
          {/* Header */}
          <div className='bg-gradient-to-r from-red-600 to-black rounded-lg shadow-lg p-6 mb-6'>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-full shadow-md">
                <BuildingOfficeIcon className="w-8 h-8 text-red-600" />
              </div>
              <div>
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
                  placeholder="Franchise, MF Number, AWB, Pincode, or Owner"
                />
              </div>
              <div>
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
              </div>
              <div>
                <Input 
                  type="date"
                  label="From Date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  icon={<CalendarIcon className="w-5 h-5" />}
                />
              </div>
              <div>
                <Input 
                  type="date"
                  label="To Date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  icon={<CalendarIcon className="w-5 h-5" />}
                />
              </div>
            </div>
          </div>

          {/* Franchise Billing Table */}
          <div className='bg-white rounded-lg shadow-lg border-2 border-red-100 overflow-hidden'>
            <div className="px-6 py-4 border-b-2 border-red-500 bg-gradient-to-r from-red-50 to-white">
              <h2 className='text-lg font-semibold text-black'>
                Franchise Billing Records ({filteredData.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      MF Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      AWB No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Sender Location Pincode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Receiver Location Pincode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Total Parcel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Total Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                              <DocumentTextIcon className="w-4 h-4 text-red-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-black">{item.mfNumber}</div>
                            <div className="text-xs text-gray-500">{item.franchiseCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">{item.awbNumber}</div>
                        <div className="text-xs text-gray-500">{item.franchiseName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
                              <BuildingOfficeIcon className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-black">{item.senderLocationPincode}</div>
                            <div className="text-xs text-gray-500">Sender</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
                              <BuildingOfficeIcon className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-black">{item.receiverLocationPincode}</div>
                            <div className="text-xs text-gray-500">Receiver</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
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
