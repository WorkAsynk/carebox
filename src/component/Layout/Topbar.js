'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, BoltIcon } from '@heroicons/react/24/solid';
import { DocumentTextIcon, PlusIcon, TruckIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
	const [searchType, setSearchType] = useState('AWB');
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [quickactionDropdown, setquickactionDropdown] = useState(false)
	const searchTypes = ['AWB', 'Order ID'];
	const actions = [
		{ label: 'Create Order', icon: <PlusIcon className="h-4 w-4 text-red-500" /> },
		{ label: 'Schedule Pickup', icon: <TruckIcon className="h-4 w-4 text-blue-500" /> },
		{ label: 'Generate Label', icon: <DocumentTextIcon className="h-4 w-4 text-green-500" /> },
	];

	const { user } = useSelector((state) => state.auth);
	const navigate = useNavigate();

	const getUserInitials = () => {
		if (!user) return 'U';
		const fullName = user.name || user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
		if (fullName) {
			const parts = fullName.split(/\s+/).filter(Boolean);
			if (parts.length === 1) {
				return parts[0].slice(0, 2).toUpperCase();
			}
			return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
		}
		if (user.email) {
			const namePart = String(user.email).split('@')[0];
			return namePart.slice(0, 2).toUpperCase();
		}
		return 'U';
	};

	
	
	return (
		<div className="w-full bg-white max-w-[1200px] mx-auto py-3 shadow-sm flex items-center justify-between">
			{/* Left side */}
			<div className="flex items-center gap-6">

				{/* Dropdown + Search */}
				<div className='flex justify-center items-center gap-0'>
					<div className="relative">
						<button
							onClick={() => setDropdownOpen(!dropdownOpen)}
							className="border border-gray-300 px-3 py-2 rounded-l-md text-sm flex items-center gap-1 bg-white"
						>
							{searchType}
							<ChevronDownIcon className="h-4 w-4 text-gray-500" />
						</button>

						{dropdownOpen && (
							<div className="absolute top-10 left-0 bg-white border border-gray-200 rounded-md shadow-md z-50">
								{searchTypes.map((type) => (
									<div
										key={type}
										className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
										onClick={() => {
											setSearchType(type);
											setDropdownOpen(false);
										}}
									>
										{type}
									</div>
								))}
							</div>
						)}
					</div>

					<input
						type="text"
						placeholder={`Search multiple ${searchType}s`}
						className="border border-gray-300 px-4 py-2 rounded-r-md text-sm w-64 focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>
			</div>

			{/* Right side */}
			<div className="flex items-center gap-5">
				<div className='relative'>
					<button
						onClick={() => setquickactionDropdown(!quickactionDropdown)}
						className="flex items-center gap-2 px-4 py-2 text-sm bg-black text-white rounded-full hover:bg-red-600 transition-all duration-200"
					>
						<BoltIcon className="h-4 w-4" />
						Quick Actions
					</button>

					{quickactionDropdown && (
						<div className='absolute top-12 right-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50'>
							{actions.map((action, index) => (
								<button
									key={index}
									className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-all"
									onClick={() => {
										setquickactionDropdown(false);
										console.log(`Selected: ${action.label}`);
									}}
								>
									{action.icon}
									{action.label}
								</button>
							))}
						</div>
					)}
				</div>

				

				{/* User Initial */}
				<button
					onClick={() => navigate('/account-details')}
					className="bg-gradient-to-br from-gray-800 to-gray-600 text-white h-9 w-9 flex items-center justify-center rounded-full font-semibold hover:bg-gray-500 transition"
					aria-label="Open account details"
				>
					{getUserInitials()}
				</button>
			</div>
		</div>
	);
};

export default Topbar;
