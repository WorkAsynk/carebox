import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Sidebar from '../component/Layout/Sidebar';
import Topbar from '../component/Layout/Topbar';
import Orders from '../component/Orders/Orders';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useSelector } from 'react-redux';
import { ROLES } from '../config/rolePermissions';

const Orderlist = () => {

    const { user } = useSelector((state) => state.auth);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlayStatus, setOverlayStatus] = useState('loading'); // 'loading' | 'success'

    const extractMfInteger = (mf) => {
        const digits = String(mf || '').replace(/\D/g, '');
        return digits ? parseInt(digits, 10) : '';
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                const isFranchise = user?.role === ROLES.FRANCHISE;
                const payload = {
                    type: isFranchise ? 'franchise' : 'admin',
                    ...(isFranchise ? { mf_no: extractMfInteger(user?.mf_no) } : {})
                };
                const res = await axios({
                    method: 'post',
                    url: `${process.env.REACT_APP_API_URL}/api/order/fetchAllOrders`,
                    data: payload,
                    headers: { 'Content-Type': 'application/json' }
                });
                if (res.data?.success) {
                    const processed = (res.data.orders || []).map(o => ({ ...o, status: o.status || 'created' }));
                    setOrders(processed);
                } else {
                    setOrders(res.data || []);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    const handleDeleteOrder = async (order_id) => {
        try {
            setShowOverlay(true);
            setOverlayStatus('loading');
            await axios.post(`${process.env.REACT_APP_API_URL}/api/order/deleteOrder`, { order_id});
            setOrders(orders.filter(order => order.id !== order_id));
            setOverlayStatus('success');
            setTimeout(() => {
                setShowOverlay(false);
            }, 800);
        } catch (error) {
            console.error('Error deleting order:', error);
            setShowOverlay(false);
        }
    };

    console.log(orders)

  return (
    <div className='flex'>
            <Sidebar />
            <div className='flex-1'>
                <Topbar />
                <Orders orders={orders} handleDeleteOrder={handleDeleteOrder} loading={isLoading} />
            </div>

            {showOverlay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center">
                        {overlayStatus === 'loading' && (
                            <div className="flex flex-col items-center">
                                <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-gray-700 animate-spin mb-3"></div>
                                <p className="text-gray-700 text-sm">Deleting order...</p>
                            </div>
                        )}
                        {overlayStatus === 'success' && (
                            <div className="flex flex-col items-center">
                                <CheckCircleIcon className="w-14 h-14 text-green-500" />
                                <p className="text-gray-700 text-sm mt-2">Order deleted successfully</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
  )
}

export default Orderlist