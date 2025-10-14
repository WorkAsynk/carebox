import { Input } from '@material-tailwind/react';
import React, { useState, useMemo } from 'react';
import { FaArrowLeft, FaDownload } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Pagination from '../Layout/Pagination/Pagination';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { CSVLink } from 'react-csv';

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

	// Prepare CSV headers
	const csvHeaders = useMemo(() => [
		{ label: "Name", key: "name" },
		{ label: "GST No", key: "gst_no" },
		{ label: "Mobile", key: "phone" },
		{ label: "Email", key: "email" },
		{ label: "Company Name", key: "co_name" },
		{ label: "Company Location", key: "co_location" },
		{ label: "Role", key: "role" },
		{ label: "Created At", key: "created_at" }
	], []);

	// Prepare CSV data from users list
	const csvData = useMemo(() => {
		return users.map(user => {
			const formatDate = (date) => date ? new Date(date).toLocaleString() : 'N/A';
			
			return {
				name: user.name || 'N/A',
				gst_no: user.gst_no || 'N/A',
				phone: user.phone || user.mobile || 'N/A',
				email: user.email || 'N/A',
				co_name: user.co_name || 'N/A',
				co_location: user.co_location || 'N/A',
				role: user.role || 'N/A',
				created_at: formatDate(user.created_at)
			};
		});
	}, [users]);

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
							<h2 className='text-2xl font-bold text-gray-900'>User Management</h2>
							<p className='text-sm text-gray-500 mt-1'>Manage and track all your users</p>
						</div>
					</div>

					{/* Right Section - Search and Export */}
					<div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
						{/* Search Input */}
						<div className='relative flex-1 min-w-[250px]'>
							<Input
								type='text'
								placeholder='Search by name...'
								label='Search Users'
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
							filename={`users_export_${new Date().toISOString().split('T')[0]}.csv`}
							className='group flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 min-w-[140px]'
							title='Download all users as CSV'
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
					<div className="grid grid-cols-8 text-left bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold px-6 py-4 text-sm min-w-[900px]">
						<div className="flex items-center gap-2">
							<span>Name</span>
						</div>
						<div>GST No</div>
						<div>Mobile</div>
						<div>Email</div>
						<div>Company Name</div>
						<div>Company Location</div>
						<div>Role</div>
						<div>Actions</div>
					</div>

					{/* Data Rows */}
					{paginatedUsers.length === 0 ? (
						<div className="text-center py-12 text-gray-500">
							<div className="flex flex-col items-center gap-3">
								<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
									<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
									</svg>
								</div>
								<p className="text-lg font-medium">No users found</p>
								<p className="text-sm text-gray-400">Try adjusting your search or filters</p>
							</div>
						</div>
					) : (
						paginatedUsers.map((user, idx) => (
							<div
								key={idx}
								className="grid grid-cols-8 text-sm px-6 py-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-50/50 transition-all duration-200 min-w-[900px] group"
							>
								<div className="text-gray-900 font-semibold flex items-center">
									{user.name}
								</div>
								<div className="text-gray-700 flex items-center">
									{user.gst_no || '-'}
								</div>
								<div className="text-gray-700 flex items-center">
									{user.phone}
								</div>
								<div className="text-gray-700 flex items-center">
									<div className="truncate max-w-[180px]" title={user.email}>
										{user.email}
									</div>
								</div>
								<div className="text-gray-700 flex items-center">
									{user.co_name || '-'}
								</div>
								<div className="text-gray-700 flex items-center">
									{user.co_location || '-'}
								</div>
								<div className="flex items-center">
									<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
										user.role?.toLowerCase() === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
										user.role?.toLowerCase() === 'franchise' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
										user.role?.toLowerCase() === 'operational manager' ? 'bg-green-100 text-green-800 border border-green-200' :
										user.role?.toLowerCase() === 'developer' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
										user.role?.toLowerCase() === 'client' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
										'bg-gray-100 text-gray-800 border border-gray-200'
									}`}>
										<div className={`w-2 h-2 rounded-full mr-2 ${
											user.role?.toLowerCase() === 'admin' ? 'bg-purple-500' :
											user.role?.toLowerCase() === 'franchise' ? 'bg-blue-500' :
											user.role?.toLowerCase() === 'operational manager' ? 'bg-green-500' :
											user.role?.toLowerCase() === 'developer' ? 'bg-yellow-500' :
											user.role?.toLowerCase() === 'client' ? 'bg-indigo-500' :
											'bg-gray-500'
										}`}></div>
										{user.role}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Link to={`/edit-user/${user.id}`}>
										<button 
											className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
											title="Edit User"
										>
											<PencilIcon className="w-4 h-4" />
										</button>
									</Link>
									<button 
										onClick={() => handleDeleteUser(user.id)}
										className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
										title="Delete User"
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

export default UsersList