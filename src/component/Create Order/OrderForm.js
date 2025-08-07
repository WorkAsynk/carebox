import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Checkbox, Input, Option, Select } from '@material-tailwind/react';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const OrderForm = () => {
	const [sender, setSender] = useState({
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

	//orde details
	const [mfnumber, setmfnumber] = useState('')
	const [mode, setMode] = useState('')
	const [orderId, setOrderID] = useState('')
	// AWB Number generation
	const [awbGenerated, setAwbGenerated] = useState(true); // Flag for auto generation
	const [awbNumber, setAwbNumber] = useState('');

	// Reciver address
	const [receiver, setReceiver] = useState({
		name: '',
		phone: '',
		email: '',
		co_name: '',
		address: '',
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

	const calculateChargeableWeight = (length, width, height, actualWeight) => {
		// Calculate volumetric weight (in kg)
		const volumetricWeight = (length * width * height) / 5000;

		// Return the maximum of actual weight and volumetric weight
		return Math.max(volumetricWeight, actualWeight);
	};


	const chargeableWeight = calculateChargeableWeight(
		packageData.length,
		packageData.width,
		packageData.height,
		packageData.actual_weight
	);

	console.log("Chargeable Weight: ", chargeableWeight, "kg");

	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState('');
	const [addresses, setAddresses] = useState([]);
	const [selectedPincode, setSelectedPincode] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	// Invoice 

	const [invoiceNo, setInvoiceNo] = useState("")
	const [invoiceValue, setInvoiceValue] = useState("")
	const [ewaybillno, setEwaybillno] = useState("")
	const [ewaybillValue, setewaybillValue] = useState("")



	// Fetch all users for the select dropdown (Name and Co_name)
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const { data } = await axios.get('https://grc-logistics-backend.onrender.com/api/admin/fetchAllUsers');
				if (data) {
					setUsers(data.user);
				}
			} catch (error) {
				console.error('Error fetching users:', error);
			}
		};
		fetchUsers();
	}, []);

	// Fetch user data based on selected name and co_name
	const fetchUserData = async (userName) => {
		const user = users.find((user) => user.name === userName);
		if (user) {
			try {
				const { data } = await axios.post(
					'https://grc-logistics-backend.onrender.com/api/order/addressAutofill',
					{ name: user.name, co_name: user.co_name }
				);

				console.log(data)

				if (data.userFound) {
					const userData = {
						name: data.user?.name || '',
						phone: data.user?.phone || '',
						email: data.user?.email || '',
						gstNo: data?.user?.gst_no || '',
					};

					// Auto-fill the sender fields with the fetched user data
					setSender((prevState) => ({
						...prevState,
						name: user?.name,
						phone: user?.phone,
						email: user?.email,
						gstNo: user?.gst_no,
						co_name: user.co_name || '',
					}));

					// Set the addresses array
					setAddresses(data.addresses || []);
					console.log(addresses)
					console.log(addresses)
				} else {
					// Reset sender and addresses if no user is found
					setSender({
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
					setAddresses([]);
				}
			} catch (error) {
				console.error('Error fetching user data:', error);
			}
		}
	};

	// Fetch address fields based on selected pincode
	const fetchAddressDetails = (pincode) => {
		console.log(addresses)
		const selectedAddress = addresses?.find((address) => address.pincode === pincode);
		console.log(selectedAddress)
		if (selectedAddress) {
			setSender({
				...sender,
				address: selectedAddress?.address_line || '',
				city: selectedAddress?.city || '',
				state: selectedAddress?.state || '',
				country: selectedAddress?.country || '',
			});
		}
	};
	const generateAWBNumber = () => {
		const today = new Date();
		const year = today.getFullYear().toString().slice(2, 4); // Last 2 digits of the year
		const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Month (01-12)
		const day = today.getDate().toString().padStart(2, '0'); // Day (01-31)

		// Generate a sequential number for the order (assuming order number is 1 for now)
		const orderNumber = '0001'; // This should ideally be dynamically generated

		return `${year}${month}${day}${orderNumber}`;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const date = new Date()
		const generatedAWB = awbGenerated ? generateAWBNumber() : awbNumber;

		// Prepare order data to be sent to the API
		const orderData = {
			sender_address_id: selectedUser, // Placeholder, replace with actual sender address ID
			receiver_address_id: receiver, // Placeholder, replace with actual receiver address ID
			inv_no: invoiceNo, // Placeholder, replace with actual invoice number
			amount: invoiceValue, // Placeholder, replace with actual amount
			ewaybill: ewaybillValue, // Placeholder, replace with actual e-waybill number
			order_id: orderId, // Placeholder, replace with actual order ID
			order_no: generatedAWB, // Placeholder, replace with actual order number
			lr_no: generatedAWB, // Placeholder, replace with actual LR number
			created_by: date, // Placeholder, replace with actual created by
			agent_id: mfnumber, // Placeholder, replace with actual agent ID
			insurance_type: 'Normal', // Placeholder, replace with actual insurance type
			forwarding_no: '', // Placeholder, replace with actual forwarding number
			carrier: '', // Placeholder, replace with actual carrier name
			package_data: [{
				length: parseFloat(packageData.length),
				width: parseFloat(packageData.width),
				height: parseFloat(packageData.height),
				actual_weight: parseFloat(packageData.actual_weight),
				volumetric_weight: parseFloat(packageData.volumetric_weight),
				contents_description: packageData.contents_description,
				chargeableWeight: packageData.chargeableWeight,
				fragile: packageData.fragile,
				dangerous: packageData.dangerous,
			}],
		};

		try {
			const { data } = await axios.post('https://grc-logistics-backend.onrender.com/api/order/createOrder', orderData);
			console.log('Order created successfully:', data);
		} catch (error) {
			console.error('Error creating order:', error);
		}
	};

	// Trigger fetchUserData whenever selectedUser changes
	useEffect(() => {
		if (selectedUser) {
			fetchUserData(selectedUser);
		}
	}, [selectedUser]);



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
				<div className="min-h-screen bg-gray-50 p-6">
					<div className="max-w-5xl mx-auto space-y-6">
						{/* Order Detail Section */}
						<div className="bg-white p-4 rounded-md shadow-sm">
							<h2 className="font-semibold text-gray-700 mb-2">Order Detail</h2>
							<div className="grid grid-cols-2 gap-4">
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
								<Input label="MF Number" value={mfnumber} onChange={(e) => setmfnumber(e.target.value)} placeholder="Enter MF Number" />
								<Select
									value={mode}
									onChange={(val) => setMode(val)}
									label="Mode">
									<Option value="Air">Air</Option>
									<Option value="Surface">Surface</Option>
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

									{/* Select User by Name and Co_name */}
									<div className="grid grid-cols-2 gap-2 mb-2">
										<Select
											label="Select User"
											value={selectedUser}
											onChange={(val) => setSelectedUser(val)}
										>
											{users.map((user, index) => (
												<Option key={index} value={user.name}>
													{user.name}-{user.co_name}
												</Option>
											))}
										</Select>
										<Select
											label="Select Pincode"
											value={selectedPincode}
											onChange={(val) => {
												setSelectedPincode(val);
												fetchAddressDetails(val); // Fetch address details based on selected pincode
											}}
										>
											{addresses.map((address, index) => (
												<Option key={index} value={address.pincode}>
													{address.pincode}
												</Option>
											))}
										</Select>
									</div>

									<hr className="mt-2 mb-2" />

									{/* Auto-filled Sender Details */}
									<div className="grid grid-cols-2 gap-2 mb-2">
										<Input
											label="Name"
											placeholder="Enter Name"
											value={sender.name}
											onChange={(e) => setSender({ ...sender, name: e.target.value })}
										/>
										<Input
											label="Mobile"
											placeholder="Enter Your Mobile Number"
											value={sender.phone}
											onChange={(e) => setSender({ ...sender, phone: e.target.value })}
										/>
									</div>

									<div className="grid grid-cols-2 gap-2 mt-2">
										<Input
											label="Email"
											placeholder="Enter Email"
											value={sender.email}
											onChange={(e) => setSender({ ...sender, email: e.target.value })}
										/>
										<Input
											label="GST"
											placeholder="Enter Your GST"
											value={sender.gstNo || ''}
											onChange={(e) => setSender({ ...sender, gstNo: e.target.value })}
										/>
									</div>

									<h2 className="font-semibold text-gray-700 mb-2 mt-2">Address</h2>
									<div className="grid grid-cols-2 gap-2 mb-2 mt-4">
										<Input
											label="Address"
											placeholder="Address"
											value={sender.address}
											onChange={(e) => setSender({ ...sender, address: e.target.value })}
										/>
										<Input
											label="City"
											placeholder="City"
											value={sender.city}
											onChange={(e) => setSender({ ...sender, city: e.target.value })}
										/>
									</div>

									<div className="grid grid-cols-2 gap-2 mb-2">
										<Input
											label="State"
											placeholder="State"
											value={sender.state}
											onChange={(e) => setSender({ ...sender, state: e.target.value })}
										/>
										<Input
											label="Country"
											placeholder="Country"
											value={sender.country}
											onChange={(e) => setSender({ ...sender, country: e.target.value })}
										/>
									</div>
								</div>
								<div className='bg-white p-4 rounded-md shadow-sm '>
									<h2 className="font-semibold text-gray-700 mb-2">Reciver Detail</h2>
									<hr className="mt-2 mb-2" />

									{/* Auto-filled Sender Details */}
									<div className="grid grid-cols-3 gap-2 mb-2">
										<Input
											label="Name"
											placeholder="Enter Name"
											value={receiver.name}
											onChange={(e) => setReceiver({ ...receiver, name: e.target.value })}
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
									<div className="grid grid-cols-3 gap-2 mb-2">
										<Input
											label="Company Name"
											placeholder="Enter Company Name"
											value={receiver.co_name}
											onChange={(e) => setReceiver({ ...receiver, co_name: e.target.value })}
										/>
										<Input
											label="Address"
											placeholder="Enter Your Address"
											value={receiver.address}
											onChange={(e) => setReceiver({ ...receiver, address: e.target.value })}
										/>
										<Input
											label="City"
											placeholder="Enter Your City"
											value={receiver.city}
											onChange={(e) => setReceiver({ ...receiver, city: e.target.value })}
										/>
									</div>
									<div className="grid grid-cols-3 gap-2 mb-2">
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
										<Input label="Breadth" value={packageData?.breadth} onChange={(e) => setPackageData({ ...packageData, breadth: e.target.value })} type="number" containerProps={{ className: 'min-w-[66px]' }} />
										<Input label="Height" value={packageData?.height} onChange={(e) => setPackageData({ ...packageData, height: e.target.value })}
											type="number" containerProps={{ className: 'min-w-[66px]' }} />
										<div className="px-4 py-[0.65rem] bg-gray-100 rounded text-sm text-gray-600 font-medium">
											cm
										</div>
									</div>
									<p className="text-xs text-gray-500 mt-2">Length + Breadth + Height should be at least 15 cm</p>
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

									{/* Total Chargeable Weight */}
									<div className="bg-gray-50 border border-gray-100 rounded-md p-4">
										<div className="flex items-center justify-between">
											<span className="font-medium text-sm text-gray-800">Chargeable Weight </span>
											<InformationCircleIcon className="w-4 h-4 text-gray-400 ml-2" />
										</div>
										<p className="text-gray-500 text-sm mt-1">{chargeableWeight} gm</p>
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
							onClick={handleSubmit}
							className="px-5 py-2 rounded-md bg-black text-white hover:bg-gray-900"
						>
							Create Order and Get AWB
						</button>
					</div>
				</div>

				{/* Error message */}
				{errorMessage && (
					<div className="mt-4 text-red-500 text-sm">
						<p>{errorMessage}</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default OrderForm;
