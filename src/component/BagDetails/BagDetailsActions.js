import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import SubBagModal from './SubBagModal'

const BagDetailsActions = ({ data }) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className='bg-white p-4 rounded-md shadow-sm h-[75vh] mt-5 border border-gray-200 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='font-semibold text-xl'>Update Bag</h2>
          <button
            onClick={() => setShowModal(true)}
            className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2'
          >
            <FaPlus className='text-sm' />
            Create Sub-Bag
          </button>
        </div>
        
        <div className='text-gray-600'>
          <p className='mb-2'>Current Bag: <span className='font-semibold'>{data?.awb_no || 'N/A'}</span></p>
          <p className='mb-2'>Packages: <span className='font-semibold'>{data?.package_awb_nos?.length || 0}</span></p>
          <p className='text-sm'>Click "Create Sub-Bag" to transfer packages to a new bag.</p>
        </div>
      </div>

      {/* Sub-Bag Modal */}
      <SubBagModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        bagData={data} 
      />
    </>
  )
}

export default BagDetailsActions
