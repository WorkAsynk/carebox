import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import axios from 'axios'
import { buildApiUrl, API_ENDPOINTS } from '../config/api'
import { FaArrowLeft, FaBoxOpen } from 'react-icons/fa'
import Shipping from '../component/Shipping/Shipping'

const ShippingLabel = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const formatAddress = (addr) => {
    if (!addr) return 'N/A'
    if (typeof addr === 'string') return addr
    const line = addr.address_line || addr.address || ''
    const city = addr.city || ''
    const state = addr.state || ''
    const pin = addr.pincode || ''
    const parts = [line, city, state].filter(Boolean).join(', ')
    return [parts, pin].filter(Boolean).join(' - ')
  }

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.post(buildApiUrl(API_ENDPOINTS.FETCH_ORDER_DETAIL), { order_id: id })
        setOrder(res.data?.order || res.data?.data || res.data)
      } catch (e) {
        setError('Failed to fetch order details')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchDetails()
  }, [id])

  // Derived helpers and data
  const toNumber = (value) => {
    const num = parseFloat(value)
    return Number.isFinite(num) ? num : 0
  }

  const packages = Array.isArray(order?.packages)
    ? order.packages
    : Array.isArray(order?.package_data)
      ? order.package_data
      : []

  const totalActualWeight = (packages?.length
    ? packages.reduce((sum, p) => sum + toNumber(p?.actual_weight), 0)
    : toNumber(order?.actual_weight) || toNumber(order?.weight)) || 0

  const totalVolumetricWeight = (packages?.length
    ? packages.reduce((sum, p) => sum + toNumber(p?.volumetric_weight), 0)
    : toNumber(order?.volumetric_weight)) || 0

  const invoiceNo = order?.invoice?.inv_no || order?.inv_no || order?.invoice_no || '—'
  const invoiceValue = order?.invoice?.amount || order?.inv_value || order?.amount || '0'
  const ewb = order?.ewaybill || order?.ewb || '—'

  return (
    <div className='flex'>
      <div className='flex-1'>
        
        <div className='p-6 max-w-[1200px] mx-auto'>

        

       {loading && <div className='text-sm text-gray-600'>
         <div className="p-10 flex flex-col items-center justify-center text-center">
                 <div className="relative h-14 w-14 mb-3">
                       <div className="absolute inset-0 rounded-full border-4 border-gray-200 border-t-red-600 animate-spin"></div>
                           <FaBoxOpen className="absolute inset-0 m-auto text-red-600" size={28} />
                       </div>
                    <p className="text-sm text-gray-700 font-medium">Loading Order Details...</p>
                 </div>
               </div>
       }
      {error && <div className='text-sm text-red-600'>{error}</div>}
      {!loading && !error && order && (
        <>
          <div className='flex items-center justify-start gap-3'>
            <Link to={'/orderlist'}>
              <button className='border-[1px] border-[#cecece] px-2 py-2 hover:shadow-blue-gray-200 shadow-sm flex items-center gap-2'>
                <FaArrowLeft/>
              </button>
            </Link>

            <h2 className='font-semibold text-xl'>Waybill</h2>
           
          </div>

         <Shipping order={order} formatAddress={formatAddress} packages={packages} totalActualWeight={totalActualWeight} totalVolumetricWeight={totalVolumetricWeight} invoiceNo={invoiceNo} invoiceValue={invoiceValue} ewb={ewb} id={id} />
       
        </>
      )}
    </div>
      </div>
    </div>
  )
}

export default ShippingLabel


