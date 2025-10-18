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
				// Filter bags where is_delete is false (if applicable)
				const activeBags = (res.data.bags || res.data || []).filter(bag => bag?.is_deleted === false || bag?.is_deleted === undefined);
				setBags(activeBags);
			} catch (error) {
				console.error('Error fetching bags:', error);
			}
		};
		fetchBags();
	}, []);
	console.log("bags",bags)

	const handleDeleteBag = async (bag_id) => {
		try {
			setShowOverlay(true);
			setOverlayStatus('loading');
			await axios.post(buildApiUrl(API_ENDPOINTS.DELETE_BAG), { 
				bag_id  
			});
			setBags(bags.filter(bag => bag.id !== bag_id));
			setOverlayStatus('success');
			setTimeout(() => {
				setShowOverlay(false);
			}, 800);
		} catch (error) {
			console.error('Error deleting bag:', error);
			setShowOverlay(false);
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

