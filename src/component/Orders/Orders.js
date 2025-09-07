import React, { useState, useEffect } from 'react'
import { FaArrowLeft, FaTrash, FaPlus, FaEdit } from 'react-icons/fa';
import { Input } from '@material-tailwind/react';
import Pagination from '../Layout/Pagination/Pagination';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';


const Orders = ({orders, handleDeleteOrder}) => {
    const [searchTerm, setSearchTerm] = useState('');
	const [tabs] = useState(['All', 'Order Created', 'Order In Transit', 'Order Delivered']);
	const [activeTab, setActiveTab] = useState('All');
	const [page, setPage] = useState(1);
	const [ordersList, setOrdersList] = useState([]);
	const [loading, setLoading] = useState(false);
	const ordersPerPage = 10;

	// Helper function to check if order status matches "Order Created" category
	const isOrderCreatedStatus = (status) => {
		if (!status) return true; // No status means created
		const statusLower = status.toLowerCase();
		return statusLower.includes('created') || 
			   statusLower.includes('pending') || 
			   statusLower.includes('new');
	};

	// Fetch orders if not provided as props
	useEffect(() => {
		console.log('Orders prop received:', orders);
		if (!orders || orders.length === 0) {
			console.log('No orders prop, fetching from API...');
			fetchOrders();
		} else {
			console.log('Setting orders from props:', orders);
			setOrdersList(orders);
		}
	}, [orders]);

	const fetchOrders = async () => {
		setLoading(true);
		try {
			const response = await axios.get(buildApiUrl(API_ENDPOINTS.FETCH_ALL_ORDERS));
			console.log('API Response:', response.data);
			if (response.data.success) {
				// Process orders to ensure they have a status
				const processedOrders = (response.data.orders || []).map(order => ({
					...order,
					// If no status is set, default to 'created' so it shows up in "Order Created" tab
					status: order.status || 'created'
				}));
				console.log('Processed Orders:', processedOrders);
				setOrdersList(processedOrders);
			}
		} catch (error) {
			console.error('Error fetching orders:', error);
		} finally {
			setLoading(false);
		}
	};

	// Filter orders based on status and search term
	const filteredOrders = ordersList?.filter(order => {
		// Debug: Log the status to see what we're getting
		console.log('Filtering order:', {
			id: order?.id,
			lr_no: order?.lr_no,
			order_no: order?.order_no,
			status: order?.status,
			activeTab: activeTab
		});
		
		const matchesTab = activeTab === 'All' || 
			(activeTab === 'Order Created' && isOrderCreatedStatus(order?.status)) ||
			(activeTab === 'Order In Transit' && (
				order?.status === 'in_transit' || 
				order?.status === 'transit' ||
				order?.status === 'shipped'
			)) ||
			(activeTab === 'Order Delivered' && (
				order?.status === 'delivered' || 
				order?.status === 'completed'
			));
		
		console.log('Tab match result:', matchesTab, 'for status:', order?.status);
		
		const matchesSearch = !searchTerm || 
			order?.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order?.lr_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order?.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order?.receiver_name?.toLowerCase().includes(searchTerm.toLowerCase());
		
		const finalResult = matchesTab && matchesSearch;
		console.log('Final filter result:', finalResult);
		
		return finalResult;
	});

	const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
	const paginatedOrders = filteredOrders.slice((page - 1) * ordersPerPage, page * ordersPerPage);
  return (
    <div className='max-w-6xl mx-auto mt-5'>
    {/* Header */}
    <div className='mb-4 flex justify-between items-center'>
        <div className='flex gap-3 items-center'>
            <Link to={"/"}>
                <button className='border-[1px] border-[#cecece] px-2 py-2 hover:shadow-blue-gray-200 shadow-sm'>
                    <FaArrowLeft />
                </button>
            </Link>
            <h2 className='font-semibold text-xl'>Orders List</h2>

        </div>
        <div className='flex items-center gap-3'>
            <Input
                type='text'
                placeholder='Search by Order ID, Sender, or Receiver...'
                label='Search Orders'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='border border-gray-300 px-4 py-2 rounded-md w-40'
            />
        </div>
    </div>

    {/* Debug Info - Remove this after testing */}
    {/* <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
        <strong>Debug Info:</strong> Total Orders: {ordersList?.length || 0} | 
        Filtered: {filteredOrders?.length || 0} | 
        Active Tab: {activeTab} | 
        Page: {page} of {totalPages}
        <br />
        <strong>Raw Orders Data:</strong> {JSON.stringify(ordersList?.slice(0, 2), null, 2)}
        <br />
        <button 
            onClick={() => {
                console.log('Current ordersList:', ordersList);
                console.log('Current activeTab:', activeTab);
                console.log('Filtered orders:', filteredOrders);
            }}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
        >
            Debug Filtering
        </button>
    </div> */}

    {/* Tabs */}
    <div className="flex gap-3 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
            <button
                key={tab}
                onClick={() => {
                    setActiveTab(tab);
                    setPage(1);
                }}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 
        ${activeTab === tab
                        ? 'text-[#f44336] after:content-[\'\'] after:absolute after:-bottom-[2px] after:left-0 after:h-[2px] after:w-full after:bg-[#f44336]'
                        : 'text-gray-600 hover:text-[#f44336]'
                    }`}
            >
                {tab}
            </button>
        ))}
    </div>


    {/* Table */}
    <div className="overflow-x-auto">
        {/* Header Row */}
        <div className="grid grid-cols-6 text-left bg-[#000] text-white font-semibold px-4 py-3 rounded-t-md text-sm min-w-[800px]">
            <div>AWB No</div>
            <div>Order Date</div>
            <div>Sender</div>
            <div>Receiver</div>
            <div>Status</div>
            <div>Action</div>
        </div>

        {/* Data Rows */}
        {loading ? (
            <div className="text-center py-8 text-gray-500">Loading orders...</div>
        ) : paginatedOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No orders found</div>
        ) : (
            paginatedOrders.map((order, idx) => (
                <div
                    key={order.id || idx}
                    className="grid grid-cols-6 text-sm px-4 py-3 border-b hover:bg-gray-50 min-w-[800px]"
                >
                    <Link to={`/order-details/${order.id}`} >
                    <div className="text-gray-800 font-medium hover:text-red-600">{order.lr_no || order.order_no || 'N/A'}</div>
                    </Link>
                    <div className="text-gray-800">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</div>
                    <div className="text-gray-800">{order.sender_name || order.sender?.name || 'N/A'}</div>
                    <div className="text-gray-800">{order.receiver_name || order.receiver?.name || 'N/A'}</div>
                                                              <div className="text-gray-800">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isOrderCreatedStatus(order.status) ? 'bg-blue-100 text-blue-800' :
                              (order.status === 'in_transit' || order.status === 'transit' || order.status === 'shipped') ? 'bg-yellow-100 text-yellow-800' :
                              (order.status === 'delivered' || order.status === 'completed') ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                              {order.status ? 
                                  (isOrderCreatedStatus(order.status) ? 'CREATED' :
                                   order.status === 'in_transit' ? 'IN TRANSIT' : 
                                   order.status === 'shipped' ? 'SHIPPED' :
                                   order.status === 'transit' ? 'IN TRANSIT' :
                                   order.status === 'delivered' ? 'DELIVERED' :
                                   order.status === 'completed' ? 'COMPLETED' :
                                   order.status.toUpperCase()) 
                                  : 'PENDING'}
                          </span>
                      </div>
                    <div className="text-gray-800">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2">
                            <Link to={`/edit-order/${order.id}`}>
                                <FaEdit className='text-red-500 text-xl hover:text-red-600' />
                            </Link>
                            <FaTrash onClick={() => handleDeleteOrder(order.id)} className='text-red-500 text-xl hover:text-red-600' /> 
                        </button>
                    </div>
                </div>  
            ))
        )}
    </div>

    {/* Pagination */}
    <Pagination page={page} totalPages={totalPages} setPage={setPage} />
</div>
  )
}

export default Orders  