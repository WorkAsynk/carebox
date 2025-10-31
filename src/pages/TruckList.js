import React, { useEffect, useState } from 'react';
import Sidebar from '../component/Layout/Sidebar';
import Topbar from '../component/Layout/Topbar';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import TruckListArea from '../component/TruckList/TruckListArea';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const TruckList = () => {
	const [trucks, setTrucks] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showOverlay, setShowOverlay] = useState(false);
	const [overlayStatus, setOverlayStatus] = useState('loading'); // 'loading' | 'success'

	useEffect(() => {
		const fetchTrucks = async () => {
			try {
				setIsLoading(true);
				const res = await axios.get(buildApiUrl(API_ENDPOINTS.TRUCK_LIST));
				let trucksData = [];
				if (Array.isArray(res.data?.truckList)) {
					trucksData = res.data.truckList;
				} else if (Array.isArray(res.data?.trucks)) {
					trucksData = res.data.trucks;
				} else if (Array.isArray(res.data)) {
					trucksData = res.data;
				}
				setTrucks(trucksData);
			} catch (error) {
				console.error('Error fetching trucks:', error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchTrucks();
	}, []);

	const handleDeleteTruck = async (truck) => {
		try {
			setShowOverlay(true);
			setOverlayStatus('loading');
			const awb_no = truck.awb_no || truck.truck_awb_no;
			if (!awb_no) throw new Error('AWB number not found for this truck');
			const response = await axios.delete(buildApiUrl(API_ENDPOINTS.TRUCK_DELETE), {
				data: { awb_no }
			});
			if (response.data?.success) {
				setTrucks(trucks.filter(t => (t.awb_no || t.truck_awb_no) !== awb_no));
				setOverlayStatus('success');
				setTimeout(() => setShowOverlay(false), 800);
			} else {
				throw new Error(response.data?.message || 'Failed to delete truck');
			}
		} catch (error) {
			console.error('Error deleting truck:', error);
			setShowOverlay(false);
			if (error.response?.status === 404) {
				console.error('Truck not found');
			} else if (error.response?.status === 400) {
				console.error('Missing awb_no');
			}
		}
	};

	return (
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				<div className="p-6">
					<TruckListArea trucks={trucks} handleDeleteTruck={handleDeleteTruck} loading={isLoading} />
				</div>
			</div>

			{showOverlay && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center">
						{overlayStatus === 'loading' && (
							<div className="flex flex-col items-center">
								<div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-gray-700 animate-spin mb-3"></div>
								<p className="text-gray-700 text-sm">Deleting truck...</p>
							</div>
						)}
						{overlayStatus === 'success' && (
							<div className="flex flex-col items-center">
								<CheckCircleIcon className="w-14 h-14 text-green-500" />
								<p className="text-gray-700 text-sm mt-2">Truck deleted successfully</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default TruckList;


