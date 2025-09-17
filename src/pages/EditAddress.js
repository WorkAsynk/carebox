import React from 'react'
import { useParams } from 'react-router-dom'
import Topbar from '../component/Layout/Topbar'
import Sidebar from '../component/Layout/Sidebar'
import EditAddressForm from '../component/EditAddress/EditAddressForm'
import { buildApiUrl, API_ENDPOINTS } from '../config/api'
import axios from 'axios'
import { useState, useEffect } from 'react'

const EditAddress = () => {

  const { id } = useParams()
  const [addressDetails, setAddressDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get(buildApiUrl(API_ENDPOINTS.FETCH_ALL_ADDRESSES))
        const addresses = res.data?.addresses || []
        const address = addresses.find(addr => addr.id === parseInt(id))
        if (address) {
          setAddressDetails(address)
        } else {
          setError('Address not found')
        }
      } catch (e) {
        console.error('Failed to fetch address details', e)
        setError('Failed to fetch address details')
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
        <div className="p-6">
          <EditAddressForm data={addressDetails} loading={loading} error={error} />
        </div>
      </div>
    </div>
  )
}

export default EditAddress
