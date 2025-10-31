import React, { useState, useMemo } from 'react';
import Pagination from '../Layout/Pagination/Pagination';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaDownload } from 'react-icons/fa';
import { Input } from '@material-tailwind/react';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import { CSVLink } from 'react-csv';

const Address = ({ address, onAddressDelete, loading = false }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [tabs] = useState(['All', 'Sender', 'Receiver']);
	const [activeTab, setActiveTab] = useState('All');
	const [page, setPage] = useState(1);
	const usersPerPage = 10;
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [addressToDelete, setAddressToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const filteredUsers = address
		?.filter(user => {
			if (activeTab === 'All') return true;
			if (activeTab.toLowerCase() === 'sender') return user?.is_sender === true;
			if (activeTab.toLowerCase() === 'receiver') return user?.is_sender === false;
			return true;
		})
		?.filter(user =>
			user?.consignee_name?.toLowerCase().includes(searchTerm.toLowerCase())
		);

	const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
	const paginatedUsers = filteredUsers.slice(
		(page - 1) * usersPerPage,
		page * usersPerPage
	);

	// Prepare CSV headers
	const csvHeaders = useMemo(() => [
		{ label: "Client Name", key: "client_name" },
		{ label: "Consignee Name", key: "consignee_name" },
		{ label: "Mobile", key: "phone" },
		{ label: "Email", key: "email" },
		{ label: "Address Line", key: "address_line" },
		{ label: "City", key: "city" },
		{ label: "State", key: "state" },
		{ label: "Country", key: "country" },
		{ label: "Pincode", key: "pincode" },
		{ label: "Address Type", key: "address_type" },
		{ label: "Created At", key: "created_at" }
	], []);

	// Prepare CSV data from address list
	const csvData = useMemo(() => {
		return address.map(addr => {
			const formatDate = (date) => date ? new Date(date).toLocaleString() : 'N/A';
			
			return {
				client_name: addr.client_name || 'N/A',
				consignee_name: addr.consignee_name || 'N/A',
				phone: addr.phone || 'N/A',
				email: addr.email || 'N/A',
				address_line: addr.address_line || 'N/A',
				city: addr.city || 'N/A',
				state: addr.state || 'N/A',
				country: addr.country || 'N/A',
				pincode: addr.pincode || 'N/A',
				address_type: addr.is_sender === false ? "Receiver" : "Sender",
				created_at: formatDate(addr.created_at)
			};
		});
	}, [address]);

	// Handle delete confirmation
	const handleDeleteClick = (addressItem) => {
		setAddressToDelete(addressItem);
		setShowDeleteModal(true);
	};

	// Delete address function
	const handleDeleteAddress = async () => {
		if (!addressToDelete) return;
		
		setIsDeleting(true);
		try {
			await axios.post(buildApiUrl(API_ENDPOINTS.DELETE_ADDRESS), {
				address_id: addressToDelete.id
			});
			
			// Call parent callback to update the address list
			if (onAddressDelete) {
				onAddressDelete(addressToDelete.id);
			}
			
			setShowDeleteModal(false);
			setAddressToDelete(null);
		} catch (error) {
			console.error('Error deleting address:', error);
			alert('Failed to delete address. Please try again.');
		} finally {
			setIsDeleting(false);
		}
	};

	// Cancel delete
	const handleCancelDelete = () => {
		setShowDeleteModal(false);
		setAddressToDelete(null);
	};

	return (
		<div className='lg:max-w-6xl max-w-[400px] mx-auto mt-5'>
			{/* Header */}
			<div className='mb-6 p-6'>
				<div className='flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4'>
					{/* Left Section - Navigation and Title */}
					<div className='flex items-center gap-4'>
						<Link to="/">
							<button className='group flex items-center justify-center w-10 h-10 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm'>
								<FaArrowLeft className='text-gray-600 group-hover:text-gray-800 transition-colors' />
							</button>
						</Link>
						<div>
							<h2 className='text-2xl font-bold text-gray-900'>Address Management</h2>
							<p className='text-sm text-gray-500 mt-1'>Manage and track all your addresses</p>
						</div>
					</div>

					{/* Right Section - Search and Export */}
					<div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
						{/* Search Input */}
						<div className='relative flex-1 min-w-[250px]'>
							<Input
								type='text'
								placeholder='Search by name...'
								label='Search Addresses'
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
							filename={`addresses_export_${new Date().toISOString().split('T')[0]}.csv`}
							className='group flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 min-w-[140px]'
							title='Download all addresses as CSV'
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
					<div className='grid grid-cols-8 text-left bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold px-6 py-4 text-sm min-w-[900px]'>
						<div className="flex items-center gap-2">
							<span>Client Name</span>
						</div>
						<div>Consignee Name</div>
						<div>Mobile</div>
						<div>Email</div>
						<div>Address</div>
						<div>Pincode</div>
						<div>Address Type</div>
						<div>Actions</div>
					</div>

					{/* Data Rows */}
					{loading ? (
						<div className="text-center py-12 text-gray-500">
							<div className="inline-flex items-center gap-2">
								<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
								Loading addresses...
							</div>
						</div>
					) : paginatedUsers.length === 0 ? (
						<div className="text-center py-12 text-gray-500">
							<div className="flex flex-col items-center gap-3">
								<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
									<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
								</div>
								<p className="text-lg font-medium">No addresses found</p>
								<p className="text-sm text-gray-400">Try adjusting your search or filters</p>
							</div>
						</div>
					) : (
						paginatedUsers.map((user, idx) => (
							<div
								key={idx}
								className='grid grid-cols-8 text-sm px-6 py-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-50/50 transition-all duration-200 min-w-[900px] group'
							>
								<div className='text-gray-900 font-semibold flex items-center'>
									{user.client_name}
								</div>
								<div className='text-gray-700 flex items-center'>
									{user.consignee_name || '-'}
								</div>
								<div className='text-gray-700 flex items-center'>
									{user.phone}
								</div>
								<div className='text-gray-700 flex items-center'>
									<div className="truncate max-w-[180px]" title={user.email}>
										{user.email}
									</div>
								</div>
								<div className='text-gray-700 flex items-center'>
									<div className="text-sm">
										<div className="font-medium">{user?.address_line}</div>
										<div className="text-gray-500">{user?.city}, {user?.state}, {user?.country}</div>
									</div>
								</div>
								<div className='text-gray-700 flex items-center'>
									{user.pincode || '-'}
								</div>
								<div className="flex items-center">
									<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
										user?.is_sender === false 
											? 'bg-green-100 text-green-800 border border-green-200'
											: 'bg-blue-100 text-blue-800 border border-blue-200'
									}` }>
										<div className={`w-2 h-2 rounded-full mr-2 ${
											user?.is_sender === false ? 'bg-green-500' : 'bg-blue-500'
										}`}></div>
										{user?.is_sender === false ? "Receiver" : "Sender"}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Link to={`/edit-address/${user.id}`}>
										<button 
											className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
											title="Edit Address"
										>
											<PencilIcon className="w-4 h-4" />
										</button>
									</Link>
									<button 
										title="Delete Address"
										onClick={() => handleDeleteClick(user)}
										className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
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

			{/* Delete Confirmation Modal */}
			{showDeleteModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Confirm Delete
						</h3>
						<p className="text-gray-600 mb-6">
							Are you sure you want to delete the address for{' '}
							<strong>{addressToDelete?.consignee_name}</strong>? This action cannot be undone.
						</p>
						<div className="flex justify-end gap-3">
							<button
								onClick={handleCancelDelete}
								disabled={isDeleting}
								className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								onClick={handleDeleteAddress}
								disabled={isDeleting}
								className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
							>
								{isDeleting ? (
									<>
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										Deleting...
									</>
								) : (
									'Delete'
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Address;
