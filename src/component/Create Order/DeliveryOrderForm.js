import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Checkbox, Input, Option, Select } from '@material-tailwind/react';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { Autocomplete, TextField } from '@mui/material';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import { toast } from 'react-toastify';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useSelector } from 'react-redux';
import { ROLES } from '../../config/rolePermissions';
const DeliveryOrderForm = () => {

    
	const { user } = useSelector((state) => state.auth);
	const isAdmin = user?.role === "Delivery Boy";
	const isFranchise = user?.role === ROLES.FRANCHISE;
	
	const [shippingPartner, setShippingPartner] = useState('')

	// Only include rate_chart and zones if user is Franchise AND carrier is Self
	const shouldIncludeRateChartAndZones = isFranchise && shippingPartner?.toLowerCase() === 'self';
	const rateChart = shouldIncludeRateChartAndZones ? user?.rate_chart : undefined;
	const zones = shouldIncludeRateChartAndZones ? user?.zones : undefined;

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

	const navigate = useNavigate();



	//orde details
	const [mfnumber, setmfnumber] = useState(user?.mf_no || '')
	const [mode, setMode] = useState('')
	const [orderId, setOrderID] = useState('')
	// AWB Number generation
	const [awbGenerated, setAwbGenerated] = useState(true); // Flag for auto generation
	const [awbNumber, setAwbNumber] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [createdAWB, setCreatedAWB] = useState('');

	// Shipping Partner
	const [vehicileno, setvehicileno] = useState('')
	

	// Reciver address
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

	// Invoice 

	const [Invoice, setInvoice] = useState("")

	const [packageData, setPackageData] = useState({
		breadth: '',
		length: '',
		width: '',
		height: '',
		actual_weight: '',
		volumetric_weight: '',
		contents_description: '',
		chargeableWeight: '',
		fragile: false,
		dangerous: false,
	});

	const [calculatedVolumetricWeight, setCalculatedVolumetricWeight] = useState(0); // State for volumetric weight


	const calculateVolumetricWeight = (length, width, height) => {
		// Convert dimensions from cm to calculate volumetric weight
		// Standard formula: (L × W × H) / 5000 for courier services
		const l = parseFloat(length) || 0;
		const w = parseFloat(width) || 0;
		const h = parseFloat(height) || 0;

		if (l <= 0 || w <= 0 || h <= 0) return 0;

		// Calculate volumetric weight in grams (since actual weight is in grams)
		return (l * w * h) / 5000 * 1000; // Convert to grams
	};

	const calculateChargeableWeight = (length, width, height, actualWeight) => {
		const volWeight = calculateVolumetricWeight(length, width, height);
		const actWeight = parseFloat(actualWeight) || 0;

		// Return the maximum of actual weight and volumetric weight
		return Math.max(volWeight, actWeight);
	};

	// Calculate volumetric weight automatically when dimensions change
	const currentVolumetricWeight = calculateVolumetricWeight(
		packageData.length,
		packageData.width,
		packageData.height
	);

	const chargeableWeight = calculateChargeableWeight(
		packageData.length,
		packageData.width,
		packageData.height,
		packageData.actual_weight
	);

	const handleCalculateVolumetric = () => {
		const volWeight = calculateVolumetricWeight(
			packageData.length,
			packageData.width,
			packageData.height
		);
		setPackageData(prev => ({
			...prev,
			volumetric_weight: volWeight.toFixed(2)
		}));
		setCalculatedVolumetricWeight(volWeight);
	};

	// Auto-calculate volumetric weight when dimensions change
	useEffect(() => {
		const volWeight = calculateVolumetricWeight(
			packageData.length,
			packageData.width,
			packageData.height
		);
		setCalculatedVolumetricWeight(volWeight);
		setPackageData(prev => ({
			...prev,
			volumetric_weight: volWeight.toFixed(2)
		}));
	}, [packageData.length, packageData.width, packageData.height]);


	// Removed users, selectedUser - using Redux user data directly
	const [addresses, setAddresses] = useState([]);
	const [selectedPincode, setSelectedPincode] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	// Invoice 

	const [invoiceNo, setInvoiceNo] = useState("")
	const [invoiceValue, setInvoiceValue] = useState("")
	const [ewaybillno, setEwaybillno] = useState("")
	const [ewaybillValue, setewaybillValue] = useState("")

	// Address 
	const [senderAddressList, setSenderAddress] = useState([])
	const [receiverAddressList, setReceiverAddress] = useState([])
	// Helper: normalize pincode comparisons
	const normalizePin = (pin) => String(pin ?? '').trim();

	// Removed sender pincode functionality - only keeping receiver pincode

	// Unique pins from a list
	const uniquePins = (list = []) =>
		[...new Set(list.map(a => normalizePin(a?.pincode)).filter(Boolean))];

	// Derive pin lists for receiver only
	const receiverPins = uniquePins(addresses?.filter(a => a?.is_sender === false));

	// State for selected receiver pin only
	const [selectedReceiverPin, setSelectedReceiverPin] = useState('');


	const [receiverPinInput, setReceiverPinInput] = useState('');
	// Removed userInput and userOptions - using Redux user data directly

	// Removed fetchUsers - using Redux user data directly

	// Removed fetchUserData - using Redux user data directly

	// Fetch address fields based on selected pincode
	// Fetch sender address by pincode
	// Helper: normalize pincode comparisons

	// Removed fetchSenderAddress - using Redux user data directly

	const fetchReceiverAddress = async (pincode) => {
		const targetPin = normalizePin(pincode);

		try {
			// Call API with MF number for address autofill
			const { data } = await axios.post(
				buildApiUrl(API_ENDPOINTS.ADDRESS_AUTOFILL),
				{
					name: user?.name,
					co_name: user?.co_name,
					mf_no: user?.mf_no,
					pincode: targetPin
				}
			);

			// Update addresses list
			if (Array.isArray(data?.addresses)) {
				setAddresses(data.addresses);
			}

			// Find receiver address from API response
			const receiverAddress = data?.addresses?.find(
				(address) => address?.is_sender === false && normalizePin(address?.pincode) === targetPin
			);

			if (typeof setReceiverAddress === 'function') setReceiverAddress(receiverAddress || null);

			if (receiverAddress) {
				setReceiver(prev => ({
					...prev,
					id: receiverAddress?.id,
					consignee_name: receiverAddress?.consignee_name,
					phone: receiverAddress?.phone,
					email: receiverAddress?.email,
					pincode: receiverAddress?.pincode,
					address_line: receiverAddress?.address_line || '',
					city: receiverAddress?.city || '',
					state: receiverAddress?.state || '',
					country: receiverAddress?.country || '',
				}));
			}
			return receiverAddress || null;
		} catch (error) {
			// Fallback to local search if API fails
			const receiverAddress = addresses?.find(
				(address) => address?.is_sender === false && normalizePin(address?.pincode) === targetPin
			);

			if (receiverAddress) {
				setReceiver(prev => ({
					...prev,
					id: receiverAddress?.id,
					consignee_name: receiverAddress?.consignee_name,
					phone: receiverAddress?.phone,
					email: receiverAddress?.email,
					pincode: receiverAddress?.pincode,
					address_line: receiverAddress?.address_line || '',
					city: receiverAddress?.city || '',
					state: receiverAddress?.state || '',
					country: receiverAddress?.country || '',
				}));
			}
			return receiverAddress || null;
		}
	};



	const generateAWBNumber = () => {
		const today = new Date();
		const day = today.getDate().toString().padStart(2, '0'); // DD
		const month = (today.getMonth() + 1).toString().padStart(2, '0'); // MM
		const year = today.getFullYear().toString(); // YYYY

		const currentDate = `${day}${month}${year}`; // DDMMYYYY

		try {
			const stored = JSON.parse(localStorage.getItem('awbCounter') || '{}');
			let counter = 0;
			if (stored?.date === currentDate && Number.isInteger(stored?.counter)) {
				counter = stored.counter + 1;
			} else {
				counter = 1;
			}
			localStorage.setItem('awbCounter', JSON.stringify({ date: currentDate, counter }));
			const orderNumber = counter.toString().padStart(4, '0');
			return `${currentDate}${orderNumber}`;
		} catch (e) {
			// Fallback if localStorage is unavailable or corrupted
			const orderNumber = '0001';
			return `${currentDate}${orderNumber}`;
		}
	};

	console.log(user);



	const handleSubmit = async (e) => {
		if (e && typeof e.preventDefault === 'function') {
			e.preventDefault();
		}
		setIsSubmitting(true);


		// Relaxed validation per backend contract
		const missing = [];
		if (!orderId) missing.push('Order ID');
		if (!invoiceNo) missing.push('Invoice No');
		if (!shippingPartner) missing.push('Carrier');
		if (!packageData.length) missing.push('Length');
		if (!packageData.width) missing.push('Width');
		if (!packageData.height) missing.push('Height');
		if (!packageData.actual_weight) missing.push('Actual Weight');
		if (!packageData.contents_description) missing.push('Contents Description');
		// Receiver can be existing address id or raw fields to create one
		const hasReceiverId = Boolean(receiver?.id);
		const hasReceiverFields = Boolean(receiver?.consignee_name && receiver?.phone && receiver?.email && receiver?.address_line && receiver?.city && receiver?.state && receiver?.country && receiver?.pincode);
		if (!hasReceiverId && !hasReceiverFields) missing.push('Receiver Details');
		if (missing.length) {
			toast.error(`Missing: ${missing.join(', ')}`);
			setIsSubmitting(false);
			return;
		}

		// Removed incorrect selectedReceiverPin validation that blocked API call

		const date = new Date()
		const generatedAWB = awbGenerated ? generateAWBNumber() : awbNumber;
		setCreatedAWB(generatedAWB);

		try {

			// Step 1: Create receiver address first
			const receiverAddressPayload = {
				is_sender: false,
				consignee_name: receiver.consignee_name,
				phone: receiver.phone,
				email: receiver.email,
				address_line: receiver.address_line,
				city: receiver.city,
				state: receiver.state,
				pincode: receiver.pincode,
				country: receiver.country,
				preferred_slot: '1',
				user_id: user?.id || '1',
			};

			const addrRes = await axios.post(buildApiUrl(API_ENDPOINTS.CREATE_ADDRESS), receiverAddressPayload);
			const receiverAddressId = addrRes?.data?.address?.id || addrRes?.data?.id || null;

			// Step 2: Create order with the address ID

			// Prepare numeric helpers with 2-decimal precision
			const toNumber2 = (val) => {
				const n = parseFloat(val);
				if (Number.isNaN(n)) return 0;
				return parseFloat(n.toFixed(2));
			};

			// Extract integer from MF number (remove non-digits like 'MF-')
			const extractMfInteger = (mf) => {
				const digits = String(mf || '').replace(/\D/g, '');
				return digits ? parseInt(digits, 10) : '';
			};
			const mfInteger = extractMfInteger(user?.mf_no);

			// Prepare order data to be sent to the API (only accepted fields)
			const orderData = {
				sender_address_id: user?.id || '1',
				receiver_address_id: selectedReceiverPin ? selectedReceiverPin?.id : receiver || '',
				inv_no: invoiceNo,
				ewaybill: ewaybillValue,
				order_id: orderId,
				order_no: generatedAWB,
				
				created_by: user?.id || '1',
				// agent_id: "",
				insurance_type: 'owners risk',
				// forwarding_no: 'sdsa',
				carrier: shippingPartner,
				package_data: [{
					awb_no: generatedAWB,
					length: toNumber2(packageData.length),
					width: toNumber2(packageData.width),
					height: toNumber2(packageData.height),
					actual_weight: toNumber2(packageData.actual_weight),
					volumetric_weight: toNumber2(currentVolumetricWeight),
					contents_description: packageData.contents_description,
					fragile: Boolean(packageData.fragile),
					dangerous: Boolean(packageData.dangerous),
				}],
				rate_chart: user?.rate_chart,
				zones: user?.zones,
					state: receiver?.state,
					vehicle_number: vehicileno,
			};

			const url = buildApiUrl(API_ENDPOINTS.CREATE_DELIVERY_ORDER);
			const { data } = await axios.post(url, orderData);
			setShowSuccess(true);
			setTimeout(() => {
				setShowSuccess(false);
				navigate('/pickup');
			}, 1500);
		} catch (error) {
			toast.error('Failed to create order');
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
		// Initialize addresses on component mount
		const initializeAddresses = async () => {
			try {
				const { data } = await axios.post(
					buildApiUrl(API_ENDPOINTS.ADDRESS_AUTOFILL),
					{
						name: user?.name,
						co_name: user?.co_name,
						mf_no: user?.mf_no
					}
				);
				if (Array.isArray(data?.addresses)) {
					setAddresses(data.addresses);
				}
			} catch (error) {
			}
		};

		if (user) {
			initializeAddresses();
		}
	}, [user]);
    
  return (
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
						<h2 className="font-semibold text-xl">Create Order</h2>
					</div>
					<button className="text-xs text-blue-500 border border-blue-200 rounded px-2 py-1">Learn More</button>
				</div>

				{/* Form Grid */}
				<div className="min-h-screen bg-gray-50 lg:p-6">
					<div className="max-w-5xl mx-auto space-y-6">
						{/* Order Detail Section */}
						<div className="bg-white p-4 rounded-md shadow-sm">
							<h2 className="font-semibold text-gray-700 mb-2">Order Detail</h2>
							<div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
								<div className='cols-span-1'>
									<Input label="AWB Number" value={awbNumber} disabled={awbGenerated ? true : false} onChange={(e) => setAwbNumber(e.target.value)} placeholder="Enter AWB Number" />
									<div className='flex justify-start items-center'>
										<Checkbox
											checked={awbGenerated}
											onChange={(e) => setAwbGenerated(e.target.checked)}
										/>
										<label className="text-sm">Auto-generate AWB Number</label>
									</div>

								</div>
								{!isAdmin && <Input label="MF Number" disabled={true} value={mfnumber} onChange={(e) => setmfnumber(e.target.value)} placeholder="Enter MF Number" />}
					{isAdmin && <Input label="Vehicle Number" value={vehicileno} onChange={(e) => setvehicileno(e.target.value)} placeholder="Enter Vehicle Number" />}

								{/* <Select
									value={mode}
									onChange={(val) => setMode(val)}
									label="Mode">
									<Option value="Air">Air</Option>
									<Option value="Surface">Surface</Option>
								</Select> */}
								<Select
									value={shippingPartner}
									onChange={(val) => setShippingPartner(val)}
									label="Forwarding Partner">
									<Option value="self">Self</Option>
									{/* <Option value="Bluedart">Bluedart</Option>
									<Option value="DTDC">DTDC</Option>
									<Option value="Shree Maruthi">Shree Maruthi</Option>
									<Option value="Tirupati">Tirupati</Option> */}
								</Select>
								<Input label='Order ID' value={orderId} onChange={(e) => setOrderID(e.target.value)} placeholder='Enter Order ID' />

							</div>
						</div>

						{/* Sender / Receiver & Product Info Section */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{/* Sender Details */}
							<div className="space-y-4 col-span-2">
								<div className="bg-white p-4 rounded-md shadow-sm">
									<h2 className="font-semibold text-gray-700 mb-2">Sender Detail</h2>

									{/* Removed user selection and sender pincode - using Redux user data directly */}
									<div className="grid grid-cols-1 gap-2 mb-2">
										{/* Removed user selection - using Redux user data */}
										{/* Removed sender pincode selection - using Redux user data */}

									</div>

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

									<div className="grid lg:grid-cols-2 grid-cols-1 gap-2 mt-2">
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
									<div className="grid lg:grid-cols-2 grid-cols-1 gap-2 mb-2 mt-4">
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

									<div className="grid lg:grid-cols-2 grid-cols-1 gap-2 mb-2">
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
								<div className='bg-white p-4 rounded-md shadow-sm '>
									<h2 className="font-semibold text-gray-700 mb-2">Reciver Detail</h2>
									<hr className="mt-2 mb-2" />

									<div className='grid lg:grid-cols-3 grid-cols-1 gap-2 mb-2 '>
										<Autocomplete
											options={receiverPins} // array of strings (e.g., ["400003", "400004", ...])
											value={selectedReceiverPin || null} // controlled value
											onChange={(_, newValue) => {
												const pin = normalizePin(newValue || '');
												setSelectedReceiverPin(pin);
												if (pin) fetchReceiverAddress(pin);
											}}
											inputValue={receiverPinInput}
											onInputChange={(_, newInputValue, reason) => {
												setReceiverPinInput(newInputValue);
												// Auto-fetch when user types a full 6-digit pin
												const pin = normalizePin(newInputValue);
												if (reason !== 'reset' && /^\d{6}$/.test(pin)) {
													setSelectedReceiverPin(pin);
													fetchReceiverAddress(pin);
												}
											}}
											freeSolo
											renderInput={(params) => (
												<TextField {...params} label="Select Receiver Pincode (Optional)" size="small" />
											)}
											fullWidth
										/>
									</div>
									<p className="text-xs text-gray-500 mb-2">Select a pincode to auto-fill receiver details, or manually enter all receiver information below.</p>
									{/* Auto-filled Sender Details */}
									<div className="grid lg:grid-cols-3 grid-cols-1 gap-2 mb-2">

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
									<div className="grid lg:grid-cols-3 grid-cols-1 gap-2 mb-2">
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
									<div className="grid lg:grid-cols-3 grid-cols-1 gap-2 mb-2">
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

							{/* Product Info Section */}
							<div className="bg-white p-4 rounded-md shadow-sm space-y-4">
								<h2 className="font-semibold text-gray-700 mb-2">Product Detail</h2>
								<Input value={packageData?.contents_description} onChange={(e) => setPackageData({ ...packageData, contents_description: e.target.value })} label="Reference ID" placeholder="Enter Your Reference ID" />
								<div className="w-full">
									<label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
									<div className="flex items-center gap-3">
										<div className="w-[33%]">
											<Input label="Length" value={packageData?.length} onChange={(e) => setPackageData({ ...packageData, length: e.target.value })} type="number" containerProps={{ className: 'min-w-[66px]' }} />
										</div>
										<Input label="Width" value={packageData?.width} onChange={(e) => setPackageData({ ...packageData, width: e.target.value })} type="number" containerProps={{ className: 'min-w-[66px]' }} />
										<Input label="Height" value={packageData?.height} onChange={(e) => setPackageData({ ...packageData, height: e.target.value })}
											type="number" containerProps={{ className: 'min-w-[66px]' }} />
										<div className="px-4 py-[0.65rem] bg-gray-100 rounded text-sm text-gray-600 font-medium">
											cm
										</div>
									</div>
									<p className="text-xs text-gray-500 mt-2">Length + width + Height should be at least 15 cm</p>
								</div>

								<div className="space-y-4">
									{/* Package Weight Input */}
									<div className="w-full">
										<label className="block text-sm font-medium text-gray-700 mb-1">Package weight</label>
										<div className="flex items-center">
											<Input
												type="number"
												placeholder="Enter package weight"
												className="w-full"
												value={packageData?.actual_weight} onChange={(e) => setPackageData({ ...packageData, actual_weight: e.target.value })}
												containerProps={{ className: 'min-w-0' }}
											/>
											<div className="ml-2 px-4 py-[0.65rem] bg-gray-100 rounded text-sm text-gray-600 font-medium">
												gm
											</div>
										</div>
										<p className="text-xs text-gray-500 mt-1">Packaged weight should be at least 50 grams</p>
									</div>

									{/* Info Box */}
									<div className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-sm p-4 rounded-md flex items-start gap-2">
										<InformationCircleIcon className="w-5 h-5 mt-0.5" />
										<span>
											The estimated cost may vary from the final shipping cost based on the packaged
											dimensions & weight measured before delivery.
										</span>
									</div>

									{/* Volumetric Weight Info */}





									{/* Total Chargeable Weight */}
									<div className="bg-gray-50 border border-gray-100 rounded-md p-4">
										<div className="flex items-center justify-between">
											<span className="font-medium text-sm text-gray-800">Chargeable Weight </span>
											<InformationCircleIcon className="w-4 h-4 text-gray-400 ml-2" />
										</div>
										<p className="text-gray-500 text-sm mt-1">
											{chargeableWeight.toFixed(2)} gm

										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Bottom Section - Invoice No */}
						<div className="bg-white p-4 rounded-md shadow-sm">
							<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
								<Input label="Invoice No" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
								<Input label="Invoice Value *" value={invoiceValue} onChange={(e) => setInvoiceValue(e.target.value)} />
								{invoiceValue > 35000 && (
									<>
										<Input
											label="Eway Bill No"
											value={ewaybillno}
											onChange={(e) => setEwaybillno(e.target.value)}
										/>
										<Input
											label="Eway Bill Value"
											value={ewaybillValue}
											onChange={(e) => setewaybillValue(e.target.value)}
										/>
									</>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Footer Buttons */}
				<div className="flex justify-between items-center mt-10">
					<button className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
					<div className="flex gap-3">
						{/* <button className="px-5 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300">Create Order and Manifest Later</button> */}
						<button
							type="button"
							onClick={handleSubmit}
							className={`px-5 py-2 rounded-md text-white ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-black hover:bg-gray-900'}`}
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Processing...' : 'Create Order and Get AWB'}
						</button>

						{/* Debug button removed */}
					</div>
				</div>

				{/* Success Modal */}
				{showSuccess && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
						<div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center">
							<div className="flex items-center justify-center mb-4">
								<CheckCircleIcon className="w-16 h-16 text-green-500 animate-bounce" />
							</div>
							<h3 className="text-xl font-semibold mb-1">Order Created</h3>
							<p className="text-gray-600 text-sm mb-2">AWB: {createdAWB}</p>
							<p className="text-gray-500 text-xs">Redirecting to order list...</p>
						</div>
					</div>
				)}

				{/* Error message */}
				{errorMessage && (
					<div className="mt-4 text-red-500 text-sm">
						<p>{errorMessage}</p>
					</div>
				)}
			</div>
		</div>
  )
}

export default DeliveryOrderForm