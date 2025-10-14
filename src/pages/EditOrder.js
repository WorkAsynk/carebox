import React from 'react'
import { useParams } from 'react-router-dom'
import Topbar from '../component/Layout/Topbar'
import Sidebar from '../component/Layout/Sidebar'
import EditOrderForm from '../component/EditOrder/EditOrderForm'
import { buildApiUrl, API_ENDPOINTS } from '../config/api'
import axios from 'axios'
import { useState, useEffect } from 'react'

const EditOrder = () => {

  const { id } = useParams()
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  useEffect(() => {
		const fetchDetails = async () => {
			setLoading(true)
			setError(null)
			try {
				const res = await axios.post(buildApiUrl(API_ENDPOINTS.FETCH_ORDER_DETAIL), { order_id: id })
				console.log('Order details:', res.data)
				const data = res.data?.order || res.data?.data || res.data
				setOrderDetails(data)
			} catch (e) {
				console.error('Failed to fetch order details', e)
				setError('Failed to fetch order details')
			} finally {
				setLoading(false)
			}
		}
		if (id) fetchDetails()
	}, [id])

  return (
    <div className='flex'>
    <Sidebar />
    <div className='flex-1'>
      <Topbar />
      <div className="lg:p-6">
        <EditOrderForm data={orderDetails} loading={loading} error={error} />
      </div>
    </div>
  </div>
  )
}

export default EditOrder