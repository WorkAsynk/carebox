import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { buildApiUrl, API_ENDPOINTS } from '../../config/api'
import { ROLES } from '../../config/rolePermissions'

const DeliveryDashboard = () => {
  const { user } = useSelector((state) => state.auth)

  const [remainingToDelivered, setRemainingToDelivered] = useState(0)
  const [delivered, setDelivered] = useState(0)
  const [undelivered, setUndelivered] = useState(0)

//   useEffect(() => {
//     // const fetchOrders = async () => {
//     //   try {
//     //     // Reuse existing orders endpoint. If franchise, pass mf_no as in HomeDashboard.
//     //     const isFranchise = user?.role === ROLES.FRANCHISE
//     //     const payload = {
//     //       type: isFranchise ? 'franchise' : 'admin',
//     //       ...(isFranchise ? { mf_no: String(user?.mf_no || '').replace(/\D/g, '') } : {})
//     //     }
//     //     const { data } = await axios.post(buildApiUrl(API_ENDPOINTS.FETCH_ALL_ORDERS), payload)
//     //     const list = Array.isArray(data) ? data : (Array.isArray(data?.orders) ? data.orders : [])

//     //     let deliveredCount = 0
//     //     let undeliveredCount = 0
//     //     let remainingCount = 0
//     //     list.forEach((o) => {
//     //       const s = String(o?.status || '').toLowerCase()
//     //       if (s.includes('delivered')) {
//     //         deliveredCount += 1
//     //       } else if (s.includes('undelivered')) {
//     //         undeliveredCount += 1
//     //       } else {
//     //         remainingCount += 1
//     //       }
//     //     })
//     //     setDelivered(deliveredCount)
//     //     setUndelivered(undeliveredCount)
//     //     setRemainingToDelivered(remainingCount)
//     //   } catch (e) {
//     //     setDelivered(0)
//     //     setUndelivered(0)
//     //     setRemainingToDelivered(0)
//     //   }
//     // }
//     // fetchOrders()
//   }, [user])

  return (
    <div className='pr-[2%] lg:pl-[20%] pl-[5%] py-[3%] flex max-w-7xl flex-col gap-6 p-6'>
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-black text-white rounded-xl p-6 w-full shadow-md">
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-1">Delivery Overview</h2>
            <p className="text-sm text-white/90">Live snapshot of your delivery orders</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto'>
        <div className='rounded-xl bg-white border border-gray-200 px-4 py-4 shadow-sm hover:border-red-500/50 transition'>
          <div className='text-[11px] uppercase tracking-wide text-gray-500'>Remaining to Deliver</div>
          <div className='text-3xl font-semibold text-red-600 mt-1'>0</div>
        </div>
        <div className='rounded-xl bg-white border border-gray-200 px-4 py-4 shadow-sm hover:border-red-500/50 transition'>
          <div className='text-[11px] uppercase tracking-wide text-gray-500'>Delivered</div>
          <div className='text-3xl font-semibold text-red-600 mt-1'>{delivered}</div>
        </div>
        <div className='rounded-xl bg-white border border-gray-200 px-4 py-4 shadow-sm hover:border-red-500/50 transition'>
          <div className='text-[11px] uppercase tracking-wide text-gray-500'>Undelivered</div>
          <div className='text-3xl font-semibold text-red-600 mt-1'>{undelivered}</div>
        </div>
      </div>

    </div>
  )
}

export default DeliveryDashboard