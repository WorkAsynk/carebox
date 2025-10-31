import React, { useState, useEffect, useMemo } from 'react'
import { FaArrowLeft, FaPlus, FaDownload } from 'react-icons/fa';
import { Input } from '@material-tailwind/react';
import Pagination from '../Layout/Pagination/Pagination';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { ROLES } from '../../config/rolePermissions';
import { CSVLink } from 'react-csv';


const Orders = ({orders, handleDeleteOrder, loading: externalLoading}) => {
    const { user } = useSelector(state => state.auth);
    const isAdmin = user?.role === ROLES.ADMIN;
    const isFranchise = user?.role === ROLES.FRANCHISE;
    const canViewAmount = isAdmin || isFranchise;
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
			const response = await axios.post(buildApiUrl(API_ENDPOINTS.FETCH_ALL_ORDERS));
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
			awb_no: order?.awb_no,
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
            order?.awb_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order?.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order?.receiver_name?.toLowerCase().includes(searchTerm.toLowerCase());
		
		const finalResult = matchesTab && matchesSearch;
		console.log('Final filter result:', finalResult);
		
		return finalResult;
	});

	const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
	const paginatedOrders = filteredOrders.slice((page - 1) * ordersPerPage, page * ordersPerPage);

	// Prepare CSV headers based on user role
	const csvHeaders = useMemo(() => {
		const baseHeaders = [
			{ label: "AWB No", key: "awb_no" },
			{ label: "LR No", key: "awb_no" },
			{ label: "Order ID", key: "order_id" },
			{ label: "Order Date", key: "order_date" },
			{ label: "Sender Name", key: "sender_name" },
			{ label: "Sender Phone", key: "sender_phone" },
			{ label: "Sender Address", key: "sender_address" },
			{ label: "Sender City", key: "sender_city" },
			{ label: "Sender State", key: "sender_state" },
			{ label: "Sender Pincode", key: "sender_pincode" },
			{ label: "Receiver Name", key: "receiver_name" },
			{ label: "Receiver Phone", key: "receiver_phone" },
			{ label: "Receiver Address", key: "receiver_address" },
			{ label: "Receiver City", key: "receiver_city" },
			{ label: "Receiver State", key: "receiver_state" },
			{ label: "Receiver Pincode", key: "receiver_pincode" },
		];

		if (canViewAmount) {
			baseHeaders.push({ label: "Amount", key: "amount" });
		}

		baseHeaders.push(
			{ label: "Status", key: "status" },
			{ label: "Weight", key: "weight" },
			{ label: "Length", key: "length" },
			{ label: "Width", key: "width" },
			{ label: "Height", key: "height" },
			{ label: "Package Type", key: "package_type" },
			{ label: "Payment Mode", key: "payment_mode" },
			{ label: "Created At", key: "created_at" },
			{ label: "Updated At", key: "updated_at" }
		);

		return baseHeaders;
	}, [canViewAmount]);

	// Prepare CSV data from orders list
	const csvData = useMemo(() => {
		return ordersList.map(order => {
			const formatDate = (date) => date ? new Date(date).toLocaleString() : 'N/A';
			// Format date for CSV export - use simple format that Excel can handle
			const formatDateOnly = (date) => {
				if (!date) return 'N/A';
				const d = new Date(date);
				// Format as YYYY-MM-DD which is universally recognized by Excel
				const year = d.getFullYear();
				const month = String(d.getMonth() + 1).padStart(2, '0');
				const day = String(d.getDate()).padStart(2, '0');
				return `${year}-${month}-${day}`;
			};
			
			// Format AWB No and LR No to prevent scientific notation
			const formatNumber = (num) => {
				if (!num) return 'N/A';
				// Convert to string and ensure it's treated as text in CSV
				const numStr = String(num);
				// If it's a large number, format it properly
				if (numStr.length > 10) {
					return `'${numStr}`; // Add apostrophe to force text format in Excel
				}
				return numStr;
			};

			const baseData = {
				awb_no: formatNumber(order.awb_no || order.awb_no),
				awb_no: formatNumber(order.awb_no),
				order_id: order.order_id || order.order_no || order.id || 'N/A',
				order_date: formatDateOnly(order.created_at),
				sender_name: order.sender_name || order.sender?.name || 'N/A',
				sender_phone: order.sender_phone || order.sender?.phone || order.sender_mobile || 'N/A',
				sender_address: order.sender_address?.address || order.sender_address || order.sender?.address || 'N/A',
				sender_city: order.sender_address?.city || order.sender_city || order.sender?.city || 'N/A',
				sender_state: order.sender_address?.state || order.sender_state || order.sender?.state || 'N/A',
				sender_pincode: order.sender_address?.pincode || order.sender_pincode || order.sender?.pincode || 'N/A',
				receiver_name: order.receiver_name || order.receiver?.name || 'N/A',
				receiver_phone: order.receiver_phone || order.receiver?.phone || order.receiver_mobile || 'N/A',
				receiver_address: order.receiver_address?.address || order.receiver_address || order.receiver?.address || 'N/A',
				receiver_city: order.receiver_address?.city || order.receiver_city || order.receiver?.city || 'N/A',
				receiver_state: order.receiver_address?.state || order.receiver_state || order.receiver?.state || 'N/A',
				receiver_pincode: order.receiver_address?.pincode || order.receiver_pincode || order.receiver?.pincode || 'N/A',
			};

			if (canViewAmount) {
				baseData.amount = order.amount || order.total_amount || order.price || '0.00';
			}

			return {
				...baseData,
				status: order.status ? order.status.toUpperCase() : 'PENDING',
				weight: order.weight || order.package_weight || 'N/A',
				length: order.length || order.dimensions?.length || 'N/A',
				width: order.width || order.dimensions?.width || 'N/A',
				height: order.height || order.dimensions?.height || 'N/A',
				package_type: order.package_type || order.type || 'N/A',
				payment_mode: order.payment_mode || order.payment_type || 'N/A',
				created_at: formatDate(order.created_at),
				updated_at: formatDate(order.updated_at)
			};
		});
	}, [ordersList, canViewAmount]);
  return (
    <div className='lg:max-w-6xl max-w-[400px] mx-auto mt-5'>
    {/* Header */}
    <div className='mb-6 p-6'>
        <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4'>
            {/* Left Section - Navigation and Title */}
            <div className='flex items-center gap-4'>
                <Link to={"/"}>
                    <button className='group flex items-center justify-center w-10 h-10 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm'>
                        <FaArrowLeft className='text-gray-600 group-hover:text-gray-800 transition-colors' />
                    </button>
                </Link>
                <div>
                    <h2 className='text-2xl font-bold text-gray-900'>Orders Management</h2>
                    <p className='text-sm text-gray-500 mt-1'>Manage and track all your orders</p>
                </div>
            </div>

            {/* Right Section - Search and Export */}
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
                {/* Search Input */}
                <div className='relative flex-1 min-w-[250px]'>
                    <Input
                        type='text'
                        placeholder='Search by Order ID, Sender, or Receiver...'
                        label='Search Orders'
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className='w-full'
                        containerProps={{
                            className: "min-w-0"
                        }}
                        labelProps={{
                            className: "text-gray-700 font-medium"
                        }}
                    />
                </div>

                {/* Export Button */}
                <CSVLink
                    data={csvData}
                    headers={csvHeaders}
                    filename={`orders_export_${new Date().toISOString().split('T')[0]}.csv`}
                    className='group flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 min-w-[140px]'
                    title='Download all orders as CSV'
                    enclosingCharacter={'"'}
                    separator={','}
                    ufeff={true}
                >
                    <FaDownload className='text-sm group-hover:animate-bounce' />
                    <span>Export CSV</span>
                </CSVLink>
            </div>
        </div>

        {/* Stats Bar */}
        {/* <div className='mt-4 pt-4 border-t border-gray-100'>
            <div className='flex flex-wrap items-center gap-6 text-sm'>
                <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <span className='text-gray-600'>
                        <span className='font-semibold text-gray-900'>{ordersList?.length || 0}</span> Total Orders
                    </span>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                    <span className='text-gray-600'>
                        <span className='font-semibold text-gray-900'>{filteredOrders?.length || 0}</span> Filtered
                    </span>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                    <span className='text-gray-600'>
                        Active Tab: <span className='font-semibold text-gray-900'>{activeTab}</span>
                    </span>
                </div>
            </div>
        </div> */}
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap gap-1 p-2">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => {
                        setActiveTab(tab);
                        setPage(1);
                    }}
                    className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        activeTab === tab
                            ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 shadow-sm'
                            : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
                    }`}
                >
                    <span className="relative z-10">{tab}</span>
                    {activeTab === tab && (
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-md"></div>
                    )}
                </button>
            ))}
        </div>
    </div>


    {/* Table */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        {/* Header Row */}
        <div className={`grid ${canViewAmount ? 'grid-cols-7' : 'grid-cols-6'} text-left bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold px-6 py-4 text-sm min-w-[800px]`}>
            <div className="flex items-center gap-2">
                <span>AWB No</span>
            </div>
            <div>Order Date</div>
            <div>Sender</div>
            <div>Receiver</div>
            {canViewAmount && <div>Amount</div>}
            <div>Status</div>
            <div>Action</div>
        </div>

            {/* Data Rows */}
            {(externalLoading ?? loading) ? (
                <div className="text-center py-12 text-gray-500">
                    <div className="inline-flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                        Loading orders...
                    </div>
                </div>
            ) : paginatedOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-lg font-medium">No orders found</p>
                        <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                </div>
            ) : (
                paginatedOrders.map((order, idx) => (
                    <div
                        key={order.id || idx}
                        className={`grid ${canViewAmount ? 'grid-cols-7' : 'grid-cols-6'} text-sm px-6 py-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-50/50 transition-all duration-200 min-w-[800px] group`}
                    >
                        <Link to={`/order-details/${order.id}`} className="group/link">
                            <div className="text-gray-900 font-semibold hover:text-red-600 transition-colors group-hover/link:underline">
                                {order.awb_no || order.order_no || 'N/A'}
                            </div>
                        </Link>
                        <div className="text-gray-700 flex items-center">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-gray-700">
                            <div className="font-medium">{order.sender_name || order.sender?.name || order.sender_address?.consignee_name || 'N/A'}</div>
                            {order.mfnumber && ( 
                                <div className="text-xs text-gray-500 mt-1">({order.mfnumber})</div>
                            )}
                        </div>
                        <div className="text-gray-700 font-medium">{order.receiver_name || order.receiver?.name || 'N/A'}</div>
                        {canViewAmount && (
                            <div className="text-green-600 font-bold">
                                ₹{order.amount || order.total_amount || order.price || '0.00'}
                            </div>
                        )}
                        <div className="flex items-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                isOrderCreatedStatus(order.status) ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                (order.status === 'in_transit' || order.status === 'transit' || order.status === 'shipped') ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                (order.status === 'delivered' || order.status === 'completed') ? 'bg-green-100 text-green-800 border border-green-200' :
                                'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                    isOrderCreatedStatus(order.status) ? 'bg-blue-500' :
                                    (order.status === 'in_transit' || order.status === 'transit' || order.status === 'shipped') ? 'bg-yellow-500' :
                                    (order.status === 'delivered' || order.status === 'completed') ? 'bg-green-500' :
                                    'bg-gray-500'
                                }`}></div>
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
                        <div className="flex items-center gap-2">
                            <Link to={`/edit-order/${order.id}`}>
                                <button 
                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                                    title="Edit Order"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                            </Link>
                            <button 
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                                title="Delete Order"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>  
                ))
            )}
        </div>
    </div>

    {/* Pagination */}
    <Pagination page={page} totalPages={totalPages} setPage={setPage} />
</div>
  )
}

export default Orders  