import React from 'react'
import { FaBox, FaUserAlt, FaUserCheck, FaList, FaCalendarAlt } from 'react-icons/fa'

const BagDetailsInfo = ({ data }) => {
  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isBagDelivered = (delivered) => {
    return delivered === true || delivered === 'true' || delivered === 'Delivered'
  }

  return (
    <div className='bg-white p-4 rounded-md shadow-sm h-[75vh] mt-5 border border-gray-200 overflow-y-auto scrollbar-hide'>
      <div className='flex justify-between items-center'>
        <h2 className='font-semibold text-xl text-black'>Bag Details #{data?.id || 'N/A'}</h2>
        <div className="text-gray-800">
          {/* <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isBagDelivered(data?.delivered) ? 'bg-black text-white' : 'bg-red-100 text-red-800'
          }`}>
            {isBagDelivered(data?.delivered) ? 'DELIVERED' : 'PENDING'}
          </span> */}
        </div>
      </div>

      <div className=''>
        {/* AWB Number Section */}
        <div className='mt-6'>
          <h3 className='text-lg font-semibold text-black mb-3'>AWB Number</h3>
          <div className='bg-white p-3 rounded-md border-2 border-dashed border-red-200'>
            <span className='text-2xl font-mono font-bold text-red-600 tracking-wider'>
              {data?.awb_no || data?.awb || 'N/A'}
            </span>
          </div>
        </div>

        {/* Sender and Receiver Section */}
        <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Sender Address */}
          <div className='bg-gradient-to-br from-red-50 to-white p-4 rounded-lg border border-red-200'>
            <div className='flex items-center mb-3'>
              <FaUserAlt className='text-red-600 mr-2' size={14} />
              <h3 className='text-lg font-semibold text-red-800'>Sender Details</h3>
            </div>
            <div className='space-y-2 text-gray-800'>
              <div>
                <span className='font-medium text-black'>{data?.source_address?.name || 'N/A'}</span>
              </div>
              <div className='text-sm'>
                <p>{data?.source_address?.addressLine1 || 'N/A'}</p>
                <p>{data?.source_address?.addressLine2 || ''}</p>
                <p>{data?.source_address?.city || ''}{(data?.source_address?.city || data?.source_address?.state) ? ', ' : ''}{data?.source_address?.state || ''} {data?.source_address?.pincode || ''}</p>
                {data?.source_address?.landmark && <p className='font-medium'>Landmark: {data.source_address.landmark}</p>}
              </div>
            </div>
          </div>

          {/* Receiver Address */}
          <div className='bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200'>
            <div className='flex items-center mb-3'>
              <FaUserCheck className='text-black mr-2' size={14} />
              <h3 className='text-lg font-semibold text-black'>Receiver Details</h3>
            </div>
            <div className='space-y-2 text-gray-800'>
              <div>
                <span className='font-medium text-black'>{data?.destination_name || 'N/A'}</span>
              </div>
              <div className='text-sm'>
                <p>{data?.destination_address_li || 'N/A'}</p>
                <p>{data?.destination_city || ''}{(data?.destination_city || data?.destination_state) ? ', ' : ''}{data?.destination_state || ''} {data?.destination_pincode || ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bag Information */}
        <div className='mt-6 bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200'>
          <div className='flex items-center mb-4'>
            <FaBox className='text-red-600 mr-2' size={12} />
            <h3 className='text-lg font-semibold text-black'>Bag Information</h3>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-white p-3 rounded-md shadow-sm border'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-black'>{data?.id || 'N/A'}</div>
                <div className='text-sm text-gray-600 font-medium'>Bag ID</div>
              </div>
            </div>
            <div className='bg-white p-3 rounded-md shadow-sm border'>
              <div className='text-center'>
                <div className='text-md font-bold text-black'>{formatDate(data?.created_at)}</div>
                <div className='text-sm text-gray-600 font-medium'>Created Date</div>
              </div>
            </div>
            <div className='bg-white p-3 rounded-md shadow-sm border'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-black'>{data?.package_awb_nos?.length || 0}</div>
                <div className='text-sm text-gray-600 font-medium'>Packages</div>
              </div>
            </div>
          </div>
        </div>

        {/* Package AWB Numbers */}
        {data?.package_awb_nos && Array.isArray(data.package_awb_nos) && data.package_awb_nos.length > 0 && (
          <div className='mt-6 bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200'>
            <div className='flex items-center mb-4'>
              <FaList className='text-black mr-2' />
              <h3 className='text-lg font-semibold text-black'>Package AWB Numbers ({data.package_awb_nos.length})</h3>
            </div>
            <div className='max-h-40 overflow-y-auto'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
                {data.package_awb_nos.map((awb, index) => (
                  <div key={index} className='bg-white p-3 rounded-md shadow-sm border text-center'>
                    <div className='text-sm font-mono font-bold text-red-600'>{awb}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BagDetailsInfo
