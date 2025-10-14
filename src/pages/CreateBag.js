import { Input, Select, Option } from '@material-tailwind/react';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { Autocomplete, TextField } from '@mui/material';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { toast } from 'react-toastify';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useSelector } from 'react-redux';
import { ROLES } from '../config/rolePermissions';
import Sidebar from '../component/Layout/Sidebar';
import Topbar from '../component/Layout/Topbar';

const CreateBag = () => {
	const { user } = useSelector((state) => state.auth);
	const isAdmin = user?.role === ROLES.ADMIN;
	const isFranchise = user?.role === ROLES.FRANCHISE;
	const navigate = useNavigate();

	// Helper: extract integer from MF number
	const extractMfInteger = (mf) => {
		const digits = String(mf || '').replace(/\D/g, '');
		return digits ? parseInt(digits, 10) : '';
	};

	const [sender, setSender] = useState({
		id: '',
		name: '',
		phone: '',
		email: '',
		gstNo: '',
		address: '',
		co_name: '',
		pincode: '',
		city: '',
		state: '',
		country: '',
	});

	// Bag details
	const [bagNumber, setBagNumber] = useState('');
	const [bagGenerated, setBagGenerated] = useState(true); // Flag for auto generation
	const [mfnumber, setmfnumber] = useState(user?.mf_no || '');
	const [mode, setMode] = useState('');
	const [destination, setDestination] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [createdBagNumber, setCreatedBagNumber] = useState('');

	// Receiver address
	const [receiver, setReceiver] = useState({
		id: '',
		consignee_name: '',
		phone: '',
		email: '',
		co_name: '',
		address_line: '',
		pincode: '',
		city: '',
		state: '',
		country: '',
	});

	// AWB Number Management
	const [availableAwbNumbers, setAvailableAwbNumbers] = useState([]);
	const [selectedAwb, setSelectedAwb] = useState(null);
	const [awbInput, setAwbInput] = useState('');
	const [addedAwbList, setAddedAwbList] = useState([]);


	// Fetch AWB numbers with status "Order Created"
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

                console.log(data);
				
				// Filter orders with status "Order Created"
				const awbList = data?.filter(
					order => order.status?.toLowerCase() === 'order created!' || 
					        order.status?.toLowerCase() === 'created'
				).map(order => ({
					awb_number: order.lr_no || order.awb_number || order.order_no,
					order_id: order.id || order.order_id,
					consignee: order.receiver_address?.consignee_name || 'N/A'
				}));

				setAvailableAwbNumbers(awbList || []);
				console.log(awbList);
			} catch (error) {
				console.error('Error fetching AWB numbers:', error);
			}
		};

		if (user) {
			fetchAwbNumbers();
		}
	}, [user, isFranchise]);


	// Generate Bag Number (same logic as AWB)
	const generateBagNumber = () => {
		const today = new Date();
		const day = today.getDate().toString().padStart(2, '0'); // DD
		const month = (today.getMonth() + 1).toString().padStart(2, '0'); // MM
		const year = today.getFullYear().toString(); // YYYY

		const currentDate = `${day}${month}${year}`; // DDMMYYYY

		try {
			const stored = JSON.parse(localStorage.getItem('bagCounter') || '{}');
			let counter = 0;
			if (stored?.date === currentDate && Number.isInteger(stored?.counter)) {
				counter = stored.counter + 1;
			} else {
				counter = 1;
			}
			localStorage.setItem('bagCounter', JSON.stringify({ date: currentDate, counter }));
			const bagNum = counter.toString().padStart(4, '0');
			return `BAG${currentDate}${bagNum}`;
		} catch (e) {
			// Fallback if localStorage is unavailable or corrupted
			const bagNum = '0001';
			return `BAG${currentDate}${bagNum}`;
		}
	};

	// Add AWB to the list
	const handleAddAwb = () => {
		if (!selectedAwb) {
			toast.error('Please select an AWB number');
			return;
		}

		// Check if AWB already added
		if (addedAwbList.find(item => item.awb_number === selectedAwb.awb_number)) {
			toast.warning('This AWB number is already added');
			return;
		}

		setAddedAwbList(prev => [...prev, selectedAwb]);
		setSelectedAwb(null);
		setAwbInput('');
		toast.success('AWB number added successfully');
	};

	// Remove AWB from the list
	const handleRemoveAwb = (awbNumber) => {
		setAddedAwbList(prev => prev.filter(item => item.awb_number !== awbNumber));
		toast.info('AWB number removed');
	};

	const handleSubmit = async (e) => {
		if (e && typeof e.preventDefault === 'function') {
			e.preventDefault();
		}
		setIsSubmitting(true);

		// Generate bag number if auto-generated
		const generatedBagNumber = bagGenerated ? generateBagNumber() : bagNumber;
		setCreatedBagNumber(generatedBagNumber);

		// Validation
		const missing = [];
		if (!generatedBagNumber) missing.push('Bag Number');
		if (!destination) missing.push('Destination');
		if (addedAwbList.length === 0) missing.push('At least one AWB Number');
		if (!receiver?.consignee_name) missing.push('Receiver Name');
		if (!receiver?.phone) missing.push('Receiver Phone');
		if (!receiver?.address_line) missing.push('Receiver Address');
		if (!receiver?.city) missing.push('Receiver City');
		if (!receiver?.state) missing.push('Receiver State');
		if (!receiver?.pincode) missing.push('Receiver Pincode');
		
		if (missing.length) {
			toast.error(`Missing: ${missing.join(', ')}`);
			setIsSubmitting(false);
			return;
		}

		try {
			// Create bag with AWB numbers
			const bagData = {
				bag_number: generatedBagNumber,
				destination: destination,
				sender_name: sender.name,
				sender_phone: sender.phone,
				sender_email: sender.email,
				sender_address: sender.address,
				sender_city: sender.city,
				sender_state: sender.state,
				sender_pincode: sender.pincode,
				receiver_name: receiver.consignee_name,
				receiver_phone: receiver.phone,
				receiver_email: receiver.email,
				receiver_address: receiver.address_line,
				receiver_city: receiver.city,
				receiver_state: receiver.state,
				receiver_pincode: receiver.pincode,
				created_by: user?.id || '1',
				mf_no: mfnumber,
				mode: mode,
				awb_numbers: addedAwbList.map(item => item.awb_number),
				order_ids: addedAwbList.map(item => item.order_id),
				status: 'Created'
			};

			// TODO: Replace with actual bag creation endpoint
			const url = buildApiUrl('/api/bags/create'); // Update this endpoint
			const { data } = await axios.post(url, bagData);
			
			setShowSuccess(true);
			toast.success('Bag created successfully!');
			
			setTimeout(() => {
				setShowSuccess(false);
				navigate('/'); // Navigate to bag list or home
			}, 1500);
		} catch (error) {
			console.error('Error creating bag:', error);
			toast.error(error.response?.data?.message || 'Failed to create bag');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Populate sender data from Redux user data
	useEffect(() => {
		if (user) {
			setSender({
				id: user.id || '',
				name: user.name || '',
				phone: user.phone || '',
				email: user.email || '',
				gstNo: user.gst_no || '',
				co_name: user.co_name || '',
				address: user.address?.addressLine1 || '',
				pincode: user.address?.pincode || '',
				city: user.address?.city || '',
				state: user.address?.state || '',
				country: user.address?.country || '',
			});
		}
	}, [user]);

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
								<h2 className="font-semibold text-xl">Create Bag</h2>
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
												value={bagNumber} 
												disabled={bagGenerated ? true : false}
												onChange={(e) => setBagNumber(e.target.value)} 
												placeholder="Enter Bag Number" 
											/>
											<div className='flex justify-start items-center mt-2'>
												<input
													type="checkbox"
													checked={bagGenerated}
													onChange={(e) => setBagGenerated(e.target.checked)}
													className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
												/>
												<label className="ml-2 text-sm text-gray-700">Auto-generate Bag Number</label>
											</div>
										</div>
										{!isAdmin && (
											<Input 
												label="MF Number" 
												disabled={true} 
												value={mfnumber} 
												onChange={(e) => setmfnumber(e.target.value)} 
												placeholder="Enter MF Number" 
											/>
										)}
										{/* <Select
											value={mode}
											onChange={(val) => setMode(val)}
											label="Mode">
											<Option value="Air">Air</Option>
											<Option value="Surface">Surface</Option>
										</Select> */}
										<Input 
											label='Destination *' 
											value={destination} 
											onChange={(e) => setDestination(e.target.value)} 
											placeholder='Enter Destination' 
										/>
									</div>
								</div>

								{/* Sender / Receiver & AWB Section */}
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
									{/* Sender & Receiver Details */}
									<div className="space-y-4 lg:col-span-2 col-span-1">
										<div className="bg-white p-4 rounded-md shadow-sm">
											<h2 className="font-semibold text-gray-700 mb-2">Sender Detail</h2>
											<hr className="mt-2 mb-2" />

											{/* Auto-filled Sender Details */}
											<div className="grid lg:grid-cols-2 grid-cols-1 gap-2 mb-2">
												<Input
													label="Name"
													placeholder="Enter Name"
													value={sender.name}
													disabled={true}
													onChange={(e) => setSender({ ...sender, name: e.target.value })}
												/>
												<Input
													label="Mobile"
													placeholder="Enter Your Mobile Number"
													value={sender.phone}
													disabled={true}
													onChange={(e) => setSender({ ...sender, phone: e.target.value })}
												/>
											</div>

											<div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
												<Input
													label="Email"
													placeholder="Enter Email"
													value={sender.email}
													disabled={true}
													onChange={(e) => setSender({ ...sender, email: e.target.value })}
												/>
												<Input
													label="GST"
													placeholder="Enter Your GST"
													value={sender.gstNo || ''}
													disabled={true}
													onChange={(e) => setSender({ ...sender, gstNo: e.target.value })}
												/>
											</div>

											<h2 className="font-semibold text-gray-700 mb-2 mt-2">Address</h2>
											<div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2 mt-4">
												<Input
													label="Address"
													placeholder="Address"
													value={sender.address}
													disabled={true}
													onChange={(e) => setSender({ ...sender, address: e.target.value })}
												/>
												<Input
													label="City"
													placeholder="City"
													value={sender.city}
													disabled={true}
													onChange={(e) => setSender({ ...sender, city: e.target.value })}
												/>
											</div>

											<div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
												<Input
													label="State"
													placeholder="State"
													value={sender.state}
													disabled={true}
													onChange={(e) => setSender({ ...sender, state: e.target.value })}
												/>
												<Input
													label="Country"
													placeholder="Country"
													value={"India"}
													disabled={true}
													onChange={(e) => setSender({ ...sender, country: e.target.value })}
												/>
											</div>
										</div>

										{/* Receiver Details */}
										<div className='bg-white p-4 rounded-md shadow-sm '>
											<h2 className="font-semibold text-gray-700 mb-2">Receiver Detail</h2>
											<hr className="mt-2 mb-2" />
											
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
												<Input
													label="Name"
													placeholder="Enter Name"
													value={receiver.consignee_name}
													onChange={(e) => setReceiver({ ...receiver, consignee_name: e.target.value })}
												/>
												<Input
													label="Mobile"
													placeholder="Enter Your Mobile Number"
													value={receiver.phone}
													onChange={(e) => setReceiver({ ...receiver, phone: e.target.value })}
												/>
												<Input
													label="Email"
													placeholder="Enter Your Email"
													value={receiver.email}
													onChange={(e) => setReceiver({ ...receiver, email: e.target.value })}
												/>
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
												<Input
													label="Company Name"
													placeholder="Enter Company Name"
													value={receiver.co_name}
													onChange={(e) => setReceiver({ ...receiver, co_name: e.target.value })}
												/>
												<Input
													label="Address"
													placeholder="Enter Your Address"
													value={receiver.address_line}
													onChange={(e) => setReceiver({ ...receiver, address_line: e.target.value })}
												/>
												<Input
													label="City"
													placeholder="Enter Your City"
													value={receiver.city}
													onChange={(e) => setReceiver({ ...receiver, city: e.target.value })}
												/>
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
												<Input
													label="State"
													placeholder="Enter State"
													value={receiver.state}
													onChange={(e) => setReceiver({ ...receiver, state: e.target.value })}
												/>
												<Input
													label="Pincode"
													placeholder="Enter Your Pincode"
													value={receiver.pincode}
													onChange={(e) => setReceiver({ ...receiver, pincode: e.target.value })}
												/>
												<Input
													label="Country"
													placeholder="Enter Your Country"
													value={receiver.country}
													onChange={(e) => setReceiver({ ...receiver, country: e.target.value })}
												/>
											</div>
										</div>
									</div>

									{/* AWB Number Section */}
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
										{addedAwbList.length > 0 ? (
											<div className='h-[400px] overflow-y-auto scrollbar-hide'>
												<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
													{addedAwbList.map((item, index) => (
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
																<p className="text-sm font-bold text-gray-900 break-all">{item.awb_number}</p>
															</div>
															
															{/* Consignee */}
															<div className="mb-3">
																<p className="text-xs text-gray-500 mb-1">Consignee</p>
																<p className="text-sm text-gray-700 truncate" title={item.consignee}>
																	{item.consignee}
																</p>
															</div>
															
															{/* Delete Button */}
															<button
																type="button"
																onClick={() => handleRemoveAwb(item.awb_number)}
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
														Total AWB Numbers: <span className="font-bold text-red-600">{addedAwbList.length}</span>
													</p>
												</div>
											</div>
										) : (
											<div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
												<FaPlus className="mx-auto text-4xl mb-3 text-gray-400" />
												<p className="text-sm font-medium">No AWB numbers added yet</p>
												<p className="text-xs mt-1">Please add AWB numbers to create the bag</p>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Footer Buttons */}
						<div className="flex justify-between items-center mt-10">
							<Link to="/">
								<button className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
									Cancel
								</button>
							</Link>
							<div className="flex gap-3">
								<button
									type="button"
									onClick={handleSubmit}
									className={`px-5 py-2 rounded-md text-white ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-black hover:bg-gray-900'}`}
									disabled={isSubmitting}
								>
									{isSubmitting ? 'Processing...' : 'Create Bag'}
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
									<h3 className="text-xl font-semibold mb-1">Bag Created</h3>
									<p className="text-gray-600 text-sm mb-2">Bag Number: {createdBagNumber}</p>
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

export default CreateBag;
