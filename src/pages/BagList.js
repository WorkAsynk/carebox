import React, { useEffect, useState } from 'react';
import Sidebar from '../component/Layout/Sidebar';
import Topbar from '../component/Layout/Topbar';
import axios from 'axios';
import BagListArea from '../component/BagList/BagListArea';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const BagList = () => {
	const [bags, setBags] = useState([]);
	const [showOverlay, setShowOverlay] = useState(false);
	const [overlayStatus, setOverlayStatus] = useState('loading'); // 'loading' | 'success'

	useEffect(() => {
		const fetchBags = async () => {
			try {
				const res = await axios.get(buildApiUrl(API_ENDPOINTS.FETCH_ALL_BAGS));
				console.log('API Response:', res.data);
				
				// Handle the actual API response structure - looking for bagList property
				let bagsData = [];
				
				if (res.data.bagList && Array.isArray(res.data.bagList)) {
					// If response has bagList property (from your JSON structure)
					bagsData = res.data.bagList;
				} else if (res.data.baglist && Array.isArray(res.data.baglist)) {
					// Fallback for baglist property
					bagsData = res.data.baglist;
				} else if (res.data.bags && Array.isArray(res.data.bags)) {
					// Fallback for bags property
					bagsData = res.data.bags;
				} else if (Array.isArray(res.data)) {
					// If response is directly an array
					bagsData = res.data;
				}

				// console.log('Extracted bagsData:', bagsData);
				setBags(bagsData);
			} catch (error) {
				console.error('Error fetching bags:', error);
			}
		};
		fetchBags();
	}, []);
	console.log("bags",bags)

	const handleDeleteBag = async (bag) => {
		try {
			setShowOverlay(true);
			setOverlayStatus('loading');
			
			// Use awb_no instead of bag_id as per API specification
			const awb_no = bag.awb_no || bag.bag_awb_no || bag.bagNumber;
			
			if (!awb_no) {
				throw new Error('AWB number not found for this bag');
			}

			// Call DELETE API with awb_no in body as per specification
			const response = await axios.delete(buildApiUrl(API_ENDPOINTS.DELETE_BAG), {
				data: { awb_no: awb_no }
			});
			
			if (response.data.success) {
				setBags(bags.filter(b => b.id !== bag.id));
				setOverlayStatus('success');
				setTimeout(() => {
					setShowOverlay(false);
				}, 800);
			} else {
				throw new Error(response.data.message || 'Failed to delete bag');
			}
		} catch (error) {
			console.error('Error deleting bag:', error);
			setShowOverlay(false);
			// You might want to show an error toast here
			if (error.response?.status === 404) {
				console.error('Bag not found');
			} else if (error.response?.status === 400) {
				console.error('Missing awb_no');
			}
		}
	};

	console.log(bags)
	return (	
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				<div className="p-6">
					<BagListArea bags={bags} handleDeleteBag={handleDeleteBag} />
				</div>
			</div>

			{showOverlay && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center">
						{overlayStatus === 'loading' && (
							<div className="flex flex-col items-center">
								<div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-gray-700 animate-spin mb-3"></div>
								<p className="text-gray-700 text-sm">Deleting bag...</p>
							</div>
						)}
						{overlayStatus === 'success' && (
							<div className="flex flex-col items-center">
								<CheckCircleIcon className="w-14 h-14 text-green-500" />
								<p className="text-gray-700 text-sm mt-2">Bag deleted successfully</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default BagList;

