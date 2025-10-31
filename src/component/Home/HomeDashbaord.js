import React, { useEffect, useMemo, useState } from 'react';
import createorder from '../../assets/home/create_logo_order.png';
import { Link } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaBox, FaTruck } from 'react-icons/fa6';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import { ROLES } from '../../config/rolePermissions';

const HomeDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const isFranchise = user?.role === ROLES.FRANCHISE;

    const [orderCounts, setOrderCounts] = useState({
        created: 0,
        pickup: 0,
        inTransit: 0,
        shipped: 0,
        delivered: 0,
        total: 0,
    });
    const [bagCounts, setBagCounts] = useState({
        pending: 0,
        inTransit: 0,
        delivered: 0,
        total: 0,
    });
    const [truckCounts, setTruckCounts] = useState({
        assigned: 0,
        inTransit: 0,
        delivered: 0,
        total: 0,
    });

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const payload = {
                    type: isFranchise ? 'franchise' : 'admin',
                    ...(isFranchise ? { mf_no: String(user?.mf_no || '').replace(/\D/g, '') } : {})
                };
                const { data } = await axios.post(buildApiUrl(API_ENDPOINTS.FETCH_ALL_ORDERS), payload);
                const list = Array.isArray(data) ? data : (Array.isArray(data?.orders) ? data.orders : []);
                const normalize = (s) => (String(s || '').toLowerCase());
                let created = 0, pickup = 0, inTransit = 0, shipped = 0, delivered = 0;
                list.forEach(o => {
                    const s = normalize(o.status);
                    if (s.includes('created')) created += 1;
                    else if (s.includes('pickup')) pickup += 1;
                    else if (s.includes('in transit')) inTransit += 1;
                    else if (s.includes('shipped')) shipped += 1;
                    else if (s.includes('delivered')) delivered += 1;
                });
                setOrderCounts({ created, pickup, inTransit, shipped, delivered, total: list.length });
            } catch (e) {
                setOrderCounts({ created: 0, pickup: 0, inTransit: 0, shipped: 0, delivered: 0, total: 0 });
            }
        };

        const fetchBags = async () => {
            try {
                const res = await axios.get(buildApiUrl(API_ENDPOINTS.FETCH_ALL_BAGS));
                let bags = [];
                if (res.data.bagList && Array.isArray(res.data.bagList)) bags = res.data.bagList;
                else if (res.data.baglist && Array.isArray(res.data.baglist)) bags = res.data.baglist;
                else if (res.data.bags && Array.isArray(res.data.bags)) bags = res.data.bags;
                else if (Array.isArray(res.data)) bags = res.data;
                let pending = 0, delivered = 0, inTransit = 0;
                bags.forEach(b => {
                    if (b.delivered === true) delivered += 1; else pending += 1;
                });
                setBagCounts({ pending, delivered, inTransit, total: bags.length });
            } catch (e) {
                setBagCounts({ pending: 0, inTransit: 0, delivered: 0, total: 0 });
            }
        };

        const fetchTrucks = async () => {
            try {
                const res = await axios.get(buildApiUrl(API_ENDPOINTS.TRUCK_LIST));
                const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.trucks) ? res.data.trucks : []);
                let assigned = 0, inTransit = 0, delivered = 0;
                list.forEach(t => {
                    const s = String(t.status || '').toLowerCase();
                    if (s.includes('assigned') || s.includes('created')) assigned += 1;
                    else if (s.includes('in transit')) inTransit += 1;
                    else if (s.includes('delivered')) delivered += 1;
                });
                setTruckCounts({ assigned, inTransit, delivered, total: list.length });
            } catch (e) {
                setTruckCounts({ assigned: 0, inTransit: 0, delivered: 0, total: 0 });
            }
        };

        fetchOrders();
        fetchBags();
        fetchTrucks();
    }, [user, isFranchise]);

    const actionRequired = useMemo(() => ([
        { label: 'Orders Pending Pickup', count: orderCounts.pickup, to: '/orderlist' },
        { label: 'Bags Pending', count: bagCounts.pending, to: '/bag-list' },
        { label: 'Trucks Assigned', count: truckCounts.assigned, to: '/truck-list' },
    ]), [orderCounts.pickup, bagCounts.pending, truckCounts.assigned]);

    return (
        <div className='pr-[2%] lg:pl-[20%] pl-[5%] py-[3%] flex max-w-7xl flex-col gap-6 p-6'>

		{/* Congrats Banner */}
		<div className="bg-gradient-to-r from-red-600 via-red-700 to-black text-white rounded-xl flex items-center justify-between p-6 w-full shadow-md">
				<div>
				<h2 className="text-2xl md:text-3xl font-semibold mb-1">Account activated</h2>
				<p className="mb-4 text-xs md:text-sm text-white/90">Create your first order to get started</p>
				<Link to={"/create-order"} className='inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm bg-white text-red-700 hover:bg-gray-100 border border-white/30 transition'>
					Create Order
				</Link>
				</div>
				<div className="hidden md:block w-32 h-32">
					<img
						src={createorder}
						alt="Package"
						className="w-full h-full object-contain"
					/>
				</div>
			</div>

		{/* Row 1: Action Required (left) + Total Bags (right) */}
		<div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
			<div className="md:col-span-9 rounded-xl p-6 w-full shadow-sm bg-white border border-gray-200">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2 font-semibold text-lg text-red-600">
						<HiOutlineExclamationCircle className="text-2xl" />
						Action Required
					</div>
					<div className="flex gap-2">
						<Link to={'/orderlist'} className='px-3 py-1.5 rounded-md text-xs border border-red-500 text-red-600 hover:bg-red-600 hover:text-white transition'>Orders</Link>
						<Link to={'/bag-list'} className='px-3 py-1.5 rounded-md text-xs border border-red-500 text-red-600 hover:bg-red-600 hover:text-white transition'>Bags</Link>
						<Link to={'/truck-list'} className='px-3 py-1.5 rounded-md text-xs border border-red-500 text-red-600 hover:bg-red-600 hover:text-white transition'>Trucks</Link>
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					{actionRequired.map((item, idx) => (
						<Link key={idx} to={item.to} className="group rounded-lg p-4 bg-white border border-gray-200 hover:border-red-500/50 transition shadow-sm">
							<p className="text-3xl font-semibold text-red-600">{item.count}</p>
							<p className="text-xs mt-1 text-gray-600">{item.label}</p>
							<div className='mt-3'>
								<span className='inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] border border-red-500 text-red-600 group-hover:bg-red-600 group-hover:text-white group-hover:shadow-sm transition'>
									<span>Review</span>
									<span className='inline-block transition-transform group-hover:translate-x-0.5'>&rarr;</span>
								</span>
							</div>
						</Link>
					))}
				</div>
			</div>
			<Link to={'/bag-list'} className='md:col-span-3'>
				<div className='rounded-xl p-6 h-full bg-gradient-to-br from-red-600 via-red-700 to-black text-white shadow-sm border border-red-600/30 flex items-center justify-between'>
					<div>
						<div className='text-xs uppercase tracking-wide text-white/80'>Total Bags</div>
						<div className='text-3xl font-semibold'>{bagCounts.total}</div>
					</div>
					<FaBox className='w-8 h-8 opacity-80' />
				</div>
			</Link>
		</div>

		{/* Row 2: Order Review (left) + Total Trucks (right) */}
		<div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
			<div className="md:col-span-9 rounded-xl shadow-sm p-6 bg-white border border-gray-200">
				<div className='flex items-center justify-between mb-4'>
					<h3 className='text-gray-900 font-semibold text-lg'>Order Review</h3>
					<Link to={'/orderlist'} className='text-red-600 text-xs border border-red-500 px-2 py-1 rounded hover:bg-red-600 hover:text-white transition'>Manage</Link>
				</div>
				<div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
					{[
						{ label: 'Order Created', value: orderCounts.created },
						{ label: 'Pickup', value: orderCounts.pickup },
						{ label: 'In Transit', value: orderCounts.inTransit },
						{ label: 'Shipped', value: orderCounts.shipped },
						{ label: 'Delivered', value: orderCounts.delivered },
					].map((card, i) => (
						<div key={i} className={`rounded-xl p-4 bg-white border border-gray-200 hover:border-red-500/50 transition shadow-sm`}>
							<div className='text-2xl font-semibold text-red-600'>{card.value}</div>
							<div className='text-xs mt-1 text-gray-600'>{card.label}</div>
							<Link to={'/orderlist'} className='mt-3 inline-block text-[11px] border border-red-500 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1 rounded transition'>View</Link>
						</div>
					))}
				</div>
			</div>
			<Link to={'/truck-list'} className='md:col-span-3'>
				<div className='rounded-xl p-6 h-full bg-gradient-to-br from-red-600 via-red-700 to-black text-white shadow-sm border border-red-600/30 flex items-center justify-between'>
					<div>
						<div className='text-xs uppercase tracking-wide text-white/80'>Total Trucks</div>
						<div className='text-3xl font-semibold'>{truckCounts.total}</div>
					</div>
					<FaTruck className='w-8 h-8 opacity-80' />
				</div>
			</Link>
		</div>

		{/* Bags Overview */}

			{/* Upcoming Pickups */}
			{/* <div className="bg-white border rounded-xl shadow-sm p-6">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
						<HiOutlineTruck className="text-2xl" />
						Upcoming Pickups
					</div>
					<Link to={"/"} className="text-blue-500 hover:underline text-sm">
						+ Create New Pickup
					</Link>
				</div>
				<p className="text-center text-gray-500 text-sm">No upcoming pickups</p>
				<p className="text-center text-gray-400 text-xs">Your upcoming pickup requests appear here</p>
			</div> */}

        </div>
    );
};

export default HomeDashboard;
