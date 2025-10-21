import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Input } from '@material-tailwind/react';
import { FaArrowLeft, FaTrash, FaPlus } from 'react-icons/fa';
import { Autocomplete, TextField } from '@mui/material';
import Sidebar from '../component/Layout/Sidebar';
import Topbar from '../component/Layout/Topbar';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { ROLES } from '../config/rolePermissions';

const EditBag = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useSelector((state) => state.auth);
	const isAdmin = user?.role === ROLES.ADMIN;
	const isFranchise = user?.role === ROLES.FRANCHISE;
	const [bagDetails, setBagDetails] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Receiver state for editing
	const [receiver, setReceiver] = useState({
		consignee_name: '',
		address_line: '',
		pincode: '',
		city: '',
		state: '',
		country: 'India'
	});

	// AWB numbers state for editing
	const [awbNumbers, setAwbNumbers] = useState([]);

	// AWB Number Management (same as CreateBag)
	const [availableAwbNumbers, setAvailableAwbNumbers] = useState([]);
	const [selectedAwb, setSelectedAwb] = useState(null);
	const [awbInput, setAwbInput] = useState('');

	// Helper: extract integer from MF number
	const extractMfInteger = (mf) => {
		const digits = String(mf || '').replace(/\D/g, '');
		return digits ? parseInt(digits, 10) : '';
	};

	useEffect(() => {
		const fetchBagDetails = async () => {
			try {
				const res = await axios.get(buildApiUrl(API_ENDPOINTS.FETCH_ALL_BAGS));
				
				// Handle the actual API response structure - looking for bagList property
				let bagsData = [];
				
				if (res.data.bagList && Array.isArray(res.data.bagList)) {
					// If response has bagList property (from your JSON structure)
					bagsData = res.data.bagList;
				} else if (res.data.baglist && Array.isArray(res.data.baglist)) {
					// Fallback for baglist property
					bagsData = res.data.baglist;
				} else if (res.data.bags && Array.isArray(res.data.bags)) {
					bagsData = res.data.bags;
				} else if (Array.isArray(res.data)) {
					bagsData = res.data;
				}
				
				const bag = bagsData.find(b => b.id === parseInt(id));
				
				if (bag) {
					setBagDetails(bag);
					// Populate receiver data for editing
					setReceiver({
						consignee_name: bag.destination_name || '',
						address_line: bag.destination_address_line || '',
						pincode: bag.destination_pincode || '',
						city: bag.destination_city || '',
						state: bag.destination_state || '',
						country: bag.destination_country || 'India'
					});
					// Populate AWB numbers for editing
					setAwbNumbers(Array.isArray(bag.package_awb_nos) ? bag.package_awb_nos : []);
				} else {
					setError('Bag not found');
				}
			} catch (e) {
				console.error('Failed to fetch bag details', e);
				setError('Failed to fetch bag details');
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchBagDetails();
		}
	}, [id]);

	// Fetch AWB numbers with status "Order Created" (same as CreateBag)
	useEffect(() => {
		const fetchAwbNumbers = async () => {
			try {
				// Prepare payload same as Orderlist
				const payload = {
					type: isFranchise ? 'franchise' : 'admin',
					...(isFranchise ? { mf_no: extractMfInteger(user?.mf_no) } : {})
				};

				const { data } = await axios.post(
					buildApiUrl(API_ENDPOINTS.FETCH_ALL_ORDERS),
					payload
				);

				console.log('Available AWB data:', data);
				
				// Filter orders with status "Order Created"
				const awbList = data?.filter(
					order => order.status?.toLowerCase() === 'order created!' || 
					        order.status?.toLowerCase() === 'created'
				).map(order => ({
					awb_number: order.awb_no || order.awb_number || order.order_no,
					order_id: order.id || order.order_id,
					consignee: order.receiver_address?.consignee_name || 'N/A'
				}));

				setAvailableAwbNumbers(awbList || []);
				// console.log('Available AWB list:', awbList);
			} catch (error) {
				console.error('Error fetching AWB numbers:', error);
			}
		};

		if (user) {
			fetchAwbNumbers();
		}
	}, [user, isFranchise]);

	// Address autofill when receiver pincode changes
	const handleReceiverPincodeChange = async (pincode) => {
		setReceiver(prev => ({ ...prev, pincode }));

		// Only autofill when pincode is 6 digits
		if (pincode.length === 6) {
			try {
				const { data } = await axios.post(
					buildApiUrl(API_ENDPOINTS.ADDRESS_AUTOFILL),
					{
						name: user?.name,
						co_name: user?.co_name,
						mf_no: user?.mf_no,
						pincode: pincode
					}
				);

				if (Array.isArray(data?.addresses)) {
					// Find receiver address matching the pincode
					const receiverAddress = data.addresses.find(
						addr => addr.pincode === pincode && addr.is_sender === false
					);

					if (receiverAddress) {
						setReceiver(prev => ({
							...prev,
							consignee_name: receiverAddress.consignee_name || prev.consignee_name,
							address_line: receiverAddress.address_line || prev.address_line,
							city: receiverAddress.city || prev.city,
							state: receiverAddress.state || prev.state,
							pincode: receiverAddress.pincode || prev.pincode,
							country: receiverAddress.country || prev.country || 'India'
						}));
						toast.success('Address autofilled from saved addresses');
					}
				}
			} catch (error) {
				console.error('Error autofilling address:', error);
			}
		}
	};

	// Add AWB to the list (same as CreateBag)
	const handleAddAwb = () => {
		if (!selectedAwb) {
			toast.error('Please select an AWB number');
			return;
		}

		// Check if AWB already added
		if (awbNumbers.find(awb => awb === selectedAwb.awb_number)) {
			toast.warning('This AWB number is already added');
			return;
		}

		setAwbNumbers(prev => [...prev, selectedAwb.awb_number]);
		setSelectedAwb(null);
		setAwbInput('');
		toast.success('AWB number added successfully');
	};

	// Remove AWB from the list
	const handleRemoveAwb = (awbToRemove) => {
		setAwbNumbers(prev => prev.filter(awb => awb !== awbToRemove));
		toast.info('AWB number removed');
	};

	// Save changes handler
	const handleSaveChanges = async () => {
		try {
			// Prepare the updated bag data according to the API spec
			const updatedBagData = {
				old_awb_no: bagDetails.awb_no || bagDetails.bag_awb_no || bagDetails.bagNumber,
				staff_id: user?.id,
				package_awb_numbers: awbNumbers,
				destination_address_id: {
					consignee_name: receiver.consignee_name,
					address_line: receiver.address_line,
					city: receiver.city,
					state: receiver.state,
					pincode: receiver.pincode,
					country: receiver.country,
					is_sender: false
				}
			};

			// Call the edit bag API with PUT method
			const response = await axios.put(
				buildApiUrl(API_ENDPOINTS.EDIT_BAG),
				updatedBagData
			);

			if (response.data.success) {
				toast.success(response.data.message || 'Bag updated successfully!');
				// You can navigate back to bag list or stay on the page
				setTimeout(() => {
					navigate('/bag-list');
				}, 1500);
			} else {
				toast.error(response.data.message || 'Failed to update bag');
			}
		} catch (error) {
			console.error('Error updating bag:', error);
			toast.error('Failed to update bag. Please try again.');
		}
	};

	if (loading) {
		return (
			<div className='flex'>
				<Sidebar />
				<div className='flex-1'>
					<Topbar />
					<div className="p-6">
						<div className="flex justify-center items-center h-64">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !bagDetails) {
		return (
			<div className='flex'>
				<Sidebar />
				<div className='flex-1'>
					<Topbar />
					<div className="p-6">
						<div className="text-center">
							<p className="text-red-600">{error || 'Bag not found'}</p>
							<button 
								onClick={() => navigate('/bag-list')}
								className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
							>
								Back to Bag List
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

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
								<Link to={"/bag-list"}>
									<button className="border-[1px] border-[#cecece] px-2 py-2 hover:shadow-blue-gray-200 shadow-sm">
										<FaArrowLeft />
									</button>
								</Link>
								<h2 className="font-semibold text-xl">Edit Bag: {bagDetails.awb_no || bagDetails.bag_awb_no || bagDetails.bagNumber}</h2>
							</div>
						</div>

						{/* Form Grid */}
						<div className="min-h-screen bg-gray-50 lg:p-6">
							<div className="max-w-5xl mx-auto space-y-6">
								{/* Bag Detail Section */}
								<div className="bg-white p-4 rounded-md shadow-sm">
									<h2 className="font-semibold text-gray-700 mb-2">Bag Detail</h2>
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
										<div className='col-span-1'>
											<Input 
												label="Bag Number" 
												value={bagDetails.awb_no || bagDetails.bag_awb_no || bagDetails.bagNumber || ''} 
												disabled={true}
												placeholder="Bag Number" 
											/>
										</div>
									</div>
								</div>

								{/* Sender & Receiver Section */}
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
									{/* Sender & Receiver Details */}
									<div className="space-y-4 lg:col-span-2 col-span-1">
										{/* Sender Details */}
										<div className="bg-white p-4 rounded-md shadow-sm">
											<h2 className="font-semibold text-gray-700 mb-2">Sender Detail</h2>
											<hr className="mt-2 mb-2" />

											<div className="grid lg:grid-cols-2 grid-cols-1 gap-2 mb-2">
												<Input
													label="City"
													placeholder="City"
													value={bagDetails.source_address?.city || ''}
													disabled={true}
												/>
												<Input
													label="Pincode"
													placeholder="Pincode"
													value={bagDetails.source_address?.pincode || ''}
													disabled={true}
												/>
											</div>

											<div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
												<Input
													label="Address Line 1"
													placeholder="Address Line 1"
													value={bagDetails.source_address?.addressLine1 || ''}
													disabled={true}
												/>
												<Input
													label="Address Line 2"
													placeholder="Address Line 2"
													value={bagDetails.source_address?.addressLine2 || ''}
													disabled={true}
												/>
											</div>
										</div>

										{/* Receiver Details */}
										<div className='bg-white p-4 rounded-md shadow-sm'>
											<h2 className="font-semibold text-gray-700 mb-2">Receiver Detail</h2>
											<hr className="mt-2 mb-2" />
											
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
												<Input
													label="Name"
													placeholder="Enter Name"
													value={receiver.consignee_name}
													onChange={(e) => setReceiver(prev => ({ ...prev, consignee_name: e.target.value }))}
												/>
												<Input
													label="Address Line"
													placeholder="Address Line"
													value={receiver.address_line}
													onChange={(e) => setReceiver(prev => ({ ...prev, address_line: e.target.value }))}
												/>
												<Input
													label="City"
													placeholder="City"
													value={receiver.city}
													onChange={(e) => setReceiver(prev => ({ ...prev, city: e.target.value }))}
												/>
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
												<Input
													label="State"
													placeholder="State"
													value={receiver.state}
													onChange={(e) => setReceiver(prev => ({ ...prev, state: e.target.value }))}
												/>
												<Input
													label="Pincode"
													placeholder="Enter Your Pincode (6 digits for autofill)"
													value={receiver.pincode}
													onChange={(e) => handleReceiverPincodeChange(e.target.value)}
												/>
												<Input
													label="Country"
													placeholder="Country"
													value={receiver.country}
													onChange={(e) => setReceiver(prev => ({ ...prev, country: e.target.value }))}
												/>
											</div>
										</div>
									</div>

									{/* AWB Numbers Section */}
									<div className="bg-white p-4 rounded-md shadow-sm">
										<h2 className="font-semibold text-gray-700 mb-4">AWB Numbers</h2>
										
										{/* Add AWB Input */}
										<div className="flex flex-col sm:flex-row gap-3 mb-4">
											<div className="flex-1">
												<Autocomplete
													options={availableAwbNumbers}
													getOptionLabel={(option) => option.awb_number || ''}
													value={selectedAwb}
													onChange={(_, newValue) => {
														setSelectedAwb(newValue);
													}}
													inputValue={awbInput}
													onInputChange={(_, newInputValue) => {
														setAwbInput(newInputValue);
													}}
													renderInput={(params) => (
														<TextField {...params} label="Select AWB Number" size="small" placeholder="Search AWB..." />
													)}
													renderOption={(props, option) => (
														<li {...props}>
															<div>
																<div className="font-semibold">{option.awb_number}</div>
																<div className="text-xs text-gray-500">Consignee: {option.consignee}</div>
															</div>
														</li>
													)}
													fullWidth
												/>
											</div>
											<button
												type="button"
												onClick={handleAddAwb}
												className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center gap-2 whitespace-nowrap"
											>
												<FaPlus /> Add
											</button>
										</div>

										{/* AWB Grid */}
										{awbNumbers.length > 0 ? (
											<div className='h-[400px] overflow-y-auto scrollbar-hide'>
												<div className="grid grid-cols-1 gap-4">
													{awbNumbers.map((awb, index) => (
														<div 
															key={index} 
															className="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow relative"
														>
															{/* S.No Badge */}
															<div className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
																{index + 1}
															</div>
															
															{/* AWB Number */}
															<div className="mb-3 pr-8">
																<p className="text-xs text-gray-500 mb-1">AWB Number</p>
																<p className="text-sm font-bold text-gray-900 break-all">{awb}</p>
															</div>
															
															{/* Remove Button */}
															<button
																type="button"
																onClick={() => handleRemoveAwb(awb)}
																className="w-full mt-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded flex items-center justify-center gap-2 text-sm font-medium transition-colors"
															>
																<FaTrash /> Remove
															</button>
														</div>
													))}
												</div>
												
												{/* Total Count */}
												<div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
													<p className="text-sm text-gray-700 text-center">
														Total AWB Numbers: <span className="font-bold text-red-600">{awbNumbers.length}</span>
													</p>
												</div>
											</div>
										) : (
											<div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
												<FaPlus className="mx-auto text-4xl mb-3 text-gray-400" />
												<p className="text-sm font-medium">No AWB numbers added yet</p>
												<p className="text-xs mt-1">Please add AWB numbers to the bag</p>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Footer Buttons */}
						<div className="flex justify-between items-center mt-10">
							<Link to="/bag-list">
								<button className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
									Cancel
								</button>
							</Link>
							<div className="flex gap-3">
								<button
									type="button"
									onClick={handleSaveChanges}
									className="px-5 py-2 rounded-md text-white bg-black hover:bg-gray-900"
								>
									Save Changes
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EditBag;
