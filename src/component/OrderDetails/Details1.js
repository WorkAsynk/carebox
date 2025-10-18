import React from 'react'
import { FaRupeeSign, FaFileInvoice, FaBox, FaUserAlt, FaUserCheck } from 'react-icons/fa'

const Details1 = ({data}) => {
	const isOrderCreatedStatus = (status) => {
		if (!status) return true; // No status means created
		const statusLower = status.toLowerCase();
		return statusLower.includes('created') || 
			   statusLower.includes('pending') || 
			   statusLower.includes('new');
	};

	const pkg = Array.isArray(data?.packages) ? data.packages[0] : null;
	const weightDisplay = (pkg?.actual_weight ?? data?.weight ?? 'N/A');
	const lengthDisplay = (pkg?.length ?? data?.length ?? 'N/A');
	const widthDisplay = (pkg?.width ?? data?.width ?? 'N/A');
	const heightDisplay = (pkg?.height ?? data?.height ?? 'N/A');
	const declaredValueDisplay = (data?.amount != null)
		? `₹${data.amount}`
		: (data?.declared_value != null)
			? `₹${data.declared_value}`
			: (pkg?.declared_value != null ? `₹${pkg.declared_value}` : 'N/A');
  return (
	<div className='bg-white p-4 rounded-md shadow-sm h-[75vh] mt-5 border border-gray-200 overflow-y-auto scrollbar-hide'>
		<div className='flex justify-between items-center'>
		<h2 className='font-semibold text-xl text-black'>Order Details #{data.order_id}</h2>
		<div className="text-gray-800">
						  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
							  isOrderCreatedStatus(data.status) ? 'bg-red-100 text-red-800' :
							(data.status === 'in_transit' || data.status === 'transit' || data.status === 'shipped') ? 'bg-gray-200 text-gray-800' :
							  (data.status === 'delivered' || data.status === 'completed') ? 'bg-black text-white' :
							  'bg-gray-100 text-gray-800'
						  }`}>
							  {data.status ? 
										(isOrderCreatedStatus(data.status) ? 'CREATED' :
						   data.status === 'in_transit' ? 'IN TRANSIT' : 
						   data.status === 'shipped' ? 'SHIPPED' :
						   data.status === 'transit' ? 'IN TRANSIT' :
						   data.status === 'delivered' ? 'DELIVERED' :
						   data.status === 'completed' ? 'COMPLETED' :
						   data.status.toUpperCase()) 
							  : 'PENDING'}
						  </span>
		</div>
		</div>

		<div className=''>
			{/* AWB Number Section */}
			<div className='mt-6'>
				<h3 className='text-lg font-semibold text-black mb-3'>AWB Number</h3>
				<div className='bg-white p-3 rounded-md border-2 border-dashed border-red-200'>
					<span className='text-2xl font-mono font-bold text-red-600 tracking-wider'>
						{data.awb_number || data.awb_no || data.order_no || 'N/A'}
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
							<span className='font-medium text-black'>{data?.sender_address?.consignee_name || data?.sender_address?.name || 'N/A'}</span>
						</div>
						<div className='text-sm'>
							<p>{data?.sender_address?.address_line || 'N/A'}</p>
							<p>{data?.sender_address?.city || ''}{(data?.sender_address?.city || data?.sender_address?.state) ? ', ' : ''}{data?.sender_address?.state || ''} {data?.sender_address?.pincode || ''}</p>
							{(data?.sender_address?.phone) && <p className='font-medium'>{data?.sender_address?.phone}</p>}
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
							<span className='font-medium text-black'>{data?.receiver_address?.consignee_name || data?.receiver_address?.name || 'N/A'}</span>
						</div>
						<div className='text-sm'>
							<p>{data?.receiver_address?.address_line || 'N/A'}</p>
							<p>{data?.receiver_address?.city || ''}{(data?.receiver_address?.city || data?.receiver_address?.state) ? ', ' : ''}{data?.receiver_address?.state || ''} {data?.receiver_address?.pincode || ''}</p>
							{(data?.receiver_address?.phone) && <p className='font-medium'>{data?.receiver_address?.phone}</p>}
						</div>
					</div>
				</div>
			</div>

			{/* Package Information */}
			<div className='mt-6 bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200'>
				<div className='flex items-center mb-4'>
					<FaBox className='text-red-600 mr-2' size={12} />
					<h3 className='text-lg font-semibold text-black'>Package Information</h3>
				</div>
				
				<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
					<div className='bg-white p-3 rounded-md shadow-sm border'>
						<div className='text-center'>
							<div className='text-2xl font-bold text-black'>{weightDisplay}</div>
							<div className='text-sm text-gray-600 font-medium'>Weight</div>
						</div>
					</div>
					<div className='bg-white p-3 rounded-md shadow-sm border'>
						<div className='text-center'>
							<div className='text-2xl font-bold text-black'>{lengthDisplay}</div>
							<div className='text-sm text-gray-600 font-medium'>Length</div>
						</div>
					</div>
					<div className='bg-white p-3 rounded-md shadow-sm border'>
						<div className='text-center'>
							<div className='text-2xl font-bold text-black'>{widthDisplay}</div>
							<div className='text-sm text-gray-600 font-medium'>Width</div>
						</div>
					</div>
					<div className='bg-white p-3 rounded-md shadow-sm border'>
						<div className='text-center'>
							<div className='text-2xl font-bold text-black'>{heightDisplay}</div>
							<div className='text-sm text-gray-600 font-medium'>Height</div>
						</div>
					</div>
				</div>

				{data.special_instructions && (
					<div className='mt-4 bg-white p-3 rounded-md shadow-sm border'>
						<span className='font-medium text-black'>Special Instructions:</span>
						<p className='text-gray-700 text-sm mt-1'>{data.special_instructions}</p>
					</div>
				)}
			</div>

			{/* Invoice Information */}
			<div className='mt-6 bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200'>
				<div className='flex items-center mb-4'>
					<FaFileInvoice className='text-black mr-2' />
					<h3 className='text-lg font-semibold text-black'>Invoice</h3>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<div className='bg-white p-3 rounded-md shadow-sm border'>
						<div className='text-center'>
							<div className='text-xs text-gray-600 font-medium'>Invoice No</div>
							<div className='text-lg font-bold text-black'>{data?.invoice?.inv_no || 'N/A'}</div>
						</div>
					</div>
					<div className='bg-white p-3 rounded-md shadow-sm border'>
						<div className='text-center'>
							<div className='text-xs text-gray-600 font-medium'>Amount</div>
							<div className='text-lg font-bold text-red-600 flex items-center justify-center gap-1'>
								<FaRupeeSign />{data?.invoice?.amount || 'N/A'}
							</div>
						</div>
					</div>
					<div className='bg-white p-3 rounded-md shadow-sm border'>
						<div className='text-center'>
							<div className='text-xs text-gray-600 font-medium'>E-Way Bill</div>
							<div className='text-lg font-bold text-black'>{data?.invoice?.ewaybill || 'N/A'}</div>
						</div>
					</div>
				</div>
			</div>
		</div>

	</div>
  )
}

export default Details1