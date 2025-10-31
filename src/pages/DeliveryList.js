import React, { useEffect, useState } from 'react';
import Sidebar from '../component/Layout/Sidebar';
import Topbar from '../component/Layout/Topbar';
import DeliveryListArea from '../component/DeliveryList/DeliveryListArea';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const DeliveryList = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayStatus, setOverlayStatus] = useState('loading'); // 'loading' | 'success'

  useEffect(() => {
    // Seed with sample data (no API calls as requested)
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setDeliveries([
        {
          id: 101,
          delivery_id: 101,
          delivery_boy_name: 'Ravi Kumar',
          vehicle_number: 'DL 3C AB 1234',
          package_awb_numbers: ['AWB1001', 'AWB1002', 'AWB1003'],
          created_at: new Date().toISOString(),
          status: 'Pending',
        },
        {
          id: 102,
          delivery_id: 102,
          delivery_boy_name: 'Sandeep Singh',
          vehicle_number: 'MH 12 XY 5678',
          package_awb_numbers: ['AWB2001', 'AWB2002'],
          created_at: new Date().toISOString(),
          status: 'In Transit',
        },
      ]);
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, []);

  const handleDeleteDelivery = async (delivery) => {
    try {
      setShowOverlay(true);
      setOverlayStatus('loading');
      // Simulate deletion delay; no API
      setTimeout(() => {
        setDeliveries(prev => prev.filter(d => (d.id || d.delivery_id) !== (delivery.id || delivery.delivery_id)));
        setOverlayStatus('success');
        setTimeout(() => setShowOverlay(false), 800);
      }, 600);
    } catch (e) {
      setShowOverlay(false);
    }
  };

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1'>
        <Topbar />
        <div className='p-6'>
          <DeliveryListArea deliveries={deliveries} loading={isLoading} handleDeleteDelivery={handleDeleteDelivery} />
        </div>
      </div>

      {showOverlay && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center'>
            {overlayStatus === 'loading' && (
              <div className='flex flex-col items-center'>
                <div className='h-12 w-12 rounded-full border-4 border-gray-200 border-t-gray-700 animate-spin mb-3'></div>
                <p className='text-gray-700 text-sm'>Deleting delivery...</p>
              </div>
            )}
            {overlayStatus === 'success' && (
              <div className='flex flex-col items-center'>
                <CheckCircleIcon className='w-14 h-14 text-green-500' />
                <p className='text-gray-700 text-sm mt-2'>Delivery deleted successfully</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryList;


