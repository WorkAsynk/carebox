import React, { useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import BillingInvoice from '../components/Invoice/BillingInvoice'

const BillingInvoicePage = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const invoice = state?.invoice || {}
  const ref = useRef(null)

  console.log(invoice)

 

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1'>
        <Topbar />
        <div className='p-6 lg:max-w-[1200px] max-w-[400px] mx-auto'>
          <div className='flex items-center justify-start mb-4'>
            <button onClick={() => navigate(-1)} className='px-4 py-2 border rounded'>Back</button>
          </div>
          <div ref={ref}>
            <BillingInvoice 
              invoice={invoice}
              fullOrder={invoice?.fullOrder || null}
              packageName={invoice?.packageName || invoice?.fullOrder?.package_data?.[0]?.contents_description || 'Logistics Service'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingInvoicePage


