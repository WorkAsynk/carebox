import { Input } from '@material-tailwind/react';
import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Pagination from '../Layout/Pagination/Pagination';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

const UsersList = ({ users, handleDeleteUser }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [tabs] = useState(['All', 'Admin', 'Operation Manager', 'Developer', 'Client', 'Franchise']);
	const [activeTab, setActiveTab] = useState('All');
	const [page, setPage] = useState(1);
	const usersPerPage = 10;
	const filteredUsers = users?.filter(user => activeTab === 'All' || user?.role?.toLowerCase() === activeTab.toLowerCase())
		?.filter(user => user?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

	const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
	const paginatedUsers = filteredUsers.slice((page - 1) * usersPerPage, page * usersPerPage);

	return (
		<div className='max-w-6xl mx-auto'>
			{/* Header */}
			<div className='mb-4 flex justify-between items-center'>
				<div className='flex gap-3 items-center'>
					<Link to={"/"}>
						<button className='border-[1px] border-[#cecece] px-2 py-2 hover:shadow-blue-gray-200 shadow-sm'>
							<FaArrowLeft />
						</button>
					</Link>
					<h2 className='font-semibold text-xl'>User List</h2>

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
								? 'text-[#f44336] after:content-[""] after:absolute after:-bottom-[2px] after:left-0 after:h-[2px] after:w-full after:bg-[#f44336]'
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
				<div className="grid grid-cols-8 text-left bg-[#000] text-white font-semibold px-4 py-3 rounded-t-md text-sm min-w-[900px]">
					<div>Name</div>
					<div>GST No</div>
					<div>Mobile</div>
					<div>Email</div>
					<div>To Name</div>
					<div>To Location</div>
					<div>Role</div>
					<div>Actions</div>
				</div>

				{/* Data Rows */}
				{paginatedUsers.map((user, idx) => (
					<div
						key={idx}
						className="grid grid-cols-8 text-sm px-4 py-3 border-b hover:bg-gray-50 min-w-[900px]"
					>
						<div className="text-gray-800">{user.name}</div>
						<div className="text-gray-800">{user.gst_no || '-'}</div>
						<div className="text-gray-800">{user.phone}</div>
						<div className="text-gray-800 truncate overflow-hidden max-w-[180px]">
							{user.email}
						</div>
						<div className="text-gray-800">{user.co_name || '-'}</div>
						<div className="text-gray-800">{user.co_location || '-'}</div>
						<div className="text-gray-800 font-normal">{user.role}</div>
						<div className="text-gray-800">
							<div className="flex items-center gap-2">
								<Link to={`/edit-user/${user.id}`}>
									<button 
										className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
										title="Edit User"
									>
										<PencilIcon className="w-4 h-4" />
									</button>
								</Link>
								<button 
									onClick={() => handleDeleteUser(user.id)}
									className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
									title="Delete User"
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
		</div>
	)
}

export default UsersList