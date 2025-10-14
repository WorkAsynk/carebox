import React from 'react';
import createorder from '../../assets/home/create_logo_order.png';
import { Link } from 'react-router-dom';
import { HiOutlineExclamationCircle, HiOutlineTruck } from 'react-icons/hi';

const HomeDashboard = () => {
	return (
		<div className='pr-[2%] lg:pl-[20%] pl-[5%] py-[3%] flex max-w-7xl flex-col gap-6 p-6'>

			{/* Congrats Banner */}
			<div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl flex items-center justify-between p-6 w-full shadow-md">
				<div>
					<h2 className="text-2xl md:text-3xl font-bold mb-2">Congrats, your account has been activated</h2>
					<p className="mb-4 text-sm md:text-base">Go ahead and create your order now to start shipping</p>
					<Link to={"/create-order"} className='bg-white text-black px-4 py-2 rounded-md text-sm hover:bg-gray-200 transition'>
						Create Your First Order
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

			{/* Action Required */}
			<div className="bg-white border rounded-xl shadow-sm p-6">
				<div className="flex items-center gap-2 text-yellow-600 font-semibold text-lg mb-4">
					<HiOutlineExclamationCircle className="text-2xl" />
					Action Required
				</div>
				<div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center text-gray-600 text-sm">
					<div>
						<p className="text-xl font-bold text-black">0</p>
						<p>High Risk Orders</p>
						<p className="text-blue-500 mt-1 cursor-pointer text-xs">Activate now</p>
					</div>
					<div>
						<p className="text-xl font-bold text-black">0</p>
						<p>Bad Addresses</p>
						<p className="text-blue-500 mt-1 cursor-pointer text-xs">Act Now</p>
					</div>
					<div>
						<p className="text-xl font-bold text-black">0</p>
						<p>Pending</p>
						<p className="text-blue-500 mt-1 cursor-pointer text-xs">Manifest Now</p>
					</div>
					<div>
						<p className="text-xl font-bold text-black">0</p>
						<p>To Be Shipped</p>
						<p className="text-blue-500 mt-1 cursor-pointer text-xs">Add to Pickup</p>
					</div>
					<div>
						<p className="text-xl font-bold text-black">0</p>
						<p>Exceptions and NDR</p>
						<p className="text-blue-500 mt-1 cursor-pointer text-xs">Act Now</p>
					</div>
				</div>
			</div>

			{/* Upcoming Pickups */}
			<div className="bg-white border rounded-xl shadow-sm p-6">
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
			</div>

		</div>
	);
};

export default HomeDashboard;
