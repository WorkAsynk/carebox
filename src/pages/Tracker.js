import React, { useState } from 'react';
import Sidebar from '../component/Layout/Sidebar';
import Topbar from '../component/Layout/Topbar';
import { 
    MagnifyingGlassIcon, 
    CheckCircleIcon,
    ClipboardDocumentCheckIcon,
    TruckIcon,
    CubeIcon,
    HomeIcon as HomeDeliveryIcon
} from '@heroicons/react/24/outline';

const Tracker = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleTrack = async () => {
        if (!trackingNumber.trim()) {
            return;
        }
        
        setLoading(true);
        // Add your tracking API call here
        setTimeout(() => {
            setTrackingData({
                awb: trackingNumber,
                status: 'In Transit',
                currentLocation: 'Mumbai Hub',
                estimatedDelivery: '2024-10-12',
                currentStage: 2, // 0: Created, 1: Shipped, 2: In Transit, 3: Delivered
                stages: [
                    {
                        name: 'Order Created',
                        date: 'Oct 09, 2024',
                        time: '10:30 AM',
                        location: 'Delhi',
                        completed: true
                    },
                    {
                        name: 'Order Shipped',
                        date: 'Oct 09, 2024',
                        time: '02:45 PM',
                        location: 'Delhi Hub',
                        completed: true
                    },
                    {
                        name: 'Order In Transit',
                        date: 'Oct 10, 2024',
                        time: '09:15 AM',
                        location: 'Mumbai Hub',
                        completed: true
                    },
                    {
                        name: 'Order Delivery',
                        date: 'Oct 12, 2024',
                        time: 'Expected',
                        location: 'Mumbai',
                        completed: false
                    }
                ]
            });
            setLoading(false);
        }, 1000);
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
                                                    <ClipboardDocumentCheckIcon className='w-8 h-8' />,
                                                    <CubeIcon className='w-8 h-8' />,
                                                    <TruckIcon className='w-8 h-8' />,
                                                    <HomeDeliveryIcon className='w-8 h-8' />
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
                                                                {icons[index]}
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
                                                                <p className={`text-xs mt-1 ${
                                                                    stage.completed ? 'text-blue-600 font-medium' : 'text-gray-400'
                                                                }`}>
                                                                    {stage.location}
                                                                </p>
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
                                                    <ClipboardDocumentCheckIcon className='w-7 h-7' />,
                                                    <CubeIcon className='w-7 h-7' />,
                                                    <TruckIcon className='w-7 h-7' />,
                                                    <HomeDeliveryIcon className='w-7 h-7' />
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
                                                                {icons[index]}
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
                                                            <p className={`text-sm mt-1 flex items-center gap-1 ${
                                                                stage.completed ? 'text-blue-600 font-medium' : 'text-gray-400'
                                                            }`}>
                                                                <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                                                                    <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' clipRule='evenodd' />
                                                                </svg>
                                                                {stage.location}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className='mt-8 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className='bg-gray-50 rounded-lg p-4'>
                                        <p className='text-sm text-gray-500 mb-1'>Current Location</p>
                                        <p className='text-lg font-semibold text-gray-800'>{trackingData.currentLocation}</p>
                                    </div>
                                    <div className='bg-gray-50 rounded-lg p-4'>
                                        <p className='text-sm text-gray-500 mb-1'>Expected Delivery</p>
                                        <p className='text-lg font-semibold text-gray-800'>{trackingData.estimatedDelivery}</p>
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

