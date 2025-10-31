import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { FaArrowLeft, FaPrint } from 'react-icons/fa';
import QRCode from 'qrcode';

const BagShippingLabel = () => {
	const { awb_no } = useParams();
	const [bag, setBag] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [qrCodeUrl, setQrCodeUrl] = useState('');

	useEffect(() => {
		const fetchBag = async () => {
			try {
				setLoading(true);
				setError(null);
				const res = await axios.get(buildApiUrl(API_ENDPOINTS.BAG_DETAIL), {
					params: { awb_no }
				});
				const data = res.data?.bag || res.data?.data || res.data?.bagDetails || res.data;
				setBag(data);
			} catch (e) {
				setError('Failed to fetch bag details');
			} finally {
				setLoading(false);
			}
		};
		if (awb_no) fetchBag();
	}, [awb_no]);

	const bagNumber = bag?.awb_no || bag?.bag_awb_no || bag?.bagNumber || awb_no || '';
	
	// Sender details
	const senderName = bag?.source_address?.name || bag?.sender_name || '';
	const senderAddress = bag?.source_address?.address_line || bag?.source_address?.addressLine1 || '';
	const senderCity = bag?.source_address?.city || '';
	const senderState = bag?.source_address?.state || '';
	const senderPincode = bag?.source_address?.pincode || '';
	const senderPhone = bag?.source_address?.phone || '';
	
	// Receiver details
	const receiverName = bag?.destination_name || bag?.receiver_name || '';
	const receiverAddress = bag?.destination_address_li || bag?.destination_address_line || '';
	const receiverCity = bag?.destination_city || '';
	const receiverState = bag?.destination_state || '';
	const receiverPincode = bag?.destination_pincode || '';
	const receiverPhone = bag?.destination_phone || '';
	
	const createdAt = bag?.created_at ? new Date(bag.created_at) : new Date();
	const createdAtStr = createdAt.toLocaleDateString();
	const awbList = Array.isArray(bag?.package_awb_nos) ? bag.package_awb_nos : [];

	// Generate QR Code
	useEffect(() => {
		const generateQRCode = async () => {
			if (bagNumber) {
				try {
					const qrCodeDataURL = await QRCode.toDataURL(bagNumber, {
						width: 80,
						margin: 1,
						color: {
							dark: '#000000',
							light: '#FFFFFF'
						}
					});
					setQrCodeUrl(qrCodeDataURL);
				} catch (error) {
					console.error('Error generating QR code:', error);
				}
			}
		};
		generateQRCode();
	}, [bagNumber]);

	return (
		<div className='p-4'>
			<style>{`
				@media print {
					/* Hide everything on the page by default */
					body * {
						visibility: hidden;
					}

					/* Make the print-area and its children visible */
					#print-area, #print-area * {
						visibility: visible;
					}

					/* Position the print-area at the top-left of the page */
					#print-area {
						position: absolute !important;
						left: 0 !important;
						top: 0 !important;
						width: 4in !important;
						height: 2in !important;
						margin: 0 !important;
						padding: 0 !important;
						border: 2px solid #000 !important;
						box-shadow: none !important;
						background-color: white !important;
						display: block !important;
						page-break-inside: avoid !important;
					}

					/* Ensure no page breaks */
					@page {
						size: 4in 2in;
						margin: 0;
					}

					/* Hide navigation and other elements */
					.no-print {
						display: none !important;
					}

					/* Ensure colors print correctly */
					body {
						-webkit-print-color-adjust: exact;
						print-color-adjust: exact;
					}
				}
			`}</style>

			<div className='no-print mb-4 flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<Link to={`/bag-details/${bagNumber}`}>
						<button className='border border-gray-300 px-3 py-2 rounded hover:bg-gray-50'>
							<FaArrowLeft />
						</button>
					</Link>
					<h2 className='text-lg font-semibold'>Bag Shipping Label</h2>
				</div>
				<button 
					onClick={() => {
						// Ensure the print area is visible before printing
						const printArea = document.getElementById('print-area');
						if (printArea) {
							printArea.style.visibility = 'visible';
						}
						window.print();
					}} 
					className='flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'
				>
					<FaPrint />
					Print Shipping Label
				</button>
			</div>

			{loading && (
				<div className='p-10 flex flex-col items-center justify-center text-center'>
					<div className='relative h-14 w-14 mb-3'>
						<div className='absolute inset-0 rounded-full border-4 border-gray-200 border-t-red-600 animate-spin'></div>
					</div>
					<p className='text-sm text-gray-700 font-medium'>Loading Bag...</p>
				</div>
			)}
			{error && <div className='text-sm text-red-600'>{error}</div>}

			{!loading && !error && (
				<div className='flex justify-center'>
					<div
						id='print-area'
						className='bg-white text-black border-2 border-gray-800 rounded-lg shadow-lg'
						style={{ width: '4in', height: '2in' }}
					>
					<div className='h-full w-full p-2 flex'>
						{/* Left Side - QR Code */}
						<div className='w-20 flex flex-col items-center justify-center border-r-2 border-gray-300 pr-2'>
							{qrCodeUrl && (
								<>
									<img 
										src={qrCodeUrl} 
										alt={`QR Code for ${bagNumber}`}
										className='w-16 h-16 border border-gray-400'
									/>
									<div className='text-[6px] font-bold text-gray-800 mt-1 text-center'>
										{bagNumber}
									</div>
								</>
							)}
						</div>

						{/* Right Side - Content */}
						<div className='flex-1 flex flex-col pl-2'>
							{/* Header */}
							<div className='flex items-center justify-between mb-2 border-b-2 border-gray-800 pb-1'>
								<div className='text-[10px] font-bold text-gray-800'>AWB</div>
								<div className='text-[12px] font-black tracking-wider text-red-600'>{bagNumber}</div>
							</div>

							{/* Main Content */}
							<div className='flex-1 grid grid-cols-2 gap-2'>
								{/* Sender */}
								<div className='border border-gray-300 rounded p-1.5 bg-gray-50'>
									<div className='text-[8px] font-bold text-gray-800 mb-1 border-b border-gray-400 pb-0.5'>FROM</div>
									<div className='text-[7px] space-y-0.5'>
										<div className='font-semibold text-gray-900'>{senderName || 'N/A'}</div>
										{senderAddress && <div className='text-gray-700'>{senderAddress}</div>}
										<div className='text-gray-700'>
											{senderCity && senderCity}
											{senderState && `, ${senderState}`}
											{senderPincode && ` - ${senderPincode}`}
										</div>
										{senderPhone && <div className='text-gray-700 font-medium'>{senderPhone}</div>}
									</div>
								</div>

								{/* Receiver */}
								<div className='border border-gray-300 rounded p-1.5 bg-blue-50'>
									<div className='text-[8px] font-bold text-gray-800 mb-1 border-b border-gray-400 pb-0.5'>TO</div>
									<div className='text-[7px] space-y-0.5'>
										<div className='font-semibold text-gray-900'>{receiverName || 'N/A'}</div>
										{receiverAddress && <div className='text-gray-700'>{receiverAddress}</div>}
										<div className='text-gray-700'>
											{receiverCity && receiverCity}
											{receiverState && `, ${receiverState}`}
											{receiverPincode && ` - ${receiverPincode}`}
										</div>
										{receiverPhone && <div className='text-gray-700 font-medium'>{receiverPhone}</div>}
									</div>
								</div>
							</div>

							{/* Footer */}
							<div className='mt-1 pt-1 border-t border-gray-300'>
								<div className='flex items-center justify-between text-[7px]'>
									<div className='flex items-center gap-2'>
										<div className='font-semibold'>Date: {createdAtStr}</div>
										<div className='font-semibold text-red-600'>Packages: {awbList.length}</div>
									</div>
									<div className='text-[6px] font-bold text-gray-600'>CareBox</div>
								</div>
							</div>
						</div>
					</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default BagShippingLabel;

