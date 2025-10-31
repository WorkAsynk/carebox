import { Input } from '@material-tailwind/react';
import React, { useState, useMemo } from 'react';
import { FaArrowLeft, FaDownload } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Pagination from '../Layout/Pagination/Pagination';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { CSVLink } from 'react-csv';

const BagListArea = ({ bags, handleDeleteBag, loading = false }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [tabs] = useState(['All', 'In Transit', 'Delivered', 'Pending']);
	const [activeTab, setActiveTab] = useState('All');
	const [page, setPage] = useState(1);
	const bagsPerPage = 10;
	
	const filteredBags = bags?.filter(bag => {
		if (activeTab === 'All') return true;
		
		// Map the delivered boolean to status
		const bagStatus = bag.delivered ? 'Delivered' : 'Pending';
		return bagStatus.toLowerCase() === activeTab.toLowerCase();
	})
		?.filter(bag => 
			bag?.awb_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			bag?.bag_awb_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			bag?.bagNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			bag?.destination_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			bag?.destination_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			bag?.source_address?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			bag?.source_address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
		);

	const totalPages = Math.ceil(filteredBags.length / bagsPerPage);
	const paginatedBags = filteredBags.slice((page - 1) * bagsPerPage, page * bagsPerPage);

	// Prepare CSV headers
	const csvHeaders = useMemo(() => [
		{ label: "Bag Number", key: "bagNumber" },
		{ label: "AWB Numbers", key: "awbNumbers" },
		{ label: "Sender", key: "senderName" },
		{ label: "Receiver", key: "receiverName" },
		{ label: "Created Date", key: "createdDate" },
		{ label: "Created Time", key: "createdTime" },
	], []);

	// Prepare CSV data from bags list
	const csvData = useMemo(() => {
		return bags.map(bag => {
			const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A';
			const formatTime = (date) => date ? new Date(date).toLocaleTimeString() : 'N/A';
			
			return {
				bagNumber: bag.awb_no || bag.bag_awb_no || bag.bagNumber || 'N/A',
				awbNumbers: Array.isArray(bag.package_awb_nos) ? bag.package_awb_nos.join(', ') : 'N/A',
				senderName: bag.source_address?.name || bag.source_address?.city || 'N/A',
				receiverName: bag.destination_name || 'N/A',
				createdDate: formatDate(bag.created_at),
				createdTime: formatTime(bag.created_at),
			};
		});
	}, [bags]);

	// Get status badge color
	const getStatusBadge = (status) => {
		const statusColors = {
			'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
			'In Transit': 'bg-blue-100 text-blue-800 border-blue-300',
			'Delivered': 'bg-green-100 text-green-800 border-green-300',
		};
		return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
	};

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
							<h2 className='text-2xl font-bold text-gray-900'>Bag Management</h2>
							<p className='text-sm text-gray-500 mt-1'>Manage and track all your bags</p>
						</div>
					</div>

					{/* Right Section - Search and Export */}
					<div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
						{/* Search Input */}
						<div className='relative flex-1 min-w-[250px]'>
							<Input
								type='text'
								placeholder='Search bags...'
								label='Search Bags'
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
							filename={`bags_export_${new Date().toISOString().split('T')[0]}.csv`}
							className='group flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 min-w-[140px]'
							title='Download all bags as CSV'
							enclosingCharacter={'"'}
							separator={','}
							ufeff={true}
						>
							<FaDownload className='text-sm group-hover:animate-bounce' />
							<span>Export CSV</span>
						</CSVLink>
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
					<div className="grid grid-cols-6 text-left bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold px-6 py-4 text-sm min-w-[1100px]">
						<div className="flex items-center gap-2">
							<span>AWB Number</span>
						</div>
						<div>Sender</div>
						<div>Receiver</div>
						<div>Created At</div>
						{/* <div>Created Time</div> */}
						<div>AWB List</div>
						{/* <div>Status</div> */}
						<div>Actions</div>
					</div>

					{/* Data Rows */}
					{loading ? (
						<div className="text-center py-12 text-gray-500">
							<div className="inline-flex items-center gap-2">
								<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
								Loading bags...
							</div>
						</div>
					) : paginatedBags.length === 0 ? (
						<div className="text-center py-12 text-gray-500">
							<div className="flex flex-col items-center gap-3">
								<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
									<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
									</svg>
								</div>
								<p className="text-lg font-medium">No bags found</p>
								<p className="text-sm text-gray-400">Try adjusting your search or filters</p>
							</div>
						</div>
					) : (
						paginatedBags.map((bag, idx) => {
							const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '-';
							const formatTime = (date) => date ? new Date(date).toLocaleTimeString() : '-';
							const bagNumber = bag.awb_no || bag.bag_awb_no || bag.bagNumber || '-';
							const senderName = bag.source_address?.name || bag.source_address?.city || '-';
							const receiverName = bag.destination_city || '-';
							const awbList = Array.isArray(bag.package_awb_nos) ? bag.package_awb_nos : [];


							return (
								<div
									key={idx}
									className="grid grid-cols-6 text-sm px-6 py-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-50/50 transition-all duration-200 min-w-[1100px] group"
								>
									<div className="text-gray-900 font-semibold flex items-center">
										<Link 
											to={`/bag-details/${bagNumber}`}
											className=" hover:text-blue-800 hover:underline cursor-pointer"
										>
											{bagNumber}
										</Link>
									</div>
									<div className="text-gray-700 flex items-center">
										{senderName}
									</div>
									<div className="text-gray-700 flex items-center">
										{receiverName}
									</div>
									<div className="text-gray-700 flex col-span-1 items-center">
										{formatDate(bag.created_at)} <br /> {formatTime(bag.created_at)}
									</div>
									<div className="text-gray-700 flex items-center">
										{awbList.length > 0 ? (
											<div className="max-w-40">
												<div className="space-y-1">
													{awbList.slice(0, 3).map((awb, idx) => (
														<div key={idx} className="block break-all">
															{awb}
														</div>
													))}
													{awbList.length > 3 && (
														<div className="text-gray-500 text-xs">
															+{awbList.length - 3} more
														</div>
													)}
												</div>
											</div>
										) : '-'}
									</div>
									{/* <div className="flex items-center">
										<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(bagStatus)}`}>
											{bagStatus}
										</span>
									</div> */}
									<div className="flex items-center gap-2">
										<Link to={`/edit-bag/${bag.id}`}>
											<button 
												className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
												title="Edit Bag"
											>
												<PencilIcon className="w-4 h-4" />
											</button>
										</Link>
										<button 
											onClick={() => handleDeleteBag(bag)}
											className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
											title="Delete Bag"
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

export default BagListArea
