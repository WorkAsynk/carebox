import React, { useState, useEffect } from 'react'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import { useSelector } from 'react-redux'
import { Input, Select, Option } from '@material-tailwind/react'
import { 
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

const InvoiceDownload = () => {
  const { user } = useSelector((state) => state.auth)
  
  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [invoices, setInvoices] = useState([])
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [selectedCourier, setSelectedCourier] = useState('')
  const [companyName, setCompanyName] = useState(user.co_name)
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')

  
  // Sample invoice data
  useEffect(() => {
    const sampleInvoices = [
      {
        id: 1,
        invoiceNumber: 'INV-20241201-001',
        clientName: 'ABC Corporation',
        amount: 25000,
        date: '2024-12-01',
        dueDate: '2024-12-31',
        status: 'Paid',
        createdBy: 'Admin User'
      },
      {
        id: 2,
        invoiceNumber: 'INV-20241202-002',
        clientName: 'XYZ Ltd.',
        amount: 18500,
        date: '2024-12-02',
        dueDate: '2025-01-01',
        status: 'Pending',
        createdBy: 'Franchise Manager'
      },
      {
        id: 3,
        invoiceNumber: 'INV-20241203-003',
        clientName: 'Tech Solutions Inc.',
        amount: 32000,
        date: '2024-12-03',
        dueDate: '2025-01-02',
        status: 'Overdue',
        createdBy: 'Operations Team'
      },
      {
        id: 4,
        invoiceNumber: 'INV-20241204-004',
        clientName: 'Global Logistics',
        amount: 15750,
        date: '2024-12-04',
        dueDate: '2025-01-03',
        status: 'Draft',
        createdBy: 'Admin User'
      },
      {
        id: 5,
        invoiceNumber: 'INV-20241205-005',
        clientName: 'Express Delivery Co.',
        amount: 28900,
        date: '2024-12-05',
        dueDate: '2025-01-04',
        status: 'Paid',
        createdBy: 'Franchise Manager'
      }
    ]
    setInvoices(sampleInvoices)
    setFilteredInvoices(sampleInvoices)
  }, [])

  // Filter invoices based on search and filters
  useEffect(() => {
    let filtered = invoices

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(invoice => invoice.status === statusFilter)
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(invoice => new Date(invoice.date) >= new Date(dateFrom))
    }
    if (dateTo) {
      filtered = filtered.filter(invoice => new Date(invoice.date) <= new Date(dateTo))
    }

    setFilteredInvoices(filtered)
  }, [searchTerm, statusFilter, dateFrom, dateTo, invoices])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-red-100 text-red-800'
      case 'Pending': return 'bg-black text-white'
      case 'Overdue': return 'bg-red-500 text-white'
      case 'Draft': return 'bg-gray-100 text-black'
      default: return 'bg-gray-100 text-black'
    }
  }

  const handleDownload = (invoice) => {
    // Handle invoice download
    console.log('Downloading invoice:', invoice.invoiceNumber)
    // In real implementation, this would trigger PDF download
  }

  const handlePreview = (invoice) => {
    // Handle invoice preview
    console.log('Previewing invoice:', invoice.invoiceNumber)
    // In real implementation, this would open preview modal
  }

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1'>
        <Topbar />
        <div className='p-6 max-w-[1100px] mx-auto'>
          {/* Header */}
          <div className='bg-gradient-to-r from-red-600 to-black rounded-lg shadow-lg p-6 mb-6'>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-full shadow-md">
                <DocumentArrowDownIcon className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className='text-2xl font-semibold text-white mb-1'>Invoice Download</h1>
                <p className='text-red-100'>View and download your invoices</p>
              </div>
            </div>
          </div>
         

            {/* Search List */}
            <div className='bg-white rounded-lg shadow-lg border-2 border-red-100 p-6 mb-6'>
              <h2 className='text-lg font-semibold text-black mb-4 border-b-2 border-red-500 pb-2'>Search Invoice</h2>
             <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
               
               {/* Company Name */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-black">Company Name</label>
                 <Input 
                  label="Company Name"
                  value={companyName}
                  disabled
                  placeholder="Enter company name"
                />
               </div>

               {/* Year Selection */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-black">Year</label>
                 <Select 
                   label="Select Year"
                   value={year}
                   onChange={(val) => console.log('Year selected:', val)}
                 >
                   <Option value="2024">2024</Option>
                   <Option value="2023">2023</Option>
                   <Option value="2022">2022</Option>
                   <Option value="2021">2021</Option>
                   <Option value="2020">2020</Option>
                 </Select>
               </div>

               {/* Month Selection */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-black">Month</label>
                 <Select 
                   label="Select Month"
                   value={month}
                   onChange={(val) => console.log('Month selected:', val)}
                 >
                   <Option value="01">January</Option>
                   <Option value="02">February</Option>
                   <Option value="03">March</Option>
                   <Option value="04">April</Option>
                   <Option value="05">May</Option>
                   <Option value="06">June</Option>
                   <Option value="07">July</Option>
                   <Option value="08">August</Option>
                   <Option value="09">September</Option>
                   <Option value="10">October</Option>
                   <Option value="11">November</Option>
                   <Option value="12">December</Option>
                 </Select>
               </div>
             </div>

             {/* Generated Branch Code Display */}
             

              {/* Quick Search Options */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-black mb-3 border-l-4 border-red-500 pl-3">Quick Search</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-md">
                    Current Month
                  </button>
                  <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-md">
                    Last 3 Months
                  </button>
                  <button className="px-4 py-2 border-2 border-red-500 text-red-500 bg-white rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                    This Year
                  </button>
                  <button className="px-4 py-2 border-2 border-black text-black bg-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    All Time
                  </button>
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
                  icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                  placeholder="Invoice number or client name"
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
                  <Option value="Pending">Pending</Option>
                  <Option value="Overdue">Overdue</Option>
                  <Option value="Draft">Draft</Option>
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
           {/* Invoices Table */}
           <div className='bg-white  shadow-lg border-2 border-red-100 overflow-hidden'>
            <div className="px-6 py-4 border-b-2 border-red-500 bg-gradient-to-r from-red-50 to-white">
              <h2 className='text-lg font-semibold text-black'>
                Invoices ({filteredInvoices.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              {/* Header Row */}
              <div className="grid grid-cols-7 text-left bg-black text-white font-semibold px-4 py-3 rounded-t-md text-sm min-w-[900px]">
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">Invoice Number</div>
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">Client</div>
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">Amount</div>
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">Date</div>
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">Due Date</div>
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">Status</div>
                <div className="px-2 py-1 text-xs font-medium text-white uppercase tracking-wider">Actions</div>
              </div>
              {/* Data Rows */}
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="grid grid-cols-7 text-sm px-4 py-3 border-b hover:bg-gray-50 min-w-[900px]"
                >
                  <div className="px-2 py-2">
                    <div className="flex items-center">
                     
                      <span className="text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </span>
                    </div>
                  </div>
                  <div className="px-2 py-2">
                    <span className="text-sm text-gray-900">{invoice.clientName}</span>
                  </div>
                  <div className="px-2 py-2">
                    <span className="text-sm font-medium text-gray-900">
                      ₹{invoice.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="px-2 py-2">
                    <span className="text-sm text-gray-900">
                      {new Date(invoice.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="px-2 py-2">
                    <span className="text-sm text-gray-900">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="px-2 py-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="px-2 py-2">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handlePreview(invoice)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
                        title="Preview"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDownload(invoice)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          {filteredInvoices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
              <div className="bg-white rounded-lg shadow-lg border-2 border-red-100 p-6">
                <h3 className="text-sm font-medium text-black mb-2">Total Invoices</h3>
                <p className="text-2xl font-bold text-red-600">{filteredInvoices.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg border-2 border-red-100 p-6">
                <h3 className="text-sm font-medium text-black mb-2">Total Amount</h3>
                <p className="text-2xl font-bold text-black">
                  ₹{filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg border-2 border-red-100 p-6">
                <h3 className="text-sm font-medium text-black mb-2">Paid</h3>
                <p className="text-2xl font-bold text-red-600">
                  {filteredInvoices.filter(inv => inv.status === 'Paid').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg border-2 border-red-100 p-6">
                <h3 className="text-sm font-medium text-black mb-2">Pending</h3>
                <p className="text-2xl font-bold text-black">
                  {filteredInvoices.filter(inv => inv.status === 'Pending').length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InvoiceDownload
