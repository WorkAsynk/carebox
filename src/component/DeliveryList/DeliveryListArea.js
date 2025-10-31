import { Input } from '@material-tailwind/react';
import React, { useMemo, useState } from 'react';
import { FaArrowLeft, FaDownload } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Pagination from '../Layout/Pagination/Pagination';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { CSVLink } from 'react-csv';

const DeliveryListArea = ({ deliveries = [], handleDeleteDelivery, loading = false }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [tabs] = useState(['All', 'In Transit', 'Delivered', 'Pending']);
	const [activeTab, setActiveTab] = useState('All');
	const [page, setPage] = useState(1);
	const itemsPerPage = 10;

	const filtered = deliveries?.filter(item => {
		if (activeTab === 'All') return true;
		const status = item.status || (item.delivered ? 'Delivered' : 'Pending');
		return status.toLowerCase() === activeTab.toLowerCase();
	})?.filter(item => (
		(item?.delivery_id?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
		(item?.delivery_boy_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
		(item?.vehicle_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
		(item?.city || '').toLowerCase().includes(searchTerm.toLowerCase())
	));

	const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
	const pageItems = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

	const csvHeaders = useMemo(() => [
		{ label: 'Delivery ID', key: 'delivery_id' },
		{ label: 'Delivery Boy', key: 'delivery_boy_name' },
		{ label: 'Vehicle Number', key: 'vehicle_number' },
		{ label: 'AWB Numbers', key: 'awbNumbers' },
		{ label: 'Created Date', key: 'createdDate' },
		{ label: 'Created Time', key: 'createdTime' },
	], []);

	const csvData = useMemo(() => {
		return deliveries.map(d => {
			const formatDate = date => date ? new Date(date).toLocaleDateString() : 'N/A';
			const formatTime = date => date ? new Date(date).toLocaleTimeString() : 'N/A';
			return {
				delivery_id: d.delivery_id || d.id || 'N/A',
				delivery_boy_name: d.delivery_boy_name || d.agent_name || 'N/A',
				vehicle_number: d.vehicle_number || 'N/A',
				awbNumbers: Array.isArray(d.package_awb_numbers) ? d.package_awb_numbers.join(', ') : 'N/A',
				createdDate: formatDate(d.created_at),
				createdTime: formatTime(d.created_at),
			};
		});
	}, [deliveries]);

	return (
		<div className='lg:max-w-6xl max-w-[400px] mx-auto mt-5'>
			{/* Header */}
			<div className='mb-6 lg:p-6'>
				<div className='flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4'>
					<div className='flex lg:items-center justify-start lg:justify-between gap-4'>
						<Link to={'/'}>
							<button className='group flex items-center justify-center w-10 h-10 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm'>
								<FaArrowLeft className='text-gray-600 group-hover:text-gray-800 transition-colors' />
							</button>
						</Link>
						<div>
							<h2 className='text-2xl font-bold text-gray-900'>Delivery Management</h2>
							<p className='text-sm text-gray-500 mt-1'>Manage and track all deliveries</p>
						</div>
					</div>

					<div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
						<div className='relative flex-1 min-w-[250px]'>
							<Input
								type='text'
								placeholder='Search deliveries...'
								label='Search Deliveries'
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
								className='w-full'
								containerProps={{
									className: 'min-w-0'
								}}
								labelProps={{
									className: 'text-gray-700 font-medium'
								}}
							/>
						</div>

						<CSVLink
							data={csvData}
							headers={csvHeaders}
							filename={`deliveries_export_${new Date().toISOString().split('T')[0]}.csv`}
							className='group flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 min-w-[140px]'
							title='Download all deliveries as CSV'
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
			<div className='bg-white rounded-lg shadow-sm border border-gray-100 mb-6'>
				<div className='flex flex-wrap gap-1 p-2'>
					{tabs.map(tab => (
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
							<span className='relative z-10'>{tab}</span>
							{activeTab === tab && (
								<div className='absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-md'></div>
							)}
						</button>
					))}
				</div>
			</div>

			{/* Table */}
			<div className='bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden'>
				<div className='overflow-x-auto'>
					<div className='grid grid-cols-6 text-left bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold px-6 py-4 text-sm min-w-[1100px]'>
						<div>Delivery ID</div>
						<div>Delivery Boy</div>
						<div>Vehicle</div>
						<div>Created At</div>
						<div>AWB List</div>
						<div>Actions</div>
					</div>

					{loading ? (
						<div className='text-center py-12 text-gray-500'>
							<div className='inline-flex items-center gap-2'>
								<div className='animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500'></div>
								Loading deliveries...
							</div>
						</div>
					) : pageItems.length === 0 ? (
						<div className='text-center py-12 text-gray-500'>
							<div className='flex flex-col items-center gap-3'>
								<div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
									<svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 7h18M3 12h18M3 17h18' />
									</svg>
								</div>
								<p className='text-lg font-medium'>No deliveries found</p>
								<p className='text-sm text-gray-400'>Try adjusting your search or filters</p>
							</div>
						</div>
					) : (
						pageItems.map((d, idx) => {
							const formatDate = date => date ? new Date(date).toLocaleDateString() : '-';
							const formatTime = date => date ? new Date(date).toLocaleTimeString() : '-';
							const awbList = Array.isArray(d.package_awb_numbers) ? d.package_awb_numbers : [];
							return (
								<div key={idx} className='grid grid-cols-6 text-sm px-6 py-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-50/50 transition-all duration-200 min-w-[1100px] group'>
									<div className='text-gray-900 font-semibold flex items-center'>
										{d.delivery_id || d.id || '-'}
									</div>
									<div className='text-gray-700 flex items-center'>
										{d.delivery_boy_name || d.agent_name || '-'}
									</div>
									<div className='text-gray-700 flex items-center'>
										{d.vehicle_number || '-'}
									</div>
									<div className='text-gray-700 flex col-span-1 items-center'>
										{formatDate(d.created_at)} <br /> {formatTime(d.created_at)}
									</div>
									<div className='text-gray-700 flex items-center'>
										{awbList.length > 0 ? (
											<div className='max-w-40'>
												<div className='space-y-1'>
													{awbList.slice(0, 3).map((awb, i) => (
														<div key={i} className='block break-all'>
															{awb}
														</div>
													))}
													{awbList.length > 3 && (
														<div className='text-gray-500 text-xs'>+{awbList.length - 3} more</div>
													)}
												</div>
											</div>
										) : '-'}
									</div>
									<div className='flex items-center gap-2'>
										<Link to={`/edit-delivery/${d.id || d.delivery_id || ''}`}>
											<button className='p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110' title='Edit Delivery'>
												<PencilIcon className='w-4 h-4' />
											</button>
										</Link>
										<button onClick={() => handleDeleteDelivery?.(d)} className='p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110' title='Delete Delivery'>
											<TrashIcon className='w-4 h-4' />
										</button>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>

			<Pagination page={page} totalPages={totalPages} setPage={setPage} />
		</div>
	);
};

export default DeliveryListArea;


