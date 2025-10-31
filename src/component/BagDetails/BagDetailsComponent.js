import React from 'react'
import { FaArrowLeft, FaBoxOpen, FaTag, FaFileInvoice } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import BagDetailsInfo from './BagDetailsInfo'
import BagDetailsActions from './BagDetailsActions'

const BagDetailsComponent = ({ data, loading, error }) => {
  if (loading) return (
    <div className="p-10 flex flex-col items-center justify-center text-center">
      <div className="relative h-14 w-14 mb-3">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 border-t-red-600 animate-spin"></div>
        <FaBoxOpen className="absolute inset-0 m-auto text-red-600" size={28} />
      </div>
      <p className="text-sm text-gray-700 font-medium">Loading Bag Details...</p>
    </div>
  )
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!data) return <div className="p-6">No details available.</div>

  const bagNumber = data?.awb_no || data?.bag_awb_no || data?.bagNumber || ''

  return (
   <>
    <div className='max-w-[1200px] mx-auto'>
      <div className='flex gap-3 items-center mt-10'>
        <Link to={"/bag-list"}>
            <button className='border-[1px] border-[#cecece] px-2 py-2 hover:shadow-blue-gray-200 shadow-sm'>
                <FaArrowLeft />
            </button>
        </Link>
        <h2 className='font-semibold text-xl'>Bag Details</h2>

        {/* Action buttons aligned right */}
        <div className='ml-auto flex items-center gap-3'>
          <Link to={`/bag-shipping-label/${bagNumber}`}>
            <button className='px-4 py-2 text-sm bg-gradient-to-r from-gray-800 to-black text-white rounded-lg hover:from-gray-900 hover:to-gray-800 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2'>
              <FaTag className='text-white' />
              <span className='font-medium'>Shipping Label</span>
            </button>
          </Link>
          {/* <Link to={`/waybill/${data?.id || data?.bag_id || ''}`}>
            <button className='px-4 py-2 text-sm bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2'>
              <FaFileInvoice className='text-white' />
              <span className='font-medium'>Waybill</span>
            </button>
          </Link> */}
        </div>

      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <BagDetailsInfo data={data} />
        </div>
        <div>
          <BagDetailsActions data={data} />
        </div>
      </div>

   </div>
   </>
  )
}

export default BagDetailsComponent
