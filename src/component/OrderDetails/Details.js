import React from 'react'
import { FaArrowLeft, FaBoxOpen } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import Details1 from './Details1'
import UpdateOrder from './UpdateOrder'

const Details = ({ data, loading, error }) => {
  if (loading) return (
    <div className="p-10 flex flex-col items-center justify-center text-center">
      <div className="relative h-14 w-14 mb-3">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 border-t-red-600 animate-spin"></div>
        <FaBoxOpen className="absolute inset-0 m-auto text-red-600" size={28} />
      </div>
      <p className="text-sm text-gray-700 font-medium">Loading Order Details...</p>
    </div>
  )
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!data) return <div className="p-6">No details available.</div>

  return (
   <>
    <div className='max-w-[1200px] mx-auto'>
      <div className='flex gap-3 items-center mt-10'>
        <Link to={"/orderlist"}>
            <button className='border-[1px] border-[#cecece] px-2 py-2 hover:shadow-blue-gray-200 shadow-sm'>
                <FaArrowLeft />
            </button>
        </Link>
        <h2 className='font-semibold text-xl'>Order Details</h2>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <Details1 data={data} />
        </div>
        <div>
          <UpdateOrder />
        </div>
      </div>

   </div>
   </>
  )
}

export default Details