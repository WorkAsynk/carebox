import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import BagDetailsComponent from '../component/BagDetails/BagDetailsComponent'
import axios from 'axios'
import { buildApiUrl, API_ENDPOINTS } from '../config/api'

const BagDetails = () => {
	const { awb_no } = useParams()
	const [bagDetails, setBagDetails] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	useEffect(() => {
		const fetchDetails = async () => {
			setLoading(true)
			setError(null)
			try {
				const res = await axios.get(buildApiUrl(API_ENDPOINTS.BAG_DETAIL), {
					params: { awb_no: awb_no }
				})
				console.log('Bag details:', res.data)
				const data = res.data?.bag || res.data?.data || res.data?.bagDetails || res.data
				setBagDetails(data)
			} catch (e) {
				console.error('Failed to fetch bag details', e)
				if (e.response?.status === 400) {
					setError('No bag found or invalid AWB number')
				} else {
					setError('Failed to fetch bag details')
				}
			} finally {
				setLoading(false)
			}
		}
		if (awb_no) fetchDetails()
	}, [awb_no])
	
	console.log('Bag details:', bagDetails)

  return (
	<div className='flex'>
		<Sidebar />
		<div className='flex-1'>
			<Topbar />
			<BagDetailsComponent data={bagDetails} loading={loading} error={error} />
		</div>
	</div>
  )
}

export default BagDetails
