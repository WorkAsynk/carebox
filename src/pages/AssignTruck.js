import React, { useEffect, useState } from 'react';
import { Input } from '@material-tailwind/react';
import { Autocomplete, TextField } from '@mui/material';
import { FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../component/Layout/Sidebar';
import Topbar from '../component/Layout/Topbar';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { ROLES } from '../config/rolePermissions';

const AssignTruck = () => {
	const navigate = useNavigate();
	const { user } = useSelector((state) => state.auth);
	const isAdmin = user?.role === ROLES.ADMIN;
	const isFranchise = user?.role === ROLES.FRANCHISE;

	// Truck detail
	const [truckAwb, setTruckAwb] = useState('');
	const [truckGenerated, setTruckGenerated] = useState(true);
	const [vehicleNumber, setVehicleNumber] = useState('');
	const [driverName, setDriverName] = useState('');
	const [driverContact, setDriverContact] = useState('');

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [createdTruckAwb, setCreatedTruckAwb] = useState('');

	// Sender (from logged-in user)
	const [sender, setSender] = useState({
		id: '',
		name: '',
		phone: '',
		email: '',
		address: '',
		city: '',
		state: '',
		pincode: '',
		country: '',
	});

	// Destination
	const [destination, setDestination] = useState({
		id: '',
		consignee_name: '',
		phone: '',
		email: '',
		co_name: '',
		address_line: '',
		city: '',
		state: '',
		pincode: '',
		country: '',
	});

	// Bag AWB selection (right column)
	const [availableBagAwbs, setAvailableBagAwbs] = useState([]);
	const [selectedBagAwb, setSelectedBagAwb] = useState(null);
	const [bagAwbInput, setBagAwbInput] = useState('');
	const [addedBagAwbList, setAddedBagAwbList] = useState([]);
	const [loadingBags, setLoadingBags] = useState(false);

	// Populate sender from user
	useEffect(() => {
		if (user) {
			setSender({
				id: user.id || '',
				name: user.name || '',
				phone: user.phone || '',
				email: user.email || '',
				address: user.address?.addressLine1 || '',
				city: user.address?.city || '',
				state: user.address?.state || '',
				pincode: user.address?.pincode || '',
				country: user.address?.country || 'India',
			});
		}
	}, [user]);

	// Fetch available bag AWBs via GET (like BagList.js), no status filtering
	useEffect(() => {
		const fetchBagAwbs = async () => {
			setLoadingBags(true);
			try {
				const res = await axios.get(buildApiUrl(API_ENDPOINTS.FETCH_ALL_BAGS));
				let bagsData = [];
				if (res.data?.bagList && Array.isArray(res.data.bagList)) {
					bagsData = res.data.bagList;
				} else if (res.data?.baglist && Array.isArray(res.data.baglist)) {
					bagsData = res.data.baglist;
				} else if (res.data?.bags && Array.isArray(res.data.bags)) {
					bagsData = res.data.bags;
				} else if (Array.isArray(res.data)) {
					bagsData = res.data;
				}

				const mapped = (bagsData || []).map((bag) => ({
					awb_number: bag.awb_no || bag.bag_awb_no || bag.bagNumber,
					destination: bag.destination_name || bag.destination_address_li || 'N/A',
					package_count: bag.package_awb_nos?.length || 0,
					created_at: bag.created_at,
					status: bag.status,
				})).filter(x => !!x.awb_number);

				setAvailableBagAwbs(mapped);
			} catch (err) {
				console.error('Error fetching bags:', err);
				toast.error('Failed to load bag AWB numbers');
			} finally {
				setLoadingBags(false);
			}
		};
		fetchBagAwbs();
	}, []);

	// Autofill destination address by pincode
	const handleDestinationPincodeChange = async (pincode) => {
		setDestination((prev) => ({ ...prev, pincode }));
		if (pincode && pincode.length === 6) {
			try {
				const { data } = await axios.post(buildApiUrl(API_ENDPOINTS.ADDRESS_AUTOFILL), {
					name: user?.name,
					co_name: user?.co_name,
					mf_no: user?.mf_no,
					pincode: pincode,
				});
				if (Array.isArray(data?.addresses)) {
					const dest = data.addresses.find((a) => a.pincode === pincode && a.is_sender === false);
					if (dest) {
						setDestination({
							id: dest.id,
							consignee_name: dest.consignee_name || '',
							phone: dest.phone || '',
							email: dest.email || '',
							co_name: dest.co_name || '',
							address_line: dest.address_line || '',
							city: dest.city || '',
							state: dest.state || '',
							pincode: dest.pincode || '',
							country: dest.country || 'India',
						});
						toast.success('Address autofilled');
					}
				}
			} catch (e) {
				console.error('Autofill error:', e);
			}
		}
	};

	// Bag AWB list handlers
	const handleAddBagAwb = () => {
		if (!selectedBagAwb) {
			toast.error('Please select a bag AWB number');
			return;
		}
		if (addedBagAwbList.some((x) => x.awb_number === selectedBagAwb.awb_number)) {
			toast.warning('This bag AWB number is already added');
			return;
		}
		setAddedBagAwbList((prev) => [...prev, selectedBagAwb]);
		setSelectedBagAwb(null);
		setBagAwbInput('');
	};

	const handleRemoveBagAwb = (awbNumber) => {
		setAddedBagAwbList((prev) => prev.filter((x) => x.awb_number !== awbNumber));
	};

	// Generate Truck AWB
	const generateTruckAwb = () => {
		const today = new Date();
		const dd = String(today.getDate()).padStart(2, '0');
		const mm = String(today.getMonth() + 1).padStart(2, '0');
		const yyyy = today.getFullYear();
		const dateStr = `${dd}${mm}${yyyy}`;
		try {
			const stored = JSON.parse(localStorage.getItem('truckCounter') || '{}');
			let counter = 1;
			if (stored?.date === dateStr && Number.isInteger(stored?.counter)) {
				counter = stored.counter + 1;
			}
			localStorage.setItem('truckCounter', JSON.stringify({ date: dateStr, counter }));
			return `${dateStr}${String(counter).padStart(4, '0')}`;
		} catch (e) {
			return `${dateStr}0001`;
		}
	};

	// Submit
	const handleSubmit = async (e) => {
		if (e && typeof e.preventDefault === 'function') e.preventDefault();
		setIsSubmitting(true);
		try {
			const finalTruckAwb = truckGenerated ? generateTruckAwb() : truckAwb;
			setCreatedTruckAwb(finalTruckAwb);

			const missing = [];
			if (!finalTruckAwb) missing.push('Truck AWB Number');
			if (!vehicleNumber) missing.push('Vehicle Number');
			if (!driverName) missing.push('Driver Name');
			if (!driverContact) missing.push('Driver Contact');
			if (addedBagAwbList.length === 0) missing.push('At least one Bag AWB Number');
			if (!destination?.consignee_name) missing.push('Destination Name');
			if (!destination?.phone) missing.push('Destination Phone');
			if (!destination?.address_line) missing.push('Destination Address');
			if (!destination?.city) missing.push('Destination City');
			if (!destination?.state) missing.push('Destination State');
			if (!destination?.pincode) missing.push('Destination Pincode');
			if (missing.length) {
				toast.error(`Missing: ${missing.join(', ')}`);
				setIsSubmitting(false);
				return;
			}

			// Destination address id or object
			const destinationAddress = destination.id
				? destination.id
				: {
					consignee_name: destination.consignee_name,
					phone: destination.phone,
					email: destination.email,
					address_line: destination.address_line,
					city: destination.city,
					state: destination.state,
					pincode: destination.pincode,
					country: destination.country || 'India',
					is_sender: false,
				};

			const truckData = {
				awb_no: finalTruckAwb,
				vehicle_number: vehicleNumber,
				driver_name: driverName,
				driver_contact: driverContact,
				source_address_id: user?.id,
				destination_address_id: destinationAddress,
				bag_awb_numbers: addedBagAwbList.map((x) => x.awb_number),
			};

			const { data } = await axios.post(buildApiUrl(API_ENDPOINTS.CREATE_TRUCK), truckData);
			if (data?.success) {
				setShowSuccess(true);
				toast.success(data.message || 'Truck created successfully!');
				setTimeout(() => {
					setShowSuccess(false);
					navigate('/truck-list');
				}, 1500);
			} else {
				toast.error(data?.message || 'Failed to create truck');
			}
		} catch (err) {
			console.error('Create truck error:', err);
			toast.error(err?.response?.data?.message || 'Failed to create truck');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				<div className="min-h-screen bg-[#F9FAFB] p-6">
					<div className="max-w-6xl mx-auto">
						{/* Header */}
						<div className="flex items-center justify-between mb-6">
							<div className="flex justify-start items-center gap-5">
								<Link to={"/"}>
									<button className="border-[1px] border-[#cecece] px-2 py-2 hover:shadow-blue-gray-200 shadow-sm">
										<FaArrowLeft />
									</button>
								</Link>
								<h2 className="font-semibold text-xl">Create Truck Assignment</h2>
							</div>
						</div>

						{/* Form Grid */}
						<div className="min-h-screen bg-gray-50 lg:p-6">
							<div className="max-w-5xl mx-auto space-y-6">
								{/* Truck Detail */}
								<div className="bg-white p-4 rounded-md shadow-sm">
									<h2 className="font-semibold text-gray-700 mb-2">Truck Detail</h2>
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
										<div className='col-span-1'>
											<Input label="Truck AWB Number" value={truckAwb} disabled={truckGenerated} onChange={(e) => setTruckAwb(e.target.value)} placeholder="Enter Truck AWB Number" />
											<div className='flex justify-start items-center mt-2'>
												<input type="checkbox" checked={truckGenerated} onChange={(e) => setTruckGenerated(e.target.checked)} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
												<label className="ml-2 text-sm text-gray-700">Auto-generate Truck AWB</label>
											</div>
										</div>
										<Input label="Vehicle Number" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())} placeholder="MH01AB1234" required />
										<Input label="Driver Name" value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Enter Driver Name" required />
									</div>
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
										<Input label="Driver Contact" value={driverContact} onChange={(e) => setDriverContact(e.target.value)} placeholder="Enter Driver Contact" required />
									</div>
								</div>

								{/* Sender / Destination & Bag AWB Section */}
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
									{/* Sender + Destination (left 2 cols) */}
									<div className="space-y-4 lg:col-span-2 col-span-1">
										{/* Sender */}
										<div className="bg-white p-4 rounded-md shadow-sm">
											<h2 className="font-semibold text-gray-700 mb-2">Sender Detail</h2>
											<hr className="mt-2 mb-2" />
											<div className="grid lg:grid-cols-2 grid-cols-1 gap-2 mb-2">
												<Input label="Name" placeholder="Enter Name" value={sender.name} disabled={true} onChange={(e) => setSender({ ...sender, name: e.target.value })} />
												<Input label="Mobile" placeholder="Enter Your Mobile Number" value={sender.phone} disabled={true} onChange={(e) => setSender({ ...sender, phone: e.target.value })} />
											</div>
											<div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
												<Input label="Email" placeholder="Enter Email" value={sender.email} disabled={true} onChange={(e) => setSender({ ...sender, email: e.target.value })} />
												<Input label="Country" placeholder="Enter Your Country" value={"India"} disabled={true} onChange={(e) => setSender({ ...sender, country: e.target.value })} />
											</div>

											<h2 className="font-semibold text-gray-700 mb-2 mt-2">Address</h2>
											<div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2 mt-4">
												<Input label="Address" placeholder="Address" value={sender.address} disabled={true} onChange={(e) => setSender({ ...sender, address: e.target.value })} />
												<Input label="City" placeholder="City" value={sender.city} disabled={true} onChange={(e) => setSender({ ...sender, city: e.target.value })} />
											</div>
											<div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
												<Input label="State" placeholder="State" value={sender.state} disabled={true} onChange={(e) => setSender({ ...sender, state: e.target.value })} />
												<Input label="Pincode" placeholder="Pincode" value={sender.pincode} disabled={true} onChange={(e) => setSender({ ...sender, pincode: e.target.value })} />
											</div>
										</div>

										{/* Destination */}
										<div className='bg-white p-4 rounded-md shadow-sm '>
											<h2 className="font-semibold text-gray-700 mb-2">Destination Detail</h2>
											<hr className="mt-2 mb-2" />
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
												<Input label="Name" placeholder="Enter Name" value={destination.consignee_name} onChange={(e) => setDestination({ ...destination, consignee_name: e.target.value })} />
												<Input label="Mobile" placeholder="Enter Your Mobile Number" value={destination.phone} onChange={(e) => setDestination({ ...destination, phone: e.target.value })} />
												<Input label="Email" placeholder="Enter Your Email" value={destination.email} onChange={(e) => setDestination({ ...destination, email: e.target.value })} />
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
												<Input label="Company Name" placeholder="Enter Company Name" value={destination.co_name} onChange={(e) => setDestination({ ...destination, co_name: e.target.value })} />
												<Input label="Address" placeholder="Enter Your Address" value={destination.address_line} onChange={(e) => setDestination({ ...destination, address_line: e.target.value })} />
												<Input label="City" placeholder="Enter Your City" value={destination.city} onChange={(e) => setDestination({ ...destination, city: e.target.value })} />
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
												<Input label="State" placeholder="Enter State" value={destination.state} onChange={(e) => setDestination({ ...destination, state: e.target.value })} />
												<Input label="Pincode" placeholder="Enter Your Pincode (6 digits for autofill)" value={destination.pincode} onChange={(e) => handleDestinationPincodeChange(e.target.value)} />
												<Input label="Country" placeholder="Enter Your Country" value={destination.country} onChange={(e) => setDestination({ ...destination, country: e.target.value })} />
											</div>
										</div>
									</div>

									{/* Right: Bag AWB Numbers */}
									<div className="bg-white p-4 lg:col-span-1 col-span-1 rounded-md shadow-sm">
										<h2 className="font-semibold text-gray-700 mb-2">Bag AWB Numbers</h2>
										<hr className="mt-2 mb-2" />
										<div className="flex flex-col sm:flex-row gap-3 mb-4">
											<div className="flex-1">
												<Autocomplete
													options={availableBagAwbs}
													getOptionLabel={(option) => option.awb_number || ''}
													value={selectedBagAwb}
													onChange={(_, newValue) => setSelectedBagAwb(newValue)}
													inputValue={bagAwbInput}
													onInputChange={(_, v) => setBagAwbInput(v)}
													loading={loadingBags}
													disabled={loadingBags}
													renderInput={(params) => (
														<TextField
															{...params}
															label="Select Bag AWB Number"
															size="small"
															placeholder={loadingBags ? 'Loading bags...' : 'Search Bag AWB...'}
														/>
													)}
												/>
											</div>
											<button
												type="button"
												onClick={handleAddBagAwb}
												disabled={!selectedBagAwb || loadingBags}
												className={`px-4 py-2 text-white rounded flex items-center justify-center gap-2 whitespace-nowrap ${!selectedBagAwb || loadingBags ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
											>
												<FaPlus /> Add
											</button>
										</div>

										{addedBagAwbList.length > 0 ? (
											<div className='h-[400px] overflow-y-auto scrollbar-hide'>
												<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
													{addedBagAwbList.map((item, index) => (
														<div key={index} className="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow relative">
															<div className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">{index + 1}</div>
															<div className="mb-3 pr-8">
																<p className="text-xs text-gray-500 mb-1">Bag AWB Number</p>
																<p className="text-sm font-bold text-gray-900 break-all">{item.awb_number}</p>
															</div>
															<div className="mb-3">
																<p className="text-xs text-gray-500 mb-1">Destination</p>
																<p className="text-sm text-gray-700 truncate" title={item.destination}>{item.destination}</p>
															</div>
															<div className="mb-3">
																<p className="text-xs text-gray-500 mb-1">Package Count</p>
																<p className="text-sm text-gray-700">{item.package_count} packages</p>
															</div>
															<button type="button" onClick={() => handleRemoveBagAwb(item.awb_number)} className="w-full mt-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded flex items-center justify-center gap-2 text-sm font-medium transition-colors">
																<FaTrash /> Remove
															</button>
														</div>
													))}
												</div>
											<div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
												<p className="text-sm text-gray-700 text-center">Total Bag AWB Numbers: <span className="font-bold text-red-600">{addedBagAwbList.length}</span></p>
											</div>
										</div>
										) : (
											<div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
												<FaPlus className="mx-auto text-4xl mb-3 text-gray-400" />
												<p className="text-sm font-medium">No bag AWB numbers added yet</p>
												<p className="text-xs mt-1">Please add bag AWB numbers to create the truck assignment</p>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Footer Buttons */}
						<div className="flex justify-between items-center mt-10">
							<Link to="/truck-list">
								<button className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
							</Link>
							<div className="flex gap-3">
								<button type="button" onClick={handleSubmit} className={`px-5 py-2 rounded-md text-white ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-black hover:bg-gray-900'}`} disabled={isSubmitting}>
									{isSubmitting ? 'Processing...' : 'Create Truck Assignment'}
								</button>
							</div>
						</div>

						{/* Success Modal */}
						{showSuccess && (
							<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
								<div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center">
									<div className="flex items-center justify-center mb-4">
										<CheckCircleIcon className="w-16 h-16 text-green-500 animate-bounce" />
									</div>
									<h3 className="text-xl font-semibold mb-1">Truck Assignment Created</h3>
									<p className="text-gray-600 text-sm mb-2">Truck AWB: {createdTruckAwb}</p>
									<p className="text-gray-500 text-xs">Redirecting...</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AssignTruck;