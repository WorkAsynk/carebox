import React, { useState } from 'react';
import Sidebar from '../component/Layout/Sidebar';
import Topbar from '../component/Layout/Topbar';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { 
    MagnifyingGlassIcon, 
    CheckCircleIcon,
    ClipboardDocumentCheckIcon,
    TruckIcon,
    CubeIcon,
    HomeIcon as HomeDeliveryIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const Tracker = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Helper function to format date and time
    const formatDateTime = (dateString) => {
        if (!dateString) return { date: 'N/A', time: 'N/A' };
        
        try {
            const date = new Date(dateString);
            const dateFormatted = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: '2-digit', 
                year: 'numeric' 
            });
            const timeFormatted = date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
            return { date: dateFormatted, time: timeFormatted };
        } catch (error) {
            return { date: 'N/A', time: 'N/A' };
        }
    };

    // Define all possible tracking stages in order
    const getAllPossibleStages = () => [
        { name: 'Order Created', iconIndex: 0, key: 'created' },
        { name: 'Order Shipped', iconIndex: 1, key: 'shipped' },
        { name: 'Order In Transit', iconIndex: 2, key: 'transit' },
        { name: 'Order Pickup', iconIndex: 2, key: 'pickup' },
        { name: 'Order Delivery', iconIndex: 3, key: 'delivery' }
    ];

    // Helper function to map order status to stage key
    const mapStatusToStageKey = (staffComment) => {
        const statusMapping = {
            'Order Created': 'created',
            'Created': 'created',
            'Order Shipped': 'shipped',
            'Package Shipped': 'shipped',
            'Package Shipped!': 'shipped',
            'Shipped': 'shipped',
            'Order In Transit': 'transit',
            'In Transit': 'transit',
            'Order Pickup': 'pickup',
            'Pickup': 'pickup',
            'Order Delivery': 'delivery',
            'Order Delivered': 'delivery',
            'Delivered': 'delivery',
            'Out for Delivery': 'delivery',
            'Order Cancelled': 'created',
            'Cancelled': 'created',
            'RTO': 'transit',
        };
        return statusMapping[staffComment] || 'created';
    };

    const handleTrack = async () => {
        if (!trackingNumber.trim()) {
            setError('Please enter an AWB/Tracking number');
            return;
        }
        
        setLoading(true);
        setError(null);
        setTrackingData(null);

        try {
            const token = localStorage.getItem('token');
            const url = `${buildApiUrl(API_ENDPOINTS.FETCH_ORDER_STATUS_BY_AWB)}?awb_no=${encodeURIComponent(trackingNumber.trim())}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    setError('Missing required parameter: AWB number');
                } else if (response.status === 404) {
                    setError('Package not found with the given AWB number');
                } else if (response.status === 500) {
                    setError('Server error occurred. Please try again later.');
                } else {
                    setError(data.message || 'An error occurred while tracking the order');
                }
                setLoading(false);
                return;
            }

            // Map the API response to our tracking data format
            if (data.success && data.orderStatuses && data.orderStatuses.length > 0) {
                // Get all possible stages
                const allPossibleStages = getAllPossibleStages();
                
                // Create a map of completed stages from API data
                const completedStagesMap = {};
                data.orderStatuses.forEach((orderStatus) => {
                    const stageKey = mapStatusToStageKey(orderStatus.staff_comment);
                    const { date, time } = formatDateTime(orderStatus.record_time);
                    
                    completedStagesMap[stageKey] = {
                        name: orderStatus.staff_comment,
                        date: date,
                        time: time,
                        location: 'N/A',
                        completed: true,
                        remarks: orderStatus.staff_comment || '',
                        recordTime: orderStatus.record_time
                    };
                });

                // Build complete timeline with all stages
                const stages = allPossibleStages.map((stage) => {
                    const completedStage = completedStagesMap[stage.key];
                    
                    if (completedStage) {
                        // Use the actual status name from API for shipped stage, otherwise use stage name
                        const displayName = (stage.key === 'shipped' && completedStage.remarks) 
                            ? completedStage.remarks 
                            : stage.name;
                        
                        return {
                            name: displayName,
                            date: completedStage.date,
                            time: completedStage.time,
                            location: completedStage.location,
                            completed: true,
                            iconIndex: stage.iconIndex,
                            remarks: completedStage.remarks
                        };
                    } else {
                        return {
                            name: stage.name,
                            date: 'N/A',
                            time: 'N/A',
                            location: 'N/A',
                            completed: false,
                            iconIndex: stage.iconIndex,
                            remarks: ''
                        };
                    }
                });

                // Get the latest status for current status display
                const latestStatus = data.orderStatuses[data.orderStatuses.length - 1];
                const currentStatus = latestStatus?.staff_comment || 'Processing';

                // Get package status info if available
                const latestPackageStatus = data.packageStatus?.[data.packageStatus.length - 1];
                const currentLocation = latestPackageStatus?.location || 'Processing';

                setTrackingData({
                    awb: data.awb_no,
                    package_id: data.package_id,
                    order_id: data.order_id,
                    status: currentStatus,
                    currentLocation: currentLocation,
                    stages: stages
                });
            } else if (data.success && (!data.orderStatuses || data.orderStatuses.length === 0)) {
                // Handle case where order exists but no status history - show all stages as incomplete
                const allPossibleStages = getAllPossibleStages();
                const stages = allPossibleStages.map((stage) => ({
                    name: stage.name,
                    date: 'N/A',
                    time: 'N/A',
                    location: 'N/A',
                    completed: false,
                    iconIndex: stage.iconIndex,
                    remarks: ''
                }));

                setTrackingData({
                    awb: data.awb_no,
                    package_id: data.package_id,
                    order_id: data.order_id,
                    status: 'No Status Available',
                    currentLocation: 'Processing',
                    stages: stages
                });
            } else {
                setError('No tracking information available for this AWB number');
            }

        } catch (error) {
            console.error('Error tracking order:', error);
            setError('Failed to connect to the server. Please check your internet connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex'>
            <Sidebar />
            <div className='flex-1'>
                <Topbar />
                <div className='p-6'>
                    <div className='lg:max-w-4xl max-w-[400px] mx-auto'>
                        <h1 className='text-3xl font-bold text-gray-800 mb-6'>Track Your Order</h1>
                        
                        {/* Search Box */}
                        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
                            <div className='flex gap-3'>
                                <input
                                    type='text'
                                    placeholder='Enter AWB/Tracking Number'
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                                    className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                                />
                                <button
                                    onClick={handleTrack}
                                    disabled={loading}
                                    className='px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 flex items-center gap-2'
                                >
                                    <MagnifyingGlassIcon className='h-5 w-5' />
                                    {loading ? 'Tracking...' : 'Track'}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3'>
                                <ExclamationCircleIcon className='h-6 w-6 text-red-600 flex-shrink-0 mt-0.5' />
                                <div>
                                    <h3 className='text-red-800 font-semibold mb-1'>Tracking Error</h3>
                                    <p className='text-red-700'>{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Tracking Results */}
                        {trackingData && (
                            <div className='bg-white rounded-lg shadow-lg p-6 md:p-8'>
                                {/* Header Info */}
                                <div className='mb-8 pb-6 border-b border-gray-200'>
                                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                                        <div>
                                            <p className='text-sm text-gray-500 mb-1'>Tracking Number</p>
                                            <p className='text-2xl font-bold text-gray-800'>{trackingData.awb}</p>
                                        </div>
                                        <div className='flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg'>
                                            <div className='w-2 h-2 bg-blue-600 rounded-full animate-pulse'></div>
                                            <span className='text-blue-700 font-semibold'>{trackingData.status}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tracking Timeline */}
                                <div className='relative'>
                                    {/* Desktop View - Horizontal */}
                                    <div className='hidden md:block'>
                                        <div className='flex justify-between items-start'>
                                            {trackingData.stages.map((stage, index) => {
                                                const icons = [
                                                    <ClipboardDocumentCheckIcon className='w-8 h-8' key={0} />,
                                                    <CubeIcon className='w-8 h-8' key={1} />,
                                                    <TruckIcon className='w-8 h-8' key={2} />,
                                                    <HomeDeliveryIcon className='w-8 h-8' key={3} />
                                                ];
                                                
                                                return (
                                                    <div key={index} className='flex-1 relative'>
                                                        <div className='flex flex-col items-center'>
                                                            {/* Icon Circle */}
                                                            <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all ${
                                                                stage.completed 
                                                                    ? 'bg-green-500 border-green-500 text-white shadow-lg' 
                                                                    : 'bg-gray-100 border-gray-300 text-gray-400'
                                                            }`}>
                                                                {stage.completed && (
                                                                    <CheckCircleIcon className='absolute -top-1 -right-1 w-6 h-6 text-green-600 bg-white rounded-full' />
                                                                )}
                                                                {icons[stage.iconIndex || 0]}
                                                            </div>
                                                            
                                                            {/* Line connecting to next stage */}
                                                            {index < trackingData.stages.length - 1 && (
                                                                <div className={`absolute top-8 left-1/2 w-full h-1 ${
                                                                    stage.completed && trackingData.stages[index + 1].completed
                                                                        ? 'bg-green-500' 
                                                                        : 'bg-gray-300'
                                                                }`}></div>
                                                            )}
                                                            
                                                            {/* Stage Details */}
                                                            <div className='mt-4 text-center'>
                                                                <p className={`font-semibold text-sm mb-1 ${
                                                                    stage.completed ? 'text-gray-800' : 'text-gray-400'
                                                                }`}>
                                                                    {stage.name}
                                                                </p>
                                                                <p className={`text-xs ${
                                                                    stage.completed ? 'text-gray-600' : 'text-gray-400'
                                                                }`}>
                                                                    {stage.date}
                                                                </p>
                                                                <p className={`text-xs ${
                                                                    stage.completed ? 'text-gray-500' : 'text-gray-400'
                                                                }`}>
                                                                    {stage.time}
                                                                </p>
                                                                {/* <p className={`text-xs mt-1 ${
                                                                    stage.completed ? 'text-blue-600 font-medium' : 'text-gray-400'
                                                                }`}>
                                                                    {stage.location === 'N/A' ? 'Location not available' : stage.location}
                                                                </p> */}
                                                                {stage.remarks && (
                                                                    <p className='text-xs mt-1 text-gray-500 italic'>
                                                                        {stage.remarks}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Mobile View - Vertical */}
                                    <div className='md:hidden'>
                                        <div className='space-y-6'>
                                            {trackingData.stages.map((stage, index) => {
                                                const icons = [
                                                    <ClipboardDocumentCheckIcon className='w-7 h-7' key={0} />,
                                                    <CubeIcon className='w-7 h-7' key={1} />,
                                                    <TruckIcon className='w-7 h-7' key={2} />,
                                                    <HomeDeliveryIcon className='w-7 h-7' key={3} />
                                                ];
                                                
                                                return (
                                                    <div key={index} className='flex gap-4'>
                                                        {/* Icon and Line */}
                                                        <div className='flex flex-col items-center'>
                                                            <div className={`relative z-10 flex items-center justify-center w-14 h-14 rounded-full border-4 transition-all ${
                                                                stage.completed 
                                                                    ? 'bg-green-500 border-green-500 text-white shadow-lg' 
                                                                    : 'bg-gray-100 border-gray-300 text-gray-400'
                                                            }`}>
                                                                {stage.completed && (
                                                                    <CheckCircleIcon className='absolute -top-1 -right-1 w-5 h-5 text-green-600 bg-white rounded-full' />
                                                                )}
                                                                {icons[stage.iconIndex || 0]}
                                                            </div>
                                                            {index < trackingData.stages.length - 1 && (
                                                                <div className={`w-1 h-16 ${
                                                                    stage.completed && trackingData.stages[index + 1].completed
                                                                        ? 'bg-green-500' 
                                                                        : 'bg-gray-300'
                                                                }`}></div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Stage Details */}
                                                        <div className='flex-1 pb-6'>
                                                            <p className={`font-semibold text-base mb-1 ${
                                                                stage.completed ? 'text-gray-800' : 'text-gray-400'
                                                            }`}>
                                                                {stage.name}
                                                            </p>
                                                            <p className={`text-sm ${
                                                                stage.completed ? 'text-gray-600' : 'text-gray-400'
                                                            }`}>
                                                                {stage.date} • {stage.time}
                                                            </p>
                                                            {stage.location !== 'N/A' && (
                                                                <p className={`text-sm mt-1 flex items-center gap-1 ${
                                                                    stage.completed ? 'text-blue-600 font-medium' : 'text-gray-400'
                                                                }`}>
                                                                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                                                                        <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' clipRule='evenodd' />
                                                                    </svg>
                                                                    {stage.location}
                                                                </p>
                                                            )}
                                                            {stage.remarks && (
                                                                <p className='text-sm mt-1 text-gray-500 italic'>
                                                                    {stage.remarks}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className='mt-8 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4'>
                                    <div className='bg-gray-50 rounded-lg p-4'>
                                        <p className='text-sm text-gray-500 mb-1'>Current Location</p>
                                        <p className='text-lg font-semibold text-gray-800'>
                                            {trackingData.currentLocation === 'Processing' ? 'Processing' : trackingData.currentLocation}
                                        </p>
                                    </div>
                                    <div className='bg-gray-50 rounded-lg p-4'>
                                        <p className='text-sm text-gray-500 mb-1'>Order ID</p>
                                        <p className='text-lg font-semibold text-gray-800'>{trackingData.order_id || 'N/A'}</p>
                                    </div>
                                    <div className='bg-gray-50 rounded-lg p-4'>
                                        <p className='text-sm text-gray-500 mb-1'>Package ID</p>
                                        <p className='text-lg font-semibold text-gray-800'>{trackingData.package_id || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tracker;

