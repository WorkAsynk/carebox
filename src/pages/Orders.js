import React, { useEffect, useState } from 'react';
import Sidebar from '../component/Layout/Sidebar';
import Topbar from '../component/Layout/Topbar';
import Orders from '../component/Orders/Orders';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ROLES } from '../config/rolePermissions';

const OrdersPage = () => {
    const { user } = useSelector((state) => state.auth);
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchOrders();
	}, []);

    const extractMfInteger = (mf) => {
        const digits = String(mf || '').replace(/\D/g, '');
        return digits ? parseInt(digits, 10) : '';
    };

    const fetchOrders = async () => {
		setLoading(true);
		try {
            const isFranchise = user?.role === ROLES.FRANCHISE;
            const payload = {
                type: isFranchise ? 'franchise' : 'admin',
                ...(isFranchise ? { mf_no: extractMfInteger(user?.mf_no) } : {})
            };
            const response = await axios({
                method: 'post',
                url: buildApiUrl(API_ENDPOINTS.FETCH_ALL_ORDERS),
                data: payload,
                headers: { 'Content-Type': 'application/json' }
            });
			if (response.data.success) {
				// Process orders to ensure they have a status
				const processedOrders = (response.data.orders || []).map(order => ({
					...order,
					// If no status is set, default to 'created' so it shows up in "Order Created" tab
					status: order.status || 'created'
				}));
				setOrders(processedOrders);
			}
		} catch (error) {
			console.error('Error fetching orders:', error);
		} finally {
			setLoading(false);
		}
	};

	

	return (
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				<div className="p-6">
					{loading ? (
						<div className="text-center py-8 text-gray-500">Loading orders...</div>
					) : (
						<Orders orders={orders} />
					)}
				</div>
			</div>
		</div>
	);
};

export default OrdersPage;
