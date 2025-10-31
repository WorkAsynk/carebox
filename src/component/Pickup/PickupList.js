import React, { useMemo, useState } from 'react';
import { FaArrowLeft, FaDownload } from 'react-icons/fa';
import { Input, Dialog, DialogHeader, DialogBody, DialogFooter, Button, Select, Option, Textarea } from '@material-tailwind/react';
import Pagination from '../Layout/Pagination/Pagination';
import { Link } from 'react-router-dom';
import { CSVLink } from 'react-csv';

const PickupList = ({ items = [], loading = false, currentUser }) => {
	const [showModal, setShowModal] = useState(false);
	const [modalItem, setModalItem] = useState(null);
	const [result, setResult] = useState('delivered');
	const [reason, setReason] = useState('');
	const [showOverlay, setShowOverlay] = useState(false);
	const [overlayStatus, setOverlayStatus] = useState('loading'); // 'loading' | 'success'
	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(1);
	const itemsPerPage = 10;

	const columns = useMemo(() => ([
		{ key: 'deliveryBoy', label: 'Delivery Boy' },
		{ key: 'pickupAddress', label: 'Pickup Address' },
		{ key: 'actions', label: 'Action' },
	]), []);

	const filtered = items.filter(i =>
		(i.deliveryBoy || currentUser?.name || '')
			.toLowerCase()
			.includes(searchTerm.toLowerCase()) ||
		(i.pickupAddress || '-')
			.toLowerCase()
			.includes(searchTerm.toLowerCase())
	);
	const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
	const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

	const openModal = (item) => {
		setModalItem(item);
		setResult('delivered');
		setReason('');
		setShowModal(true);
	};

	const handleSubmit = async () => {
		// No API provided; simulate confirmation and show overlay
		setShowOverlay(true);
		setOverlayStatus('loading');
		setTimeout(() => {
			setOverlayStatus('success');
			setTimeout(() => {
				setShowOverlay(false);
				setShowModal(false);
			}, 900);
		}, 700);
	};

	return (
		<div className='lg:max-w-6xl max-w-[400px] mx-auto mt-5'>
			{/* Header */}
			<div className='mb-6 p-6'>
				<div className='flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4'>
					<div className='flex items-center gap-4'>
						<Link to={'/'}>
							<button className='group flex items-center justify-center w-10 h-10 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm'>
								<FaArrowLeft className='text-gray-600 group-hover:text-gray-800 transition-colors' />
							</button>
						</Link>
						<div>
							<h2 className='text-2xl font-bold text-gray-900'>Pickup Management</h2>
							<p className='text-sm text-gray-500 mt-1'>Confirm deliveries for assigned pickups</p>
						</div>
					</div>
					<div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
						<div className='relative flex-1 min-w-[250px]'>
							<Input
								type='text'
								placeholder='Search by Delivery Boy or Address...'
								label='Search Pickups'
								value={searchTerm}
								onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
								className='w-full'
								containerProps={{ className: 'min-w-0' }}
								labelProps={{ className: 'text-gray-700 font-medium' }}
							/>
						</div>
						<CSVLink
							data={filtered}
							headers={[{label: 'Delivery Boy', key: 'deliveryBoy'}, {label: 'Pickup Address', key: 'pickupAddress'}]}
							filename={`pickups_export_${new Date().toISOString().split('T')[0]}.csv`}
							className='group flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 min-w-[140px]'
							title='Download pickups as CSV'
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

			{/* Table */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
				<div className="overflow-x-auto">
					<div className="grid grid-cols-3 text-left bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold px-6 py-4 text-sm min-w-[800px]">
						{columns.map(col => (<div key={col.key}>{col.label}</div>))}
					</div>
					{loading ? (
						<div className="text-center py-12 text-gray-500">
							<div className="inline-flex items-center gap-2">
								<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
								Loading pickups...
							</div>
						</div>
					) : paginated.length === 0 ? (
						<div className="text-center py-12 text-gray-500">
							<div className="flex flex-col items-center gap-3">
								<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
									<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
								<p className="text-lg font-medium">No pickups found</p>
								<p className="text-sm text-gray-400">Try adjusting your search</p>
							</div>
						</div>
					) : (
						paginated.map((item, idx) => (
							<div key={idx} className="grid grid-cols-3 text-sm px-6 py-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-50/50 transition-all duration-200 min-w-[800px]">
								<div className="text-gray-900 font-semibold">{item.deliveryBoy || currentUser?.name || 'N/A'}</div>
								<div className="text-gray-700">{item.pickupAddress || '-'}</div>
								<div>
									<button onClick={() => openModal(item)} className="px-4 py-2 rounded-md text-sm border border-red-500 text-red-600 hover:bg-red-600 hover:text-white transition">Confirm Delivery</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			<Pagination page={page} totalPages={totalPages} setPage={setPage} />

			{/* Modal - Material Tailwind */}
			<Dialog open={showModal} handler={() => setShowModal(false)} size="sm">
				<DialogHeader className="text-gray-900">Confirm Delivery</DialogHeader>
				<DialogBody className="space-y-4">
					
					<div>
						<Select label="Result" value={result} onChange={(val) => setResult(val)}>
							<Option value="delivered">Delivered</Option>
							<Option value="undelivered">Undelivered</Option>
						</Select>
					</div>
					{result === 'undelivered' && (
						<div>
							
							<Textarea
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								rows={3}
                                label="Reason"
								
								className="w-full"
							/>
						</div>
					)}
				</DialogBody>
				<DialogFooter className="gap-2">
					<Button variant="text" color="gray" onClick={() => setShowModal(false)} className="mr-1">
						<span>Cancel</span>
					</Button>
					<Button color="red" onClick={handleSubmit}>
						<span>Submit</span>
					</Button>
				</DialogFooter>
			</Dialog>

			{/* Success Overlay */}
			{showOverlay && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center">
						{overlayStatus === 'loading' && (
							<div className="flex flex-col items-center">
								<div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-gray-700 animate-spin mb-3"></div>
								<p className="text-gray-700 text-sm">Confirming...</p>
							</div>
						)}
						{overlayStatus === 'success' && (
							<div className="flex flex-col items-center">
								<svg className="w-14 h-14 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								<p className="text-gray-700 text-sm mt-2">Delivery status updated</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default PickupList;


