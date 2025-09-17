import React, { useState } from 'react';
import Pagination from '../Layout/Pagination/Pagination';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { Input } from '@material-tailwind/react';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';

const Address = ({ address, onAddressDelete }) => {
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
		<div className='max-w-6xl mx-auto'>
			{/* Header */}
			<div className='mb-4 flex justify-between items-center'>
				<div className='flex gap-3 items-center'>
					<Link to='/'>
						<button className='border-[1px] border-[#cecece] px-2 py-2 hover:shadow-blue-gray-200 shadow-sm'>
							<FaArrowLeft />
						</button>
					</Link>
					<h2 className='font-semibold text-xl'>Address List</h2>
				</div>
				<div>
					<Input
						type='text'
						placeholder='Search by name...'
						label='Search Name'
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						className='border border-gray-300 px-4 py-2 rounded-md w-60'
					/>
				</div>
			</div>

			{/* Tabs */}
			<div className='flex gap-3 mb-6 border-b border-gray-200'>
				{tabs.map(tab => (
					<button
						key={tab}
						onClick={() => {
							setActiveTab(tab);
							setPage(1);
						}}
						className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 ${activeTab === tab
							? 'text-[#f44336] after:content-[""] after:absolute after:-bottom-[2px] after:left-0 after:h-[2px] after:w-full after:bg-[#f44336]'
							: 'text-gray-600 hover:text-[#f44336]'
							}`}
					>
						{tab}
					</button>
				))}
			</div>

			{/* Table */}
			<div className='overflow-x-auto'>
				{/* Header Row */}
				<div className='grid grid-cols-8 text-left bg-[#000] text-white font-semibold px-4 py-3 rounded-t-md text-sm min-w-[900px]'>
					<div>Client Name</div>
					<div>Consignee Name</div>
					<div>Mobile</div>
					<div>Email</div>
					<div>Address</div>
					<div>Pincode</div>
					<div>Address Type</div>
					<div>Actions</div>
				</div>

				{/* Data Rows */}
				{paginatedUsers.map((user, idx) => (
					<div
						key={idx}
						className='grid grid-cols-8 text-sm px-4 py-3 border-b hover:bg-gray-50 min-w-[900px]'
					>
						<div className='text-gray-800'>{user.client_name}</div>
						<div className='text-gray-800'>{user.consignee_name || '-'}</div>
						<div className='text-gray-800'>{user.phone}</div>
						<div className='text-gray-800 truncate overflow-hidden max-w-[180px]'>
							{user.email}
						</div>
						<div className=' col-span-1'>
							<p className='text-gray-800 font-normal'>
								{user?.address_line},{user?.city}, {user?.state}
								,{user?.country}
							</p>
						</div>
						<div className='text-gray-800'>{user.pincode || '-'}</div>
						<div className='text-gray-800 font-normal'>{user?.is_sender === false ? "Receiver" : "Sender"}</div>
						<div className="text-gray-800">
							<div className="flex items-center gap-2">
								<Link to={`/edit-address/${user.id}`}>
									<button 
										className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
										title="Edit Address"
									>
										<PencilIcon className="w-4 h-4" />
									</button>
								</Link>
								<button 
									className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
									title="Delete Address"
									onClick={() => handleDeleteClick(user)}
								>
									<TrashIcon className="w-4 h-4" />
								</button>
							</div>
						</div>
					</div>
				))}
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
