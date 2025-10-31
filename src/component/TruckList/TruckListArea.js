import { Input } from '@material-tailwind/react';
import React, { useMemo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Pagination from '../Layout/Pagination/Pagination';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

const TruckListArea = ({ trucks, handleDeleteTruck, loading = false }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [tabs] = useState(['All', 'Delivered', 'Pending']);
	const [activeTab, setActiveTab] = useState('All');
	const [page, setPage] = useState(1);
	const itemsPerPage = 10;

	const filteredTrucks = trucks?.filter(truck => {
		if (activeTab === 'All') return true;
		const status = truck?.delivered ? 'Delivered' : 'Pending';
		return status.toLowerCase() === activeTab.toLowerCase();
	})?.filter(truck => {
		const awb = (truck?.awb_no || truck?.truck_awb_no || '').toLowerCase();
		const vehicle = (truck?.vehicle_number || '').toLowerCase();
		const driver = (truck?.driver_name || '').toLowerCase();
		return (
			awb.includes(searchTerm.toLowerCase()) ||
			vehicle.includes(searchTerm.toLowerCase()) ||
			driver.includes(searchTerm.toLowerCase())
		);
	});

	const totalPages = Math.ceil(filteredTrucks.length / itemsPerPage) || 1;
	const paginatedTrucks = filteredTrucks.slice((page - 1) * itemsPerPage, page * itemsPerPage);

	const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '-';
	const formatTime = (date) => date ? new Date(date).toLocaleTimeString() : '-';

	return (
		<div className='lg:max-w-6xl max-w-[400px] mx-auto mt-5'>
			{/* Header */}
			<div className='mb-6 lg:p-6'>
				<div className='flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4'>
					{/* Left Section - Navigation and Title */}
					<div className='flex lg:items-center justify-start lg:justify-between gap-4'>
						<Link to={"/"}>
							<button className='group flex items-center justify-center w-10 h-10 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm'>
								<FaArrowLeft className='text-gray-600 group-hover:text-gray-800 transition-colors' />
							</button>
						</Link>
						<div>
							<h2 className='text-2xl font-bold text-gray-900'>Truck Management</h2>
							<p className='text-sm text-gray-500 mt-1'>Manage and track all trucks</p>
						</div>
					</div>

					{/* Right Section - Search */}
					<div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
						{/* Search Input */}
						<div className='relative flex-1 min-w-[250px]'>
							<Input
								type='text'
								placeholder='Search trucks...'
								label='Search Trucks'
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
					</div>
				</div>
			</div>

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
					<div className="grid grid-cols-5 text-left bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold px-6 py-4 text-sm min-w-[900px]">
						<div className="flex items-center gap-2">
							<span>AWB Number</span>
						</div>
						<div>Vehicle Number</div>
						<div>Driver Name</div>
						<div>Created At</div>
						<div>Actions</div>
					</div>

					{/* Data Rows */}
					{loading ? (
						<div className="text-center py-12 text-gray-500">
							<div className="inline-flex items-center gap-2">
								<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
								Loading trucks...
							</div>
						</div>
					) : paginatedTrucks.length === 0 ? (
						<div className="text-center py-12 text-gray-500">
							<div className="flex flex-col items-center gap-3">
								<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
									<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
									</svg>
								</div>
								<p className="text-lg font-medium">No trucks found</p>
								<p className="text-sm text-gray-400">Try adjusting your search or filters</p>
							</div>
						</div>
					) : (
						paginatedTrucks.map((truck, idx) => {
							const awb = truck.awb_no || truck.truck_awb_no || '-';
							const vehicle = truck.vehicle_number || '-';
							const driver = truck.driver_name || '-';
							return (
								<div
									key={idx}
									className="grid grid-cols-5 text-sm px-6 py-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-50/50 transition-all duration-200 min-w-[900px] group"
								>
									<div className="text-gray-900 font-semibold flex items-center">{awb}</div>
									<div className="text-gray-700 flex items-center">{vehicle}</div>
									<div className="text-gray-700 flex items-center">{driver}</div>
									<div className="text-gray-700 flex col-span-1 items-center">
										{formatDate(truck.created_at)} <br /> {formatTime(truck.created_at)}
									</div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={(awb && `/edit-truck/${encodeURIComponent(awb)}`) || '#'}
                                            className={`p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 ${awb === '-' ? 'pointer-events-none opacity-40' : ''}`}
                                            title="Edit Truck"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </Link>
										<button 
											onClick={() => handleDeleteTruck(truck)}
											className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
											title="Delete Truck"
										>
											<TrashIcon className="w-4 h-4" />
										</button>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>

			{/* Pagination */}
			<Pagination page={page} totalPages={totalPages} setPage={setPage} />
		</div>
	)
}

export default TruckListArea


