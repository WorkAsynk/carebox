import React, { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import Barcode from 'react-barcode'
import QRCode from 'react-qr-code'
import Grclogo from '../../assets/logo/logocarebox.png'
import { Button } from '@material-tailwind/react'

const Shipping = ({ order, formatAddress, packages, totalActualWeight, totalVolumetricWeight, invoiceNo, invoiceValue, ewb, id }) => {
  const componentRef = useRef(null)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Shipping-Label',
  })

  return (
    <>
      <div className='flex justify-end mb-4'>
        <Button onClick={() => handlePrint()} className="bg-gradient-to-r from-gray-800 to-black text-white">
          Print Shipping Label
        </Button>
      </div>

      <div ref={componentRef} className='my-6 border-[2px] border-gray-800 rounded-lg shadow-xl max-w-[800px] mx-auto'>
        {/* Header Section */}
        <div className='bg-gradient-to-r from-gray-800 to-black text-white p-4 rounded-t-lg'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <img className='w-[80px] p-2 rounded' src={Grclogo} alt='logo' />
              <div>
                <h2 className='text-xl font-bold'>SHIPPING LABEL</h2>
                <p className='text-sm opacity-90'>www.carebox.com</p>
              </div>
            </div>
            <div className='text-right'>
              <p className='text-sm'>Date: {new Date(order?.created_at || Date.now()).toLocaleDateString()}</p>
              <p className='text-sm font-bold'>LR: {order?.lr_no || order?.order_no || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='p-6 bg-white'>
          <div className='grid grid-cols-3 gap-6'>
            {/* QR Code Section */}
            <div className='col-span-1 flex flex-col items-center justify-center border-2 border-gray-300 rounded-lg p-4'>
              <QRCode value={String(order?.lr_no || order?.order_no || id || '')} size={150} />
              <p className='text-xs text-center mt-2 font-semibold'>Scan QR Code</p>
            </div>

            {/* Order Information */}
            <div className='col-span-2 space-y-3'>
              <div className='border-b-2 border-gray-200 pb-2'>
                <p className='text-xs text-gray-600 font-semibold'>ORDER ID</p>
                <p className='text-lg font-bold text-gray-900'>{order?.order_id || order?.id || 'N/A'}</p>
              </div>

              <div className='border-b-2 border-gray-200 pb-2'>
                <p className='text-xs text-gray-600 font-semibold'>CONSIGNMENT NO.</p>
                <p className='text-lg font-bold text-red-600'>{order?.lr_no || order?.order_no || 'N/A'}</p>
              </div>

              <div className='grid grid-cols-3 gap-2'>
                <div className='border border-gray-300 rounded p-2 text-center'>
                  <p className='text-xs text-gray-600'>PACKETS</p>
                  <p className='text-lg font-bold'>{packages?.length || 1}</p>
                </div>
                <div className='border border-gray-300 rounded p-2 text-center'>
                  <p className='text-xs text-gray-600'>WEIGHT</p>
                  <p className='text-lg font-bold'>{totalActualWeight} kg</p>
                </div>
                <div className='border border-gray-300 rounded p-2 text-center'>
                  <p className='text-xs text-gray-600'>VOL. WT</p>
                  <p className='text-lg font-bold'>{totalVolumetricWeight} kg</p>
                </div>
              </div>
            </div>
          </div>

          {/* From & To Addresses */}
          <div className='grid grid-cols-2 gap-4 mt-6'>
            {/* From Address */}
            <div className='border-2 border-gray-300 rounded-lg p-4'>
              <div className='bg-gray-800 text-white px-3 py-1 rounded mb-3'>
                <p className='text-sm font-bold'>FROM (SHIPPER)</p>
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-bold text-gray-900'>
                  {order?.sender_address?.consignee_name || order?.sender?.name || 'N/A'}
                </p>
                <p className='text-xs text-gray-700'>
                  {formatAddress?.(order?.sender_address)}
                </p>
                <p className='text-xs text-gray-700'>
                  <span className='font-semibold'>City:</span> {order?.sender_address?.city || 'N/A'}
                </p>
                <p className='text-xs text-gray-700'>
                  <span className='font-semibold'>Pincode:</span> {order?.sender_address?.pincode || 'N/A'}
                </p>
                <p className='text-xs text-gray-700'>
                  <span className='font-semibold'>Phone:</span> {order?.sender_address?.phone || 'N/A'}
                </p>
              </div>
            </div>

            {/* To Address */}
            <div className='border-2 border-red-600 rounded-lg p-4'>
              <div className='bg-red-600 text-white px-3 py-1 rounded mb-3'>
                <p className='text-sm font-bold'>TO (CONSIGNEE)</p>
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-bold text-gray-900'>
                  {order?.receiver_address?.consignee_name || order?.receiver?.name || 'N/A'}
                </p>
                <p className='text-xs text-gray-700'>
                  {formatAddress?.(order?.receiver_address)}
                </p>
                <p className='text-xs text-gray-700'>
                  <span className='font-semibold'>City:</span> {order?.receiver_address?.city || 'N/A'}
                </p>
                <p className='text-xs text-gray-700'>
                  <span className='font-semibold'>Pincode:</span> {order?.receiver_address?.pincode || 'N/A'}
                </p>
                <p className='text-xs text-gray-700'>
                  <span className='font-semibold'>Phone:</span> {order?.receiver_address?.phone || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Barcode Section */}
          {/* <div className='mt-6 border-t-2 border-gray-200 pt-4 flex justify-center'>
            <Barcode 
              value={String(order?.lr_no || order?.order_no || id || '')} 
              width={2}
              height={60}
              displayValue={true}
              fontSize={14}
            />
          </div> */}

          {/* Footer */}
          <div className='mt-4 text-center border-t-2 border-gray-200 pt-3'>
            <p className='text-xs text-gray-600'>
              This is a computer-generated shipping label. Please affix this label on the package.
            </p>
            {/* <p className='text-xs text-gray-600 mt-1'>
              For queries: info@carebox.com | Customer Care: 1800-XXX-XXXX
            </p> */}
          </div>
        </div>
      </div>
    </>
  )
}

export default Shipping
